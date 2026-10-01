import { useRef, useEffect, useState } from 'react';
import { memories } from '../../data/memories';
import { useLanguage } from '../../i18n/LanguageContext';
import './MemoryGallery.css';

interface MemoryGalleryProps {
  onBack: () => void;
}

export function MemoryGallery({ onBack }: MemoryGalleryProps) {
  const { lang, t } = useLanguage();
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [entered, setEntered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // La entrada cinematográfica la dispara la apertura de la sección,
  // no el scroll: las tarjetas arrancan fuera de pantalla y por eso
  // el observer jamás las vería. Pequeño delay para pintar primero
  // el estado inicial fuera de pantalla y luego animar.
  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), 90);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const index = Number(target.dataset.index);
            if (!Number.isNaN(index)) {
              setVisibleIndices((prev) => new Set(prev).add(index));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const observer = observerRef.current;
    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <section className={`memory-gallery${entered ? ' entered' : ''}`} aria-label={t('sectionMemories')}>
      <div className="gallery-header">
        <button className="back-button" onClick={onBack} aria-label="Back to archive">
          <span aria-hidden="true">←</span>
          <span>{t('back')}</span>
        </button>
        <h1 className="gallery-title">{t('sectionMemories')}</h1>
      </div>

      <div className="gallery-content">
        {memories.map((memory, index) => (
          <article
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-index={index}
            className={`memory-card ${visibleIndices.has(index) ? 'visible' : ''}`}
            // Orden = transition del CSS: opacity sin delay (visible desde
            // el borde), movimiento y foco escalonados hasta asentarse.
            style={{ transitionDelay: `0ms, ${Math.min(index * 280, 1120)}ms, ${Math.min(index * 280, 1120)}ms` }}
            aria-label={`Memory ${index + 1}: ${memory.title[lang]}`}
          >
            <div className="memory-image-wrapper">
              {!failedImages.has(index) ? (
                <img
                  className="memory-image"
                  src={memory.image}
                  alt={memory.title[lang]}
                  loading="lazy"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="memory-placeholder" role="img" aria-label={`${memory.title[lang]} — placeholder`}>
                  <span className="placeholder-text">PLACE YOUR PHOTO AT {memory.image}</span>
                </div>
              )}
              <div className="memory-blur" aria-hidden="true" />
            </div>

            <div className="memory-text">
              {memory.date && (
                <span className="memory-date">{memory.date}</span>
              )}
              <h2 className="memory-title">{memory.title[lang]}</h2>
              <p className="memory-description">{memory.text[lang]}</p>
              {memory.quote && (
                <blockquote className="memory-quote">
                  "{memory.quote[lang]}"
                </blockquote>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="gallery-footer">
        <button className="back-home-button" onClick={onBack} aria-label={t('backToStart')}>
          <span aria-hidden="true">←</span>
          <span>{t('backToStart')}</span>
        </button>
      </div>
    </section>
  );
}
