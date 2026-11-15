# Electrical link repair and scope (v3.0)

## Verified defects in the prior live page
- Fuse table rows used plain text for 2016 source pages.
- All 51 harness entries were labels, not actionable source controls.
- The six source drawing controls required manually selecting a local PDF before any feedback; selecting the file did not automatically open the previously requested page.
- The electrical list included four fork-stanchion production alternatives unrelated to electrical equipment.
- The inline page overrode the browser global fetch function.

## Repairs shipped
- Directly actionable manual-page buttons for **nine fuses**, **six wiring reference cards**, and **51 harness items**.
- The first source click prompts the browser's private file picker and then navigates to the requested manual page. Later clicks re-use the locally opened PDF.
- Detail buttons for **eight electrical spare candidates** show part number, fiche assembly, quantity when supplied, fitment status and alternative catalogue sources. The four fork candidates remain in the source database but no longer appear in this electrical list.
- Working intra-page anchor shortcuts and a dealer/OEM supplier fallback catalogue link.
- Inline source references remain local without overriding the browser fetch API.

## Document and security boundaries
Every printed page reference on this page is from the **April 2016 T120 service manual**, NOT independently validated for an individual 2018 India-market motorcycle. The app does not publish the copyrighted manual. Selecting the PDF does not upload its contents. A mobile PDF viewer may ignore the #page fragment; use its page selector in that case.

External supplier website access can vary and is **not verified for every user's network**. The in-app data remains usable when an external supplier blocks a request. Item-specific checkout pages and prices are not invented.

## Validation
GitHub Actions runs node tests/validate-electrical-links.mjs, which checks the inline JS syntax, data counts, source control wiring, internal link targets, and privacy. Desktop/mobile Chromium functional tests were also exercised on the locally prepared version; no claim is made that Firefox/Safari on physical devices have been tested.
