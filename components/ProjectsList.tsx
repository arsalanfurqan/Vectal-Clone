import React, { useState, useEffect } from 'react';
import { Project, getProjects, updateProject, deleteProject, addProject } from '../utils/storage';
import Card from './UI/Card';
import Button from './UI/Button';
import { useRefresh } from '../contexts/RefreshContext';
import { Plus, Pencil } from 'lucide-react'; // Added Pencil for consistency with IdeasList

interface ProjectCreationCardProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

interface ProjectEditCardProps {
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project;
}

const ProjectCreationCard: React.FC<ProjectCreationCardProps> = ({ onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [excludeUserContext, setExcludeUserContext] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#007bff');
  const colors = [
    '#007bff', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d', '#343a40', '#f8f9fa',
    '#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d', '#343a40', '#f8f9fa',
  ];
  const handleCreate = async () => {
    if (!name.trim()) return;
    const newProject: Omit<Project, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      context: context.trim(),
      excludeUserContext,
      color: selectedColor,
    };
    const docRef = await addProject(newProject as Project);
    // Optionally, fetch projects again to update local state with Firestore IDs
    onProjectCreated();
    onClose();
  };

  return (
    <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">New Project</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the project..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] min-h-[80px] resize-y"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">Team project <span className="text-gray-500 cursor-pointer">Upgrade to share with team →</span></h3>
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-1">Context (optional)</label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Additional context for the project..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] min-h-[120px] resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="excludeUserContext" className="text-sm font-medium text-gray-300">Exclude user context</label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="toggle"
            id="excludeUserContext"
            checked={excludeUserContext}
            onChange={() => setExcludeUserContext(!excludeUserContext)}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            style={{ left: excludeUserContext ? 'calc(100% - 1.5rem)' : '0.25rem', top: '0.25rem', transition: 'left 0.2s ease-in-out', boxShadow: 'none' }}
          />
          <label htmlFor="excludeUserContext" className="toggle-label block overflow-hidden h-8 rounded-full bg-[#444444] cursor-pointer"></label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          onClick={handleCreate}
          className={`px-4 py-2 rounded-lg ${!name.trim() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}`}
          disabled={!name.trim()}
        >
          Create Project
        </Button>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked + .toggle-label {
          background-color: var(--accent-color);
        }
      `}</style>
    </Card>
  );
};

const ProjectEditCard: React.FC<ProjectEditCardProps> = ({ onClose, onProjectUpdated, project }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [context, setContext] = useState(project.context || '');
  const [excludeUserContext, setExcludeUserContext] = useState(project.excludeUserContext || false);
  const [selectedColor, setSelectedColor] = useState<string>(project.color || '#007bff');

  const colors = [
    '#007bff', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d', '#343a40', '#f8f9fa',
    '#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d', '#343a40', '#f8f9fa',
  ];

  const handleUpdate = () => {
    if (!name.trim()) return;

    const updatedProject: Project = {
      ...project,
      name: name.trim(),
      description: description.trim(),
      context: context.trim(),
      excludeUserContext,
      color: selectedColor,
    };

    (async () => {
      const projects = await getProjects();
      const exists = projects.find(p => p.id === updatedProject.id);
      if (exists) {
        try {
          if (typeof updatedProject.id === 'string') {
            await updateProject(updatedProject.id, updatedProject);
          } else {
            throw new Error('Project ID is missing or invalid.');
          }
          onProjectUpdated();
          onClose();
        } catch (err: any) {
          alert('Failed to update project. It may not exist in Firestore.');
          // Optionally, refresh local state from Firestore here
        }
      } else {
        alert('Project does not exist. Cannot update.');
      }
    })();
  };

  return (
    <Card variant="elevated" className="p-6 space-y-4 w-[600px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Edit Project</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
        <input
          id="editProjectName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        />
      </div>

      <div>
        <label htmlFor="editDescription" className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
        <textarea
          id="editDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the project..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] min-h-[80px] resize-y"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">Team project <span className="text-gray-500 cursor-pointer">Upgrade to share with team →</span></h3>
      </div>

      <div>
        <label htmlFor="editContext" className="block text-sm font-medium text-gray-300 mb-1">Context (optional)</label>
        <textarea
          id="editContext"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Additional context for the project..."
          className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444444] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] min-h-[120px] resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="editExcludeUserContext" className="text-sm font-medium text-gray-300">Exclude user context</label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="toggle"
            id="editExcludeUserContext"
            checked={excludeUserContext}
            onChange={() => setExcludeUserContext(!excludeUserContext)}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            style={{ left: excludeUserContext ? 'calc(100% - 1.5rem)' : '0.25rem', top: '0.25rem', transition: 'left 0.2s ease-in-out', boxShadow: 'none' }}
          />
          <label htmlFor="editExcludeUserContext" className="toggle-label block overflow-hidden h-8 rounded-full bg-[#444444] cursor-pointer"></label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
        >
          Cancel
        </button>
        <Button
          variant="ghost"
          onClick={() => {
            const confirmDelete = window.confirm(`Are you sure you want to delete project "${project.name}"?`);
            if (confirmDelete) {
              (async () => {
                console.log('Deleting project with id:', project.id);
                if (typeof project.id === 'string') {
                  try {
                    await deleteProject(project.id);
                    onProjectUpdated();
                    onClose();
                  } catch (err) {
                    alert('Failed to delete project. Please check Firestore rules and console for errors.');
                  }
                } else {
                  alert('Project ID is missing or invalid. Cannot delete.');
                }
              })();
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
        >
          Delete Project
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          className={`px-4 py-2 rounded-lg ${!name.trim() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}`}
          disabled={!name.trim()}
        >
          Save Changes
        </Button>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked + .toggle-label {
          background-color: var(--accent-color);
        }
      `}</style>
    </Card>
  );
};

