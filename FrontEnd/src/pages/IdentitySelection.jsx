/**
 * pages/IdentitySelection.jsx — The V3 onboarding page.
 *
 * Renders `IdentityBloom` (the three celestial bodies with bloom animation)
 * and, on `onChoose(soulId)`, calls `useSoul().set(soulId)` which triggers
 * the Transit Sequence ceremony and navigates to the chosen soul's home.
 *
 * This page replaces the V2 3-radio role picker at `/onboarding/role`.
 * The V2 path is kept as a deprecated alias (redirects here).
 *
 * The page is intentionally a full-screen ceremony with no navbar/chrome
 * — the user is in a moment of choice, not navigating. The Layout chrome
 * (sidebar, navbar) is bypassed for this single route.
 */

import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import IdentityBloom from '../soul/IdentityBloom';
import { useSoul } from '../hooks/useSoul';
import { useIdentityTransit } from '../soul/identityStore';
import { SOULS } from '../soul/registry';

const IdentitySelection = () => {
  const navigate = useNavigate();
  const soul = useSoul();

  // If the user arrives with a single role (e.g. they're a mentor already
  // and just need to confirm), preselect that soul — no choice needed.
  const preselectFromRoles = () => {
    const roles = soul.soul ? [soul.soul.roleId] : [];
    if (roles.length === 1 && SOULS[Object.keys(SOULS).find((id) => SOULS[id].roleId === roles[0])]) {
      return Object.keys(SOULS).find((id) => SOULS[id].roleId === roles[0]);
    }
    return null;
  };

  // Cancel any in-flight transit when the page mounts — if a user lands
  // here from a back-button or external link, the store should be clean.
  useEffect(() => {
    useIdentityTransit.getState().cancel();
  }, []);

  const onChoose = (soulId) => {
    // The hook will trigger the Transit Sequence, then navigate to the
    // soul's home. We pass `onDone` to the hook's `set()` so the navigation
    // happens after the ceremony.
    soul.set(soulId);
    // Belt-and-suspenders: if the ceremony is skipped (reduced-motion), the
    // store still runs its 2.5s timer; navigate immediately as a fallback
    // so the user isn't stuck on the bloom screen.
    setTimeout(() => {
      if (window.location.pathname === '/identity') {
        navigate(SOULS[soulId].homeRoute, { replace: true });
      }
    }, 2600);
  };

  return (
    <>
      <Helmet><title>Choose your soul · Orbit</title></Helmet>
      <IdentityBloom onChoose={onChoose} />
    </>
  );
};

export default IdentitySelection;
