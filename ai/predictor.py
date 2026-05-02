import torch
import joblib
import json
import os
import pandas as pd
from datetime import datetime 
from huggingface_hub import hf_hub_download
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from utils.preprocessor import Preprocessor

class HybridPredictor:
    def __init__(self, repo_id, hf_token=None):
        self.repo_id = repo_id
        self.hf_token = hf_token
        
        print(f"📥 Memuat model dari Hugging Face: {repo_id}...")

        # 1. Download & Load Metadata
        metadata_path = hf_hub_download(repo_id=repo_id, filename="metadata.json", token=hf_token)
        self.preprocessor = Preprocessor(metadata_path)
        
        # 2. Download & Load XGBoost (.pkl)
        xgb_path = hf_hub_download(repo_id=repo_id, filename="xgb_model.pkl", token=hf_token)
        self.xgb_model = joblib.load(xgb_path)
        
        # 3. Load IndoBERT
        self.tokenizer = AutoTokenizer.from_pretrained(repo_id, token=hf_token)
        self.bert_model = AutoModelForSequenceClassification.from_pretrained(repo_id, token=hf_token)
        self.bert_model.eval()
        
        print("✅ Semua model berhasil dimuat!")

    def get_risk_level(self, score):
        if score > 0.85: return "Tinggi" # Disesuaikan dengan dashboard
        if score > 0.60: return "Tinggi"
        if score > 0.40: return "Sedang"
        return "Rendah"

    def _determine_category(self, features):
        """Menentukan kategori berdasarkan skor pattern tertinggi dari preprocessor"""
        mapping = {
            'slot': 'Slot Online',
            'togel': 'Togel',
            'judi_casino': 'Casino',
            'betting': 'Taruhan Olahraga',
            'transaksi': 'Lainnya',
            'platform': 'Lainnya'
        }
        
        # Cari skor tertinggi dari kategori yang ada di features
        cat_scores = {k: v for k, v in features.items() if k in mapping}
        
        if not cat_scores or max(cat_scores.values()) == 0:
            return "Judi Online (Umum)"
            
        winning_key = max(cat_scores, key=cat_scores.get)
        return mapping[winning_key]

    def predict(self, url, title, content):
        # Preprocessing fitur XGBoost
        features, keywords = self.preprocessor.extract_features(url, title, content)
        feat_df = pd.DataFrame([features])
        
        # 1. Cek Skor XGBoost
        xgb_score = self.xgb_model.predict_proba(feat_df)[0][1]
        
        # 2. Hybrid Logic
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

        decision = "JUDI ONLINE" if final_score > 0.5 else "NORMAL"
        
        # Ditaruh di FE nanti
        category = self._determine_category(features) if decision == "JUDI ONLINE" else "Safe Site"
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