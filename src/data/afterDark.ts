import type { Language } from '../i18n/strings';

export interface AfterDarkLine {
  id: number;
  text: Record<Language, string>;
  pause?: number;
}

export const afterDarkLines: AfterDarkLine[] = [
  { id: 1, text: { es: "Acércate.", en: "Come closer." }, pause: 2000 },

  { id: 2, text: { es: "Quédate un poco más.", en: "Stay a little longer." }, pause: 2500 },

  { id: 3, text: { es: "Sabes exactamente lo que me haces.", en: "You know exactly what you do to me." }, pause: 3000 },

  { id: 4, text: { es: "La forma en que me miras cuando estamos cerca.", en: "The way you look at me when we're this close." }, pause: 2500 },

  { id: 5, text: { es: "El sonido que haces cuando beso tu cuello.", en: "The sound you make when I kiss your neck." }, pause: 3000 },

  { id: 6, text: { es: "Esa mirada tuya cuando sabes lo que estás haciendo.", en: "That look you give me when you know what you're doing." }, pause: 2500 },

  { id: 7, text: { es: "Esta versión de mí.", en: "This version of me." }, pause: 1500 },

  { id: 8, text: { es: "Solo existe cuando estoy contigo.", en: "Only exists when I'm with you." }, pause: 2000 },

  { id: 9, text: { es: "Nadie más la ve.", en: "No one else sees it." }, pause: 1500 },

  { id: 10, text: { es: "Nadie más puede.", en: "No one else gets to." }, pause: 2000 },

  { id: 11, text: { es: "Tú.", en: "You." }, pause: 1000 },

  { id: 12, text: { es: "Solo tú.", en: "Only you." }, pause: 3000 },
];
