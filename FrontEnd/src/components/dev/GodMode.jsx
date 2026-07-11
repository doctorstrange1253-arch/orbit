/**
 * GodMode.jsx — owner/admin-only dev overlay (God Mode Part 4).
 * A tiny floating HUD: live FPS, network status, environment, and quick actions
 * (unlock all cosmetics for yourself, jump to the Command Center God Mode
 * panel). Rendered globally in App; returns null for non-admins.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Zap, Wifi, WifiOff, Unlock, X, Gauge } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const S = {
  fab: { position: 'fixed', right: '14px', bottom: '14px', zIndex: 2147483000, width: '40px', height: '40px', borderRadius: '9999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1205', background: 'linear-gradient(135deg,#fde68a,#f59e0b)', boxShadow: '0 4px 16px rgba(245,158,11,.45)' },
  panel: { position: 'fixed', right: '14px', bottom: '62px', zIndex: 2147483000, width: '234px', padding: '12px', borderRadius: '14px', color: '#e5e7eb', background: 'rgba(9,11,20,.94)', backdropFilter: 'blur(10px)', border: '1px solid rgba(245,158,11,.35)', boxShadow: '0 12px 40px rgba(0,0,0,.5)', fontSize: '12px' },
  head: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '8px', color: '#fbbf24' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontVariantNumeric: 'tabular-nums' },
  btn: { width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 10px', borderRadius: '9px', border: '1px solid rgba(245,158,11,.4)', background: 'rgba(245,158,11,.14)', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' },
  link: { width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 10px', borderRadius: '9px', border: '1px solid rgba(139,92,246,.4)', background: 'rgba(139,92,246,.14)', color: '#c4b5fd', fontWeight: 700, textDecoration: 'none' },
  close: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto', padding: 0, lineHeight: 0 },
  msg: { marginTop: '8px', fontSize: '11px', color: '#a7f3d0', wordBreak: 'break-word' },
};

export default function GodMode() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const raf = useRef(0);

  useEffect(() => {
    if (!open) return undefined;
    let frames = 0;
    let last = performance.now();
    const tick = (now) => {
      frames += 1;
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!user || user.role !== 'admin') return null;

  const env = import.meta.env.PROD ? 'prod' : 'dev';

  const unlockSelf = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await api.post('/user/god/unlock-all');
      const n = r.data && r.data.owned != null ? r.data.owned : 'all';
      setMsg('Unlocked ' + n + ' cosmetics. Reload to see them.');
    } catch (e) {
      const detail = e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message;
      setMsg('Failed: ' + detail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div style={S.panel} role="dialog" aria-label="God Mode overlay">
          <div style={S.head}>
            <Crown size={14} /> God Mode
            <button style={S.close} onClick={() => setOpen(false)} aria-label="Close"><X size={14} /></button>
          </div>
          <div style={S.row}><span style={S.chip}><Gauge size={12} /> FPS</span><b>{fps}</b></div>
          <div style={S.row}><span style={S.chip}>{online ? <Wifi size={12} /> : <WifiOff size={12} />} Network</span><b>{online ? 'online' : 'offline'}</b></div>
          <div style={S.row}><span style={S.chip}><Zap size={12} /> Env</span><b>{env}</b></div>
          <div style={S.row}><span style={S.chip}>User</span><b>{user.name}</b></div>
          <button style={S.btn} onClick={unlockSelf} disabled={busy}><Unlock size={13} /> {busy ? 'Working…' : 'Unlock all cosmetics'}</button>
          <Link style={S.link} to="/admin" onClick={() => setOpen(false)}><Crown size={13} /> Command Center</Link>
          {msg && <div style={S.msg}>{msg}</div>}
        </div>
      )}
      <button style={S.fab} onClick={() => setOpen((v) => !v)} title="God Mode" aria-label="Toggle God Mode overlay">
        <Crown size={20} />
      </button>
    </>
  );
}
