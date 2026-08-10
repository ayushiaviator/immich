import { paginationHelper } from 'src/utils/pagination';
import { describe, expect, it } from 'vitest';

describe('paginationHelper', () => {
  it('should handle an empty result set', () => {
    expect(paginationHelper([], 10)).toEqual({ items: [], hasNextPage: false });
  });

  it('should report no next page for a partial page', () => {
    expect(paginationHelper([{ id: 1 }, { id: 2 }], 5)).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      hasNextPage: false,
    });
  });

  it('should report no next page when the rows exactly fill the page', () => {
    expect(paginationHelper([{ id: 1 }, { id: 2 }], 2)).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      hasNextPage: false,
    });
  });

  it('should trim the look-ahead row and report a next page', () => {
    expect(paginationHelper([{ id: 1 }, { id: 2 }, { id: 3 }], 2)).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      hasNextPage: true,
    });
  });

  it('should trim every row past the page size', () => {
    const rows = Array.from({ length: 10 }, (_, id) => ({ id }));
    const { items, hasNextPage } = paginationHelper(rows, 3);
    expect(items).toHaveLength(3);
    expect(hasNextPage).toBe(true);
  });
});
