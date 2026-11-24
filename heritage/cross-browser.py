"""Functional smoke checks against the built site in the three Playwright engines."""
import functools
import http.server
import pathlib
import sys
import threading
from playwright.sync_api import sync_playwright, expect

root = pathlib.Path(__file__).resolve().parent / "dist"
class QuietHost(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

host = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHost, directory=str(root)))
threading.Thread(target=host.serve_forever, daemon=True).start()
origin = f"http://127.0.0.1:{host.server_port}"
routes = {
    "index.html": ".hero img",
    "workshop/index.html": "#plannerTabs [aria-selected=true]",
    "workshop/exploded.html": "#inventory [data-callout]",
    "workshop/engine-xray.html": "#xrList button",
    "workshop/manual-index.html": "#manualResults [data-page]",
    "workshop/electrical.html": "#fuses [data-page]",
    "workshop/catalogue.html": "#categoryList .unit",
    "workshop/real-photo-gallery.html": "#photoCards article",
    "workshop/photo-teardown.html": "#partList button",
}
try:
    with sync_playwright() as pw:
        engine = sys.argv[1]
        browser = getattr(pw, engine).launch()
        page = browser.new_page()
        page.route("**/*", lambda route: route.continue_() if route.request.url.startswith(origin) else route.abort())
        errors = []
        page.on("pageerror", lambda e: (errors.append(str(e)), print("Page error:", e, flush=True)))
        page.on("requestfailed", lambda req: print("Local request failed:", req.url, req.failure, flush=True) if req.url.startswith(origin) else None)
        for width in [390, 768, 1280]:
            page.set_viewport_size({"width": width, "height": 840})
            for path, selector in routes.items():
                print(engine, width, path, flush=True)
                page.goto(origin + "/" + path)
                page.locator(selector).first.wait_for(state="attached")
                assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), (engine, width, path)
        page.goto(origin + "/workshop/catalogue.html")
        page.get_by_role("button", name="Part numbers").click()
        page.get_by_role("searchbox").fill("T2041363")
        page.get_by_role("link", name="Inspect in teardown").click()
        expect(page.locator("#inventory [aria-current=true]")).to_contain_text("T2041363")
        page.goto(origin + "/workshop/index.html?model=t120-2018&interval=annual#servicePlanner")
        expect(page.locator("#plannerTabs [aria-selected=true]")).to_contain_text("Annual")
        page.get_by_role("button", name="Service matrix").click()
        expect(page.locator("#plannerMatrix")).to_be_visible()
        assert not errors, errors
        browser.close()
        print(f"{engine}: all nine pages at three widths, selected part and planner workflows passed.")
finally:
    host.shutdown()
