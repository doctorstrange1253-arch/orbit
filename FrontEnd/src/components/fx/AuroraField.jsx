/**
 * AuroraField.jsx — WebGL aurora shader for hero / cinematic backdrops.
 *
 * Uses raw WebGL (no extra deps). One full-screen quad with a fragment
 * shader that mixes 4-5 domain-warped noise layers to produce flowing
 * aurora ribbons. The shader is fed a small uniform set (time, mouse,
 * resolution, three theme colors) and runs at native canvas resolution
 * (capped at devicePixelRatio = 1.5 for perf).
 *
 * Performance: a single fullscreen pass per frame, ~5 octaves of value
 * noise (no texture lookups). On prefers-reduced-motion the time
 * uniform is frozen. On tab hidden the rAF loop is paused.
 *
 * The component renders only the canvas — no chrome. Mount behind hero
 * copy with `position: absolute; inset: 0; z-index: -1`. The canvas
 * auto-resizes on window resize (ResizeObserver).
 */
import { useEffect, useRef } from 'react';

// Vertex shader: pass-through.
const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Fragment shader: domain-warped noise aurora. We avoid `fbm` loops by
// using a small fixed octave count for a fast, repeatable look.
const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;

// Hash → 2D value noise.
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0 - 2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
// Fractal noise (3 octaves).
float fbm(vec2 p){
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
        s += a * vnoise(p);
        p = p * 2.0 + vec2(13.0, 7.0);
        a *= 0.5;
    }
    return s;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    vec2 mouse = u_mouse / u_res.xy;
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    float t = u_time * 0.06;
    // Domain warp: distort p by an fbm, then sample again.
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 5.2));
    vec2 r = vec2(fbm(p * 1.6 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                  fbm(p * 1.6 + 2.0 * q + vec2(8.3, 2.8) - t * 0.9));

    float n = fbm(p * 1.4 + 2.4 * r);

    // Three aurora ribbons, each a sin-modulated band.
    float band1 = exp(-pow((n - 0.45) * 6.0, 2.0));
    float band2 = exp(-pow((n - 0.62) * 7.0, 2.0));
    float band3 = exp(-pow((n - 0.78) * 8.0, 2.0));

    // Mouse creates a soft "lens" of brightness.
    float md = distance(uv, vec2(mouse.x * aspect + (1.0 - aspect) * 0.5, mouse.y));
    float lens = smoothstep(0.55, 0.0, md) * 0.35;

    // Vertical falloff so the aurora is brightest in the upper third.
    float vf = smoothstep(-0.4, 0.6, p.y) * 0.9 + 0.1;

    vec3 col = u_c1 * band1 * vf
             + u_c2 * band2 * vf * 0.85
             + u_c3 * band3 * vf * 0.6
             + lens * mix(u_c1, u_c2, 0.5);

    // Deep-space vignette.
    float vig = smoothstep(1.2, 0.2, length(p));
    col *= mix(0.55, 1.0, vig);

    // Slight grain.
    float g = (hash(uv * u_res.xy + u_time) - 0.5) * 0.025;
    col += g;

    gl_FragColor = vec4(col, 1.0);
}
`;

const compile = (gl, type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        // Surface compile errors so they show up in dev console — the
        // shader is the most failure-prone piece of the page.
        console.error('Aurora shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
    }
    return s;
};

const link = (gl, vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('Aurora shader link error:', gl.getProgramInfoLog(p));
        return null;
    }
    return p;
};

// Parse "#rrggbb" → vec3 floats in 0..1
const hex2rgb = (h) => {
    if (!h || typeof h !== 'string') return [0, 0, 0];
    const s = h.replace('#', '');
    if (s.length !== 6) return [0, 0, 0];
    const r = parseInt(s.slice(0, 2), 16) / 255;
    const g = parseInt(s.slice(2, 4), 16) / 255;
    const b = parseInt(s.slice(4, 6), 16) / 255;
    return [r, g, b];
};

const AuroraField = ({ accentColors }) => {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const mouseRef  = useRef([0.5, 0.5]);
    const colorsRef = useRef([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    useEffect(() => {
        const [a, b, c] = (accentColors || ['#7c3aed', '#06b6d4', '#3b82f6']).map(hex2rgb);
        colorsRef.current = [a, b, c];
    }, [accentColors]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
        if (!gl) {
            // Fallback: keep the canvas black; BackgroundEffects will continue
            // to render its 2D layer behind it.
            return;
        }

        const vs = compile(gl, gl.VERTEX_SHADER,   VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return;
        const prog = link(gl, vs, fs);
        if (!prog) return;
        gl.useProgram(prog);

        // Fullscreen triangle.
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  3, -1,  -1,  3,
        ]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes   = gl.getUniformLocation(prog, 'u_res');
        const uTime  = gl.getUniformLocation(prog, 'u_time');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');
        const uC1    = gl.getUniformLocation(prog, 'u_c1');
        const uC2    = gl.getUniformLocation(prog, 'u_c2');
        const uC3    = gl.getUniformLocation(prog, 'u_c3');

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const resize = () => {
            const w = canvas.clientWidth  || canvas.parentElement?.clientWidth  || 800;
            const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 600;
            canvas.width  = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let t0 = performance.now();
        let mouseTarget = [0.5, 0.5];

        const onMouse = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseTarget = [
                (e.clientX - rect.left) * dpr,
                (rect.height - (e.clientY - rect.top)) * dpr,
            ];
        };
        window.addEventListener('pointermove', onMouse, { passive: true });

        const draw = (now) => {
            // Soft follow on the mouse so the aurora bends, not jitters.
            mouseRef.current[0] += (mouseTarget[0] - mouseRef.current[0]) * 0.08;
            mouseRef.current[1] += (mouseTarget[1] - mouseRef.current[1]) * 0.08;

            const t = reduced ? 0 : (now - t0) / 1000;
            const [c1, c2, c3] = colorsRef.current;
            gl.uniform1f(uTime, t);
            gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
            gl.uniform3f(uC1, c1[0], c1[1], c1[2]);
            gl.uniform3f(uC2, c2[0], c2[1], c2[2]);
            gl.uniform3f(uC3, c3[0], c3[1], c3[2]);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);

        const onVis = () => {
            if (document.hidden) {
                cancelAnimationFrame(rafRef.current);
            } else {
                t0 = performance.now() - 0;
                rafRef.current = requestAnimationFrame(draw);
            }
        };
        document.addEventListener('visibilitychange', onVis);

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            window.removeEventListener('pointermove', onMouse);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 0,
            }}
        />
    );
};

export default AuroraField;
