import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings, Loader2, AlertCircle, SkipBack, SkipForward, Check, RotateCcw, RotateCw
} from 'lucide-react';

// ── YouTube IFrame API types ─────────────────────────────────────────────────
declare global {
    interface Window {
        YT: {
            Player: new (el: HTMLElement, cfg: YTConfig) => YTPlayer;
            PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}
interface YTConfig {
    width: string; height: string; videoId: string;
    playerVars: Record<string, unknown>;
    events: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number }) => void;
        onPlaybackQualityChange?: (e: { data: string }) => void;
    };
}
interface YTPlayer {
    playVideo(): void; pauseVideo(): void;
    seekTo(s: number, allowSeek: boolean): void;
    setVolume(v: number): void; mute(): void; unMute(): void;
    setPlaybackQuality(q: string): void;
    getAvailableQualityLevels(): string[];
    getCurrentTime(): number; getDuration(): number;
    getVideoLoadedFraction(): number; getPlayerState(): number;
    destroy(): void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
};

const QUALITY_LABELS: Record<string, string> = {
    default: 'Auto', highres: '4K', hd2160: '4K',
    hd1440: '1440p', hd1080: '1080p HD', hd720: '720p HD',
    large: '480p', medium: '360p', small: '240p', tiny: '144p',
};

// YouTube VQ param per quality label (for URL-based quality forcing)
const QUALITY_VQ: Record<string, string> = {
    default: 'hd1080', highres: 'highres', hd2160: 'hd2160',
    hd1440: 'hd1440', hd1080: 'hd1080', hd720: 'hd720',
    large: 'large', medium: 'medium', small: 'small', tiny: 'tiny',
};

import { loadYTApi } from '../lib/youtube';

function extractYTId(url: string): string {
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    if (url.includes('/embed/')) return url.split('/embed/')[1].split('?')[0];
    return url.split('/').pop()?.split('?')[0] ?? '';
}

