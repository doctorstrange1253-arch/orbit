/**
 * MasterControl — God Mode master override panel (superadmin only).
 *
 * A single surface to act on any account, wiring EXISTING audited admin
 * endpoints: grant/deduct Photons (/economy/adjust), force role/status
 * (/users/:id/role|status), unlock every cosmetic (/users/:id/unlock-cosmetics),
 * impersonate (/users/:id/impersonate → mints a real user JWT, dropped into the
 * main-app auth store), and soft/restore/hard delete (/records/...). Every
 * mutation is RBAC-gated + audited server-side. Styles use named constants (no
 * inline object literals) to keep the source robust.
 */
import { useState } from 'react';
import { Crown, Search, Loader2, Coins, Shield, Ban, UserCheck, Unlock, LogIn, Trash2, RotateCcw } from 'lucide-react';
import adminApi from '../adminApi';
import { useAuthStore } from '../../store/authStore';

const wrap = { display: 'flex', flexDirection: 'column', gap: 14 };
const card = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16 };
const h = { margin: '0 0 10px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 };
const btn = { padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 };
const btnGold = { ...btn, background: 'linear-gradient(90deg,#f59e0b,#d97706)', border: 'none', color: '#1a1206' };
const btnDanger = { ...btn, background: 'rgba(244,63,94,.15)', border: '1px solid rgba(244,63,94,.4)', color: '#fb7185' };
const input = { padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(0,0,0,.25)', color: '#fff', fontSize: 13, minWidth: 200 };
const label = { fontSize: 12, color: '#94a3b8', margin: '0 0 4px' };
const rowStyle = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 };
const rowItemStyle = { textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#e2e8f0', cursor: 'pointer', fontSize: 13 };
const rowSelStyle = { ...rowItemStyle, border: '1px solid rgba(245,158,11,.6)', background: 'rgba(245,158,11,.10)' };
const dim = { color: '#94a3b8', fontWeight: 400 };
const sep = { height: 1, background: 'rgba(255,255,255,.07)', margin: '14px 0' };
const note = { ...card, fontSize: 13, color: '#cbd5e1' };

export default function MasterControl() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [photon, setPhoton] = useState('');

  const errText = (e) => e?.response?.data?.message || e.message || 'Error';

  const search = async () => {
    setBusy('search'); setMsg('');
    try {
      const r = await adminApi.get('/users?limit=10&q=' + encodeURIComponent(q));
      setRows(r.data?.rows || []);
      if (!(r.data?.rows || []).length) setMsg('No users matched.');
    } catch (e) { setMsg(errText(e)); }
    setBusy('');
  };

  const run = async (name, fn, ok) => {
    setBusy(name); setMsg('');
    try { await fn(); setMsg(ok || 'Done.'); }
    catch (e) { setMsg(errText(e)); }
    setBusy('');
  };

  const id = sel?._id;

  const adjustPhotons = (sign) => run('photon', async () => {
    const amt = sign * Math.abs(parseInt(photon, 10) || 0);
    if (!amt) throw new Error('Enter a Photon amount.');
    await adminApi.post('/economy/adjust', { userId: id, amount: amt, reason: 'God Mode master override' });
  }, 'Photons updated.');

  const setRole = (role) => run('role', () => adminApi.post('/users/' + id + '/role', { role, reason: 'God Mode master override' }), 'Role set to ' + role + '.');
  const setStatus = (status) => run('status', () => adminApi.post('/users/' + id + '/status', { status, reason: 'God Mode master override', days: status === 'suspended' ? 7 : undefined }), 'Status set to ' + status + '.');
  const unlockAll = () => run('unlock', () => adminApi.post('/users/' + id + '/unlock-cosmetics', { reason: 'God Mode master override' }), 'All cosmetics granted.');
  const softDelete = () => run('soft', () => adminApi.post('/records/users/' + id + '/soft-delete', { reason: 'God Mode master override' }), 'Account soft-deleted.');
  const restore = () => run('restore', () => adminApi.post('/records/users/' + id + '/restore', {}), 'Account restored.');

  const hardDelete = () => {
    const email = sel?.email || '';
    const typed = window.prompt('IRREVERSIBLE. Type the email to hard-delete:\n' + email);
    if (!typed) return;
    run('hard', () => adminApi.post('/records/users/' + id + '/hard-delete', { confirmEmail: typed, reason: 'God Mode master override' }), 'Account hard-deleted.');
  };

  const impersonate = () => run('imp', async () => {
    const r = await adminApi.post('/users/' + id + '/impersonate', {});
    const data = r.data || {};
    if (!data.token) throw new Error('No token returned.');
    useAuthStore.getState().setToken(data.token);
    if (data.user) useAuthStore.getState().setUser(data.user);
    window.location.href = '/';
  }, 'Impersonating\u2026 opening the app.');

  return (
    <div style={wrap}>
      <h1 className="ssctl-h1" style={h}><Crown size={18} color="#f59e0b" /> God Mode — Master Override</h1>
      <div style={note}>
        Superadmin only. Every action here is audited server-side and takes effect immediately.
        Photon and account changes are enforced the same way as the standard admin tools.
      </div>

      <section style={card}>
        <h3 style={h}><Search size={16} /> Find a user</h3>
        <div style={rowStyle}>
          <input
            style={input}
            placeholder="name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
          />
          <button style={btn} onClick={search} disabled={busy === 'search'}>
            {busy === 'search' ? <Loader2 size={14} /> : <Search size={14} />} Search
          </button>
        </div>
        {rows.length > 0 && (
          <div style={listStyle}>
            {rows.map((u) => (
              <button
                key={u._id}
                style={sel && sel._id === u._id ? rowSelStyle : rowItemStyle}
                onClick={() => { setSel(u); setMsg(''); }}
              >
                <strong>{u.name || 'Unnamed'}</strong> <span style={dim}>{u.email} · {u.role || 'user'} / {u.status || 'active'}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {sel && (
        <section style={card}>
          <h3 style={h}><Crown size={16} color="#f59e0b" /> {sel.name || 'Unnamed'} <span style={dim}>({sel.email})</span></h3>

          <p style={label}>Photons</p>
          <div style={rowStyle}>
            <input style={input} type="number" placeholder="amount" value={photon} onChange={(e) => setPhoton(e.target.value)} />
            <button style={btn} onClick={() => adjustPhotons(1)} disabled={busy === 'photon'}><Coins size={14} /> Grant</button>
            <button style={btn} onClick={() => adjustPhotons(-1)} disabled={busy === 'photon'}><Coins size={14} /> Deduct</button>
          </div>

          <div style={sep} />
          <p style={label}>Cosmetics</p>
          <div style={rowStyle}>
            <button style={btnGold} onClick={unlockAll} disabled={busy === 'unlock'}><Unlock size={14} /> Unlock ALL cosmetics</button>
          </div>

          <div style={sep} />
          <p style={label}>Role</p>
          <div style={rowStyle}>
            <button style={btn} onClick={() => setRole('user')} disabled={busy === 'role'}>User</button>
            <button style={btn} onClick={() => setRole('moderator')} disabled={busy === 'role'}>Moderator</button>
            <button style={btn} onClick={() => setRole('admin')} disabled={busy === 'role'}><Shield size={14} /> Admin</button>
          </div>

          <div style={sep} />
          <p style={label}>Status</p>
          <div style={rowStyle}>
            <button style={btn} onClick={() => setStatus('active')} disabled={busy === 'status'}><UserCheck size={14} /> Active</button>
            <button style={btn} onClick={() => setStatus('suspended')} disabled={busy === 'status'}>Suspend 7d</button>
            <button style={btnDanger} onClick={() => setStatus('banned')} disabled={busy === 'status'}><Ban size={14} /> Ban</button>
          </div>

          <div style={sep} />
          <p style={label}>Act as user</p>
          <div style={rowStyle}>
            <button style={btnGold} onClick={impersonate} disabled={busy === 'imp'}><LogIn size={14} /> Impersonate (open app as this user)</button>
          </div>

          <div style={sep} />
          <p style={label}>Danger zone</p>
          <div style={rowStyle}>
            <button style={btn} onClick={softDelete} disabled={busy === 'soft'}><Trash2 size={14} /> Soft delete</button>
            <button style={btn} onClick={restore} disabled={busy === 'restore'}><RotateCcw size={14} /> Restore</button>
            <button style={btnDanger} onClick={hardDelete} disabled={busy === 'hard'}><Trash2 size={14} /> Hard delete</button>
          </div>
        </section>
      )}

      {msg && <div style={note}>{msg}</div>}
    </div>
  );
}
