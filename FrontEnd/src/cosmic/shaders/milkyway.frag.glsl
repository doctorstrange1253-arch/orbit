// milkyway.frag.glsl — fullscreen deep-space backdrop: fbm nebula tint + a diagonal
// Milky Way band + distant dust lanes. Used by the background sphere in TwinkleBackdrop.
// All noise is in-repo (noise.glsl chunk inlined below via import in JS).
uniform float uTime;
uniform float uMotion;
varying vec3 vPos;

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
  vec3 dir = normalize(vPos);
  vec2 uv = vec2(atan(dir.x, dir.z), asin(clamp(dir.y, -1.0, 1.0)));
  float t = uTime * 0.02 * uMotion;

  // nebula tint: two fbm layers drifting slowly
  float n1 = fbm(dir * 3.0 + vec3(t, 0.0, -t), 5);
  float n2 = fbm(dir * 6.0 + vec3(-t * 1.7, t, 0.0) + 11.3, 4);
  float neb = smoothstep(-0.4, 0.9, n1 * 0.7 + n2 * 0.3);

  // milky way band: gaussian around a great-circle tilted ~60deg
  float bandAngle = 1.05;
  vec3 bandNormal = normalize(vec3(sin(bandAngle), 0.35, cos(bandAngle)));
  float band = exp(-pow(dot(dir, bandNormal), 2.0) * 14.0);
  float bandNoise = fbm(dir * 9.0 + vec3(0.0, t, 0.0), 4);
  float bandCore = band * smoothstep(-0.6, 0.6, bandNoise);
  // dust lane: darker streak inside the band
  float lane = smoothstep(0.15, 0.45, bandNoise) * band;

  vec3 deep = vec3(0.008, 0.012, 0.030);          // space bg
  vec3 nebCol = mix(vec3(0.10, 0.05, 0.22), vec3(0.02, 0.10, 0.20), n2 * 0.5 + 0.5);
  vec3 bandCol = vec3(0.55, 0.48, 0.38) * 0.35;
  vec3 col = deep;
  col += nebCol * neb * 0.35;
  col += bandCol * bandCore * 0.8;
  col -= vec3(0.05, 0.04, 0.05) * lane * 0.8;     // dust lane darkens
  // vignette toward edges of the sphere
  col *= 1.0 - 0.35 * pow(length(dir.xz), 2.0);
  gl_FragColor = vec4(col, 1.0);
}
