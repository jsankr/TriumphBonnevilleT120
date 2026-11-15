# Link audit: Triumph Bonneville T120 explorer v2.8

The user reported access denied when opening third-party OEM supplier pages. Eight exploded-view source buttons used oem-bike-parts.cz/.pl/.hr mirrors. Those destinations are **not used in the updated application**.

## Alternatives

- 2018 model parts catalogue (choose the matching assembly): https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles
- Authorized Triumph dealer 2018 Bonneville catalogue (select T120): https://www.triumphestore.com/catalog/triumph/bonneville/2018
- The application's own indexed callouts, part-number candidates, torque sources and special-tool records work without an external parts provider.
- Manufacturer-hosted MY18 brochure replaced an older timed-out host.

## Tests and limits

A local automated check examined 38 internal links, five fragments and 118 external URL references for syntax and blocked domains. Chromium desktop and 390-pixel mobile interactions passed for assembly changes, fallback source buttons and local callouts. CI validates internal links and absence of blocked clickable destinations on future pushes. **External HTTP availability for every user and country cannot be guaranteed**: third-party sites may block requests, and the execution environment could not independently retrieve all external targets. External photograph URLs may also change. No copyrighted OEM drawings or confidential vehicle identification details are embedded in the repository.
