/**
 * HolographicCard.jsx — Reusable pointer-tracked iridescent card.
 *
 * Wraps any content. On pointermove, computes the pointer's position
 * inside the bounding box and writes CSS custom properties:
 *   --hx, --hy      — normalized -1..1 of the pointer inside the card
 *   --hangle        — the angle (deg) for the conic gradient
 *   --shineX, --shineY — pixel position of the radial sheen
 *   --tiltX, --tiltY — degrees of 3D tilt (X/Y axes)
 *
 * The CSS class .holo-card uses these vars to draw a moving conic-
 * gradient sheen and a soft radial highlight that follows the cursor.
 * Set `tilt` to enable the 3D tilt; set `rarity` to apply a tier-
 * specific border animation ('common' | 'rare' | 'epic' | 'mythic').
 *
 * On pointerleave, the vars are reset to center and the card smoothly
 * springs back via CSS transitions (200ms).
 *
 * Performance: only writes CSS vars per pointermove; no React state.
 * Respects prefers-reduced-motion by skipping the tilt.
 */
import { useCallback, useRef } from 'react';

const HolographicCard = ({
    children,
    className = '',
    tilt = false,
    rarity = null, // 'common' | 'rare' | 'epic' | 'mythic' | null
    as: Tag = 'div',
    ...rest
}) => {
    const ref = useRef(null);

    const onMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const nx = (x / rect.width) * 2 - 1;   // -1..1
        const ny = (y / rect.height) * 2 - 1;  // -1..1
        const angle = Math.atan2(ny, nx) * (180 / Math.PI) + 90;
        el.style.setProperty('--hx', nx.toFixed(3));
        el.style.setProperty('--hy', ny.toFixed(3));
        el.style.setProperty('--hangle', `${angle.toFixed(1)}deg`);
        el.style.setProperty('--shineX', `${x.toFixed(1)}px`);
        el.style.setProperty('--shineY', `${y.toFixed(1)}px`);
        if (tilt) {
            el.style.setProperty('--tiltX', `${(-ny * 6).toFixed(2)}deg`);
            el.style.setProperty('--tiltY', `${(nx * 6).toFixed(2)}deg`);
        }
    }, [tilt]);

    const onLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty('--hx', '0');
        el.style.setProperty('--hy', '0');
        el.style.setProperty('--hangle', '0deg');
        el.style.setProperty('--shineX', '50%');
        el.style.setProperty('--shineY', '50%');
        if (tilt) {
            el.style.setProperty('--tiltX', '0deg');
            el.style.setProperty('--tiltY', '0deg');
        }
    }, [tilt]);

    const classes = [
        'holo-card',
        rarity ? `holo-rarity-${rarity}` : '',
        tilt ? 'holo-tilt' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Tag
            ref={ref}
            className={classes}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            {...rest}
        >
            <div className="holo-sheen" aria-hidden />
            <div className="holo-border" aria-hidden />
            <div className="holo-content">{children}</div>
        </Tag>
    );
};

export default HolographicCard;
