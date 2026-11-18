// Engine X-ray — concept explainer for the 1200 cc liquid-cooled T120 twin.
// Geometry is hand-built and ILLUSTRATIVE (not Triumph CAD, not to scale). All part text and
// sources come from data/engine-xray.json; this file holds only shapes, positions and motion.
import * as THREE from './assets/vendor/three/three.module.min.js';
import { OrbitControls } from './assets/vendor/three/OrbitControls.js';
import { RoomEnvironment } from './assets/vendor/three/RoomEnvironment.js';
import { RoundedBoxGeometry } from './assets/vendor/three/RoundedBoxGeometry.js';
import { CSS2DRenderer, CSS2DObject } from './assets/vendor/three/CSS2DRenderer.js';

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const api = window.__engineXray = { ready:false, error:null };

/* ---------- state (per-tab convenience only) ---------- */
const KEY = 't120-engine-xray';
const state = { mode:'xray', opacity:0.25, explode:0, run:!reduced, speed:1, labels:innerWidth < 700 ? 'internal' : 'all', isolate:false, sel:null };
try { Object.assign(state, JSON.parse(sessionStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

/* ---------- layout (illustrative) ---------- */
// Build coordinates: +x = rider's right, +y = up, +z = forward, metres. The engine group is mirrored
// in x so these read naturally. Anchors are label points; explode vectors are offsets at 100 %.
const LAYOUT = {
  crank:      { anchor:[0.205,0,0],        dir:'right', explode:[0,0,0] },
  rods:       { anchor:[-0.06,0.06,0.03],  dir:'left',  explode:[0,0.05,0] },
  pistons:    { anchor:[0.108,0.17,0],     dir:'right', explode:[0,0.12,0] },
  balancers:  { anchor:[0.16,-0.03,0.115], dir:'right', explode:[0,-0.02,0.12] },
  block:      { anchor:[-0.15,0.14,0.07],  dir:'left',  explode:[0,0.08,0] },
  head:       { anchor:[-0.16,0.245,0.06], dir:'left',  explode:[0,0.16,0] },
  camcover:   { anchor:[0.13,0.305,0.02],  dir:'up',    explode:[0,0.26,0] },
  cam:        { anchor:[-0.11,0.278,-0.01],dir:'up',    explode:[0,0.22,0] },
  chain:      { anchor:[0.145,0.14,-0.035],dir:'right', explode:[0.06,0.1,0] },
  valves:     { anchor:[0.085,0.25,-0.04], dir:'up',    explode:[0,0.17,0] },
  plugs:      { anchor:[-0.06,0.31,0.06],  dir:'up',    explode:[0,0.32,0.04] },
  gearbox:    { anchor:[-0.05,-0.075,-0.17], dir:'down', explode:[0,-0.06,-0.12] },
  clutch:     { anchor:[0.236,-0.04,-0.13],dir:'down',  explode:[0.16,0,0] },
  alt:        { anchor:[-0.22,-0.075,0],   dir:'down',  explode:[-0.12,0,0] },
  sprocket:   { anchor:[-0.215,-0.1,-0.17],dir:'down',  explode:[-0.16,-0.02,0] },
  crankcase:  { anchor:[0.1,0,0.165],      dir:'right', explode:[0,0,0] },
  clutchcover:{ anchor:[0.25,0.11,-0.13],  dir:'right', explode:[0.3,0,0] },
  altcover:   { anchor:[-0.25,0.07,0],     dir:'up',    explode:[-0.24,0,0] },
  sump:       { anchor:[0.05,-0.155,-0.03],dir:'down',  explode:[0,-0.12,0] },
  tb:         { anchor:[0.07,0.265,-0.18], dir:'up',    explode:[0,0.04,-0.16] },
  exhaust:    { anchor:[0.13,0.02,0.225],  dir:'right', explode:[0,-0.1,0.12] },
  radiator:   { anchor:[-0.1,0.315,0.275], dir:'up',    explode:[0,0.05,0.3] },
};
const SOLID = { block:0x3e4248, head:0x3e4248, crankcase:0x3e4248, sump:0x3e4248, camcover:0xc9ced4, clutchcover:0xc9ced4, altcover:0xc9ced4 };

const R = 0.040, L = 0.130;           // crank throw and rod length: animation placeholders, not measurements
const CX = [-0.06, 0.06];             // cylinder 1 / cylinder 2 (pitch illustrative)
const ALPHA = [0, 3 * Math.PI / 2];   // crankpins 270° apart (Triumph: 270° firing interval)
const IN = { y:0.02, z:-0.13 }, OUT = { y:-0.05, z:-0.17 };
const PRIMARY = 0.04 / 0.09;

/* ---------- helpers ---------- */
const std = (color, metalness, roughness) => () => new THREE.MeshStandardMaterial({ color, metalness, roughness });
const MAT = {
  steel: std(0xb9c0c8, 0.9, 0.3), alu: std(0xdde1e6, 0.75, 0.35), dark: std(0x33373d, 0.6, 0.5),
  chrome: std(0xf4f6f8, 1.0, 0.1), brass: std(0xcfa95f, 0.85, 0.32), hot: std(0xb27b5b, 0.85, 0.38),
  blue: std(0x8a9db3, 0.75, 0.38), friction: std(0x7a5236, 0.1, 0.85), ceramic: std(0xf3efe6, 0, 0.35),
  rubber: std(0x1d1e21, 0, 0.8), copper: std(0xc4743f, 0.9, 0.32), black: std(0x202327, 0.4, 0.55),
};
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
function cylX(r, x0, x1, seg = 32, open = false) { const g = new THREE.CylinderGeometry(r, r, x1 - x0, seg, 1, open); g.rotateZ(Math.PI / 2); g.translate((x0 + x1) / 2, 0, 0); return g; }
function cylZ(r1, r2, len, seg = 32) { const g = new THREE.CylinderGeometry(r1, r2, len, seg); g.rotateX(Math.PI / 2); return g; }
function halfDiscX(r, w) { const g = new THREE.CylinderGeometry(r, r, w, 32, 1, false, Math.PI, Math.PI); g.rotateZ(Math.PI / 2); return g; }
function gearGeo(r, teeth, w, hole = 0) {
  const s = new THREE.Shape(), t = Math.min(0.005, r * 0.12), n = teeth * 4;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, k = i % 4, rr = (k === 1 || k === 2) ? r + t / 2 : r - t / 2; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  if (hole) { const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth:w, bevelEnabled:false, curveSegments:6 });
  g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); return g;
}
const pivot = (parent, y, z, x = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const tube = (pts, r, m, seg = 80, closed = false) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), seg, r, 12, closed), m);

