import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import pact, { tierById } from '../../services/pact';

const PactBadge = ({ size = 28, userId, tier: tierProp, steadyShieldWeeks = 0, withLabel = false, withShield = true }) => {
    const useCaller = !userId && !tierProp;

    const { data: meData } = useQuery({
        queryKey: ['pact', 'me'],
        queryFn: () => pact.me(),
        enabled: useCaller,
        staleTime: 60_000,
    });

    const { data: publicData } = useQuery({
        queryKey: ['pact', 'public', userId],
        queryFn: () => pact.publicBadge(userId),
        enabled: !!userId && !tierProp,
        staleTime: 60_000,
        retry: 0,
    });

    let tierId;
    let steadyWeeks;

    if (tierProp) {
        tierId = tierProp;
        steadyWeeks = steadyShieldWeeks;
    } else if (userId) {
        tierId = publicData?.divisionId || 'initiate';
        steadyWeeks = publicData?.steadyShieldWeeks || 0;
    } else {
        tierId = meData?.pact?.divisionId || 'initiate';
        steadyWeeks = steadyShieldWeeks || meData?.pact?.steadyShieldWeeks || 0;
    }

    const tier = tierById(tierId);
    const showShield = withShield && (steadyWeeks || 0) >= 4;

    return (
        <span className="inline-flex items-center gap-1.5" title={`Pact: ${tier.label}${showShield ? ` · Steady Shield (${steadyWeeks}w)` : ''}`}>
            <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="relative inline-flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                {showShield && (
                    <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-full"
                        style={{
                            border: `1.5px solid ${tier.glow}`,
                            boxShadow: `0 0 ${size / 2}px ${tier.glow}55`,
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                )}
                <span
                    className="relative inline-flex items-center justify-center rounded-full"
                    style={{
                        width: size * 0.7,
                        height: size * 0.7,
                        background: `radial-gradient(circle, ${tier.glow}33, ${tier.glow}11)`,
                        boxShadow: `0 0 ${size * 0.4}px ${tier.glow}88`,
                    }}
                >
                    <PactGlyph tier={tier} size={size * 0.5} />
                </span>
            </motion.span>
            {withLabel && <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: tier.glow }}>{tier.label}</span>}
        </span>
    );
};

const PactGlyph = ({ tier, size = 18 }) => {
    const stroke = tier.glow;
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (tier.id) {
        case 'initiate':
            return <svg {...common}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" opacity="0.4" /></svg>;
        case 'adept':
            return <svg {...common}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="11" opacity="0.4" /></svg>;
        case 'mentor':
            return <svg {...common}><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></svg>;
        case 'sage':
            return <svg {...common}><path d="M16 4 a8 8 0 1 0 4 8 a6 6 0 0 1 -4 -8" /><circle cx="9" cy="12" r="1" fill={stroke} /></svg>;
        case 'luminary':
            return <svg {...common}><path d="M12 1 L13.5 9 L21 7.5 L15 12 L21 16.5 L13.5 15 L12 23 L10.5 15 L3 16.5 L9 12 L3 7.5 L10.5 9 Z" /></svg>;
        case 'oracle':
            return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" /></svg>;
        default: return null;
    }
};

export default PactBadge;
