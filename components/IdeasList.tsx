import React, { useState, useEffect } from 'react';
import { Idea, Note, Project, getIdeas, addIdea, updateIdea, deleteIdea, getNotes, addNote, getProjects, addProject } from '../utils/storage';
import Card from './UI/Card';
import Button from './UI/Button';
import { useRefresh } from '../contexts/RefreshContext';
import { Plus, Copy, Trash2, ArrowUp, Pencil, FileText, FolderPlus, PlusCircle } from 'lucide-react';
import { convertIdeaToNote, convertIdeaToProject, createFromIdea } from '../utils/ideaConversion';

interface IdeaCreationCardProps {
  onClose: () => void;
  onIdeaCreated: () => void;
}

interface IdeaEditCardProps {
  onClose: () => void;
  onIdeaUpdated: () => void;
  idea: Idea;
}

const IdeaCreationCard: React.FC<IdeaCreationCardProps> = ({ onClose, onIdeaCreated }) => {
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (!content.trim()) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    await addIdea(newIdea);
    onIdeaCreated();
    onClose();
  };

  return (
  <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-black border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Create New Idea</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Idea Content..."
        className="w-full px-4 py-2 bg-black border border-[#444444] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#555555] min-h-[100px] resize-y"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleCreate}>Create Idea</Button>
      </div>
    </Card>
  );
};

const IdeaEditCard: React.FC<IdeaEditCardProps> = ({ onClose, onIdeaUpdated, idea }) => {
  const [content, setContent] = useState(idea.content);

  const handleUpdate = async () => {
    if (!content.trim()) return;
    const updatedIdea: Idea = {
      ...idea,
      content: content.trim(),
    };
    const ideas = await getIdeas();
    const exists = ideas.find(i => i.id === updatedIdea.id);
    if (exists && updatedIdea.id) {
      await updateIdea(updatedIdea.id, updatedIdea);
      onIdeaUpdated();
      onClose();
    } else {
      alert('Idea does not exist or has no ID. Cannot update.');
    }
  };

  return (
    <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Edit Idea</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Idea Content..."
        className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#555555] min-h-[100px] resize-y"
      />
      <div className="flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={async () => {
            const confirmDelete = window.confirm(`Are you sure you want to delete this idea?`);
            if (confirmDelete && idea.id) {
              await deleteIdea(idea.id);
              onIdeaUpdated();
              onClose();
            }
                    if (idea.id) {
                      await deleteIdea(idea.id);
                    }
                    if (idea.id) {
                      await deleteIdea(idea.id);
                    }
                    if (idea.id) {
                      await deleteIdea(idea.id);
                    }
          }}
          className="text-red-500 hover:bg-red-900/20 mr-2 px-4 py-2 rounded-lg"
        >
          Delete Idea
        </Button>
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};