const ProjectsList: React.FC = () => {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [showCreationCard, setShowCreationCard] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { refreshKey, triggerRefresh } = useRefresh();

  useEffect(() => {
    (async () => {
      const projects = await getProjects();
      console.log('Fetched projects:', projects);
  setProjectsState((projects as Project[]).filter(p => p.id && p.name && p.createdAt));
    })();
  }, [refreshKey]);

  const handleProjectCreated = () => {
    triggerRefresh();
  };

  const handleProjectUpdated = () => {
    triggerRefresh();
    setEditingProject(null);
  };

  return (
  <div className="flex flex-col items-center w-full px-4" style={{ background: '#000', minHeight: '100vh' }}>
      <div className="w-full max-w-2xl mx-auto"> {/* This div ensures horizontal centering of the content area */}
        {/* Header: Project title and Add Project button */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-2xl font-semibold text-gray-200">Projects <span className="text-gray-500 text-base font-normal ml-2">{projects.length}</span></h1>
          <Button
            onClick={() => setShowCreationCard(true)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
          >
            <Pencil className="w-5 h-5" /> {/* Using Pencil icon for consistency */}
          </Button>
        </div>

        {/* Empty State / Projects List */}
        {projects.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg text-center h-[300px]">
            <p className="text-xl font-semibold text-gray-200 mb-2">Your project inbox is empty</p>
            <p className="text-gray-400 mb-4">Add your first project to get started</p>
            <Button variant="primary" onClick={() => setShowCreationCard(true)}
              className="bg-[#333333] text-white hover:bg-[#444444] px-6 py-2 rounded-lg shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Project
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {projects.map(project => (
              <Card
                key={project.id}
                className="p-4 rounded-lg bg-[#2a2a2a] shadow-sm flex flex-col cursor-pointer"
                onClick={() => setEditingProject(project)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    {project.color && (
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      ></span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-200">{project.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                    className="text-gray-400 hover:text-gray-200 p-1"
                  >
                    <Pencil className="w-4 h-4" /> {/* Using Pencil icon for consistency */}
                  </Button>
                </div>
                {project.description && <p className="text-gray-300 text-sm mb-2">{project.description}</p>}
                {project.context && <p className="text-gray-400 text-xs italic mb-2">Context: {project.context}</p>}\n                <div className="flex items-center text-gray-500 text-xs">\n                  Created: {new Date(project.createdAt).toLocaleDateString()}\n                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Existing modals for ProjectCreationCard and ProjectEditCard */}
      {showCreationCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <ProjectCreationCard
            onClose={() => setShowCreationCard(false)}
            onProjectCreated={handleProjectCreated}
          />
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <ProjectEditCard
            onClose={() => setEditingProject(null)}
            onProjectUpdated={handleProjectUpdated}
            project={editingProject}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectsList;