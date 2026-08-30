import { motion } from 'framer-motion';
import { useGameologyMe } from '../../hooks/useGameology';

/**
 * LevelBadge — circular level chip with XP progress ring.
 *
 * Ring fills clockwise as you approach the next level. The inner number is
 * the level (1..50). On a level-up the ring flashes briefly with a glow.
 *
 * Level math (mirror of services/gameologyService.js):
 *   xpForLevel(L) = 100 * (L-1)^2
 *   progressToNextLevel = (xp - xpForLevel(L)) / (xpForLevel(L+1) - xpForLevel(L))
 */
const xpForLevel = (l) => 100 * Math.max(0, l - 1) ** 2;

const LevelBadge = ({ size = 44, compact = false }) => {
    const { data } = useGameologyMe();
    const xp = data?.xp || 0;
    const level = data?.level || 1;
    const cur = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const progress = Math.max(0, Math.min(1, (xp - cur) / Math.max(1, next - cur)));

    const stroke = 4;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - progress);

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-indigo-400/30 bg-surface/60 backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">L</span>
                <span className="text-xs font-bold tabular-nums text-indigo-200">{level}</span>
            </div>
        );
    }

    return (
        <div
            className="relative inline-flex items-center justify-center"
            style={{ width: size, height: size }}
            title={`Level ${level} · ${xp} XP`}
        >
            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth={stroke} />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="url(#levelGrad)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    initial={false}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                <defs>
                    <linearGradient id="levelGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7c83ff" />
                        <stop offset="100%" stopColor="#5eead4" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="relative flex flex-col items-center justify-center leading-none">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">L</span>
                <span className="text-base font-black tabular-nums text-text-primary">{level}</span>
            </div>
        </div>
    );
};

export default LevelBadge;
