"""
Unit tests untuk utils/crawler.py
Test URL validation dan scraping logic
"""

import pytest
from utils.crawler import validate_url

class TestValidateUrl:
    """Test cases untuk fungsi validate_url"""
    
    def test_valid_url_with_https(self):
        """Test valid HTTPS URL"""
        result = validate_url("https://example.com")
        assert result is None  # Valid URL returns None (no error)
    
    def test_valid_url_with_http(self):
        """Test valid HTTP URL"""
        result = validate_url("http://example.com")
        assert result is None
    
    def test_valid_url_without_scheme(self):
        """Test URL tanpa scheme (should auto-add https)"""
        result = validate_url("example.com")
        assert result is None
    
    def test_empty_url(self):
        """Test empty URL"""
        result = validate_url("")
        assert result is not None
        assert result['status'] == 'invalid'
        assert "kosong" in result['error'].lower()
    
    def test_none_url(self):
        """Test None URL"""
        result = validate_url(None)
        assert result is not None
        assert result['status'] == 'invalid'
    
    def test_whitespace_only_url(self):
        """Test URL dengan hanya whitespace"""
        result = validate_url("   ")
        assert result is not None
        assert result['status'] == 'invalid'
    
    def test_invalid_format_no_domain(self):
        """Test invalid format tanpa domain"""
        result = validate_url("https://")
        assert result is not None
        assert result['status'] == 'invalid'
    
    def test_valid_url_with_path(self):
        """Test URL dengan path"""
        result = validate_url("https://example.com/path/to/page")
        assert result is None
    
    def test_valid_url_with_port(self):
        """Test URL dengan port"""
        result = validate_url("https://example.com:443/path")
        assert result is None
    
    def test_valid_url_with_query(self):
        """Test URL dengan query string"""
        result = validate_url("https://example.com?q=test&v=1")
        assert result is None
    
    def test_invalid_special_chars(self):
        """Test URL dengan karakter invalid"""
        result = validate_url("https://exam$$ple.com")
        assert result is not None
        assert result['status'] == 'invalid'
    
    def test_url_with_spaces(self):
        """Test URL dengan spaces"""
        result = validate_url("https://exam ple.com")
        assert result is not None
        assert result['status'] == 'invalid'


class TestURLPatterns:
    """Test pattern matching untuk URL patterns"""
    
    def test_gambling_keywords_in_url(self):
        """Test URL dengan gambling keywords"""
        # URL yang contain judi, slot, bet, etc harus valid tapi terdeteksi di preprocessor
        result = validate_url("https://judi-online.com")
        assert result is None  # Format URL valid
    
    def test_trusted_domain_format(self):
        """Test URL dari trusted domain"""
        result = validate_url("https://google.com")
        assert result is None
    
    def test_government_domain(self):
        """Test government domain"""
        result = validate_url("https://example.go.id")
        assert result is None
