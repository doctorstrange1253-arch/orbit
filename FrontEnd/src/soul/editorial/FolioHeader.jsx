/**
 * soul/editorial/FolioHeader.jsx
 *
 * A minimal editorial section header — just the title, set in
 * Playfair Display italic. The previous version had a giant Roman
 * numeral (I, II, III, …) as a side anchor + mono eyebrow + hairline,
 * but the user found that recipe repetitive and AI-looking when
 * repeated on every section. The page's "magazine issue" feel now
 * comes from typography + spacing between sections, not from a
 * numbered frame around every section.
 *
 * Props:
 *   eyebrow  optional mono-caps caption above the title
 *   title    the section title — set in Playfair Display italic
 *   accent   (unused; kept for backward compatibility)
 */
export default function FolioHeader({ eyebrow, title, accent }) {
  return (
    <div className="pt-6 pb-4">
      {eyebrow && (
        <p
          className="font-mono uppercase mb-2"
          style={{
            fontSize: '0.66rem',
            letterSpacing: '0.28em',
            color: 'rgba(245,245,245,0.55)',
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          fontFamily: 'var(--font-editorial)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h2>
    </div>
  );
}
