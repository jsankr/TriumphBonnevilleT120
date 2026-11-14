# Technical source audit — 2018 T120 Workshop Explorer

**Revision:** 2026-11-14. **Status:** extraction complete for the defined structured datasets; original PDF full-page access is implemented by user-selected, local, private PDFs. This is not a declaration that every instruction, drawing, special condition, measurement, serial-number change or superseding factory notice has been independently verified for a 2018 motorcycle.

## Uploaded evidence and applicability

| Source key | Manufacturer document | Publication / edition | Pages | Use in app |
|---|---|---|---:|---|
| `service2016` | Bonneville T120 Motorcycle Service Manual | © Triumph 04.2016 Issue 1 | 728 | 230 active torque table entries, 44 scheduled tasks, 37 special service tools; all linked to original printed PDF page |
| `owner2016` | Owner's Handbook, includes Bonneville T120, publication 3855577-EN | © Triumph 11.2016 Issue 1 | 162 | 32 T120-column specifications, with pages 156–159; owner handbook contents preserved through local PDF viewer |
| `sheet2012` | Service Data Sheet: Bonneville and T100 with EFI | Issue 9, 12.2012 | 3 | **Historical only. NOT a T120 technical specification.** Can still be browsed privately. |
| `checklist2006` | Scheduled Maintenance Check Sheet: Thruxton, Bonneville, T100, America, Speedmaster, Scrambler | 2006 | 1 | **Historical only. Does not list Bonneville T120.** Can still be browsed privately. |

## Counts and exact source locations

- Service-manual torque wrench settings are on printed/PDF pages **57–74**, indexed in `data/source-reference.json`. The published structured data includes **230 searchable active rows**. All have application name, value (or procedure-specific `*`), section, source page, qualifying notes and tool-size status. Special-value rows retain an unknown numerical torque and point back to the procedure.
- **13 entries** printed on page **70** are quarantined: the heading reads *Front Brakes*, but the row descriptions refer to clutch/alternator covers and the sump. The app never attributes those values to front brake calipers. Confirm front brake procedures in chapter **22: Brakes, pages 513–600**, not by guessing from this mislabelled table.
- The routine maintenance tables at service-manual pages **84–85** yielded **44 tasks**, retaining their explicit first-service/annual/16k/32k/48k/64k kilometer schedule flags or the source's exact time/frequency qualifier; display is for the 2016 T120 edition.
- The T120 column in the owner's handbook on pages **156–159** yielded **32 specifications**. The 2016 handbook covers several models; do not copy an adjacent Street Twin/T100/Thruxton figure to the T120.
- Special service tools shown on service-manual pages **27–33** yielded **37 tool-number and description pairs**. These tools are *not* automatically mapped to individual fastener socket sizes.
- The full service manual is navigable by 26 chapter ranges, covering **all 728 pages**. The owner handbook is navigable by 14 ranges, covering **all 162 pages**. The 3-page 2012 sheet and 1-page 2006 checklist can be viewed in full, marked inapplicable to T120.

## Selected 2016 manufacturer data — **not independently 2018-VIN verified**

| Item | 2016 reference | Page | Notes |
|---|---:|---:|---|
| Front wheel spindle/axle bolt | **65 Nm** | SM p69 | Verify exact service procedure, 2018 VIN and actual wheel configuration |
| Fork to wheel spindle pinch bolts | **23 Nm** | SM p69 | Not the same fastener as upper/lower yoke pinch bolts |
| Rear suspension unit upper mounting bolt | **28 Nm** | SM p68 | Applies to 2016 factory rear suspension reference |
| Rear suspension unit lower mounting bolt | **28 Nm** | SM p68 | Applies to 2016 factory rear suspension reference |
| Rear wheel spindle lock nut | **110 Nm** | SM p69 | Verify aftermarket wheel compatibility |
| Brake caliper to carrier (rear) | **40 Nm** | SM p71 | Do not transfer to front brake caliper mounting |
| Rear brake disc to wheel | **22 Nm** | SM p71 | Notes specify replacement fixings if disturbed |
| Front cold tyre pressure | **2.2 bar / 32 psi** | OH p158 | Factory tyre fitment must be checked |
| Rear cold tyre pressure | **2.5 bar / 36 psi** | OH p158 | Factory tyre fitment must be checked |
| Brake fluid renewal | **every 2 years** | SM p85 | Service schedule, not a torque |
| Engine coolant renewal | **every 3 years** | SM p84 | Service schedule, not a torque |

**A source value alone is not proof that it is the correct setting for a modified or differently revised 2018 India-market motorcycle.** Please check VIN and Triumph service bulletins. A separate Nissin MY18 manufacturer brochure supports the base factory brake model; tool-size and fastener-level parts cannot be inferred from any marketing render.

## All-content access without unauthorized redistribution

The files themselves are copyrighted Triumph works. The April 2016 service manual explicitly forbids storing or reproducing the document without Triumph's written permission; the November 2016 owner handbook also restricts reproduction. As a result, **the PDFs and page images are not committed to GitHub**. This restriction is not an extraction failure.

Instead the application provides an **on-device PDF reader**:

1. Open the app's **My PDF library** tab and select your own exact original PDFs against the labelled document rows.
2. Open **any page** in each original PDF, including every original table, diagram, footnote and step in its native layout. The original content is not abridged.
3. When online, the optional Mozilla PDF.js text layer can search through all loaded pages locally. PDFs never leave the browser; only a CDN request for the PDF.js library is made. PDF viewing remains possible even if the CDN is unavailable.
4. Uploaded copies are not automatically saved to the browser or sent to GitHub. Re-select after refreshing.

The **structured, searchable fact database is not a full reproduction of copyrighted text or drawings**. It contains bibliographic references, short factual field names and values for active troubleshooting. Unstructured narrative instructions, visual diagrams, charts and warnings are available from the original locally loaded PDFs.

## QA and identified blockers

- [x] Source metadata and PDF page counts verified from uploaded files.
- [x] Torque tables parsed from actual PDF table cell geometry rather than guessing from running text; 2016 pages 57–74.
- [x] 2016 page 70 incorrect-heading discrepancy isolated.
- [x] 2006 and 2012 earlier-model documents marked excluded from T120 data.
- [x] Two factory front fork legs and two rear shock units remain distinct in component records.
- [x] MY18 Nissin factory brake arrangement retained; not overwritten by newer Brembo specifications.
- [ ] Complete engineering QA of every 728-page procedure against a **2018 VIN/market-specific** revised workshop manual.
- [ ] Verified OEM parts-number crosswalk, exact service-bit sizes, VIN breaks, aftermarket wheel/TEC spring differences.
- [ ] Full desktop and iPhone/Android Firefox/Safari tests of the on-device PDF.js text-search capability.
- [ ] Permission to republish copyrighted original PDF content (not included).

## Data-integrity rules for future code and agents

Do not guess bolt size from an illustration or torque from an adjacent model/year. Do not present a 2012 sheet as a 2018 T120 source. Keep source year, document ID and page visible in every result. If source is ambiguous or contradictory, show a discrepancy note and direct users to the actual service-manual page. The local evidence assistant is deterministic search, **not** a live LLM. Never claim AI reviewed pages that were not actually loaded.
