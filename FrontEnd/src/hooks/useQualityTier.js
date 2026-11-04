import { useState, useEffect } from 'react';

/**
 * useQualityTier — detects device capability and exposes a tier string for
 * the V3 quality-tier budget system. Coarse-grained (hardware + OS + viewport)
 * so the R3F scene can conditionally render the heavy postprocessing stack or
 * fall back to a lighter scene material.
 *
 * Tiers: 'ultra' | 'high' | 'medium' | 'low'
 * 'low'  = weak GPU + small viewport → 2D SVG map + no postprocessing
 * 'low  | '2d' = power saver, reduced motion, or WebGL unavailable → DOM fallback
 * 'low' | '2d' = disabled GPU caps + aggressive polygon cap
 */
export default function useQualityTier() {
  const [tier, setTier] = useState('high');

  useEffect(() => {
    // hardwareConcurrency / deviceMemory are NUMBERS (not functions) in browsers.
    const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    const memory = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4; // GB
    let hasWebGL = false;
    try {
      hasWebGL = typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2');
    } catch { hasWebGL = false; }

    // Mobile / small viewport hint
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    const isSmallViewport = Math.min(w, h) < 600;

    // Reduced motion OS preference wins over device capability
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let computed = 'high';
    if (!hasWebGL || prefersReducedMotion || (isSmallViewport && memory < 4)) {
      computed = 'low';
    } else if (cores < 4 || memory < 4) {
      computed = 'medium';
    } else if (isSmallViewport || memory < 8) {
      computed = 'medium';
    }
    setTier(computed);
  }, []);

  return tier;
}
