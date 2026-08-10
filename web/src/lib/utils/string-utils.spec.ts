import { normalizeSearchString, removeAccents } from '$lib/utils/string-utils';

describe('removeAccents', () => {
  it('should leave unaccented text untouched', () => {
    expect(removeAccents('immich')).toBe('immich');
  });

  it('should leave an empty string untouched', () => {
    expect(removeAccents('')).toBe('');
  });

  it('should strip combining marks from accented characters', () => {
    expect(removeAccents('café')).toBe('cafe');
    expect(removeAccents('naïve')).toBe('naive');
    expect(removeAccents('Müller')).toBe('Muller');
  });

  it('should preserve case while stripping accents', () => {
    expect(removeAccents('ÀÉÎÕÜ')).toBe('AEIOU');
  });

  it('should collapse a decomposed character back to a single code point', () => {
    expect(removeAccents('café')).toHaveLength(4);
  });

  it('should leave characters that have no decomposed form', () => {
    // Ø is a distinct letter rather than O plus a combining mark, so there is
    // nothing for NFD to separate out.
    expect(removeAccents('Ø')).toBe('Ø');
    expect(removeAccents('straße')).toBe('straße');
  });
});

describe('normalizeSearchString', () => {
  it('should lowercase and strip accents together', () => {
    expect(normalizeSearchString('CAFÉ')).toBe('cafe');
    expect(normalizeSearchString('Müller')).toBe('muller');
  });

  it('should make differently written forms of the same word compare equal', () => {
    expect(normalizeSearchString('Café')).toBe(normalizeSearchString('CAFE'));
  });
});
