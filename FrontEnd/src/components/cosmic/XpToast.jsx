/**
 * XpToast — always-mounted listener for the `gameology:xp` socket event.
 *
 * The hook is exported so it can be mounted exactly once (in AppInner).
 * The component itself is a no-op shell — toast calls happen inside the
 * hook, not in render. Keeping them coupled in one file makes it harder
 * to accidentally mount the listener twice.
 */
import { useXpToast } from '../../hooks/useXpToast';

const XpToast = () => {
    useXpToast();
    return null;
};

export default XpToast;
