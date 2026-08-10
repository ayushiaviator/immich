export interface PaginationOptions {
  take: number;
  skip?: number;
}

export interface PaginationResult<T> {
  items: T[];
  hasNextPage: boolean;
}

export function paginationHelper<Entity extends object>(items: Entity[], take: number): PaginationResult<Entity> {
  const hasNextPage = items.length > take;

  return { items: items.slice(0, take), hasNextPage };
}
