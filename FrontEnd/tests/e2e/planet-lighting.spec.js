import { test, expect } from '@playwright/test';

test('planet world-space diffuse lighting stays fixed while the camera orbits', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /THREE|WebGL|GLSL|shader/i.test(message.text())) errors.push(message.text());
  });
  await page.goto('/@vite/client');
  const pixels = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { default: vertexShader } = await import('/src/cosmic/shaders/planet.vert.glsl?raw');
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(64, 64);
    const target = new THREE.WebGLRenderTarget(64, 64);
    const geometry = new THREE.PlaneGeometry(4, 4);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: 'uniform vec3 uSunDir; varying vec3 vNormal; void main() { float light = max(dot(normalize(vNormal), normalize(uSunDir)), 0.0); gl_FragColor = vec4(vec3(light), 1.0); }',
      uniforms: { uSunDir: { value: new THREE.Vector3(0, 0, 1) } },
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    try {
      renderer.setRenderTarget(target);
      return [0, Math.PI / 4, Math.PI / 3].map((angle) => {
        camera.position.set(Math.sin(angle) * 4, 0, Math.cos(angle) * 4);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        const pixel = new Uint8Array(4);
        renderer.readRenderTargetPixels(target, 32, 32, 1, 1, pixel);
        return Array.from(pixel);
      });
    } finally {
      target.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
  });
  expect(errors).toEqual([]);
  for (const pixel of pixels) {
    expect(pixel[0]).toBeGreaterThanOrEqual(250);
    expect(pixel[3]).toBe(255);
  }
});
