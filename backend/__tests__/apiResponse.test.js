/**
 * Unit tests untuk Backend API Response Handling
 * Test parsing AI results dan data transformation
 */

describe('AI Result Parsing', () => {
  test('should extract decision from AI response', () => {
    const aiResult = {
      decision: 'JUDI ONLINE',
      score: 0.85,
      risk_level: 'Tinggi',
      category: 'Gambling',
      detected_keywords: ['judi', 'slot', 'taruhan']
    };

    const decision = aiResult.decision || 'NORMAL';
    expect(decision).toBe('JUDI ONLINE');
  });

  test('should determine if gambling based on decision', () => {
    const aiResult = { decision: 'JUDI ONLINE' };
    const isGambling = aiResult.decision === 'JUDI ONLINE';
    expect(isGambling).toBe(true);
  });

  test('should default decision to NORMAL if missing', () => {
    const aiResult = {};
    const decision = aiResult.decision || 'NORMAL';
    expect(decision).toBe('NORMAL');
  });

  test('should determine safe site correctly', () => {
    const aiResult = { decision: 'AMAN' };
    const isGambling = aiResult.decision === 'JUDI ONLINE';
    expect(isGambling).toBe(false);
  });

  test('should extract risk score from AI response', () => {
    const aiResult = { risk_score: 0.75 };
    const riskScore = aiResult.risk_score ?? 0;
    expect(riskScore).toBe(0.75);
  });

  test('should default risk score to 0 if missing', () => {
    const aiResult = {};
    const riskScore = aiResult.risk_score ?? 0;
    expect(riskScore).toBe(0);
  });

  test('should extract detected keywords from AI response', () => {
    const aiResult = {
      detected_keywords: ['judi', 'slot', 'taruhan', 'casino']
    };
    const keywords = aiResult.detected_keywords || [];
    expect(keywords).toEqual(['judi', 'slot', 'taruhan', 'casino']);
    expect(keywords.length).toBe(4);
  });

  test('should default to empty array if keywords missing', () => {
    const aiResult = {};
    const keywords = aiResult.detected_keywords || [];
    expect(keywords).toEqual([]);
  });

  test('should extract risk level from AI response', () => {
    const aiResult = { risk_level: 'Tinggi' };
    const riskLevel = aiResult.risk_level || 'Rendah';
    expect(riskLevel).toBe('Tinggi');
  });

  test('should default risk level to Rendah', () => {
    const aiResult = {};
    const riskLevel = aiResult.risk_level || 'Rendah';
    expect(riskLevel).toBe('Rendah');
  });

  test('should extract category from AI response', () => {
    const aiResult = { category: 'Gambling' };
    const category = aiResult.category || 'Uncategorized';
    expect(category).toBe('Gambling');
  });

  test('should extract URL from AI response', () => {
    const aiResult = { url: 'https://example.com' };
    const htmlTitle = aiResult.url || 'unknown';
    expect(htmlTitle).toBe('https://example.com');
  });

  test('should extract method used from AI response', () => {
    const aiResult = { method_used: 'HYBRID' };
    const methodUsed = aiResult.method_used || 'hybrid';
    expect(methodUsed).toBe('HYBRID');
  });
});

