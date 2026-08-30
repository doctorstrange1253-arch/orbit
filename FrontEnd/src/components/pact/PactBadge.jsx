import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tierById, PACT_TIERS } from '../../services/pact';

/**
 * PactBadge — the mentor's covenant badge.
 *
 * 6 tiers (initiate → oracle), each with a distinct glow color. When the
 * mentor has held the same tier for 4+ weeks, a Steady Shield ring orbits
 * the badge — a subtle "you've shown up consistently" reward, no points.
 *
 * Lookup modes:
 *   - userId given → fetch the user's pact subdoc and render their tier
 *   - no userId    → render the caller's own tier (uses /pact/me)
 *   - tier="oracle" → render the static oracle badge (e.g. for an "oracle" tag in copy)
 */
const PactBadge = ({ size = 28, userId, tier: tierProp, steadyShieldWeeks = 0, withLabel = false, withShield = true }) => {
    const enabled = !tierProp;
    const { data } = useQuery({
        queryKey: ['pact', userId ? `public-${userId}` : 'me'],
        queryFn: async () => {
            if (userId) {
                // No public-by-user endpoint; for now, fall back to /pact/me if
                // it's the caller, else render the default badge. A future
                // /pact/user/:id endpoint can back this without a refactor.
                const { pact } = await import('../../services/pact');
                return pact.me();
            }
            const { pact } = await import('../../services/pact');
            return pact.me();
        },
        enabled,
        staleTime: 60_000,
    });

    let tierId = tierProp || data?.pact?.divisionId || 'initiate';
    if (userId) tierId = tierProp || 'initiate'; // public lookups default to initiate for now
    let steadyWeeks = steadyShieldWeeks || data?.pact?.steadyShieldWeeks || 0;
    if (userId) steadyWeeks = 0; // can't know without an API

    const tier = tierById(tierId);
    const showShield = withShield && steadyWeeks >= 4;

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
    // 6 distinct cosmic glyphs. Each is a simple SVG so the badge stays crisp
    // at any size without external icons.
    const stroke = tier.glow;
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (tier.id) {
        case 'initiate':  // small ring — "you're starting"
            return <svg {...common}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" opacity="0.4" /></svg>;
        case 'adept':     // two rings — "you've found your orbit"
            return <svg {...common}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="11" opacity="0.4" /></svg>;
        case 'mentor':    // 4-point star — "the workhorse"
            return <svg {...common}><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></svg>;
        case 'sage':      // crescent + dot — "wisdom, sustained"
            return <svg {...common}><path d="M16 4 a8 8 0 1 0 4 8 a6 6 0 0 1 -4 -8" /><circle cx="9" cy="12" r="1" fill={stroke} /></svg>;
        case 'luminary':  // 8-point star — "top-decile teaching"
            return <svg {...common}><path d="M12 1 L13.5 9 L21 7.5 L15 12 L21 16.5 L13.5 15 L12 23 L10.5 15 L3 16.5 L9 12 L3 7.5 L10.5 9 Z" /></svg>;
        case 'oracle':    // full sun + rays — "apex"
            return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5" /></svg>;
        default: return null;
    }
};

export default PactBadge;
