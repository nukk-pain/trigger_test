import { describe, expect, it } from 'vitest';
import { setSafeHtml } from '../src/browser/safe-html.js';

describe('setSafeHtml', () => {
  it('strips unsafe tags and attributes while preserving allowed formatting', () => {
    const target = document.createElement('div');

    setSafeHtml(
      target,
      '<p style="color:red" onclick="alert(0)"><strong>OK</strong><img src=x onerror="alert(1)"><script>alert(2)</script></p>'
    );

    expect(target.querySelector('strong')?.textContent).toBe('OK');
    expect(target.querySelector('script')).toBeNull();
    expect(target.querySelector('img')).toBeNull();
    expect(target.innerHTML).not.toContain('onerror');
    expect(target.innerHTML).not.toContain('onclick');
    expect(target.innerHTML).not.toContain('style=');
  });

  it('allows only https links', () => {
    const target = document.createElement('div');

    setSafeHtml(target, '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a>');

    const links = target.querySelectorAll('a');
    expect(links[0].hasAttribute('href')).toBe(false);
    expect(links[1].getAttribute('href')).toBe('https://example.com');
  });
});
