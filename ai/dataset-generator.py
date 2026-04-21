"""
dataset_generator.py — Dataset Builder
========================================
Membaca URL dari file txt, crawl, bersihkan, lalu simpan ke CSV.

Jalankan:
    python dataset_generator.py
    python dataset_generator.py --normal 200 --gambling 200 --delay 1.5
"""

import asyncio, os, argparse
import pandas as pd
from datetime import datetime
from utils.crawler import crawl_website
from utils.preprocessor import clean_text


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--normal",   type=int,   default=150, help="Jumlah URL normal")
    p.add_argument("--gambling", type=int,   default=150, help="Jumlah URL judi")
    p.add_argument("--delay",    type=float, default=1.0, help="Jeda antar request (detik)")
    return p.parse_args()


async def scrape_urls(urls: list, label: int, delay: float) -> tuple:
    """Crawl list URL dan kembalikan (results, failed)."""
    results, failed = [], []
    label_str = "Normal" if label == 0 else "Judi  "

    for i, url in enumerate(urls, 1):
        # === TAMBAHKAN NORMALISASI URL DI SINI ===
        original_url = url.strip()
        if not original_url.startswith(("http://", "https://")):
            url = "https://" + original_url
        else:
            url = original_url

        print(f"  [{i:>3}/{len(urls)}] {label_str} | {url[:70]}", end=" ... ", flush=True)

        try:
            data = await crawl_website(url, max_internal=1)

            if data["status"] == "error" or data["word_count"] < 30:   # naikkan sedikit ke 30
                print("⚠ SKIP (konten minim atau error)")
                failed.append({"url": original_url, "label": label, "reason": "konten minim atau crawl error"})
                continue

            results.append({
                "url":       original_url,        # simpan URL asli
                "label":     label,
                "title":     data.get("title", ""),
                "content":   clean_text(data["content"]),
                "word_count": data["word_count"],
                "timestamp": datetime.now().isoformat(),
            })
            print("✅")

        except Exception as e:
            print(f"❌ {e}")
            failed.append({"url": original_url, "label": label, "reason": str(e)})

        await asyncio.sleep(delay)

    return results, failed


async def main():
    args = parse_args()
    os.makedirs("dataset", exist_ok=True)

    # Validasi file URL
    for path in ("dataset/normal_urls.txt", "dataset/gambling_urls.txt"):
        if not os.path.exists(path):
            print(f"❌ File tidak ditemukan: {path}")
            return

    def load_urls(path, limit):
        with open(path) as f:
            return [l.strip() for l in f if l.strip() and not l.startswith("#")][:limit]

    normal_urls   = load_urls("dataset/normal_urls.txt",   args.normal)
    gambling_urls = load_urls("dataset/gambling_urls.txt", args.gambling)

    total = len(normal_urls) + len(gambling_urls)
    print(f"\n📋 Mulai scraping {total} URL "
          f"({len(normal_urls)} normal + {len(gambling_urls)} judi)\n")

    # Scrape
    norm_res,  norm_fail  = await scrape_urls(normal_urls,   label=0, delay=args.delay)
    gamb_res,  gamb_fail  = await scrape_urls(gambling_urls, label=1, delay=args.delay)

    all_results = norm_res + gamb_res
    all_failed  = norm_fail + gamb_fail

    if not all_results:
        print("❌ Tidak ada data berhasil di-crawl.")
        return

    # Simpan
    df = pd.DataFrame(all_results)
    df.to_csv("dataset/scraped_dataset.csv", index=False)

    if all_failed:
        pd.DataFrame(all_failed).to_csv("dataset/failed_log.csv", index=False)

    print(f"\n{'='*50}")
    print(f"  ✅ Dataset selesai dibuat")
    print(f"  Berhasil : {len(all_results)} sampel")
    print(f"  Gagal    : {len(all_failed)} URL")
    print(f"  Normal   : {sum(1 for r in all_results if r['label']==0)}")
    print(f"  Judi     : {sum(1 for r in all_results if r['label']==1)}")
    print(f"  Disimpan : dataset/scraped_dataset.csv")
    print(f"{'='*50}\n")
    print("➡  Lanjut training: python train.py")


if __name__ == "__main__":
    asyncio.run(main())
