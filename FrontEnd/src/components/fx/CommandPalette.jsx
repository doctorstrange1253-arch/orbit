/**
 * CommandPalette.jsx — Global ⌘K / Ctrl+K command palette.
 *
 * Fuzzy-search across three indexes:
 *   1. NAVIGATION — every page the user can reach (per-role window nav +
 *      shared pages). Selecting one calls navigate() and closes the palette.
 *   2. ACTIONS    — quick commands like "Toggle theme", "Mute music",
 *      "Mute sounds". Selecting one runs the handler and closes.
 *   3. SKILLS     — top matches from the user's browse list, when present.
 *
 * No external dep (we use a tiny inline scorer) so the bundle stays small.
 * Recent items persist in localStorage (key: 'orbit-palette-recent',
 * max 5). Keyboard nav: ↑/↓ to move, ↵ to select, Esc to close.
 *
 * Mounted once in App.jsx (or Layout). The palette opens via the
 * `useCommandPalette` store — anywhere in the app can call
 * `openPalette('skills')` or `closePalette()` to control it.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Search, Sun, Moon, Volume2, VolumeX, Music, Music2,
    Compass, Home, Settings, Rocket, Trophy, ShoppingBag,
    GraduationCap, Calendar, Wallet, Bookmark, History,
    Layers, Handshake, Users, Map, Phone, ShieldCheck,
    Sparkles, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import useAppearanceStore from '../../store/appearanceStore';
import soundManager from '../../utils/soundManager';
import api from '../../services/api';

const RECENT_KEY = 'orbit-palette-recent';

const usePaletteStore = create((set) => ({
    open: false, scope: 'all',
    openPalette: (scope = 'all') => set({ open: true, scope }),
    closePalette: () => set({ open: false }),
}));

// ── Fuzzy scorer ──────────────────────────────────────────────────────
// Rewards: start-of-string match (+10), exact match (+50), consecutive
// match (+5/char), char-after-separator (+3). Substring fallback gives
// a small base. Pure JS, no dep.
const score = (q, s) => {
    if (!q) return 1;
    const Q = q.toLowerCase();
    const S = s.toLowerCase();
    if (S === Q) return 1000;
    if (S.startsWith(Q)) return 100;
    let qi = 0, total = 0, prevMatch = false;
    for (let i = 0; i < S.length && qi < Q.length; i++) {
        if (S[i] === Q[qi]) {
            total += prevMatch ? 5 : 1;
            if (i === 0 || /[\s_\-/]/.test(S[i - 1])) total += 3;
            prevMatch = true;
            qi++;
        } else {
            prevMatch = false;
        }
    }
    return qi === Q.length ? total : 0;
};

const NAV_PEER = [
    { name: 'Skills',       path: '/peer/dashboard',   Icon: Layers,      section: 'Peer' },
    { name: 'Browse',       path: '/peer/browse',      Icon: Compass,     section: 'Peer' },
    { name: 'Matches',      path: '/peer/matches',     Icon: Handshake,   section: 'Peer' },
    { name: 'Connections',  path: '/peer/connections', Icon: Users,       section: 'Peer' },
    { name: 'Nearby',       path: '/peer/nearby',      Icon: Map,         section: 'Peer' },
    { name: 'Calls',        path: '/peer/calls',       Icon: Phone,       section: 'Peer' },
    { name: 'Trust',        path: '/peer/trust',       Icon: ShieldCheck, section: 'Peer' },
    { name: 'Orbit',        path: '/orbit',            Icon: Rocket,      section: 'Shared' },
    { name: 'Leaderboard',  path: '/leaderboard',      Icon: Trophy,      section: 'Shared' },
    { name: 'Shop',         path: '/shop',             Icon: ShoppingBag, section: 'Shared' },
];
const NAV_MENTOR = [
    { name: 'Teach',        path: '/mentor/hub',       Icon: GraduationCap, section: 'Mentor' },
    { name: 'My Sessions',  path: '/mentor/sessions',  Icon: Calendar,      section: 'Mentor' },
    { name: 'Earnings',     path: '/mentor/earnings',  Icon: Wallet,        section: 'Mentor' },
];
const NAV_STUDENT = [
    { name: 'My Sessions',  path: '/student/sessions',                Icon: Calendar, section: 'Student' },
    { name: 'Browse Mentors', path: '/student/mentors',              Icon: Compass,  section: 'Student' },
];
const NAV_SHARED = [
    { name: 'Home',         path: '/',                 Icon: Home,       section: 'Shared' },
    { name: 'Profile',      path: '/profile',          Icon: Users,      section: 'Shared' },
    { name: 'Settings',     path: '/settings',         Icon: Settings,   section: 'Shared' },
    { name: 'HoloBay',      path: '/holobay',          Icon: Sparkles,   section: 'Shared' },
    { name: 'Observatory',  path: '/observatory',      Icon: Sparkles,   section: 'Shared' },
    { name: 'Cosmic Atlas', path: '/cosmic-atlas',     Icon: Sparkles,   section: 'Shared' },
];

const buildNavigation = (user) => {
    const roles = Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles : ['peer_learner'];
    const items = [...NAV_PEER, ...NAV_SHARED];
    if (roles.includes('mentor'))  items.push(...NAV_MENTOR);
    if (roles.includes('student')) items.push(...NAV_STUDENT);
    return items;
};

const CommandPalette = () => {
    const navigate  = useNavigate();
    const open      = usePaletteStore((s) => s.open);
    const close     = usePaletteStore(() => usePaletteStore.getState().closePalette);
    const user      = useAuthStore((s) => s.user);
    const isDark    = useThemeStore((s) => s.isDark);
    const toggleTh  = useThemeStore((s) => s.toggleTheme);
    const setBg     = useAppearanceStore((s) => s.setBackgroundStyle);
    const [query, setQuery] = useState('');
    const [cursor, setCursor] = useState(0);
    const [recent, setRecent] = useState(() => {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
    });
    const inputRef = useRef(null);

    // Build the candidate list. We always include navigation + actions;
    // skill matches are lazy-loaded when the query is non-empty.
    const [skillMatches, setSkillMatches] = useState([]);
    useEffect(() => {
        if (!open || query.length < 2) { setSkillMatches([]); return; }
        let cancelled = false;
        const t = setTimeout(() => {
            api.get(`/skills/all?q=${encodeURIComponent(query)}`)
                .then((r) => { if (!cancelled) setSkillMatches((r.data?.items || []).slice(0, 5)); })
                .catch(() => { if (!cancelled) setSkillMatches([]); });
        }, 180);
        return () => { cancelled = true; clearTimeout(t); };
    }, [open, query]);

    const actions = useMemo(() => ([
        {
            id: 'theme',
            name: isDark ? 'Switch to light theme' : 'Switch to dark theme',
            Icon: isDark ? Sun : Moon,
            section: 'Actions',
            run: () => { toggleTh(); soundManager.play('click'); },
        },
        {
            id: 'bg-cycle',
            name: 'Cycle background style',
            Icon: Sparkles,
            section: 'Actions',
            run: () => {
                const styles = ['constellation','gradient','mesh','particles','matrix','waves','neural','minimal'];
                const cur = useAppearanceStore.getState().backgroundStyle || 'constellation';
                const i = styles.indexOf(cur);
                setBg(styles[(i + 1) % styles.length]);
                soundManager.play('click');
            },
        },
        {
            id: 'sounds',
            name: 'Toggle UI sounds',
            Icon: Volume2,
            section: 'Actions',
            run: () => {
                const next = !soundManager.soundsEnabled;
                soundManager.soundsEnabled = next;
                try { localStorage.setItem('skillswap-sounds-enabled', JSON.stringify(next)); } catch {}
                soundManager.play(next ? 'click' : 'close');
            },
        },
        {
            id: 'music',
            name: 'Toggle ambient music',
            Icon: Music,
            section: 'Actions',
            run: () => {
                const next = !soundManager.musicEnabled;
                soundManager.musicEnabled = next;
                try { localStorage.setItem('skillswap-music-enabled', JSON.stringify(next)); } catch {}
                if (next) soundManager.startAmbientMusic();
                else soundManager.stopAmbientMusic();
            },
        },
    ]), [isDark, toggleTh, setBg]);

    const navigation = useMemo(() => buildNavigation(user), [user]);

    // Score + sort. We also prepend recent items at the top if there's no
    // query, so the palette feels "yours" on first open.
    const candidates = useMemo(() => {
        const all = [
            ...navigation.map((n) => ({ ...n, kind: 'navigation' })),
            ...actions.map((a) => ({ ...a, kind: 'action' })),
            ...skillMatches.map((s) => ({
                id: `skill-${s._id || s.id}`,
                name: s.skillOffered || s.title || s.skill || 'Skill',
                Icon: Sparkles,
                section: 'Skills',
                kind: 'skill',
                path: `/peer/browse?q=${encodeURIComponent(s.skillOffered || s.title || '')}`,
            })),
        ];
        if (!query) {
            // Boost recents to the top.
            const recSet = new Set(recent);
            const rec = all.filter((c) => recSet.has(c.path || c.id));
            const others = all.filter((c) => !recSet.has(c.path || c.id));
            return [...rec, ...others].slice(0, 8);
        }
        return all
            .map((c) => ({ c, s: Math.max(score(query, c.name), score(query, c.section || '')) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 8)
            .map((x) => x.c);
    }, [query, navigation, actions, skillMatches, recent]);

    // Reset cursor when results change.
    useEffect(() => { setCursor(0); }, [query, open]);
    // Autofocus on open.
    useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

    // Global keybindings: ⌘K / Ctrl+K to toggle, Esc to close.
    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (usePaletteStore.getState().open) close();
                else usePaletteStore.getState().openPalette();
                return;
            }
            if (!usePaletteStore.getState().open) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(candidates.length - 1, c + 1)); return; }
            if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); return; }
            if (e.key === 'Enter')     { e.preventDefault(); if (candidates[cursor]) run(candidates[cursor]); return; }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [candidates, cursor, close]);

    const run = (item) => {
        soundManager.play('click');
        if (item.kind === 'action') { item.run?.(); }
        else if (item.path) {
            navigate(item.path);
            // Persist to recents.
            const key = item.path;
            setRecent((r) => {
                const next = [key, ...r.filter((x) => x !== key)].slice(0, 5);
                try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
                return next;
            });
        }
        close();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[200] flex items-start justify-center pt-[14vh] px-4"
                    onClick={close}
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-xl rounded-2xl border border-border-subtle bg-surface/95 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="Command palette"
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                            <Search className="w-4 h-4 text-text-muted" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search pages, skills, or run a command…"
                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-muted"
                            />
                            <kbd className="hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border border-border-subtle text-text-muted">
                                ESC
                            </kbd>
                        </div>
                        {candidates.length === 0 ? (
                            <div className="px-4 py-8 text-center text-text-muted text-sm">
                                No matches. Try a different word.
                            </div>
                        ) : (
                            <ul className="max-h-[60vh] overflow-y-auto py-1">
                                {candidates.map((c, i) => {
                                    const Icon = c.Icon || Sparkles;
                                    const active = i === cursor;
                                    return (
                                        <li key={c.id || c.path || c.name}>
                                            <button
                                                onMouseEnter={() => setCursor(i)}
                                                onClick={() => run(c)}
                                                className={[
                                                    'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                                    active
                                                        ? 'bg-accent/12 text-text-primary'
                                                        : 'text-text-secondary hover:bg-surface-hover',
                                                ].join(' ')}
                                            >
                                                <span className={[
                                                    'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                                                    active ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted',
                                                ].join(' ')}>
                                                    <Icon size={14} />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold truncate">{c.name}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-text-muted">{c.section}</div>
                                                </div>
                                                {active && <ArrowRight className="w-3.5 h-3.5 text-accent" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-muted">
                            <span>↑ ↓ to navigate · ↵ to select</span>
                            <span>Orbit Palette</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { usePaletteStore };
export default CommandPalette;
