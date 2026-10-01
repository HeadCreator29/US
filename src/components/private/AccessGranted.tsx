import { useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import './AccessGranted.css';

interface AccessGrantedProps {
  name: string;
  onComplete: () => void;
}

export function AccessGranted({ name, onComplete }: AccessGrantedProps) {
  const { t } = useLanguage();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onCompleteRef.current();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [name]);

  return (
    <div className="access-granted-screen" role="region" aria-label="Access granted transition">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="access-content">
        <div className="message granted" aria-live="polite">{t('accessGranted')}</div>
        <div className="message welcome" aria-live="polite">{t('welcome')}, <span>{name.toUpperCase()}</span></div>
      </div>
    </div>
  );
}
