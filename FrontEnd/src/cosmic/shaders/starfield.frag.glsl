// starfield.frag.glsl — soft round point sprite with per-pixel dither (no banding),
// plus a faint diffraction spike on the brightest stars.
uniform float uTime;
varying vec3 vColor;
varying float vTw;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  // soft core + halo
  float core = smoothstep(0.5, 0.0, d);
  float halo = exp(-d * 6.0) * 0.35;
  float dither = hash21(gl_FragCoord.xy + fract(uTime) * 7.0) - 0.5;
  float a = clamp((core + halo) * vTw + dither * 0.08, 0.0, 1.0);
  // subtle cross spike on bright stars
  float spike = pow(abs(c.x), 40.0) + pow(abs(c.y), 40.0);
  vec3 col = vColor * (1.0 + spike * 0.6 * vTw);
  gl_FragColor = vec4(col, a);
}
