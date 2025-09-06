import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, getTasks, Project, getProjects, addTask, updateTask, deleteTask } from '../utils/storage';
import Card from './UI/Card';
import Button from './UI/Button';
import { useRefresh } from '../contexts/RefreshContext';
import { Trash2, ChevronRight, CheckCircle, Circle, Edit, MoreVertical, User, Bell, Plus } from 'lucide-react';

interface TaskCreationCardProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

interface TaskEditCardProps {
  onClose: () => void;
  onTaskUpdated: () => void;
  task: Task;
}

const TaskCreationCard: React.FC<TaskCreationCardProps> = ({ onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [importance, setImportance] = useState<Task['importance']>(undefined);
  const [description, setDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; content: string; completed: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDetails, setRecurringDetails] = useState('');
  const [projects, setProjectsState] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      const projects = await getProjects();
      setProjectsState(projects as Project[]);
    }
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }
    const validImportance = ['Min', 'Low', 'Med', 'High', 'Max'];
    let importanceValue = importance;
    if (importance && !validImportance.includes(importance)) {
      importanceValue = undefined;
    }
    const newTask: Omit<Task, 'id'> = {
      title: title.trim(),
      ...(dueDate && { dueDate }),
      ...(importanceValue && { importance: importanceValue }),
      ...(description && { description }),
      ...(checklistItems.length > 0 && { checklist: checklistItems }),
      ...(selectedProjectId && { projectId: selectedProjectId }),
      ...(isRecurring && { recurring: true, recurringDetails }),
      completed: false,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = await addTask(newTask as Task);
      // Optionally, fetch tasks again to update local state with Firestore IDs
      onTaskCreated();
      onClose();
    } catch (e) {
      alert('Failed to create task.');
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [...prev, { id: Date.now().toString(), content: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
  <Card variant="elevated" className="p-6 pb-0 mb-0 space-y-4 w-[600px] h-[67vh] bg-[#222222] rounded-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-white">Create Task</h2>
          <button
            onClick={handleCreate}
            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#18181B] hover:bg-gray-200 focus:outline-none"
            title="Add Task"
          >
            <Plus size={20} />
          </button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      />

      <div className="flex space-x-4">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-1/2 p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        />
        <select
          value={importance || ''}
          onChange={(e) => setImportance(e.target.value as Task['importance'])}
          className="w-1/2 p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        >
          <option value="">Select Importance</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      ></textarea>

      <div>
        <h3 className="text-white mb-2">Checklist</h3>
        {checklistItems.map(item => (
          <div key={item.id} className="flex items-center space-x-2 text-white mb-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleChecklistItem(item.id)}
              className="form-checkbox h-4 w-4 text-gray-600 rounded"
            />
            <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.content}</span>
          </div>
        ))}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New checklist item"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            className="flex-grow p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
          />
          <Button onClick={addChecklistItem} variant="secondary">Add</Button>
        </div>
      </div>

      <select
        value={selectedProjectId || ''}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      >
        <option value="">Select Project (Optional)</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="form-checkbox h-4 w-4 text-gray-600 rounded"
        />
        <label className="text-white">Recurring Task</label>
      </div>

      {isRecurring && (
        <input
          type="text"
          placeholder="Recurring details (e.g., 'daily', 'every Monday')"
          value={recurringDetails}
          onChange={(e) => setRecurringDetails(e.target.value)}
          className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        />
      )}

      <Button onClick={handleCreate} variant="primary" className="w-full">Create Task</Button>
    </Card>
  );
};

