import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import { getTasks, getProjects, getNotes, getIdeas } from '../utils/storage';
import { ChatMessage, sendAgentMessage } from '../utils/ai';
import Card from './UI/Card';
import Button from './UI/Button';
import { getAgenticMode } from '../utils/agentic';

const AgentScreen: React.FC = () => {
  const { sessionId } = useSession();
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<{ tasks: any[]; projects: any[]; notes: any[]; ideas: any[] }>({ tasks: [], projects: [], notes: [], ideas: [] });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset agent data when user or session changes
  useEffect(() => {
    setMessages([]);
    setInputMessage('');
    setContext('');
    // Fetch user-specific data
    const fetchUserData = async () => {
      if (user?.uid) {
        // Filter by user if needed, assuming each item has a userId field
        const [tasks, projects, notes, ideas] = await Promise.all([
          getTasks(),
          getProjects(),
          getNotes(),
          getIdeas()
        ]);
        setUserData({
          tasks: tasks.filter((t: any) => t.userId === user.uid),
          projects: projects.filter((p: any) => p.userId === user.uid),
          notes: notes.filter((n: any) => n.userId === user.uid),
          ideas: ideas.filter((i: any) => i.userId === user.uid)
        });
      } else {
        setUserData({ tasks: [], projects: [], notes: [], ideas: [] });
      }
    };
    fetchUserData();
  }, [user?.uid, sessionId]);

  // Reset agent data when user or session changes
  useEffect(() => {
    setMessages([]);
    setInputMessage('');
    setContext('');
  }, [user?.uid, sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Pass userData to agent for context
      const response = await sendAgentMessage(
        userMessage.content,
        JSON.stringify({ context, ...userData }),
        'agent'
      );
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  // Agentic mode detection
  const agenticMode = getAgenticMode(inputMessage + ' ' + context);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Enter context for the AI agent..."
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
        />
        {/* Agentic mode indicator */}
        {agenticMode === 'agentic' && (
          <span className="ml-4 px-2 py-1 bg-green-700 text-white text-xs rounded">Agentic Mode</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card
            key={index}
            variant={message.role === 'user' ? 'elevated' : 'bordered'}
            className={`max-w-[80%] ${
              message.role === 'user' ? 'ml-auto bg-blue-600' : 'mr-auto'
            }`}
          >
            <div className="flex items-start space-x-2">
              <span className="text-xl">
                {message.role === 'user' ? '👤' : '🤖'}
              </span>
              <p className="text-white whitespace-pre-wrap">{message.content}</p>
            </div>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSendMessage} isLoading={isLoading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentScreen; 