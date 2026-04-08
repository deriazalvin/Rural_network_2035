import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage.tsx';
import DemoPage from './DemoPage.jsx';
import AuthForm from './AuthForm.jsx';

export default function PublicPages() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      if (detail.page) setPage(detail.page);
      if (detail.target && detail.target === 'demo') setPage('demo');
    };

    const authHandler = (e) => {
      const detail = e?.detail || {};
      setAuthMode(detail.mode || 'login');
      setPage('auth');
    };

    window.addEventListener('rn-show-public', handler);
    window.addEventListener('rn-open-auth', authHandler);
    return () => {
      window.removeEventListener('rn-show-public', handler);
      window.removeEventListener('rn-open-auth', authHandler);
    };
  }, []);

  return (
    <div>
      {page === 'landing' && <LandingPage />}
      {page === 'demo' && <DemoPage />}
      {page === 'auth' && (
        <div className="p-6">
          <AuthForm onLogin={(user) => {
            // AuthForm will dispatch global event, but ensure we can go back to app if needed
            // keep local UI: optionally return to landing while App handles user state
            setPage('landing');
          }} mode={authMode} />
        </div>
      )}
    </div>
  );
}