const TaskEditCard: React.FC<TaskEditCardProps> = ({ onClose, onTaskUpdated, task }) => {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [importance, setImportance] = useState<Task['importance']>(task.importance);
  const [description, setDescription] = useState(task.description || '');
  const [checklistItems, setChecklistItems] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(task.projectId);
  const [isRecurring, setIsRecurring] = useState(task.recurring || false);
  const [recurringDetails, setRecurringDetails] = useState(task.recurringDetails || '');
  const [projects, setProjectsState] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      const projects = await getProjects();
      setProjectsState(projects as Project[]);
    }
    fetchProjects();
  }, []);

  const handleUpdate = async () => {
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      ...(dueDate && { dueDate }),
      ...(importance && { importance }),
      ...(description && { description }),
      ...(checklistItems.length > 0 && { checklist: checklistItems }),
      ...(selectedProjectId && { projectId: selectedProjectId }),
      ...(isRecurring && { recurring: true, recurringDetails }),
    };
    const allTasks = await getTasks();
    const exists = allTasks.find(t => t.id === updatedTask.id);
    if (exists) {
      await updateTask(updatedTask.id, updatedTask);
    } else {
      alert('Task does not exist. Cannot update.');
    }
    onTaskUpdated();
    onClose();
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [...prev, { id: Date.now().toString(), content: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Edit Task</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      />

      <div className="flex space-x-4">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-1/2 p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        />
        <select
          value={importance || ''}
          onChange={(e) => setImportance(e.target.value as Task['importance'])}
          className="w-1/2 p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        >
          <option value="">Select Importance</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      ></textarea>

      <div>
        <h3 className="text-white mb-2">Checklist</h3>
        {checklistItems.map(item => (
          <div key={item.id} className="flex items-center space-x-2 text-white mb-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleChecklistItem(item.id)}
              className="form-checkbox h-4 w-4 text-gray-600 rounded"
            />
            <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.content}</span>
          </div>
        ))}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New checklist item"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            className="flex-grow p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
          />
          <Button onClick={addChecklistItem} variant="secondary">Add</Button>
        </div>
      </div>

      <select
        value={selectedProjectId || ''}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
      >
        <option value="">Select Project (Optional)</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="form-checkbox h-4 w-4 text-gray-600 rounded"
        />
        <label className="text-white">Recurring Task</label>
      </div>

      {isRecurring && (
        <input
          type="text"
          placeholder="Recurring details (e.g., 'daily', 'every Monday')"
          value={recurringDetails}
          onChange={(e) => setRecurringDetails(e.target.value)}
          className="w-full p-3 bg-[#1A1A1A] text-white rounded-md border border-[#333333] focus:outline-none focus:border-[#444444]"
        />
      )}

      <Button onClick={handleUpdate} variant="primary" className="w-full">Update Task</Button>
    </Card>
  );
};

