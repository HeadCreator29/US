import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { PRIVATE_ACCESS } from '../../config/privateAccess';
import { getGlobalStats, getStats, resetGlobalStats, type StatsSource } from '../../utils/visitCounter';
import './AdminStats.css';

interface AdminStatsProps {
  onBack: () => void;
}

// Format an ISO date string for the current language.
// Falls back to the raw string when parsing fails.
function formatVisitDate(iso: string | null, lang: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

export function AdminStats({ onBack }: AdminStatsProps) {
  const { lang, t } = useLanguage();
  // Instant local stats first, then replaced by the global total when loaded.
  const [stats, setStats] = useState(getStats);
  const [source, setSource] = useState<StatsSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getGlobalStats()
      .then((global) => {
        if (cancelled) return;
        setStats({ total: global.total, firstVisit: global.firstVisit, lastVisit: global.lastVisit });
        setSource(global.source);
      })
      .catch(() => {
        if (cancelled) return;
        setSource('local');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async () => {
    if (window.confirm(t('adminReset') + '?')) {
      // Server first/last are now global; the password authorizes the reset.
      setStats(await resetGlobalStats(PRIVATE_ACCESS.password));
      setSource('global');
    }
  };

  const firstLabel = stats.firstVisit ? formatVisitDate(stats.firstVisit, lang) : t('adminEmpty');
  const lastLabel = stats.lastVisit ? formatVisitDate(stats.lastVisit, lang) : t('adminEmpty');

  return (
    <div className="admin-stats-screen" role="region" aria-label={t('adminTitle')}>
      <div className="grain-overlay" aria-hidden="true" />
      <div className="admin-stats-card">
        <h1 className="admin-stats-title">{t('adminTitle')}</h1>

        {loading ? (
          <p className="admin-stats-loading">{t('adminLoading')}</p>
        ) : (
          <dl className="admin-stats-list">
            <div className="admin-stats-row">
              <dt className="admin-stats-label">{t('adminTotal')}</dt>
              <dd className="admin-stats-value admin-stats-total">{stats.total}</dd>
            </div>
            <div className="admin-stats-row">
              <dt className="admin-stats-label">{t('adminFirst')}</dt>
              <dd className="admin-stats-value">{firstLabel}</dd>
            </div>
            <div className="admin-stats-row">
              <dt className="admin-stats-label">{t('adminLast')}</dt>
              <dd className="admin-stats-value">{lastLabel}</dd>
            </div>
          </dl>
        )}

        {source === 'local' && !loading && (
          <p className="admin-stats-fallback">{t('adminLocalFallback')}</p>
        )}

        <div className="admin-stats-actions">
          <button type="button" className="back-home-button" onClick={onBack}>
            {t('back')}
          </button>
          <button type="button" className="admin-stats-reset" onClick={handleReset}>
            {t('adminReset')}
          </button>
        </div>
      </div>
    </div>
  );
}