/* ---------- builders: one per part id in data/engine-xray.json ---------- */
const BUILD = {
  crank(rig, p) {
    const st = MAT.steel();
    rig.add(mesh(cylX(0.018, -0.245, 0.205), st));
    CX.forEach((cx, i) => {
      const th = new THREE.Group(); th.rotation.x = ALPHA[i]; rig.add(th);
      th.add(mesh(cylX(0.019, cx - 0.026, cx + 0.026), st, 0, R, 0));
      [-1, 1].forEach(s => { const wx = cx + s * 0.033;
        th.add(mesh(new THREE.BoxGeometry(0.014, 0.075, 0.05), st, wx, 0.012, 0));
        th.add(mesh(halfDiscX(0.06, 0.014), st, wx, 0, 0)); });
    });
    rig.add(mesh(gearGeo(0.04, 28, 0.018, 0.018), st, 0.18, 0, 0));
    rig.add(mesh(gearGeo(0.02, 18, 0.008), st, 0.14, 0, 0));
    p.update = k => { rig.rotation.x = k.phi; };
  },
  rods(rig, p) {
    const m = MAT.steel();
    p.rods = CX.map(cx => { const g = new THREE.Group(); g.position.x = cx;
      g.add(mesh(cylX(0.029, -0.012, 0.012), m));
      g.add(mesh(new THREE.BoxGeometry(0.016, L - 0.03, 0.022), m, 0, L / 2, 0));
      g.add(mesh(cylX(0.015, -0.011, 0.011), m, 0, L, 0));
      rig.add(g); return g; });
    p.update = k => CX.forEach((cx, i) => { const a = k.phi + ALPHA[i], py = R * Math.cos(a), pz = R * Math.sin(a), ppy = py + Math.sqrt(L * L - pz * pz);
      p.rods[i].position.set(cx, py, pz); p.rods[i].rotation.x = Math.atan2(-pz, ppy - py); });
  },
  pistons(rig, p) {
    const a = MAT.alu(), s = MAT.dark(), st = MAT.steel();
    p.pis = CX.map(cx => { const g = new THREE.Group(); g.position.x = cx;
      const b = new THREE.CylinderGeometry(0.0485, 0.0485, 0.055, 40); b.translate(0, 0.0075, 0); g.add(mesh(b, a));
      [0.027, 0.021, 0.015].forEach(y => { const r = new THREE.TorusGeometry(0.0487, 0.0011, 6, 48); r.rotateX(Math.PI / 2); g.add(mesh(r, s, 0, y, 0)); });
      g.add(mesh(cylX(0.011, -0.036, 0.036), st));
      rig.add(g); return g; });
    p.update = k => CX.forEach((cx, i) => { const a = k.phi + ALPHA[i], pz = R * Math.sin(a); p.pis[i].position.y = R * Math.cos(a) + Math.sqrt(L * L - pz * pz); });
  },
  balancers(rig, p) {
    const m = MAT.steel();
    const front = pivot(rig, -0.03, 0.115); front.add(mesh(cylX(0.012, -0.17, 0.17), m));
    [-0.15, 0.15].forEach(x => front.add(mesh(halfDiscX(0.04, 0.022), m, x, 0, 0)));
    const rear = pivot(rig, 0.072, -0.088); rear.add(mesh(cylX(0.011, -0.17, 0.17), m));
    [-0.15, 0.15].forEach(x => rear.add(mesh(halfDiscX(0.03, 0.02), m, x, 0, 0)));
    p.update = k => { front.rotation.x = -k.phi; rear.rotation.x = -k.phi + Math.PI; };
  },
  block(rig, p) {
    const m = p.solidMat;
    rig.add(mesh(new RoundedBoxGeometry(0.29, 0.115, 0.15, 3, 0.012), m, 0.01, 0.1475, 0));
    for (let k = 0; k < 5; k++) rig.add(mesh(new THREE.BoxGeometry(0.31, 0.004, 0.176), m, 0.01, 0.103 + k * 0.022, 0));
    CX.forEach(cx => rig.add(mesh(new THREE.CylinderGeometry(0.0495, 0.0495, 0.125, 40, 1, true), m, cx, 0.1425, 0)));
  },
  head(rig, p) {
    const m = p.solidMat;
    rig.add(mesh(new RoundedBoxGeometry(0.30, 0.06, 0.17, 3, 0.01), m, 0.01, 0.235, 0));
    [0.214, 0.234, 0.254].forEach(y => rig.add(mesh(new THREE.BoxGeometry(0.32, 0.004, 0.19), m, 0.01, y, 0)));
    CX.forEach(cx => { const a = cylZ(0.022, 0.022, 0.04); a.translate(cx, 0.235, -0.1); rig.add(mesh(a, m));
                       const b = cylZ(0.021, 0.021, 0.035); b.translate(cx, 0.235, 0.098); rig.add(mesh(b, m)); });
  },
  camcover(rig, p) { rig.add(mesh(new RoundedBoxGeometry(0.28, 0.042, 0.1, 4, 0.016), p.solidMat, 0.01, 0.286, 0)); },
  cam(rig, p) {
    const c = pivot(rig, 0.275, 0), m = MAT.brass();
    c.add(mesh(cylX(0.011, -0.13, 0.15), m));
    c.add(mesh(gearGeo(0.037, 36, 0.008, 0.01), MAT.steel(), 0.14, 0, 0));
    CX.forEach((cx, i) => [-0.03, -0.01, 0.01, 0.03].forEach((dx, j) => {
      const lg = new THREE.Group(); lg.position.x = cx + dx; lg.rotation.x = (j % 2 ? 1.9 : 0.4) + ALPHA[i] / 2; c.add(lg);
      const g = new THREE.CylinderGeometry(0.014, 0.014, 0.008, 24); g.rotateZ(Math.PI / 2); g.scale(1, 1.35, 1); g.translate(0, 0.004, 0);
      lg.add(mesh(g, m)); }));
    p.update = k => { c.rotation.x = k.phi / 2; };
  },
  chain(rig) {
    const pts = [], x = 0.14, rc = 0.039, rk = 0.023, yc = 0.275;
    for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; pts.push([x, yc + rc * Math.sin(a), rc * Math.cos(a)]); }
    for (let i = 1; i < 6; i++) { const t = i / 6; pts.push([x, yc * (1 - t), -rc + (rc - rk) * t]); }
    for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([x, rk * Math.sin(a), rk * Math.cos(a)]); }
    for (let i = 1; i < 6; i++) { const t = i / 6; pts.push([x, yc * t, rk + (rc - rk) * t]); }
    rig.add(tube(pts, 0.0035, MAT.dark(), 260, true));
    rig.add(mesh(new THREE.BoxGeometry(0.008, 0.16, 0.006), MAT.black(), 0.14, 0.14, -0.045));
  },
  valves(rig, p) {
    p.v = []; const mi = MAT.brass(), me = MAT.hot(), sp = MAT.steel();
    const helix = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 10; helix.push(new THREE.Vector3(Math.cos(a) * 0.0075, 0.028 + i / 60 * 0.026, Math.sin(a) * 0.0075)); }
    const springG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 120, 0.0009, 5);
    CX.forEach((cx, i) => [-1, 1].forEach(sx => [['in', -1], ['ex', 1]].forEach(([kind, sz]) => {
      const tilt = new THREE.Group(); tilt.position.set(cx + sx * 0.022, 0.212, sz * 0.022); tilt.rotation.x = sz * 0.22; rig.add(tilt);
      const v = new THREE.Group(); tilt.add(v); const m = kind === 'in' ? mi : me;
      v.add(mesh(new THREE.CylinderGeometry(0.0155, 0.012, 0.004, 28), m, 0, 0.002, 0));
      v.add(mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.058, 10), m, 0, 0.031, 0));
      v.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.003, 18), sp, 0, 0.056, 0));
      tilt.add(new THREE.Mesh(springG, sp));
      p.v.push({ g:v, cyl:i, kind });
    })));
    p.update = k => { const d = k.phi * 180 / Math.PI; p.v.forEach(o => { const c = (((d + (o.cyl ? 270 : 0)) % 720) + 720) % 720; let l = 0;
      if (o.kind === 'in' && c < 230) l = Math.sin(Math.PI * c / 230); if (o.kind === 'ex' && c > 490) l = Math.sin(Math.PI * (c - 490) / 230);
      o.g.position.y = -0.007 * l; }); };
  },
  plugs(rig) {
    const st = MAT.steel(), ce = MAT.ceramic(), ru = MAT.rubber();
    CX.forEach(cx => { const t = new THREE.Group(); t.position.set(cx, 0.214, 0); t.rotation.x = 0.55; rig.add(t);
      t.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 12), st, 0, 0.01, 0));
      t.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 6), st, 0, 0.025, 0));
      t.add(mesh(new THREE.CylinderGeometry(0.0055, 0.006, 0.03, 16), ce, 0, 0.045, 0));
      t.add(mesh(new THREE.CylinderGeometry(0.012, 0.011, 0.05, 16), ru, 0, 0.088, 0)); });
  },
  gearbox(rig, p) {
    const pairs = [[0.025,0.055],[0.029,0.051],[0.033,0.047],[0.037,0.043],[0.040,0.040],[0.043,0.037]];
    const inS = pivot(rig, IN.y, IN.z), m = MAT.blue(), st = MAT.steel();
    inS.add(mesh(cylX(0.011, -0.15, 0.235), st));
    const outS = pivot(rig, OUT.y, OUT.z); outS.add(mesh(cylX(0.013, -0.225, 0.12), st));
    p.og = [];
    pairs.forEach(([ri, ro], k) => { const x = -0.115 + k * 0.036;
      inS.add(mesh(gearGeo(ri, Math.round(ri * 900), 0.014, 0.011), m, x, 0, 0));
      const og = pivot(rig, OUT.y, OUT.z, x); og.add(mesh(gearGeo(ro, Math.round(ro * 900), 0.014, 0.013), m)); p.og.push({ g:og, ratio:ri / ro }); });
    p.update = k => { inS.rotation.x = k.aIn; outS.rotation.x = k.aOut; p.og.forEach(o => { o.g.rotation.x = -k.aIn * o.ratio; }); };
  },
  clutch(rig, p) {
    const c = pivot(rig, IN.y, IN.z), st = MAT.steel(), fr = MAT.friction(), al = MAT.alu();
    c.add(mesh(gearGeo(0.09, 64, 0.016, 0.05), st, 0.18, 0, 0));
    c.add(mesh(cylX(0.088, 0.19, 0.236, 48, true), MAT.dark()));
    for (let j = 0; j < 9; j++) c.add(mesh(cylX(j % 2 ? 0.078 : 0.074, 0.196 + j * 0.0045, 0.199 + j * 0.0045, 40), j % 2 ? st : fr));
    c.add(mesh(cylX(0.07, 0.236, 0.242, 40), al));
    for (let s = 0; s < 5; s++) { const a = s / 5 * Math.PI * 2; c.add(mesh(cylX(0.006, 0.242, 0.252, 10), st, 0, Math.cos(a) * 0.04, Math.sin(a) * 0.04)); }
    p.update = k => { c.rotation.x = k.aIn; };
  },
  alt(rig, p) {
    const r = pivot(rig, 0, 0), d = MAT.dark(), cu = MAT.copper();
    r.add(mesh(cylX(0.068, -0.236, -0.205, 40, true), d)); r.add(mesh(cylX(0.068, -0.24, -0.236, 40), d));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const b = mesh(new THREE.BoxGeometry(0.024, 0.016, 0.012), cu, -0.22, Math.cos(a) * 0.05, Math.sin(a) * 0.05); b.rotation.x = -a; rig.add(b); }
    p.update = k => { r.rotation.x = k.phi; };
  },
  sprocket(rig, p) {
    const s = pivot(rig, OUT.y, OUT.z); s.add(mesh(gearGeo(0.045, 17, 0.008, 0.012), MAT.black(), -0.212, 0, 0));
    p.update = k => { s.rotation.x = k.aOut; };
  },
  crankcase(rig, p) { rig.add(mesh(new RoundedBoxGeometry(0.38, 0.21, 0.40, 4, 0.03), p.solidMat, 0, -0.005, -0.035)); },
  clutchcover(rig, p) { rig.add(mesh(cylX(0.105, 0.17, 0.25, 48), p.solidMat, 0, IN.y, IN.z)); },
  altcover(rig, p) { rig.add(mesh(cylX(0.085, -0.25, -0.19, 48), p.solidMat)); },
  sump(rig, p) { rig.add(mesh(new RoundedBoxGeometry(0.3, 0.05, 0.24, 3, 0.012), p.solidMat, 0, -0.13, -0.03)); },
  tb(rig) {
    const al = MAT.alu(), bl = MAT.black(), ru = MAT.rubber(), st = MAT.steel();
    CX.forEach(cx => { const s = Math.sign(cx);
      const r = cylZ(0.02, 0.02, 0.04); r.translate(cx, 0.232, -0.135); rig.add(mesh(r, ru));
      const b = cylZ(0.03, 0.03, 0.07); b.translate(cx, 0.228, -0.185); rig.add(mesh(b, al));
      rig.add(mesh(new RoundedBoxGeometry(0.05, 0.032, 0.045, 3, 0.008), al, cx, 0.19, -0.185));
      const inj = new THREE.CylinderGeometry(0.006, 0.006, 0.03, 12); inj.rotateX(-0.5); inj.translate(cx, 0.262, -0.16); rig.add(mesh(inj, bl));
      rig.add(mesh(new THREE.BoxGeometry(0.012, 0.03, 0.03), bl, cx + s * 0.036, 0.228, -0.185));
      const t = cylZ(0.028, 0.034, 0.04); t.translate(cx, 0.228, -0.24); rig.add(mesh(t, ru)); });
    rig.add(mesh(cylX(0.004, -0.04, 0.04), st, 0, 0.228, -0.185));
  },
  exhaust(rig) {
    const ch = MAT.chrome();
    CX.forEach(cx => { const s = Math.sign(cx);
      rig.add(tube([[cx,0.235,0.1],[cx,0.225,0.155],[cx+s*0.02,0.15,0.215],[cx+s*0.05,0.02,0.228],[cx+s*0.08,-0.12,0.17],[cx+s*0.1,-0.182,0.05],[cx+s*0.12,-0.19,-0.12],[cx+s*0.13,-0.17,-0.3]], 0.019, ch, 100));
      const m = cylZ(0.04, 0.045, 0.16); m.rotateX(0.08); m.translate(cx + s * 0.132, -0.164, -0.38); rig.add(mesh(m, ch)); });
  },
  radiator(rig) {
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 128; const g = cv.getContext('2d');
    g.fillStyle = '#3a3f47'; g.fillRect(0, 0, 16, 128); g.fillStyle = '#20242a'; for (let y = 0; y < 128; y += 4) g.fillRect(0, y, 16, 2);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(16, 2);
    rig.add(mesh(new THREE.BoxGeometry(0.26, 0.22, 0.022), new THREE.MeshStandardMaterial({ map:tex, metalness:0.6, roughness:0.5 }), 0, 0.2, 0.275));
    const bl = MAT.black(); [-0.14, 0.14].forEach(x => rig.add(mesh(new THREE.BoxGeometry(0.02, 0.23, 0.03), bl, x, 0.2, 0.275)));
    rig.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 16), MAT.steel(), 0.14, 0.322, 0.275));
    const ru = MAT.rubber();
    rig.add(tube([[0.13,0.28,0.265],[0.12,0.3,0.2],[0.09,0.275,0.13],[0.08,0.25,0.085]], 0.011, ru, 40));
    rig.add(tube([[-0.13,0.12,0.265],[-0.13,0.06,0.23],[-0.11,0,0.19],[-0.08,-0.02,0.155]], 0.011, ru, 40));
  },
};

