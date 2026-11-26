import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getAuthenticReciter,
  getAvailableSurahsForReciter,
  getRecordingAudioUrl,
  getRecordingsForReciterSurah,
  loadDirectoryUserState,
  recordListeningHistoryEntry,
  toggleFavoriteReciterInState,
  toggleFavoriteRecordingInState,
  type AuthenticReciter,
  type DirectoryFavoriteAndHistoryState,
  type VerifiedRecordingEdition,
} from "@/lib/quran-reciters";
import { SURAHS_INDEX, type SurahPageEntry } from "@/lib/quran-mushaf";

export interface ActiveQuranTrack {
  reciterId: string;
  recordingId: string;
  surahId: number;
  audioUrl: string;
}

export interface QuranAudioErrorState {
  code: "network" | "decode" | "unsupported" | "playback_blocked";
  messageAr: string;
  messageEn: string;
}

export interface CustomQuranAudioMeta {
  id: string;
  titleAr: string;
  titleEn: string;
  reciterNameAr: string;
  reciterNameEn: string;
  format: "mp3" | "m4a";
  audioUrl: string;
  surahId?: number;
  sourceLabel?: string;
}

export interface QuranAudioContextValue {
  track: ActiveQuranTrack;
  activeReciter: AuthenticReciter;
  activeRecording: VerifiedRecordingEdition;
  activeSurah: SurahPageEntry;
  activeCustomTrack: CustomQuranAudioMeta | null;
  surahRecordings: VerifiedRecordingEdition[];
  availableSurahs: number[];
  isPlaying: boolean;
  isLoading: boolean;
  hasStartedSession: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  audioError: QuranAudioErrorState | null;
  userState: DirectoryFavoriteAndHistoryState;
  mediaSessionSupported: boolean;
  backgroundPlaybackActive: boolean;
  loadTrack: (params: {
    reciterId: string;
    surahId?: number;
    recordingId?: string;
    autoPlay?: boolean;
  }) => void;
  playCustomAudio: (custom: CustomQuranAudioMeta, autoPlay?: boolean) => void;
  selectRecordingId: (recordingId: string) => void;
  selectSurah: (surahId: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipNextSurah: () => void;
  skipPrevSurah: () => void;
  setVolume: (v: number) => void;
  setIsMuted: (muted: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  stopAndDismiss: () => void;
  toggleFavoriteReciter: (reciterId: string) => void;
  toggleFavoriteRecording: (key: string) => void;
}

const QuranAudioContext = createContext<QuranAudioContextValue | null>(null);

function resolveSafeTrack(params: {
  reciterId: string;
  surahId?: number;
  recordingId?: string;
}): ActiveQuranTrack {
  const reciter = getAuthenticReciter(params.reciterId);
  const availableSurahs = getAvailableSurahsForReciter(reciter);
  const safeSurahId =
    params.surahId && availableSurahs.includes(params.surahId)
      ? params.surahId
      : (availableSurahs[0] ?? 1);
  const surahRecordings = getRecordingsForReciterSurah(reciter.id, safeSurahId);
  const edition =
    (params.recordingId
      ? surahRecordings.find((ed) => ed.recordingId === params.recordingId)
      : undefined) ??
    surahRecordings[0] ??
    reciter.recordings[0]!;
  return {
    reciterId: reciter.id,
    recordingId: edition.recordingId,
    surahId: safeSurahId,
    audioUrl: getRecordingAudioUrl(edition, safeSurahId),
  };
}

function classifyMediaError(audio: HTMLAudioElement): QuranAudioErrorState {
  const code = audio.error?.code;
  if (code === 2) {
    return {
      code: "network",
      messageAr:
        "تعذر تحميل البث الصوتي بسبب انقطاع الشبكة أو رفض الخادم. يمكنك إعادة المحاولة أو اختيار تسجيل آخر.",
      messageEn:
        "Network interruption while streaming this Surah. Please check your connection, retry, or choose an alternate recording.",
    };
  }
  if (code === 3) {
    return {
      code: "decode",
      messageAr: "تعذر فك تشفير الملف الصوتي في المتصفح. جرّب تسجيلاً آخر لهذه السورة.",
      messageEn:
        "Browser audio decoding error for this stream. Try another verified edition for this Surah.",
    };
  }
  if (code === 4) {
    return {
      code: "unsupported",
      messageAr: "رابط البث الصوتي غير متوفر أو غير مدعوم حالياً من الخادم الخارجي.",
      messageEn:
        "Verified stream source is temporarily unreachable or unsupported by this browser.",
    };
  }
  return {
    code: "network",
    messageAr:
      "تعذر تشغيل التسجيل الصوتي من الخادم حالياً. يمكنك إعادة المحاولة أو اختيار إصدار آخر.",
    messageEn:
      "Unable to load this verified audio stream right now. Please retry or select an alternate recording.",
  };
}

export const QuranAudioProvider: React.FC<{
  children: React.ReactNode;
  initialReciterId?: string;
  initialSurahId?: number;
  initialRecordingId?: string;
}> = ({ children, initialReciterId = "al-luhaidan", initialSurahId = 1, initialRecordingId }) => {
  const [track, setTrack] = useState<ActiveQuranTrack>(() =>
    resolveSafeTrack({
      reciterId: initialReciterId,
      surahId: initialSurahId,
      ...(initialRecordingId !== undefined ? { recordingId: initialRecordingId } : {}),
    }),
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [activeCustomTrack, setActiveCustomTrack] = useState<CustomQuranAudioMeta | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [isMuted, setIsMutedState] = useState(false);
  const [isLooping, setIsLoopingState] = useState(false);
  const [audioError, setAudioError] = useState<QuranAudioErrorState | null>(null);
  const [userState, setUserState] = useState<DirectoryFavoriteAndHistoryState>(() =>
    loadDirectoryUserState(),
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoopingRef = useRef(isLooping);
  const isPlayingRef = useRef(isPlaying);
  const trackRef = useRef(track);
  const loadedSrcRef = useRef<string>("");
  const lastHistoryRecordedRef = useRef<string>("");

  isLoopingRef.current = isLooping;
  isPlayingRef.current = isPlaying;
  trackRef.current = track;

  const ensureAudioElement = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      return null;
    }
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      el.playbackRate = 1.0;
      el.volume = isMuted ? 0 : volume;
      if (typeof el.setAttribute === "function") {
        el.setAttribute("playsinline", "true");
        el.setAttribute("webkit-playsinline", "true");
        el.setAttribute("x-webkit-airplay", "allow");
      }
      el.id = "btc-persistent-quran-audio";
      if (
        typeof document !== "undefined" &&
        document.body &&
        typeof HTMLElement !== "undefined" &&
        el instanceof HTMLElement &&
        !document.getElementById("btc-persistent-quran-audio")
      ) {
        if (el.style) {
          el.style.position = "fixed";
          el.style.width = "0px";
          el.style.height = "0px";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.bottom = "0";
          el.style.left = "0";
        }
        try {
          document.body.appendChild(el);
        } catch {
          // Non-fatal
        }
      }
      audioRef.current = el;
    }
    return audioRef.current;
  }, [isMuted, volume]);

