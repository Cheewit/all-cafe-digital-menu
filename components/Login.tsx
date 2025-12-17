
import React, { useState } from 'react';
import { logLoginAttempt, getBlockedUsers } from '../utils/dataUtils';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginProps {
  onLogin: (role: UserRole, clientIdentifier?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    // Using an IIFE to use async/await inside setTimeout
    (async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            const blockedUsers = getBlockedUsers();
            if (blockedUsers.includes(username)) {
                await logLoginAttempt(username, 'FAILED');
                setError(t('loginErrorRevoked'));
                setIsAuthenticating(false);
                return;
            }
            const lowercasedUsername = username.toLowerCase();

            if (lowercasedUsername === 'admin' && password === 'admin') {
                const loginTimestamp = await logLoginAttempt('admin', 'SUCCESS');
                sessionStorage.setItem('loginTimestamp', loginTimestamp);
                onLogin('admin');
            } else if (lowercasedUsername === 'allcafe' && password === 'allcafe') {
                const loginTimestamp = await logLoginAttempt('allcafe_client', 'SUCCESS');
                sessionStorage.setItem('loginTimestamp', loginTimestamp);
                onLogin('client', 'allcafe');
            } else if (username === '123456' && password === '123456') {
                const loginTimestamp = await logLoginAttempt('guest', 'SUCCESS');
                sessionStorage.setItem('loginTimestamp', loginTimestamp);
                onLogin('guest');
            } else {
                await logLoginAttempt(username, 'FAILED');
                setError(t('loginErrorInvalid'));
                setIsAuthenticating(false);
            }
        } catch (err) {
            console.error('Login process error:', err);
            setError(t('loginErrorUnknown'));
            setIsAuthenticating(false);
        }
    })();
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-mono">
      <div className="w-full max-w-md">
        <div className="relative bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-8 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

          <h1 className="text-2xl font-bold text-center text-cyan-300 tracking-widest uppercase mb-2 [text-shadow:0_0_8px_theme(colors.cyan.400/80%)]">
            {t('loginTitle')}
          </h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            {t('loginSubtitle')}
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-1">
                &gt; {t('userId')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-3 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan transition-all"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-400 mb-1">
                &gt; {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan transition-all"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-slate-900 bg-accent-cyan hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                {isAuthenticating ? t('authenticating') : t('connect')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
