/**
 * BookingModal.jsx — opens from SessionDetail. Three steps:
 *   1. Choose a date/time + duration (30/45/60 min)
 *   2. Confirm the price (snapshot of the backend's priceSession)
 *   3. Razorpay Checkout (mock or live) → POST /verify → success
 *
 * Themed: glass-card-glow modal, input-glass inputs, btn-gradient CTAs.
 * Modal backdrop is `bg-black/70` (intentionally — it's a scrim that works
 * in both themes, not a surface that needs to adapt).
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
        return d.toISOString().slice(0, 16);
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);

    const price = useMemo(() => {
        const total = Math.round((mentor.hourlyRateInr || 0) * durationMin / 60);
        return { totalInr: total };
    }, [mentor.hourlyRateInr, durationMin]);

    async function handleBookAndPay() {
        setErr(null);
        setBusy(true);
        try {
            const bookRes = await api.post('/sessions/book', {
                mentorUserId: mentor.userId,
                scheduledAt: new Date(when).toISOString(),
                durationMin,
            });
            const { id, order, totalInr: serverTotal } = bookRes.data;

            const checkoutResp = await paymentService.openCheckout({
                orderId: order.orderId,
                keyId: order.keyId,
                amountInr: serverTotal,
                onDismiss: () => {},
            });
            if (!checkoutResp) {
                setBusy(false);
                return;
            }

            await paymentService.verifySessionPayment(id, {
                orderId:   checkoutResp.razorpay_order_id,
                paymentId: checkoutResp.razorpay_payment_id,
                signature: checkoutResp.razorpay_signature,
            });
            qc.invalidateQueries({ queryKey: ['sessions', 'me'] });
            setStep(3);
            setBusy(false);
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
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card-glow p-6 max-w-md w-full"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Book with {mentor.name}</h2>
                            <p className="text-sm text-text-secondary">₹{mentor.hourlyRateInr}/hr</p>
                        </div>
                        <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {err && (
                        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2 mb-3">
                            {err}
                        </p>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">When</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="datetime-local"
                                        value={when}
                                        onChange={(e) => setWhen(e.target.value)}
                                        className="w-full input-glass pl-9 pr-3 py-2.5 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5">Duration</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDurationMin(d)}
                                            className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                                                durationMin === d
                                                    ? 'btn-gradient border-transparent'
                                                    : 'nav-tab-glass text-text-secondary border-border-subtle'
                                            }`}
                                        >
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="nav-tab-glass p-3 text-sm flex items-center justify-between">
                                <span className="text-text-secondary">Estimated total</span>
                                <span className="font-semibold flex items-center gradient-text text-base">
                                    <IndianRupee className="w-4 h-4" />{price.totalInr}
                                </span>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!when}
                                className="w-full btn-gradient py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="nav-tab-glass p-3 space-y-1.5 text-sm">
                                <Row icon={<Calendar className="w-4 h-4" />} label="When" value={new Date(when).toLocaleString()} />
                                <Row icon={<Clock className="w-4 h-4" />} label="Duration" value={`${durationMin} min`} />
                                <Row icon={<IndianRupee className="w-4 h-4" />} label="Total" value={`₹${price.totalInr}`} />
                            </div>
                            <p className="text-xs text-text-secondary">
                                Payment is held in escrow until the session completes. You'll only be charged when the mentor confirms.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 nav-tab-glass py-3 rounded-xl text-sm text-text-primary"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleBookAndPay}
                                    disabled={busy}
                                    className="flex-1 btn-gradient py-3 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {busy ? (
                                        <><Loader className="w-4 h-4 animate-spin" /> Processing…</>
                                    ) : (
                                        `Pay ₹${price.totalInr}`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div
                                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-success/10 border border-success/30"
                                style={{ boxShadow: '0 0 24px var(--success)' }}
                            >
                                <CheckCircle className="w-10 h-10 text-success" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">Session booked</h3>
                            <p className="text-sm text-text-secondary">Taking you to My Sessions…</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const Row = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 text-text-primary">
        <span className="text-text-muted">{icon}</span>
        <span className="text-text-secondary">{label}</span>
        <span className="ml-auto font-medium">{value}</span>
    </div>
);

export default BookingModal;
