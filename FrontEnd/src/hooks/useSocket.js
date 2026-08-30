import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook that manages socket connection lifecycle and event listeners.
 * Call this once at the app level (e.g., in Layout).
 */
const useSocket = () => {
  const { user, token } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const isConnected = useRef(false);

  useEffect(() => {
    if (!token || !user?._id) {
      disconnectSocket();
      isConnected.current = false;
      return;
    }

    if (isConnected.current) return;

    const socket = connectSocket(user._id);
    isConnected.current = true;

    // Roles self-heal: if the persisted user lacks the roles fields (a
    // pre-feature session), refresh from the live source. setUser is now
    // defensive (merge) in the auth store, so this can never clobber a
    // fresher value — but the merge means a missing-roles payload can
    // still be a problem, hence the dedicated /user/roles hit.
    const haveRoles = Array.isArray(user.roles) && user.roles.length > 0;
    const haveVersion = typeof user.rolesVersion === 'number';
    if (!haveRoles || !haveVersion) {
      api.get('/user/roles')
        .then((r) => {
          const data = r.data || {};
          if (data.user && data.token) {
            useAuthStore.getState().setSession({ user: data.user, token: data.token });
          } else if (data.user) {
            useAuthStore.getState().setUser(data.user);
          } else if (Array.isArray(data.roles)) {
            useAuthStore.getState().setUser({ roles: data.roles, rolesVersion: data.rolesVersion ?? 0 });
          }
        })
        .catch(() => {});
    }

    // New skill in the community → refresh Browse live. No toast: broadcasting a
    // popup to every user on every skill add was phantom noise (v7 §3). Genuine
    // reciprocal matches are surfaced via the de-duped `perfect-match` event.
    socket.on('new-skill', () => {
      queryClient.invalidateQueries({ queryKey: ['skills', 'all'] });
    });

    // Someone equipped a new look → refresh the lists that embed their
    // cosmetics so their cards update live. Skip our own equips: the shop
    // mutation already painted them optimistically and invalidated locally.
    socket.on('cosmetics-changed', (data) => {
      if (data?.userId && data.userId === user._id) return;
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Listen for connection accepted
    socket.on('connection-accepted', (data) => {
      addToast(`${data.receiverName} accepted your connection request!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    });

    socket.on('connection-removed', () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    });

    // Force disconnect from video call (AI moderation)
    socket.on('force-disconnect', (data) => {
      addToast(data.reason || 'Call terminated by moderator', 'error');
      window.location.href = '/peer/connections';
    });

    return () => {
      disconnectSocket();
      isConnected.current = false;
    };
  }, [token, user?._id]);
};

export default useSocket;
