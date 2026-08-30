/**
 * BookingModal.jsx — opens from SessionDetail. Three steps:
 *   1. Choose a date/time + duration (30/45/60 min)
 *   2. Confirm the price (snapshot of the backend's priceSession)
 *   3. Razorpay Checkout (mock or live) → POST /verify → success
 *
 * All state machine decisions live on the backend; the modal is intentionally
 * thin and only displays the price snapshot from `book`.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, IndianRupee, CheckCircle, Loader } from 'lucide-react';
import api from '../../services/api';
import paymentService from '../../services/payment';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const DURATIONS = [30, 45, 60];

const BookingModal = ({ mentor, onClose }) => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [step, setStep] = useState(1);
    const [durationMin, setDurationMin] = useState(60);
    const [when, setWhen] = useState(() => {
        // Default: tomorrow at 10:00 local
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(10, 0, 0, 0);
        return d.toISOString().slice(0, 16); // for <input type="datetime-local">
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);

    const price = useMemo(() => {
        // Cheap client preview. The server re-derives and returns the
        // authoritative snapshot in the book response.
        const total = Math.round((mentor.hourlyRateInr || 0) * durationMin / 60);
        return { totalInr: total };
    }, [mentor.hourlyRateInr, durationMin]);

    async function handleBookAndPay() {
        setErr(null);
        setBusy(true);
        try {
            // 1. POST /book → pending_payment session + Razorpay order
            const bookRes = await api.post('/sessions/book', {
                mentorUserId: mentor.userId,
                scheduledAt: new Date(when).toISOString(),
                durationMin,
            });
            const { id, order, totalInr: serverTotal } = bookRes.data;

            // 2. Open Checkout (mock or live). Resolves with the verify payload.
            const checkoutResp = await paymentService.openCheckout({
                orderId: order.orderId,
                keyId: order.keyId,
                amountInr: serverTotal,
                onDismiss: () => { /* swallowed — handled in resolve(null) */ },
            });
            if (!checkoutResp) {
                // User dismissed the modal.
                setBusy(false);
                return;
            }

            // 3. POST /verify → server checks signature + atomic transition.
            await paymentService.verifySessionPayment(id, {
                orderId:   checkoutResp.razorpay_order_id,
                paymentId: checkoutResp.razorpay_payment_id,
                signature: checkoutResp.razorpay_signature,
            });
            qc.invalidateQueries({ queryKey: ['sessions', 'me'] });
            setStep(3);
            setBusy(false);
            // Auto-navigate to My Sessions after a beat
            setTimeout(() => navigate('/my-sessions'), 1500);
        } catch (e) {
            setBusy(false);
            setErr(e?.response?.data?.message || e?.message || "Booking failed");
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Book with {mentor.name}</h2>
                            <p className="text-sm text-slate-400">@{mentor.hourlyRateInr}/hr</p>
                        </div>
                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    {err && <p className="text-sm text-rose-400 bg-rose-900/30 rounded p-2 mb-3">{err}</p>}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">When</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="datetime-local"
                                        value={when}
                                        onChange={(e) => setWhen(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Duration</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDurationMin(d)}
                                            className={`py-2 rounded-lg text-sm font-medium border ${
                                                durationMin === d
                                                    ? "bg-violet-600 border-violet-500 text-white"
                                                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                                            }`}
                                        >
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm flex items-center justify-between">
                                <span className="text-slate-400">Estimated total</span>
                                <span className="font-semibold flex items-center"><IndianRupee className="w-4 h-4" />{price.totalInr}</span>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!when}
                                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 font-semibold"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 text-sm">
                                <Row icon={<Calendar className="w-4 h-4" />} label="When" value={new Date(when).toLocaleString()} />
                                <Row icon={<Clock className="w-4 h-4" />} label="Duration" value={`${durationMin} min`} />
                                <Row icon={<IndianRupee className="w-4 h-4" />} label="Total" value={`₹${price.totalInr}`} />
                            </div>
                            <p className="text-xs text-slate-400">
                                Payment is held in escrow until the session completes. You'll only be charged when the mentor confirms.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg bg-slate-800 text-slate-200 text-sm">Back</button>
                                <button
                                    onClick={handleBookAndPay}
                                    disabled={busy}
                                    className="flex-1 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2"
                                >
                                    {busy ? <><Loader className="w-4 h-4 animate-spin" /> Processing…</> : `Pay ₹${price.totalInr}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold mb-1">Session booked</h3>
                            <p className="text-sm text-slate-400">Taking you to My Sessions…</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const Row = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 text-slate-300">
        <span className="text-slate-500">{icon}</span>
        <span className="text-slate-400">{label}</span>
        <span className="ml-auto font-medium">{value}</span>
    </div>
);

export default BookingModal;
