import re
from urllib.parse import urlparse
import json

class Preprocessor:
    def __init__(self, metadata_path):
        with open(metadata_path, 'r') as f:
            meta = json.load(f)
        self.patterns = meta['patterns']
        self.gov_tlds = meta['gov_tlds']
        # Tambahkan gambling_tlds dari metadata untuk fitur is_suspicious_tld
        self.gambling_tlds = meta.get('gambling_tlds', ['.xyz', '.pw', '.top', '.site', '.online', '.vip'])

    def clean_text(self, text):
        if not isinstance(text, str): return ''
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        return re.sub(r'\s+', ' ', text.lower()).strip()

    def extract_features(self, url, title, content):
        text = f"{title} {content}".lower()
        u = url.lower()
        
        # 1. Ekstraksi fitur teks (patterns)
        scores = {cat: sum(1 for kw in kws if kw in text) for cat, kws in self.patterns.items()}
        total_keywords = sum(scores.values())
        word_count = len(text.split())
        
        # 2. Ekstraksi fitur URL
        parsed_url = urlparse(u)
        netloc = parsed_url.netloc
        path = parsed_url.path
        
        num_digits_url = sum(c.isdigit() for c in u)
        url_depth = path.count('/')
        is_gov = 1 if any(netloc.endswith(g) for g in self.gov_tlds) else 0
        is_suspicious_tld = 1 if any(netloc.endswith(t) for t in self.gambling_tlds) else 0
        has_judi_url = 1 if any(x in u for x in ['slot', 'judi', 'bet', 'bola', 'casino']) else 0
        
        # 3. Hitung Density
        kw_density = total_keywords / (word_count + 1)

        # Temukan keyword yang muncul untuk output user
        found_keywords = []
        for cat, kws in self.patterns.items():
            for kw in kws:
                if kw in text:
                    found_keywords.append(kw)

        features = {
            'total_keywords': total_keywords,
            'num_digits_url': num_digits_url,
            'url_depth': url_depth,
            'is_suspicious_tld': is_suspicious_tld,
            'has_judi_url': has_judi_url,
            'is_gov': is_gov,
            'word_count': word_count,
            'kw_density': kw_density,
            **scores 
        }
        
        return features, list(set(found_keywords))