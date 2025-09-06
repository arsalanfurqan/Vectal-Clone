import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { searchSessionData } from '../utils/session';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { searchItems } from '../utils/search';
import SidebarNotesSearch from './UI/SidebarNotesSearch';


const navigation = [
  { name: 'Tasks', href: '/tasks', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )},
  { name: 'Projects', href: '/projects', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )},
  { name: 'Ideas', href: '/ideas', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )},
  { name: 'Notes', href: '/', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )},
  { name: 'Search', href: '#', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )},
];

const Sidebar = () => {
  // Profile modal state and logic
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogoutSidebar = async () => {
    setLoggingOut(true);
    const { logout } = await import('../utils/logout');
    await logout();
    setLoggingOut(false);
    window.location.reload(); // Force UI update after logout
  };
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('profile');
      if (saved) return JSON.parse(saved);
    }
    return { name: '', email: '', theme: 'system', apiKey: '' };
  });
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => {
      const updated = { ...prev, [name]: value };
      if (typeof window !== 'undefined') localStorage.setItem('profile', JSON.stringify(updated));
      return updated;
    });
  };
  const router = useRouter();

  // Session logic

  // Session state
  const { startNewSession, sessionId, setSessionId } = useSession ? useSession() : { startNewSession: () => {}, sessionId: '', setSessionId: () => {} };
  const [sessionQuery, setSessionQuery] = useState('');
  const [sessionResults, setSessionResults] = useState<any[]>([]);

  // Save session to localStorage on new session
  const saveSessionToLocalStorage = (id: string, data: any) => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    sessions[id] = data;
    localStorage.setItem('sessions', JSON.stringify(sessions));
  };

  // Search all sessions in localStorage
  const handleSessionSearch = () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    const results = Object.entries(sessions)
      .filter(([id, data]) => JSON.stringify(data).toLowerCase().includes(sessionQuery.toLowerCase()))
      .map(([id, data]) => ({ id, data }));
    setSessionResults(results);
  };

  // Resume session by id
  const resumeSession = (id: string) => {
    setSessionId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSessionId', id);
    }
  };

  // Global search logic
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<any>({ notes: [], projects: [], ideas: [], tasks: [] });
  const handleGlobalSearch = (query: string) => {
    setGlobalQuery(query);
    if (!query) {
      setGlobalResults({ notes: [], projects: [], ideas: [], tasks: [] });
      return;
    }
    // Get all items from localStorage
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const ideas = JSON.parse(localStorage.getItem('ideas') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setGlobalResults({
      notes: searchItems(notes, query),
      projects: searchItems(projects, query),
      ideas: searchItems(ideas, query),
      tasks: searchItems(tasks, query)
    });
  };

  // ...existing code...



  return (
  <div className="fixed top-0 right-0 h-screen w-16 flex flex-col justify-between items-center bg-black py-4 z-50" style={{ background: '#000', right: 0, marginRight: 0, paddingRight: 0 }}>
      {/* Top: Navigation icons only, no text */}
      <div className="flex flex-col gap-4 items-center w-full">
        {navigation.map((item, idx) => {
          const isActive = router.pathname === item.href;
          if (item.name === 'Search') {
            return (
              <button
                key={item.name}
                className="flex items-center justify-center w-12 h-12 rounded-lg transition-all text-white hover:bg-[#232323]"
                title="Search"
                onClick={() => setShowGlobalSearch(true)}
              >
                <span className="flex items-center justify-center w-6 h-6 text-white">{item.icon}</span>
              </button>
            );
          }
          return (
            <Link href={item.href} legacyBehavior key={item.name}>
              <a
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all text-white ${isActive ? 'bg-[#232323]' : 'hover:bg-[#232323]'}`}
                title={item.name}
              >
                <span className="flex items-center justify-center w-6 h-6 text-white">{item.icon}</span>
              </a>
            </Link>
          );
        })}
        {/* Logout Button */}
        <button
          onClick={handleLogoutSidebar}
          className="flex items-center justify-center w-12 h-12 rounded-lg transition-all text-black bg-white border border-white mt-8"
          title="Logout"
          disabled={loggingOut}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>



  <div className="flex-1" />

      {/* Global Search Modal */}
      {showGlobalSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button onClick={() => setShowGlobalSearch(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
            <input
              type="text"
              value={globalQuery}
              onChange={e => handleGlobalSearch(e.target.value)}
              placeholder="Search notes, projects, ideas, tasks..."
              className="w-full p-3 mb-4 bg-black text-white rounded border border-[#333] focus:outline-none focus:border-white"
              autoFocus
            />
            <div className="max-h-80 overflow-y-auto space-y-4">
              {['notes','projects','ideas','tasks'].map(type => (
                <div key={type}>
                  <h3 className="text-white text-xs uppercase mb-1">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                  {globalResults[type].length === 0 ? (
                    <div className="text-gray-500 text-xs mb-2">No results</div>
                  ) : (
                    <ul className="space-y-1">
                      {globalResults[type].map((item: any, idx: number) => (
                        <li key={item.id || idx} className="bg-black rounded px-2 py-1 text-gray-200 text-sm truncate">
                          {item.title || item.name || item.content || JSON.stringify(item)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-lg font-bold text-white mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white mb-1">Name</label>
                <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full p-2 rounded bg-[#181818] text-white border border-[#333]" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Email</label>
                <input name="email" value={profile.email} onChange={handleProfileChange} className="w-full p-2 rounded bg-[#181818] text-white border border-[#333]" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Theme</label>
                <select name="theme" value={profile.theme} onChange={handleProfileChange} className="w-full p-2 rounded bg-[#181818] text-white border border-[#333]">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">API Key (placeholder)</label>
                <input name="apiKey" value={profile.apiKey} onChange={handleProfileChange} className="w-full p-2 rounded bg-[#181818] text-white border border-[#333]" placeholder="••••••••••" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowProfile(false)} className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;