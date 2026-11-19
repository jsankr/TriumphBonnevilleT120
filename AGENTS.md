# Development rules for the 2018 T120 Workshop Explorer

- Do not fabricate torque specifications, tool sizes, socket measurements, OEM part numbers or part fitment.
- The April 2016 T120 service manual and November 2016 owner handbook are **2016 edition references**; their values are not independently validated for an India-market 2018 VIN.
- `data/source-reference.json` is the authoritative curated project database. It contains 230 active torque references and 13 quarantined contradictory page-70 rows. Do not use `manual-page-index.json` for repair values: it is **navigation only**.
- The 2012 Bonneville/T100 sheet and 2006 checklist are not 2018 T120 service sources.
- Factory MY18 Nissin dual front/single rear calipers; two front fork legs and two rear shocks. No later-year Brembo substitution.
- Keep all original copyrighted PDFs on the user device, not in GitHub. Respect their rights restrictions.
- Motorcycle images are real, openly licensed photographs with credits in README.md and data/teardown-map.json; none is the owner's motorcycle. No Blender or inaccurate 3D, with one exception: the Engine X-ray concept page (see v3.4 below).
- Run `node tests/validate-data.mjs`, `node tests/validate-sources.mjs` and `node tests/validate-manual-index.mjs` before committing.
- Show complete feature/test/deploy status truthfully, preserve source citations, and verify GitHub Pages separately from source publication.

## Confidentiality hard requirement
- The owner supplied a confidential VIN privately. Do **not** insert the value or any partial segments in code, HTML, JSON, screenshots, GitHub, CI logs, issues, console output, URLs, browser storage, prompts to external tools, or analytics. Do not ask the owner to post it publicly.
- GitHub Pages cannot safely store secret VINs. `photo-teardown.html` is client-only photo annotation and has no VIN-aware EPC lookup. Any private fitment integration must be independently hosted, authenticated, privacy-reviewed and use server-side secret management. No unsupported fitment claims.
- Prioritize actual owner photographs; never portray stock art/concept imagery as a photo of the owner's own motorcycle.

- The external photo atlas (`real-photo-gallery.html`, `data/real-reference-index.json`) links to third-party 2018 pictures and catalogues. Do not copy licensed photos or represent references as this individual motorcycle. All parts/sizes/torques require evidence and fitment verification.
- The full confidential vehicle identifier must never appear in code, logs, screenshots, URLs, public issues or README. Client-side GitHub Pages has no private VIN vault.
## v2.7 exploded explorer invariants
- `exploded.html` is a standalone browser-ready build; editable sources are `exploded.js`, `exploded.css`, and `data/exploded-2018.json`. Keep the embedded build synchronized with those files when changing any one of them.
- Original 2018 fiche callouts and conditional OEM part-number alternatives are grouped by callout rather than shown as extra fitted parts. Two front fork legs and two rear shock absorbers, never duplicate installed items.
- Torques belong to **named fastener operations** in the original 2016 T120 workshop manual, not generally to entire spares. No hardcoded or inferred Allen/socket sizes; `M8×30` is a thread/length, not drive size.
- Third-party actual exploded diagrams must be opened by direct OEM page links; never copy copyrighted fiche illustrations or manuals into GitHub.
- Do not collect, transmit, persist, or publish confidential vehicle identifiers.
- Validate via `node tests/validate-exploded.mjs` and browser tests before publication.

- OEM parts supplier mirrors may block visitors; never link interactive buttons to oem-bike-parts.cz/.pl/.hr. All assemblies need in-app callout fallback and two distinctly labeled catalogues. Run link validation tests before merging.

- The electrical navigator indexes April 2016 T120 service manual wiring and fuse references, never silently extrapolate to 2018 or generate a fake pin-level netlist. Original PDFs load privately.
- Do not clone a seller's complete catalogue, remove its watermarks, republish its proprietary schematic drawings or make unverified live price claims.

## QA and security gate (v3.1)
- Always run `node tests/validate-security-and-routes.mjs`, every `tests/validate-*.mjs`, and the Chromium smoke scripts in `tests/browser_audit.py` and `tests/security_browser_audit.py`.
- Never add executable event-handler attributes, `javascript:` URLs, unescaped source-data HTML, public vehicle identifiers, secrets or third-party PDF/manual rehosting.
- Keep reliable app-internal navigation when any external supplier blocks access. Maintain CSP hashes if an inline script changes.

## v3.2 multi-model invariants
- Model IDs live in `data/models.json` and in `model.js`; `tests/validate-models.mjs` keeps them identical. The T120 keeps its original data files and element IDs.
- Air-cooled model files (`data/models/*.json`) must name a source for every torque (`sources` key with tier triumph, aftermarket or forum). Never relabel a Haynes or forum value as Triumph data, and never store dealer prices.
- A figure that Triumph superseded or that a source contradicts stays visible as an alternative, not deleted.
- When changing a value in those files, change its `source` and `page` with it, and run `tests/validate-models.mjs` and `tests/model_browser_audit.py`.

## v3.4 Engine X-ray (concept 3D) invariants
- `engine-xray.html` is the only 3D page, and it is a concept explainer of the engine, not a model of the motorcycle. It must keep the on-screen "not Triumph CAD · not to scale" badge, and `geometryStatus` in `data/engine-xray.json` stays `illustrative-not-oem`.
- Every statement in `data/engine-xray.json` names a source (Triumph media kit, or a 2016 service-manual page with `pages`). A detail with no source is described as illustrative, never stated as fact.
- No torque values, tool sizes, dimensions or part numbers on this page; link to the Dashboard and Teardown for those. Do not add 3D anywhere else without the owner's approval.
- Three.js stays vendored in `assets/vendor/three/` (no CDN); the page CSP keeps `script-src 'self'`.
- Run `node tests/validate-engine-xray.mjs` and `python tests/engine_xray_browser_audit.py` after any change to the page, its script, its CSS or its data.

## Runtime CVE guard (v3.5.2)
- CI must keep `tests/check_runtime_versions.py` for both the system Node.js and Playwright's bundled Node.js. Never lower the Playwright pin below a release that bundles a patched Node.js (CVE-2026-111497 fixed in 22.23.4, 24.22.1, 26.12.1).
- The site stays static: no server-side Node.js, PHP or React Server Components, no Brotli decompression in project code, and no `fetch()` to external servers from tests or build steps.
