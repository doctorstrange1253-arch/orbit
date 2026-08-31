/**
 * hooks/useSignalFlareListener.js — listen for "flare responded" events.
 *
 * Subscribes once to the `signal-flare:responded` socket event (fired
 * by the backend when a mentor publishes a course in a genre the user
 * flared for). When the event fires, opens the PlanetMaterialization
 * overlay with the new course's title + id.
 *
 * The hook is mounted once (in App.jsx) so the listener is live even
 * if the user is on a different page when a flare lands.
 */

import { useEffect, useState } from 'react';
import { connectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import PlanetMaterialization from '../soul/signalFlare/PlanetMaterialization';

export function useSignalFlareListener() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    const socket = connectSocket(user._id);
    const onFlare = (payload) => {
      if (!payload) return;
      setEvent(payload);
    };
    socket.on('signal-flare:responded', onFlare);
    return () => socket.off('signal-flare:responded', onFlare);
  }, [token, user?._id]);

  return {
    event,
    clear: () => setEvent(null),
  };
}

export function SignalFlareListenerMount() {
  const { event, clear } = useSignalFlareListener();
  if (!event) return null;
  return (
    <PlanetMaterialization
      course={event}
      onDone={clear}
      onCancel={clear}
    />
  );
}
