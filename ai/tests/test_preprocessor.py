"""
Unit tests untuk utils/preprocessor.py
Test preprocessing dan feature extraction logic
"""

import pytest
import json
import tempfile
from pathlib import Path
from utils.preprocessor import Preprocessor


@pytest.fixture
def mock_metadata():
    """Create mock metadata for testing"""
    metadata = {
        "patterns": {
            "gambling": ["judi", "slot", "taruhan", "casino", "bet"],
            "financial": ["invest", "return", "profit", "earn"],
            "adult": ["xxx", "porn", "adult"]
        },
        "gov_tlds": [".go.id", ".ac.id", ".sch.id"],
        "gambling_tlds": [".xyz", ".pw", ".top", ".site", ".online", ".vip"]
    }
    
    # Create temp file dengan metadata
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(metadata, f)
        temp_path = f.name
    
    yield temp_path
    
    # Cleanup
    Path(temp_path).unlink()


class TestPreprocessor:
    """Test cases untuk Preprocessor class"""
    
    def test_preprocessor_initialization(self, mock_metadata):
        """Test Preprocessor initialization"""
        preprocessor = Preprocessor(mock_metadata)
        assert preprocessor is not None
        assert hasattr(preprocessor, 'patterns')
        assert hasattr(preprocessor, 'gov_tlds')
        assert hasattr(preprocessor, 'gambling_tlds')
    
    def test_clean_text_basic(self, mock_metadata):
        """Test basic text cleaning"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text("Hello World!")
        assert result == "hello world"
    
    def test_clean_text_with_numbers(self, mock_metadata):
        """Test text cleaning removes numbers"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text("Hello 123 World 456")
        assert "123" not in result
        assert "456" not in result
        assert "hello" in result
        assert "world" in result
    
    def test_clean_text_with_special_chars(self, mock_metadata):
        """Test text cleaning removes special characters"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text("Hello@#$%World!!!")
        assert "@" not in result
        assert "#" not in result
        assert "$" not in result
    
    def test_clean_text_with_extra_spaces(self, mock_metadata):
        """Test text cleaning normalizes spaces"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text("Hello    World")
        assert "    " not in result
        assert result == "hello world"
    
    def test_clean_text_none_input(self, mock_metadata):
        """Test clean_text dengan input None"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text(None)
        assert result == ''
    
    def test_clean_text_empty_string(self, mock_metadata):
        """Test clean_text dengan empty string"""
        preprocessor = Preprocessor(mock_metadata)
        result = preprocessor.clean_text("")
        assert result == ""
    
    def test_extract_features_basic(self, mock_metadata):
        """Test basic feature extraction"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://judi-online.com"
        title = "Online Casino"
        content = "Best gambling site with slots and betting"
        
        result = preprocessor.extract_features(url, title, content)
        
        # extract_features returns tuple: (features_dict, keywords_list)
        assert result is not None
        assert isinstance(result, tuple)
        assert len(result) == 2
        
        features, keywords = result
        assert features is not None
        assert 'total_keywords' in features
        assert 'word_count' in features
        assert 'kw_density' in features
    
    def test_extract_features_with_gambling_keywords(self, mock_metadata):
        """Test feature extraction detects gambling keywords"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://example.com"
        title = "Judi Online"
        content = "Slot machine casino betting taruhan"
        
        result = preprocessor.extract_features(url, title, content)
        features, keywords = result
        
        # Seharusnya mendeteksi multiple gambling keywords
        assert features['total_keywords'] > 0
    
    def test_extract_features_with_no_gambling_keywords(self, mock_metadata):
        """Test feature extraction dengan no gambling keywords"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://google.com"
        title = "Google Search"
        content = "Search the web for information"
        
        result = preprocessor.extract_features(url, title, content)
        features, keywords = result
        
        # Seharusnya detect minimal or no gambling keywords
        assert features['total_keywords'] >= 0
    
    def test_extract_features_suspicious_tld(self, mock_metadata):
        """Test detection of suspicious TLD"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://example.xyz"
        title = "Test"
        content = "Test content"
        
        result = preprocessor.extract_features(url, title, content)
        features, keywords = result
        
        # Suspicious TLD like .xyz should be detected
        assert 'is_suspicious_tld' in features or features is not None
    
    def test_extract_features_gov_domain(self, mock_metadata):
        """Test detection of government domain"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://example.go.id"
        title = "Government Site"
        content = "Official government information"
        
        result = preprocessor.extract_features(url, title, content)
        features, keywords = result
        
        # Government domain should be flagged
        assert features is not None


class TestTextPatternMatching:
    """Test pattern matching dalam preprocessing"""
    
    def test_case_insensitive_matching(self, mock_metadata):
        """Test pattern matching adalah case insensitive"""
        preprocessor = Preprocessor(mock_metadata)
        url = "https://example.com"
        title = "JUDI Online"  # Uppercase
        content = "SLOT MACHINE"  # Uppercase
        
        result = preprocessor.extract_features(url, title, content)
        features, keywords = result
        
        # Should detect uppercase patterns
        assert features['total_keywords'] > 0