/* ---------- theme-aware x-ray colour ---------- */
const xrayHex = () => document.documentElement.getAttribute('data-theme') === 'light' ? 0x2c5f8f : 0x9cc4e8;
function xrayMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor:{ value:new THREE.Color(xrayHex()) }, uOpacity:{ value:0.25 }, uHi:{ value:0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; uniform float uHi; varying vec3 vN; varying vec3 vV;' +
      'void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0); vec3 hi = vec3(0.81,0.66,0.37);' +
      'vec3 c = mix(mix(uColor, vec3(1.0), f*0.3), hi, uHi*0.6); float a = clamp(uOpacity*0.28 + f*uOpacity*1.5 + uHi*0.12, 0.0, 0.97); gl_FragColor = vec4(c, a); }',
    transparent:true, depthWrite:false, side:THREE.DoubleSide,
  });
}

/* ---------- boot ---------- */
const stage = $('xrStage');
function fail(msg) { const f = $('xrFallback'); f.hidden = false; f.textContent = msg; api.error = msg; }

let data;
try {
  const r = await fetch('./data/engine-xray.json', { cache:'no-cache' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  data = await r.json();
  if (!Array.isArray(data.parts)) throw new Error('bad data');
} catch (e) { fail('The part data could not be loaded, so the explainer cannot start. Try reloading the page.'); throw e; }

renderFacts();

let renderer = null;
try { renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true }); if (!renderer.getContext()) throw new Error('no context'); }
catch (e) { renderer = null; fail('WebGL is not available in this browser, so the 3D view cannot render. The parts list and the sourced text still work.'); }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 20);
const TARGET = new THREE.Vector3(0, 0.04, -0.07);
let controls = null, labelRenderer = null;
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(renderer.domElement);
  labelRenderer = new CSS2DRenderer(); labelRenderer.domElement.className = 'xr-labels'; stage.appendChild(labelRenderer.domElement);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minDistance = 0.3; controls.maxDistance = 3; controls.target.copy(TARGET);
}
const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-1, 2, 1.5); scene.add(key);
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x1a1d22, 0.5));
const grid = new THREE.GridHelper(2.4, 48, 0x6c7884, 0x6c7884); grid.position.y = -0.225; grid.material.transparent = true; grid.material.opacity = 0.18; scene.add(grid);
const engine = new THREE.Group(); engine.scale.x = -1; scene.add(engine);

