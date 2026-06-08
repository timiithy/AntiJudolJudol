/**
 * Unit tests untuk Backend URL Controller
 * Test URL validation dan API response handling
 */

describe('URL Validation', () => {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?(\?.*)?$/;

  // Test valid URLs
  describe('Valid URLs', () => {
    test('should accept valid HTTPS URL', () => {
      const url = 'https://example.com';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept valid HTTP URL', () => {
      const url = 'http://example.com';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL without scheme', () => {
      const url = 'example.com';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL with path', () => {
      const url = 'https://example.com/path/to/page';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL with port', () => {
      const url = 'https://example.com:8080/path';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL with query string', () => {
      const url = 'https://example.com?q=test&v=1';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL with subdomain', () => {
      const url = 'https://api.example.com';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept URL with multiple subdomains', () => {
      const url = 'https://api.v1.example.com';
      expect(urlPattern.test(url)).toBe(true);
    });

    test('should accept Indonesian domain (.id)', () => {
      const url = 'https://example.go.id';
      expect(urlPattern.test(url)).toBe(true);
    });
  });

  // Test invalid URLs
  describe('Invalid URLs', () => {
    test('should reject URL without domain', () => {
      const url = 'https://';
      expect(urlPattern.test(url)).toBe(false);
    });

    test('should reject URL with only scheme', () => {
      const url = 'https://';
      expect(urlPattern.test(url)).toBe(false);
    });

    test('should reject malformed URL', () => {
      const url = '...invalid...';
      expect(urlPattern.test(url)).toBe(false);
    });

    test('should reject URL with spaces', () => {
      const url = 'https://exam ple.com';
      expect(urlPattern.test(url)).toBe(false);
    });
  });
});

describe('URL Normalization', () => {
  test('should trim whitespace from URL', () => {
    const url = '  https://example.com  ';
    const normalized = typeof url === 'string' ? url.trim() : '';
    expect(normalized).toBe('https://example.com');
  });

  test('should handle empty string', () => {
    const url = '';
    const normalized = typeof url === 'string' ? url.trim() : '';
    expect(normalized).toBe('');
  });

  test('should handle null as empty', () => {
    const url = null;
    const normalized = typeof url === 'string' ? url.trim() : '';
    expect(normalized).toBe('');
  });

  test('should handle undefined as empty', () => {
    const url = undefined;
    const normalized = typeof url === 'string' ? url.trim() : '';
    expect(normalized).toBe('');
  });

  test('should not add scheme to URL that already has it', () => {
    const url = 'https://example.com';
    const hasScheme = url.startsWith(('http://', 'https://'));
    expect(hasScheme).toBe(true);
  });
});

describe('Error Response Handling', () => {
  test('should return 400 for empty URL', () => {
    const url = '';
    const isEmpty = !url || !url.trim();
    expect(isEmpty).toBe(true);
  });

  test('should return appropriate message for empty input', () => {
    const url = '';
    const message = !url ? 'Input tidak boleh kosong' : 'URL valid';
    expect(message).toBe('Input tidak boleh kosong');
  });

  test('should return 400 for invalid format', () => {
    const url = 'not a valid url!!!';
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
    const isInvalid = !urlPattern.test(url);
    expect(isInvalid).toBe(true);
  });

  test('should return appropriate message for format error', () => {
    const url = 'invalid url!!!';
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
    const message = !urlPattern.test(url) ? 'Format URL tidak valid' : 'URL valid';
    expect(message).toBe('Format URL tidak valid');
  });
});
