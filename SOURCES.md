# Source register and applicability

Review date: 14 November 2026. Sources are linked for verification; third-party content is not copied into this repository.

| Ref | Source | What it supports | Applicability / caveat |
|---|---|---|---|
| S1 | [Triumph Owner’s Handbook 3855663-EN issue 1 (Aug 2019)](https://api.triumphtechnicalinformation.com/handbooks/documents/6246e0045b05bf5ce5071ffc/pdf) | T120 family maintenance schedule, chain procedure, selected torque values and specifications | Official Triumph publication; later than model year 2018. Handbook says T120 all models, but confirm market/VIN and any 2018-specific revisions. PDF copyright notice prohibits reproduction without permission. |
| S2 | [Triumph T120 Service Manual, issue 1 (Apr 2016), hosted by iFixit](https://www.ifixit.com/Document/MTKPyTmGPKUElr4I/Triumph-Bonneville-T120-en-01.pdf) | Service-manual chapter index and workshop procedure reference | Third-party hosted copy of Triumph-copyrighted manual; not redistributed. It predates 2018 and must not be assumed to include all 2018 changes. Obtain correct manual/revisions for the VIN. |
| S3 | [2018 Triumph Bonneville T120 parts catalogue](https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles) | 2018 fiche diagrams and candidate part-number lookup | Independent catalogue provider, not Triumph. Confirm exact market, variant, VIN range and supersessions with authorised dealer. |
| S4 | [2018 T120 model parts catalogue (select frame)](https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles) | Cross-check of assembly drawings and candidate part references | Independent provider. Do not treat as a substitute for Triumph EPC/VIN lookup. |
| S5 | [NHTSA Recall 19V-133 acknowledgement](https://static.nhtsa.gov/odi/rcl/2019/RCAK-19V133-9937.pdf) | US recall condition, affected model-year range, consequence and remedy | US campaign. It lists 2016–2019 Bonneville T120/T120 Black; not proof of global-market applicability or an individual bike’s completion status. |
| S6 | [NHTSA Part 573 recall report](https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V133-4691.PDF) | Remedy component and chronology details | US regulatory filing. Part numbers and remedy references must be confirmed for the bike’s market and VIN. |
| S7 | [Triumph/NHTSA Safety Recall Action Notice 560](https://static.nhtsa.gov/odi/rcl/2019/RCMN-19V133-7928.pdf) | VIN ranges in the US/Canada notice and dealer action | North American ranges only; do not apply these ranges to an India-market VIN.

## Torque values currently included
The current torque references are limited to values printed in S1’s T120 family handbook table/procedures: battery terminals 4.5 Nm; chain-adjuster lock nuts 20 Nm; chain guard 9 Nm; clutch-lever nut 3.5 Nm; oil filter 10 Nm; spark plug 12 Nm; sump plug 25 Nm; rear-wheel spindle nut 110 Nm. They are **handbook references, not verified 2018 workshop-manual values**. No value is inferred for front axle, fork pinch, brake caliper, brake disc, steering or structural fasteners.

## Maintenance schedule items
S1’s schedule identifies drive-chain slack check/adjustment as a daily check, wear inspection every 500 miles (800 km), and lubrication every 200 miles (300 km). The handbook says to lubricate after wet riding or whenever the chain appears dry, and to inspect/adjust more frequently under severe conditions. The motorcycle should be stabilised securely before chain inspection/adjustment. Refer to the handbook pages 99 and 110–113 for the complete schedule and procedure.

## Data policy
- `verified-handbook-reference`: directly printed in a cited Triumph handbook, but still check model-year/market/VIN applicability.
- `manual-verification-required`: do not use as a repair specification.
- `catalogue-candidate`: candidate only; verify through Triumph EPC/dealer.
- `price-unverified`: do not present as a live or confirmed retail price.


## User-provided document references (editions audited 14 Nov 2026)

- **T120 Motorcycle Service Manual** — Triumph 04.2016 Issue 1, 728 printed/PDF pages. Indexed torque settings at pp.57–74 (p.70 quarantined misheading), service tool numbers pp.27–33, maintenance pp.84–85. See `docs/SOURCE-AUDIT.md` for records, edition limitations and methodology. Original copyrighted PDF deliberately not committed to repository.
- **Owner's Handbook** — publication 3855577-EN, 11.2016 Issue 1, 162 pages; T120-specific specifications from pp.156–159. Original copyrighted PDF deliberately not committed.
- **Earlier Bonneville/T100 EFI service data sheet**, Issue 9, 12.2012, 3 pages — reference only; **does not govern a 2018 T120**.
- **Older-model scheduled maintenance check sheet**, 2006, 1 page — reference only; **T120 not listed**.
- Source reader instructions: `docs/LOCAL-PDF-READER.md`. Full original pages, figures, tables, warnings and procedures are opened only from the individual owner's selected local PDFs, not scraped/re-hosted.
- **Warning:** 2016 sources do not independently establish 2018 VIN/market/revision applicability or aftermarket Kineo/TEC fitting. Some safety-critical tool sizes remain unknown.


## Added in v3.0
- Photograph, left side: AmenMoto, *2017 Bonneville T120 CSNDCC1*, Wikimedia Commons, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:2017_Bonneville_T120_CSNDCC1.jpg
- Photograph, right-side engine: Bengt Nyman, *Triumph EM1B9077*, Wikimedia Commons, CC BY 2.0. https://commons.wikimedia.org/wiki/File:Triumph_EM1B9077_(49794022932).jpg
- Tool sizes (owner forum): TriumphRat, *T120 front wheel removal* https://www.triumphrat.net/threads/t120-front-wheel-removal.834194/ and *T120 Rear Wheel Removal* https://www.triumphrat.net/threads/t120-rear-wheel-removal.957970/ — recorded from search excerpts; the forum refuses automated re-reading.
- Tool sizes (accessory maker's guide): *How to remove the rear wheel on a Triumph Bonneville T100 / T120*, install guide naming British Customs, read 16 November 2026. https://install-guides.gorgias.help/en-US/how-to-remove-the-rear-wheel-on-a-triumph-bonneville-t100--t120-128461
- Typeface: Archivo, Omnibus-Type, SIL Open Font Licence 1.1 (`assets/fonts/OFL-Archivo.txt`).
- Photograph, right side in Cranberry Red / Aluminium Silver: takenji1989, *Neil with Triumph Bonneville T120*, Flickr, CC BY-NC-SA 2.0. https://www.flickr.com/photos/105592384@N07/51444289036 — background and bystander removed.
