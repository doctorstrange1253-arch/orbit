// planet.vert.glsl — passes object-space position + normal to the fragment stage.
// Terrain displacement happens on the CPU (icosphere vertices) so silhouettes
// are real geometry; the fragment shader only colors. This split keeps the
// vertex stage cheap and the fragment stage purely albedo/lighting.
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vObj = normalize(position);
  vNormal = normalize(normalMatrix * normal);
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
