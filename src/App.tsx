import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import type { Language } from './i18n/strings';
import { LanguageGate } from './components/private/LanguageGate';
import { IntroScreen } from './components/private/IntroScreen';
import { LoginScreen } from './components/private/LoginScreen';
import { AccessGranted } from './components/private/AccessGranted';
import { ArchiveHome } from './components/private/ArchiveHome';
import { AdminStats } from './components/private/AdminStats';
import { recordGlobalVisit, recordVisit } from './utils/visitCounter';
import './App.css';

type AppStage = 'language' | 'intro' | 'login' | 'access' | 'archive';

function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hash === '#/admin') return true;
  try {
    return new URLSearchParams(window.location.search).get('admin') === '1';
  } catch {
    return false;
  }
}

function clearAdminRoute(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch {
    try {
      window.location.hash = '';
    } catch {
      // Ignore navigation errors.
    }
  }
}

function Stages() {
  const [stage, setStage] = useState<AppStage>('language');
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { setLang } = useLanguage();

  useEffect(() => {
    const admin = isAdminRoute();
    setIsAdmin(admin);
    if (!admin) {
      // Sync local increment for instant feedback, plus fire-and-forget
      // global increment (never blocks render, failures fall back to local).
      recordVisit();
      recordGlobalVisit().catch(() => {
        // Intentionally silent — local cache already updated.
      });
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="app-loading" aria-hidden="true">
        <div className="loading-screen" />
      </div>
    );
  }

  const handleLanguage = (lang: Language) => {
    setLang(lang);
    setStage('intro');
  };

  if (isAdmin) {
    return (
      <div className="app">
        <AdminStats
          onBack={() => {
            clearAdminRoute();
            setIsAdmin(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {stage === 'language' && (
        <LanguageGate onChoose={handleLanguage} />
      )}

      {stage === 'intro' && (
        <IntroScreen onComplete={() => setStage('login')} />
      )}

      {stage === 'login' && (
        <LoginScreen onSuccess={(name) => {
          setUserName(name);
          setStage('access');
        }} />
      )}

      {stage === 'access' && (
        <AccessGranted
          name={userName}
          onComplete={() => setStage('archive')}
        />
      )}

      {stage === 'archive' && (
        <ArchiveHome userName={userName} />
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Stages />
      <SpeedInsights />
    </LanguageProvider>
  );
}

export default App;
