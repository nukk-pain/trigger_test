import { beforeEach, describe, expect, it } from 'vitest';
import { displayGPTResults } from '../src/browser/analysis-renderer.js';

describe('structured AI guidance rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="massage-guide">
        <div id="massage-steps"></div>
      </div>
    `;
  });

  it('renders valid structured guidance without showing raw JSON', () => {
    displayGPTResults({
      aiAnalysis: JSON.stringify({
        targetMuscles: ['상부 승모근'],
        summary: '목 뒤 긴장과 관련된 자가 관리 안내입니다.',
        steps: [{
          title: '상부 승모근 이완',
          method: '손가락으로 천천히 압박합니다.',
          duration: '30초',
          caution: '저림이 생기면 멈춥니다.'
        }],
        stopIf: ['통증이 날카롭게 심해지면 중단'],
        seekCareIf: ['증상이 빠르게 악화되면 진료'],
        disclaimer: '이 안내는 진단이 아닙니다.'
      })
    });

    const guide = document.getElementById('massage-guide');
    expect(guide.textContent).toContain('상부 승모근');
    expect(guide.textContent).toContain('목 뒤 긴장');
    expect(guide.textContent).toContain('통증이 날카롭게');
    expect(guide.textContent).toContain('이 안내는 진단이 아닙니다.');
    expect(guide.textContent).not.toContain('"targetMuscles"');
  });

  it.each([
    ['malformed JSON', '<script>alert(1)</script>bad'],
    ['empty output', ''],
    ['too many steps', JSON.stringify({
      targetMuscles: ['상부 승모근'],
      summary: '요약',
      steps: [1, 2, 3, 4, 5].map(index => ({
        title: `단계 ${index}`,
        method: '방법',
        duration: '30초',
        caution: '주의'
      })),
      stopIf: ['중단'],
      seekCareIf: ['진료'],
      disclaimer: '진단 아님'
    })]
  ])('renders safe fallback for %s', (_label, aiAnalysis) => {
    displayGPTResults({ aiAnalysis });

    const guide = document.getElementById('massage-guide');
    expect(guide.textContent).toContain('안전하게 형식화할 수 없습니다');
    expect(guide.textContent).toContain('의료기관');
    expect(guide.querySelector('script')).toBeNull();
    expect(guide.innerHTML).not.toContain('<script>');
  });

  it('sanitizes script-like text inside structured fields', () => {
    displayGPTResults({
      aiAnalysis: JSON.stringify({
        targetMuscles: ['<script>alert(1)</script>상부 승모근'],
        summary: '<img src=x onerror=alert(1)>요약',
        steps: [{
          title: '<script>alert(2)</script>단계',
          method: '방법',
          duration: '30초',
          caution: '주의'
        }],
        stopIf: ['<script>alert(3)</script>중단'],
        seekCareIf: ['진료'],
        disclaimer: '진단 아님'
      })
    });

    const guide = document.getElementById('massage-guide');
    expect(guide.querySelector('script')).toBeNull();
    expect(guide.querySelector('img')).toBeNull();
    expect(guide.innerHTML).not.toContain('<script>');
    expect(guide.textContent).toContain('상부 승모근');
  });
});