  // Keep background audio active when leaving tab or switching apps
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      if (isPlayingRef.current && audioRef.current) {
        if (audioRef.current.paused && audioRef.current.readyState >= 2) {
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const recordTrackHistory = useCallback((t: ActiveQuranTrack, positionSeconds: number) => {
    const key = `${t.reciterId}:${t.recordingId}:${t.surahId}`;
    if (lastHistoryRecordedRef.current === key && positionSeconds < 2) {
      return;
    }
    lastHistoryRecordedRef.current = key;
    setUserState((prev) =>
      recordListeningHistoryEntry(prev, {
        reciterId: t.reciterId,
        recordingId: t.recordingId,
        surahId: t.surahId,
        positionSeconds: Math.floor(positionSeconds),
      }),
    );
  }, []);

  const attemptPlay = useCallback(
    (audio: HTMLAudioElement, activeTrack: ActiveQuranTrack) => {
      if (audio.src !== activeTrack.audioUrl && loadedSrcRef.current !== activeTrack.audioUrl) {
        audio.src = activeTrack.audioUrl;
        loadedSrcRef.current = activeTrack.audioUrl;
      }
      audio.playbackRate = 1.0;
      setHasStartedSession(true);
      setIsLoading(true);
      setAudioError(null);

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setAudioError(null);
          recordTrackHistory(activeTrack, audio.currentTime || 0);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError({
            code: "playback_blocked",
            messageAr: "فشل بدء التلاوة. يرجى التحقق من اتصال الإنترنت ثم إعادة المحاولة.",
            messageEn: "Playback could not start. Check your internet connection and retry.",
          });
        });
    },
    [recordTrackHistory],
  );

