# Changelog

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
