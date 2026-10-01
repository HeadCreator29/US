import { useRef, useEffect, useState } from 'react';
import { relationshipMoments } from '../../data/relationship';
import { useLanguage } from '../../i18n/LanguageContext';
import './UsSection.css';

interface UsSectionProps {
  onBack: () => void;
}

export function UsSection({ onBack }: UsSectionProps) {
  const { lang, t } = useLanguage();
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const index = Number(target.dataset.index);
            setVisibleIndices((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.15, rootMargin: '30px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section className="us-section" aria-label={t('sectionUs')}>
      <div className="section-header">
        <button className="back-button" onClick={onBack} aria-label="Back to archive">
          <span aria-hidden="true">←</span>
          <span>{t('back')}</span>
        </button>
        <h1 className="section-title">{t('sectionUs')}</h1>
      </div>

      <div className="section-intro">
        <p className="intro-text">{t('usIntro')}</p>
      </div>

      <div className="moments-list">
        {relationshipMoments.map((moment, index) => (
          <article
            key={moment.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-index={index}
            className={`moment-card ${visibleIndices.has(index) ? 'visible' : ''}`}
            aria-label={moment.date ? `${moment.date[lang]}: ${moment.text[lang]}` : moment.text[lang]}
          >
            <span className="moment-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="moment-content">
              <p className="moment-text">{moment.text[lang]}</p>
              {moment.date && (
                <span className="moment-date">{moment.date[lang]}</span>
              )}
            </div>
          </article>
        ))}
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