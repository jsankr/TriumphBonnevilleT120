# Validation report — v3.2 (18 November 2026)

All checks below were run on the release commit. Every check passed.

## Data validators (`tests/validate-*.mjs`, run in CI)
| Check | Result |
|---|---|
| Component evidence | 30 assemblies, source-linked torques, tools and quarantine rules |
| Parts index | 30 unique assemblies; Nissin brake, fork and shock records; tool/torque guard |
| Electrical links | 9 fuses, 6 source diagrams, 51 harness components, 8 electrical part candidates; all internal links valid |
| Electrical data | 9 fuses, 51 harness components, 6 manual drawings, 8 electrical parts |
| Exploded catalogue | 8 assemblies, 171 catalogue entries, 27 source-labelled torque references |
| Links | 22 HTML/Markdown sources, 121 local links |
| Manual index | 894 indexed pages, 230 audited torque rows, 13 quarantined, 44 service rows, 37 tools, 32 owner specs |
| Security and routes | 7 pages, 101 internal resources, 190 anchors, no embedded secrets |
| Sources | 230 active torque rows, 13 quarantined, 44 maintenance rows, 32 owner specs, 37 special tools |
| Models | 3 models; 432 catalogue part rows, 76 sourced torque values, 56 callout links with basis, 24 photo markers; model IDs match `model.js`; no prices stored; Triumph-sourced values pinned (85 Nm spindle, 5 Nm adjusters, 8 Nm covers) |
| Teardown | 3 openly licensed photos, 17 outlines, 43 markers, 31 callout-to-torque links, 8 sourced tool sizes |

## Browser tests (headless Chrome)
- Smoke test: 7 pages at 1440 px and 390 px, 90 interactions, 0 failures, no console errors, no horizontal overflow.
- Model audit (`tests/model_browser_audit.py`, real HTTP): Bonneville and T100 at 1440 px and 390 px. Clicks every assembly and every callout (716 checks); every torque shown links to its source; every marker lies inside its outline; no console errors or overflow; switching back to the T120 clears the choice from the address.
- Security test: 184 dynamic links, 2 injection tests (hostile URL and HTML in data), no issues.
- Teardown value check: all 156 catalogue positions opened one by one; every torque, page number, part number and tool size shown on screen matches the data files exactly; all 43 markers sit inside their assembly outline.
- Theme test: follows the system setting, switches on click, and the choice persists across pages, in both starting modes.

## Text contrast (calculated, WCAG 2.x)
Lowest body/label ratio is 5.1:1 (muted text, both themes); brass text 5.6:1 in light and 8.7:1 in dark.

## Data clean-up in this release
- External reference photos re-checked: 11 of 12 load. The dead one (a 2018 dealer listing photo that now returns 404) was removed from `data/real-reference-index.json`.
- Removed files nothing referenced: the concept illustration `assets/bonneville-reference.webp`, three screenshots of the previous design, and the old `v1.2.1` zip.

## Limits that remain
- Air-cooled models: no Triumph service manual was available. 4 of 38 torque values per model come from Triumph documents (handbook: spindle nut, chain adjusters; Technical News 162: clutch and alternator cover bolts); the other 34 are Haynes (aftermarket) and are labelled so.
- The T100 teardown photo is a 2011 bike of the same 865 cc generation, not a 2014–2016 one.
- Torque values are from the April 2016 T120 service manual and must be confirmed for a given 2018 motorcycle.
- Tool sizes: 8 found in public sources; three TriumphRat entries could only be read through search excerpts.
- No photograph is of the owner's motorcycle.
