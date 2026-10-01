import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AudioControllerReturn {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  setVolume: (vol: number) => void;
  error: string | null;
}

// ---- Singleton global: UNA sola instancia para toda la experiencia ----
let sharedAudio: HTMLAudioElement | null = null;
let sharedVolume = 0.3;
let sharedMuted = false;

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio('/audio/our-song.mp3');
    sharedAudio.loop = true;
    sharedAudio.volume = sharedVolume;
    sharedAudio.muted = sharedMuted;
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

export function useAudioController(): AudioControllerReturn {
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(sharedMuted);
  const [volume, setVolumeState] = useState(sharedVolume);
  const [error, setError] = useState<string | null>(null);
  const loadAttemptedRef = useRef(false);

  useEffect(() => {
    const audio = getSharedAudio();
    audioRef.current = audio;

    // Sincronizar estado local con el singleton (por si otra pantalla ya lo usó)
    setIsPlaying(!audio.paused);
    setIsMuted(audio.muted);
    setVolumeState(audio.volume);

    const onCanPlay = () => {
      if (loadAttemptedRef.current) setError(null);
    };
    const onError = () => {
      if (loadAttemptedRef.current) {
        setError(tRef.current('audioNotFound'));
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setIsMuted(audio.muted);
      setVolumeState(audio.volume);
    };

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('volumechange', onVolumeChange);

    // Precargar una sola vez, sin destruir en cleanup (StrictMode-safe)
    if (audio.readyState === 0 && audio.networkState === 0) {
      try { audio.load(); } catch { /* noop */ }
    }

    return () => {
      // Solo remover listeners. NUNCA pausar ni vaciar src acá:
      // el audio debe sobrevivir entre Intro -> Login -> Archive.
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  const play = useCallback(async () => {
    const audio = getSharedAudio();
    audioRef.current = audio;
    loadAttemptedRef.current = true;
    try {
      await audio.play();
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError(tRef.current('audioBlocked'));
        } else if (err.name === 'NotSupportedError') {
          setError(tRef.current('audioFormat'));
        } else if (err.name === 'AbortError') {
          setError(tRef.current('audioInterrupted'));
        } else {
          setError(tRef.current('audioGeneric'));
        }
      }
      // No relanzamos: el flujo de pantallas nunca debe bloquearse por audio.
    }
  }, []);

  const pause = useCallback(() => {
    getSharedAudio().pause();
  }, []);

  const toggleMute = useCallback(() => {
    const audio = getSharedAudio();
    audio.muted = !audio.muted;
    sharedMuted = audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    sharedVolume = clamped;
    const audio = getSharedAudio();
    audio.volume = clamped;
    setVolumeState(clamped);
  }, []);

  return { play, pause, toggleMute, isPlaying, isMuted, volume, setVolume, error };
}
