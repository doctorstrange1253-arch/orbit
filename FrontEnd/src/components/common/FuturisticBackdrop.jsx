/**
 * FuturisticBackdrop.jsx — themed animated background for the Sessions surface.
 *
 * Renders three layers behind the page content:
 *   1. A soft radial-gradient tint using the three accent colors
 *      (`--accent-1` cyan, `--accent-3` violet, `--accent-2` magenta) at low
 *      opacity so the tint reads in both light and dark themes.
 *   2. A faint 48px grid that drifts slowly. The grid color is `currentColor`
 *      and the parent sets `color: var(--text-muted)`, so the grid is a
 *      subtle gray in light mode and a faint white in dark mode.
 *   3. Three large blurred orbs (cyan, violet, magenta) that float gently
 *      with a phase offset between them. The orbs use the same accent tokens
 *      so they stay colored in both themes.
 *
 * The page that uses this component is responsible for:
 *   - `position: relative; overflow: hidden` on the wrapper (so the absolute
 *     layers don't cause a horizontal scroll)
 *   - Putting the actual content in a `relative z-10` child
 *
 * Rendered once per page (not globally) so each route gets its own scope.
 */
const FuturisticBackdrop = () => (
    <>
        {/* Layer 1 — accent-tint radial gradient */}
        <div
            aria-hidden
            className="absolute inset-0 -z-30"
            style={{
                background:
                    'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--accent-1) 22%, transparent), transparent 70%),' +
                    'radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, var(--accent-3) 18%, transparent), transparent 70%),' +
                    'radial-gradient(ellipse 60% 40% at 0% 100%, color-mix(in srgb, var(--accent-2) 14%, transparent), transparent 70%)',
            }}
        />

        {/* Layer 2 — animated grid */}
        <div
            aria-hidden
            className="absolute inset-0 -z-20"
            style={{
                color: 'var(--text-muted)',
                backgroundImage:
                    'linear-gradient(to right, currentColor 1px, transparent 1px),' +
                    'linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                opacity: 0.18,
                maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)',
                animation: 'gridDrift 30s linear infinite',
            }}
        />

        {/* Layer 3 — three floating accent orbs */}
        <Orb size={420} x="15%" y="20%" color="var(--accent-1)" delay={0} />
        <Orb size={320} x="80%" y="55%" color="var(--accent-3)" delay={-7} />
        <Orb size={260} x="50%" y="85%" color="var(--accent-2)" delay={-14} />
    </>
);

const Orb = ({ size, x, y, color, delay = 0 }) => (
    <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
            width: size,
            height: size,
            left: x,
            top: y,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            opacity: 0.15,
            filter: 'blur(60px)',
            animation: `orbFloat 18s ease-in-out ${delay}s infinite`,
            willChange: 'transform',
        }}
    />
);

export default FuturisticBackdrop;
