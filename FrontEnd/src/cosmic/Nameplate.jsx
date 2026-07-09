import { plateClassFor } from './cosmetics';

/**
 * Nameplate — wraps a display name in an animated plate when one is equipped.
 * When nothing is equipped it renders children unchanged (no wrapper), so
 * layout is untouched for users without a nameplate. Purely visual.
 */
export default function Nameplate({ plateKey, className = '', children }) {
  const cls = plateClassFor(plateKey);
  if (!cls) return <>{children}</>;
  return (
    <span className={`np-wrap ${className}`}>
      <span className={cls} aria-hidden="true" />
      <span className="np-content">{children}</span>
    </span>
  );
}
