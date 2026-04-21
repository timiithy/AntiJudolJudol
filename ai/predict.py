"""
predict.py — Real-Time URL Checker
====================================
Gunakan file ini untuk memeriksa apakah suatu URL adalah situs judi.

Jalankan:
    python predict.py https://example.com
    python predict.py                        ← mode interaktif
    python predict.py --batch urls.txt       ← cek banyak URL dari file
"""

import os, sys, json, asyncio, argparse
import numpy as np
import torch
from urllib.parse import urlparse
from utils.crawler import crawl_website
from utils.preprocessor import clean_text, extract_patterns, extract_url_signals

MODEL_DIR = "./models/gambling_classifier"


# ── LOAD MODEL ───────────────────────────────────────────────────────────────
def load_model():
    if not os.path.exists(MODEL_DIR):
        print(f"❌ Model tidak ditemukan di '{MODEL_DIR}'.")
        print("   Jalankan dulu: python train.py")
        sys.exit(1)

    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model     = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    device    = 0 if torch.cuda.is_available() else -1

    clf = pipeline(
        "text-classification",
        model=model, tokenizer=tokenizer,
        return_all_scores=True, device=device,
        truncation=True, max_length=256,
    )
    print(f"✅ Model loaded ({'GPU' if device == 0 else 'CPU'})\n")
    return clf


# ── ANALYZE ──────────────────────────────────────────────────────────────────
async def analyze(url: str, clf) -> dict:
    """Pipeline lengkap: URL → Crawl → AI → Pattern → Risk."""
    # Normalisasi URL
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")

    # 1. Crawl
    crawl = await crawl_website(url)
    if crawl["status"] == "error":
        return {"success": False, "url": url, "error": crawl.get("error", "Gagal crawl")}

    # 2. Preprocess
    text = clean_text(crawl["content"])
    if len(text.split()) < 20:
        text = clean_text(crawl["content"], keep_numbers=True)

    # 3. AI inference
    gambling_score = 0.5
    if text.strip():
        try:
            scores = clf(" ".join(text.split()[:400]))[0]
            gambling_score = next((s["score"] for s in scores if s["label"] == "LABEL_1"), 0.5)
        except Exception as e:
            print(f"⚠  AI inference error: {e}")

    # 4. Pattern matching
    patterns    = extract_patterns(crawl["content"])
    url_signals = extract_url_signals(url)

    # 5. Combined score
    pattern_boost  = min(patterns["_total"] * 0.02, 0.15)
    combined_score = min(gambling_score + pattern_boost, 1.0)

    # 6. Risk level
    if combined_score >= 0.80:
        risk = ("VERY_HIGH", "🔴 Sangat Tinggi", "Hampir pasti situs judi online ilegal")
    elif combined_score >= 0.60:
        risk = ("HIGH",      "🟠 Tinggi",         "Indikasi kuat situs judi online")
    elif combined_score >= 0.40:
        risk = ("MEDIUM",    "🟡 Sedang",          "Mengandung beberapa elemen mencurigakan")
    elif combined_score >= 0.20:
        risk = ("LOW",       "🟢 Rendah",          "Kemungkinan besar aman, sedikit mencurigakan")
    else:
        risk = ("SAFE",      "✅ Aman",            "Tidak terdeteksi sebagai situs judi")

    # 7. Bukti / evidence
    evidence = []
    evidence.append(f"AI Score: {gambling_score:.1%} (IndoBERT)")
    if url_signals.get("gambling_in_url"):
        evidence.append(f"URL mengandung kata judi: {', '.join(url_signals['keywords_in_url'])}")
    if url_signals.get("is_government"):
        evidence.append(f"Domain resmi pemerintah/pendidikan ({url_signals['tld']})")
    if url_signals.get("is_gambling_tld"):
        evidence.append(f"TLD mencurigakan: {url_signals['tld']}")
    for cat, count in patterns.items():
        if not cat.startswith("_") and count > 0:
            label = {"togel":"Togel/Nomor","slot":"Slot Online","judi_casino":"Casino",
                     "betting":"Taruhan Bola","transaksi":"Transaksi Judi","platform":"Platform Judi"}.get(cat, cat)
            evidence.append(f"{label}: {count} keyword ditemukan")
    if patterns["_keywords_found"]:
        evidence.append(f"Keyword: {', '.join(patterns['_keywords_found'][:8])}")

    return {
        "success":        True,
        "url":            url,
        "domain":         domain,
        "title":          crawl.get("title", ""),
        "is_gambling":    combined_score >= 0.5,
        "gambling_score": round(gambling_score, 4),
        "combined_score": round(combined_score, 4),
        "risk_level":     risk[0],
        "risk_label":     risk[1],
        "risk_desc":      risk[2],
        "pattern_total":  patterns["_total"],
        "evidence":       evidence,
        "pages_crawled":  crawl.get("pages_crawled", 1),
        "word_count":     crawl.get("word_count", 0),
    }


