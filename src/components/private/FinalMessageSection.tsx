import { useState, useEffect, useRef } from 'react';
import { finalMessage } from '../../data/finalMessage';
import { useLanguage } from '../../i18n/LanguageContext';
import './FinalMessageSection.css';

interface FinalMessageSectionProps {
  onBack: () => void;
}

export function FinalMessageSection({ onBack }: FinalMessageSectionProps) {
  const { lang, t } = useLanguage();
  const [stage, setStage] = useState<'intro' | 'message' | 'end'>('intro');
  const [visibleParagraphs, setVisibleParagraphs] = useState<Set<number>>(new Set());
  const messageRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setStage('message');
    window.setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    if (stage !== 'message') return;

    const timers: number[] = [];
    const parts = finalMessage[lang].trim().split('\n\n').filter(Boolean);
    parts.forEach((_, index) => {
      const tm = window.setTimeout(() => {
        setVisibleParagraphs((prev) => new Set(prev).add(index));
      }, index * 2200);
      timers.push(tm);
    });

    const endTimer = window.setTimeout(() => {
      setStage('end');
    }, parts.length * 2200 + 3500);
    timers.push(endTimer);

    return () => {
      timers.forEach((tm) => window.clearTimeout(tm));
    };
  }, [stage, lang]);

  const handleEnd = () => {
    onBack();
  };

  const paragraphs = finalMessage[lang].trim().split('\n\n').filter(Boolean);

  return (
    <section className="final-section" aria-label={t('sectionFinal')}>
      <div className="section-header">
        <button className="back-button" onClick={onBack} aria-label="Back to archive">
          <span aria-hidden="true">←</span>
          <span>{t('back')}</span>
        </button>
        <h1 className="section-title">{t('sectionFinal')}</h1>
      </div>

      {stage === 'intro' && (
        <div className="intro-stage" role="region" aria-label="Final message intro">
          <button
            className="open-button"
            onClick={handleOpen}
            aria-label={t('open')}
          >
            <span className="open-label">{t('open')}</span>
          </button>
        </div>
      )}

      {stage === 'message' && (
        <div className="message-stage" ref={messageRef} role="region" aria-label="Final message">
          <div className="message-content">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`message-paragraph ${visibleParagraphs.has(index) ? 'visible' : ''}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {stage === 'end' && (
        <div className="end-stage" role="region" aria-label="End of archive">
          <div className="end-content">
            <p className="end-line">{t('endOfArchive')}</p>
            <p className="end-subline">{t('butNotStory')}</p>
            <button
              className="heart-button"
              onClick={handleEnd}
              aria-label="Close archive"
            >
              <span aria-hidden="true">♡</span>
            </button>
          </div>
        </div>
      )}

      <div className="section-footer">
        <button className="back-home-button" onClick={onBack} aria-label={t('backToStart')}>
          <span aria-hidden="true">←</span>
          <span>{t('backToStart')}</span>
        </button>
      </div>
    </section>
  );
}
