# T120 Workshop Explorer (2018)

An independent, responsive workshop companion for the 2018 Triumph Bonneville T120. It combines a schematic interactive 3D orientation model, a component index, a maintenance checklist and links to technical references.

> **Important:** This is an enthusiast reference tool, not a Triumph publication. It is not a substitute for the exact 2018 T120 factory workshop manual, VIN-specific parts catalogue or an authorised Triumph technician. Do not use it as the sole source for repairs.

## Run locally
Serve this folder over HTTP (ES modules and `parts.json` are fetched at runtime):

```bash
python -m http.server 8000
```

Open <http://localhost:8000>.

## GitHub Pages deployment
1. Upload the contents of this folder to the repository root (not the ZIP file).
2. Push to the default branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for the Pages deployment to complete, then test the published URL on desktop and mobile.

No build step or backend is required. Three.js is loaded from jsDelivr and fonts from Google Fonts, so those resources require internet access.

## Features
- Interactive Three.js schematic model with orbit, zoom and camera presets.
- Progressive component separation slider.
- Clickable/searchable component index and inspector.
- Function, maintenance notes, interval, torque-reference status, tool notes, part-number status and price status.
- Local-browser maintenance checklist.
- Safety Recall 560 / NHTSA 19V-133 information panel.
- Responsive layout for phones, tablets and desktop.

## Model and technical-data accuracy
**The 3D scene is illustrative geometry generated in the browser. It is not an OEM CAD model, a measured engineering model or a photogrammetric scan.** It must not be used to infer dimensions, clearances, fitment, assembly order or repair procedures.

Torque values are selectively reproduced from Triumph Owner’s Handbook publication **3855663-EN issue 1 (August 2019)**, which covers the Bonneville T120 family. This is a later handbook edition, not a 2018 workshop manual. The data records now carry explicit provenance status; values remain handbook references and require confirmation against the correct 2018 market/VIN documentation before use. Front axle, front fork pinch, brake caliper, brake disc, steering and structural fasteners remain unverified in this project.

The 2016 T120 Service Manual link in the reference library is a third-party hosted copy of a Triumph-copyrighted document. It is linked for reference only and is not bundled or redistributed here. Confirm model-year applicability and later technical updates with Triumph.

OEM part numbers and India prices are not fabricated. Catalogue providers are independent and their entries may be variant-, market- and VIN-range-specific. Confirm all orders against the motorcycle VIN with an authorised Triumph dealer. Prices require a dated supplier/dealer quote and GST/availability confirmation.

## Safety Recall 560
NHTSA campaign **19V-133 / Triumph SRAN560** identifies certain 2016–2019 Bonneville T120/T120 Black motorcycles in the United States. The reported condition involves the clutch cable contacting the main harness cover and damaging wiring; the remedy was an updated securing guide. This is **not proof that every 2018 T120 in every market is affected**. Ask Triumph India/an authorised dealer to check the exact VIN and recall/service-campaign completion status. See [`RECALL-560.md`](RECALL-560.md).

## Data files
- `parts.json` — component records, including torque evidence status.
- `SOURCES.md` — source register, scope and applicability notes.
- `RECALL-560.md` — recall summary and market/VIN caveats.
- `DATA-NOTES.md` — verified, provisional and unknown data.
- `index.html`, `app.js`, `styles.css` — application interface and behaviour.

## Licensing and trademarks
This is an independent community project. Triumph, Bonneville and T120 are trademarks of their respective owner; no affiliation or endorsement is implied. Triumph handbook/service-manual content is copyrighted and is not reproduced in full. The 3D geometry and UI are original illustrative work. Add a project licence only after reviewing all assets and dependencies; do not claim a licence over third-party copyrighted materials.
