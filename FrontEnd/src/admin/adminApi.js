/**
 * adminApi — isolated axios instance for the Admin Command Center.
 *
 * Deliberately separate from the user `services/api.js`: it sends cookies
 * (withCredentials) instead of the user JWT, talks only to the unguessable
 * `/api/__ssctl` base, and attaches the double-submit CSRF header on mutations.
 * It never touches the user auth store.
 *
 * SPLIT-DEPLOY RESILIENCE: Vercel (frontend) → Render (backend) is a THIRD-
 * PARTY cookie context. Safari blocks those cookies entirely; Chrome
 * increasingly does. When cookies die, cookie-only auth bricks the whole
 * portal ("every admin command is not working"). So the server also returns
 * the session token in the login body, we keep it in sessionStorage, and every
 * request carries `Authorization: Bearer` — the backend accepts either. The
 * bearer path needs no CSRF (browsers never attach that header on their own),
 * but we still send x-ssctl-csrf for the cookie path.
 */
import axios from 'axios';

// Same API origin as the user app, namespaced under the hidden admin base.
const USER_API = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://skillswap-backend-mb4k.onrender.com/api' : '/api');
const ADMIN_BASE = `${USER_API}/__ssctl`;

const adminApi = axios.create({
  baseURL: ADMIN_BASE,
  withCredentials: true,
  // Match services/api.js: a Render free-tier cold start takes ~30-60s. The old
  // 30s timeout made the FIRST admin request after idle fail spuriously — which
  // read as "the whole portal is down".
  timeout: 45000,
});

function readCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// ── Tokens the server hands us in response BODIES (cookie-independent) ──────
let csrfToken = null;
let sessionToken = null;   // bearer fallback when cross-site cookies are blocked
let pendingToken = null;   // between password and TOTP (login flow only)
try {
  csrfToken = sessionStorage.getItem('ssctl_csrf') || null;
  sessionToken = sessionStorage.getItem('ssctl_bearer') || null;
} catch { /* no sessionStorage */ }

export function setAdminCsrf(token) {
  csrfToken = token || null;
  try {
    if (token) sessionStorage.setItem('ssctl_csrf', token);
    else sessionStorage.removeItem('ssctl_csrf');
  } catch { /* no sessionStorage */ }
}

export function setAdminSession(token) {
  sessionToken = token || null;
  try {
    if (token) sessionStorage.setItem('ssctl_bearer', token);
    else sessionStorage.removeItem('ssctl_bearer');
  } catch { /* no sessionStorage */ }
}

export function setAdminPending(token) {
  pendingToken = token || null;
}

// Attach bearer session + CSRF (double-submit) + pending-step tokens.
adminApi.interceptors.request.use((config) => {
  if (sessionToken) config.headers['Authorization'] = `Bearer ${sessionToken}`;
  if (pendingToken) config.headers['x-ssctl-pending'] = pendingToken;
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrf = csrfToken || readCookie('ssctl_csrf');
    if (csrf) config.headers['x-ssctl-csrf'] = csrf;
  }
  return config;
});

export default adminApi;
