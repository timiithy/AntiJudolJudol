"""
utils/preprocessor.py — Text Cleaner & Pattern Matcher
=========================================================
"""

import re
from typing import Dict, List
from urllib.parse import urlparse

# ── Kamus pola judi ───────────────────────────────────────────────────────────
PATTERNS: Dict[str, List[str]] = {
    "togel": [
        "togel", "toto", "4d", "3d", "2d", "sgp", "sdy", "hk", "sydney",
        "prediksi angka", "paito", "bocoran", "keluaran", "pengeluaran",
        "angka main", "angka jitu", "data sgp", "data hk",
    ],
    "slot": [
        "slot online", "slot gacor", "slot maxwin", "rtp slot", "pragmatic play",
        "gates of olympus", "spaceman", "sweet bonanza", "mahjong ways",
        "anti rungkad", "pola slot", "pg soft", "joker123", "spin gratis",
    ],
    "judi_casino": [
        "judi online", "casino online", "live casino", "baccarat", "roulette",
        "poker online", "blackjack", "sbobet", "ibcbet", "taruhan", "bandar judi",
    ],
    "betting": [
        "judi bola", "taruhan bola", "sportsbook", "handicap", "over under",
        "mix parlay", "live betting", "agen bola", "parlay", "asian handicap",
    ],
    "transaksi": [
        "deposit", "withdraw", "bonus new member", "bonus deposit", "cashback",
        "rollingan", "chip gratis", "free bet", "daftar sekarang", "link alternatif",
        "minimal deposit", "klaim bonus",
    ],
    "platform": [
        "situs judi", "situs slot", "provider slot", "game slot", "trik slot",
        "tips menang judi", "cheat slot", "server thailand",
    ],
}

INTENSIFIERS = [
    "terpercaya", "terbaik", "gacor", "maxwin", "anti lag",
    "x500", "x1000", "x5000", "server thailand",
]

GAMBLING_TLDS       = {".cc", ".to", ".ws", ".gg", ".bet", ".casino", ".poker"}
GOVERNMENT_TLDS     = {".go.id", ".ac.id", ".sch.id", ".mil.id", ".net.id"}
GAMBLING_URL_KEYS   = ["togel","slot","judi","casino","bet","poker","sbobet","maxwin","gacor","4d","sgp","hk"]


def clean_text(text: str, keep_numbers: bool = False) -> str:
    """Bersihkan teks untuk input model AI."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r"https?://\S+", " ", text)           # hapus URL
    text = re.sub(r"[\w.+-]+@[\w-]+\.\w+", " ", text)  # hapus email
    if keep_numbers:
        text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    else:
        text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_patterns(text: str) -> dict:
    """Hitung kemunculan pola judi dalam teks mentah."""
    t = text.lower()
    result = {}
    all_found = []

    for cat, keywords in PATTERNS.items():
        found = [kw for kw in keywords if kw in t]
        result[cat] = len(found)
        all_found.extend(found)

    result["_total"]          = sum(v for k, v in result.items() if not k.startswith("_"))
    result["_keywords_found"] = list(set(all_found))[:20]
    result["_intensifiers"]   = [w for w in INTENSIFIERS if w in t]
    return result


def extract_url_signals(url: str) -> dict:
    """Analisis sinyal judi dari URL."""
    u = url.lower()
    netloc = urlparse(url).netloc.lower()
    parts  = netloc.split(".")

    # TLD detection
    if len(parts) >= 3 and parts[-2] in ("go","ac","sch","mil","net","co","or"):
        tld = f".{parts[-2]}.{parts[-1]}"
    elif len(parts) >= 2:
        tld = f".{parts[-1]}"
    else:
        tld = "unknown"

    kw_in_url = [kw for kw in GAMBLING_URL_KEYS if kw in u]

    return {
        "tld":              tld,
        "is_government":    any(tld.endswith(g) for g in GOVERNMENT_TLDS),
        "is_gambling_tld":  any(tld == g for g in GAMBLING_TLDS),
        "gambling_in_url":  len(kw_in_url) > 0,
        "keywords_in_url":  kw_in_url,
    }
