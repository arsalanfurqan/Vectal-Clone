import React from 'react';
import { getTasks } from '../utils/storage';
// import { useSession, signOut } from 'next-auth/react'; // Disabled auth
import Button from './UI/Button';
import Card from './UI/Card';

interface UserContextDisplayProps {
  onClose: () => void;
}

const UserContextDisplay: React.FC<UserContextDisplayProps> = ({ onClose }) => {
  // const { data: session, status } = useSession(); // Disabled auth

  // if (status === "loading") { // Disabled auth
  //   return (
  //     <Card variant="elevated" className="p-6 space-y-4 w-[300px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg text-white text-center">
  //       <div>Loading user info...</div>
  //     </Card>
  //   );
  // }

  // if (!session) { // Disabled auth
  //   return null; // Don't render if this component is used conditionally after login
  // }

  const [tasks, setTasks] = React.useState<{ id: string; title?: string; completed?: boolean; dueDate?: string }[]>([]);
  React.useEffect(() => {
    (async () => {
      const result = await getTasks();
      setTasks(result);
    })();
  }, []);
  return (
    <Card variant="elevated" className="p-6 space-y-4 w-[300px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg relative text-white text-center">
      <div className="flex justify-end">
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col items-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-[#444444] flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="font-semibold text-lg">User</p>
        <p className="text-gray-400 text-sm">user@example.com</p>
      </div>
      {/* Task summary */}
      <div className="mt-4 text-left">
        <h3 className="text-sm font-bold mb-1">Your Tasks</h3>
        <ul className="text-xs text-gray-300 max-h-32 overflow-y-auto">
          {tasks.slice(0, 5).map(task => (
            <li key={task.id} className="mb-1">
              <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
              {task.dueDate && <span className="ml-2 text-gray-400">({task.dueDate})</span>}
            </li>
          ))}
          {tasks.length === 0 && <li>No tasks yet.</li>}
        </ul>
      </div>
    </Card>
  );
};

export default UserContextDisplay; 