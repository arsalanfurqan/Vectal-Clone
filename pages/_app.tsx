import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/components.css';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import ChatScreen from '../components/ChatScreen';
import { RefreshProvider } from '../contexts/RefreshContext';
import { SessionProvider } from '../contexts/SessionContext';
// import AuthScreen from '../components/AuthScreen'; // Disabled auth
// import { SessionProvider, useSession } from 'next-auth/react'; // Disabled auth

export default function App(props: AppProps) {
  return (
    // <SessionProvider session={props.pageProps.session}> // Disabled auth
      <AppContent {...props} />
    // </SessionProvider> // Disabled auth
  );
}

function AppContent({ Component, pageProps, router }: AppProps) {
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  React.useEffect(() => {
    import('../utils/firebase').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        setIsAuthenticated(!!user);
        setLoading(false);
        // Only redirect to /auth if not authenticated and not already on /auth
        if (!user && typeof window !== 'undefined' && window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
        // If authenticated and on /auth, redirect to home
        if (user && typeof window !== 'undefined' && window.location.pathname === '/auth') {
          window.location.href = '/';
        }
      });
      return () => unsubscribe();
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white text-xl">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Show AuthScreen as a full overlay, hiding all app content
    const AuthScreen = require('../components/AuthScreen').default;
    return <AuthScreen />;
  }

  return (
    <SessionProvider>
      <RefreshProvider>
        <div className="flex flex-col min-h-screen">
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
    </SessionProvider>
  );
}