const parts = [], byId = {};
for (const d of data.parts) {
  const lay = LAYOUT[d.id], build = BUILD[d.id];
  if (!lay || !build) { console.warn('engine-xray: no geometry for', d.id); continue; }
  const root = new THREE.Group(); engine.add(root);
  const rig = new THREE.Group(); root.add(rig);
  const p = { ...d, ...lay, root, rig, meshes:[], mats:new Set(), edges:[], visible:true };
  if (d.shell) {
    p.solidMat = new THREE.MeshStandardMaterial({ color:SOLID[d.id] ?? 0x9aa2ab, metalness:0.7, roughness:0.42 });
    p.xrayMat = xrayMaterial();
    p.edgeMat = new THREE.LineBasicMaterial({ color:xrayHex(), transparent:true, opacity:0.35, depthWrite:false });
  }
  build(rig, p);
  rig.traverse(o => { if (o.isMesh) { o.userData.partId = d.id; p.meshes.push(o); if (!d.shell) p.mats.add(o.material); } });
  if (d.shell) p.meshes.forEach(o => { o.renderOrder = 2; const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 32), p.edgeMat); l.renderOrder = 3; o.add(l); p.edges.push(l); });
  const b = el('button', 'xr-lbl ' + p.dir + (d.shell ? ' shell' : '')); b.type = 'button';
  b.append(el('span', 't', d.label)); b.setAttribute('aria-label', 'Select ' + d.label);
  b.addEventListener('click', e => { e.stopPropagation(); select(d.id); });
  const lo = new CSS2DObject(b); lo.position.fromArray(p.anchor);
  const C = { up:[0.5,1], down:[0.5,0], left:[1,0.5], right:[0,0.5] }[p.dir]; lo.center.set(C[0], C[1]);
  root.add(lo); p.labelObj = lo; p.labelEl = b;
  parts.push(p); byId[d.id] = p;
}

