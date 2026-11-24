# Bonneville Workshop · Heritage Glass

Responsive React workshop for the 2018 Triumph Bonneville T120. Six selectable hotspots on the credited T120 photograph open assembly evidence. The shared search finds tools, assemblies and source-linked torque records. Module pages cover the parts catalogue, service planner, electrical navigator, private manual reader, real-photo atlas, annotation workbench, mapped teardown and illustrative Engine X-ray. The dashboard and teardown retain all three motorcycle profiles.

## Build and open

Use a current supported Node.js release. Run `npm ci`, `npm run build` and `npm test` here. Then run `python3 -m http.server 8080 --directory dist` and open http://localhost:8080/. A prebuilt dist directory can be served by any static HTTPS host, including a GitHub Pages project subpath. No server-side React, backend or external UI CDN is required.

## Maintenance

The React pages and shared styles are under src/. The standalone source package reads the workshop snapshot from archive/. When installed as heritage/ in the upstream repository, the same build reads the maintained site at its parent. build.mjs preserves the source data, images, private document workflows and diagram engines. compile-pages.mjs integrates the original engine work surfaces with React. Use the upstream AGENTS.md and existing source audits when changing any repair data.

The service workload chart counts scheduled tasks by system and interval. The page index is navigation-only. The 2016 service-manual references retain their model-year and market qualifications. The 13 contradictory page-70 rows are excluded from active torque lookup. Prices and fitment must be confirmed with suppliers. Private PDFs stay on the device. Engine X-ray is an illustrative concept model.

## Photography

The cranberry/silver T120 is credited to takenji1989 under CC BY-NC-SA 2.0. The cropped T120 engine detail is credited to Bengt Nyman under CC BY 2.0. Both images link to their source and license in the interface. The engine concept preview is cropped from the project's illustrative Engine X-ray. The original project README, photo map and source notes retain the additional image and data credits.