const TasksList: React.FC = () => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [showCreationCard, setShowCreationCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompletedCount, setShowCompletedCount] = useState(false);
  // Removed duplicate declaration of triggerRefresh
  const [projects, setProjectsState] = useState<Project[]>([]);
  // Add view state for view switcher
  const [view, setView] = useState<'list' | 'calendar' | 'kanban'>('list');

  const { refreshKey, triggerRefresh } = useRefresh();
  useEffect(() => {
    async function fetchData() {
      const tasks = await getTasks();
      setTasksState(tasks as Task[]);
      const projects = await getProjects();
      setProjectsState(projects as Project[]);
    }
    fetchData();
  }, [refreshKey]);

  const handleTaskCreated = () => {
    triggerRefresh();
  };

  const handleTaskUpdated = () => {
    triggerRefresh();
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const allTasks = await getTasks();
    const exists = allTasks.find(t => t.id === id);
    if (exists) {
      try {
        await updateTask(id, { completed: !task.completed });
      } catch (err: any) {
        alert('Failed to update task. It may not exist in Firestore.');
        // Optionally, refresh local state from Firestore
        const refreshedTasks = await getTasks();
        // If you have setTasksState, update it here
      }
    } else {
      alert('Task does not exist in Firestore. Cannot update.');
    }
    triggerRefresh();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    triggerRefresh();
  };

  const openEditCard = (task: Task) => {
    setEditingTask(task);
    setShowEditCard(true);
  };

  const filteredTasks = showCompletedCount ? tasks.filter(task => task.completed) : tasks.filter(task => !task.completed);

  // Determine card size based on view
  let cardWidth = '520px';
  let cardHeight = '1200px';
  if (view === 'kanban' || view === 'calendar') {
    cardWidth = '1000px';
    cardHeight = '1100px';
  }
  return (
    <div className="flex flex-col text-white font-['Inter','Roboto',sans-serif] bg-[#191919] overflow-hidden ml-16"
      style={{ width: cardWidth, height: cardHeight, minHeight: cardHeight, borderRadius: '22px', border: 'none', boxShadow: 'none', outline: 'none', marginLeft: '4rem', position: 'relative', transition: 'width 0.3s,height 0.3s', zIndex: 2 }}>
  {/* Top Bar */}
  <div className="flex items-center justify-between mx-auto py-3 px-6 bg-white rounded-t-[22px] w-full" style={{ borderTopLeftRadius: '22px', borderTopRightRadius: '22px', marginTop: 0, boxShadow: 'none', borderBottom: '1px solid #232323' }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#18181B] font-['Inter','Roboto',sans-serif]">vectal.ai</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreationCard(true)}
            className="p-0 m-0 bg-transparent hover:bg-gray-200 text-[#18181B] focus:outline-none border-none shadow-none"
            aria-label="Add Task"
            style={{ borderRadius: 0 }}
          >
            <Plus size={26} />
          </button>
          <button className="text-[#18181B] hover:bg-gray-200 p-2 focus:outline-none bg-transparent border-none">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
          </button>
          <button className="text-[#18181B] hover:bg-gray-200 p-2 focus:outline-none bg-transparent border-none">
            <User size={22} />
          </button>
          <div className="flex items-center border border-[#18181B] rounded-full px-2 py-0.5 text-[#18181B] text-xs font-semibold ml-2 bg-white" style={{ fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6V12L16 14"/></svg>
            <span className="ml-1">{tasks.filter(t => t.completed).length} / {tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Task Controls: View Switcher + AI Auto-Assign */}
  <div className="flex items-center justify-center mx-auto py-2 px-6 bg-[#191919] border-b border-[#232323] w-full" style={{minHeight:'56px'}}>
    <div className="flex items-center space-x-2">
      <button className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-white text-[#18181B]' : 'bg-[#232323] text-[#9A9A9A] hover:bg-[#232323] hover:text-white'}`} onClick={() => setView('list')} title="List View">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="16" width="16" height="2" rx="1"/></svg>
      </button>
      <button className={`p-2 rounded-lg transition ${view === 'kanban' ? 'bg-white text-[#18181B]' : 'bg-[#232323] text-[#9A9A9A] hover:bg-[#232323] hover:text-white'}`} onClick={() => setView('kanban')} title="Kanban View">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/></svg>
      </button>
      <button className={`p-2 rounded-lg transition ${view === 'calendar' ? 'bg-white text-[#18181B]' : 'bg-[#232323] text-[#9A9A9A] hover:bg-[#232323] hover:text-white'}`} onClick={() => setView('calendar')} title="Calendar View">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M16 2v4M8 2v4"/><path d="M3 10h18"/></svg>
      </button>
    </div>
  </div>
  <div className="flex-grow p-6 pb-0 overflow-y-hidden bg-transparent w-full mx-auto min-h-0 flex flex-col" style={{ overflowY: 'hidden' }}>
        {/* List View */}
        {view === 'list' && (
          filteredTasks.length === 0 ? (
            <div className="flex flex-col items-start justify-center h-full text-gray-400 pl-4">
              <p className="mb-4">No tasks yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => {
                // Overdue check
                let isOverdue = false;
                if (task.dueDate) {
                  const due = new Date(task.dueDate);
                  const now = new Date();
                  isOverdue = !task.completed && due.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                }
                return (
                  <React.Fragment key={task.id}>
                    <div className="flex items-center px-0 py-2 group">
                      <button onClick={() => toggleTaskCompletion(task.id)} className="mr-4 flex items-center justify-center w-6 h-6 rounded-full border border-[#666] bg-transparent">
                        {task.completed ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 12 15 16 10"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/></svg>
                        )}
                      </button>
                      <div className="flex flex-col flex-grow">
                        <span className={`text-base font-medium ${task.completed ? 'line-through text-[#666]' : 'text-white'}`}>{task.title}</span>
                        <span className="text-xs text-[#888] flex items-center gap-2">
                          <svg width="12" height="12" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24" className="inline-block mr-1"><rect x="3" y="11" width="18" height="2" rx="1"/></svg>
                          overdue
                        </span>
                      </div>
                    </div>
                    <div className="border-b border-[#232323] mx-2" />
                  </React.Fragment>
                );
              })}
            </div>
          )
        )}
        {/* Completed tasks label at the bottom */}
        <div className="w-full flex justify-center mt-8">
          <span className="text-xs text-[#888] italic">completed tasks</span>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="flex-1 flex flex-col h-full w-full">
            <div className="w-full h-full">
              {/* Remove border from Kanban columns if present in KanbanBoard */}
              <KanbanBoard tasks={tasks} setTasks={setTasksState} />
            </div>
          </div>
        )}




        {/* Calendar View (stub) */}
        {view === 'calendar' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-x-auto">
            <div className="rounded-2xl p-4 w-full h-full shadow-lg bg-transparent flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-8 text-white font-['Inter','Roboto',sans-serif]">Calendar</h2>
              {/* Simple calendar grid, not interactive yet */}
              <div className="grid grid-cols-7 gap-3 flex-1">
                {[...Array(28)].map((_, i) => {
                  const day = i + 1;
                  const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).getDate() === day);
                  return (
                    <div key={day} className="bg-[#1C1C1C] rounded-2xl p-2 min-h-[60px] shadow border border-[#2A2A2A] flex flex-col">
                      <div className="text-xs text-[#9A9A9A] mb-2 font-semibold">{day}</div>
                      {dayTasks.map(task => {
                        let priorityColor = '';
                        if (task.importance === 'High') priorityColor = 'bg-[#FF3B30]';
                        else if (task.importance === 'Med') priorityColor = 'bg-[#FFCC00]';
                        else if (task.importance === 'Low') priorityColor = 'bg-[#34C759]';
                        let isOverdue = false;
                        if (task.dueDate) {
                          const due = new Date(task.dueDate);
                          const now = new Date();
                          isOverdue = !task.completed && due.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                        }
                        return (
                          <div key={task.id} className="flex items-center mb-1">
                            {task.importance && <span className={`w-2 h-2 rounded-full mr-2 ${priorityColor}`}></span>}
                            <span className={`text-xs font-semibold ${isOverdue ? 'text-[#FF4C4C]' : 'text-white'}`}>{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreationCard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <TaskCreationCard onClose={() => setShowCreationCard(false)} onTaskCreated={handleTaskCreated} />
        </div>
      )}

      {showEditCard && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <TaskEditCard onClose={() => setShowEditCard(false)} onTaskUpdated={handleTaskUpdated} task={editingTask} />

        </div>
      )}

      {/* Floating Plus button removed as requested */}
    </div>
  );
};


export default TasksList;

// KanbanBoard Props interface
interface KanbanBoardProps {
  tasks: any[];
  setTasks: (tasks: any[]) => void;
}

const ItemTypes = { TASK: 'task' };

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, setTasks }) => {
  const statuses = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Completed' }
  ];
  // Auto-assign status based on task state
  const tasksWithStatus = tasks.map(t => {
    if (t.completed && t.status !== 'done') return { ...t, status: 'done' };
    if (!t.completed && t.dueDate && t.status !== 'in-progress') return { ...t, status: 'in-progress' };
    if (!t.status) return { ...t, status: 'todo' };
    return t;
  });

  // Drop zone for each column

  interface KanbanColumnProps {
    statusKey: string;
    label: string;
    children: React.ReactNode;
  }
  const KanbanColumn: React.FC<KanbanColumnProps> = ({ statusKey, label, children }) => {
    const [, drop] = useDrop({
      accept: ItemTypes.TASK,
      drop: (item: { id: string }) => moveTask(item.id, statusKey),
    });
    return (
      <div ref={drop} className="flex-1 min-w-[250px] bg-[#181818] rounded-lg p-3" style={{ border: 'none', boxShadow: 'none' }}>
        <h2 className="text-lg font-bold mb-2 capitalize flex items-center gap-2">
          {label}
          <span className="text-xs text-gray-400 font-normal">{tasksWithStatus.filter(t => t.status === statusKey).length}</span>
        </h2>
        {children}
      </div>
    );
  };

  interface KanbanTaskProps {
    task: any;
  }
  const KanbanTask: React.FC<KanbanTaskProps> = ({ task }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TASK,
      item: { id: task.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    return (
      <div
        ref={drag}
        className={`bg-[#181818] rounded p-2 mb-2 shadow cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <h3 className="font-medium text-white">{task.title}</h3>
        {task.dueDate && <p className="text-gray-400 text-xs">{task.dueDate}</p>}
      </div>
    );
  };

  const moveTask = (taskId: string, newStatus: string) => {
    const updatedTasks = tasksWithStatus.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    // Also persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 w-full overflow-x-auto">
        {statuses.map(({ key, label }) => (
          <KanbanColumn key={key} statusKey={key} label={label}>
            {tasksWithStatus.filter(t => t.status === key).length === 0 && (
              <div className="min-h-[80px] border-dashed border-2 border-[#444] rounded mb-2 flex flex-col items-center justify-center text-gray-500 text-sm" style={{ minHeight: '100px' }}>
                No tasks
              </div>
            )}
            {tasksWithStatus.filter(t => t.status === key).map(task => (
              <KanbanTask key={task.id} task={task} />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </DndProvider>
  );
};