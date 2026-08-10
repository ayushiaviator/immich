import { isEqual, isPlainObject } from 'lodash';

/**
 * Converts a class instance into a plain object by deep cloning it.
 *
 * Note that inputs which are already plain objects are returned by reference
 * rather than cloned, so the result must not be relied on as a defensive copy.
 */
export function toPlainObject<T extends object>(obj: T): T {
  return isPlainObject(obj) ? obj : structuredClone(obj);
}

/**
 * Performs a deep comparison between objects, converting them to plain objects first if needed.
 */
export function isEqualObject(value: object, other: object): boolean {
  return isEqual(toPlainObject(value), toPlainObject(other));
}
