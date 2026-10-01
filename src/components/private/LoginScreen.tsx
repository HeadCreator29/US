import { useState, useRef, useEffect } from 'react';
import { PRIVATE_ACCESS } from '../../config/privateAccess';
import { useLanguage } from '../../i18n/LanguageContext';
import './LoginScreen.css';

interface LoginScreenProps {
  onSuccess: (name: string) => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'denied' | 'granted'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    nameRef.current?.focus();
    const timers = timersRef.current;
    return () => {
      timers.forEach((tm) => window.clearTimeout(tm));
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('checking');
    setErrorMessage('');

    const checkTimer = window.setTimeout(() => {
      const cleanName = name.trim();
      const cleanPassword = password.trim();
      if (cleanName === PRIVATE_ACCESS.name && cleanPassword === PRIVATE_ACCESS.password) {
        setStatus('granted');
        const okTimer = window.setTimeout(() => onSuccess(cleanName), 1500);
        timersRef.current.push(okTimer);
      } else {
        setStatus('denied');
        setErrorMessage(t('accessDeniedHint'));
        passwordRef.current?.focus();
        const idleTimer = window.setTimeout(() => setStatus('idle'), 3000);
        timersRef.current.push(idleTimer);
      }
    }, 800);
    timersRef.current.push(checkTimer);
  };

  return (
    <div className="login-screen" role="region" aria-label="Private access">
      <div className="grain-overlay" aria-hidden="true" />
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-header">
          <h1 className="access-title">{t('loginTitle')}</h1>
          <p className="access-subtitle">{t('loginSubtitle')}</p>
        </div>

        <div className="fields">
          <div className="field-group">
            <label htmlFor="name" className="field-label">{t('loginName')}</label>
            <input
              ref={nameRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={status === 'checking' || status === 'granted'}
              aria-invalid={status === 'denied'}
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">{t('loginPassword')}</label>
            <input
              ref={passwordRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              autoComplete="off"
              disabled={status === 'checking' || status === 'granted'}
              aria-invalid={status === 'denied'}
            />
          </div>
        </div>

        <p className="access-note">{t('loginNote')}</p>

        <button
          type="submit"
          className="submit-button"
          disabled={status === 'checking' || status === 'granted'}
          aria-busy={status === 'checking'}
        >
          {status === 'checking' ? t('loginVerifying') : t('loginEnter')}
        </button>

        {status === 'denied' && (
          <div className="denied-message" role="alert" aria-live="polite">
            <span className="denied-text">{t('accessDenied')}</span>
            <span className="denied-hint">{errorMessage}</span>
          </div>
        )}

        {status === 'granted' && (
          <div className="granted-message" role="status" aria-live="polite">
            <span className="granted-text">{t('accessGranted')}</span>
          </div>
        )}
      </form>
    </div>
  );
}
