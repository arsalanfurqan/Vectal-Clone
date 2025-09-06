// Minimal Kanban, Calendar, and List view stubs for tasks
import { Task } from './taskManager';

export function getTaskListView(tasks: Task[]): Task[] {
  // Return tasks as a flat list
  return tasks;
}

export function getTaskCalendarView(tasks: Task[]): Record<string, Task[]> {
  // Group tasks by dueDate (stub)
  return tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const date = t.dueDate || 'No Due Date';
    acc[date] = acc[date] || [];
    acc[date].push(t);
    return acc;
  }, {});
}

export function getTaskKanbanView(tasks: Task[]): Record<string, Task[]> {
  // Group tasks by status
  return tasks.reduce<Record<string, Task[]>>((acc, t) => {
    acc[t.status] = acc[t.status] || [];
    acc[t.status].push(t);
    return acc;
  }, {});
}
