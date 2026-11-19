# Changelog

## 3.5.1 — 19 November 2026
- README: animated Engine X-ray GIF at the top, a screenshot gallery of every page (desktop and phone), a "How it helps a Bonneville rider" section, a **torque quick reference** of 24 everyday fasteners taken exactly from the 2016 manual rows (with page, note and row ID, plus the 2016-edition and front-brake quarantine caveats), and the 22 **Rider tricks** as a collapsible Easter egg.
- Media in `docs/media/` (WebP screenshots, a 2 MB GIF captured frame by frame with a controlled clock so the animation is smooth).
- New CI check `tests/validate-readme-torques.mjs`: every README torque row must match `data/source-reference.json` exactly (fastener wording, value, page, note), must not be a quarantined page-70 row, and every README image must exist.

## 3.5.0 — 19 November 2026
- Engine X-ray: Throttle control (twist-grip stand-in, ↑/↓ keys) replaces the plain Speed slider. It drives engine speed, with a short lag as the engine revs, and works with firing on: the butterflies open, intake air is drawn in (new pale dots on each intake stroke), and fuel spray, flame and exhaust scale with throttle.
- *Hold to rev* button (pointer or keyboard) snaps the throttle wide open until released. *Slow-mo* toggle (key S) slows the view to 0.2× for study.
- Engine speed is shown relative to idle, never as rpm; the throttle-to-speed relationship is labelled illustrative. Explainer text cites Triumph's media kit for ride-by-wire.
- Throttle bodies are drawn see-through in X-ray mode so the butterflies show.
- **Side correction:** the clutch and primary drive are on the rider's LEFT; the alternator, front sprocket and final-drive chain are on the RIGHT. The Engine X-ray had the clutch and alternator swapped and the sprocket on the left. Sources: manual removal steps quoted on TriumphRat (clutch cable and gear-change arm attach at the clutch cover; the alternator cover sits behind the coolant tank and rear brake reservoir), Triumph's owner's handbook (coolant expansion tank on the right), an aftermarket clutch-cable bracket fitted on the left, and the project's right-side (chain side) photo. Both tests now pin these sides.
- Teardown photo labels corrected to match: the left view's large cover is the **Clutch cover**; the right and Cranberry views show the **Alternator cover and front sprocket cover**.
- Labels start hidden for a clean view; the Labels button cycles Off → Internals → All (key L), and a selected part always keeps its label.
- Browser audit: checks that throttle raises engine speed, opens the butterflies, draws in intake air, and that Hold to rev releases back to the previous setting.

## 3.4.0 — 18 November 2026
- New page `engine-xray.html`: animated 3D concept drawing of the 1200 cc twin with glass (X-ray) casings, 22 labelled parts, inspector with sources, explode/reset, isolate, solid mode and camera views. Linked from every page's navigation.
- Part text and the facts strip come from `data/engine-xray.json`; every statement cites Triumph's launch media kit or a 2016 service-manual page. Shapes are marked illustrative on screen. No torque values, tool sizes, dimensions or part numbers on the page.
- Two balancer shafts, following the 2016 manual's Balancer chapter and its front balancer / rear dead shaft torque rows.
- Firing animation: injector spray on each intake stroke, spark near top dead centre, combustion flame on the power stroke, exhaust gas down the header pipes and out of the silencers, and a per-cylinder stroke readout. *Firing: On/Off* toggle (key F). Timing is illustrative.
- Fuel system: fuel pump in the tank (tank as outline), fuel hose and fuel rail with injectors on the cylinder head, with animated fuel flow (2016 manual p.65).
- In X-ray mode the header pipes and radiator are drawn see-through.
- Animation keeps real-time speed on slow devices; the spark triggers on crossing its firing point, so it is never skipped between frames.
- README: browser links to the live site and the Engine X-ray at the top, for sharing.
- Three.js r160 (MIT) vendored in `assets/vendor/three/`; the page's CSP allows scripts from `'self'` only.
- AGENTS.md: the no-3D rule now allows this one labelled concept page, under stated conditions.
- New CI steps: `tests/validate-engine-xray.mjs` and `tests/engine_xray_browser_audit.py`; the security/routes test now covers the new page and script.

## 3.3.0 — 18 November 2026
- Dashboard section "Rider tricks" (T120): 22 sourced features in five groups, with steps, cautions and handbook pages (`data/rider-tips.json`, `rider-tips.js`).
- New CI step: `tests/validate-rider-tips.mjs`.

## 3.2.0 — 18 November 2026
- Model switch for Bonneville T120 (2018), Bonneville (A3, 2014–2016) and Bonneville T100 (A3, 2014–2016), shared by the dashboard and the teardown (`model.js`, `data/models.json`).
- New per-model data files `data/models/bonneville-a3.json` and `data/models/bonneville-t100-a3.json`: handbook specifications, the 36-row maintenance chart, model-year 2015 catalogue part numbers for eight assemblies, 38 torque values each with a source tier, 28 callout links each with a basis, and the teardown map.
- Two openly licensed photographs, outlined and marked; the rear-wheel outline leaves the silencer in place.
- Dashboard: torque-by-source table and source list for the air-cooled models; T120-only sections are hidden for them.
- Tests: `tests/validate-models.mjs` and `tests/model_browser_audit.py`, which clicks every assembly and callout on both models, both run in CI.

## 3.1.0 — 16 November 2026
- Real photo of a T120 in Cranberry Red / Aluminium Silver (2016–2018 scheme) for the dashboard and the default teardown view; 7 assembly outlines and 19 markers on it.
- Light and dark glass themes with a header switch that follows the system setting until chosen (`theme.js`); all stylesheets moved to semantic colour tokens.
- Removed the Cordovan Red interface palette and the blurred photo backdrop.

