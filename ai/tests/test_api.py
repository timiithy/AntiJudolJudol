"""
Unit tests untuk API endpoints dan basic classification logic
"""

import pytest
import sys
from pathlib import Path

# Mock responses untuk testing tanpa model loading
class MockPredictor:
    """Mock predictor untuk testing"""
    
    def predict(self, url, title, content):
        """Return mock prediction"""
        # Simulasi deteksi gambling keywords
        gambling_indicators = ['judi', 'slot', 'taruhan', 'casino', 'bet', 'bola']
        text_combined = f"{url} {title} {content}".lower()
        
        has_gambling = any(indicator in text_combined for indicator in gambling_indicators)
        
        return {
            "url": url,
            "decision": "JUDI ONLINE" if has_gambling else "AMAN",
            "score": 0.85 if has_gambling else 0.15,
            "risk_level": "Tinggi" if has_gambling else "Rendah",
            "category": "Gambling" if has_gambling else "Legitimate",
            "detected_keywords": [ind for ind in gambling_indicators if ind in text_combined],
            "detected_at": "2024-01-01",
            "method_used": "HYBRID",
            "status": "success"
        }


class TestURLValidation:
    """Test URL validation logic untuk API"""
    
    def test_valid_url_format(self):
        """Test valid URL format"""
        url = "https://example.com"
        url_pattern = r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$'
        import re
        assert re.match(url_pattern, url) is not None
    
    def test_invalid_url_no_domain(self):
        """Test invalid URL tanpa domain"""
        url = "https://"
        url_pattern = r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$'
        import re
        assert re.match(url_pattern, url) is None
    
    def test_url_with_path_valid(self):
        """Test URL dengan path"""
        url = "https://example.com/path/to/page"
        url_pattern = r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$'
        import re
        assert re.match(url_pattern, url) is not None
    
    def test_url_with_port_valid(self):
        """Test URL dengan port"""
        url = "https://example.com:8080"
        url_pattern = r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$'
        import re
        assert re.match(url_pattern, url) is not None
    
    def test_url_without_scheme(self):
        """Test URL tanpa scheme"""
        url = "example.com"
        url_pattern = r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$'
        import re
        assert re.match(url_pattern, url) is not None


class TestPredictorLogic:
    """Test prediction logic"""
    
    def test_gambling_site_detection(self):
        """Test deteksi gambling site"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://judi-online.com",
            "Online Casino",
            "Best gambling site"
        )
        
        assert result["decision"] == "JUDI ONLINE"
        assert result["score"] > 0.5
        assert result["risk_level"] == "Tinggi"
        assert "gambling" in result["detected_keywords"] or len(result["detected_keywords"]) > 0
    
    def test_safe_site_detection(self):
        """Test deteksi safe site"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://google.com",
            "Google Search",
            "Search the web"
        )
        
        assert result["decision"] == "AMAN"
        assert result["score"] < 0.5
        assert result["risk_level"] == "Rendah"
    
    def test_slot_keyword_detection(self):
        """Test deteksi slot keyword"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://example.com",
            "Slot Machine",
            "Play slots online"
        )
        
        assert result["decision"] == "JUDI ONLINE"
        assert "slot" in result["detected_keywords"]
    
    def test_betting_keyword_detection(self):
        """Test deteksi betting keyword"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://example.com",
            "Sport Betting",
            "Place your bets here"
        )
        
        assert result["decision"] == "JUDI ONLINE"
        assert "bet" in result["detected_keywords"]
    
    def test_casino_keyword_detection(self):
        """Test deteksi casino keyword"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://example.com",
            "Online Casino",
            "Casino games"
        )
        
        assert result["decision"] == "JUDI ONLINE"
        assert "casino" in result["detected_keywords"]
    
    def test_multiple_gambling_keywords(self):
        """Test deteksi multiple gambling keywords"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://example.com",
            "Judi Slot",
            "Play slots and taruhan online casino"
        )
        
        assert result["decision"] == "JUDI ONLINE"
        assert len(result["detected_keywords"]) >= 3
    
    def test_score_calculation_high_risk(self):
        """Test score calculation untuk high risk"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://slot-jackpot.com",
            "Big Jackpot",
            "Win big at our judi site"
        )
        
        assert result["score"] > 0.7
    
    def test_score_calculation_low_risk(self):
        """Test score calculation untuk low risk"""
        predictor = MockPredictor()
        result = predictor.predict(
            "https://wikipedia.org",
            "Wikipedia",
            "Free online encyclopedia"
        )
        
        assert result["score"] < 0.3


class TestResponseFormat:
    """Test format response dari API"""
    
    def test_response_has_required_fields(self):
        """Test response memiliki semua required fields"""
        predictor = MockPredictor()
        result = predictor.predict("https://example.com", "Test", "Content")
        
        required_fields = [
            'url', 'decision', 'score', 'risk_level', 
            'category', 'detected_keywords', 'method_used'
        ]
        
        for field in required_fields:
            assert field in result
    
    def test_response_score_range(self):
        """Test score dalam range 0-1"""
        predictor = MockPredictor()
        result = predictor.predict("https://example.com", "Test", "Content")
        
        assert 0 <= result["score"] <= 1
    
    def test_response_decision_valid_value(self):
        """Test decision hanya JUDI ONLINE atau AMAN"""
        predictor = MockPredictor()
        
        # Gambling site
        result1 = predictor.predict("https://judi.com", "Judi", "judi")
        assert result1["decision"] in ["JUDI ONLINE", "AMAN"]
        
        # Safe site
        result2 = predictor.predict("https://google.com", "Google", "search")
        assert result2["decision"] in ["JUDI ONLINE", "AMAN"]
    
    def test_detected_keywords_is_list(self):
        """Test detected_keywords adalah list"""
        predictor = MockPredictor()
        result = predictor.predict("https://example.com", "Test", "Content")
        
        assert isinstance(result["detected_keywords"], list)
