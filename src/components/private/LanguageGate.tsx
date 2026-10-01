import type { Language } from '../../i18n/strings';
import './LanguageGate.css';

interface LanguageGateProps {
  onChoose: (lang: Language) => void;
}

export function LanguageGate({ onChoose }: LanguageGateProps) {
  return (
    <div className="language-gate" role="region" aria-label="Choose language">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="gate-content">
        <p className="gate-kicker">PRIVATE ARCHIVE</p>
        <h1 className="gate-title">
          La magia está en el texto.
          <span className="gate-title-en">The magic is in the words.</span>
        </h1>
        <p className="gate-question">¿Qué prefieres? · Which do you prefer?</p>
        <div className="gate-buttons">
          <button
            className="gate-button"
            onClick={() => onChoose('es')}
            aria-label="Continuar en español"
          >
            <span className="button-text">ESPAÑOL</span>
            <span className="button-arrow" aria-hidden="true">→</span>
          </button>
          <button
            className="gate-button"
            onClick={() => onChoose('en')}
            aria-label="Continue in English"
          >
            <span className="button-text">ENGLISH</span>
            <span className="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