new MutationObserver(() => { const c = xrayHex(); parts.forEach(p => { if (p.shell) { p.xrayMat.uniforms.uColor.value.setHex(c); p.edgeMat.color.setHex(c); } }); })
  .observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });

/* ---------- facts strip & parts list ---------- */
function citeText(c) { const s = data.sources[c.source]; if (!s) return ''; return s.short + (c.pages ? ', p. ' + c.pages : '') + (c.note ? ' (' + c.note + ')' : ''); }
function renderFacts() {
  const box = $('xrFacts'); box.textContent = '';
  for (const f of data.facts || []) { const s = data.sources[f.source]; const d = el('div', 'xr-fact');
    d.append(el('small', null, f.label), el('b', null, f.value)); d.title = 'Source: ' + (s ? s.title : f.source); box.append(d); }
  const src = data.sources.media;
  if (src && src.url) { const a = el('a', 'xr-fact-src', 'Source: ' + src.short + ' ↗'); a.href = src.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; box.append(a); }
}
const SYS_ORDER = ['Top end', 'Bottom end', 'Transmission', 'Intake & exhaust', 'Cooling', 'Ancillaries', 'Castings & covers'];
function buildList(filter = '') {
  const list = $('xrList'); list.textContent = ''; const f = filter.trim().toLowerCase();
  for (const sys of SYS_ORDER) {
    const items = parts.filter(p => p.sys === sys && (!f || p.label.toLowerCase().includes(f) || sys.toLowerCase().includes(f)));
    if (!items.length) continue;
    list.append(el('div', 'xr-grp', sys));
    for (const p of items) {
      const row = el('div', 'xr-row'); row.dataset.id = p.id; row.setAttribute('aria-current', String(state.sel === p.id));
      const nm = el('button', 'nm', p.label); nm.type = 'button';
      nm.addEventListener('click', () => { select(p.id); $('xrTree').classList.remove('open'); $('xrTreeToggle').setAttribute('aria-expanded', 'false'); });
      const eye = el('button', 'eye', p.visible ? 'hide' : 'show'); eye.type = 'button';
      eye.setAttribute('aria-pressed', String(!p.visible)); eye.setAttribute('aria-label', (p.visible ? 'Hide ' : 'Show ') + p.label);
      eye.addEventListener('click', () => { p.visible = !p.visible; applyVisibility(); buildList($('xrSearch').value); });
      row.append(nm, eye); list.append(row);
    }
  }
}
$('xrSearch').addEventListener('input', e => buildList(e.target.value));
$('xrTreeToggle').addEventListener('click', () => { const o = $('xrTree').classList.toggle('open'); $('xrTreeToggle').setAttribute('aria-expanded', String(o)); });

