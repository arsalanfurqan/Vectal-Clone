export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string; // Optional: ISO date string
  importance?: 'Min' | 'Low' | 'Med' | 'High' | 'Max'; // Optional
  description?: string; // Optional
  checklist?: { id: string; content: string; completed: boolean }[]; // Optional
  projectId?: string; // Optional: ID of associated project
  recurring?: boolean; // Optional
  recurringDetails?: string; // Optional: e.g., "daily", "weekly"
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  createdAt: string;
  context?: string;
  excludeUserContext?: boolean;
  color?: string;
}

export interface Note {
  id?: string;
  content: string;
  createdAt: string;
}

export interface Idea {
  id?: string;
  content: string;
  createdAt: string;
}


import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from './firebase-db';

// Firestore CRUD for Tasks
export const getTasks = async () => {
  const snapshot = await getDocs(collection(db, 'tasks'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addTask = async (task: Task) => {
  return await addDoc(collection(db, 'tasks'), task);
};
export const updateTask = async (id: string, data: Partial<Task>) => {
  return await updateDoc(doc(db, 'tasks', id), data);
};
export const deleteTask = async (id: string) => {
  return await deleteDoc(doc(db, 'tasks', id));
};

// Firestore CRUD for Projects
export const getProjects = async () => {
  const snapshot = await getDocs(collection(db, 'projects'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addProject = async (project: Project) => {
  return await addDoc(collection(db, 'projects'), project);
};
export const updateProject = async (id: string, data: Partial<Project>) => {
  return await updateDoc(doc(db, 'projects', id), data);
};
export const deleteProject = async (id: string) => {
  return await deleteDoc(doc(db, 'projects', id));
};

// Firestore CRUD for Notes
export const getNotes = async () => {
  const snapshot = await getDocs(collection(db, 'notes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addNote = async (note: Note) => {
  return await addDoc(collection(db, 'notes'), note);
};
export const updateNote = async (id: string, data: Partial<Note>) => {
  return await updateDoc(doc(db, 'notes', id), data);
};
export const deleteNote = async (id: string) => {
  return await deleteDoc(doc(db, 'notes', id));
};

// Firestore CRUD for Ideas
export const getIdeas = async () => {
  const snapshot = await getDocs(collection(db, 'ideas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addIdea = async (idea: Idea) => {
  return await addDoc(collection(db, 'ideas'), idea);
};
export const updateIdea = async (id: string, data: Partial<Idea>) => {
  return await updateDoc(doc(db, 'ideas', id), data);
};
export const deleteIdea = async (id: string) => {
  return await deleteDoc(doc(db, 'ideas', id));
};