import { useState, useEffect, useRef } from 'react';
import { useAudioController } from './AudioController';
import { useLanguage } from '../../i18n/LanguageContext';
import { MemoryGallery } from './MemoryGallery';
import { UsSection } from './UsSection';
import { ThingsSection } from './ThingsSection';
import { AfterDarkSection } from './AfterDarkSection';
import { FinalMessageSection } from './FinalMessageSection';
import './ArchiveHome.css';

type Section = 'home' | 'memories' | 'us' | 'things' | 'afterdark' | 'final';

export function ArchiveHome({ userName }: { userName: string }) {
  const { isMuted, toggleMute } = useAudioController();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SECTIONS = [
    { id: 'memories' as Section, number: '01', title: t('sectionMemories') },
    { id: 'us' as Section, number: '02', title: t('sectionUs') },
    { id: 'things' as Section, number: '03', title: t('sectionThings') },
    { id: 'afterdark' as Section, number: '04', title: t('sectionAfterDark') },
    { id: 'final' as Section, number: '05', title: t('sectionFinal') },
  ];

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cada sección abre desde arriba: el contenedor de scroll es el mismo
  // para todas y si no lo reseteamos, el inicio aparece "al final".
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeSection]);

  const handleSectionClick = (section: Section) => {
    setActiveSection(section);
  };

  const handleBack = () => {
    setActiveSection('home');
  };

  if (!mounted) return null;

  return (
    <div className="archive-home" ref={containerRef}>
      <div className="grain-overlay" aria-hidden="true" />

      <header className="archive-header">
        <div className="header-left">
          <h1 className="archive-brand">PRIVATE ARCHIVE</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{userName}</span>
          <button
            className="audio-toggle"
            onClick={toggleMute}
            aria-label={isMuted ? t('unmute') : t('mute')}
            aria-pressed={isMuted}
          >
            <span className="audio-icon" aria-hidden="true">
              {isMuted ? '🔇' : '🔊'}
            </span>
            <span className="audio-label">{t('ourSong')}</span>
          </button>
        </div>
      </header>

      <main className="archive-main">
        {activeSection === 'home' && (
          <section className="home-content" aria-label="Archive contents">
            <p className="archive-intro">{t('archiveIntro')}</p>

            <nav className="sections-nav" aria-label="Archive sections">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className="section-card"
                  onClick={() => handleSectionClick(section.id)}
                  aria-label={`Open ${section.title}`}
                >
                  <span className="section-number">{section.number}</span>
                  <span className="section-title">{section.title}</span>
                  <span className="section-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </nav>

            <div className="archive-footer">
              <span className="creation-date">CREATED 30/09/30</span>
              <span className="memory-count">5 MEMORIES • 8 MOMENTS • 10 PROMISES</span>
            </div>
          </section>
        )}

        {activeSection === 'memories' && <MemoryGallery onBack={handleBack} />}
        {activeSection === 'us' && <UsSection onBack={handleBack} />}
        {activeSection === 'things' && <ThingsSection onBack={handleBack} />}
        {activeSection === 'afterdark' && <AfterDarkSection onBack={handleBack} />}
        {activeSection === 'final' && <FinalMessageSection onBack={handleBack} />}
      </main>
    </div>
  );
}
