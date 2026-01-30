import { describe, it, expect } from 'vitest';
import { getAreaDisplayName, getLocationDescription, formatAIResponse, mapAreaToGroup, validateStep1 } from '../lib/utils.js';
import { triggerPointsDB, fascialLinesDB } from '../lib/data.js';
import { analyzeTriggerPoints, analyzeFascialLines } from '../lib/analysis.js';

describe('getAreaDisplayName', () => {
  it('should return Korean name for known area', () => {
    expect(getAreaDisplayName('head-front')).toBe('이마/앞머리');
    expect(getAreaDisplayName('neck-front')).toBe('목 앞쪽');
    expect(getAreaDisplayName('shoulder-left-front')).toBe('왼쪽 어깨 앞');
  });

  it('should return area code for unknown area', () => {
    expect(getAreaDisplayName('unknown-area')).toBe('unknown-area');
  });

  it('should handle all defined areas', () => {
    expect(getAreaDisplayName('occipital')).toBe('후두부');
    expect(getAreaDisplayName('lower-back-center')).toBe('허리 중앙');
    expect(getAreaDisplayName('calf-back-left')).toBe('왼쪽 종아리 뒤');
  });
});

describe('getLocationDescription', () => {
  it('should return description for known location', () => {
    expect(getLocationDescription('neck-shoulder-junction')).toBe('목과 어깨 경계 부분');
    expect(getLocationDescription('skull-base')).toBe('머리 뒤쪽 경계선');
  });

  it('should return location code for unknown location', () => {
    expect(getLocationDescription('unknown-location')).toBe('unknown-location');
  });
});

describe('formatAIResponse', () => {
  it('should handle non-string input', () => {
    const result = formatAIResponse({ key: 'value' });
    expect(result).toContain('"key"');
    expect(result).toContain('"value"');
  });

  it('should handle empty string', () => {
    const result = formatAIResponse('');
    expect(result).toBe('<p>AI 분석 결과를 받지 못했습니다. 다시 시도해주세요.</p>');
  });

  it('should handle null/undefined', () => {
    const result = formatAIResponse(null);
    expect(result).toBe('<p>AI 분석 결과를 받지 못했습니다. 다시 시도해주세요.</p>');
  });

  it('should convert markdown headings', () => {
    expect(formatAIResponse('# Heading 1')).toContain('<h1>Heading 1</h1>');
    expect(formatAIResponse('## Heading 2')).toContain('<h2>Heading 2</h2>');
    expect(formatAIResponse('### Heading 3')).toContain('<h3>Heading 3</h3>');
  });

  it('should convert markdown bold', () => {
    expect(formatAIResponse('**bold text**')).toContain('<strong>bold text</strong>');
  });

  it('should convert markdown italic', () => {
    expect(formatAIResponse('*italic text*')).toContain('<em>italic text</em>');
  });

  it('should convert markdown inline code', () => {
    expect(formatAIResponse('`code`')).toContain('<code>code</code>');
  });

  it('should convert markdown bullet points', () => {
    expect(formatAIResponse('- item')).toContain('<li>item</li>');
    expect(formatAIResponse('* item')).toContain('<li>item</li>');
  });

  it('should convert markdown blockquotes', () => {
    expect(formatAIResponse('> quote')).toContain('<blockquote>quote</blockquote>');
  });
});

describe('mapAreaToGroup', () => {
  it('should map lower-back areas correctly', () => {
    expect(mapAreaToGroup('lower-back-left')).toBe('lower-back');
    expect(mapAreaToGroup('lower-back-center')).toBe('lower-back');
    expect(mapAreaToGroup('lumbar-region')).toBe('lower-back');
  });

  it('should map upper-back areas correctly', () => {
    expect(mapAreaToGroup('upper-back-center')).toBe('upper-back');
    expect(mapAreaToGroup('thoracic-spine')).toBe('upper-back');
  });

  it('should map neck areas correctly', () => {
    expect(mapAreaToGroup('neck-front')).toBe('neck');
    expect(mapAreaToGroup('neck-back-upper')).toBe('neck');
  });

  it('should map abdomen areas correctly', () => {
    expect(mapAreaToGroup('abdomen-left')).toBe('abdomen');
    expect(mapAreaToGroup('belly-button')).toBe('abdomen');
  });

  it('should map chest areas correctly', () => {
    expect(mapAreaToGroup('chest-left')).toBe('chest');
    expect(mapAreaToGroup('sternum')).toBe('chest');
  });

  it('should map thigh areas correctly', () => {
    expect(mapAreaToGroup('thigh-front-left')).toBe('thigh');
    expect(mapAreaToGroup('thigh-back-right')).toBe('thigh');
  });

  it('should return original area for unmapped areas', () => {
    expect(mapAreaToGroup('knee-front')).toBe('knee-front');
    expect(mapAreaToGroup('ankle-left')).toBe('ankle-left');
  });
});

describe('validateStep1', () => {
  it('should fail with no selected areas', () => {
    const result = validateStep1([], '통증이 심해요');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('아픈 곳을 선택해 주세요.');
  });

  it('should fail with empty pain description', () => {
    const result = validateStep1(['neck-front'], '');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('통증이 심해지는 상황을 설명해 주세요.');
  });

  it('should fail with short pain description', () => {
    const result = validateStep1(['neck-front'], '아파요');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('조금 더 자세히 설명해 주세요. (최소 10자)');
  });

  it('should pass with valid input', () => {
    const result = validateStep1(['neck-front'], '컴퓨터 작업을 오래 하면 목이 아파요.');
    expect(result.valid).toBe(true);
  });

  it('should handle whitespace-only description', () => {
    const result = validateStep1(['neck-front'], '   ');
    expect(result.valid).toBe(false);
  });
});

