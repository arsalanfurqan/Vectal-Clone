import React from 'react';
// import Sidebar from '../components/Sidebar'; // Removed as per user request
import AgentScreen from '../components/AgentScreen';

const Agent: React.FC = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">AI Agent</h1>
      <div className="h-[calc(100vh-8rem)]">
        <AgentScreen />
      </div>
    </>
  );
};

export default Agent; 