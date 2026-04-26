import re
from urllib.parse import urlparse
import json
import os

class Preprocessor:
    def __init__(self, metadata_path):
        with open(metadata_path, 'r') as f:
            meta = json.load(f)
        self.patterns = meta['patterns']
        self.gov_tlds = meta['gov_tlds']

    def clean_text(self, text):
        if not isinstance(text, str): return ''
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        return re.sub(r'\s+', ' ', text.lower()).strip()

    def extract_features(self, url, title, content):
        text = f"{title} {content}".lower()
        u = url.lower()
        scores = {cat: sum(1 for kw in kws if kw in text) for cat, kws in self.patterns.items()}
        
        netloc = urlparse(u).netloc
        is_gov = any(netloc.endswith(g) for g in self.gov_tlds)
        
        # Temukan keyword yang muncul untuk output user
        found_keywords = []
        for cat, kws in self.patterns.items():
            for kw in kws:
                if kw in text:
                    found_keywords.append(kw)

        features = {
            'total_keywords': sum(scores.values()),
            'is_gov': 1 if is_gov else 0,
            'word_count': len(text.split()),
            'has_judi_url': 1 if any(x in u for x in ['slot', 'judi', 'bet']) else 0,
            **scores
        }
        return features, list(set(found_keywords))