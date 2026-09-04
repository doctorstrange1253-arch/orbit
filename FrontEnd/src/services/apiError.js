export function describeApiError(err) {
  if (!err) return null;
  const res = err.response;
  if (!res) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (offline) return 'You appear to be offline.';
    if (err.code === 'ECONNABORTED') return 'The server took too long to answer.';
    return 'Could not reach the server.';
  }
  const body = res.data || {};
  const said = body.message || body.error || '';
  const code = body.code ? ` · ${body.code}` : '';
  return `${res.status}${code}${said ? ` — ${said}` : ''}`;
}

export function apiErrorCode(err) {
  return err?.response?.data?.code || null;
}

export function apiErrorStatus(err) {
  return err?.response?.status ?? null;
}

export function isRoleRequired(err) {
  return apiErrorStatus(err) === 403 && apiErrorCode(err) === 'ROLE_REQUIRED';
}
