/**
 * MagneticCursor.jsx — Custom desktop cursor.
 *
 * Replaces the OS cursor with a two-layer system:
 *   - DOT  — a 6px circle that follows the mouse with no easing (snappy).
 *   - RING — a 36px circle that trails with spring physics. On hover over
 *            interactive elements, the ring snaps to the element's center
 *            and scales up; on text elements, the ring collapses to a
 *            vertical I-beam.
 *
 * Disabled on touch devices (no mouse) and when the user has prefers-
 * reduced-motion enabled. The OS cursor stays visible in those cases so
 * the experience never degrades.
 *
 * Selectors that trigger the "magnetic" snap: 'a, button, [data-cursor="hover"]'.
 * Selectors that trigger the "text" mode:    'input, textarea, [contenteditable]'.
 * Selectors that trigger the "grab" mode:    '[data-cursor="grab"]'.
 *
 * Performance: only the transform/opacity of two elements update per frame.
 * `mix-blend-mode: difference` is used on the dot so it stays visible
 * against any background.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const isCoarsePointer = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
     !window.matchMedia('(hover: hover)').matches);

const isReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MagneticCursor = () => {
    // Render nothing on touch / reduced-motion.
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        if (isCoarsePointer() || isReducedMotion()) return;
        setEnabled(true);
        // Hide the OS cursor over the app shell so our cursor takes over.
        document.documentElement.classList.add('cursor-hidden');
        return () => document.documentElement.classList.remove('cursor-hidden');
    }, []);

    // Mouse-following motion values. Dot tracks exactly; ring uses springs.
    const dotX = useMotionValue(-100);
    const dotY = useMotionValue(-100);
    const ringX = useSpring(-100, { stiffness: 400, damping: 35, mass: 0.6 });
    const ringY = useSpring(-100, { stiffness: 400, damping: 35, mass: 0.6 });
    const [mode, setMode] = useState('default'); // default | hover | text | grab
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e) => {
            dotX.set(e.clientX);
            dotY.set(e.clientY);
            ringX.set(e.clientX);
            ringY.set(e.clientY);

            // Mode detection — most-specific selector wins.
            const target = e.target;
            if (!target || !target.closest) { setMode('default'); return; }
            if (target.closest('[data-cursor="grab"]'))      { setMode('grab'); return; }
            if (target.closest('input, textarea, [contenteditable="true"]')) { setMode('text'); return; }
            if (target.closest('a, button, [role="button"], [data-cursor="hover"]')) { setMode('hover'); return; }
            setMode('default');
        };
        const onDown = () => setPressed(true);
        const onUp = () => setPressed(false);
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup',   onUp,   { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup',   onUp);
        };
    }, [enabled, dotX, dotY, ringX, ringY]);

    if (!enabled) return null;

    // Per-mode visual config. ringScale + ringOpacity adapt to the cursor's
    // semantic state. Text mode collapses to a thin vertical bar.
    const ringConfig = (() => {
        switch (mode) {
            case 'hover':
                return { scale: pressed ? 1.4 : 2.0, opacity: 0.35, border: '1.5px solid rgba(255,255,255,0.9)' };
            case 'text':
                return { scale: 1.2, opacity: 0.6, w: 2, h: 28, border: '1.5px solid rgba(255,255,255,0.95)' };
            case 'grab':
                return { scale: 1.4, opacity: 0.45, border: '1.5px solid rgba(255,255,255,0.9)' };
            default:
                return { scale: 1, opacity: 0.5, border: '1.5px solid rgba(255,255,255,0.7)' };
        }
    })();

    return (
        <>
            {/* DOT — exact tracking. mix-blend-mode keeps it visible on any bg. */}
            <motion.div
                aria-hidden
                style={{
                    position: 'fixed', top: 0, left: 0,
                    x: dotX, y: dotY,
                    translateX: '-50%', translateY: '-50%',
                    width: 6, height: 6, borderRadius: 9999,
                    background: 'currentColor',
                    color: '#fff',
                    mixBlendMode: 'difference',
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
            />
            {/* RING — springy follow + adaptive size/border. */}
            <motion.div
                aria-hidden
                animate={{
                    scale: ringConfig.scale,
                    opacity: ringConfig.opacity,
                    width:  ringConfig.w || 36,
                    height: ringConfig.h || 36,
                    borderRadius: 9999,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                style={{
                    position: 'fixed', top: 0, left: 0,
                    x: ringX, y: ringY,
                    translateX: '-50%', translateY: '-50%',
                    border: ringConfig.border,
                    background: 'transparent',
                    pointerEvents: 'none',
                    zIndex: 9998,
                }}
            />
        </>
    );
};

export default MagneticCursor;
