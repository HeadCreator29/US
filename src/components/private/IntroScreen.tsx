import { useEffect, useState } from 'react';
import { useAudioController } from './AudioController';
import { useLanguage } from '../../i18n/LanguageContext';
import './IntroScreen.css';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const { play, error } = useAudioController();
  const { t } = useLanguage();
  const [showButton, setShowButton] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowButton(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    setTransitioning(true);
    // El audio corre en background y nunca bloquea la navegación.
    void play().catch((err) => console.error('[IntroScreen] Play error (continuing anyway):', err));
    // Transición garantizada aunque el audio falle o tarde.
    window.setTimeout(() => onComplete(), 800);
  };

  if (transitioning) {
    return (
      <div className="intro-screen transitioning" aria-hidden="true">
        <div className="intro-content">
          <h1 className="archive-title">PRIVATE ARCHIVE</h1>
          <p className="archive-subtitle">{t('introSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="intro-screen" role="region" aria-label="Private Archive entrance">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="intro-content">
        <h1 className="archive-title">PRIVATE ARCHIVE</h1>
        <p className="archive-subtitle">{t('introSubtitle')}</p>
        {showButton && (
          <button
            className="play-button"
            onClick={handlePlay}
            aria-label={t('playSong')}
          >
            <span className="button-text">{t('playSong')}</span>
            <span className="button-arrow" aria-hidden="true">→</span>
          </button>
        )}
        {error && <p className="audio-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
