import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { STRINGS, type Language, type StringKey } from './strings';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: StringKey): string => STRINGS[key][lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
