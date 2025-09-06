import React from 'react';
import type { AppProps } from 'next/app';
// Global CSS imports must be in _app.tsx, not here
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import ChatScreen from '../components/ChatScreen';
import { RefreshProvider } from '../contexts/RefreshContext';
// import AuthScreen from '../components/AuthScreen'; // Disabled auth
// import { SessionProvider, useSession } from 'next-auth/react'; // Disabled auth

// This component will be wrapped by SessionProvider
function AppContent({ Component, pageProps }: AppProps) {
  // const { data: session, status } = useSession(); // Disabled auth

  // if (status === "loading") { // Disabled auth
  //   return <div>Loading...</div>; // Or a more sophisticated loading spinner
  // }

  // if (!session) { // Disabled auth
  //   return <AuthScreen />;
  // }

  return (
    <RefreshProvider>
      <div className="flex flex-col min-h-screen" style={{ background: '#161616' }}>
        <div className="layout-container flex-1">
          {/* Left Chat Screen */}
          <div className="chat-panel">
            <ChatScreen />
          </div>

          {/* Main Content */}
          <div className="main-page-content flex flex-col">
            <Component {...pageProps} />
          </div>

          {/* Right Navigation Sidebar */}
          <div className="navigation-sidebar">
            <Sidebar />
          </div>
        </div>
      </div>
    </RefreshProvider>
  );
}

export default function App(props: AppProps) {
  return (
    // <SessionProvider session={props.pageProps.session}> // Disabled auth
      <AppContent {...props} />
    // </SessionProvider> // Disabled auth
  );
} 