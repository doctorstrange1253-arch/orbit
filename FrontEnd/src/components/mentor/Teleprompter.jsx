import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Minus, Plus, X, Type } from 'lucide-react';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const Teleprompter = ({ text, onClose }) => {
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(26);
  const scrollRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const runningRef = useRef(true);
  const speedRef = useRef(1);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { offsetRef.current = 0; if (scrollRef.current) scrollRef.current.style.transform = 'translateY(0px)'; }, [text]);

  useEffect(() => {
    const step = (ts) => {
      const prev = lastTsRef.current || ts;
      lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - prev) / 1000);
      const el = scrollRef.current;
      if (el && runningRef.current) {
        const limit = el.scrollHeight;
        offsetRef.current = Math.min(limit, offsetRef.current + speedRef.current * 46 * dt);
        el.style.transform = `translateY(${-offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, []);

  const restart = () => {
    offsetRef.current = 0;
    if (scrollRef.current) scrollRef.current.style.transform = 'translateY(0px)';
    setRunning(true);
  };

  return (
    <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}>
      <div className="absolute inset-x-0 top-0 h-[62%] overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(4,5,12,0.9) 0%, rgba(4,5,12,0.86) 70%, rgba(4,5,12,0) 100%)' }}>
        <div
          ref={scrollRef}
          className="px-[8%] pt-[16%] will-change-transform"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: `${fontSize}px`,
            lineHeight: 1.5,
            color: '#f4f4f8',
            whiteSpace: 'pre-wrap',
            textShadow: '0 2px 18px rgba(0,0,0,0.7)',
          }}
        >
          {text || 'Pick a lesson on the right, or paste your own script.'}
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-[40%] w-[84%] h-px" style={{ background: 'rgba(255,255,255,0.22)' }} />

      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1 px-2 py-1.5"
        style={{ pointerEvents: 'auto', background: 'rgba(6,8,16,0.92)', border: '1px solid rgba(255,255,255,0.14)' }}
      >
        <PromptButton onClick={() => setRunning((v) => !v)} label={running ? 'Pause' : 'Play'}>
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </PromptButton>
        <PromptButton onClick={restart} label="Restart"><RotateCcw className="w-3.5 h-3.5" /></PromptButton>
        <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.14)' }} />
        <PromptButton onClick={() => setSpeed((s) => Math.max(0.4, Math.round((s - 0.2) * 10) / 10))} label="Slower"><Minus className="w-3 h-3" /></PromptButton>
        <span style={{ ...MICRO, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'center' }}>{speed.toFixed(1)}&times;</span>
        <PromptButton onClick={() => setSpeed((s) => Math.min(3, Math.round((s + 0.2) * 10) / 10))} label="Faster"><Plus className="w-3 h-3" /></PromptButton>
        <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.14)' }} />
        <Type className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        <PromptButton onClick={() => setFontSize((f) => Math.max(15, f - 2))} label="Smaller text"><Minus className="w-3 h-3" /></PromptButton>
        <span style={{ ...MICRO, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'center' }}>{fontSize}</span>
        <PromptButton onClick={() => setFontSize((f) => Math.min(52, f + 2))} label="Larger text"><Plus className="w-3 h-3" /></PromptButton>
        <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.14)' }} />
        <PromptButton onClick={onClose} label="Close teleprompter"><X className="w-3.5 h-3.5" /></PromptButton>
      </div>
    </div>
  );
};

const PromptButton = ({ onClick, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="p-1.5 hover:bg-white/10"
    style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
  >
    {children}
  </button>
);

export default Teleprompter;
