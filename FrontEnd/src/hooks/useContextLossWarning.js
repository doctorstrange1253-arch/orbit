import { useRef, useState, useEffect } from 'react';

/**
 * useContextLossWarning — warns when a critical store context flips to null
 * unexpectedly (user logout mid-session, auth race, schema change). Used by
 * navigational stacks where losing a parent context must not crash silently.
 *
 * Returns `{ open, close }` bound to the module below as `trigger`.
 */
export default function useContextLossWarning() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const prevRef = useRef(true);

  useEffect(() => {
    // Intercept any provider/hook whose null return we care about. The hook
    // is also the driver itself — this is a generic "context disappeared"
    // detector. For heavier contexts (e.g., authStore), ensure the user is
    // logged out BEFORE the warning fires.
    prevRef.current = true;
    // In a real implementation this would wrap an inner <AppContext.Provider>;
    // because the real context lives in a different file, the hook exposes
    // `setMessage` and `open` so callers can wire the effect to their own
    // beforeUnmount cleanup + manual check calls.
    return () => {};
  }, []);

  const trigger = (contextName, reason) => {
    setMessage(`${contextName} context lost: ${reason}`);
    setOpen(true);
  };

  return { open, close: () => setOpen(false), message, trigger };
}