/* ---------- inspector ---------- */
function renderInspector() {
  const box = $('xrInspBody'), insp = $('xrInsp'); box.textContent = '';
  const p = byId[state.sel];
  if (!p) {
    insp.classList.add('empty');
    box.append(el('h2', null, 'Inspect a part'),
      el('p', null, 'Click a part or a label, or pick one from the list. In X-ray mode a click goes through the glass casings to the moving parts inside.'),
      el('p', 'xr-hint', 'Keys: X x-ray/solid · Space run/pause · L labels · I isolate · 1–5 views · R reset · Esc deselect'));
    if (innerWidth > 900) insp.classList.remove('empty');
    return;
  }
  insp.classList.remove('empty');
  box.append(el('h2', null, p.label), el('div', 'xr-sys', p.sys + (p.shell ? ' · casing (glass in X-ray)' : ' · moving / internal')), el('p', null, p.text));
  const ul = el('ul', 'xr-cites');
  for (const c of p.cite || []) { const s = data.sources[c.source]; const li = el('li');
    if (s && s.url) { const a = el('a', null, citeText(c) + ' ↗'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); }
    else li.textContent = citeText(c);
    ul.append(li); }
  box.append(el('div', 'xr-sub', 'Sources'), ul, el('p', 'xr-note', 'Shape and position: illustrative, not Triumph CAD. No torque, tool size or part number on this page.'));
  const br = el('div', 'xr-btnrow');
  const fb = el('button', 'xr-btn', 'Focus'); fb.type = 'button'; fb.addEventListener('click', () => focusPart(p));
  const ib = el('button', 'xr-btn', state.isolate ? 'Show all' : 'Isolate'); ib.type = 'button'; ib.addEventListener('click', () => setIsolate(!state.isolate));
  const xb = el('button', 'xr-btn', 'Deselect'); xb.type = 'button'; xb.addEventListener('click', () => select(null));
  br.append(fb, ib, xb); box.append(br);
}

