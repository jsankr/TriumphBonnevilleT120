"""Browser audit for the air-cooled models (?model=bonneville-a3 and ?model=bonneville-t100-a3).
Serves the site over real HTTP so the address bar, model.js and the data files behave as on GitHub Pages.
For each model and width it opens the dashboard and the teardown, then clicks every assembly and every
callout, and checks that each torque shown carries a named source."""
import json, threading, functools, sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MODELS = [m['id'] for m in json.loads((ROOT / 'data/models.json').read_text())['models'] if m['data']]

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main():
    srv = serve(); base = f'http://127.0.0.1:{srv.server_address[1]}/'
    problems = []; checks = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-gpu'])
        for model in MODELS:
            data = json.loads((ROOT / f'data/models/{model}.json').read_text())
            ops = sum(len(a['operations']) for a in data['assemblies'])
            for w in (1440, 390):
                for page in ('index.html', 'exploded.html'):
                    p = b.new_page(viewport={'width': w, 'height': 900})
                    errs = []
                    p.on('pageerror', lambda e: errs.append(str(e)))
                    p.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
                    p.goto(f'{base}{page}?model={model}'); p.wait_for_timeout(1200)
                    tag = f'{model} {page} {w}'
                    if p.evaluate("document.documentElement.dataset.model") != model: problems.append(tag + ': data-model not set')
                    if page == 'index.html':
                        p.wait_for_selector('.mt-table tbody tr')
                        n = p.locator('.mt-table tbody tr').count(); checks += 1
                        if n != ops: problems.append(f'{tag}: {n} torque rows, expected {ops}')
                        if p.locator('.mt-table tbody .ev').count() != ops: problems.append(tag + ': torque row without source badge')
                        if p.locator('#plannerTabs button').count() != 6: problems.append(tag + ': planner tabs')
                        if p.locator('#heroTitle').inner_text() != data['name']: problems.append(tag + ': hero title')
                        if p.locator('#catalogue').is_visible(): problems.append(tag + ': T120 catalogue visible')
                        if not p.locator('#heroImg').evaluate('i=>i.complete&&i.naturalWidth>0'): problems.append(tag + ': hero image')
                    else:
                        p.wait_for_selector('#assemblies button')
                        for i in range(p.locator('#assemblies button').count()):
                            p.locator('#assemblies button').nth(i).click(); p.wait_for_timeout(120)
                            for k in range(p.locator('#inventory [data-callout], #inventory button').count()):
                                item = p.locator('#inventory [data-callout], #inventory button').nth(k)
                                item.scroll_into_view_if_needed(); item.click(); checks += 1
                                txt = p.locator('#inspector').inner_text()
                                if 'Torque' not in txt or 'Tool' not in txt: problems.append(f'{tag}: inspector incomplete'); break
                                bad = p.locator('#inspector .torque-hero').evaluate_all("hs=>hs.filter(h=>!h.querySelector('a.ev')).length")
                                if bad: problems.append(f'{tag}: torque shown without a source link')
                        if p.locator('#photo .pin').count() == 0 and p.locator('#photo .piece').count() == 0: problems.append(tag + ': photo map empty')
                        outside = p.evaluate('''d=>{const s=document.getElementById('photo');const out=[];
                          for(const pin of d.pins){let inside=false;for(const q of d.placements.filter(q=>q.assembly===pin.assembly&&q.view===pin.view)){
                            const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',q.shape);s.append(path);
                            const pt=s.createSVGPoint();pt.x=pin.x;pt.y=pin.y;if(path.isPointInFill(pt))inside=true;path.remove()}
                            if(!inside)out.push(pin.assembly+'#'+pin.callout)}return out}''', data['map']); checks += 1
                        if outside: problems.append(f'{tag}: markers outside their outline {outside}')
                    if p.evaluate('document.documentElement.scrollWidth > innerWidth + 2'): problems.append(tag + ': horizontal overflow')
                    problems += [f'{tag}: {e[:160]}' for e in errs]
                    p.close()
        # The switch keeps the choice and returns to the T120
        p = b.new_page(); p.goto(base + 'index.html?model=bonneville-a3'); p.wait_for_timeout(600)
        p.locator('#modelSwitch [data-model="t120-2018"]').click(); p.wait_for_load_state(); p.wait_for_timeout(600)
        if p.evaluate("document.documentElement.dataset.model") != 't120-2018' or 'model=' in p.url: problems.append('switch back to T120 failed')
        b.close()
    srv.shutdown()
    print(f'Model browser audit: {len(MODELS)} models, {checks} checks, {len(problems)} problems')
    for x in problems[:40]: print(' PROBLEM', x)
    if problems: sys.exit(1)

main()
