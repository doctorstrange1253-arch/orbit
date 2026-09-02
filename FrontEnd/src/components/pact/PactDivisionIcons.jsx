import { PACT_TIERS } from '../../services/pact';

/**
 * PactDivisionIcons — small inline marker for division names.
 *
 * Used in tables, dropdowns, and quiet contexts where the full
 * PactBadge would be too loud. Renders a small tier-colored dot
 * plus a mono-caps label.
 */
const PactDivisionIcons = ({ tierId, size = 8, className = '', compact = false, withLabel = true }) => {
    const tier = PACT_TIERS.find((t) => t.id === tierId);
    if (!tier) return null;
    return (
        <span
            className={`inline-flex items-center gap-1.5 ${className}`}
            style={{ color: tier.glow }}
            title={tier.label}
        >
            <span
                className="rounded-full flex-shrink-0"
                style={{
                    width: size,
                    height: size,
                    background: tier.glow,
                    boxShadow: `0 0 6px ${tier.glow}66`,
                }}
            />
            {withLabel && !compact && (
                <span
                    className="font-mono uppercase"
                    style={{
                        fontSize: '0.60rem',
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                    }}
                >
                    {tier.label}
                </span>
            )}
        </span>
    );
};

export default PactDivisionIcons;
