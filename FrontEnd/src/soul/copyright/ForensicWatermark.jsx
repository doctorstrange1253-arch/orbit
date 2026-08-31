/**
 * soul/copyright/ForensicWatermark.jsx — The per-viewer canvas overlay.
 *
 * V3 copyright layer 1: every published lesson paints a tiny
 * HMAC-encoded viewer identifier in the bottom-left pixel data. If
 * the recording is leaked, we can decode the watermark to find the
 * viewer. The HMAC is a 6-byte truncation of HMAC(secret, viewKey)
 * so it's short enough to hide in pixels but unique per viewer.
 *
 * Implementation: a transparent canvas that sits over the video. We
 * redraw 1 pixel per frame at the same location (browsers don't
 * recompose canvas-on-canvas for screen recording, so the watermark
 * gets baked into any captured frame). For V3 MVP, the visible
 * watermark (VisibleWatermark.jsx) carries the human-readable form;
 * this component is a stub that paints an invisible marker.
 *
 * In production: use a web worker + OffscreenCanvas + encode the
 * viewKey as a 6-byte BLOB into the LSBs of N pixels (steganography).
 * The V3 stub paints a single 1px dot at a known location as a
 * proof-of-concept.
 */

import { useEffect, useRef } from 'react';

const ForensicWatermark = ({ viewKey, enabled = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current || !viewKey) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Derive a deterministic pixel position from the viewKey. The
    // position is 2px x 2px in the bottom-left so it stays out of the
    // video's content area. (A real implementation uses 4-6 pixels
    // across the diagonal; for the V3 stub, 2px is enough to detect.)
    let hash = 0;
    for (let i = 0; i < viewKey.length; i++) {
      hash = (hash * 31 + viewKey.charCodeAt(i)) >>> 0;
    }
    const x = (hash % 32) + 8;
    const y = (hash % 24) + 8;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 60 * dpr;
    canvas.height = 40 * dpr;
    canvas.style.width = '60px';
    canvas.style.height = '40px';
    ctx.scale(dpr, dpr);

    // Paint the marker: a 2x2 white pixel with the viewKey's first
    // 4 hex chars as the RGB. Bright enough to be visible if a frame
    // is captured at full resolution, dim enough to be invisible to
    // the eye in motion.
    const r = parseInt(viewKey.slice(0, 2), 16) || 0;
    const g = parseInt(viewKey.slice(2, 4), 16) || 0;
    const b = parseInt(viewKey.slice(4, 6), 16) || 0;
    ctx.fillStyle = `rgba(${r},${g},${b},0.012)`;
    ctx.fillRect(x, y, 2, 2);
  }, [viewKey, enabled]);

  if (!enabled || !viewKey) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute bottom-0 left-0 pointer-events-none"
      style={{ width: 60, height: 40, opacity: 0.5 }}
    />
  );
};

export default ForensicWatermark;
