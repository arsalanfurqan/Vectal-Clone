import { useState } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  projectId?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
}

export function useTaskManager(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function createTask(task: Omit<Task, 'id'>) {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }

  function updateTask(id: string, updates: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function getTask(id: string) {
    return tasks.find(t => t.id === id);
  }

  // Auto-assign logic (stub)
  function autoAssignTask(task: Omit<Task, 'id'>) {
    // Add AI logic to assign project, description, importance
    return createTask({
      ...task,
      description: task.description || 'Auto-generated description',
      importance: task.importance || 'medium',
      projectId: task.projectId || 'default',
    });
  }

  return { tasks, createTask, updateTask, deleteTask, getTask, autoAssignTask };
}
