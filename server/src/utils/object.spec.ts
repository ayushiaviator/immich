import { isEqualObject, toPlainObject } from 'src/utils/object';
import { describe, expect, it } from 'vitest';

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Box {
  constructor(public nested: { value: number }) {}
}

describe('toPlainObject', () => {
  it('should return a plain object unchanged', () => {
    const value = { a: 1 };
    expect(toPlainObject(value)).toBe(value);
  });

  it('should convert a class instance into a plain object', () => {
    expect(toPlainObject(new Point(1, 2))).toEqual({ x: 1, y: 2 });
  });

  it('should deeply clone nested values out of a class instance', () => {
    const nested = { value: 1 };
    const clone = toPlainObject(new Box(nested));
    expect(clone.nested).toEqual({ value: 1 });
    expect(clone.nested).not.toBe(nested);
  });
});

describe('isEqualObject', () => {
  it('should compare plain objects deeply', () => {
    expect(isEqualObject({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(isEqualObject({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('should treat a class instance as equal to an equivalent plain object', () => {
    expect(isEqualObject(new Point(1, 2), { x: 1, y: 2 })).toBe(true);
  });

  it('should detect differing keys', () => {
    expect(isEqualObject({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });
});
