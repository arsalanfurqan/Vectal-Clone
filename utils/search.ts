// Search logic for ideas, notes, projects, tasks, etc.
export function searchItems<T>(items: T[], query: string): T[] {
  if (!query) return items;
  return items.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
}
