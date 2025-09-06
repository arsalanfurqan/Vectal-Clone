import type { NextApiRequest, NextApiResponse } from 'next';
// No longer import localStorage utilities on the server-side
// import { Task, Project, Note, Idea, getTasks, setTasks, getProjects, setProjects, getNotes, setNotes, getIdeas, setIdeas } from '../../utils/storage';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA5W9dauwnu1q1RwRSvtYIgVj8rZo2JXO4';
const MODEL = 'gemini-2.0-flash'; // Using the latest flash model

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

const validateResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Invalid JSON response');
  }
  return response.json();
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, mode } = req.body; // 'chat' or 'agent'

  if (!messages || !Array.isArray(messages) || messages.some((msg: any) => typeof msg.role !== 'string' || typeof msg.content !== 'string')) {
    return res.status(400).json({ error: 'Invalid messages format: Each message must have a string role and content' });
  }

  // Remove agent mode logic from server-side as it now runs on client-side (ChatScreen.tsx)
  if (mode === 'agent') {
    return res.status(200).json({ response: 'Agent commands are now handled directly on the client-side.' });
  }

  // --- Chat Mode Logic (existing) ---
  try {
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: GeminiResponse = await validateResponse(response) as GeminiResponse;

    let responseMessage = '';

    if (data.error) {
      if (data.error.code === 404 && data.error.message.includes('models/gemini-pro is not found')) {
        responseMessage = "It looks like the AI model is not accessible. This might be a temporary issue or a configuration problem. Please try again later or check your API key and model settings.";
      } else {
        responseMessage = `Error from AI: ${data.error.message || 'Unknown error'}`;
      }
    } else if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts && data.candidates[0].content.parts.length > 0) {
      responseMessage = data.candidates[0].content.parts[0].text || 'No response text.';
    } else {
      responseMessage = 'I could not get a response from the AI model.';
    }

    return res.status(200).json({ response: responseMessage });
  } catch (error) {
    res.status(500).json({ error: 'AI chat error' });
  }
}

export default handler; 