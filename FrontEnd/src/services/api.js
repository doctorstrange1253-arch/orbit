import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// True when running inside the Capacitor native shell (APK), false on the web.
// Read once; used to request a long-lived session on the APK (see interceptor).
let IS_NATIVE = false;
try {
  IS_NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
} catch { IS_NATIVE = false; }

const api = axios.create({
  // Fallback to absolute Render URL in production if VITE_API_URL is missing/malformed
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://orbit-2-he28.onrender.com/api' : '/api'),
  // Generous timeout so a Render free-tier cold start (instance waking from
  // sleep, ~30–60s) doesn't abort before the server is ready to respond.
  timeout: 45000,
  // Auth is Bearer-token only (the backend sets NO cookies for the user app —
  // only the separate admin panel uses cookies, via its own adminApi client).
  // Sending credentials from the Capacitor WebView origin (https://localhost) to
  // the cross-origin API marks every request "third-party", which Android's
  // WebView blocks — that was breaking email login/signup in the APK while OAuth
  // (deep-link token, no XHR) survived. Bearer tokens need no credentials.
  withCredentials: false,
});

// Request interceptor: attach JWT + signal the client platform so the backend
// can issue a long-lived (30d) session for the trusted APK install while the
// website keeps its short 1-day session.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (IS_NATIVE) {
    config.headers['X-Client-Platform'] = 'native';
  }
  return config;
});

// Response interceptor: handle 401 + ROLES_STALE.
//
// Two distinct 401 classes are handled here:
//   1. ROLES_STALE (code: 'ROLES_STALE') — the JWT's rolesVersion lags the
//      DB. The user's roles changed (e.g. they just added 'student' in
//      Settings, or got approved as a mentor). The token is otherwise valid,
//      so we transparently refresh it: hit GET /user/roles (which the auth
//      middleware allows through even when stale), swap in the fresh user
//      + token, then retry the original request ONCE. Without this the
//      user would be hard-redirected to /login on every role change, which
//      is jarring mid-flow (e.g. the user just added the role and the next
//      page would 401).
//   2. Any other 401 — the session is genuinely gone (expired/invalid).
//      Log out and send the user to /login. Two guards make this safe on
//      the APK where a full-page redirect reloads the whole WebView:
//        a. Only redirect ONCE — `redirecting` collapses the burst of
//           concurrent 401s that a dashboard load fires.
//        b. Skip if no token is in the store (already logged out) — a 401
//           on a public request must never bounce a signed-out user around.
//      403 + banned:true is treated as expired-session because every
//      request will 403 from here on.
let redirecting = false;
let refreshing = null; // single in-flight ROLES_STALE refresh

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const hasToken = !!useAuthStore.getState().token;

    // ── ROLES_STALE refresh path ────────────────────────────────────────
    // `error.config._rolesRetry` is set on the retried request so we don't
    // loop. We share a single in-flight refresh across all parallel 401s
    // (dashboard loads can fire a burst) so we only hit /user/roles once.
    if (status === 401 && code === 'ROLES_STALE' && hasToken && !error.config?._rolesRetry) {
      try {
        refreshing = refreshing || (async () => {
          // Use a raw axios call with the SAME token so the request goes
          // through the auth middleware's recovery branch. We can't use
          // the shared `api` instance because its interceptor would loop.
          const raw = axios.create({ baseURL: api.defaults.baseURL, timeout: api.defaults.timeout });
          const token = useAuthStore.getState().token;
          const res = await raw.get('/user/roles', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { user, token: newToken } = res.data || {};
          if (newToken && user) {
            useAuthStore.getState().setSession({ user, token: newToken });
          }
          return res;
        })();
        const fresh = await refreshing;
        refreshing = null;
        if (fresh?.data?.token) {
          // Retry the original request with the fresh token. We mutate
          // the axios config so the retry uses the new Authorization
          // header. _rolesRetry guards against a second 401 looping here.
          error.config.headers.Authorization = `Bearer ${fresh.data.token}`;
          error.config._rolesRetry = true;
          return api.request(error.config);
        }
      } catch (_) {
        refreshing = null;
        // Fall through to the generic 401 handler below.
      }
    }

    const is401 = status === 401;
    // 403 + banned:true is the middleware's ban gate: the session is useless
    // (every request will 403), so treat it like an expired session instead of
    // leaving the user "logged in" with a completely broken UI.
    const isBanned = status === 403 && error.response?.data?.banned === true;
    if ((is401 || isBanned) && hasToken && !redirecting && window.location.pathname !== '/login') {
      redirecting = true;                 // collapse concurrent 401s to a single redirect
      useAuthStore.getState().logout();   // clears the persisted token synchronously
      window.location.replace(isBanned ? '/login?error=account_banned' : '/login');  // replace() so the dead session isn't in history
    }
    return Promise.reject(error);
  }
);

export default api;
