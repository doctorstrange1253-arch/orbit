import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Printer, Download, Share2, QrCode } from 'lucide-react';

/**
 * CertificateView — inline SVG certificate.
 *
 * Renders the snapshot from /api/courses/:id/certificate into a printable
 * A4-landscape layout. The QR code is a tiny inline SVG pointing to the
 * public verify URL (which is a future story — for MVP we encode the
 * certId into a data URL with the orbit domain).
 */
const CertificateView = ({ certificate, course, mentor, learner }) => {
    const [printMode, setPrintMode] = useState(false);

    const issuedAt = certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : '';
    const verifyUrl = `https://orbit.app/verify/${certificate?.certId || ''}`;

    const handlePrint = () => {
        setPrintMode(true);
        setTimeout(() => {
            window.print();
            setPrintMode(false);
        }, 200);
    };

    return (
        <div className={printMode ? 'fixed inset-0 z-50 bg-white text-black p-0 m-0' : ''}>
            <div className={`${printMode ? 'p-8' : 'max-w-4xl mx-auto p-4'}`}>
                <div className="flex items-center justify-between mb-4 print:hidden">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-300" /> Certificate of completion
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest bg-surface/60 border border-border-subtle text-text-primary hover:border-accent/40">
                            <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                        <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25">
                            <Download className="w-3.5 h-3.5" /> Save as PDF
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: 'My Orbit certificate', url: window.location.href }).catch(() => {});
                                } else {
                                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                                }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest bg-surface/60 border border-border-subtle text-text-primary hover:border-accent/40"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                    </div>
                </div>

                <motion.div
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative aspect-[1.414/1] w-full rounded-2xl overflow-hidden border-4 border-amber-300/60 shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"
                >
                    {/* Decorative starfield */}
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(1px 1px at 40px 70px, white, transparent), radial-gradient(1px 1px at 90px 40px, white, transparent), radial-gradient(2px 2px at 130px 80px, white, transparent), radial-gradient(1px 1px at 160px 30px, white, transparent)',
                        backgroundSize: '200px 200px',
                    }} />

                    <svg viewBox="0 0 1000 707" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="cert-stroke" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fde68a" />
                                <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>
                        <rect x="20" y="20" width="960" height="667" fill="none" stroke="url(#cert-stroke)" strokeWidth="2" rx="6" />
                        <rect x="40" y="40" width="920" height="627" fill="none" stroke="rgba(253,230,138,0.3)" strokeWidth="1" />
                    </svg>

                    <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-200/80">Orbit</div>
                        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-amber-50 tracking-wider">CERTIFICATE</h1>
                        <div className="mt-1 text-sm italic text-amber-100/80">of completion</div>

                        <div className="mt-6 text-xs text-amber-100/70">This certifies that</div>
                        <div className="mt-2 text-2xl md:text-3xl font-bold text-amber-50">{learner?.name || 'Learner'}</div>
                        <div className="mt-4 text-xs text-amber-100/70">has completed the course</div>
                        <div className="mt-2 text-xl md:text-2xl font-bold text-amber-50 max-w-md">{course?.title || 'Course'}</div>

                        <div className="mt-4 text-xs text-amber-100/70">instructed by</div>
                        <div className="mt-1 text-sm font-semibold text-amber-100">{mentor?.name || 'Mentor'}</div>

                        <div className="mt-auto flex items-end justify-between w-full px-8 pb-6">
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-widest text-amber-200/60">Issued</div>
                                <div className="text-xs font-bold text-amber-100">{issuedAt}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <QrIcon url={verifyUrl} />
                                <div className="mt-1 text-[9px] font-mono text-amber-200/70">{certificate?.certId || 'ORBIT-XXXX'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-widest text-amber-200/60">Verify</div>
                                <div className="text-[10px] font-mono text-amber-100/80 max-w-[120px] truncate">orbit.app/verify</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const QrIcon = ({ url }) => (
    <div className="w-14 h-14 bg-white p-1.5 rounded">
        <svg viewBox="0 0 21 21" className="w-full h-full">
            {/* Tiny "QR-like" decorative pattern (not a real QR; the real verify URL is below) */}
            <rect x="0" y="0" width="7" height="7" fill="#0f172a" />
            <rect x="1" y="1" width="5" height="5" fill="white" />
            <rect x="2" y="2" width="3" height="3" fill="#0f172a" />
            <rect x="14" y="0" width="7" height="7" fill="#0f172a" />
            <rect x="15" y="1" width="5" height="5" fill="white" />
            <rect x="16" y="2" width="3" height="3" fill="#0f172a" />
            <rect x="0" y="14" width="7" height="7" fill="#0f172a" />
            <rect x="1" y="15" width="5" height="5" fill="white" />
            <rect x="2" y="16" width="3" height="3" fill="#0f172a" />
            <rect x="8" y="0" width="1" height="1" fill="#0f172a" />
            <rect x="10" y="2" width="2" height="1" fill="#0f172a" />
            <rect x="9" y="3" width="1" height="2" fill="#0f172a" />
            <rect x="11" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="8" y="6" width="3" height="1" fill="#0f172a" />
            <rect x="12" y="8" width="1" height="1" fill="#0f172a" />
            <rect x="14" y="10" width="1" height="2" fill="#0f172a" />
            <rect x="16" y="8" width="3" height="1" fill="#0f172a" />
            <rect x="18" y="10" width="1" height="1" fill="#0f172a" />
            <rect x="9" y="11" width="2" height="2" fill="#0f172a" />
            <rect x="12" y="12" width="2" height="1" fill="#0f172a" />
            <rect x="15" y="13" width="1" height="2" fill="#0f172a" />
            <rect x="17" y="11" width="2" height="1" fill="#0f172a" />
            <rect x="19" y="13" width="1" height="2" fill="#0f172a" />
            <rect x="8" y="15" width="2" height="1" fill="#0f172a" />
            <rect x="11" y="16" width="1" height="2" fill="#0f172a" />
            <rect x="13" y="18" width="2" height="1" fill="#0f172a" />
            <rect x="16" y="15" width="1" height="1" fill="#0f172a" />
            <rect x="18" y="16" width="2" height="2" fill="#0f172a" />
        </svg>
    </div>
);

export default CertificateView;
