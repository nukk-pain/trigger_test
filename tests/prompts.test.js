import { describe, expect, it } from 'vitest';
import { MEDICAL_PROMPTS } from '../lib/prompts.js';

describe('MEDICAL_PROMPTS', () => {
  it('keeps the red-flag safety prompt exported from the prompt module', () => {
    expect(MEDICAL_PROMPTS.RED_FLAG_CHECK).toContain('응급상황');
    expect(MEDICAL_PROMPTS.RED_FLAG_CHECK).toContain('즉시 병원 방문');
  });

  it('keeps massage guidance framed as self-care, not diagnosis', () => {
    expect(MEDICAL_PROMPTS.PAIN_ANALYSIS).toContain('셀프 마사지');
    expect(MEDICAL_PROMPTS.PAIN_ANALYSIS).toContain('의사 전문 진료 권유');
    expect(MEDICAL_PROMPTS.AI_QUESTION).toContain('의학적 진단은 하지 말고');
  });
});
