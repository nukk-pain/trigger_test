import { describe, expect, it } from 'vitest';
import { appendChipText } from '../lib/chip-insert.js';

describe('appendChipText', () => {
  it('returns the chip when the field is empty', () => {
    expect(appendChipText('', '앉아 있을 때')).toBe('앉아 있을 때');
  });

  it('joins with a natural connector when text already exists', () => {
    expect(appendChipText('아침에 뻐근해요', '앉아 있을 때')).toBe('아침에 뻐근해요, 앉아 있을 때');
  });

  it('does not duplicate a chip already present', () => {
    const current = '앉아 있을 때 결려요';
    expect(appendChipText(current, '앉아 있을 때')).toBe(current);
  });

  it('does not insert when it would exceed maxLength', () => {
    const current = 'x'.repeat(498);
    expect(appendChipText(current, '앉아 있을 때', 500)).toBe(current);
  });

  it('trims trailing whitespace before joining', () => {
    expect(appendChipText('아파요   ', '잘 때')).toBe('아파요, 잘 때');
  });
});
