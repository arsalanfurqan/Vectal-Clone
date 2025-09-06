// Notes editor logic (rich text, no UI)
export function formatNote(content: string, format: 'bold' | 'heading' | 'link' | 'list'): { content: string; format: string } {
  // format: 'bold' | 'heading' | 'link' | 'list' | etc.
  // This is a stub for formatting logic
  return { content, format };
}

export function addNote(notes: any[], note: any): any[] {
  return [...notes, note];
}
