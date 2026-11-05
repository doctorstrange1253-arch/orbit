// planet.frag.glsl — one fragment shader for all 8 archetypes, driven purely by
// uniforms from ARCHETYPE_UNIFORMS (PlanetGenerator.jsx). Authored in-repo.
//
// Features: fbm terrain heightmap -> color ramp, ocean mask + specular sun
// glint, polar caps by latitude, Blinn-Phong sun lighting from the central
// star direction, night-side city lights with a soft terminator, fresnel
// atmosphere rim. No textures — zero download, deterministic per seed.
//
// Uniforms:
//   uSeed (float), uPalA/B/C (vec3), uOcean (vec3), uOceanLevel (float),
//   uCap (vec3), uCapLevel (float), uAtmo (vec3), uAtmoStrength (float),
//   uNight (float), uSunDir (vec3, direction TO the star), uSunColor (vec3),
///  uTime (float), uMotion (float)
uniform float uSeed;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uOcean;
uniform float uOceanLevel;
uniform vec3 uCap;
uniform float uCapLevel;
uniform vec3 uAtmo;
uniform float uAtmoStrength;
uniform float uNight;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uTime;
uniform float uMotion;

varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vWorld;

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
  return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
             mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z) * 2.0 - 1.0;
}
float fbm(vec3 p, int oct) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 P = vObj * 2.4 + vec3(uSeed * 0.371, uSeed * 0.117, -uSeed * 0.233);
  // terrain height in [0,1]
  float h = fbm(P, 5) * 0.5 + 0.5;
  // continents: sharpen mid-tones
  h = smoothstep(0.28, 0.72, h);

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uSunDir);
  vec3 V = normalize(cameraPosition - vWorld);
  float lat = abs(vObj.y);

  // --- terrain albedo ramp ---
  vec3 land = mix(uPalA, uPalB, smoothstep(0.35, 0.62, h));
  land = mix(land, uPalC, smoothstep(0.68, 0.92, h));
  // grain: high-freq detail on the surface
  float grain = vnoise(P * 14.0) * 0.5 + 0.5;
  land *= 0.92 + grain * 0.16;

  // --- ocean ---
  float ocean = smoothstep(uOceanLevel + 0.02, uOceanLevel - 0.06, h);
  vec3 oceanCol = uOcean * (0.75 + 0.5 * fbm(P * 5.0 + 7.7, 3));
  vec3 albedo = mix(land, oceanCol, ocean);

  // --- polar caps ---
  float cap = smoothstep(uCapLevel, uCapLevel + 0.08, lat) * (1.0 - ocean * 0.25);
  albedo = mix(albedo, uCap, clamp(cap, 0.0, 1.0));

  // --- sun lighting (diffuse + specular sun glint on water) ---
  float ndl = dot(N, L);
  float day = smoothstep(-0.08, 0.25, ndl);
  vec3 amb = albedo * 0.035;
  vec3 dif = albedo * uSunColor * max(ndl, 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 90.0) * ocean * day;
  vec3 col = amb + dif + uSunColor * spec * 0.9;

  // --- night side: city-light specks ---
  float nightMask = (1.0 - smoothstep(-0.25, 0.05, ndl)) * (1.0 - ocean) * (1.0 - cap);
  float city = step(0.985, hash13(floor(P * 60.0)));
  float cityGlow = step(0.93, hash13(floor(P * 60.0) + 4.2)) * 0.25;
  col += vec3(1.0, 0.75, 0.45) * (city + cityGlow) * nightMask * uNight;

  // --- atmosphere fresnel rim ---
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
  float dayAtmo = 0.25 + 0.75 * max(dot(normalize(vWorld), L), 0.0);
  col += uAtmo * fres * uAtmoStrength * dayAtmo;

  gl_FragColor = vec4(col, 1.0);
}
