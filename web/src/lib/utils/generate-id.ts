let _count = 0;

/**
 * Generate an id that is unique for the lifetime of the page.
 *
 * The counter is module scoped and is never reset, so ids are stable while a
 * page is alive but are not stable across reloads, and are not guaranteed to
 * line up between server-rendered and client-rendered markup. Use these for
 * transient DOM wiring such as `aria-labelledby` or `<label for>`; do not
 * persist them or use them as list keys.
 */
export const generateId = (): string => `id-${_count++}`;