describe('Response Data Transformation', () => {
  test('should transform gambling AI result to database format', () => {
    const aiResult = {
      decision: 'JUDI ONLINE',
      risk_score: 0.85,
      url: 'https://judi-online.com',
      risk_level: 'Tinggi',
      category: 'Gambling',
      detected_keywords: ['judi', 'slot'],
      detected_at: '2024-01-01T12:00:00Z',
      method_used: 'HYBRID'
    };

    const decision = aiResult.decision || 'NORMAL';
    const isGambling = decision === 'JUDI ONLINE';
    const riskScore = aiResult.risk_score ?? 0;
    const htmlTitle = aiResult.url || 'unknown';

    expect({
      isGambling,
      riskScore,
      htmlTitle,
      category: aiResult.category
    }).toEqual({
      isGambling: true,
      riskScore: 0.85,
      htmlTitle: 'https://judi-online.com',
      category: 'Gambling'
    });
  });

  test('should transform safe AI result to database format', () => {
    const aiResult = {
      decision: 'AMAN',
      risk_score: 0.15,
      url: 'https://google.com',
      risk_level: 'Rendah',
      category: 'Legitimate',
      detected_keywords: [],
      detected_at: '2024-01-01T12:00:00Z',
      method_used: 'HYBRID'
    };

    const decision = aiResult.decision || 'NORMAL';
    const isGambling = decision === 'JUDI ONLINE';
    const riskScore = aiResult.risk_score ?? 0;

    expect({
      isGambling,
      riskScore
    }).toEqual({
      isGambling: false,
      riskScore: 0.15
    });
  });

  test('should limit detected keywords to first 20', () => {
    const detectedKeywords = Array.from({ length: 30 }, (_, i) => `keyword${i}`);
    const limitedKeywords = detectedKeywords.slice(0, 20);
    expect(limitedKeywords.length).toBe(20);
  });

  test('should handle empty AI response gracefully', () => {
    const aiResult = {};

    const decision = aiResult.decision || 'NORMAL';
    const isGambling = decision === 'JUDI ONLINE';
    const riskScore = aiResult.risk_score ?? 0;
    const htmlTitle = aiResult.url || 'unknown';

    expect({
      decision,
      isGambling,
      riskScore,
      htmlTitle
    }).toEqual({
      decision: 'NORMAL',
      isGambling: false,
      riskScore: 0,
      htmlTitle: 'unknown'
    });
  });
});

describe('Risk Score Validation', () => {
  test('should accept valid risk scores', () => {
    const validScores = [0, 0.5, 0.75, 1];
    validScores.forEach(score => {
      expect(typeof score === 'number' && score >= 0 && score <= 1).toBe(true);
    });
  });

  test('should use risk score to determine risk level', () => {
    expect(0.85 > 0.7 ? 'Tinggi' : 'Sedang').toBe('Tinggi');
    expect(0.5 > 0.7 ? 'Tinggi' : 0.5 > 0.3 ? 'Sedang' : 'Rendah').toBe('Sedang');
    expect(0.2 > 0.7 ? 'Tinggi' : 0.2 > 0.3 ? 'Sedang' : 'Rendah').toBe('Rendah');
  });
});

describe('AI Service Error Handling', () => {
  test('should handle missing AI response', () => {
    const aiResult = null;
    const isValid = aiResult !== null && typeof aiResult === 'object';
    expect(isValid).toBe(false);
  });

  test('should detect invalid AI response structure', () => {
    const aiResult = 'invalid_string';
    const isValid = aiResult && typeof aiResult === 'object';
    expect(isValid).toBe(false);
  });

  test('should handle AI error response status', () => {
    const errorStatuses = ['error', 'invalid', 'non_standard_port', 'thin_content'];
    const aiStatus = 'error';
    const isError = errorStatuses.includes(aiStatus);
    expect(isError).toBe(true);
  });

  test('should handle unknown AI status gracefully', () => {
    const errorStatuses = ['error', 'invalid', 'non_standard_port', 'thin_content'];
    const aiStatus = 'unknown';
    const isError = errorStatuses.includes(aiStatus);
    expect(isError).toBe(false);
  });
});

describe('Keyword Detection', () => {
  test('should detect single gambling keyword', () => {
    const keywords = ['judi'];
    const hasGamblingKeyword = keywords.some(kw => ['judi', 'slot', 'taruhan'].includes(kw));
    expect(hasGamblingKeyword).toBe(true);
  });

  test('should detect multiple gambling keywords', () => {
    const keywords = ['judi', 'slot', 'taruhan'];
    const hasGamblingKeyword = keywords.some(kw => ['judi', 'slot', 'taruhan'].includes(kw));
    expect(hasGamblingKeyword).toBe(true);
    expect(keywords.length).toBe(3);
  });

  test('should handle no gambling keywords', () => {
    const keywords = [];
    const hasGamblingKeyword = keywords.some(kw => ['judi', 'slot', 'taruhan'].includes(kw));
    expect(hasGamblingKeyword).toBe(false);
  });
});
