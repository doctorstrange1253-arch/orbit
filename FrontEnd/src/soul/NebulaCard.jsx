/**
 * soul/NebulaCard.jsx — A card whose shadow and border tint come from the
 * active soul's nebula color.
 *
 * Wraps the V2 `HolographicCard` (so the existing rarity-tinted background
 * and the cosmic badge system keep working) and ADDS a per-soul tinted
 * shadow + border. The card reads as "of the current soul" — a Pulsar
 * card on a Mentor page will be a different color than on a Peer page.
 *
 * Props:
 *   - rarity: 'common' | 'rare' | 'epic' | 'legendary'  (passed through)
 *   - className / children / style  (standard)
 *   - accent: optional soul-accent override ('supergiant' | 'voidBloom').
 *     Default = active soul.
 *
 * Why a wrapper, not a replacement: HolographicCard is used in 30+ places
 * across V2. We want every one of those to pick up the V3 soul-tint
 * automatically without rewriting each call site. Wrapping is one
 * import-change per file; replacing would be 30+ import-changes.
 */

import { forwardRef } from 'react';
import HolographicCard from '../components/fx/HolographicCard';
import { useSoul } from '../hooks/useSoul';
import { borderTint, surfaceRecipe, tintHalo } from './tints';

const NebulaCard = forwardRef(function NebulaCard(
  { children, className = '', style = {}, accent, rarity, ...rest },
  ref
) {
  const { id: soulId, accent: ctxAccent } = useSoul();
  const effectiveAccent = accent || ctxAccent || null;
  const recipe = surfaceRecipe(soulId, effectiveAccent);

  return (
    <HolographicCard
      ref={ref}
      rarity={rarity}
      className={className}
      style={{ ...recipe, ...style }}
      {...rest}
    >
      {children}
    </HolographicCard>
  );
});

export default NebulaCard;

// Re-export the surface utilities so a consumer can compose custom layouts
// without reaching into the internal tints file.
export { borderTint, surfaceRecipe, tintHalo };