/* ---------- actions ---------- */
function highlight(p, on) {
  if (p.shell) { p.xrayMat.uniforms.uHi.value = on ? 1 : 0; p.solidMat.emissive.setHex(on ? 0x4a3410 : 0); }
  else p.mats.forEach(m => { m.emissive.setHex(on ? 0xcfa95f : 0); m.emissiveIntensity = on ? 0.45 : 0; });
  p.labelEl.classList.toggle('on', on);
}
function select(id) {
  state.sel = id && byId[id] ? id : null;
  parts.forEach(p => highlight(p, p.id === state.sel));
  document.querySelectorAll('#xrList .xr-row').forEach(r => r.setAttribute('aria-current', String(r.dataset.id === state.sel)));
  if (state.isolate) applyVisibility();
  renderInspector(); applyLabels(); save();
  $('xrStatus').textContent = state.sel ? 'Selected ' + byId[state.sel].label : 'Selection cleared';
}
function applyVisibility() { parts.forEach(p => { p.root.visible = state.isolate && state.sel ? p.id === state.sel : p.visible; }); applyLabels(); }
function setIsolate(v) { state.isolate = !!(v && state.sel); $('xrIso').setAttribute('aria-pressed', String(state.isolate)); applyVisibility(); renderInspector(); save(); }
function applyMode() {
  const x = state.mode === 'xray';
  parts.forEach(p => { if (!p.shell) return;
    p.meshes.forEach(o => { o.material = x ? p.xrayMat : p.solidMat; });
    p.edges.forEach(l => { l.visible = x; });
    p.xrayMat.uniforms.uOpacity.value = state.opacity; p.edgeMat.opacity = 0.12 + state.opacity * 0.55; });
  $('xrModeX').setAttribute('aria-pressed', String(x)); $('xrModeS').setAttribute('aria-pressed', String(!x));
  $('xrOp').disabled = !x; $('xrOp').value = state.opacity; $('xrOpV').textContent = state.opacity.toFixed(2); save();
}
function applyExplode() {
  parts.forEach(p => { p.root.position.set(...p.explode).multiplyScalar(state.explode); });  // from base every time: reversible
  $('xrEx').value = Math.round(state.explode * 100); $('xrExV').textContent = Math.round(state.explode * 100) + '%'; save();
}
const LBL = ['all', 'internal', 'off'], LBL_TXT = { all:'Labels: All', internal:'Labels: Internals', off:'Labels: Off' };
function applyLabels() {
  parts.forEach(p => { const show = p.root.visible && (p.id === state.sel || state.labels === 'all' || (state.labels === 'internal' && !p.shell));
    p.labelObj.visible = show; p.labelEl.style.display = show ? '' : 'none'; });
  $('xrLbls').textContent = LBL_TXT[state.labels] || LBL_TXT.all;
}
function setRun(v) { state.run = v; $('xrRun').setAttribute('aria-pressed', String(v)); $('xrRun').textContent = v ? 'Pause' : 'Run'; save(); }

/* ---------- camera ---------- */
const VIEWS = { q34:[-1.3,0.52,0.42], left:[1.45,0.14,-0.07], right:[-1.45,0.14,-0.07], front:[0,0.2,1.45], top:[0,1.6,-0.05] };
let tween = null;
function fit(pos, tgt) { const v = new THREE.Vector3(...pos); const k = camera.aspect < 1 ? Math.min(2.2, 1.15 / camera.aspect) : 1; return v.sub(tgt).multiplyScalar(k).add(tgt); }
function goTo(pos, tgt, raw = false) {
  if (!controls) return;
  tween = { from:camera.position.clone(), to:raw ? new THREE.Vector3(...pos) : fit(pos, tgt), tf:controls.target.clone(), tt:tgt.clone(), t:0 };
  if (reduced) { camera.position.copy(tween.to); controls.target.copy(tween.tt); tween = null; }
}
function focusPart(p) {
  if (!controls) return;
  const b = new THREE.Box3().setFromObject(p.rig); if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), r = Math.max(0.12, b.getSize(new THREE.Vector3()).length());
  goTo(c.clone().add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(r * 2.2)).toArray(), c, true);
}