## 3.0.0 — 16 November 2026
- Glass redesign of all seven pages in Cordovan Red / Silver Ice with a shared header, theme (`theme.css`) and re-skin layer (`pages.css`).
- Teardown rebuilt on two openly licensed real photographs: assembly outlines, animated separation, zoom to assembly, 24 callout markers, keyboard access.
- New `data/teardown-map.json` (outlines, markers, 31 callout-to-torque links with basis and kind) and `data/tool-size-reports.json` (8 sourced tool sizes).
- Dashboard: real photo hero, handbook workshop figures, interactive service planner from the 44-row schedule.
- Removed the concept illustration from the dashboard and teardown.
- New CI step: `tests/validate-teardown.mjs`.


## 2.1.0 — Photo-led UI rebuild
- Removed the low-detail procedural 3D motorcycle and all Blender/WebGL/Three.js dependencies.
- Rebuilt the actual browser UI to match the user's glass/technical screenshot direction: hero motorcycle reference, approximate hotspots, searchable assembly catalogue, part inspector, safety evidence register, maintenance desk and honest local evidence search.
- Integrated the user-provided motorcycle reference illustration as a labelled visual (not a verified OEM photo).
- Preserved 30 evidence-audited component records and Nissin MY18 brake correction.
- Added automated source integrity checks, desktop/mobile Chromium captures and conditional GitHub Pages workflow.
- Kept original v1.2.1 archive unmodified for historical download.

## 1.2.1 — Nissin brake data
- Corrected model-year brake records to reflect Nissin MY18 factory specification, not later Brembo front components.

## v2.2 — Document evidence integration (2026-11-14)
- Audited four user-provided PDFs, totaling 894 source pages. Disambiguated 2016 T120 references from older 2012 and 2006 documents explicitly outside T120 scope.
- Added 230 PDF-table-extracted torque records, 44 schedule entries, 32 T120 owner-handbook specs, 37 special service tools and full service/owner PDF chapter navigation; source provenance and page cited for every record.
- Quarantined 13 mislabelled page-70 engine-cover entries erroneously placed beneath a Front Brakes heading in the 2016 manual.
- Added private per-document on-device PDF reader, original-page jump, optional browser-only PDF.js full-text search, and no-copy policy for copyrighted manuals.
- Added source safety audit and `tests/validate-sources.mjs`. Retained the photo-based interface, no Blender/WebGL requirement.

## v2.3 — clean consolidated replacement
- Fresh full-replacement Git tree, preserving previous source in a dedicated backup branch.
- Preserved audited 230 active/13 quarantined 2016 torque data, 44 maintenance tasks, 37 special tools, 32 T120 owner specs.
- Added a dedicated 894-page navigation explorer linking to the 4 original documents via local file picker.
- Excluded obsolete repository-only gallery and failed 3D modelling artifacts.
- Extended CI checks with document-index integrity validation; no source PDF reproduction.

## 2.4.0 — Private photo-teardown scaffold
- Added a multi-angle, four-stage photo-annotation editor that requires real photographs rather than fabricated geometry.
- Reused 30 assembly records and the existing source-linked 2016 torque table with an explicit 2018 applicability disclaimer.
- Added a confidentiality architecture note: no full vehicle identifier or private photo content in the published frontend/repository.

## v2.5 — real 2018 reference atlas
- Replaced synthetic 3D expectations with externally linked actual 2018 T120 example photos and official 2018 brochure grounding.
- Added 2018 OEM fiche source atlas, non-committal part-number candidates and clear variant/market restrictions.
- Added optional publisher-photo reference background to photo-teardown, preserving private local annotation.
- Added dashboard navigation links for real image and exploded parts research. No third-party images bundled; no private vehicle identifiers in source.
## v2.7 — 2018 OEM exploded teardown atlas
- Shipped standalone responsive exploded callout viewer with source-linked original OEM drawings and part selection.
- Added 8 curated OEM assembly fiches and 171 source-derived catalogue records; grouped production variants.
- Added 27 labelled 2016 T120 Service Manual tightening references, specialist-tool identifiers and explicit unknown drive-size labels.
- Updated README and dashboard to open the explorer, source audit and CI data guard.
- Current frontend displays genuine sourced catalogue entries, not full 3D/photoreal CAD or a complete 2018 vehicle bill of materials.

## v2.8 — Broken external link repair
- Replaced blocked 2018 exploded-fiche mirror links in eight assemblies and photographic parts reference index with two catalogue choices.
- Removed unreliable third-party iframe and preserved interactive parts data locally.
- Replaced timeout-prone MY18 brochure link and added link regression CI test.

## v2.9 — Evidence, fuse and catalogue usability corrections
- Fix dashboard torque tab to show existing named 2016 T120 fastener references ahead of unconfirmed 2018 fields.
- Add original accessible electrical and fuse index and private original-PDF viewer.
- Add source-linked 2018 parts-category navigator; seller illustrations and real-time pricing remain with owner.

## v3.1 — Full module QA and OWASP 2025 security improvements (15 November 2026)
- Exercised seven browser pages, 90 desktop/mobile UI actions and 166 rendered link destinations; all tested interactions passed.
- Fixed PDF link/chooser flows, responsive dashboard selectors, HTML injection sinks, image-error handlers, source URL validation and unsafe file types.
- Added per-page CSP, no-referrer, least-privilege Actions permissions, static security gates and Playwright Chromium smoke tests before Pages deployment.
- See docs/FULL-QA-SECURITY-AUDIT.md for detailed results, residual external dependencies and untested browser/hosting limitations.
