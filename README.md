# Triumph Bonneville T120 (2018) — Workshop Explorer

**Link repair:** Previously linked OEM mirrors blocked some visitors. Use the in-app exploded callouts and two 2018 catalogue choices instead. External reachability is network-dependent.

## v3.1 — your paint scheme, light and dark glass themes (16 November 2026)

- **Cranberry Red / Aluminium Silver.** The dashboard and the default teardown view now use a real photograph of a T120 in the 2016–2018 Cranberry Red over Aluminium Silver scheme with the gold coach line, shot from the right (chain) side. Seven of the eight assemblies are outlined on it, with 19 markers for right-hand parts (right stanchion, right caliper, chain, clutch and sprocket covers). The rear brake is on the left, so it stays on the left-side photo.
- **Light and dark themes.** Graphite glass and frosted aluminium glass, with brass from the coach line as the only accent. The site follows the device setting until the visitor uses the switch in the header; the choice is remembered in that browser (`theme.js`). Text contrast is at least 5:1 for all body and label colours in both themes.
- Teardown now has three photographs: right side (Cranberry Red), left side, engine close-up.

| Photo | Author | Licence | Changes |
|---|---|---|---|
| [T120, Cranberry Red / Aluminium Silver, right side](https://www.flickr.com/photos/105592384@N07/51444289036) | takenji1989 | [CC BY-NC-SA 2.0](https://creativecommons.org/licenses/by-nc-sa/2.0/) | Background and the person standing behind the motorcycle removed; resized and cropped. The adapted files `assets/photo/t120-cranberry-*.webp` are shared under CC BY-NC-SA 2.0, so they may not be used commercially. |

## v3.0 — glass redesign and real-photo teardown (16 November 2026)

**[Open the dashboard](https://jsankr.github.io/TriumphBonnevilleT120/)** · **[Open the teardown](https://jsankr.github.io/TriumphBonnevilleT120/exploded.html)**

- **Teardown on real photographs.** The eight 2018 catalogue assemblies are outlined on two openly licensed photographs of the liquid-cooled T120 (left side, right-side engine). *Take it apart* lifts each assembly out of the photo; 24 numbered markers place individual catalogue callouts. Outlines and markers are hand-placed and approximate.
- **Each part shows its own torque and tool.** 31 callout-to-torque links tie a catalogue part to the April 2016 service-manual row that tightens it. Each link records why it was made and is labelled *named* (the manual or catalogue names the same component) or *inferred* (the project's reading). The full manual torque table for each system is one click away.
- **Tool sizes with sources.** Eight hand-tool sizes from owner forum posts and an accessory maker's install guide, each labelled with its source type and link (`data/tool-size-reports.json`). Triumph's own data files still hold no tool sizes.
- **Service planner.** Triumph's 44-task scheduled-maintenance table (service manual pp. 84–85) as an interactive matrix: pick Daily, First service, Annual, 16,000/48,000, 32,000 or 64,000 km to see what is due.
- **Workshop figures.** Oil, coolant, plug, fuel, tyre, chain, brake-fluid and battery figures from the T120 column of the 2016 owner's handbook, with page numbers.
- **Design.** Glass interface; typeface Archivo (SIL Open Font Licence, bundled in `assets/fonts`).
- **Tests.** New `tests/validate-teardown.mjs` checks the photo map and tool data against the parts catalogue and manual table; it runs in CI with the existing suites.

### Photographs and licences
| Photo | Author | Licence | Changes |
|---|---|---|---|
| [2017 Bonneville T120, left side](https://commons.wikimedia.org/wiki/File:2017_Bonneville_T120_CSNDCC1.jpg) | AmenMoto | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Resized, background removed. The adapted file `assets/photo/t120-left-cutout.webp` is shared under CC BY-SA 4.0. |
| [T120 engine, right side](https://commons.wikimedia.org/wiki/File:Triumph_EM1B9077_(49794022932).jpg) | Bengt Nyman | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Resized. |

Neither photograph shows the owner's motorcycle. The left-side photo is a 2017 model of the same liquid-cooled generation; the right-side photo's model year is not stated by the photographer.

This is an independent owner's reference, not affiliated with or endorsed by Triumph Motorcycles.

---



## v2.9 — electrical/fuse references, 2018 parts navigator and corrected torque panel

**[Electrical & Fuses](electrical.html)** is a searchable original-source reference for the 2016 T120 service-manual fuse table (9 positions), main harness sensor/component legend, and documented wiring pages (671, 724–728). Choose your own locally stored PDF to open original diagrams in the browser without copying them to GitHub. These references are **not certified for a 2018 VIN**; the actual 2018 fuse cover and manual take priority.

**[2018 Genuine Parts Navigator](catalogue.html)** indexes selected systems from the [2018 motorcycle supplier catalogue](https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles). Genuine part metadata are candidate references; illustrations, watermarks and current seller checkout prices remain at the authorized provider. Use the [in-app exploded parts explorer](exploded.html) for the 171 existing sourced part candidates in eight assemblies.

**Dashboard fix:** selected-assembly torque values from the 2016 T120 manual now appear **before** the missing 2018-specific values. The label “2016 MANUAL REFS · CHECK MY18” clarifies that the application contains supporting torque records without claiming VIN-specific confirmation or undocumented tool socket/hex sizes. No private vehicle identifiers, third-party complete site copies or images with removed watermarks are included.

## NEW: 2018 OEM exploded teardown explorer (v2.7)

**[▶ Launch interactive exploded parts, tools and torque references](exploded.html)** · [Open as hosted page](https://jsankr.github.io/TriumphBonnevilleT120/exploded.html)

Eight 2018-specific sourced assembly fiches, 171 original catalogue entries grouped into numbered callouts (including conditional part alternatives) and 27 separately named tightening operations referencing the **April 2016 T120 service manual**. Includes front forks/yoke, both brakes (2018 Nissin), wheels, twin rear shocks, cooling and engine covers. Select a part, search OEM numbers, use the callout spread control or open the third-party genuine exploded drawing. The rendered parts-callout layout is **not measured physical CAD**. Exact socket/Allen/Torx bit sizes and individual 2018 VIN applicability remain unverified, and modified wheels/forks require their own sources. A confidential vehicle identifier is neither collected nor embedded. The original OEM technical drawings and copyrighted manuals are not copied into this repository.


## Verified 2018 photo and OEM parts source atlas — v2.5

[**Browse actual 2018 T120 example photos and OEM exploded diagrams**](real-photo-gallery.html) · [**Photo-based teardown studio**](photo-teardown.html) · [**MY18 manufacturer brochure**](https://www.triumph-motorcycles.com.vn/data/categories/897/TRM_10759398_MY18Classics_Master_US_SP.pdf)

Version 2.5 adds 13 externally sourced motorcycle image references (with year/aftermarket caveats), 11 source-linked 2018 catalogue drawing entries, and 12 conditional OEM-part-number candidates. Images remain on publisher websites and are **not copied into the repository**; they may be unavailable if third-party hotlinking is blocked. This project has **no permission to redistribute third-party photography**, and captions never imply another person's motorcycle is this owner's. No private VIN is displayed, stored or transmitted; individual fitment still requires private Triumph/dealer confirmation.

The 2018 factory Nissin calipers and 41-mm KYB forks are confirmed from the manufacturer's MY18 document. The 2018 parts fiche can include multiple *alternative* fork numbers: only one physical fork leg exists on each side. Do not apply any 2012/2006 legacy torques to the 2018 motorcycle. Modified Kineo wheels and TEC springs are **not** covered by stock-fitting assumptions.

### Visual research coverage
- Full motorcycle profiles, front three-quarter and rear assembly detail
- Front wheel and Nissin brake / fork examples
- Rear wheel, twin-shock system and brakes
- Engine covers and exposed cooling-adjacent areas
- Genuine 2018 dealership instrument-cluster photograph
- Model-year 2018 exploded parts diagrams with directly linked sources

The *Photo Teardown Studio* defaults to external 2018 example photographs where available; uploading your own photo overrides the example locally. The app **does not fake hidden mechanical components** or assert an unexploded photograph is an exploded assembly.


## Real-photo teardown studio (private vehicle fitment)

[**Open the browser-based Photo Teardown Studio**](photo-teardown.html) — no Blender or WebGL. Choose your own actual-bike photographs for 12 camera angles and four disassembly stages; search 30 components; place genuine-location annotations; inspect source-cautioned service data. Photos stay in the current browser session and are never uploaded to this repository. See [photo and private-fitment controls](docs/PRIVATE-FITMENT-AND-PHOTOS.md).

The studio **does not contain, request, display or transmit a full vehicle identifier**. Exact VIN-specific fitment is pending a separately authorized, privately provisioned server-side parts catalogue integration. Do not put private identifiers in GitHub files, issues or screenshots. The studio cannot derive actual exploded geometry from one assembled photo.

## Version 2.3 — consolidated clean replacement (14 November 2026)

**[▶ Launch browser application](https://jsankr.github.io/TriumphBonnevilleT120/)** · **[Browse all 894 original PDF page references](manual-index.html)** · **[GitHub source](https://github.com/jsankr/TriumphBonnevilleT120)**

This release replaces the earlier repository contents with the newer, tested photo-led T120 dashboard plus the **audited 2016 source-reference database** and a separate **894-page document navigation explorer**. The 230 **active** torque entries exclude 13 inconsistent rows from service-manual page 70; 44 scheduled-maintenance tasks, 37 special tools, and 32 T120 owner-specification records retain source edition/page links. The older 2012 and 2006 documents are included in the page navigator **only as historical material**, not repair specifications for a 2018 T120. The four copyrighted original PDFs are **not redistributed**; use the app's local PDF picker to inspect complete original pages privately.

**No Blender or fabricated 3D motorcycle model.** Since v3.0 every motorcycle image in the app is a real, openly licensed photograph (credited in the v3.1 and v3.0 tables above); none is the owner's motorcycle. The evidence assistant is a local deterministic search, not live AI. The repo is currently private; GitHub Pages requires deployment support and settings to be configured before the browser link is confirmed live.

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

- Dashboard built on a real, openly licensed photograph of a T120 in Cranberry Red / Aluminium Silver, with hotspots and selectable assemblies; **no fake 3D model**, Blender or Three.js dependency.
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
## Selected assembly: torque and tool evidence (v2.6)

The **Torque & tools** tab is now connected to the existing `data/source-reference.json` technical reference database. Every one of the 30 high-level assemblies has an explicit cross-reference. Selecting a motorcycle part displays individual *named fasteners* from the April 2016 T120 service manual, each with a cited page and a **Read original p.X** control. Where relevant, the panel also lists Triumph's special service tool number and purpose. Special-tool numbers are **not** bit or socket dimensions.

**Scope limitation:** These are **2016 T120 service-manual references**, not independently confirmed 2018 India-market specifications. Confirm the applicable workshop revision, production changes, and any aftermarket components before service. A blank tool size stays **NOT VERIFIED** rather than being guessed.

For illustration, the service manual lists front wheel spindle/axle bolt **65 Nm** and fork-to-wheel spindle pinch bolts **23 Nm** (page 69), rear suspension upper/lower mounting bolts **28 Nm** (page 68), and front brake caliper mounting bolts **21 Nm** in the front-wheel installation procedure (page 611). Values are displayed under the matching components, with the 2018 applicability warning. Do not apply the figures to a modified wheel or caliper without applicable confirmation.

The anomalous service-manual page 70 headed “Front Brakes” contains unrelated engine-cover rows. Those rows remain quarantined and are **never** mapped to front brake fasteners. The exact hex/socket sizes of many fasteners are absent from the indexed table and remain unverified.

**To inspect the original evidence:** Use **My PDF library** to load your own 2016 T120 service manual locally, then select a component and click its cited page button. The original copyrighted manuals are not uploaded to GitHub.

### Electrical source links (v3.0)

[Open the Electrical & Fuse Explorer](electrical.html). Every fuse row (9), source drawing (6) and main-harness item (51) now has an active source-page control; the first click prompts you to select your own PDF then opens the requested page privately. All eight electrical spare-part candidates have locally accessible details and optional catalogue references; fork stanchion alternatives remain outside the electrical-only list. The cited service manual is **April 2016**, not independently validated for an individual 2018 motorcycle. See the [electrical link audit](docs/ELECTRICAL-LINK-AUDIT.md). The copyrighted PDF is not hosted in this repository.


## v3.1 — Full app test and OWASP Top 10:2025 audit

- [Full QA and security report](docs/FULL-QA-SECURITY-AUDIT.md) · [Browser app](https://jsankr.github.io/TriumphBonnevilleT120/) · [Exploded view](exploded.html) · [Electrical reference](electrical.html)
- All seven site pages were tested with 90 interaction checks in desktop/mobile Chromium and 166 rendered links; cross-browser native Safari/Firefox and third-party provider access remain unverified.
- Fixed PDF source navigation, mobile selector overflow, DOM markup injection, external URL handling and tab-nabbing exposure. Per-page CSP is enforced where supported.
- New source, link, injection and Chromium browser tests are required before GitHub Pages deployment. External vendor blocks cannot be bypassed; internal parts references remain available.
- No private vehicle identifier is embedded or handled by the static application.
