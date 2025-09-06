const GEMINI_API_KEY = 'AIzaSyA5W9dauwnu1q1RwRSvtYIgVj8rZo2JXO4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (
  message: string,
  mode: 'chat' | 'agent',
  userData?: {
    tasks?: any[];
    projects?: any[];
    notes?: any[];
    ideas?: any[];
  }
): Promise<string> => {
  try {
    const requestBody: any = {
      messages: [{
        role: 'user',
        content: message
      }],
      mode: mode
    };

    if (mode === 'chat' && userData) {
      let contextString = '';
      if (userData.tasks && userData.tasks.length > 0) {
        contextString += `\n\nUser's current tasks: ${JSON.stringify(userData.tasks)}`;
      }
      if (userData.projects && userData.projects.length > 0) {
        contextString += `\n\nUser's current projects: ${JSON.stringify(userData.projects)}`;
      }
      if (userData.notes && userData.notes.length > 0) {
        contextString += `\n\nUser's current notes: ${JSON.stringify(userData.notes)}`;
      }
      if (userData.ideas && userData.ideas.length > 0) {
        contextString += `\n\nUser's current ideas: ${JSON.stringify(userData.ideas)}`;
      }

      if (contextString) {
        requestBody.messages[0].content = `User's context:\n${contextString}\n\nUser's query: ${message}`;
      }
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chat API');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendAgentMessage = async (message: string, context: string, mode: 'chat' | 'agent'): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Context: ${context}\n\nUser: ${message}`
        }],
        mode: mode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chat API');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}; 