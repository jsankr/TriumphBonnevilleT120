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

## v2.3 — clean replacement on main
- Replaced old main tree in one commit and preserved its last commit on backup/pre-clean-v2.3-2026-11-14.
- Restored separate red/silver concept image and real running-app screenshots.
- Added full 894-page locally-viewable document navigation, backed by the audited 2016 T120 source database.
- Preserved 230 active torque values, 13 quarantine records, 44 maintenance tasks, 37 tools and 32 T120 owner specs.
- Excluded 2012 and 2006 model data from 2018 repair references, and avoided copyrighted original PDF redistribution.
- Added source index CI validation, AGENTS.md and browser launch documentation.
