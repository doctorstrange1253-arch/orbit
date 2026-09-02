import { PACT_TIERS } from '../../services/pact';

// Tiny inline icon set for division names. Used in tables / dropdowns where
// the full PactBadge would be too heavy.

const PactDivisionIcons = ({ tierId, size = 14, className = '', compact = false, withLabel = true }) => {
    const tier = PACT_TIERS.find((t) => t.id === tierId);
    if (!tier) return null;
    return (
        <span
            className={`inline-flex items-center gap-1 ${className}`}
            style={{ color: tier.glow }}
            title={tier.label}
        >
            <span
                className="rounded-full flex-shrink-0"
                style={{
                    width: size,
                    height: size,
                    background: `radial-gradient(circle, ${tier.glow}aa, ${tier.glow}33)`,
                    boxShadow: `0 0 ${size / 2}px ${tier.glow}88`,
                }}
            />
            {withLabel && !compact && (
                <span className="text-[10px] font-black uppercase tracking-widest">{tier.label}</span>
            )}
        </span>
    );
};

export default PactDivisionIcons;
