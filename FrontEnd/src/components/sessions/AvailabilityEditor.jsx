/**
 * AvailabilityEditor.jsx — weekly grid editor. The mentor toggles 30-min
 * slots across 7 days × 24 hours. The shape mirrors the backend's
 * `availability.weekly: [{ dayOfWeek, slots: [{ startUtcHour, durationMin }] }]`
 * contract, so we serialize to the same shape on save.
 *
 * Themed: glass-card-glow wrapper, accent on-cells, themed hover, btn-gradient save.
 */
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader } from 'lucide-react';
import api from '../../services/api';

const DAYS = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_MIN = 30;

function gridFromWeekly(weekly = []) {
    const set = new Set();
    for (const day of weekly) {
        for (const slot of (day.slots || [])) {
            const start = slot.startUtcHour;
            const end = start + (slot.durationMin || SLOT_MIN) / 60;
            for (let h = start; h < end; h += SLOT_MIN / 60) {
                set.add(`${day.dayOfWeek}-${h}`);
            }
        }
    }
    return set;
}
function weeklyFromGrid(set) {
    const out = [];
    for (const d of DAYS) {
        const slots = [];
        let i = 0;
        while (i < 24) {
            const k = `${d.value}-${i}`;
            if (!set.has(k)) { i += 0.5; continue; }
            let end = i;
            while (end < 24 && set.has(`${d.value}-${end}`)) end += 0.5;
            slots.push({ startUtcHour: i, durationMin: (end - i) * 60 });
            i = end;
        }
        if (slots.length) out.push({ dayOfWeek: d.value, slots });
    }
    return out;
}

const AvailabilityEditor = ({ value = { weekly: [] }, onSaved }) => {
    const [grid, setGrid] = useState(() => gridFromWeekly(value.weekly));
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(false);

    const toggle = useCallback((day, hour) => {
        const k = `${day}-${hour}`;
        setGrid((prev) => {
            const next = new Set(prev);
            if (next.has(k)) next.delete(k); else next.add(k);
            return next;
        });
        setOk(false);
    }, []);

    const weekly = useMemo(() => weeklyFromGrid(grid), [grid]);

    async function save() {
        setBusy(true); setErr(null); setOk(false);
        try {
            await api.post('/sessions/mentor/apply', { availability: { weekly } });
            setOk(true);
            onSaved?.({ weekly });
        } catch (e) {
            setErr(e?.response?.data?.message || "Save failed");
        }
        setBusy(false);
    }

    return (
        <div className="glass-card-glow p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="font-semibold text-text-primary">Weekly availability</h3>
                    <p className="text-xs text-text-muted">Click 30-minute blocks in UTC. Leave empty to accept any time.</p>
                </div>
                <button
                    onClick={save}
                    disabled={busy}
                    className="inline-flex items-center gap-1 btn-gradient disabled:opacity-40 px-3 py-1.5 rounded-lg text-sm"
                >
                    {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr>
                            <th className="w-12"></th>
                            {HOURS.map((h) => (
                                <th key={h} className="text-text-muted font-normal pb-1">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map((d) => (
                            <tr key={d.value}>
                                <th className="text-text-secondary pr-2 text-right font-normal">{d.label}</th>
                                {HOURS.map((h) => {
                                    const isOn = grid.has(`${d.value}-${h}`);
                                    return (
                                        <td key={h} className="p-0">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggle(d.value, h)}
                                                className={`w-3 h-5 mx-px rounded-sm transition-colors ${
                                                    isOn
                                                        ? 'bg-accent'
                                                        : 'bg-surface border border-border-subtle hover:bg-accent/30'
                                                }`}
                                                style={isOn ? { boxShadow: '0 0 4px var(--accent-1)' } : undefined}
                                                aria-label={`${d.label} ${h}:00 UTC`}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {err && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2">{err}</p>}
            {ok && <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg p-2">Availability saved.</p>}
        </div>
    );
};

export default AvailabilityEditor;
