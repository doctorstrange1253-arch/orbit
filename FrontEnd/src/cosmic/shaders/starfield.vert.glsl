// starfield.vert.glsl — per-star attributes: position, aSeed (color temp + phase + size).
// Twinkle is computed in the vertex shader per star (cheap), dither in fragment.
attribute float aSeed;
uniform float uTime;
uniform float uMotion; // 0 when reduced motion
varying vec3 vColor;
varying float vTw;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 starColor(float temp) {
  return clamp(vec3(
    1.0,
    mix(0.35, 0.95, temp),
    mix(0.10, 1.00, smoothstep(0.55, 1.0, temp))
  ), 0.0, 1.0);
}

void main() {
  vec3 pos = position;
  float temp = fract(aSeed * 0.618);
  float phase = fract(aSeed * 0.377) * 6.2831;
  float size = 1.0 + fract(aSeed * 0.911) * 2.5;
  float s = sin(uTime * 2.1 * uMotion + phase);
  float w = smoothstep(-0.2, 0.2, s) - smoothstep(0.6, 1.0, s);
  vTw = clamp(0.55 + 0.45 * w, 0.0, 1.0);
  vColor = starColor(temp);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = -mv.z;
  gl_PointSize = size * vTw * (140.0 / max(dist, 1.0));
}