describe('triggerPointsDB', () => {
  it('should have at least one trigger point', () => {
    expect(triggerPointsDB.length).toBeGreaterThan(0);
  });

  it('should have required properties for each trigger point', () => {
    triggerPointsDB.forEach(tp => {
      expect(tp.name).toBeDefined();
      expect(tp.location).toBeDefined();
      expect(tp.anatomicalPosition).toBeDefined();
      expect(tp.referredPain).toBeInstanceOf(Array);
      expect(tp.painAreas).toBeInstanceOf(Array);
      expect(tp.triggers).toBeInstanceOf(Array);
      expect(tp.massage).toBeDefined();
      expect(tp.massage.method).toBeDefined();
      expect(tp.massage.frequency).toBeDefined();
      expect(tp.massage.duration).toBeDefined();
      expect(tp.massage.precaution).toBeDefined();
    });
  });

  it('should have at least 15 trigger points for comprehensive coverage', () => {
    expect(triggerPointsDB.length).toBeGreaterThanOrEqual(15);
  });

  it('should cover major body regions', () => {
    // 모든 painAreas를 수집
    const allPainAreas = new Set();
    triggerPointsDB.forEach(tp => {
      tp.painAreas.forEach(area => allPainAreas.add(area));
    });

    // 주요 신체 영역이 포함되어야 함
    const majorRegions = [
      'neck-front', 'neck-back-upper', 'neck-back-lower',
      'shoulder-left-front', 'shoulder-right-front',
      'upper-back-center', 'lower-back-center',
      'chest-left', 'chest-right',
      'head-front', 'head-back', 'occipital',
      'buttock-left-upper', 'buttock-right-upper',
      'thigh-front-left', 'thigh-front-right',
      'calf-back-left', 'calf-back-right'
    ];

    majorRegions.forEach(region => {
      expect(allPainAreas.has(region)).toBe(true);
    });
  });
});

describe('fascialLinesDB', () => {
  it('should have fascial line entries', () => {
    expect(Object.keys(fascialLinesDB).length).toBeGreaterThan(0);
  });

  it('should have required properties for each fascial line', () => {
    Object.values(fascialLinesDB).forEach(line => {
      expect(line.name).toBeDefined();
      expect(line.path).toBeInstanceOf(Array);
      expect(line.commonIssues).toBeInstanceOf(Array);
      expect(line.relatedAreas).toBeInstanceOf(Array);
      expect(line.treatment).toBeDefined();
    });
  });
});

describe('analyzeTriggerPoints', () => {
  it('should return empty array for no selected areas', () => {
    const result = analyzeTriggerPoints([], {});
    expect(result).toEqual([]);
  });

  it('should find matching trigger points', () => {
    const result = analyzeTriggerPoints(['neck-front'], {});
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('승모근 상부섬유');
  });

  it('should assign high confidence for matching actions and intensity', () => {
    const result = analyzeTriggerPoints(['neck-front'], {
      aggravatingActions: ['sitting', 'computer-work'],
      nrs: 7
    });
    expect(result[0].confidence).toBe('high');
  });

  it('should assign medium confidence for matching actions only', () => {
    const result = analyzeTriggerPoints(['neck-front'], {
      aggravatingActions: ['sitting'],
      nrs: 3
    });
    expect(result[0].confidence).toBe('medium');
  });

  it('should assign medium confidence for high intensity only', () => {
    const result = analyzeTriggerPoints(['neck-front'], {
      aggravatingActions: [],
      nrs: 8
    });
    expect(result[0].confidence).toBe('medium');
  });

  it('should assign low confidence for no matches', () => {
    const result = analyzeTriggerPoints(['neck-front'], {
      aggravatingActions: ['running'],
      nrs: 2
    });
    expect(result[0].confidence).toBe('low');
  });

  it('should not duplicate trigger points', () => {
    const result = analyzeTriggerPoints(['neck-front', 'neck-left'], {});
    const names = result.map(r => r.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });

  it('should sort by confidence (high first)', () => {
    const result = analyzeTriggerPoints(['neck-front', 'head-back'], {
      aggravatingActions: ['sitting'],
      nrs: 3
    });
    const confidences = result.map(r => r.confidence);
    const sortedConfidences = [...confidences].sort((a, b) => {
      const order = { 'high': 3, 'medium': 2, 'low': 1 };
      return order[b] - order[a];
    });
    expect(confidences).toEqual(sortedConfidences);
  });
});

describe('formatAIResponse with tables', () => {
  it('should convert markdown table to step cards', () => {
    const input = `| 단계 | 방법 | 시간 | 주의 |
|---|---|---|---|
| 1 | 방법1 | 5분 | 주의1 |
| 2 | 방법2 | 10분 | 주의2 |

끝`;

    const result = formatAIResponse(input);
    expect(result).toContain('massage-steps');
    expect(result).toContain('step-card');
  });

  it('should handle mixed content with tables', () => {
    const input = `## 헤딩
- 불릿

텍스트`;

    const result = formatAIResponse(input);
    expect(result).toContain('<h2>');
    expect(result).toContain('<li>');
  });
});

describe('analyzeFascialLines', () => {
  it('should return empty array for no selected areas', () => {
    const result = analyzeFascialLines([]);
    expect(result).toEqual([]);
  });

  it('should find matching fascial lines for lower-back', () => {
    const result = analyzeFascialLines(['lower-back-center']);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(r => r.name.includes('표재후선'))).toBe(true);
  });

  it('should find matching fascial lines for neck', () => {
    const result = analyzeFascialLines(['neck-front']);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include line key in result', () => {
    const result = analyzeFascialLines(['lower-back-center']);
    expect(result[0].key).toBeDefined();
  });
});
