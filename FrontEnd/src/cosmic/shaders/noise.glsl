// noise.glsl — shared procedural-noise chunk (authored in-repo; no external shader code).
// hash13 + 3D value noise + fbm. Range of vnoise/fbm is roughly [-1, 1].

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i);
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z
  ) * 2.0 - 1.0;
}

// Fractal Brownian Motion, `oct` octaves (cap 6 for mobile).
float fbm(vec3 p, int oct) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Banding-free twinkle: smooth window around a per-star phase, plus a cheap
// per-pixel hash dither so the pulse never steps in 8-bit bands.
float twinkle(float t, float phase, float dither) {
  float s = sin(t * 2.1 + phase * 6.2831);
  float w = smoothstep(-0.2, 0.2, s) - smoothstep(0.6, 1.0, s);
  return clamp(0.55 + 0.45 * w + dither * 0.06, 0.0, 1.0);
}

// Black-body-ish color temperature ramp (blue hot -> white -> orange cool).
vec3 starColor(float temp) {
  // temp in [0,1]: 0 = cool red, 0.5 = sun-like, 1 = hot blue
  vec3 c = clamp(vec3(
    1.0,
    mix(0.35, 0.95, temp),
    mix(0.10, 1.00, smoothstep(0.55, 1.0, temp))
  ), 0.0, 1.0);
  return c;
}
