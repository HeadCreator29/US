import type { Language } from '../i18n/strings';

export interface Thing {
  number: string;
  text: Record<Language, string>;
}

export const tenThings: Thing[] = [
  {
    number: "01",
    text: {
      es: "Despertar a tu lado cada mañana el resto de mi vida — incluso las desordenadas, incluso las difíciles, sobre todo esas.",
      en: "To wake up next to you every morning for the rest of my life — even the messy ones, even the hard ones, especially those.",
    },
  },
  {
    number: "02",
    text: {
      es: "Ser la persona a la que llamas primero cuando algo maravilloso pasa. Y a la que llamas cuando todo se derrumba.",
      en: "To be the person you call first when something wonderful happens. And the one you call when everything falls apart.",
    },
  },
  {
    number: "03",
    text: {
      es: "Conocer cada versión de ti — la de los 25, los 40, los 70 — y enamorarme de cada una como la primera vez.",
      en: "To learn every version of you — the one at 25, at 40, at 70 — and fall in love with each one all over again.",
    },
  },
  {
    number: "04",
    text: {
      es: "Construir un hogar que huela a tu perfume y a mi café y a la vida que estamos creando entre los dos.",
      en: "To build a home that smells like your perfume and my coffee and the life we're creating between us.",
    },
  },
  {
    number: "05",
    text: {
      es: "Ser la razón por la que sonríes al teléfono en medio de un martes aburrido. Cada vez.",
      en: "To be the reason you smile at your phone in the middle of a boring Tuesday. Every time.",
    },
  },
  {
    number: "06",
    text: {
      es: "Tomar tu mano en cada aeropuerto, cada sala de espera, cada crisis silenciosa, cada celebración ruidosa.",
      en: "To hold your hand through every airport, every hospital waiting room, every quiet crisis, every loud celebration.",
    },
  },
  {
    number: "07",
    text: {
      es: "Memorizar el sonido de tu respiración al dormir y usarlo como brújula cuando esté perdido.",
      en: "To memorize the sound of your breathing when you sleep and use it as my compass when I'm lost.",
    },
  },
  {
    number: "08",
    text: {
      es: "Elegirte. A propósito. Conscientemente. Cada día. No porque tenga que hacerlo. Porque quiero.",
      en: "To choose you. Deliberately. Consciously. Every single day. Not because I have to. Because I want to.",
    },
  },
  {
    number: "09",
    text: {
      es: "Envejecer de un modo que haga que nos pregunten el secreto — y nosotros solo sonreír, porque no hay secreto. Solo nosotros.",
      en: "To grow old in a way that makes people ask for our secret — and for us to just smile because there isn't one. Just us.",
    },
  },
  {
    number: "10",
    text: {
      es: "No dejar nunca de ser el hombre que te mira así — como si fueras lo único en el mundo que importa. Porque lo eres.",
      en: "To never stop being the man who looks at you like this — like you're the only thing in the world that matters. Because you are.",
    },
  },
];
