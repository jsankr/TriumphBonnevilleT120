// Engine X-ray concept page: data provenance, no service figures, local-only scripts, geometry for every part.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const data = JSON.parse(read('data/engine-xray.json'));
const js = read('engine-xray.js');
const html = read('engine-xray.html');

// 1. Data: illustrative status, every claim sourced
assert.equal(data.geometryStatus, 'illustrative-not-oem', 'geometry must stay labelled illustrative');
assert.match(data.notice, /not Triumph CAD/i, 'notice must say the shapes are not Triumph CAD');
const sources = data.sources;
for (const [id, s] of Object.entries(sources)) {
  assert(s.title && s.short && s.tier, `source ${id} incomplete`);
  if (s.url) assert.equal(new URL(s.url).protocol, 'https:', `source ${id} must be HTTPS`);
}
assert(Array.isArray(data.facts) && data.facts.length, 'facts missing');
for (const f of data.facts) assert(sources[f.source], `fact ${f.label}: unknown source ${f.source}`);
const ids = new Set();
for (const p of data.parts) {
  assert(/^[a-z]+$/.test(p.id), `bad id ${p.id}`);
  assert(!ids.has(p.id), `duplicate id ${p.id}`); ids.add(p.id);
  assert(p.label && p.text && p.sys, `${p.id}: label, sys and text required`);
  assert.equal(typeof p.shell, 'boolean', `${p.id}: shell flag`);
  assert(Array.isArray(p.cite) && p.cite.length, `${p.id}: needs at least one source`);
  for (const c of p.cite) {
    assert(sources[c.source], `${p.id}: unknown source ${c.source}`);
    if (c.source === 'sm2016') assert(c.pages, `${p.id}: service-manual citation needs pages`);
  }
}

// 2. No service figures on a concept page (they live, sourced, on the Dashboard and Teardown)
const allText = JSON.stringify(data) + html;
assert.doesNotMatch(allText, /\b\d+(?:\.\d+)?\s?N\s?m\b/i, 'no torque values on the X-ray page');
assert.doesNotMatch(allText, /\bT\d{7}\b/, 'no OEM part numbers on the X-ray page');
assert.doesNotMatch(allText, /\b\d+(?:\.\d+)?\s?mm\b/i, 'no dimensions/tool sizes on the X-ray page');
assert.doesNotMatch(allText, /Brembo/i, 'MY18 brakes are Nissin; nothing here should mention Brembo');

// 3. Geometry exists for every data part, and only for data parts
const buildKeys = new Set([...js.slice(js.indexOf('const BUILD = {'), js.indexOf('/* ---------- theme-aware')).matchAll(/^  (\w+)\(/gm)].map(m => m[1]));
const layoutKeys = new Set([...js.slice(js.indexOf('const LAYOUT = {'), js.indexOf('const SOLID')).matchAll(/^  (\w+):\s*\{/gm)].map(m => m[1]));
for (const id of ids) { assert(buildKeys.has(id), `no builder for ${id}`); assert(layoutKeys.has(id), `no layout for ${id}`); }
for (const k of buildKeys) assert(ids.has(k), `builder ${k} has no data entry`);
assert.equal(layoutKeys.size, ids.size, 'layout and data part counts differ');

// 4. Page: honest label, local module only, strict CSP
assert.match(html, /not Triumph CAD/, 'visible concept badge missing');
assert.match(html, /<script type="module" src="engine-xray\.js"><\/script>/, 'module entry missing');
assert.doesNotMatch(html, /<script[^>]+src="https?:/i, 'no remote scripts on the X-ray page');
const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/)[1];
assert.match(csp, /script-src &#x27;self&#x27;;/, 'script-src must be self only');
assert.doesNotMatch(csp, /unsafe-eval/, 'no unsafe-eval');
for (const page of ['index.html','exploded.html','catalogue.html','electrical.html','manual-index.html','real-photo-gallery.html','photo-teardown.html','engine-xray.html'])
  assert.match(read(page), /<nav class="site-nav"[^>]*>[\s\S]*?<a href="engine-xray.html"[^>]*>Engine X-ray<\/a>/, `${page}: nav link to Engine X-ray missing`);

// 5. Vendored Three.js: local, licensed, self-contained imports
for (const [, spec] of js.matchAll(/^import .* from '([^']+)';$/gm)) assert(spec.startsWith('./assets/vendor/three/'), `engine-xray.js imports ${spec}`);
const vendor = path.join(root, 'assets/vendor/three');
assert(fs.existsSync(path.join(vendor, 'LICENSE')), 'three.js LICENSE missing');
assert.match(fs.readFileSync(path.join(vendor, 'LICENSE'), 'utf8'), /MIT License/);
for (const f of ['OrbitControls.js', 'RoomEnvironment.js', 'RoundedBoxGeometry.js', 'CSS2DRenderer.js']) {
  const src = fs.readFileSync(path.join(vendor, f), 'utf8');
  for (const [, spec] of src.matchAll(/from\s+'([^']+)'/g)) assert.equal(spec, './three.module.min.js', `${f} imports ${spec}`);
}
assert(fs.statSync(path.join(vendor, 'three.module.min.js')).size > 500000, 'three.module.min.js missing or truncated');

console.log(`Engine X-ray PASS: ${ids.size} parts, ${data.facts.length} facts, ${Object.keys(sources).length} sources, geometry and nav verified, no service figures.`);
