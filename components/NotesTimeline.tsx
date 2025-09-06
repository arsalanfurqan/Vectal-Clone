import React, { useState, useEffect } from 'react';
import { Note, getNotes, addNote, updateNote, deleteNote } from '../utils/storage';
import Card from './UI/Card';
import Button from './UI/Button';
import { useRefresh } from '../contexts/RefreshContext';
import { Plus, Pencil, Copy, Trash2, ChevronDown, ArrowRight } from 'lucide-react'; // Added icons for consistency and new UI elements
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { searchItems } from '../utils/search';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface NoteCreationCardProps {
  onClose: () => void;
  onNoteCreated: () => void;
  setNotesState: React.Dispatch<React.SetStateAction<Note[]>>;
}

interface NoteEditCardProps {
  onClose: () => void;
  onNoteUpdated: () => void;
  note: Note;
  setNotesState: React.Dispatch<React.SetStateAction<Note[]>>;
}
const NoteCreationCard: React.FC<NoteCreationCardProps> = ({ onClose, onNoteCreated, setNotesState }) => {
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (!content.trim()) return;
    const newNote: Omit<Note, 'id'> = {
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    await addNote(newNote as Note);
    // Always fetch notes after creation to get correct Firestore IDs
    const notes = await getNotes();
    setNotesState(notes as Note[]);
    onNoteCreated();
    onClose();
  };

  return (
  <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-black border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Create New Note</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="Note Content..."
        theme="snow"
        style={{ background: '#000', color: '#eee', borderRadius: 8 }}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleCreate}>Create Note</Button>
      </div>
    </Card>
  );
};
const NoteEditCard: React.FC<NoteEditCardProps> = ({ onClose, onNoteUpdated, note, setNotesState }) => {
  const [content, setContent] = useState(note.content);

  const handleUpdate = async () => {
    if (!content.trim()) return;
    if (!note.id) {
      throw new Error('Note id is undefined');
    }
    await updateNote(note.id, { content: content.trim() });
    const notes = await getNotes();
    setNotesState(notes as Note[]);
    onNoteUpdated();
    onClose();
  };
  // ...existing code...

  return (
  <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-black border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Edit Note</h2>
        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="Note Content..."
        theme="snow"
        style={{ background: '#000', color: '#eee', borderRadius: 8 }}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleUpdate}>Update Note</Button>
        <Button
          variant="ghost"
          onClick={async () => {
            const confirmDelete = window.confirm(`Are you sure you want to delete note?`);
            if (confirmDelete) {
              if (note.id) {
                await deleteNote(note.id);
                const notes = await getNotes();
                setNotesState(notes as Note[]);
                onNoteUpdated();
                onClose();
              } else {
                alert('Error: Note id is undefined and cannot be deleted.');
              }
            }
          }}
          className="text-red-500 hover:bg-red-900/20 px-4 py-2 rounded-lg"
        >
          Delete Note
        </Button>
      </div>
    </Card>
  );
};

