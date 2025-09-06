import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, sendChatMessage } from '../utils/ai';
import {
  Task, Project, Note, Idea,
  getTasks, addTask, updateTask, deleteTask,
  getProjects, addProject, updateProject, deleteProject,
  getNotes, addNote, updateNote, deleteNote,
  getIdeas, addIdea, updateIdea, deleteIdea
} from '../utils/storage';
import Button from './UI/Button';
import { copyToClipboard } from '../utils/clipboard';
import { useRefresh } from '../contexts/RefreshContext';
// import { useSession, signOut } from 'next-auth/react'; // Disabled auth
import Image from 'next/image';

interface ChatScreenProps {
  // session: any; // Removed session prop
}

const ChatScreen: React.FC<ChatScreenProps> = () => { // Removed session from props
  // const { data: session } = useSession(); // Disabled auth
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'chat' | 'agent' | 'deep-research'>('chat');
  // Ultra Search modal state
  // Remove Ultra Search modal state
  // Model selector state
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('DeepSeek: R1 0528');
  const models = [
    { name: 'DeepSeek: R1 0528', locked: false },
    { name: 'GPT-4o', locked: true },
    { name: 'Gemini 1.5 Pro', locked: true },
    { name: 'Claude 3 Opus', locked: true },
    { name: 'Llama 3 70B', locked: true },
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { triggerRefresh } = useRefresh();

  // const handleLogout = async () => { // Disabled auth
  //   await signOut({ callbackUrl: '/' });
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll disabled as per user request

  const handleAgentCommand = async (command: string): Promise<string> => {
    console.log('handleAgentCommand called with:', command);
    console.log('Current mode:', currentMode);
    const lowerCommand = command.toLowerCase();
    console.log('Lower command:', lowerCommand);
    let agentResponse = '';

    // Helper function to generate clarification messages
    const generateClarificationMessage = async (itemType: string, searchTerm: string) => {
      let items: any[] = [];
      if (itemType === 'task') items = await getTasks();
      else if (itemType === 'project') items = await getProjects();
      else if (itemType === 'note') items = await getNotes();
      else if (itemType === 'idea') items = await getIdeas();
      
      const matchingItems = items.filter((item: any) => {
        const content = itemType === 'task' ? item.title : 
                       itemType === 'project' ? item.name : 
                       item.content;
        return content.toLowerCase().includes(searchTerm.toLowerCase());
      });

      if (matchingItems.length === 0) {
        return `No ${itemType}s found containing "${searchTerm}". Please check the spelling or try a different search term.`;
      }

      if (matchingItems.length === 1) {
        const item = matchingItems[0];
        const content = itemType === 'task' ? (item as any).title : 
                       itemType === 'project' ? (item as any).name : 
                       (item as any).content;
        return `I found one ${itemType} matching "${searchTerm}": "${content}". What would you like to change?\n\nOptions:\n- Content/Title: "update ${itemType} ${searchTerm} to [new content]"\n- Fix spelling: "update ${itemType} ${searchTerm} to [corrected spelling]"\n- Add details: "update ${itemType} ${searchTerm} to [enhanced content]"`;
      }

      const itemList = matchingItems.map((item: any) => {
        const content = itemType === 'task' ? item.title : 
                       itemType === 'project' ? item.name : 
                       item.content;
        return `- "${content}"`;
      }).join('\n');

      return `I found ${matchingItems.length} ${itemType}s containing "${searchTerm}":\n${itemList}\n\nPlease be more specific about which ${itemType} you want to update. You can:\n- Use more of the ${itemType} name/content\n- Use the exact ${itemType} name\n- Or specify which one by number`;
    };

    // Helper function to check for spelling mistakes
    const checkForSpellingMistakes = async (itemType: string, searchTerm: string) => {
      let items: any[] = [];
      if (itemType === 'task') items = await getTasks();
      else if (itemType === 'project') items = await getProjects();
      else if (itemType === 'note') items = await getNotes();
      else if (itemType === 'idea') items = await getIdeas();
      
      // Common spelling mistakes and corrections
      const spellingSuggestions: string[] = [];
      
      items.forEach((item: any) => {
        const content = itemType === 'task' ? item.title : 
                       itemType === 'project' ? item.name : 
                       item.content;
        
        // Check if search term is close to content (simple similarity check)
        const contentLower = content.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // If search term is a substring of content or vice versa with small differences
        if (contentLower.includes(searchLower) || searchLower.includes(contentLower)) {
          if (contentLower !== searchLower) {
            spellingSuggestions.push(`Did you mean "${content}"?`);
          }
        }
      });

      if (spellingSuggestions.length > 0) {
        return `\n\nPossible spelling corrections:\n${spellingSuggestions.slice(0, 3).join('\n')}`;
      }
      
      return '';
    };

  if (lowerCommand.startsWith('create task')) {
      console.log('Creating task with command:', command);
      const taskContent = command.substring('create task'.length).trim();
      console.log('Task content:', taskContent);
      if (taskContent) {
        const newTask: Task = { id: Date.now().toString(), title: taskContent, completed: false, createdAt: new Date().toISOString() };
        await addTask(newTask);
        agentResponse = `Task "${taskContent}" created successfully.`;
      } else {
        agentResponse = 'Please provide content for the task.';
        console.log('No task content provided');
      }
    } else if (lowerCommand.startsWith('list tasks')) {
      const tasks = await getTasks();
      if (tasks.length > 0) {
        agentResponse = 'Your tasks:\n' + tasks.map((t: any) => `- ${t.title} [${t.completed ? 'Completed' : 'Pending'}]`).join('\n');
      } else {
        agentResponse = 'You have no tasks.';
      }
  } else if (lowerCommand.startsWith('update task')) {
      const updateContent = command.substring('update task'.length).trim();
      const parts = updateContent.split(' to ');
      
      if (parts.length === 2) {
        const searchString = parts[0].trim();
        const newContent = parts[1].trim();
        const tasks = await getTasks();
        const taskIndex = tasks.findIndex((t: any) => t.title.toLowerCase().includes(searchString.toLowerCase()));
        if (taskIndex !== -1) {
    const oldTitle = (tasks[taskIndex] as Task).title;
    await updateTask(tasks[taskIndex].id, { title: newContent });
    agentResponse = `Task "${oldTitle}" updated to "${newContent}".`;
        } else {
          agentResponse = `Task containing "${searchString}" not found.`;
        }
      } else {
        const searchTerm = updateContent.trim();
        if (searchTerm) {
          agentResponse = await generateClarificationMessage('task', searchTerm);
          agentResponse += await checkForSpellingMistakes('task', searchTerm);
        } else {
          agentResponse = 'Please specify which task you want to update. For example:\n- "update task [task name] to [new content]"\n- "update task [partial name] to [new content]"';
        }
      }
  } else if (lowerCommand.startsWith('toggle task complete')) {
      const searchString = command.substring('toggle task complete'.length).trim();
      const tasks = await getTasks();
      const taskIndex = tasks.findIndex((t: any) => t.title.toLowerCase().includes(searchString.toLowerCase()));
      if (taskIndex !== -1) {
  const taskTitle = (tasks[taskIndex] as Task).title;
  await updateTask(tasks[taskIndex].id, { completed: !(tasks[taskIndex] as Task).completed });
  agentResponse = `Task "${taskTitle}" marked as ${!(tasks[taskIndex] as Task).completed ? 'completed' : 'pending'}.`;
      } else {
        agentResponse = `Task containing "${searchString}" not found.`;
      }
  } else if (lowerCommand.startsWith('delete task')) {
      const searchString = command.substring('delete task'.length).trim();
      const tasks = await getTasks();
      const taskIndexToDelete = tasks.findIndex((t: any) => t.title.toLowerCase().includes(searchString.toLowerCase()));
      if (taskIndexToDelete !== -1) {
  const deletedTaskTitle = (tasks[taskIndexToDelete] as Task).title;
  await deleteTask(tasks[taskIndexToDelete].id);
  agentResponse = `Task "${deletedTaskTitle}" deleted successfully.`;
      } else {
        agentResponse = `Task containing "${searchString}" not found.`;
      }
  } else if (lowerCommand.startsWith('create project')) {
      console.log('Creating project with command:', command);
      const projectName = command.substring('create project'.length).trim();
      console.log('Project name:', projectName);
      if (projectName) {
        const newProject: Project = { id: Date.now().toString(), name: projectName, description: '', createdAt: new Date().toISOString() };
        await addProject(newProject);
        agentResponse = `Project "${projectName}" created successfully.`;
      } else {
        agentResponse = 'Please provide a name for the project.';
        console.log('No project name provided');
      }
    } else if (lowerCommand.startsWith('list projects')) {
      const projects = await getProjects();
      if (projects.length > 0) {
        agentResponse = 'Your projects:\n' + projects.map((p: any) => `- ${p.name} - ${p.description || 'No description'}`).join('\n');
      } else {
        agentResponse = 'You have no projects.';
      }
  } else if (lowerCommand.startsWith('update project')) {
      const updateContent = command.substring('update project'.length).trim();
      const parts = updateContent.split(' to ');
      
      if (parts.length === 2) {
        const searchString = parts[0].trim();
        const newName = parts[1].trim();
        const projects = await getProjects();
        const projectIndex = projects.findIndex((p: any) => p.name.toLowerCase().includes(searchString.toLowerCase()));
        if (projectIndex !== -1) {
    const oldName = (projects[projectIndex] as Project).name;
    await updateProject(projects[projectIndex].id, { name: newName });
    agentResponse = `Project "${oldName}" updated to "${newName}".`;
        } else {
          agentResponse = `Project containing "${searchString}" not found.`
        }
      } else {
        const searchTerm = updateContent.trim();
        if (searchTerm) {
          agentResponse = await generateClarificationMessage('project', searchTerm);
          agentResponse += await checkForSpellingMistakes('project', searchTerm);
        } else {
          agentResponse = 'Please specify which project you want to update. For example:\n- "update project [project name] to [new name]"\n- "update project [partial name] to [new name]"';
        }
      }
  } else if (lowerCommand.startsWith('delete project')) {
      const searchString = command.substring('delete project'.length).trim();
      const projects = await getProjects();
      const projectIndexToDelete = projects.findIndex((p: any) => p.name.toLowerCase().includes(searchString.toLowerCase()));
      if (projectIndexToDelete !== -1) {
  const deletedProjectName = (projects[projectIndexToDelete] as Project).name;
  await deleteProject(projects[projectIndexToDelete].id);
  agentResponse = `Project "${deletedProjectName}" deleted successfully.`;
      } else {
        agentResponse = `Project containing "${searchString}" not found.`;
      }
  } else if (lowerCommand.startsWith('create note')) {
      console.log('Creating note with command:', command);
      const noteContent = command.substring('create note'.length).trim();
      console.log('Note content:', noteContent);
      if (noteContent) {
        const newNote: Note = { id: Date.now().toString(), content: noteContent, createdAt: new Date().toISOString() };
        await addNote(newNote);
        agentResponse = `Note "${noteContent}" created successfully.`;
      } else {
        agentResponse = 'Please provide content for the note.';
        console.log('No note content provided');
      }
    } else if (lowerCommand.startsWith('list notes')) {
      const notes = await getNotes();
      if (notes.length > 0) {
        agentResponse = 'Your notes:\n' + notes.map((n: any) => `- ${n.content}`).join('\n');
      } else {
        agentResponse = 'You have no notes.';
      }
  } else if (lowerCommand.startsWith('update note')) {
      const updateContent = command.substring('update note'.length).trim();
      const parts = updateContent.split(' to ');
      
      if (parts.length === 2) {
        const searchString = parts[0].trim();
        const newContent = parts[1].trim();
        const notes = await getNotes();
        const noteIndex = notes.findIndex((n: any) => n.content.toLowerCase().includes(searchString.toLowerCase()));
        if (noteIndex !== -1) {
    const oldContent = (notes[noteIndex] as Note).content;
    await updateNote(notes[noteIndex].id, { content: newContent });
    agentResponse = `Note "${oldContent}" updated to "${newContent}".`;
        } else {
          agentResponse = `Note containing "${searchString}" not found.`;
        }
      } else {
        const searchTerm = updateContent.trim();
        if (searchTerm) {
          agentResponse = await generateClarificationMessage('note', searchTerm);
          agentResponse += await checkForSpellingMistakes('note', searchTerm);
        } else {
          agentResponse = 'Please specify which note you want to update. For example:\n- "update note [note content] to [new content]"\n- "update note [partial content] to [new content]"';
        }
      }
  } else if (lowerCommand.startsWith('delete note')) {
      const searchString = command.substring('delete note'.length).trim();
      const notes = await getNotes();
      const noteIndexToDelete = notes.findIndex((n: any) => n.content.toLowerCase().includes(searchString.toLowerCase()));
      if (noteIndexToDelete !== -1) {
  const deletedNoteContent = (notes[noteIndexToDelete] as Note).content;
  await deleteNote(notes[noteIndexToDelete].id);
  agentResponse = `Note "${deletedNoteContent}" deleted successfully.`;
      } else {
        agentResponse = `Note containing "${searchString}" not found.`;
      }
  } else if (lowerCommand.startsWith('create idea')) {
      console.log('Creating idea with command:', command);
      const ideaContent = command.substring('create idea'.length).trim();
      console.log('Idea content:', ideaContent);
      if (ideaContent) {
        const newIdea: Idea = { id: Date.now().toString(), content: ideaContent, createdAt: new Date().toISOString() };
        await addIdea(newIdea);
        agentResponse = `Idea "${ideaContent}" created successfully.`;
      } else {
        agentResponse = 'Please provide content for the idea.';
        console.log('No idea content provided');
      }
    } else if (lowerCommand.startsWith('list ideas')) {
      const ideas = await getIdeas();
      if (ideas.length > 0) {
        agentResponse = 'Your ideas:\n' + ideas.map((i: any) => `- ${i.content}`).join('\n');
      } else {
        agentResponse = 'You have no ideas.';
      }
  } else if (lowerCommand.startsWith('update idea')) {
      const updateContent = command.substring('update idea'.length).trim();
      const parts = updateContent.split(' to ');
      
      if (parts.length === 2) {
        const searchString = parts[0].trim();
        const newContent = parts[1].trim();
        const ideas = await getIdeas();
        const ideaIndex = ideas.findIndex((i: any) => i.content.toLowerCase().includes(searchString.toLowerCase()));
        if (ideaIndex !== -1) {
    const oldContent = (ideas[ideaIndex] as Idea).content;
    await updateIdea(ideas[ideaIndex].id, { content: newContent });
    agentResponse = `Idea "${oldContent}" updated to "${newContent}".`;
        } else {
          agentResponse = `Idea containing "${searchString}" not found.`;
        }
      } else {
        const searchTerm = updateContent.trim();
        if (searchTerm) {
          agentResponse = await generateClarificationMessage('idea', searchTerm);
          agentResponse += await checkForSpellingMistakes('idea', searchTerm);
        } else {
          agentResponse = 'Please specify which idea you want to update. For example:\n- "update idea [idea content] to [new content]"\n- "update idea [partial content] to [new content]"';
        }
      }
  } else if (lowerCommand.startsWith('delete idea')) {
      const searchString = command.substring('delete idea'.length).trim();
      const ideas = await getIdeas();
      const ideaIndexToDelete = ideas.findIndex((i: any) => i.content.toLowerCase().includes(searchString.toLowerCase()));
      if (ideaIndexToDelete !== -1) {
  const deletedIdeaContent = (ideas[ideaIndexToDelete] as Idea).content;
  await deleteIdea(ideas[ideaIndexToDelete].id);
  agentResponse = `Idea "${deletedIdeaContent}" deleted successfully.`;
      } else {
        agentResponse = `Idea containing "${searchString}" not found.`;
      }
    } else {
      agentResponse = 'Available commands:\n\nTasks:\n- create task [task name]\n- list tasks\n- update task [old content] to [new content]\n- toggle task complete [task name]\n- delete task [task name]\n\nProjects:\n- create project [project name]\n- list projects\n- update project [old name] to [new name]\n- delete project [project name]\n\nNotes:\n- create note [note content]\n- list notes\n- update note [old content] to [new content]\n- delete note [note content]\n\nIdeas:\n- create idea [idea content]\n- list ideas\n- update idea [old content] to [new content]\n- delete idea [idea content]';
    }

  triggerRefresh(); // Trigger a refresh to update UI for lists
  return agentResponse;
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    console.log('handleSendMessage called with input:', inputMessage);
    console.log('Current mode:', currentMode);

    const newUserMessage: ChatMessage = { role: 'user', content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    let assistantResponseContent: string;

    if (currentMode === 'agent') {
      console.log('Using agent mode');
      assistantResponseContent = await handleAgentCommand(inputMessage);
      console.log('Agent response:', assistantResponseContent);
    } else {
      console.log('Using chat mode');
      // Chat mode - send to Gemini API with user data context
      try {
        // Get current user data for context
        const [tasks, projects, notes, ideas] = await Promise.all([
          getTasks(),
          getProjects(),
          getNotes(),
          getIdeas()
        ]);
        const userData = { tasks, projects, notes, ideas };
        const response = await sendChatMessage(inputMessage, "chat", userData);
        assistantResponseContent = response;
      } catch (error) {
        console.error('Error sending message to Gemini API:', error);
        assistantResponseContent = 'Sorry, I could not get a response from the AI.';
      }
    }

    const newAssistantMessage: ChatMessage = { role: 'assistant', content: assistantResponseContent };
    setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
    setIsLoading(false);
  };

  const toggleMode = () => {
    setCurrentMode((prevMode) => (prevMode === 'chat' ? 'agent' : 'chat'));
    setMessages([]); // Clear messages when switching modes
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
  <div className="flex flex-col h-full bg-[#1A1A1A] text-white rounded-lg shadow-lg w-full flex-grow">
      {/* User Info Bar */}
      <div className="flex items-center justify-between p-3 border-b border-[#333333] bg-[#18181b]">
        <div className="flex items-center space-x-3">
          {/* Vectal.ai Logo */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L100 25L50 50L0 25L50 0Z" fill="white"/>
              <path d="M50 50L100 25L100 75L50 100L0 75L0 25L50 50Z" fill="#333333"/>
            </svg>
          </div>
          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">User</span>
        </div>
        {/* <button // Disabled auth
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xs"
        >
          Logout
        </button> */}
      </div>
  <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.length === 0 ? (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <div className="mb-4">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0L100 25L50 50L0 25L50 0Z" fill="white"/>
                <path d="M50 50L100 25L100 75L50 100L0 75L0 25L50 50Z" fill="#333333"/>
              </svg>
            </div>
            <p className="text-xl text-white mb-8">What can I help with?</p>
            <div className="flex flex-col space-y-4">
              <Button variant="secondary" className="bg-[#333333] text-white rounded-full py-3 px-6 border border-[#444444] hover:bg-[#444444]" onClick={() => setInputMessage('help me with the vbn task')}>help me with the vbn task</Button>
              <Button variant="secondary" className="bg-[#333333] text-white rounded-full py-3 px-6 border border-[#444444] hover:bg-[#444444]" onClick={() => setInputMessage('let\'s work on the cvbn task')}>let's work on the cvbn task</Button>
              <Button variant="secondary" className="bg-[#333333] text-white rounded-full py-3 px-6 border border-[#444444] hover:bg-[#444444]" onClick={() => setInputMessage('research next steps for fghj task')}>research next steps for fghj task</Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="relative group max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#333333] text-white rounded-br-none'
                        : 'bg-[#444444] text-white rounded-bl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#222]"
                    title="Copy to Clipboard"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/></svg>
                  </button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-[#1A1A1A] border-t border-[#333333] flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow p-3 rounded-full bg-[#2C2C2C] text-white placeholder-[#888888] border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
          placeholder="Message Vectal..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <div className="flex items-center space-x-2">
          {/* Voice Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#333333] text-[#888888]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <button
            onClick={handleSendMessage}
            className="bg-[#333333] text-white p-3 rounded-full focus:outline-none hover:bg-[#444444] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between p-2 bg-[#1A1A1A] border-t border-[#333333] text-xs text-[#888888] relative">
        <div className="flex items-center space-x-1 relative">
          <span className="h-2 w-2 bg-[#2563EB] rounded-full"></span>
          <button
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-[#232323] focus:outline-none"
            onClick={() => setShowModelDropdown((v) => !v)}
          >
            <span>{selectedModel}</span>
            <svg className={`w-3 h-3 ml-1 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {showModelDropdown && (
            <div className="absolute bottom-8 left-0 mb-2 w-48 bg-[#232323] border border-[#333] rounded-lg shadow-lg z-50 animate-fadeInUp">
              {models.map((model) => (
                <div
                  key={model.name}
                  className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                    model.locked ? 'text-gray-500 cursor-not-allowed opacity-60' : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => {
                    if (!model.locked) {
                      setSelectedModel(model.name);
                      setShowModelDropdown(false);
                    }
                  }}
                >
                  <span className="flex-1">{model.name}</span>
                  {model.locked && (
                    <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2zm6-2V9a6 6 0 10-12 0v6a2 2 0 002 2h8a2 2 0 002-2z"/></svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={toggleMode} variant="secondary" className="px-3 py-1 rounded-md bg-[#333333] text-white border border-[#444444] text-xs h-8">
            {currentMode === 'chat' ? 'Chat' : 'Agent'} Mode
          </Button>
          {/* Ultra Search Icon */}
          <button
            onClick={() => setCurrentMode('deep-research')}
            className="p-2 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition"
            title="Ultra Search (Deep Research)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Ultra Search Modal */}
        {currentMode === 'deep-research' && (
          <div className="mb-4 p-3 bg-white/10 border border-white rounded text-white flex items-center space-x-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span>Ultra Search: Deep Research Mode Active</span>
          </div>
        )}
    </div>
  );
};

export default ChatScreen;