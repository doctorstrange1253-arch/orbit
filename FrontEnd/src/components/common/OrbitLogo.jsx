/**
 * OrbitLogo — the real Orbit brand mark (public/orbit-app.svg), inlined so it
 * can be dropped anywhere at any size without a network fetch. This is the ONE
 * component to use wherever the brand appears (auth pages, headers, empty
 * states) — never a generic sparkle/star stand-in.
 *
 * `tile` (default true) keeps the dark rounded-square app-icon backing; pass
 * tile={false} for just the ringed planet on a transparent background.
 */
export default function OrbitLogo({ size = 56, tile = true, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Orbit"
    >
      <defs>
        <linearGradient id="orbit-logo-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00c6ff" /><stop offset=".5" stopColor="#7c3aed" /><stop offset="1" stopColor="#ff0076" />
        </linearGradient>
        <radialGradient id="orbit-logo-planet" cx=".36" cy=".32" r=".8">
          <stop offset="0" stopColor="#e8f3ff" /><stop offset=".4" stopColor="#86acff" /><stop offset="1" stopColor="#4b1fb8" />
        </radialGradient>
        <filter id="orbit-logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {tile && (
        <>
          <rect x="3" y="3" width="94" height="94" rx="26" fill="#0b0a20" />
          <rect x="3.5" y="3.5" width="93" height="93" rx="25.5" fill="none" stroke="#fff" strokeOpacity=".06" />
          <circle cx="78" cy="24" r="3" fill="#cfe6ff" opacity=".9" filter="url(#orbit-logo-glow)" />
        </>
      )}
      <g transform="rotate(-24 50 50)">
        <ellipse cx="50" cy="50" rx="41" ry="14.5" fill="none" stroke="url(#orbit-logo-ring)" strokeWidth="5.5" filter="url(#orbit-logo-glow)" />
        <circle cx="50" cy="50" r="22" fill="url(#orbit-logo-planet)" />
        <ellipse cx="42" cy="42" rx="9" ry="6" fill="#fff" opacity=".18" />
        <path d="M10 50 A41 14.5 0 0 0 90 50" fill="none" stroke="url(#orbit-logo-ring)" strokeWidth="5.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
