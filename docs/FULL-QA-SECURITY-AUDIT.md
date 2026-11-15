# Full application QA, link integrity and OWASP security review

**Audit date:** 15 November 2026  
**Scope:** T120 Workshop Explorer, browser-only static GitHub Pages application.  
**Framework:** [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/).  
**Classification:** This is a tested source/static-browser review, **not** a third-party penetration-test certification or a guarantee that every remote seller is reachable.

## Pages and modules covered

| Page | Modules checked |
|---|---|
| `index.html` | Main navigation, model/part cards, 30-part search/filter, interactive image hotspots, inspector tabs, 2016 torque evidence, maintenance checkboxes, local evidence assistant, manual tabs, local PDF entry points |
| `exploded.html` | Eight assembly groups, numbered part callouts, source catalogue fallback, multi-view tabs, separation slider, part search, related torque operations, special-tool records |
| `catalogue.html` | Category search, 2018 source index, internal teardown navigation, malformed category data, injection-safe rendering |
| `electrical.html` | Nine fuses, source page links, six source drawing entries, 51 harness references, eight electrical part candidates, local PDF chooser and selected-page navigation |
| `real-photo-gallery.html` | Image fallback, search/categories, photo and fiche filters, publisher links, local fallback links, unsafe-URL filtering |
| `photo-teardown.html` | Angle/stage selectors, part search, actual local image upload, marker editor, exported marker JSON, evidence torque search, raster-only photos |
| `manual-index.html` | Four-document index, indexed page search, torque/tool/maintenance tabs, pagination, local PDF chooser and page-opening link |

### Local test results

- **7 pages × 2 viewport widths = 14 browser runs**, on Chromium using **1440px** and **390px** widths.
- **90 defined module interaction checks passed** after fixes; no uncaught JavaScript exceptions and no horizontal overflow in these test scenarios.
- **166 rendered links evaluated** for internal destinations, unsafe schemes, and `target=_blank` tab-nabbing protection. No failures in the tested rendered DOM.
- Static URL/CSP test: **48 internal resources, 8 same-page fragment links, 16 external static link references, 161 DOM element IDs and two inline JS hashes** all passed structure/hash checks. Counts overlap with the rendered-link set and should not be added together.
- **Two malicious test data payloads** (HTML image/event injection and an unsafe JS link) did not execute and were not rendered as executable HTML. Security tests also verified local PDF source page continuity.
- Original technical evidence/data validators were rerun, including **30 assembly IDs, 171 parts-catalogue entries, 230 active 2016 torque references, 13 quarantined rows, 44 maintenance entries, 37 special-tool entries and nine fuse references**.
- Native Firefox and WebKit/Safari browser engines are **not installed in the test environment**; physical devices, keyboard-only accessibility, screen-reader behavior and network-specific external-provider availability are **not certified**.
- A full server-side vulnerability scan is not applicable to this repository because **no server-side application, identity database or live AI backend is deployed**. The hosting platform's configuration still matters.

**Tests in CI:** `node tests/validate-security-and-routes.mjs`, the existing data/source/link validators, `python tests/browser_audit.py`, `python tests/security_browser_audit.py`. GitHub Actions installs a pinned Python Playwright version and runs Chromium checks **before deployment**; a failed smoke test blocks that workflow's deployment job. GitHub Pages hosting enablement and Action run success must be observed separately.

## Confirmed defects and remediations

| Finding | Risk or consequence | Remediation |
|---|---|---|
| Mobile dashboard PDF selectors exceeded viewport width | Horizontal scrolling and obscured controls | Contained selectors in responsive CSS |
| Catalogue categories inserted from JSON as incomplete HTML-escaped text | DOM-based injection if curated JSON ever becomes untrusted | Replaced markup concatenation with `createElement` and `textContent`, plus fetch failure fallback |
| Reference atlas image used inline `onerror` and DOM HTML insertion | Fragile CSP compatibility and injection surface | Removed inline event handlers; created DOM error notices with `textContent` |
| Unvalidated external catalogue links in parts/photo views | `javascript:`-style URL handling if source JSON were compromised | HTTPS-only URL parser; app-internal fallback for unsupported/blocked providers |
| Numeric torque/page and fuse fields inserted as unsanitized HTML | Stored-data-to-DOM injection surface | Escaped or normalized individual values before insertion |
| PDF source link did not open document picker when document absent | User-visible broken workflow | Source actions open local chooser; selected page follows after selection where supported, otherwise a visible source-page link is provided |
| PDF uploads accepted unlimited size; photo picker allowed SVG | Client-side resource exhaustion / avoidable active-content input | 75 MB PDF cap, `%PDF-` signature check, 18 MB photo cap, raster media allowlist. *Signature checks do not make arbitrary PDFs safe.* |
| Static pages lacked a defensive Content Security Policy | Extra cross-site scripting and third-party script risk | Added CSP meta with script hashes, `object-src 'none'`, own-origin restrictions; no arbitrary inline JS execution |
| HTML pages omitted strict referrer policy and two external-tab links lacked `noopener` | Navigation-origin information disclosure / tab-nabbing risk | Added no-referrer meta and `rel="noopener noreferrer"` |
| GitHub Actions granted deployment privileges to validation job | Unnecessary token privilege | Scoped validation/browser jobs to read-only contents; Pages write and OIDC restricted to deployment job |
| Existing checks validated syntax, not real control interactions | Regressions could reach Pages | Added Chromium desktop/mobile browser flows and negative security tests to CI |

