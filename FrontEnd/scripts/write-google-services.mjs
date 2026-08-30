// FrontEnd/scripts/write-google-services.mjs
//
// Materialise android/app/google-services.json from the GOOGLE_SERVICES_JSON
// environment variable at build time — for CI / hosted builds that inject the
// Firebase Android config as an env var instead of committing the file.
//
// Behaviour (all non-fatal — a missing config just means push stays off):
//   * If android/app/google-services.json already exists -> leave it untouched
//     (a committed file always wins).
//   * Else if GOOGLE_SERVICES_JSON is set -> write it. Accepts raw JSON or
//     base64-encoded JSON (mirrors the backend's FCM_SERVICE_ACCOUNT_JSON).
//   * Else -> do nothing; the build proceeds and __FCM_CONFIGURED__ stays false.
//
// Wired into "npm run build" so both the Vite __FCM_CONFIGURED__ detector and
// the Gradle google-services plugin can see the file.

import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../android/app/google-services.json');

const log = (msg) => console.log(`[fcm-config] ${msg}`);

if (existsSync(target)) {
  log('android/app/google-services.json present — using committed file.');
  process.exit(0);
}

const raw = process.env.GOOGLE_SERVICES_JSON;
if (!raw || !raw.trim()) {
  log('no committed file and GOOGLE_SERVICES_JSON not set — push stays OFF (safe).');
  process.exit(0);
}

try {
  const text = raw.trim();
  const json = text.startsWith('{') ? text : Buffer.from(text, 'base64').toString('utf8');
  // Validate it parses before writing so we never emit a broken file.
  JSON.parse(json);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, json.endsWith('\n') ? json : json + '\n', 'utf8');
  log('wrote android/app/google-services.json from GOOGLE_SERVICES_JSON.');
} catch (err) {
  // Non-fatal: never break the build over push config.
  log(`GOOGLE_SERVICES_JSON could not be parsed (${err.message}) — push stays OFF.`);
  process.exit(0);
}
