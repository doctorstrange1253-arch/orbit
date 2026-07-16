/**
 * useShop.js — react-query hooks for the Stardust Cosmetics Shop (Tier 3).
 * Mirrors useOrbit.js. Buying/equipping also refreshes the orbit balance.
 *
 * Buy/equip are OPTIMISTIC: the shop payload shape is fully known
 * ({ photons, stardust, owned[], equipped{slot}, catalog[{key,type,cost,...}] })
 * so we can compute the post-mutation state locally and paint it the instant
 * the user clicks — the old invalidate-and-wait flow made every purchase/equip
 * feel seconds slow. Server response still overwrites the cache on success,
 * and errors roll back to the snapshot.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const SHOP_KEY = ['orbit', 'shop'];

// shop slot type → user.orbit.cosmetics field (the shape GlowName /
// equippedFromUser read). Own-name surfaces (My Skills, header, profile)
// render from the authStore user, so equipping must update it in place —
// otherwise the new look only appears after a full re-login.
const SLOT_FIELD = {
  name_glow: 'nameGlow',
  background: 'background',
  avatar_deco: 'avatarDeco',
  profile_effect: 'profileEffect',
  nameplate: 'nameplate',
};

export function useShop({ enabled = true } = {}) {
  return useQuery({
    queryKey: SHOP_KEY,
    queryFn: () => api.get('/orbit/shop').then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useBuyCosmetic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key) => api.post('/orbit/shop/buy', { key }).then((r) => r.data),
    onMutate: async (key) => {
      await qc.cancelQueries({ queryKey: SHOP_KEY });
      const prev = qc.getQueryData(SHOP_KEY);
      qc.setQueryData(SHOP_KEY, (old) => {
        if (!old) return old;
        const item = (old.catalog || []).find((c) => c.key === key);
        if (!item || item.owned) return old;
        // `price` = today's charge (weekly deal / admin discount); cost is list.
        const balance = Math.max(0, (old.photons ?? old.stardust ?? 0) - (item.price ?? item.cost));
        return {
          ...old,
          photons: balance,
          stardust: balance,
          owned: [...(old.owned || []), key],
          catalog: (old.catalog || []).map((c) =>
            c.key === key
              ? { ...c, owned: true, affordable: true }
              : { ...c, affordable: balance >= (c.price ?? c.cost) }),
        };
      });
      return { prev };
    },
    onError: (_e, _key, ctx) => {
      if (ctx?.prev) qc.setQueryData(SHOP_KEY, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(SHOP_KEY, (prev) => ({ ...prev, ...data }));
      qc.invalidateQueries({ queryKey: ['orbit', 'me'] }); // Stardust balance changed
    },
  });
}

export function useEquipCosmetic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, key }) => api.post('/orbit/shop/equip', { type, key }).then((r) => r.data),
    onMutate: async ({ type, key }) => {
      await qc.cancelQueries({ queryKey: SHOP_KEY });
      const prev = qc.getQueryData(SHOP_KEY);
      qc.setQueryData(SHOP_KEY, (old) => {
        if (!old) return old;
        const equipped = { ...(old.equipped || {}), [type]: key };
        const wearing = new Set(Object.values(equipped).filter(Boolean));
        return {
          ...old,
          equipped,
          catalog: (old.catalog || []).map((c) => ({ ...c, equipped: wearing.has(c.key) })),
        };
      });
      // Paint the viewer's OWN surfaces the same instant: My Skills cards, the
      // header and the profile all render cosmetics from the authStore user.
      const { user, setUser } = useAuthStore.getState();
      const prevUser = user;
      const field = SLOT_FIELD[type];
      if (user && field) {
        setUser({
          ...user,
          orbit: {
            ...(user.orbit || {}),
            cosmetics: { ...(user.orbit?.cosmetics || {}), [field]: key },
          },
        });
      }
      return { prev, prevUser };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(SHOP_KEY, ctx.prev);
      if (ctx?.prevUser) useAuthStore.getState().setUser(ctx.prevUser);
    },
    onSuccess: (data) => {
      qc.setQueryData(SHOP_KEY, (prev) => ({ ...prev, ...data }));
      // The equipped look is rendered by GlowName everywhere the user appears,
      // so refresh every surface that shows it — not just the profile page.
      // 'skills' covers Browse/My Skills/Matches lists that embed the owner.
      ['profile', 'cosmic', 'leaderboard', 'connections', 'skills'].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['orbit', 'me'] });
    },
  });
}
