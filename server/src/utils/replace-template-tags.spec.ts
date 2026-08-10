import { replaceTemplateTags } from 'src/utils/replace-template-tags';
import { describe, expect, it } from 'vitest';

describe('replaceTemplateTags', () => {
  it('should return a template without tags unchanged', () => {
    expect(replaceTemplateTags('no tags here', { name: 'Alex' })).toBe('no tags here');
  });

  it('should substitute a known tag', () => {
    expect(replaceTemplateTags('Hello {name}', { name: 'Alex' })).toBe('Hello Alex');
  });

  it('should substitute several distinct tags', () => {
    expect(replaceTemplateTags('{greeting}, {name}!', { greeting: 'Hi', name: 'Alex' })).toBe('Hi, Alex!');
  });

  it('should substitute every occurrence of the same tag', () => {
    expect(replaceTemplateTags('{a}-{a}-{a}', { a: '1' })).toBe('1-1-1');
  });

  it('should leave an unknown tag in place', () => {
    expect(replaceTemplateTags('Hello {name}', {})).toBe('Hello {name}');
  });

  it('should leave unknown tags in place while substituting known ones', () => {
    expect(replaceTemplateTags('{greeting}, {name}!', { greeting: 'Hi' })).toBe('Hi, {name}!');
  });
});
