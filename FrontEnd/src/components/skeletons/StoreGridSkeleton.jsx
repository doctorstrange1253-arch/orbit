import { SkelBox, SkelCircle } from '../ui/SkeletonPrimitives';

/**
 * StoreGridSkeleton — shimmer placeholders for the Nebula Store / Holo-Bay
 * cosmetic grid. Mirrors the StoreCard shape (icon + price pill, title, price,
 * action bar) and reuses the exact responsive grid used by Shop.
 */
export const StoreCardSkeleton = () => (
  <div className="relative flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
    <div className="flex items-center justify-between">
      <SkelCircle size={44} />
      <SkelBox w={54} h={20} r={999} />
    </div>
    <SkelBox w="70%" h={14} r={5} />
    <SkelBox w="45%" h={10} r={4} />
    <SkelBox h={38} r={12} style={ { marginTop: 6 } } />
  </div>
);

export const StoreGridSkeleton = ({ count = 8 }) => (
  <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <StoreCardSkeleton key={i} />
    ))}
  </div>
);
