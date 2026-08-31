/**
 * hooks/useSoul.js — The soul hook.
 *
 * The single hook every V3 component should use to know "what soul am I
 * in right now?". Returns an object with the active soul's full metadata
 * (id, celestial, accent, tone, homeRoute, label, description), the
 * resolved nebula (from palette.js), and a `set(soulId)` function that
 * triggers the Transit Sequence ceremony.
 *
 * The hook reads:
 *   1. `useAuthStore().user.roles` to know WHICH souls the user has.
 *   2. `useLocation().pathname` to know which soul is ACTIVE (i.e. which
 *      window the user is in right now). Falls back to the first role
 *      the user holds if the pathname is on a shared page.
 *
 * The active soul is the one whose home route the user is currently in. If
 * they're on `/profile` (a shared page), we use their "primary" soul —
 * mentor > student > peer (mirrors the priority in getLandingRoute).
 */

import { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SOULS, soulForPathname, SOUL_ACCENTS } from '../soul/registry';
import { getLayeredNebula, gradientCss } from '../soul/palette';
import { useIdentityTransit } from '../soul/identityStore';

// Pure helper: which soul should we treat as "active" for a pathname + roles?
// Mirrors the priority of getLandingRoute in authStore.js.
function _resolveActiveSoul(pathname, roles) {
  const fromUrl = soulForPathname(pathname);
  if (fromUrl && roles.includes(SOULS[fromUrl].roleId)) return fromUrl;

  // Shared page — pick the highest-priority role the user has.
  if (roles.includes('mentor')) return 'mentor';
  if (roles.includes('student')) return 'student';
  if (roles.includes('peer_learner')) return 'peer';

  // Empty roles (shouldn't happen — peer_learner is always on) — fallback.
  return 'peer';
}

export function useSoul() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const roles = useMemo(() => {
    const r = Array.isArray(user?.roles) && user.roles.length > 0
      ? user.roles
      : ['peer_learner'];
    return r;
  }, [user?.roles]);

  const activeId = useMemo(
    () => _resolveActiveSoul(location.pathname, roles),
    [location.pathname, roles]
  );

  // Optional: layer an achievement accent (supergiant / voidBloom) on top
  // of the active soul. V3-A wires this to user.gameology/pact state in a
  // later phase; for now the user can call `useSoul().setAccent()` to
  // manually override (e.g. for a preview or admin demo).
  const accent = useIdentityTransit((s) => s.accent) || null;

  const soul = SOULS[activeId];
  const nebula = getLayeredNebula(activeId, accent);
  const gradient = gradientCss(activeId, accent);

  /**
   * Switch to a different soul with the Transit Sequence ceremony.
   * The hook calls navigate() AFTER the ceremony completes (so the user
   * doesn't see the new page until the bloom is done). If the user is
   * already on the target soul, this is a no-op.
   */
  const set = useCallback((toSoulId) => {
    if (!SOULS[toSoulId]) return;
    if (toSoulId === activeId) return;
    const targetHome = SOULS[toSoulId].homeRoute;
    useIdentityTransit.getState().start({
      from: activeId,
      to: toSoulId,
      onDone: () => navigate(targetHome),
    });
  }, [activeId, navigate]);

  // For testing or admin previews: set a temporary accent.
  const setAccent = useCallback((accentId) => {
    useIdentityTransit.setState({ accent: accentId || null });
  }, []);

  return {
    id: activeId,
    soul,
    nebula,
    gradient,
    accent,
    set,
    setAccent,
    accents: SOUL_ACCENTS,
    homeRoute: soul.homeRoute,
  };
}

// Convenience: just the active soul id. Use this when you only need the id
// and don't want to recompute the full object.
export function useSoulId() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const roles = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles
    : ['peer_learner'];
  return _resolveActiveSoul(location.pathname, roles);
}

export default useSoul;