  const activeReciter = useMemo(() => getAuthenticReciter(track.reciterId), [track.reciterId]);

  const surahRecordings = useMemo(
    () => getRecordingsForReciterSurah(activeReciter.id, track.surahId),
    [activeReciter.id, track.surahId],
  );

  const activeRecording = useMemo(
    () =>
      surahRecordings.find((r) => r.recordingId === track.recordingId) ??
      surahRecordings[0] ??
      activeReciter.recordings[0]!,
    [surahRecordings, track.recordingId, activeReciter.recordings],
  );

  const availableSurahs = useMemo(
    () => getAvailableSurahsForReciter(activeReciter),
    [activeReciter],
  );

  const activeSurah = useMemo(
    () => SURAHS_INDEX.find((s) => s.id === track.surahId) ?? SURAHS_INDEX[0]!,
    [track.surahId],
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    if (audio) {
      try {
        audio.currentTime = clamped;
      } catch {
        // Ignore seek errors before metadata is loaded
      }
    }
    setCurrentTime(clamped);
  }, []);

  const loadTrack = useCallback(
    (params: { reciterId: string; surahId?: number; recordingId?: string; autoPlay?: boolean }) => {
      const nextTrack = resolveSafeTrack(params);
      const isSameSource =
        !activeCustomTrack &&
        trackRef.current.reciterId === nextTrack.reciterId &&
        trackRef.current.recordingId === nextTrack.recordingId &&
        trackRef.current.surahId === nextTrack.surahId &&
        trackRef.current.audioUrl === nextTrack.audioUrl;

      const audio = ensureAudioElement();
      const shouldContinuePlaying =
        params.autoPlay === true || (params.autoPlay !== false && isPlayingRef.current);

      setActiveCustomTrack(null);
      setTrack(nextTrack);
      trackRef.current = nextTrack;

      if (!audio) return;

      if (!isSameSource) {
        audio.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        const verifiedDuration =
          getAuthenticReciter(nextTrack.reciterId).recordings.find(
            (ed) => ed.recordingId === nextTrack.recordingId,
          )?.surahDurationsSeconds?.[nextTrack.surahId] ?? 0;
        setDuration(verifiedDuration);
        setAudioError(null);
        audio.src = nextTrack.audioUrl;
        loadedSrcRef.current = nextTrack.audioUrl;
        audio.load();
        audio.playbackRate = 1.0;
      }

      if (shouldContinuePlaying) {
        attemptPlay(audio, nextTrack);
      }
    },
    [activeCustomTrack, attemptPlay, ensureAudioElement],
  );

  const playCustomAudio = useCallback(
    (custom: CustomQuranAudioMeta, autoPlay = true) => {
      const nextTrack: ActiveQuranTrack = {
        reciterId: custom.id.startsWith("mp3-luhaidan")
          ? "al-luhaidan"
          : trackRef.current.reciterId,
        recordingId: custom.id,
        surahId: custom.surahId ?? trackRef.current.surahId,
        audioUrl: custom.audioUrl,
      };
      setActiveCustomTrack(custom);
      setTrack(nextTrack);
      trackRef.current = nextTrack;
      setCurrentTime(0);
      setDuration(0);
      setAudioError(null);

      const audio = ensureAudioElement();
      if (!audio) return;
      audio.pause();
      audio.src = custom.audioUrl;
      loadedSrcRef.current = custom.audioUrl;
      audio.load();
      audio.playbackRate = 1.0;
      if (autoPlay) {
        attemptPlay(audio, nextTrack);
      }
    },
    [attemptPlay, ensureAudioElement],
  );

  const selectRecordingId = useCallback(
    (recordingId: string) => {
      loadTrack({
        reciterId: trackRef.current.reciterId,
        surahId: trackRef.current.surahId,
        recordingId,
      });
    },
    [loadTrack],
  );

  const selectSurah = useCallback(
    (surahId: number) => {
      loadTrack({
        reciterId: trackRef.current.reciterId,
        surahId,
        recordingId: trackRef.current.recordingId,
      });
    },
    [loadTrack],
  );

  const play = useCallback(() => {
    const audio = ensureAudioElement();
    if (!audio) return;
    attemptPlay(audio, trackRef.current);
  }, [attemptPlay, ensureAudioElement]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const stopAndDismiss = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Non-fatal
      }
    }
    setIsPlaying(false);
    setHasStartedSession(false);
    setCurrentTime(0);
    setAudioError(null);
  }, []);

  const skipSurahBy = useCallback(
    (delta: 1 | -1) => {
      const reciter = getAuthenticReciter(trackRef.current.reciterId);
      const surahs = getAvailableSurahsForReciter(reciter);
      if (surahs.length === 0) return;
      const idx = surahs.indexOf(trackRef.current.surahId);
      const nextIdx = idx === -1 ? 0 : (idx + delta + surahs.length) % surahs.length;
      const nextSurahId = surahs[nextIdx]!;
      loadTrack({
        reciterId: trackRef.current.reciterId,
        surahId: nextSurahId,
        recordingId: trackRef.current.recordingId,
        autoPlay: isPlayingRef.current,
      });
    },
    [loadTrack],
  );

  const skipNextSurah = useCallback(() => skipSurahBy(1), [skipSurahBy]);
  const skipPrevSurah = useCallback(() => skipSurahBy(-1), [skipSurahBy]);

  // Attach persistent Audio listeners once across AppLayout lifetime
  useEffect(() => {
    const audio = ensureAudioElement();
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleDurationChange = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(null);
    };
    const handlePlayEvent = () => {
      audio.playbackRate = 1.0;
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePauseEvent = () => {
      setIsPlaying(false);
    };
    const handleRateChange = () => {
      if (audio.playbackRate !== 1.0) {
        audio.playbackRate = 1.0;
      }
    };
    const handleEnded = () => {
      if (isLoopingRef.current) {
        audio.currentTime = 0;
        audio.playbackRate = 1.0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setAudioError(classifyMediaError(audio));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);
    audio.addEventListener("ratechange", handleRateChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
      audio.removeEventListener("ratechange", handleRateChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [ensureAudioElement]);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const mediaSessionSupported = typeof navigator !== "undefined" && "mediaSession" in navigator;

  // Browser Media Session API integration (lock-screen, notification shade, hardware keys)
  useEffect(() => {
    if (!mediaSessionSupported || !navigator.mediaSession) return;
    const ms = navigator.mediaSession;

    try {
      if (typeof MediaMetadata !== "undefined") {
        ms.metadata = new MediaMetadata({
          title: `${activeSurah.nameAr} · Surah ${activeSurah.nameEn} (${activeSurah.id})`,
          artist: `${activeReciter.nameAr} — ${activeReciter.nameEn}`,
          album: `${activeRecording.collectionTitleEn} (${activeRecording.sourceName})`,
          artwork: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        });
      }
    } catch {
      // Older WebViews may throw on MediaMetadata construction
    }

    try {
      ms.playbackState = isPlaying ? "playing" : hasStartedSession ? "paused" : "none";
    } catch {
      // Ignore unsupported property updates
    }
  }, [
    mediaSessionSupported,
    activeSurah.id,
    activeSurah.nameAr,
    activeSurah.nameEn,
    activeReciter.nameAr,
    activeReciter.nameEn,
    activeRecording.collectionTitleEn,
    activeRecording.sourceName,
    isPlaying,
    hasStartedSession,
  ]);

  // Bind Media Session hardware / OS action handlers
  useEffect(() => {
    if (!mediaSessionSupported || !navigator.mediaSession) return;
    const ms = navigator.mediaSession;

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler | null]> = [
      ["play", () => play()],
      ["pause", () => pause()],
      ["stop", () => stopAndDismiss()],
      ["previoustrack", () => skipPrevSurah()],
      ["nexttrack", () => skipNextSurah()],
      [
        "seekbackward",
        (details) => {
          const offset = details?.seekOffset ?? 10;
          seek((audioRef.current?.currentTime ?? 0) - offset);
        },
      ],
      [
        "seekforward",
        (details) => {
          const offset = details?.seekOffset ?? 10;
          seek((audioRef.current?.currentTime ?? 0) + offset);
        },
      ],
      [
        "seekto",
        (details) => {
          if (typeof details?.seekTime === "number") {
            seek(details.seekTime);
          }
        },
      ],
    ];

    for (const [action, handler] of handlers) {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Browser may not support a specific action (e.g. "seekto")
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          ms.setActionHandler(action, null);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [mediaSessionSupported, play, pause, stopAndDismiss, skipPrevSurah, skipNextSurah, seek]);

  // Sync position state to Media Session while playing or seeking
  useEffect(() => {
    if (!mediaSessionSupported || !navigator.mediaSession?.setPositionState) return;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const safePos = Math.min(Math.max(0, currentTime), duration);
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1.0,
        position: safePos,
      });
    } catch {
      // Non-fatal on browsers enforcing stricter timing bounds
    }
  }, [mediaSessionSupported, duration, currentTime]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (clamped > 0) setIsMutedState(false);
  }, []);

  const toggleFavoriteReciter = useCallback((reciterId: string) => {
    setUserState((prev) => toggleFavoriteReciterInState(prev, reciterId));
  }, []);

  const toggleFavoriteRecording = useCallback((key: string) => {
    setUserState((prev) => toggleFavoriteRecordingInState(prev, key));
  }, []);

  const value = useMemo<QuranAudioContextValue>(
    () => ({
      track,
      activeReciter,
      activeRecording,
      activeSurah,
      activeCustomTrack,
      surahRecordings,
      availableSurahs,
      isPlaying,
      isLoading,
      hasStartedSession,
      currentTime,
      duration,
      volume,
      isMuted,
      isLooping,
      audioError,
      userState,
      mediaSessionSupported,
      backgroundPlaybackActive: true,
      loadTrack,
      playCustomAudio,
      selectRecordingId,
      selectSurah,
      play,
      pause,
      togglePlay,
      seek,
      skipNextSurah,
      skipPrevSurah,
      setVolume,
      setIsMuted: setIsMutedState,
      setIsLooping: setIsLoopingState,
      stopAndDismiss,
      toggleFavoriteReciter,
      toggleFavoriteRecording,
    }),
    [
      track,
      activeReciter,
      activeRecording,
      activeSurah,
      activeCustomTrack,
      surahRecordings,
      availableSurahs,
      isPlaying,
      isLoading,
      hasStartedSession,
      currentTime,
      duration,
      volume,
      isMuted,
      isLooping,
      audioError,
      userState,
      mediaSessionSupported,
      loadTrack,
      playCustomAudio,
      selectRecordingId,
      selectSurah,
      play,
      pause,
      togglePlay,
      seek,
      skipNextSurah,
      skipPrevSurah,
      setVolume,
      stopAndDismiss,
      toggleFavoriteReciter,
      toggleFavoriteRecording,
    ],
  );

  return <QuranAudioContext.Provider value={value}>{children}</QuranAudioContext.Provider>;
};

export function useOptionalQuranAudio(): QuranAudioContextValue | null {
  return useContext(QuranAudioContext);
}

export function useQuranAudio(): QuranAudioContextValue {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) {
    throw new Error("useQuranAudio must be used inside <QuranAudioProvider>");
  }
  return ctx;
}
