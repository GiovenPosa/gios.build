// The red orb's look, shared by everything that draws it: the ring behind the
// hero (components/heroOrb.tsx) and the stroke down "How we'll work"
// (components/processSteps.tsx). One set of colours, one rim profile, one
// comet, so the two are the same effect bent into a circle or laid straight.
//
// Shapes are written in "rim angle": distance along the rim divided by the
// ring's radius, so a straight line ripples and colours exactly like the
// ring does over the same length.

// Tuned in the orb studies: ink & ember, intensity 1, speed 2
export const ORB_SPEED = 2;
const INTENSITY = 1;
const COLORS = [
  [0.996, 0.263, 0.165], // #fe432a
  [0.05, 0.05, 0.05],
  [1.0, 0.6, 0.5],
];
const WEIGHTS = [1.0, 0.35, 0.55];

/** The ring's radius in shader units (the hero's "size 0.48"). */
export const ORB_RADIUS = 0.48;

/**
 * The shader's unit in CSS px at this screen width: the hero ring's
 * diameter is just under one unit (heroOrb.css sets the same clamp).
 */
export const orbUnit = () => Math.min(860, Math.max(340, window.innerWidth * 0.53));

// the site's fast-then-soft-stop
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);

const VERTEX = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * GLSL every orb shader starts with. Given a point's distance across the rim
 * (d), its rim angle (a) and the time (t):
 *   rimWidth / ripple   the rim's swelling thickness and its wobble
 *   arcs                the three coloured arcs drifting along it
 *   comet               the red stroke: soft nose, tapering tail
 *   shade               mixes them into the final colour
 */
const COMMON = `
  precision highp float;
  uniform float u_time; uniform float u_int;
  uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3; uniform vec3 u_w;
  const float TAU = 6.2831853;

  // a soft lobe round the rim, centred on angle c
  float lobe(float a, float c, float k){ return pow(0.5 + 0.5 * cos(a - c), k); }
  float band(float d, float w){ float x = d / w; return exp(-x * x); }

  float rimWidth(float a, float t){ return 0.013 + 0.012 * (0.5 + 0.5 * sin(2.0 * a - t * 0.5)); }
  float ripple(float a, float t){
    return 0.0045 * sin(3.0 * a + t * 0.7) + 0.0035 * sin(5.0 * a - t * 1.1) + 0.002 * sin(8.0 * a + t * 1.7);
  }
  // where the red arc sits at time t
  float redAt(float t){ return t * 0.35 + 2.2; }

  // each colour sits a touch off the rim's centre line, like light on a bubble
  vec3 arcs(float d, float w, float a, float t){
    return vec3(
      band(d - 0.007, w) * lobe(a, redAt(t), 6.0) * u_w.x,
      band(d, w)         * lobe(a, -t * 0.27, 5.0) * u_w.y,
      band(d + 0.007, w) * lobe(a, t * 0.21 - 2.0, 4.0) * u_w.z
    );
  }

  // behind: how far back from the nose (rim angle); len: the tail's length
  float comet(float d, float w, float behind, float len){
    float nose = smoothstep(-0.10, 0.06, behind);
    float tail = 1.0 - smoothstep(len * 0.25, len, behind);
    float glow = mix(0.35, 1.0, 1.0 - clamp(behind / len, 0.0, 1.0));
    return nose * tail * glow * band(d - 0.007, w * 1.1);
  }

  // g: the arcs, stroke: the comet (drawn in red), rim: the faint grey rim
  vec4 shade(vec3 g, float stroke, float rim){
    float sum = g.x + g.y + g.z + stroke;
    vec3 col = (u_c1 * (g.x + stroke) + u_c2 * g.y + u_c3 * g.z) / max(sum, 1e-4);
    float alpha = clamp(sum, 0.0, 1.0) * u_int;
    return vec4(col * alpha, alpha + rim * (1.0 - alpha));
  }
`;

export interface OrbShader {
  set: (name: string, ...values: number[]) => void;
  /** sizes the canvas to its box (capped for very tall ones) and clears it */
  fit: () => { width: number; height: number; dpr: number };
  draw: () => void;
  dispose: () => void;
}

/**
 * Compiles an orb shader on the canvas. `main` is the shape's own GLSL
 * main(), which can use everything in COMMON. Returns null without WebGL.
 */
export function createOrbShader(canvas: HTMLCanvasElement, main: string): OrbShader | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  const shaders = [compile(gl.VERTEX_SHADER, VERTEX), compile(gl.FRAGMENT_SHADER, COMMON + main)];
  shaders.forEach((shader) => gl.attachShader(program, shader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // one triangle that covers the whole canvas
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const locations = new Map<string, WebGLUniformLocation | null>();
  const set = (name: string, ...values: number[]) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    const at = locations.get(name)!;
    if (values.length === 1) gl.uniform1f(at, values[0]);
    else if (values.length === 2) gl.uniform2f(at, values[0], values[1]);
    else gl.uniform3f(at, values[0], values[1], values[2]);
  };
  set('u_int', INTENSITY);
  set('u_c1', ...COLORS[0]);
  set('u_c2', ...COLORS[1]);
  set('u_c3', ...COLORS[2]);
  set('u_w', ...WEIGHTS);

  return {
    set,
    fit: () => {
      // tall canvases (the process line) stay under 4096px, which every GPU can hold
      const longest = Math.max(canvas.clientWidth, canvas.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 4096 / longest);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { width, height, dpr };
    },
    draw: () => gl.drawArrays(gl.TRIANGLES, 0, 3),
    // frees what this made, but keeps the context: React can set the canvas
    // up again (StrictMode does on every mount), and a lost context never draws
    dispose: () => {
      gl.deleteBuffer(buffer);
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}

/**
 * Runs `frame` every animation frame while the canvas is on screen and the
 * tab is visible; it gets the seconds since the last frame and returns
 * whether it wants another. Call `wake` to restart a loop that stopped.
 */
export function runWhileVisible(canvas: HTMLCanvasElement, frame: (dt: number) => boolean) {
  let id = 0;
  let last = 0;
  let onScreen = true;
  let stopped = false;
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    id = frame(dt) && onScreen && !document.hidden ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (stopped || id || !onScreen || document.hidden) return;
    last = performance.now();
    id = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    wake();
  });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', wake);
  return {
    wake,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(id);
      observer.disconnect();
      document.removeEventListener('visibilitychange', wake);
    },
  };
}