# ── PRINT RESULT ─────────────────────────────────────────────────────────────
def print_result(r: dict):
    if not r.get("success"):
        print(f"❌ Gagal: {r.get('error')}\n")
        return

    verdict = "🎰 SITUS JUDI ONLINE" if r["is_gambling"] else "✅ WEBSITE NORMAL"

    print(f"\n{'═'*55}")
    print(f"  HASIL ANALISIS")
    print(f"{'═'*55}")
    print(f"  Website    : {r['domain']}")
    print(f"  Title      : {r['title'] or '—'}")
    print(f"  Verdict    : {verdict}")
    print(f"  Risk Level : {r['risk_label']}")
    print(f"  AI Score   : {r['gambling_score']:.1%}")
    print(f"  Combined   : {r['combined_score']:.1%}")
    print(f"  Keterangan : {r['risk_desc']}")
    print(f"{'─'*55}")
    print(f"  BUKTI / EVIDENCE ({len(r['evidence'])} item):")
    for i, ev in enumerate(r["evidence"], 1):
        print(f"    {i}. {ev}")
    print(f"{'─'*55}")
    print(f"  Halaman di-crawl : {r['pages_crawled']}")
    print(f"  Kata ditemukan   : {r['word_count']}")
    print(f"{'═'*55}\n")


# ── MAIN ─────────────────────────────────────────────────────────────────────
async def main_async():
    parser = argparse.ArgumentParser(description="Gambling Website Detector")
    parser.add_argument("url",      nargs="?",   help="URL yang akan diperiksa")
    parser.add_argument("--batch",  metavar="FILE", help="File txt berisi daftar URL (1 per baris)")
    parser.add_argument("--json",   action="store_true", help="Output dalam format JSON")
    args = parser.parse_args()

    clf = load_model()

    if args.batch:
        # Mode batch dari file
        with open(args.batch) as f:
            urls = [l.strip() for l in f if l.strip() and not l.startswith("#")]
        print(f"📋 Batch mode: {len(urls)} URL\n")
        results = []
        for url in urls:
            print(f"🔍 Memeriksa: {url}")
            r = await analyze(url, clf)
            results.append(r)
            if not args.json:
                print_result(r)
        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))

    elif args.url:
        # Mode single URL dari argumen
        r = await analyze(args.url, clf)
        if args.json:
            print(json.dumps(r, indent=2, ensure_ascii=False))
        else:
            print_result(r)

    else:
        # Mode interaktif
        print("🎰 Gambling Detector — Mode Interaktif")
        print("   Ketik URL untuk diperiksa, atau 'quit' untuk keluar.\n")
        while True:
            try:
                url = input("🔗 Masukkan URL: ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nKeluar."); break

            if url.lower() in ("quit", "exit", "q"):
                break
            if not url:
                continue

            print(f"⏳ Menganalisis {url}...")
            r = await analyze(url, clf)
            print_result(r)


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
