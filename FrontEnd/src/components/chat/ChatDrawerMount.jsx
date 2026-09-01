/**
 * components/chat/ChatDrawerMount.jsx
 *
 * Tiny wrapper that mounts <ChatDrawer /> once at the app root and
 * bridges it to the global `open-chat` window event.
 *
 * The Navbar's chat icon (and several pages — Matches, BrowseSkills,
 * ConnectionCard) dispatches a `new CustomEvent('open-chat', { detail })`
 * on `window`. ChatDrawer is a heavy component (~1300 lines) that we
 * don't want to import in the Navbar, so we mount it here once and
 * pipe the event in.
 *
 * `event.detail` may be:
 *   - undefined / null  → open the conversation list (no preselection)
 *   - a user object     → open the drawer with that conversation preselected
 *
 * Rendered exactly once, near the top-level layout in App.jsx.
 */

import { useEffect, useState, useCallback } from 'react';
import ChatDrawer from './ChatDrawer';

const ChatDrawerMount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialUser, setInitialUser] = useState(null);

  const close = useCallback(() => {
    setIsOpen(false);
    // Defer the initialUser clear so the drawer's exit animation
    // doesn't show an empty state flash.
    setTimeout(() => setInitialUser(null), 250);
  }, []);

  useEffect(() => {
    const onOpen = (e) => {
      setInitialUser(e?.detail || null);
      setIsOpen(true);
    };
    window.addEventListener('open-chat', onOpen);
    return () => window.removeEventListener('open-chat', onOpen);
  }, []);

  return <ChatDrawer isOpen={isOpen} onClose={close} initialUser={initialUser} />;
};

export default ChatDrawerMount;
