import { describe, expect, it } from 'vitest';
import { setSafeHtml } from '../src/browser/safe-html.js';

describe('setSafeHtml', () => {
  it('strips unsafe tags and attributes while preserving allowed formatting', () => {
    const target = document.createElement('div');

    setSafeHtml(target, '<p><strong>OK</strong><img src=x onerror="alert(1)"><script>alert(2)</script></p>');

    expect(target.querySelector('strong')?.textContent).toBe('OK');
    expect(target.querySelector('script')).toBeNull();
    expect(target.querySelector('img')).toBeNull();
    expect(target.innerHTML).not.toContain('onerror');
  });
});
