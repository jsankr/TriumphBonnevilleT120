"""Chromium audit for engine-xray.html, served over HTTP with its real CSP (ES modules need a server).
Checks: loads without errors, WebGL draws, every data part has geometry, labels select parts,
explode is reversible, modes toggle, and the toolbar fits a phone screen."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import http.server, functools, threading, json, os, sys

ROOT = Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=str(ROOT))
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{server.server_address[1]}/engine-xray.html'
DATA = json.loads((ROOT / 'data/engine-xray.json').read_text('utf8'))
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
failures = []

def check(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg, flush=True)
    if not cond: failures.append(msg)

def wait_ready(page):
    for _ in range(120):  # CSP blocks eval-based wait_for_function polling, so poll explicitly
        if page.evaluate('!!(window.__engineXray && (window.__engineXray.ready || window.__engineXray.error))'): return
        page.wait_for_timeout(250)
    raise TimeoutError('engine-xray never became ready')

with sync_playwright() as p:
    kw = {'args': ARGS}
    if os.environ.get('CHROME_PATH'): kw['executable_path'] = os.environ['CHROME_PATH']
    browser = p.chromium.launch(**kw)
    for width, height, scheme in [(1440, 900, 'dark'), (1440, 900, 'light'), (390, 844, 'dark')]:
        tag = f'{width}px {scheme}'
        ctx = browser.new_context(viewport={'width': width, 'height': height}, color_scheme=scheme)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL); wait_ready(page)
        info = page.evaluate('({ready:__engineXray.ready, err:__engineXray.error, n:__engineXray.partCount, d:__engineXray.dataCount, gl:__engineXray.webgl})')
        check(info['ready'] and not info['err'], f'{tag}: page ready ({info["err"]})')
        check(info['n'] == info['d'] == len(DATA['parts']), f'{tag}: geometry for all {len(DATA["parts"])} parts (built {info["n"]})')
        check(page.locator('#xrBadge').inner_text().find('not Triumph CAD') >= 0, f'{tag}: concept badge visible')
        if not info['gl']:
            check(page.locator('#xrFallback').is_visible(), f'{tag}: WebGL fallback message shown')
            failures.append(f'{tag}: WebGL unavailable in this runner'); ctx.close(); continue
        page.wait_for_timeout(600)
        png = page.locator('#xrStage canvas').screenshot()
        check(len(png) > 20000, f'{tag}: canvas has drawn content ({len(png)} bytes)')
        if width > 900:
            page.locator('.xr-lbl', has_text='Crankshaft').first.click()
            check(page.locator('#xrInsp h2').inner_text() == 'Crankshaft', f'{tag}: label click opens inspector')
            check(page.locator('.xr-cites li').count() >= 1, f'{tag}: inspector lists sources')
            page.locator('#xrList .nm', has_text='Balancer shafts').click()
            check(page.locator('#xrInsp h2').inner_text() == 'Balancer shafts', f'{tag}: parts list selects')
        page.eval_on_selector('#xrEx', "e => { e.value = 100; e.dispatchEvent(new Event('input')) }")
        moved = page.evaluate("__engineXray.partRootPosition('head')")
        check(moved[1] > 0.1, f'{tag}: explode moves the head up')
        page.click('#xrReset'); page.wait_for_timeout(100)
        back = [page.evaluate(f"__engineXray.partRootPosition('{p['id']}')") for p in DATA['parts']]
        check(all(abs(v) < 1e-9 for pos in back for v in pos), f'{tag}: reset restores every part exactly')
        page.click('#xrModeS'); check(page.get_attribute('#xrModeS', 'aria-pressed') == 'true', f'{tag}: solid mode')
        page.click('#xrModeX'); check(page.get_attribute('#xrModeX', 'aria-pressed') == 'true', f'{tag}: x-ray mode')
        box = page.locator('.xr-toolbar').bounding_box()
        check(box['x'] >= 0 and box['x'] + box['width'] <= width + 1, f'{tag}: toolbar fits the viewport')
        check(not errors, f'{tag}: no console/page errors {errors[:3]}')
        ctx.close()
    browser.close()
server.shutdown()
if failures:
    print('Engine X-ray browser audit FAILED:', *failures, sep='\n - '); sys.exit(1)
print('Engine X-ray browser audit PASS')
