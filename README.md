# Triumph Bonneville T120 (2018) — Workshop Explorer

## Clean consolidated release v2.3 — 14 November 2026

**[▶ Launch Workshop Explorer in browser](https://jsankr.github.io/TriumphBonnevilleT120/)** · [894-page manual index](manual-index.html) · [Original PDF reader](docs/LOCAL-PDF-READER.md) · [Source audit](docs/SOURCE-AUDIT.md)

The current `main` branch is a clean replacement of the prior site, preserving the previous commit in `backup/pre-clean-v2.3-2026-11-14`. The photo-led (not Blender/3D) dashboard has 30 source-conscious assembly records. Its audited factual database contains **230 active 2016 T120 torque entries**, **13 quarantined inconsistent entries**, **44 scheduled maintenance tasks**, **37 special tools**, **32 owner-handbook specifications**, and a full **894-page index** across the 728-page 2016 service manual, 162-page 2016 owners handbook, 3-page 2012 legacy sheet, and 1-page 2006 legacy checklist.

**Scope rule:** 2016 T120 values are references, not confirmed for the specific 2018 India-market VIN or aftermarket equipment. The 2012/2006 sheets are historical and excluded from 2018 T120 repair values. The four copyright-protected PDFs are **not published to GitHub**; the app opens your original copies locally. The motorcycle graphic is concept artwork, not a verified photo; the assistant is local retrieval, not a cloud AI service.

**Live-site caveat:** The URL above is the expected GitHub Pages URL, and is not proof that Pages is enabled or accessible for the repository's current private visibility.

---



[![Launch browser application](https://img.shields.io/badge/OPEN-WORKSHOP_APP-1c78c6?style=for-the-badge)](https://jsankr.github.io/TriumphBonnevilleT120/)

**[Open the Workshop Explorer in your browser](https://jsankr.github.io/TriumphBonnevilleT120/)** · [Source audit](docs/SOURCE-AUDIT.md) · [Private PDF guide](docs/LOCAL-PDF-READER.md)

An independent, no-Blender, responsive workshop reference application for a **2018 Triumph Bonneville T120**, with a photo-led dashboard, Nissin brake model identity, searchable assembly records, 2016 Triumph service/owner manual factual indexes, maintenance records and an optional private, complete-PDF reader.

## Read the source qualifications before service work

**Not a Triumph factory product or a stand-alone workshop instruction.** This project does not validate model/year/market/VIN-specific procedures, aftermarket component compatibility, or revised service bulletins. Do not use the app's values alone for safety-critical repairs. Source year and page are always identified.

The user's four source documents were audited:

| File source | Edition | Pages | How it is used |
|---|---|---:|---|
| T120 Motorcycle Service Manual | Triumph 04.2016 Issue 1 | **728** | 230 indexed active torque rows, 44 maintenance tasks, 37 special tools, full 26-chapter index |
| Owner’s Handbook (includes T120) | Triumph 11.2016 Issue 1, 3855577-EN | **162** | 32 T120-specific fields from pages 156–159 and full contents index |
| Bonneville/T100 EFI Service Data Sheet | Issue 9, 12.2012 | **3** | Historic **not applicable to T120**; can be opened locally |
| Older Bonneville maintenance checklist | 2006 | **1** | Historic **not applicable to T120**; can be opened locally |

The copyright-protected source PDF files are **not included in this repository**. Instead, select your own documents in the **My PDF library** section. All original pages, images, warnings, diagrams and procedures remain available unabridged in a local PDF viewer. Optional client-side text search scans all loaded pages without transmitting the original PDFs to a server. This preserves the full source reading experience without illicitly republishing the manuals. See [private PDF usage](docs/LOCAL-PDF-READER.md).

## Searchable technical records

The indexed database `data/source-reference.json` contains:

- **230 torque records** from 2016 T120 manual pages 57–74, with source-page links, row notes and procedure flags. The 13 incorrectly labelled engine-cover entries on page 70 are quarantined; they are not given as front-brake torque settings.
- **44 maintenance tasks** from 2016 manual pages 84–85, including first-service/annual/mileage schedule columns and explicitly time-based operations.
- **32 2016 T120 owner-handbook specifications** from pages 156–159, including engine, coolant, fuel, 6-speed transmission, tyre sizes and cold tyre pressures.
- **37 service tool numbers/descriptions** from 2016 manual pages 27–33. The tool register does not assume socket sizes for unrelated fasteners.
- **26 complete 2016 T120 service chapter ranges** covering every PDF page from 1 to 728, plus 14 owner-handbook chapter ranges covering all 162 pages.

Every structured value has a source ID, edition and PDF page. **2016 is not automatically 2018-VIN verified.** Earlier-generation 2012 and 2006 material is excluded from live T120 technical results; only available in the local reader.

### Source-backed examples (2016 T120 service manual only)

| Fastener | Stated 2016 reference | Source PDF page |
|---|---:|---:|
| Front wheel spindle/axle bolt | 65 Nm | 69 |
| Fork to wheel spindle pinch bolts | 23 Nm | 69 |
| Rear suspension unit upper mounting | 28 Nm | 68 |
| Rear suspension unit lower mounting | 28 Nm | 68 |
| Rear wheel spindle lock nut | 110 Nm | 69 |
| Rear brake caliper to carrier | 40 Nm | 71 |

For your actual 2018 bike, confirm applicability with the appropriate Triumph service information, VIN, market and aftermarket configuration. **Do not infer the tool's hex/socket size from the torque table.** See [full audit](docs/SOURCE-AUDIT.md).

## Application features

- 2D photographic-style motorcycle dashboard based on a user-supplied concept image, with hotspots and selectable assemblies; **no fake 3D model**, Blender or Three.js dependency.
- 30 source-constrained 2018 T120 assembly-level part records, including 2018 Nissin two-piston floating brake calipers; the geometry shown is illustrative and not measured OEM CAD.
- Full-text filter over all 230 torque entries, 44 scheduled-maintenance tasks, 32 owner-manual T120 specifications and 37 specialist tools.
- Paper-trail from every technical result to an original document and exact PDF page.
- Local PDF document reader plus cross-document search of all 894 pages when the four originals are selected (728+162+3+1), with original content remaining only on the user's device.
- 2016 service manual page 70 discrepancy warning, 2012/2006 model-scope exclusion, unknown 2018-VIN applicability warnings.
- User checklist saved in browser local storage, NHTSA recall context, and rule-based reference search assistant (**not a live LLM**).
- Responsive modern HTML/CSS/JS for Chrome, Firefox, Safari desktop and mobile. PDF.js-based local full-text scanning requires an online CDN and has not yet been verified on every target browser.

## Deploy/run

No build step or backend is required. Publish the files to the root of `main`, then configure GitHub **Settings → Pages** to deploy from `main` / `(root)` or a suitable GitHub Actions deployment workflow. On a private repo, confirm GitHub Pages eligibility. The URL is:

**https://jsankr.github.io/TriumphBonnevilleT120/**

To run locally:

```bash
python -m http.server 8000
# http://localhost:8000
```

Use a local HTTP server because the app loads `parts.json` and `data/source-reference.json` via `fetch()`. The separate original PDFs are selected through the browser and are never committed.

## Validate development changes

```bash
node --check app.js
node --check copilot.js
node --check source-library.js
node tests/validate-data.mjs
node tests/validate-sources.mjs
```

These tests check data shape and specific printed values. They **cannot certify** revision/VIN applicability or every diagram/procedure.

## Legal and safety

The source documents bear copyright notices restricting redistribution. They have **not** been bundled, copied into GitHub or translated into wholesale plain-text replicas. The indexed dataset is a factual source catalogue, not a scanned manual replacement. Original documents remain privately available for all pages through your own selected PDFs. The repository is independent of Triumph Motorcycles Ltd.
