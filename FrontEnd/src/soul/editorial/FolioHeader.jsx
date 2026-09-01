/**
 * soul/editorial/FolioHeader.jsx
 *
 * A thin breathing-room spacer. The user dropped the section eyebrows
 * (mono-caps) and the Playfair italic titles — sections are now
 * separated only by hairline rules, and the first big content piece
 * (the greeting, the number, the first card) is the first thing the
 * eye lands on.
 *
 * Kept as a tiny pt-4 div so existing call-sites don't need to change.
 */
export default function FolioHeader() {
  return <div className="pt-4" aria-hidden="true" />;
}
