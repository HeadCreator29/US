import type { Language } from '../i18n/strings';

export interface RelationshipMoment {
  id: number;
  text: Record<Language, string>;
  date?: Record<Language, string>;
}

export const relationshipMoments: RelationshipMoment[] = [
  {
    id: 1,
    text: {
      es: "Cómo, sin darme cuenta, empezaste a formar parte de mis días.",
      en: "How, without me realizing it, you became part of my days.",
    },
    date: { es: "SIN DARME CUENTA", en: "WITHOUT REALIZING IT" },
  },

  {
    id: 2,
    text: {
      es: "Las pequeñas cosas que haces y que probablemente ni siquiera sabes que noto.",
      en: "The little things you do that you probably don't even know I notice.",
    },
    date: { es: "LAS PEQUEÑAS COSAS", en: "THE LITTLE THINGS" },
  },
  {
    id: 3,
    text: {
      es: "El silencio entre nosotros que nunca se siente vacío. Solo lleno.",
      en: "The silence between us that never feels empty. Just full.",
    },
    date: { es: "CADA DÍA", en: "EVERY DAY" },
  },
  {
    id: 4,
    text: {
      es: "Cómo contigo hasta un día normal puede terminar siendo uno de mis favoritos.",
      en: "How even an ordinary day with you can end up being one of my favorites.",
    },
    date: { es: "DÍAS NORMALES", en: "ORDINARY DAYS" },
  },
  {
    id: 5,
    text: {
      es: "Cómo me miras cuando crees que no te estoy viendo.",
      en: "The way you look at me when you think I'm not watching.",
    },
    date: { es: "MIRADAS ROBADAS", en: "STOLEN GLANCES" },
  },
    {
    id: 6,
    text: {
      es: "Cómo me soportas incluso en mis versiones más difíciles de soportar.",
      en: "How you put up with me even in the versions of myself that are hardest to handle.",
    },
    date: { es: "MIS PEORES DÍAS", en: "MY HARDEST DAYS" },
  },
  {
    id: 7,
    text: {
      es: "Nuestro idioma. Las palabras que no significan nada para nadie más y todo para nosotros.",
      en: "Our language. The words that mean nothing to anyone else and everything to us.",
    },
    date: { es: "DIALECTO PRIVADO", en: "PRIVATE DIALECT" },
  },
  {
    id: 8,
    text: {
      es: "El futuro que nunca me permití desear hasta que tú lo hiciste inevitable.",
      en: "The future I never let myself want until you made it inevitable.",
    },
    date: { es: "MAÑANA", en: "TOMORROW" },
  },
];
