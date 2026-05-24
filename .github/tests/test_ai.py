"""
Unit tests untuk modul AI - Anti Judol Classifier
Fokus: preprocessor & crawler (tidak butuh model HF)
"""
import json
import pytest
import sys
import pathlib

# Saat di CI: file ada di ai/tests/test_ai.py → parent.parent = ai/
# Saat di lokal: file ada di .github/tests/test_ai.py → tidak masalah karena venv sudah set
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))

from utils.preprocessor import Preprocessor
from utils.crawler import BLOCK_SIGNALS

# ── Sample metadata ────────────────────────────────────────────────────────────

SAMPLE_METADATA = {
    "patterns": {
        "slot":        ["slot", "mesin slot", "jackpot"],
        "togel":       ["togel", "toto", "4d", "2d"],
        "judi_casino": ["casino", "roulette", "poker"],
        "betting":     ["betting", "taruhan", "odds"],
        "transaksi":   ["deposit", "withdraw", "dana"],
        "platform":    ["daftar", "login", "register"]
    },
    "gov_tlds":      [".go.id", ".ac.id", ".mil.id"],
    "gambling_tlds": [".xyz", ".pw", ".top", ".site", ".online", ".vip"]
}


@pytest.fixture
def preprocessor(tmp_path):
    meta_file = tmp_path / "metadata.json"
    meta_file.write_text(json.dumps(SAMPLE_METADATA))
    return Preprocessor(str(meta_file))


# ── Test Preprocessor ──────────────────────────────────────────────────────────

def test_clean_text_basic(preprocessor):
    result = preprocessor.clean_text("Hello, WORLD! 123")
    assert "hello" in result

def test_clean_text_non_string(preprocessor):
    assert preprocessor.clean_text(None) == ""
    assert preprocessor.clean_text(123) == ""

def test_extract_features_judi_url(preprocessor):
    features, keywords = preprocessor.extract_features(
        url="https://slot88.xyz/daftar",
        title="Slot Online Terbaik",
        content="Mainkan slot gacor dengan jackpot besar. Deposit via dana."
    )
    assert features["has_judi_url"] == 1
    assert features["is_suspicious_tld"] == 1
    assert features["is_gov"] == 0
    assert features["slot"] >= 1
    assert "slot" in keywords or "jackpot" in keywords

def test_extract_features_gov_url(preprocessor):
    features, _ = preprocessor.extract_features(
        url="https://kominfo.go.id/berita",
        title="Berita Resmi Pemerintah",
        content="Informasi terbaru dari kementerian komunikasi."
    )
    assert features["is_gov"] == 1
    assert features["is_suspicious_tld"] == 0

def test_extract_features_safe_site(preprocessor):
    features, keywords = preprocessor.extract_features(
        url="https://wikipedia.org/wiki/Python",
        title="Python Programming Language",
        content="Python is a high-level programming language."
    )
    assert features["total_keywords"] == 0
    assert keywords == []

def test_feature_keys_complete(preprocessor):
    required = [
        'total_keywords', 'num_digits_url', 'url_depth', 'is_suspicious_tld',
        'has_judi_url', 'is_gov', 'word_count', 'kw_density',
        'togel', 'slot', 'judi_casino', 'betting', 'transaksi', 'platform'
    ]
    features, _ = preprocessor.extract_features("https://example.com", "title", "content")
    for col in required:
        assert col in features, f"Kolom '{col}' tidak ditemukan di features"


# ── Test Crawler ───────────────────────────────────────────────────────────────

def test_block_signal_detection():
    assert "cloudflare" in BLOCK_SIGNALS
    assert "access denied" in BLOCK_SIGNALS

def test_url_normalization():
    url = "example.com"
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    assert url == "https://example.com"