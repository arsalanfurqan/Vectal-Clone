import React from 'react';
// import Sidebar from '../components/Sidebar'; // Removed as per user request
import TasksList from '../components/TasksList';
import Card from '../components/UI/Card';

const Tasks: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black" style={{ background: '#000', overflow: 'hidden' }}>
      <div className="flex items-center justify-center w-full" style={{ minHeight: '80vh' }}>
        <TasksList />
      </div>
    </div>
  );
};

export default Tasks; 