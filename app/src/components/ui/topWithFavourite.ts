export function topWithFavourite<T>(entries: readonly T[], limit: number | undefined, isFavourite: (entry: T) => boolean): T[] {
  if (limit === undefined || entries.length <= limit) {
    return [...entries];
  }
  const top = entries.slice(0, limit);
  const favourite = entries.slice(limit).find(isFavourite);
  return favourite ? [...top, favourite] : top;
}