## OWASP Top 10:2025 control-by-control assessment

| Category | Scope and present controls | Residual risk |
|---|---|---|
| **A01 Broken Access Control** | Public static site has no user account/admin/API routes. GitHub publication rights remain controlled by GitHub. | Repository collaborator and branch-protection access must be reviewed in GitHub; not testable through public website. |
| **A02 Security Misconfiguration** | Per-page CSP meta, no-referrer meta, HTTPS local assets; `object-src 'none'`, no remote iframes. | GitHub Pages does not let this app set response-header-only controls such as `frame-ancestors`, HSTS or `Permissions-Policy` through static HTML. A custom CDN/proxy would be needed. Inline styles remain permitted by CSP. |
| **A03 Software Supply Chain Failures** | No runtime npm package installed by the user-facing static app; code and curated data checked in GitHub; PDF.js version is explicitly fixed. CI tests check unsafe link schemes. | PDF.js is loaded on demand from an external CDN without an enforced SRI hash; GitHub Actions use major-version tags rather than immutable SHAs. Pinning/bundling these dependencies and branch protections are future hardening. |
| **A04 Cryptographic Failures** | GitHub Pages uses HTTPS and no passwords, private vehicle identifiers or API tokens are stored client-side by the project. | Hosting TLS choices are managed by GitHub; no user-data storage encryption service is implemented. Browser object URLs are kept local while page remains open. |
| **A05 Injection** | DOM-facing text uses `textContent` or escaping; numeric values encoded; `javascript:` destinations rejected; CSP disallows arbitrary inline scripts. Negative tests passed. | Security testing is not exhaustive against all future code changes, browser implementation issues or malicious files; repeat tests on every revision. |
| **A06 Insecure Design** | No invented service specs, provenance flags and model-year warnings; local app works without third-party provider. | Original OEM diagrams and VIN-specific matching remain unverified and external providers may block access. The 2016 source is not automatically valid for a 2018 motorcycle. |
| **A07 Authentication Failures** | The client app has no sign-in, privileged API or user credential mechanism. | Any future live AI or paid parts integration requires a separate threat model, authentication and rate limiting. |
| **A08 Software or Data Integrity Failures** | GitHub-hosted source control, JSON/schema tests, CSP, source provenance and CI deployment gates. | The curated catalogue is only as correct as its original sources; manufacturer supersessions and supplier edits still require review. Protect `main`, review PRs and use immutable Action SHAs. |
| **A09 Security Logging & Alerting Failures** | Public static UI avoids telemetry and does not record queries or uploaded PDF contents. GitHub Actions provide build/deployment logs. | There is no server security event collection or alerting because there is no hosted backend. Hosting-level monitoring is managed separately. |
| **A10 Mishandling of Exceptional Conditions** | Data-loading fallbacks, missing-source handling, invalid file selection, unavailable images, empty searches and rejected bad schemes covered. | Third-party CDN/network failures and physical-device-specific PDF viewers can still vary. |

## External URL status — important limits

External catalogue, photo and reference sites are **not part of this repository**. Internal links were checked directly; **external URLs cannot be guaranteed to open on the user's network**, even if search or a crawler can access them. A third-party HTTP 403/anti-bot block is not repairable by changing JavaScript in a GitHub Pages website. The app must always provide useful internal navigation without that provider.

- **Source available to web retrieval at audit time:** manufacturer-hosted MY18 brochure PDF, later Triumph handbook PDF (explicitly 2019, **not a 2018 workshop manual**), NHTSA recall PDF, bike-parts-triumph electrical catalogue. User access may differ.
- **Not independently fetched at audit time:** motorcyclespareparts.eu 2018 T120 catalogue and triumphestore 2018 catalogue (web cache misses, **not evidence of 404**). These links are labelled external and backed by working in-app catalogue/parts navigation.
- **Known unreliable:** oem-bike-parts country mirror sites returned an access-blocked screen to the user; the application already avoids automatically embedding or depending on those mirrors.
- **External images:** suppliers may hotlink-block images; show publisher links and a local fallback notice instead of presenting a broken figure as an OEM view.
- **Full live GitHub Pages URL availability, third-party HTTP status from India, Firefox/Safari runtime and any backend penetration testing remain unverified here.**

## Running the audit locally

```bash
# Node 22+
node tests/validate-security-and-routes.mjs
for file in tests/validate-*.mjs; do node "$file"; done

# Browser tests require Python 3.13+, Playwright 1.57, and Chromium:
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/browser_audit.py
python tests/security_browser_audit.py
```

Browser smoke tests load all local code in an instrumented Chromium page and stub the same-origin JSON fetches. This isolates application behavior from test-environment network restrictions; it **does not** independently test the GitHub Pages CDN, live seller response, or a physical iPhone.

## Privacy and safety

The audit used a **generic VIN-shaped-secret pattern** to test the publishable code, without storing, printing or searching a private vehicle identifier. Uploaded owner/service PDFs are not redistributed or transmitted by the private-PDF workflow. Maintenance values remain source-scoped: neither 2016 T120 service-manual values nor supplier catalogue candidates establish exact 2018/market/modified-bike fitment.
