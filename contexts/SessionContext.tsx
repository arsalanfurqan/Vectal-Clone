import React, { createContext, useContext, useState } from 'react';

interface SessionContextType {
  sessionId: string;
  startNewSession: () => void;
  setSessionId: (id: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState(() => {
    // Try to load last session from localStorage
    if (typeof window !== 'undefined') {
      const last = localStorage.getItem('lastSessionId');
      if (last) return last;
    }
    return Date.now().toString();
  });

  const startNewSession = () => {
    const newId = Date.now().toString();
    setSessionId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastSessionId', newId);
      // Save a blank session to localStorage
      const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
      sessions[newId] = { created: new Date().toISOString(), data: {} };
      localStorage.setItem('sessions', JSON.stringify(sessions));
    }
    sessionStorage.clear();
  };

  return (
    <SessionContext.Provider value={{ sessionId, startNewSession, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};
