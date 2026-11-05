import { useState } from 'react';

/**
 * Look-Dev Lab Shell — interactive parameter panel for planet generation,
 * bloom intensity, camera rig angles, and quality tier switching.
 * Leva is a dev-only dependency used to expose live tuning sliders so designers
 * can capture reference captures under the same canvases without code edits.
 *
 * Mounts only on a dev route /lab — the normal user flow is unaffected.
 */
export default function LookDevShell({ children }) {
  const [activeLab, setActiveLab] = useState('starfield');

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Dev nav */}
      <nav className="md:w-40 flex flex-col items-center justify-between bg-slate-900 border border-slate-800 rounded-xl py-2">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Look-Dev Lab</div>
        {[
          { id: 'starfield', label: 'Starfield' },
          { id: 'planet', label: 'Planet' },
          { id: 'shuttle', label: 'Shuttle' },
          { id: 'station', label: 'Station' },
          { id: 'uikit', label: 'UI Kit' },
          { id: 'postprocess', label: 'Postprocess' },
          { id: 'accessibility', label: 'Accessibility Fallback' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLab(tab.id)}
            className={`px-2 py-1 text-[10px] uppercase tracking-widest transition-colors ${
              activeLab === tab.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >{tab.label}</button>
        ))}
      </nav>

      {/* Parameter panel */}
      <div className="md:w-80">
        {activeLab === 'starfield' && (
          <ParameterPanel label="Star Density" min={500} max={8000} default={4000} step={500} />
        )}
        {activeLab === 'planet' && (
          <ParameterPanel label="Planet Seed Hex" min={0} max={999999} default={42} step={1} />
        )}
        {activeLab === 'shuttle' && (
          <ParameterPanel label="Camera Offset Y" min={0} max={15} default={10} step={0.5} />
        )}
        {activeLab === 'postprocess' && (
          <>
            <ParameterPanel label="Bloom Strength" min={0} max={1} step={0.05} default={0.5} />
            <ParameterPanel label="Tone Map Exposure" min={0} max={2} step={0.05} default={1.0} />
          </>
        )}
        {activeLab === 'accessibility' && (
          <ParameterPanel
            label="2D Fallback Toggle"
            min={0} max={1} step={1} default={0}
            displayDefault="On"
          />
        )}
      </div>

      {/* Capture trigger */}
      <button
        onClick={() => captureLabCapture(activeLab)}
        className="self-start px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold uppercase tracking-widest shadow-lg"
      >
        Capture [L]
      </button>

      {children}
    </div>
  );
}

function ParameterPanel({ label, min, max, default: _default, step }) {
  // Simplified display version of leva's interactive sliders — keeps the panel
  // self-contained without forcing every designer onto the leva UI chrome.
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-300">{label} — dev-only</div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
        <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
          <input type="range" min={min} max={max} value={_default ?? step > 0 ? _default : 0}
            className="w-full h-2 appearance-none bg-transparent" onChange={() => {}} />
        </div>
        <p className="text-[10px] text-slate-500 font-mono">default: {String(_default ?? '')}</p>
      </div>
    </div>
  );
}

async function captureLabCapture(labId) {
  // Internal dev route — screenshot spawning handled by Playwright E2E tests,
  // not here. Kept as an explicit call site to make the dev workflow discoverable.
  window.dispatchEvent(new CustomEvent('lookdev:capture', { detail: labId }));
}
