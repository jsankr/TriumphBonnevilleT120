# Development rules for the 2018 T120 Workshop Explorer

- Do not fabricate torque specifications, tool sizes, socket measurements, OEM part numbers or part fitment.
- The April 2016 T120 service manual and November 2016 owner handbook are **2016 edition references**; their values are not independently validated for an India-market 2018 VIN.
- `data/source-reference.json` is the authoritative curated project database. It contains 230 active torque references and 13 quarantined contradictory page-70 rows. Do not use `manual-page-index.json` for repair values: it is **navigation only**.
- The 2012 Bonneville/T100 sheet and 2006 checklist are not 2018 T120 service sources.
- Factory MY18 Nissin dual front/single rear calipers; two front fork legs and two rear shocks. No later-year Brembo substitution.
- Keep all original copyrighted PDFs on the user device, not in GitHub. Respect their rights restrictions.
- Hero motorcycle artwork is a user-supplied concept reference, not an authenticated manufacturer photo. No Blender or inaccurate 3D.
- Run `node tests/validate-data.mjs`, `node tests/validate-sources.mjs` and `node tests/validate-manual-index.mjs` before committing.
- Show complete feature/test/deploy status truthfully, preserve source citations, and verify GitHub Pages separately from source publication.

## Confidentiality hard requirement
- The owner supplied a confidential VIN privately. Do **not** insert the value or any partial segments in code, HTML, JSON, screenshots, GitHub, CI logs, issues, console output, URLs, browser storage, prompts to external tools, or analytics. Do not ask the owner to post it publicly.
- GitHub Pages cannot safely store secret VINs. `photo-teardown.html` is client-only photo annotation and has no VIN-aware EPC lookup. Any private fitment integration must be independently hosted, authenticated, privacy-reviewed and use server-side secret management. No unsupported fitment claims.
- Prioritize actual owner photographs; never portray stock art/concept imagery as a photo of the owner's own motorcycle.

- The external photo atlas (`real-photo-gallery.html`, `data/real-reference-index.json`) links to third-party 2018 pictures and catalogues. Do not copy licensed photos or represent references as this individual motorcycle. All parts/sizes/torques require evidence and fitment verification.
- The full confidential vehicle identifier must never appear in code, logs, screenshots, URLs, public issues or README. Client-side GitHub Pages has no private VIN vault.