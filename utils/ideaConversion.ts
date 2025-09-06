// Logic for converting ideas to notes or projects, and a create handler
export interface Idea {
  [key: string]: any;
}

export function convertIdeaToNote(idea: Idea): Idea {
  // Add logic to convert idea to note (e.g., call API, update state)
  return { ...idea, type: 'note' };
}

export function convertIdeaToProject(idea: Idea): Idea {
  // Add logic to convert idea to project
  return { ...idea, type: 'project' };
}

export function createFromIdea(idea: Idea, type: 'note' | 'project' | 'task'): Idea {
  // type: 'note' | 'project' | 'task'
  return { ...idea, type };
}
