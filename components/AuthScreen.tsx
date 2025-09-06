import React from 'react';
import Card from './UI/Card';
import Button from './UI/Button';
import { Github, Chrome, LogOut } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { auth } from '../utils/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AuthScreenProps {
  // onLoginSuccess: () => void; // This prop is no longer needed
}

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/tasks' });
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Ensure user state updates
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmailLogin = async () => {
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user); // Ensure user state updates
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmailSignup = async () => {
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user); // Ensure user state updates
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleLogout = async () => {
  await signOut(auth);
  setUser(null); // Clear user state so logout button disappears
  setIsLogin(true);
  setEmail("");
  setPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      <div className="w-full max-w-md p-10 sm:p-14 rounded-3xl shadow-2xl bg-black/95 border border-white/20 text-center flex flex-col justify-center" style={{letterSpacing: '0.5px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)'}}>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 sm:mb-14 text-white tracking-tight leading-tight">{isLogin ? 'Login' : 'Sign Up'}<span className="block text-lg font-normal mt-2 text-gray-300">to vectal.ai</span></h1>
        <div className="flex flex-col items-center w-full min-h-[500px] justify-center">
          {!user && (
            <div className="space-y-7 w-full">
              <Button onClick={handleGitHubLogin} variant="primary" className="w-full flex items-center justify-center space-x-3 py-5 bg-white text-black border-2 border-black text-xl font-bold rounded-2xl shadow-xl no-hover-effect-github">
                <style jsx>{`
                  .no-hover-effect-github,
                  .no-hover-effect-github:hover,
                  .no-hover-effect-github:focus {
                    background: white !important;
                    color: black !important;
                    border: 2px solid black !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.10) !important;
                    transition: none !important;
                  }
                `}</style>
                <Github size={26} />
                <span>Sign up with GitHub</span>
              </Button>
              <Button onClick={handleGoogleLogin} variant="secondary" className="w-full flex items-center justify-center space-x-3 py-4 bg-white text-black border border-white no-hover-effect text-lg rounded-xl shadow-md">
      <style jsx>{`
        .no-hover-effect,
        .no-hover-effect:hover,
        .no-hover-effect:focus {
          background: white !important;
          color: black !important;
          border: 1px solid white !important;
          box-shadow: none !important;
          transition: none !important;
        }
      `}</style>
                <Chrome size={22} />
                <span>Sign in with Google</span>
              </Button>
              <div className="mt-8 sm:mt-10 space-y-6 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-5 py-4 rounded-xl bg-black border border-white/30 text-white mb-5 sm:mb-6 text-lg focus:outline-none focus:border-white/70 transition-all shadow-sm"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-5 py-4 rounded-xl bg-black border border-white/30 text-white mb-7 sm:mb-8 text-lg focus:outline-none focus:border-white/70 transition-all shadow-sm"
                />
                <div className="flex space-x-6 mb-8 w-full">
                  {isLogin ? (
                    <Button onClick={handleEmailLogin} variant="primary" className="flex-1 bg-white text-black border-2 border-black text-xl font-bold rounded-2xl shadow-xl py-5">Login</Button>
                  ) : (
                    <Button onClick={handleEmailSignup} variant="secondary" className="flex-1 bg-white text-black border-2 border-black text-xl font-bold rounded-2xl shadow-xl py-5">Sign Up</Button>
                  )}
                </div>
                {error && <div className="text-red-500 mt-4 text-base font-semibold bg-black/80 border border-red-500 rounded-xl py-2 px-4 shadow-sm">{error}</div>}
                <div className="mt-8 sm:mt-10 text-center w-full">
                  <button
                    className="text-white underline text-lg font-semibold"
                    style={{fontWeight: 500, fontSize: '1.1rem', letterSpacing: '0.2px'}}
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  >
                    {isLogin ? 'Create an account' : 'Already have an account? Login'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {user && (
            <div className="space-y-10 w-full">
              <div className="mb-6 text-white text-lg">Logged in as <span className="font-bold">{user.email || user.displayName}</span></div>
              <Button onClick={handleLogout} variant="secondary" className="w-full flex items-center justify-center space-x-3 py-4 bg-white text-black border border-white text-lg rounded-xl shadow-md">
                <LogOut size={22} />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen; 