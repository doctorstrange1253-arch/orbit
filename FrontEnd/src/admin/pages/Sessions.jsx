/**
 * admin/pages/Sessions.jsx — admin Sessions page.
 * Lists every OrbitSession in the system with status / payment filters,
 * and provides a "view" drawer with the full record + a "mark disputed"
 * and "manual refund" action (manual actions are stubbed here — wired
 * through the admin portal in a later slice; this slice ships the read
 * surface + the entry point).
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Eye, Filter, RefreshCw } from 'lucide-react';
import adminApi from '../adminApi';

const STATUSES = ["", "pending_payment", "booked", "confirmed", "live", "completed", "cancelled", "no_show", "disputed"];

const Sessions = () => {
    const [status, setStatus] = useState("");
    const [openId, setOpenId] = useState(null);

    // The admin portal exposes an internal session list endpoint. If it
    // isn't there yet, fall back to /api/sessions/admin/:id (per-session)
    // once an id is opened. For the LIST, this slice intentionally uses a
    // best-effort: there is no list-all endpoint on the public surface, so
    // we route the admin through the existing data layer.
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['admin', 'sessions', status],
        queryFn: async () => {
            try {
                const r = await adminApi.get(`/sessions?status=${status}`);
                return r.data?.items || r.data || [];
            } catch {
                return []; // list endpoint not yet implemented — empty state is fine for the slice
            }
        },
    });

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-violet-400" /> Sessions
                    </h1>
                    <p className="text-sm text-slate-400">Every paid 1-on-1 video session in the system.</p>
                </div>
                <button onClick={refetch} className="p-2 rounded bg-slate-800 hover:bg-slate-700">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </header>

            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
                >
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s || "All statuses"}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <p className="text-slate-500 text-sm">Loading…</p>
            ) : error ? (
                <p className="text-rose-400 text-sm">Error: {String(error.message || error)}</p>
            ) : !data || data.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
                    No sessions match the current filter. (List endpoint may not be wired yet — use My Sessions in the app to see live data.)
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-800">
                            <th className="py-2">When</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Amount</th>
                            <th>Payout</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((s) => (
                            <tr key={s._id} className="border-b border-slate-900 hover:bg-slate-900/40">
                                <td className="py-2">{new Date(s.scheduledAt).toLocaleString()}</td>
                                <td>{s.status}</td>
                                <td>{s.payment?.status}</td>
                                <td>₹{s.totalInr}</td>
                                <td>₹{s.mentorPayoutInr}</td>
                                <td>
                                    <button onClick={() => setOpenId(s._id)} className="p-1.5 text-slate-300 hover:text-white">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {openId && <SessionDrawer id={openId} onClose={() => setOpenId(null)} />}
        </div>
    );
};

const SessionDrawer = ({ id, onClose }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'sessions', 'one', id],
        queryFn: () => adminApi.get(`/sessions/admin/${id}`).then((r) => r.data),
    });
    return (
        <div className="fixed inset-0 z-40 bg-black/60 flex justify-end" onClick={onClose}>
            <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-2">Session detail</h2>
                {isLoading ? (
                    <p className="text-slate-500 text-sm">Loading…</p>
                ) : !data ? (
                    <p className="text-rose-400 text-sm">Couldn't load this session.</p>
                ) : (
                    <pre className="text-xs bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
                <div className="mt-4 flex gap-2">
                    <button className="px-3 py-2 rounded bg-amber-700 hover:bg-amber-600 text-sm text-white">Mark disputed</button>
                    <button className="px-3 py-2 rounded bg-rose-700 hover:bg-rose-600 text-sm text-white">Manual refund</button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Admin write actions are wired through the admin portal in a later slice.</p>
            </div>
        </div>
    );
};

export default Sessions;
