import type { Language } from '../i18n/strings';

export interface Memory {
  image: string;
  title: Record<Language, string>;
  text: Record<Language, string>;
  date?: string;
  quote?: Record<Language, string>;
}

export const memories: Memory[] = [
  {
    image: "/images/memories/memory-01.png",
    title: { es: "COMO TE VEO", en: "THE WAY I SEE YOU" },
    text: {
      es: "Entraste a la habitación y la luz se reordenó a tu alrededor. Dejé de respirar un segundo. Hay momentos que no necesitan fotografías — se te graban a fuego.",
      en: "You walked into the room and the light rearranged itself around you. I stopped breathing for a second. Some moments don't need photographs — they burn themselves into you.",
    },
    date: "LO QUE YO VEO",
    quote: {
      es: "Eres lo único que se siente como hogar.",
      en: "You are the only thing that feels like home.",
    },
  },
  {
    image: "/images/memories/memory-02.png",
    title: { es: "LO QUE TÚ NO VES", en: "WHAT YOU DON'T SEE" },
    text: {
      es: "No sé si tú te ves como yo te veo. Probablemente no. Y quizás por eso me gusta tanto mirarte.",
      en: "I don't know if you see yourself the way I see you. Probably not. And maybe that's why I love looking at you so much.",
    },
    date: "MI PERSPECTIVA",
    quote: {
      es: "Tú no sabes lo que yo veo.",
      en: "You don't know what I see.",
    },
  },
  {
    image: "/images/memories/memory-03.png",
    title: { es: "SIEMPRE ESTÁS", en: "YOU'RE ALWAYS THERE" },
    text: {
      es: "No importa la hora ni lo que esté pasando. Cuando te escribo, estás ahí. Y quizás no te lo digo lo suficiente, pero esa forma tuya de estar siempre significa mucho para mí.",
      en: "No matter the time or what's going on. When I text you, you're there. And maybe I don't tell you enough, but the way you're always there means more to me than you know.",
    },
    date: "SIEMPRE",
    quote: {
      es: "Siempre encuentro un lugar donde hablar contigo.",
      en: "I can always find a place to talk to you.",
    },
  },
  {
    image: "/images/memories/memory-04.png",
    title: { es: "LO QUE IMAGINO", en: "WHAT I IMAGINE" },
    text: {
      es: "Todavía no conozco cómo es despertar contigo. Pero me gusta imaginar ese momento: abrir los ojos, encontrarte ahí y tenerte cerca antes de que empiece el día.",
      en: "I don't know what it's like to wake up with you yet. But I like imagining that moment: opening my eyes, finding you there, and having you close before the day begins.",
    },
    date: "ALGÚN DÍA",
    quote: {
      es: "Todavía no ha pasado. Pero sé que quiero vivirlo contigo.",
      en: "It hasn't happened yet. But I know I want to live it with you.",
    },
  },
  {
    image: "/images/memories/memory-05.png",
    title: { es: "LO QUE PROVOCAS", en: "WHAT YOU DO TO ME" },
    text: {
      es: "Hay momentos contigo en los que se me olvida todo lo que estaba haciendo. No sé exactamente cómo lo haces. Solo sé que tienes esa facilidad para cambiarme el ánimo.",
      en: "There are moments with you when I forget everything I was doing. I don't know exactly how you do it. I just know you have this way of changing my mood.",
    },
    date: "SIN AVISO",
    quote: {
      es: "Tienes una forma muy tuya de distraerme.",
      en: "You have a very particular way of distracting me.",
    },
  },
];