const NotesTimeline: React.FC = () => {
  const [notes, setNotesState] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshKey } = useRefresh();

  useEffect(() => {
    (async () => {
      const notes = await getNotes();
  setNotesState(notes as Note[]);
    })();
  }, [refreshKey]);

  const handleNoteCreated = async () => {
    const notes = await getNotes();
  setNotesState(notes as Note[]);
  };

  const handleNoteUpdated = async () => {
    const notes = await getNotes();
  setNotesState(notes as Note[]);
    setEditingNote(null);
  };

  const handleAddNoteFromInput = async () => {
    if (newNoteContent.trim()) {
      const newNote: Omit<Note, 'id'> = {
        content: newNoteContent.trim(),
        createdAt: new Date().toISOString(),
      };
      await addNote(newNote as Note);
      const notes = await getNotes();
      setNotesState(notes as Note[]);
      setNewNoteContent('');
    }
  };

  const handleDeleteNote = async (id: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this note?`);
    if (confirmDelete) {
      const existingNotes = await getNotes();
      const updatedNotes = existingNotes.filter(note => note.id !== id);
  setNotesState(updatedNotes as Note[]);
    }
  };

  const handleCopyNote = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Note copied to clipboard!');
  };

  // Filter notes by search
  const filteredNotes = searchItems(notes, searchQuery);

  const groupNotesByDate = (notesToGroup: Note[]) => {
    const groups: { [key: string]: Note[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure notesToGroup is always an array
    notesToGroup = Array.isArray(notesToGroup) ? notesToGroup : Object.values(notesToGroup || {});

    notesToGroup.forEach(note => {
      const noteDate = new Date(note.createdAt);
      noteDate.setHours(0, 0, 0, 0);

      let dateKey: string;
      if (noteDate.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else {
        dateKey = noteDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });

    return groups;
  };

  const sortedNoteGroups = Object.entries(groupNotesByDate(filteredNotes)).sort(([dateA], [dateB]) => {
    if (dateA === 'Today') return -1;
    if (dateB === 'Today') return 1;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="flex flex-col items-center w-full px-4" style={{ background: '#000', minHeight: '100vh' }}>


      <div className="w-full max-w-2xl mx-auto py-4"> {/* Added py-4 for vertical padding */}
        {/* Main Timeline Container */}
        <div className="relative pl-6"> {/* Adjusted padding-left for timeline line */}
          {/* Vertical timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-[#333333]"></div>

          {/* Upcoming Section */}
          <div className="relative mb-6">
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-[#222222]"></div>
            <h2 className="text-base font-semibold text-gray-200 ml-4 flex items-center">
              Upcoming <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
            </h2>
          </div>

          {/* Today Section */}
          <div className="relative mb-6">
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-[#222222]"></div>
            <h2 className="text-base font-semibold text-gray-200 ml-4 flex items-center space-x-2">
              <span>Today</span>
              <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-xs rounded-full">{notes.filter(note => new Date(note.createdAt).toDateString() === new Date().toDateString()).length}</span>
              <span>all notes</span> <ChevronDown className="w-4 h-4 text-gray-500" />
            </h2>
            {/* Add Note Input within Today section */}
            <div className="mt-4 ml-4 w-full bg-black border border-[#333333] rounded-lg py-2 px-4 flex items-center space-x-2 shadow-sm">
              <input
                type="text"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNoteFromInput()}
                placeholder="Add a new note..."
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none border-none shadow-none"
                style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Dated Notes - Refactored to match image */}
          {sortedNoteGroups.map(([date, dateNotes]) => (
            <div key={date} className="relative mb-6">
              {date !== 'Today' && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-[#222222]"></div>
                  <h2 className="text-base font-semibold text-gray-200 ml-4 mb-2">{date}</h2>
                </>
              )}
              <div className="space-y-3 ml-4"> {/* Indent notes */}
                {dateNotes.map(note => (
                  <div key={note.id} className="relative flex items-center group">
                    {/* Thinner vertical line for timeline */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[#222] ml-[-27px] z-0" style={{height: '100%'}}></div>
                    {/* White circle for timeline node */}
                    <div className="w-3 h-3 bg-white rounded-full border border-[#222222] z-10 ml-[-34px] mr-2"></div>
                    <Card
                      className="flex-1 p-4 rounded-lg bg-[#2a2a2a] shadow-sm flex flex-col cursor-pointer ml-0"
                      onClick={() => setEditingNote(note)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-gray-200 text-base flex-1" dangerouslySetInnerHTML={{ __html: note.content }} />
                        <div className="flex items-center space-x-2 text-gray-400">
                          {/* Placeholder for recurring info if needed */}
                          {note.content.includes('jk') && (
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <span>Every 13th day</span> <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCopyNote(note.content); }} className="text-gray-400 hover:text-gray-200 p-1">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingNote(note); }} className="text-gray-400 hover:text-gray-200 p-1">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (note.id) {
                                handleDeleteNote(note.id);
                              } else {
                                alert('Error: Note id is undefined and cannot be deleted.');
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State - Only if no notes at all */}
          {notes.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg text-center h-[300px]">
              <p className="text-xl font-semibold text-gray-200 mb-2">Your note inbox is empty</p>
              <p className="text-gray-400 mb-4">Add your first note to get started</p>
              {/* This button could trigger the input field focus, or simply add a note */}
              <Button variant="primary" onClick={handleAddNoteFromInput}
                className="bg-[#333333] text-white hover:bg-[#444444] px-6 py-2 rounded-lg shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Note
              </Button>
            </div>
          )}

        </div>
      </div>
      {/* Modals for editing existing notes */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <NoteEditCard
            onClose={() => setEditingNote(null)}
            onNoteUpdated={handleNoteUpdated}
            note={editingNote}
            setNotesState={setNotesState}
          />
        </div>
      )}

      {/* Modal for creating a new note (example usage, add your own trigger logic) */}
      {/* 
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <NoteCreationCard
            onClose={() => setShowCreateModal(false)}
            onNoteCreated={handleNoteCreated}
            setNotesState={setNotesState}
          />
        </div>
      )}
      */}
    </div>
  );
}
export default NotesTimeline;