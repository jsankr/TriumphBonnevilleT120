// README torque quick reference must match data/source-reference.json exactly and never use quarantined rows.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const src = JSON.parse(fs.readFileSync(path.join(root, 'data/source-reference.json'), 'utf8'));
const rows = new Map(src.torqueSettings.map(r => [r.id, r]));
const quarantined = new Set(src.quarantinedTorquePage70.map(r => r.id));

const start = readme.indexOf('<!-- torque-table:start'), end = readme.indexOf('<!-- torque-table:end -->');
assert(start > -1 && end > start, 'README torque table markers missing');
const lines = readme.slice(start, end).split('\n').filter(l => /`SM2016-P\d+-R\d+`/.test(l));
assert(lines.length >= 10, `expected a useful torque table, found ${lines.length} rows`);
const seen = new Set();
for (const line of lines) {
  const cells = line.split('|').map(c => c.trim());
  const id = line.match(/`(SM2016-P\d+-R\d+)`/)[1];
  assert(!quarantined.has(id), `${id} is quarantined and must not appear`);
  const r = rows.get(id); assert(r, `${id} not in torqueSettings`);
  assert(!seen.has(id), `${id} listed twice`); seen.add(id);
  assert.equal(cells[2], r.part, `${id}: fastener wording differs from the manual row`);
  assert.equal(cells[3], `**${r.valueText}**`, `${id}: torque differs (${cells[3]} vs ${r.valueText})`);
  assert.equal(cells[4], `p. ${r.page}`, `${id}: page differs`);
  assert.equal(cells[5], (r.notes || '').replace(/\|/g, '/'), `${id}: note differs`);
}
assert.match(readme, /2016 edition values, not independently validated for a 2018/, 'README must keep the 2016-edition caveat');
assert.match(readme, /Front brake caliper values are \*\*not listed\*\*/, 'README must explain the quarantined front-brake rows');
for (const [, img] of readme.matchAll(/(?:src="|\]\()((?:docs\/media)\/[^")]+)/g))
  assert(fs.existsSync(path.join(root, img)), `README image missing: ${img}`);
console.log(`README torque table PASS: ${lines.length} rows match data/source-reference.json; no quarantined rows; images present.`);
