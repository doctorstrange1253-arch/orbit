import { useEffect, useState, useSyncExternalStore } from 'react';

function subscribeMotion(listener) {
  const media = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : null;
  media?.addEventListener?.('change', listener);
  return () => media?.removeEventListener?.('change', listener);
}

function motionSnapshot() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function useQualityTier() {
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);
  const [capability, setCapability] = useState({ supported: false, tier: 'low' });

  useEffect(() => {
    let supported;
    try {
      const context = document.createElement('canvas').getContext('webgl2');
      supported = !!context;
      context?.getExtension?.('WEBGL_lose_context')?.loseContext();
    } catch { supported = false; }
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    const tier = !supported || (small && memory < 4) ? 'low'
      : cores < 4 || memory < 8 || small ? 'medium' : 'high';
    setCapability({ supported, tier });
  }, []);

  return { supported: capability.supported, tier: reducedMotion ? 'low' : capability.tier, reducedMotion };
}
