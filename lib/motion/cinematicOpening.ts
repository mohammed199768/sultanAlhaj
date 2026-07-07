"use client";

/**
 * cinematicOpening.ts — lightweight OGL cylinder-carousel scene for the
 * homepage opening chapter. No Three.js; OGL only.
 *
 * Owns: renderer, camera, textured plane ring, RAF loop.
 * Driven from outside via setProgress(0..1) (ScrollTrigger scrub owns it).
 * start()/stop() pause the RAF (offscreen / heavy transitions).
 */
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from "ogl";

export interface CylinderScene {
  setProgress: (p: number) => void;
  resize: (w: number, h: number) => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

const VERTEX = /* glsl */ `
attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uCurve;
uniform float uHalfW;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float nx = p.x / uHalfW;
  // Gentle bend toward the cylinder axis so the ring reads as a surface.
  p.z -= uCurve * nx * nx;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uScale;
uniform float uLoaded;
uniform float uDim;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * uScale + 0.5;
  vec3 tex = texture2D(tMap, uv).rgb;
  // navy-600 (#071739) placeholder while the image streams in.
  vec3 base = vec3(0.027, 0.090, 0.224);
  vec3 col = mix(base, tex, uLoaded);
  // Soft edge falloff keeps panels cinematic instead of billboard-flat.
  float edge = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
  col *= uDim * (0.72 + 0.28 * edge);
  gl_FragColor = vec4(col, 1.0);
}
`;

interface CamKey {
  p: number;
  x: number;
  y: number;
  z: number; // multiplier of ring radius
  lookY: number;
}

// 5 phases: wide establish → rise/approach → closer orbit → near/inside → calm exit.
const CAM_KEYS: CamKey[] = [
  { p: 0.0, x: 0.0, y: 1.3, z: 2.9, lookY: 0.1 },
  { p: 0.28, x: 0.0, y: 0.55, z: 2.3, lookY: 0.05 },
  { p: 0.55, x: 0.9, y: 0.1, z: 1.7, lookY: 0.0 },
  { p: 0.8, x: 0.25, y: -0.05, z: 0.92, lookY: 0.0 },
  { p: 1.0, x: 0.0, y: 0.45, z: 1.9, lookY: 0.08 },
];

const MAX_TEXTURE_SIZE = 1024;

/** Downscale oversized images before GPU upload (≤1024px wide). */
function downscale(img: HTMLImageElement): HTMLImageElement | HTMLCanvasElement {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w <= MAX_TEXTURE_SIZE || h === 0) return img;
  const canvas = document.createElement("canvas");
  canvas.width = MAX_TEXTURE_SIZE;
  canvas.height = Math.round((h * MAX_TEXTURE_SIZE) / w);
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cameraAt(p: number): { x: number; y: number; z: number; lookY: number } {
  const clamped = Math.min(1, Math.max(0, p));
  let a = CAM_KEYS[0];
  let b = CAM_KEYS[CAM_KEYS.length - 1];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    if (clamped >= CAM_KEYS[i].p && clamped <= CAM_KEYS[i + 1].p) {
      a = CAM_KEYS[i];
      b = CAM_KEYS[i + 1];
      break;
    }
  }
  const span = b.p - a.p || 1;
  const t = smooth((clamped - a.p) / span);
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    lookY: lerp(a.lookY, b.lookY, t),
  };
}

export function createCylinderScene(
  canvas: HTMLCanvasElement,
  imageSrcs: string[]
): CylinderScene {
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.75);
  const renderer = new Renderer({ canvas, dpr, alpha: true, antialias: true });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 42, near: 0.1, far: 120 });
  const scene = new Transform();
  const ring = new Transform();
  ring.setParent(scene);

  // Ring geometry: N gently-curved planes around a circle.
  const count = imageSrcs.length;
  const planeH = 3.2;
  const planeW = planeH * 0.72;
  const gap = 0.55;
  const radius = (count * (planeW + gap)) / (2 * Math.PI);
  const curve = (planeW * planeW) / 4 / (2 * radius);

  const geometry = new Plane(gl, { width: planeW, height: planeH, widthSegments: 16 });
  const meshes: Mesh[] = [];
  const loaders: HTMLImageElement[] = [];

  imageSrcs.forEach((src, i) => {
    const texture = new Texture(gl, { generateMipmaps: false });
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      cullFace: false,
      uniforms: {
        tMap: { value: texture },
        uScale: { value: [1, 1] },
        uLoaded: { value: 0 },
        uDim: { value: 0.92 },
        uCurve: { value: curve },
        uHalfW: { value: planeW / 2 },
      },
    });

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      // Cap texture size: full-size webp uploads stall the GPU for nothing
      // at this panel scale. Canvas sources respect UNPACK_FLIP_Y everywhere.
      texture.image = downscale(img);
      const imgA = img.naturalWidth / Math.max(1, img.naturalHeight);
      const planeA = planeW / planeH;
      program.uniforms.uScale.value =
        imgA > planeA ? [planeA / imgA, 1] : [1, imgA / planeA];
      program.uniforms.uLoaded.value = 1;
    };
    img.src = src;
    loaders.push(img);

    const mesh = new Mesh(gl, { geometry, program });
    const angle = (i / count) * Math.PI * 2;
    mesh.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    mesh.rotation.y = angle;
    mesh.setParent(ring);
    meshes.push(mesh);
  });

  let progress = 0;
  let idle = 0;
  let raf = 0;
  let running = false;
  let destroyed = false;

  const applyAndRender = () => {
    const cam = cameraAt(progress);
    camera.position.set(cam.x, cam.y, cam.z * radius);
    camera.lookAt([0, cam.lookY, 0]);
    // Slower, more premium than the demo: just over half a turn across the chapter.
    ring.rotation.y = idle + progress * Math.PI * 1.15;
    renderer.render({ scene, camera });
  };

  const loop = () => {
    if (!running || destroyed) return;
    idle += 0.0006; // subtle drift so the ring never feels frozen
    applyAndRender();
    raf = requestAnimationFrame(loop);
  };

  return {
    setProgress(p: number) {
      // No render while paused: scrub keeps feeding progress even when the
      // chapter is offscreen; start() resyncs with one frame instead.
      progress = p;
    },
    resize(w: number, h: number) {
      if (destroyed || w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
      applyAndRender();
    },
    start() {
      if (running || destroyed) return;
      running = true;
      applyAndRender(); // resync immediately with the latest scrub progress
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      loaders.forEach((img) => {
        img.onload = null;
        img.src = "";
      });
      meshes.forEach((m) => {
        m.setParent(null);
      });
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    },
  };
}