function buildEmbedUrl(videoId: string, vq = 'hd1080', startSeconds = 0) {
    const origin = encodeURIComponent(window.location.origin);
    const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : '';
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}&autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&playsinline=1&fs=0&vq=${vq}${start}`;
}

interface VideoPlayerProps { url: string; poster?: string; }

export default function VideoPlayer({ url, poster }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const ytDivRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval>>();
    const hideTimer = useRef<ReturnType<typeof setTimeout>>();
    const tapTimer = useRef<ReturnType<typeof setTimeout>>();
    const lastTapRef = useRef<{ time: number; x: number } | null>(null);

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isGDrive = !isYouTube && (url.includes('drive.google.com') || (url.length > 15 && !url.includes('.')));
    const videoId = isYouTube ? extractYTId(url) : '';

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showQuality, setShowQuality] = useState(false);
    const [quality, setQuality] = useState('hd1080');
    const [availableQualities, setAvailableQualities] = useState<string[]>([]);
    const [showVol, setShowVol] = useState(false);
    const [ended, setEnded] = useState(false);
    const [ripple, setRipple] = useState<'left' | 'right' | null>(null);

    // Key used to force-recreate the iframe when quality changes
    const [embedKey, setEmbedKey] = useState(0);
    const resumeTimeRef = useRef(0);

    // ── YouTube IFrame API ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isYouTube || !ytDivRef.current) return;
        if (!videoId) { setError('Invalid YouTube URL.'); setLoading(false); return; }

        loadYTApi().then(() => {
            if (!ytDivRef.current) return;
            playerRef.current = new window.YT.Player(ytDivRef.current, {
                width: '100%', height: '100%', videoId,
                playerVars: {
                    autoplay: 1, controls: 0,
                    rel: 0,           // no related videos
                    modestbranding: 1,
                    showinfo: 0, iv_load_policy: 3,
                    playsinline: 1,
                    fs: 0,            // disable YouTube's own fullscreen btn
                    vq: QUALITY_VQ[quality] ?? 'hd1080',
                    start: Math.floor(resumeTimeRef.current),
                },
                events: {
                    onReady: (e) => {
                        setLoading(false);
                        // Try the API method too (works on some videos)
                        try { e.target.setPlaybackQuality(quality); } catch { /* ignore */ }
                        const qs = e.target.getAvailableQualityLevels?.();
                        if (qs?.length) setAvailableQualities(qs);
                        clearInterval(pollRef.current);
                        pollRef.current = setInterval(() => {
                            try {
                                const p = playerRef.current;
                                if (!p) return;
                                setCurrentTime(p.getCurrentTime());
                                const d = p.getDuration();
                                if (d > 0) setDuration(d);
                                setBuffered(p.getVideoLoadedFraction() * d);
                            } catch { /* ignore */ }
                        }, 500);
                    },
                    onStateChange: (e) => {
                        const S = window.YT?.PlayerState;
                        if (!S) return;
                        if (e.data === S.PLAYING) { setPlaying(true); setLoading(false); setEnded(false); }
                        if (e.data === S.PAUSED) setPlaying(false);
                        if (e.data === S.BUFFERING) setLoading(true);
                        if (e.data === S.ENDED) { setPlaying(false); setEnded(true); }
                        try {
                            const qs = playerRef.current?.getAvailableQualityLevels?.();
                            if (qs?.length) setAvailableQualities(qs);
                        } catch { /* ignore */ }
                    },
                    onPlaybackQualityChange: (e) => setQuality(e.data),
                },
            });
        });
        return () => {
            clearInterval(pollRef.current);
            try { playerRef.current?.destroy(); } catch { /* ignore */ }
            playerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, isYouTube, embedKey]);

    // ── Native video events ───────────────────────────────────────────────────
    useEffect(() => {
        const v = videoRef.current;
        if (!v || isYouTube || isGDrive) return;
        const h = (ev: string, fn: EventListener) => { v.addEventListener(ev, fn); return () => v.removeEventListener(ev, fn); };
        const cleanups = [
            h('timeupdate', () => setCurrentTime(v.currentTime)),
            h('durationchange', () => setDuration(v.duration)),
            h('play', () => { setPlaying(true); setEnded(false); }),
            h('pause', () => setPlaying(false)),
            h('waiting', () => setLoading(true)),
            h('playing', () => setLoading(false)),
            h('ended', () => { setPlaying(false); setEnded(true); }),
            h('progress', () => { if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1)); }),
        ];
        return () => cleanups.forEach(c => c());
    }, [isYouTube, isGDrive]);

    // ── HLS / direct ─────────────────────────────────────────────────────────
    useEffect(() => {
        const v = videoRef.current;
        if (!v || isYouTube || isGDrive) return;
        setLoading(true); setError(null);
        if (url.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(url); hls.attachMedia(v);
                hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false); v.play().catch(() => { }); });
                hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) { setError('Stream failed.'); setLoading(false); } });
                return () => hls.destroy();
            } else if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = url; }
            else { setError('HLS not supported.'); setLoading(false); }
        } else {
            v.src = url;
            const m = () => setLoading(false);
            const e = () => { setError('Failed to load.'); setLoading(false); };
            v.addEventListener('loadedmetadata', m); v.addEventListener('error', e);
            return () => { v.removeEventListener('loadedmetadata', m); v.removeEventListener('error', e); };
        }
    }, [url, isYouTube, isGDrive]);

    // ── Fullscreen ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fn = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fn);
        return () => document.removeEventListener('fullscreenchange', fn);
    }, []);

    // ── Auto-hide controls ────────────────────────────────────────────────────
    const bumpControls = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }, []);

    // ── Actions ──────────────────────────────────────────────────────────────
    const togglePlay = useCallback(() => {
        if (isYouTube) {
            playing ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo();
            setPlaying(p => !p);
        } else {
            const v = videoRef.current;
            if (!v) return;
            playing ? v.pause() : v.play();
        }
    }, [isYouTube, playing]);

    const skip = useCallback((secs: number) => {
        const t = Math.max(0, Math.min(duration, currentTime + secs));
        if (isYouTube) { playerRef.current?.seekTo(t, true); setCurrentTime(t); }
        else if (videoRef.current) videoRef.current.currentTime = t;
    }, [isYouTube, duration, currentTime]);

    const seekFromX = useCallback((clientX: number) => {
        if (!progressRef.current || !duration) return;
        const r = progressRef.current.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
        if (isYouTube) { playerRef.current?.seekTo(t, true); setCurrentTime(t); }
        else if (videoRef.current) videoRef.current.currentTime = t;
    }, [duration, isYouTube]);

    const setVol = useCallback((val: number) => {
        setVolume(val); setMuted(val === 0);
        if (isYouTube) {
            if (val === 0) playerRef.current?.mute();
            else { playerRef.current?.unMute(); playerRef.current?.setVolume(val); }
        } else if (videoRef.current) { videoRef.current.volume = val / 100; videoRef.current.muted = val === 0; }
    }, [isYouTube]);

    const toggleMute = useCallback(() => {
        const nm = !muted; setMuted(nm);
        if (isYouTube) nm ? playerRef.current?.mute() : playerRef.current?.unMute();
        else if (videoRef.current) videoRef.current.muted = nm;
    }, [isYouTube, muted]);

    // ── Quality change: rebuild iframe with new vq= param at current time ────
    const changeQuality = useCallback((q: string) => {
        setQuality(q);
        setShowQuality(false);
        if (isYouTube) {
            // First try the API (newer players may still support it)
            try { playerRef.current?.setPlaybackQuality(q); } catch { /* ignore */ }
            // Also rebuild the iframe with vq= at current timestamp to guarantee quality
            resumeTimeRef.current = currentTime;
            setLoading(true);
            setPlaying(false);
            clearInterval(pollRef.current);
            try { playerRef.current?.destroy(); } catch { /* ignore */ }
            playerRef.current = null;
            setEmbedKey(k => k + 1); // triggers useEffect to recreate YT.Player
        }
    }, [isYouTube, currentTime]);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
        else await document.exitFullscreen();
    }, []);

    const replayVideo = useCallback(() => {
        setEnded(false);
        if (isYouTube) { playerRef.current?.seekTo(0, true); playerRef.current?.playVideo(); }
        else if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); }
    }, [isYouTube]);

    // ── Double-tap / tap handler ──────────────────────────────────────────────
    const handleVideoClick = useCallback((clientX: number) => {
        const now = Date.now();
        const w = containerRef.current?.offsetWidth ?? window.innerWidth;
        const prev = lastTapRef.current;
        if (prev && now - prev.time < 300) {
            clearTimeout(tapTimer.current);
            lastTapRef.current = null;
            const isLeft = clientX < w / 2;
            skip(isLeft ? -10 : 10);
            setRipple(isLeft ? 'left' : 'right');
            setTimeout(() => setRipple(null), 700);
            bumpControls();
        } else {
            lastTapRef.current = { time: now, x: clientX };
            clearTimeout(tapTimer.current);
            tapTimer.current = setTimeout(() => {
                if (lastTapRef.current) { togglePlay(); bumpControls(); }
                lastTapRef.current = null;
            }, 300);
        }
    }, [skip, togglePlay, bumpControls]);

    // ── Google Drive ──────────────────────────────────────────────────────────
    if (isGDrive) {
        let id = url;
        if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
        else if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
        return (
            <div className="w-full h-full bg-black">
                <iframe src={`https://drive.google.com/file/d/${id}/preview`} className="w-full h-full border-none" allow="autoplay" allowFullScreen />
            </div>
        );
    }

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufPct = duration > 0 ? (buffered / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-black select-none overflow-hidden"
            onMouseMove={bumpControls}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {/* YouTube player — iframe is 82px taller than container; clip-path cuts the "More videos" strip */}
            {isYouTube && (
                <div
                    key={embedKey}
                    ref={ytDivRef}
                    className="absolute top-0 left-0 right-0 pointer-events-none [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
                    style={{
                        bottom: '-82px',
                        clipPath: 'inset(0 0 82px 0)',
                        WebkitClipPath: 'inset(0 0 82px 0)',
                    }}
                />
            )}

            {/* Native video */}
            {!isYouTube && (
                <video ref={videoRef} className="w-full h-full object-contain" poster={poster} autoPlay playsInline />
            )}

            {/* Click capture layer — sits above iframe, below controls */}
            <div
                className="absolute inset-0 z-10"
                onClick={(e) => { if ((e.target as HTMLElement).closest('[data-controls]')) return; handleVideoClick(e.clientX); }}
                onTouchEnd={(e) => { if ((e.target as HTMLElement).closest('[data-controls]')) return; e.preventDefault(); const t = e.changedTouches[0]; if (t) handleVideoClick(t.clientX); }}
            />

            {/* Double-tap ripple LEFT */}
            {ripple === 'left' && (
                <div className="absolute left-0 inset-y-0 w-1/2 z-20 flex items-center justify-center pointer-events-none animate-fade-out">
                    <div className="flex flex-col items-center gap-2 text-white drop-shadow-lg">
                        <RotateCcw size={52} strokeWidth={2.5} />
                        <span className="text-xl font-black">-10 sec</span>
                    </div>
                </div>
            )}
            {/* Double-tap ripple RIGHT */}
            {ripple === 'right' && (
                <div className="absolute right-0 inset-y-0 w-1/2 z-20 flex items-center justify-center pointer-events-none animate-fade-out">
                    <div className="flex flex-col items-center gap-2 text-white drop-shadow-lg">
                        <RotateCw size={52} strokeWidth={2.5} />
                        <span className="text-xl font-black">+10 sec</span>
                    </div>
                </div>
            )}

            {/* Spinner */}
            {loading && !error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 pointer-events-none">
                    <Loader2 className="text-white animate-spin" size={52} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80">
                    <AlertCircle size={44} className="text-red-400" />
                    <p className="text-white font-bold text-lg">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-black rounded-lg">Retry</button>
                </div>
            )}

            {/* ════ END SCREEN — z-[35] so it covers YouTube's suggestion grid ════ */}
            {ended && (
                <div className="absolute inset-0 z-[35] bg-black flex items-center justify-center">
                    <button
                        onClick={replayVideo}
                        className="flex flex-col items-center gap-4 text-white hover:scale-105 transition-transform"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                            <Play size={40} fill="white" />
                        </div>
                        <span className="font-black text-2xl tracking-wide">Watch Again</span>
                    </button>
                </div>
            )}

            {/* ════ CUSTOM CONTROLS — z-[40] ════ */}
            <div
                data-controls
                className={`absolute inset-x-0 bottom-0 z-[40] transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
                <div className="relative px-5 pb-5 pt-16">

                    {/* Seek bar */}
                    <div
                        ref={progressRef}
                        className="group/bar relative h-1.5 hover:h-2.5 bg-white/25 rounded-full cursor-pointer mb-5 transition-all duration-150"
                        onClick={(e) => { e.stopPropagation(); seekFromX(e.clientX); }}
                        onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; if (t) seekFromX(t.clientX); }}
                        onTouchMove={(e) => { e.stopPropagation(); const t = e.touches[0]; if (t) seekFromX(t.clientX); }}
                    >
                        {/* Buffer */}
                        <div className="absolute left-0 top-0 h-full bg-white/30 rounded-full" style={{ width: `${bufPct}%` }} />
                        {/* Played */}
                        <div className="absolute left-0 top-0 h-full bg-[#00a8e1] rounded-full" style={{ width: `${pct}%` }} />
                        {/* Thumb */}
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none" style={{ left: `${pct}%` }} />
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between">
                        {/* Left */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all" title="-10s">
                                <SkipBack size={22} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/50 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                            >
                                {playing
                                    ? <Pause size={22} fill="white" stroke="white" />
                                    : <Play size={22} fill="white" stroke="white" className="ml-0.5" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all" title="+10s">
                                <SkipForward size={22} />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2" onMouseEnter={() => setShowVol(true)} onMouseLeave={() => setShowVol(false)}>
                                <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all">
                                    {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${showVol ? 'w-24 md:w-28 opacity-100' : 'w-0 opacity-0'}`}>
                                    <input type="range" min={0} max={100} value={muted ? 0 : volume}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => { e.stopPropagation(); setVol(Number(e.target.value)); }}
                                        className="w-full accent-[#00a8e1] cursor-pointer" />
                                </div>
                            </div>

                            <span className="text-white/70 text-sm font-mono hidden sm:block">
                                {fmt(currentTime)} / {fmt(duration)}
                            </span>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Quality selector — YouTube only */}
                            {isYouTube && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowQuality(q => !q); }}
                                        className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-black bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 rounded-lg transition-all"
                                    >
                                        <Settings size={15} className={showQuality ? 'text-[#00a8e1]' : ''} />
                                        <span className="hidden sm:inline">{QUALITY_LABELS[quality] ?? quality}</span>
                                    </button>
                                    {showQuality && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-[#0d1520] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[155px]" onClick={(e) => e.stopPropagation()}>
                                            <div className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#8197a4] border-b border-white/5">
                                                Video Quality
                                            </div>
                                            {(availableQualities.length > 0
                                                ? availableQualities
                                                : ['hd1080', 'hd720', 'large', 'medium', 'small', 'default']
                                            ).map(q => (
                                                <button
                                                    key={q}
                                                    onClick={(e) => { e.stopPropagation(); changeQuality(q); }}
                                                    className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm font-bold transition-colors hover:bg-white/10 ${quality === q ? 'text-[#00a8e1]' : 'text-white/80'}`}
                                                >
                                                    {QUALITY_LABELS[q] ?? q}
                                                    {quality === q && <Check size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all" title="Fullscreen">
                                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
