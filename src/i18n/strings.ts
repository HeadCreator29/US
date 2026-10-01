export type Language = 'es' | 'en';

export const STRINGS = {
  introSubtitle: {
    es: 'HECHA PARA UNA SOLA PERSONA.',
    en: 'MADE FOR ONE PERSON.',
  },
  playSong: {
    es: 'TOCA NUESTRA CANCIÓN',
    en: 'PLAY OUR SONG',
  },
  loginTitle: {
    es: 'ACCESO PRIVADO',
    en: 'PRIVATE ACCESS',
  },
  loginSubtitle: {
    es: 'Este lugar solo existe para nosotros.',
    en: 'This place only exists for us.',
  },
  loginName: {
    es: 'NOMBRE',
    en: 'NAME',
  },
  loginPassword: {
    es: 'CONTRASEÑA',
    en: 'PASSWORD',
  },
  loginNote: {
    es: 'ACCESO CONCEDIDO SOLO A DOS PERSONAS.',
    en: 'ACCESS GRANTED ONLY TO TWO PEOPLE.',
  },
  loginEnter: {
    es: 'ENTRAR',
    en: 'ENTER',
  },
  loginVerifying: {
    es: 'VERIFICANDO…',
    en: 'VERIFYING…',
  },
  accessDenied: {
    es: 'ACCESO DENEGADO',
    en: 'ACCESS DENIED',
  },
  accessDeniedHint: {
    es: 'Quizá olvidaste lo especial que eres.',
    en: 'Maybe you forgot how special you are.',
  },
  accessGranted: {
    es: 'ACCESO CONCEDIDO',
    en: 'ACCESS GRANTED',
  },
  welcome: {
    es: 'BIENVENIDA',
    en: 'WELCOME',
  },
  archiveIntro: {
    es: 'Hay cosas que es mejor guardar entre dos personas.',
    en: 'Some things are better kept between two people.',
  },
  back: {
    es: 'VOLVER',
    en: 'BACK',
  },
  backToStart: {
    es: 'VOLVER AL INICIO',
    en: 'BACK TO START',
  },
  tapToOpen: {
    es: 'TOCA PARA ABRIR',
    en: 'TAP TO OPEN',
  },
  open: {
    es: 'ABRIR',
    en: 'OPEN',
  },
  endOfArchive: {
    es: 'FIN DEL ARCHIVO',
    en: 'END OF ARCHIVE',
  },
  butNotStory: {
    es: 'PERO NO DE LA HISTORIA.',
    en: 'BUT NOT THE STORY.',
  },
  ourSong: {
    es: 'NUESTRA CANCIÓN',
    en: 'OUR SONG',
  },
  mute: {
    es: 'Silenciar',
    en: 'Mute',
  },
  unmute: {
    es: 'Activar sonido',
    en: 'Unmute',
  },
  sectionMemories: {
    es: 'MIS OJOS',
    en: 'MY EYES',
  },
  sectionUs: {
    es: 'NOSOTROS',
    en: 'US',
  },
  sectionThings: {
    es: '10 COSAS',
    en: '10 THINGS',
  },
  sectionThingsFull: {
    es: '10 COSAS QUE QUIERO CONTIGO',
    en: '10 THINGS I WANT WITH YOU',
  },
  sectionAfterDark: {
    es: 'AFTER DARK',
    en: 'AFTER DARK',
  },
  sectionFinal: {
    es: 'UNA ÚLTIMA COSA',
    en: 'ONE LAST THING',
  },
  usIntro: {
    es: 'Hay cosas de nosotros que solo tienen sentido para nosotros.',
    en: 'There are things about us that make sense only to us.',
  },
  afterDarkIntro: {
    es: 'Hay una versión de mí que solo aparece cuando estoy contigo.',
    en: "There is a version of me that only comes out when I'm with you.",
  },
  audioNotFound: {
    es: 'Archivo de audio no encontrado. Coloca tu canción en /public/audio/our-song.mp3',
    en: 'Audio file not found. Place your song at /public/audio/our-song.mp3',
  },
  audioBlocked: {
    es: 'El navegador bloqueó la reproducción. Toca el botón de nuevo.',
    en: 'Browser blocked playback. Tap the button again.',
  },
  audioFormat: {
    es: 'Formato de audio no soportado.',
    en: 'Audio format not supported.',
  },
  audioInterrupted: {
    es: 'Reproducción interrumpida. Intenta de nuevo.',
    en: 'Playback interrupted. Try again.',
  },
  audioGeneric: {
    es: 'No se pudo reproducir. Intenta de nuevo.',
    en: 'Could not play. Try again.',
  },
  adminTitle: {
    es: 'ESTADÍSTICAS',
    en: 'STATISTICS',
  },
  adminTotal: {
    es: 'VISITAS TOTALES',
    en: 'TOTAL VISITS',
  },
  adminFirst: {
    es: 'PRIMERA VISITA',
    en: 'FIRST VISIT',
  },
  adminLast: {
    es: 'ÚLTIMA VISITA',
    en: 'LAST VISIT',
  },
  adminReset: {
    es: 'REINICIAR',
    en: 'RESET',
  },
  adminEmpty: {
    es: 'Sin visitas registradas',
    en: 'No visits recorded',
  },
  adminLoading: {
    es: 'Cargando visitas globales…',
    en: 'Loading global visits…',
  },
  adminLocalFallback: {
    es: 'Mostrando visitas de este dispositivo (global no disponible).',
    en: 'Showing visits from this device (global unavailable).',
  },
} as const;

export type StringKey = keyof typeof STRINGS;
