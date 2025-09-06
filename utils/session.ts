// Session storage and search logic
export function saveSessionData(key: string, value: any): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getSessionData(key: string): any {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function searchSessionData(query: string): { key: string; value: any }[] {
  // Search all sessionStorage keys
  const results: { key: string; value: any }[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    const value = sessionStorage.getItem(key);
    if (value && value.toLowerCase().includes(query.toLowerCase())) {
      results.push({ key, value: JSON.parse(value) });
    }
  }
  return results;
}
