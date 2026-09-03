import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Check, Loader2, RotateCcw } from 'lucide-react';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';
import { normalizeCuts, cutTotal, skipTarget, toEffective, fromEffective } from '../../studio/cuts';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const RATE_KEY = 'orbit-lesson-rate';

const MONO_MICRO = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.56rem',
    letterSpacing: '0.16em',
    fontWeight: 700,
    textTransform: 'uppercase',
};

function readStoredRate() {
    if (typeof window === 'undefined') return 1;
    const raw = Number(window.localStorage.getItem(RATE_KEY));
    return SPEEDS.includes(raw) ? raw : 1;
}

function fmt(sec) {
    if (!Number.isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

const LessonPlayer = ({ lesson, onComplete, isCompleted, isMarkingComplete }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [rate, setRate] = useState(readStoredRate);
    const [rateOpen, setRateOpen] = useState(false);
    const [clock, setClock] = useState({ at: 0, total: 0 });
    const completeFiredRef = useRef(false);

    const cuts = useMemo(() => normalizeCuts(lesson?.cuts), [lesson?.cuts]);
    const cutsRef = useRef(cuts);
    useEffect(() => { cutsRef.current = cuts; }, [cuts]);

    useEffect(() => {
        completeFiredRef.current = false;
        setProgress(0);
        setError(null);
        setClock({ at: 0, total: 0 });
    }, [lesson?._id]);

    useEffect(() => {
        const v = videoRef.current;
        if (v) v.playbackRate = rate;
        if (typeof window !== 'undefined') window.localStorage.setItem(RATE_KEY, String(rate));
    }, [rate, lesson?._id]);

    const handleTimeUpdate = () => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const jump = skipTarget(cutsRef.current, v.currentTime);
        if (jump !== null) {
            v.currentTime = Math.min(v.duration, jump);
            return;
        }
        const total = Math.max(0.001, v.duration - cutTotal(cutsRef.current));
        const at = Math.min(total, toEffective(cutsRef.current, v.currentTime));
        const pct = (at / total) * 100;
        setProgress(pct);
        setClock({ at, total });
        if (!completeFiredRef.current && pct >= 90 && onComplete) {
            completeFiredRef.current = true;
            Haptic.medium();
            SoulSound.levelUp({ soul: 'student' });
            onComplete();
        }
    };

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
        else            { v.pause(); setPlaying(false); }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const fullscreen = () => {
        const v = videoRef.current;
        if (v?.requestFullscreen) v.requestFullscreen().catch(() => {});
    };

    const nudge = (delta) => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const total = Math.max(0, v.duration - cutTotal(cutsRef.current));
        const at = Math.min(total, Math.max(0, toEffective(cutsRef.current, v.currentTime) + delta));
        v.currentTime = Math.min(v.duration, fromEffective(cutsRef.current, at));
    };

    const seek = (e) => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const total = Math.max(0, v.duration - cutTotal(cutsRef.current));
        v.currentTime = Math.min(v.duration, fromEffective(cutsRef.current, pct * total));
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            if (e.key === 'ArrowLeft') nudge(-5);
            if (e.key === 'ArrowRight') nudge(5);
            if (e.key === '[') setRate((r) => SPEEDS[Math.max(0, SPEEDS.indexOf(r) - 1)]);
            if (e.key === ']') setRate((r) => SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(r) + 1)]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);


    if (!lesson?.videoUrl) {
        return (
            <div className="aspect-video rounded-xl bg-surface/40 border border-border-subtle flex flex-col items-center justify-center text-text-muted text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading lesson…
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden bg-black border border-border-subtle shadow-2xl">
            <div className="relative aspect-video">
                <video
                    ref={videoRef}
                    src={lesson.videoUrl}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={() => setError("This video failed to load.")}
                    playsInline
                />
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
                        {error}
                    </div>
                )}
            </div>

            <div className="px-3 py-2 bg-surface/90 backdrop-blur-sm">
                <div
                    className="relative h-1.5 rounded-full bg-border-subtle/60 overflow-hidden cursor-pointer"
                    onClick={seek}
                >
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-accent/15 text-text-primary" aria-label={playing ? 'Pause' : 'Play'}>
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => nudge(-10)} className="p-1.5 rounded-full hover:bg-accent/15 text-text-secondary" aria-label="Back 10 seconds">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-accent/15 text-text-secondary" aria-label={muted ? 'Unmute' : 'Mute'}>
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span style={{ ...MONO_MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(clock.at)} / {fmt(clock.total)}
                    </span>

                    <div className="relative">
                        <button
                            onClick={() => setRateOpen((v) => !v)}
                            aria-label={`Playback speed ${rate}x`}
                            aria-expanded={rateOpen}
                            className="px-2 py-1"
                            style={{
                                ...MONO_MICRO,
                                color: rate === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                                background: 'transparent',
                                border: `1px solid ${rate === 1 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.36)'}`,
                                cursor: 'pointer',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {rate}&times;
                        </button>
                        {rateOpen && (
                            <div
                                className="absolute bottom-full mb-2 left-0 z-20"
                                style={{ background: 'rgba(8,10,18,0.97)', border: '1px solid rgba(255,255,255,0.14)', minWidth: 72 }}
                                role="listbox"
                            >
                                {SPEEDS.map((s) => (
                                    <button
                                        key={s}
                                        role="option"
                                        aria-selected={s === rate}
                                        onClick={() => { setRate(s); setRateOpen(false); }}
                                        className="block w-full text-left px-3 py-1.5"
                                        style={{
                                            ...MONO_MICRO,
                                            color: s === rate ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                                            cursor: 'pointer',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {s}&times;{s === 1 ? ' · normal' : ''}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                                <Check className="w-3.5 h-3.5" /> Complete
                            </span>
                        ) : (
                            <button
                                onClick={onComplete}
                                disabled={isMarkingComplete}
                                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-pill bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 disabled:opacity-50"
                            >
                                {isMarkingComplete ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Mark complete
                            </button>
                        )}
                        <button onClick={fullscreen} className="p-1.5 rounded-full hover:bg-accent/15 text-text-secondary" aria-label="Fullscreen">
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
