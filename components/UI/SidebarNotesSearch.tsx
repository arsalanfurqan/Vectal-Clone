import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchItems } from '../../utils/search';

const SidebarNotesSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      setResults(searchItems(notes, query));
    } else {
      setResults([]);
    }
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div className="relative mt-2">
      <div className="flex items-center bg-[#181818] border border-[#333] rounded-lg px-2 py-1 focus-within:ring-2 ring-purple-500">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search notes..."
          className="bg-transparent outline-none text-sm text-white flex-1 py-1"
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-[#232323] border border-[#333] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-4 text-center text-gray-500 text-sm">Start typing to search.</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No results found.</div>
          ) : (
            <ul>
              {results.map((note, idx) => (
                <li key={note.id || idx} className="px-4 py-2 text-gray-200 hover:bg-[#181818] cursor-pointer text-sm truncate border-b border-[#333] last:border-b-0">
                  {note.content ? note.content.replace(/<[^>]+>/g, '').slice(0, 80) : JSON.stringify(note)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarNotesSearch;