/* ---------- wiring ---------- */
$('xrModeX').addEventListener('click', () => { state.mode = 'xray'; applyMode(); });
$('xrModeS').addEventListener('click', () => { state.mode = 'solid'; applyMode(); });
$('xrOp').addEventListener('input', e => { state.opacity = +e.target.value; applyMode(); });
$('xrEx').addEventListener('input', e => { state.explode = +e.target.value / 100; applyExplode(); });
$('xrRun').addEventListener('click', () => setRun(!state.run));
$('xrSp').addEventListener('input', e => { state.speed = +e.target.value; $('xrSpV').textContent = state.speed.toFixed(1) + '×'; save(); });
$('xrLbls').addEventListener('click', () => { state.labels = LBL[(LBL.indexOf(state.labels) + 1) % 3]; applyLabels(); save(); });
$('xrIso').addEventListener('click', () => setIsolate(!state.isolate));
$('xrReset').addEventListener('click', () => { state.explode = 0; applyExplode(); setIsolate(false); select(null); goTo(VIEWS.q34, TARGET); });
document.querySelectorAll('[data-xr-view]').forEach(b => b.addEventListener('click', () => goTo(VIEWS[b.dataset.xrView], TARGET)));
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'x') { state.mode = state.mode === 'xray' ? 'solid' : 'xray'; applyMode(); }
  else if (k === ' ' && !e.target.matches('button,a')) { e.preventDefault(); setRun(!state.run); }
  else if (k === 'l') $('xrLbls').click();
  else if (k === 'i') setIsolate(!state.isolate);
  else if (k === 'r') $('xrReset').click();
  else if (k === 'escape') select(null);
  else if (/^[1-5]$/.test(k)) goTo(VIEWS[['q34','left','right','front','top'][+k - 1]], TARGET);
});
if (renderer) {
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) { down = null; return; } down = null;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(parts.filter(p => p.root.visible).flatMap(p => p.meshes), false);
    const h = state.mode === 'xray' ? (hits.find(x => !byId[x.object.userData.partId].shell) || hits[0]) : hits[0];
    select(h ? h.object.userData.partId : null);
  });
}

/* ---------- size & loop ---------- */
function sizeToViewport() {
  const top = $('xrRoot').getBoundingClientRect().top + scrollY;
  document.documentElement.style.setProperty('--xr-top', Math.max(0, Math.round(top)) + 'px');
  const head = document.querySelector('.xr-head');
  if (head) $('xrRoot').style.setProperty('--xr-head', Math.round(head.offsetTop + head.offsetHeight - 14) + 'px');
}
function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix();
  if (renderer) { renderer.setSize(w, h); labelRenderer.setSize(w, h); } }
sizeToViewport(); addEventListener('resize', sizeToViewport); new ResizeObserver(sizeToViewport).observe(document.querySelector('.xr-head'));
new ResizeObserver(resize).observe(stage); resize();

let phi = 0; const clock = new THREE.Clock(); const readout = $('xrReadout');
const power = c => c >= 360 && c < 540;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (state.run && !document.hidden) phi += dt * state.speed * Math.PI;
  const aIn = -phi * PRIMARY, k = { phi, aIn, aOut:aIn * (0.037 / 0.043) };
  parts.forEach(p => { if (p.update) p.update(k); });
  if (tween) { tween.t = Math.min(1, tween.t + dt * 2.2); const e = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.from, tween.to, e); controls.target.lerpVectors(tween.tf, tween.tt, e); if (tween.t >= 1) tween = null; }
  controls.update();
  const d = phi * 180 / Math.PI, c1 = ((d % 720) + 720) % 720, c2 = (((d + 270) % 720) + 720) % 720;
  readout.textContent = 'Crank ' + String(Math.round(c1 % 360)).padStart(3, '0') + '° · Power stroke: cyl 1 ' + (power(c1) ? '●' : '○') + '  cyl 2 ' + (power(c2) ? '●' : '○');
  renderer.render(scene, camera); labelRenderer.render(scene, camera);
}

buildList(); applyMode(); applyExplode(); setRun(state.run); applyVisibility();
$('xrSp').value = state.speed; $('xrSpV').textContent = state.speed.toFixed(1) + '×';
$('xrIso').setAttribute('aria-pressed', String(state.isolate));
select(state.sel);
if (renderer) { camera.position.copy(fit(VIEWS.q34, TARGET)); controls.update(); renderer.setAnimationLoop(frame); }
document.addEventListener('visibilitychange', () => clock.getDelta());
Object.assign(api, { ready:true, partCount:parts.length, dataCount:data.parts.length, select, state, webgl:!!renderer,
  partRootPosition:id => byId[id] ? byId[id].root.position.toArray() : null });
