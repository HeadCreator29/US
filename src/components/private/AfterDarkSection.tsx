import { useState, useEffect, useRef } from 'react';
import { afterDarkLines } from '../../data/afterDark';
import { useLanguage } from '../../i18n/LanguageContext';
import './AfterDarkSection.css';

interface AfterDarkSectionProps {
  onBack: () => void;
}

export function AfterDarkSection({ onBack }: AfterDarkSectionProps) {
  const { lang, t } = useLanguage();
  const [currentLine, setCurrentLine] = useState(0);
  const [showLine, setShowLine] = useState(false);
  const [completed, setCompleted] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (currentLine >= afterDarkLines.length) {
      setCompleted(true);
      return;
    }

    setShowLine(true);
    lineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const line = afterDarkLines[currentLine];
    const hideTimer = window.setTimeout(() => {
      setShowLine(false);
      const nextTimer = window.setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, 400);
      timersRef.current.push(nextTimer);
    }, line.pause || 2000);
    timersRef.current.push(hideTimer);

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [currentLine]);

  const handleBack = () => {
    if (!completed) {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
      setCurrentLine(afterDarkLines.length);
      setCompleted(true);
    } else {
      onBack();
    }
  };

  return (
    <section className="after-dark-section" aria-label="After Dark">
      <div className="section-header">
        <button className="back-button" onClick={handleBack} aria-label={completed ? 'Back to archive' : 'Skip to end'}>
          <span aria-hidden="true">←</span>
          <span>{t('back')}</span>
        </button>
        <h1 className="section-title">{t('sectionAfterDark')}</h1>
      </div>

      <div className="section-intro">
        <p className="intro-text">{t('afterDarkIntro')}</p>
      </div>

      <div className="lines-container" role="region" aria-live="polite" aria-label="After Dark sequence">
        {afterDarkLines.map((line, index) => (
          <div
            key={line.id}
            ref={index === currentLine ? lineRef : undefined}
            className={`line ${index < currentLine ? 'past' : ''} ${index === currentLine && showLine ? 'current' : ''} ${index > currentLine ? 'future' : ''}`}
            aria-hidden={index !== currentLine}
          >
            <p className="line-text">{line.text[lang]}</p>
          </div>
        ))}

        {completed && (
          <div className="line final" aria-live="polite">
            <p className="line-text final-text">{lang === 'es' ? 'Tú. Solo tú.' : 'You. Only you.'}</p>
          </div>
        )}
      </div>

      <div className="section-footer">
        <button className="back-home-button" onClick={onBack} aria-label={t('backToStart')}>
          <span aria-hidden="true">←</span>
          <span>{t('backToStart')}</span>
        </button>
      </div>
    </section>
  );
}
