import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Ajay Sujan');
  const [isDark, setIsDark] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>(undefined);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedLoggedIn = localStorage.getItem('aura_is_logged_in');
      const storedUser = localStorage.getItem('aura_username');
      const storedTheme = localStorage.getItem('aura_theme');

      if (storedLoggedIn === 'true') {
        setIsLoggedIn(true);
      }
      if (storedUser) {
        setUsername(storedUser);
      }
      if (storedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aura_theme', next ? 'dark' : 'light');
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleLoginSuccess = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    try {
      localStorage.setItem('aura_is_logged_in', 'true');
      localStorage.setItem('aura_username', user);
    } catch {}
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPendingQuestion(undefined);
    try {
      localStorage.removeItem('aura_is_logged_in');
    } catch {}
  };

  const handleAskDirectFromLanding = (question: string) => {
    handleLoginSuccess('Ajay Sujan');
    setPendingQuestion(question);
  };

  return (
    <div className={`w-full min-h-screen font-sans ${isDark ? 'dark bg-[#0f172a]' : 'bg-[#f4f7fb]'}`}>
      {!isLoggedIn ? (
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          onAskDirect={handleAskDirectFromLanding}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <Dashboard
          username={username}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          initialQuestion={pendingQuestion}
        />
      )}
    </div>
  );
}
