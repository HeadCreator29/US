import { useState, useRef, useEffect } from 'react';
import { tenThings } from '../../data/tenThings';
import { useLanguage } from '../../i18n/LanguageContext';
import './ThingsSection.css';

interface ThingsSectionProps {
  onBack: () => void;
}

export function ThingsSection({ onBack }: ThingsSectionProps) {
  const { lang, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      { threshold: 0.1, rootMargin: '30px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const toggleCard = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="things-section" aria-label={t('sectionThingsFull')}>
      <div className="section-header">
        <button className="back-button" onClick={onBack} aria-label="Back to archive">
          <span aria-hidden="true">←</span>
          <span>{t('back')}</span>
        </button>
        <h1 className="section-title">{t('sectionThings')}</h1>
      </div>

      <div className="section-subtitle">
        <p>{t('sectionThingsFull')}</p>
      </div>

      <div className="things-list">
        {tenThings.map((thing, index) => (
          <article
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-index={index}
            className={`thing-card ${visibleIndices.has(index) ? 'visible' : ''} ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleCard(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(index); } }}
            aria-expanded={openIndex === index}
            aria-label={openIndex === index ? `Close: ${thing.text[lang]}` : `Open: ${thing.number}`}
          >
            <div className="card-front">
              <span className="thing-number">{thing.number}</span>
              <span className="thing-prompt">{t('tapToOpen')}</span>
            </div>
            <div className="card-back">
              <p className="thing-text">{thing.text[lang]}</p>
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