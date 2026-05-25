import torch
import joblib
import os
import pandas as pd
from datetime import datetime 
from huggingface_hub import hf_hub_download
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from utils.preprocessor import Preprocessor

TRUSTED_DOMAINS = [
    # Berita nasional
    'kompas.com', 'detik.com', 'tempo.co', 'cnnindonesia.com',
    'liputan6.com', 'tribunnews.com', 'okezone.com', 'sindonews.com',
    'kumparan.com', 'republika.co.id', 'antara.id', 'merdeka.com',
    'bisnis.com', 'suara.com', 'medcom.id', 'beritasatu.com',
    # Pemerintah & pendidikan
    '.go.id', '.ac.id', '.sch.id', '.mil.id',
    # Global terpercaya
    'wikipedia.org', 'youtube.com', 'google.com',
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'linkedin.com', 'github.com',
]

class HybridPredictor:
    def __init__(self, repo_id, hf_token=None):
        self.repo_id = repo_id
        self.hf_token = hf_token
        
        print(f"=== Memuat model dari Hugging Face: {repo_id}...")

        metadata_path = hf_hub_download(repo_id=repo_id, filename="metadata.json", token=hf_token)
        self.preprocessor = Preprocessor(metadata_path)
        
        xgb_path = hf_hub_download(repo_id=repo_id, filename="xgb_model.pkl", token=hf_token)
        self.xgb_model = joblib.load(xgb_path)
        
        self.tokenizer = AutoTokenizer.from_pretrained(repo_id, token=hf_token)
        self.bert_model = AutoModelForSequenceClassification.from_pretrained(repo_id, token=hf_token)
        self.bert_model.eval()
        
        print("=== Semua model berhasil dimuat!")

    def _is_trusted_domain(self, url):
        url_lower = url.lower()
        return any(domain in url_lower for domain in TRUSTED_DOMAINS)

    def get_risk_level(self, score):
        if score > 0.70: return "Tinggi"
        if score > 0.30: return "Sedang"
        return "Rendah"

    def _determine_category(self, features):
        mapping = {
            'slot': 'Slot Online',
            'togel': 'Togel',
            'judi_casino': 'Casino',
            'betting': 'Taruhan Olahraga',
            'transaksi': 'Lainnya',
            'platform': 'Lainnya'
        }
        cat_scores = {k: v for k, v in features.items() if k in mapping}
        if not cat_scores or max(cat_scores.values()) == 0:
            return "Judi Online (Umum)"
        winning_key = max(cat_scores, key=cat_scores.get)
        return mapping[winning_key]

    def predict(self, url, title, content):
        # 0. Safety check: konten tidak boleh terlalu sedikit (backup validation)
        word_count = len((title + " " + content).split())
        if word_count < 50 and content:  # content kosong OK (untuk blocked sites)
            return {
                "url": url,
                "title": title,
                "decision": "NORMAL",
                "category": "Konten Tidak Cukup",
                "score": 0.0,
                "risk_level": "Rendah",
                "method_used": "Content Validation",
                "detected_keywords": [],
                "detected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "note": f"Halaman memiliki {word_count} kata (minimum 50 kata diperlukan)"
            }
        
        # 1. Cek whitelist domain terpercaya dulu
        if self._is_trusted_domain(url):
            return {
                "url": url,
                "title": title,
                "decision": "NORMAL",
                "category": "Safe Site",
                "score": 0.01,
                "risk_level": "Rendah",
                "method_used": "Whitelist (Trusted Domain)",
                "detected_keywords": [],
                "detected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

        # 2. Preprocessing fitur
        features, keywords = self.preprocessor.extract_features(url, title, content)

        # 3. Cek domain pemerintah/pendidikan
        if features.get('is_gov', 0) == 1:
            return {
                "url": url,
                "title": title,
                "decision": "NORMAL",
                "category": "Safe Site",
                "score": 0.01,
                "risk_level": "Rendah",
                "method_used": "Gov/Edu Domain",
                "detected_keywords": [],
                "detected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

        # 4. Pastikan urutan kolom sesuai XGBoost
        column_order = [
            'total_keywords', 'num_digits_url', 'url_depth', 'is_suspicious_tld', 
            'has_judi_url', 'is_gov', 'word_count', 'kw_density', 
            'togel', 'slot', 'judi_casino', 'betting', 'transaksi', 'platform'
        ]
        feat_df = pd.DataFrame([features])[column_order]

        # 5. Skor XGBoost
        xgb_score = float(self.xgb_model.predict_proba(feat_df)[0][1])

        # 6. Hybrid Logic
        if xgb_score > 0.90 or xgb_score < 0.10:
            final_score = xgb_score
            method = "XGBoost (Fast Track)"
        else:
            inputs = self.tokenizer(content, return_tensors="pt", truncation=True, max_length=256, padding=True)
            with torch.no_grad():
                outputs = self.bert_model(**inputs)
                bert_probs = torch.softmax(outputs.logits, dim=1)
                final_score = bert_probs[0][1].item()
            method = "IndoBERT (Deep Analysis)"

        # 7. Threshold dinaikkan jadi 0.7 agar tidak mudah false positive
        if final_score > 0.70:
            decision = "JUDI ONLINE"
            category = self._determine_category(features)
        elif final_score > 0.30:
            decision = "JUDI ONLINE"  # tetap judi, tapi skor sedang
            category = self._determine_category(features)
        else:
            decision = "NORMAL"
            category = "Safe Site"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "url": url,
            "title": title,
            "decision": decision,
            "category": category,
            "score": round(final_score, 4),
            "risk_level": self.get_risk_level(final_score),
            "method_used": method,
            "detected_keywords": keywords,
            "detected_at": timestamp
        }