const IdeasList: React.FC = () => {
  const [ideas, setIdeasState] = useState<Idea[]>([]);
  const [inputIdeaContent, setInputIdeaContent] = useState('');
  const [showCreationCard, setShowCreationCard] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const { refreshKey, triggerRefresh } = useRefresh();

  useEffect(() => {
    (async () => {
      const ideas = await getIdeas();
      setIdeasState((ideas as Idea[]).filter(i => i.id && i.content && i.createdAt));
    })();
  }, [refreshKey]);

  const handleAddIdeaFromInput = async () => {
    if (!inputIdeaContent.trim()) return;
    const newIdea = {
      content: inputIdeaContent.trim(),
      createdAt: new Date().toISOString(),
    };
    await addIdea(newIdea);
    setInputIdeaContent('');
    const updatedIdeas = await getIdeas();
    setIdeasState((updatedIdeas as Idea[]).filter(i => i.id && i.content && i.createdAt));
  };

  const handleDeleteIdea = async (id: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this idea?`);
    if (confirmDelete) {
  await deleteIdea(id);
  const refreshedIdeas = await getIdeas();
  setIdeasState((refreshedIdeas as Idea[]).filter(i => i.id && i.content && i.createdAt));
    }
  };

  const handleIdeaCreated = () => {
    (async () => {
      const ideas = await getIdeas();
      setIdeasState((ideas as Idea[]).filter(i => i.id && i.content && i.createdAt));
    })();
  };

  const handleIdeaUpdated = () => {
    (async () => {
      const ideas = await getIdeas();
      setIdeasState((ideas as Idea[]).filter(i => i.id && i.content && i.createdAt));
      setEditingIdea(null);
    })();
  };

  const handleCopyIdea = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Idea copied to clipboard!');
  };

  return (
  <div className="flex flex-col items-center w-full px-4" style={{ background: '#000', minHeight: '100vh' }}>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-2xl font-semibold text-gray-200">Idea Inbox <span className="text-gray-500 text-base font-normal ml-2">{ideas.length}</span></h1>
          <Button
            onClick={() => {}}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
          >
            <Pencil className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center space-x-2 shadow-sm">
          <input
            type="text"
            value={inputIdeaContent}
            onChange={(e) => setInputIdeaContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddIdeaFromInput()}
            placeholder="Add a new idea..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <Button
            onClick={handleAddIdeaFromInput}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 p-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {ideas.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center p-8 bg-black border border-[#333333] rounded-lg shadow-lg text-center h-[300px]">
            <p className="text-xl font-semibold text-gray-200 mb-2">Your idea inbox is empty</p>
            <p className="text-gray-400 mb-4">Add your first idea to get started</p>
            <Button variant="primary" onClick={() => handleAddIdeaFromInput()}
              className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-lg shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Idea
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {ideas.map(idea => (
              <Card
                key={idea.id}
                className="p-4 rounded-lg bg-black shadow-sm flex items-center justify-between cursor-pointer"
                onClick={() => setEditingIdea(idea)}
              >
                <p className="text-gray-200 text-base flex-1">{idea.content}</p>
                <div className="flex items-center space-x-2">
                  {/* Convert to Note */}
                  <Button variant="ghost" size="sm" onClick={async e => {
                    e.stopPropagation();
                    await addNote({ content: idea.content, createdAt: new Date().toISOString() });
                    if (idea.id) await deleteIdea(idea.id);
                    const updatedIdeas = await getIdeas();
                    setIdeasState((updatedIdeas as Idea[]).filter(i => i.id && i.content && i.createdAt));
                    triggerRefresh();
                  }} className="text-blue-400 hover:text-blue-600 p-1" title="Convert to Note">
                    <FileText className="w-4 h-4" />
                  </Button>
                  {/* Convert to Project */}
                  <Button variant="ghost" size="sm" onClick={async e => {
                    e.stopPropagation();
                    try {
                      await addProject({
                        name: idea.content,
                        description: '',
                        createdAt: new Date().toISOString(),
                        context: 'Converted from idea',
                        excludeUserContext: false,
                        color: '#007bff',
                      });
                      alert('Project created successfully!');
                    } catch (err) {
                      alert('Error creating project.');
                    }
                    if (idea.id) await deleteIdea(idea.id);
                    const updatedIdeas = await getIdeas();
                    setIdeasState((updatedIdeas as Idea[]).filter(i => i.id && i.content && i.createdAt));
                    triggerRefresh();
                  }} className="text-green-400 hover:text-green-600 p-1" title="Convert to Project">
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                  {/* Create (generic) */}
                  <Button variant="ghost" size="sm" onClick={async e => {
                    e.stopPropagation();
                    await addNote({ content: idea.content, createdAt: new Date().toISOString() });
                    if (idea.id) await deleteIdea(idea.id);
                    const updatedIdeas = await getIdeas();
                    setIdeasState((updatedIdeas as Idea[]).filter(i => i.id && i.content && i.createdAt));
                    triggerRefresh();
                  }} className="text-purple-400 hover:text-purple-600 p-1" title="Create">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                  {/* Copy, Edit, Delete */}
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCopyIdea(idea.content); }} className="text-gray-400 hover:text-gray-200 p-1">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingIdea(idea); }} className="text-gray-400 hover:text-gray-200 p-1">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); if (idea.id) handleDeleteIdea(idea.id); }} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

        {showCreationCard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <IdeaCreationCard
            onClose={() => setShowCreationCard(false)}
            onIdeaCreated={handleIdeaCreated}
          />
        </div>
      )}

        {editingIdea && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <IdeaEditCard
            onClose={() => setEditingIdea(null)}
            onIdeaUpdated={handleIdeaUpdated}
            idea={editingIdea}
          />
        </div>
      )}
    </div>
  );
};

export default IdeasList; 