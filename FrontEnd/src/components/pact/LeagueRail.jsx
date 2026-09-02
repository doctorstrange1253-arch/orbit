import { PACT_TIERS, tierById, tierIndex } from '../../services/pact';

/**
 * LeagueRail — the 6-tier Pact league made visible.
 *
 * Renders the six tiers as a typeset strip with the mentor's current
 * division highlighted, dots-and-pips between tiers, and a serif label
 * on every tier. The rail reads like a private-club roster, not a
 * video-game ladder.
 *
 *   Initiate · Adept · Mentor · Sage · Luminary · Oracle
 *
 * Three modes:
 *   - compact : just the strip, mono caps, fits in a header rail
 *   - inline  : strip + a sentence about your position
 *   - folio   : strip + large Playfair-italic title + Cormorant body
 *
 * Uses the V3 editorial type scale (Playfair Display, Cormorant,
 * JetBrains Mono) so it sits naturally next to the MyOrbit issue.
 */

const POSITION_COPY = {
  initiate: 'Everyone starts here. The work begins.',
  adept:    'You have found your rhythm. Steady now.',
  mentor:   'You carry a load. Others follow your example.',
  sage:     'You have been at this long enough to be trusted with the difficult ones.',
  luminary: 'You are among the few this generation looks up to.',
  oracle:   'The apex. There is no one above. Mentor the ones below.',
};

const TOOLTIP = {
  initiate: 'New mentors. Everyone starts here.',
  adept:    'Settled in, regular sessions.',
  mentor:   'The workhorse tier.',
  sage:     'Sustained impact.',
  luminary: 'Top-decile teaching.',
  oracle:   'Apex. Top 1% ever reach here.',
};

const LeagueRail = ({ currentTierId, mode = 'inline' }) => {
  const current = currentTierId || 'initiate';
  const currentIndex = Math.max(0, tierIndex(current));
  const currentTier = tierById(current);

  if (mode === 'compact') {
    return (
      <div
        className="flex items-center gap-1.5"
        role="list"
        aria-label="Pact league"
      >
        {PACT_TIERS.map((t, i) => {
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <span key={t.id} className="flex items-center gap-1.5">
              <span
                role="listitem"
                title={`${t.label} — ${TOOLTIP[t.id]}`}
                className="inline-flex items-center gap-1.5"
                style={{
                  padding: isCurrent ? '2px 8px' : '2px 4px',
                  border: isCurrent ? `1px solid ${t.glow}` : '1px solid transparent',
                  borderRadius: 999,
                  background: isCurrent ? `${t.glow}10` : 'transparent',
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: isPast || isCurrent ? t.glow : 'rgba(255,255,255,0.18)',
                    boxShadow: isCurrent ? `0 0 6px ${t.glow}88` : 'none',
                  }}
                />
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                    color: isCurrent ? t.glow : isPast ? 'rgba(245,245,245,0.55)' : 'rgba(245,245,245,0.30)',
                  }}
                >
                  {t.label}
                </span>
              </span>
              {i < PACT_TIERS.length - 1 && (
                <span
                  aria-hidden
                  className="font-mono"
                  style={{ color: 'rgba(245,245,245,0.20)', fontSize: '0.62rem' }}
                >
                  ·
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  if (mode === 'folio') {
    return (
      <div
        className="w-full"
        style={{ borderTop: '1px solid rgba(255,255,255,0.10)', borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-5 md:py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono uppercase text-text-muted mb-2" style={{ fontSize: '0.66rem', letterSpacing: '0.22em', fontWeight: 700 }}>
                The Mentor Pact
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                You stand among the{' '}
                <span style={{ color: currentTier.glow }}>{currentTier.label.toLowerCase()}</span>.
              </div>
              <p
                className="mt-1.5"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  color: 'rgba(245,245,245,0.65)',
                  fontSize: '0.95rem',
                  maxWidth: '46ch',
                }}
              >
                {POSITION_COPY[current] || POSITION_COPY.initiate}
              </p>
            </div>
            <div className="font-mono uppercase text-text-muted md:text-right" style={{ fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700 }}>
              Six divisions
              <div style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '1.4rem', letterSpacing: '-0.02em', marginTop: 2 }}>
                One covenant
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-6 gap-2 md:gap-3">
            {PACT_TIERS.map((t, i) => {
              const isCurrent = i === currentIndex;
              const isPast = i < currentIndex;
              return (
                <div
                  key={t.id}
                  className="relative"
                  title={`${t.label} — ${TOOLTIP[t.id]}`}
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderTop: `2px solid ${isCurrent ? t.glow : 'rgba(255,255,255,0.08)'}`,
                    background: isCurrent ? `${t.glow}0c` : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: isPast || isCurrent ? t.glow : 'rgba(255,255,255,0.18)',
                        boxShadow: isCurrent ? `0 0 6px ${t.glow}88` : 'none',
                      }}
                    />
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: '0.58rem',
                        letterSpacing: '0.20em',
                        fontWeight: 700,
                        color: isCurrent ? t.glow : isPast ? 'rgba(245,245,245,0.55)' : 'rgba(245,245,245,0.32)',
                      }}
                    >
                      Tier {['I','II','III','IV','V','VI'][i]}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      lineHeight: 1.05,
                      letterSpacing: '-0.01em',
                      color: isCurrent ? t.glow : isPast ? 'rgba(245,245,245,0.85)' : 'rgba(245,245,245,0.45)',
                    }}
                  >
                    {t.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="font-mono uppercase text-text-muted"
          style={{ fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700 }}
        >
          The Six Divisions
        </span>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            fontWeight: 700,
            color: currentTier.glow,
          }}
        >
          Now: {currentTier.label}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-0">
        {PACT_TIERS.map((t, i) => {
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const isLast = i === PACT_TIERS.length - 1;
          return (
            <div
              key={t.id}
              title={`${t.label} — ${TOOLTIP[t.id]}`}
              className="relative px-2 md:px-3 py-2.5"
              style={{
                borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.10)',
                background: isCurrent ? `${t.glow}0d` : 'transparent',
                borderTop: `2px solid ${isCurrent ? t.glow : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: isPast || isCurrent ? t.glow : 'rgba(255,255,255,0.18)',
                    boxShadow: isCurrent ? `0 0 6px ${t.glow}88` : 'none',
                  }}
                />
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: '0.54rem',
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                    color: isCurrent ? t.glow : isPast ? 'rgba(245,245,245,0.55)' : 'rgba(245,245,245,0.32)',
                  }}
                >
                  {['I','II','III','IV','V','VI'][i]}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  color: isCurrent ? t.glow : isPast ? 'rgba(245,245,245,0.85)' : 'rgba(245,245,245,0.45)',
                }}
              >
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeagueRail;
