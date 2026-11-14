# Triumph Bonneville T120 (2018) — Workshop Explorer

[![Open browser application](https://img.shields.io/badge/OPEN-WORKSHOP%20APP-198fd0?style=for-the-badge&logo=googlechrome&logoColor=white)](https://jsankr.github.io/TriumphBonnevilleT120/)
[![View actual screenshots](https://img.shields.io/badge/VIEW-BROWSER%20SCREENSHOTS-24455e?style=for-the-badge)](gallery.html)

> **Evidence-first enthusiast companion, not a factory repair manual.** The new app replaces the former blocky 3D motorcycle with a photo-led glass-style dashboard. **No Blender, WebGL, Three.js, external JavaScript packages, or API key is required.**

## [▶ Open the T120 Workshop Explorer in your browser](https://jsankr.github.io/TriumphBonnevilleT120/)

**Browser address:** https://jsankr.github.io/TriumphBonnevilleT120/

**Screenshots:** [View tested desktop, tablet and mobile application screenshots](gallery.html).

The launch link requires GitHub Pages to be enabled and deployed. This repository is currently **private**; GitHub Pages availability for private repositories depends on the owner's GitHub plan. The address is an **expected URL, not a verified live site**. For immediate offline use, download `index.html` and open it locally in Chrome, Firefox or Safari. All app CSS, scripts, component data and motorcycle visual are embedded in that file.

### What the actual app looks like

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| [See real desktop screenshot](gallery.html) | [See 820px tablet screenshot](gallery.html) | [See 390px mobile screenshot](gallery.html) |

These are **real Chromium render captures** from the app, not AI-generated UI mockups. The motorcycle illustration **inside the app** is cropped from a **user-supplied concept dashboard screenshot**: it is a photo-like visual reference, **not an authenticated photo of a particular 2018 T120** and not technical evidence.

## What works in v2.1

- **Photo-led overview:** real browser dashboard styling, supplied reference motorcycle artwork and six approximate clickable part hotspots. This is **2D**, not a rotatable 3D or an exploded mechanical model.
- **30 assembly-level records:** searchable parts catalogue, category filters, component selection and source-labelled details.
- **2018 brake specification:** manufacturer MY18 reference identifies **two front Nissin two-piston floating calipers with twin 310 mm discs**, and **one rear Nissin two-piston floating caliper with a single 255 mm disc**, with ABS. Do not use newer T120 Brembo specifications for 2018.
- **Correct inventory conventions:** two front fork legs and two rear shocks; VIN-dependent alternate part numbers are not additional fitted parts.
- **Tools and torque inspector:** intentionally displays **NOT VERIFIED** for unsupported fastener torque and drive sizes. No guessed axle/fork pinch/caliper values.
- **Handbook torque reference desk:** eight explicitly labelled values from the August 2019 T120-family handbook; *not verified against the particular 2018 market/VIN workshop documentation*.
- **Maintenance checklist:** local browser storage; this is for planning, not a substitute for a 2018 factory maintenance plan.
- **Evidence assistant:** local deterministic source/part search with links. **Not a live LLM or connected AI service.**
- **Recall context:** US NHTSA 19V-133 / Triumph Recall 560 with VIN/market caveats.

## Browser support

Uses built-in HTML, CSS and vanilla JavaScript; no WebGL/Blender/external runtime. Chromium desktop (1500px), tablet-width (820px) and phone-width (390px) tests passed for data loading, hotspot navigation, Nissin search, evidence retrieval and lack of horizontal overflow. **Firefox, Safari and physical-device testing remain outstanding**, so cross-browser support is intended rather than fully certified.

## Run without hosting

Download [`index.html`](index.html) from this repository and open it directly. It is a **single self-contained HTML file**, including the local parts index and all UI assets. An ordinary web server also works:

```sh
python -m http.server 8000
# open http://localhost:8000
```

GitHub Pages, if supported by the repository plan, can publish this same `index.html` by selecting **Settings → Pages → Source: GitHub Actions**. The workflow file is in `.github/workflows/deploy-pages.yml`.

## Factual integrity and legal notes

Technical records are assembly-level reference material. **Unknown** does not mean zero. Never determine socket sizes, tightening sequences, torque values, or VIN fitment from a screenshot, alternative model year or an AI model. Treat Kineo wheels and TEC springs as modifications requiring their own manufacturer references.

For citations and caveats see [SOURCES.md](SOURCES.md), [BRAKE-VERIFICATION.md](BRAKE-VERIFICATION.md), [DATA-NOTES.md](DATA-NOTES.md), [RECALL-560.md](RECALL-560.md), and [VALIDATION-REPORT.md](VALIDATION-REPORT.md). [Official Triumph MY18 range document](https://triumph.euwest01.umbraco.io/media/1615/gamma-bonneville-t100.pdf). [Later owner's handbook](https://api.triumphtechnicalinformation.com/handbooks/documents/6246e0045b05bf5ce5071ffc/pdf).

No copyrighted OEM repair manuals or CAD files are bundled. Triumph is a trademark of its owner; this independent project is unaffiliated with Triumph.

## Planned next

Replace the concept motorcycle artwork with a user-owned **actual photo** of the 2018 bike, add additional photographic angles (with new source-specific hotspots), verify VIN/market factory documentation, and optionally build a secured citation-grounded AI service with credentials stored on a backend.

## Historical v1.2.1

The v1.2.1 ZIP remains available from the earlier ChatGPT project package. It is **not yet included as a GitHub repository asset**; this v2.1 app intentionally replaces its low-detail 3D viewer.
