"""Functional smoke checks against the built site in the three Playwright engines."""
import functools
import http.server
import os
import pathlib
import re
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
    "index.html#modules": ".toolbar",
    "index.html#analytics": ".bar",
    "index.html#lookup": ".toolbar",
    "workshop/index.html": "#plannerTabs [aria-selected=true]",
    "workshop/exploded.html": "#inventory [data-callout]",
    "workshop/engine-xray.html": "#xrList button",
    "workshop/manual-index.html": "#manualResults [data-page]",
    "workshop/electrical.html": "#fuses [data-page]",
    "workshop/catalogue.html": "#categoryList .unit",
    "workshop/real-photo-gallery.html": "#photoCards article",
    "workshop/photo-teardown.html": "#partList button",
}
def separate(page, visual, controls):
    overlaps = page.locator(visual).evaluate("""(el, selectors) => {
        const a = el.getBoundingClientRect();
        if (!a.width || !a.height) return ['missing visual'];
        return [...document.querySelectorAll(selectors)].filter(node => {
            const b = node.getBoundingClientRect();
            return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 &&
                   Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
        }).map(e=>e.id || e.className);
    }""", controls)
    assert not overlaps, (visual, overlaps)


def check_engine(page, engine):
    stage = page.locator("#xrStage")
    toggle = page.locator("#xrTreeToggle")
    if toggle.is_visible():
        toggle.click()
        separate(page, "#xrStage", "#xrTree")
    page.locator("#xrList").get_by_role("button", name="Camshaft", exact=True).click()
    expect(page.locator("#xrCaption")).to_have_text("Camshaft")
    expect(page.locator("#xrInsp h2")).to_have_text("Camshaft")
    expect(page.locator("#xrLegend")).to_be_hidden()
    assert page.locator("#xrInsp").evaluate("e=>getComputedStyle(e).backgroundColor") in ("rgba(0, 0, 0, 0)", "transparent")
    separate(page, "#xrStage", "#xrInsp,.xr-toolbar,.xr-head,#xrTree,.xr-caption,#xrFallback")
    page.locator("#xrLbls").click()
    legend = page.locator("#xrLegend")
    legend.get_by_role("button", name="Crankshaft", exact=False).click()
    expect(page.locator("#xrCaption")).to_have_text("Crankshaft")
    separate(page, "#xrStage", "#xrLegend,.xr-toolbar,#xrInsp")
    canvas = stage.locator("canvas")
    if canvas.count():
        canvas.evaluate("el=>el.scrollIntoView({block:'center',behavior:'instant'})")
        targets = canvas.evaluate("""c=>{
            const r=c.getBoundingClientRect();
            return [.15,.5,.85].flatMap(x=>[.15,.5,.85].map(y=>{
                const hit=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);
                return hit===c ? 'canvas' : hit?.tagName;
            }));
        }""")
        assert targets == ['canvas'] * 9, targets
        marker = stage.locator(".xr-number:visible").first
        before = marker.evaluate("el=>el.style.transform")
        box = canvas.bounding_box()
        x, y = box['x']+box['width']/2, box['y']+box['height']/2
        page.mouse.move(x,y)
        page.mouse.down()
        page.mouse.move(x+55,y+18,steps=5)
        page.mouse.up()
        expect(marker).not_to_have_css("transform", "none")
        assert marker.evaluate("el=>el.style.transform") != before, "Orbit drag did not move the projected part"
        expect(page.locator("#xrCaption")).to_have_text("Crankshaft")
        if engine == "chromium" and page.viewport_size["width"] == 402:
            # Two touch contacts spread around the centre, then release together.
            cdp = page.context.new_cdp_session(page)
            cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 2})
            points = lambda dx: [{"x":x-dx,"y":y,"id":1},{"x":x+dx,"y":y,"id":2}]
            initial = marker.evaluate("el=>el.style.transform")
            cdp.send("Input.dispatchTouchEvent", {"type":"touchStart","touchPoints":points(25)})
            for dx in [32,40,50]:
                cdp.send("Input.dispatchTouchEvent", {"type":"touchMove","touchPoints":points(dx)})
            cdp.send("Input.dispatchTouchEvent", {"type":"touchEnd","touchPoints":[]})
            expect(marker).not_to_have_attribute("style",re.compile(re.escape(initial)))
            expect(page.locator("#xrCaption")).to_have_text("Crankshaft")
            cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": False})
            cdp.detach()
            print("Two-finger pinch preserved selection", flush=True)
        print("WebGL canvas, nine hit targets and orbit drag passed", flush=True)
    else:
        assert engine != "chromium", "Chromium's WebGL test requires a renderer"
        expect(page.locator("#xrFallback")).to_be_visible()
        print("WebGL fallback and part selection passed", flush=True)
    page.locator("#xrLbls").click()
    page.locator("#xrLbls").click()
    expect(legend).to_be_hidden()
    expect(page.locator("#xrStage .xr-number:visible")).to_have_count(0)
    page.locator("#xrModeS").click()
    expect(page.locator("#xrModeS")).to_have_attribute("aria-pressed","true")
    page.locator("#xrModeX").click()


def check_viewer(page, path, engine):
    if path == "workshop/engine-xray.html":
        check_engine(page,engine)
    elif path == "index.html":
        page.get_by_role("button",name="Inspect Engine",exact=True).click()
        expect(page.locator(".pin-detail a")).to_contain_text("Open record")
        separate(page,".photo img",".pin-detail,.hero-copy,.hero-foot")
        page.get_by_role("button",name="Inspect Fuel tank",exact=True).click()
        expect(page.locator(".pin-detail a")).to_contain_text("Fuel tank")
        page.get_by_role("button",name="Close part label").click()
    elif path == "workshop/index.html":
        page.locator('.hotspot[data-part="seat"]').click()
        expect(page.locator("#photoPart")).to_contain_text("Seat",ignore_case=True)
        separate(page,"#heroImg","#bikeStage figcaption,#photoPart,.hotspot .tip")
    elif path == "workshop/exploded.html":
        separate(page,"#photo","#stageHint,.stagebar,#credit,#inspector")
        # Overlapping callouts may occur in a dense assembly. Click a visible dot
        # whose centre maps to its own callout, just as a rider would.
        svg = page.locator("#photo")
        svg.evaluate("el=>el.scrollIntoView({block:'center',behavior:'instant'})")
        dots = svg.locator(".pin .dot")
        dots.first.wait_for(state="visible")
        for dot in dots.all():
            if dot.evaluate("""e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.pin')===e.parentNode}"""):
                number=dot.locator("..").get_attribute("data-callout")
                dot.click()
                expect(page.locator("#inventory [aria-current=true]")).to_have_attribute("data-callout",number)
                break
        else:
            raise AssertionError("Every visible diagram marker is obstructed")
    elif path == "workshop/photo-teardown.html":
        page.locator("#photoInput").set_input_files(root/"workshop/assets/photo/t120-cranberry-hero.webp")
        page.locator("#photoImage").evaluate("img=>img.decode()")
        page.locator("#partList button").first.click()
        page.locator("#editHotspot").click()
        photo = page.locator("#photoImage")
        expect(photo).to_be_visible()
        separate(page,"#photoImage","#selectedPart,.photo-footer,#photoEmpty,#editHotspot")
        photo.click()
        pin=page.locator("#markers button")
        expect(pin).to_have_count(1)
        page.locator("#partList button").nth(1).click()
        pin.click()
        expect(page.locator("#partList button").first).to_have_class(re.compile("active"))
    elif path == "workshop/real-photo-gallery.html":
        separate(page,"#photoCards .atlas-img >> nth=0","#photoCards h3,#photoCards small,#photoCards .bench-links")
    elif path == "index.html#analytics":
        page.locator(".bar").first.click()
        expect(page.locator(".task-detail")).to_be_visible()
        separate(page,".bars",".task-detail,.section-head,.service-total")


try:
    with sync_playwright() as pw:
        engine = sys.argv[1]
        browser = getattr(pw, engine).launch(headless=not bool(os.environ.get("DISPLAY")), args=["--use-angle=swiftshader","--enable-unsafe-swiftshader"] if engine=="chromium" else [])
        page = browser.new_page()
        page.route("**/*", lambda route: route.continue_() if route.request.url.startswith((origin+"/","blob:"+origin+"/","data:")) else route.abort())
        errors = []
        page.on("pageerror", lambda e: (errors.append(str(e)), print("Page error:", e, flush=True)))
        page.on("requestfailed", lambda req: print("Local request failed:", req.url, req.failure, flush=True) if req.url.startswith(origin) else None)
        for width,height in [(402,790),(844,390),(768,1024),(1280,840)]:
            page.set_viewport_size({"width": width, "height": height})
            for path, selector in routes.items():
                print(engine, width, path, flush=True)
                page.goto(origin + "/" + path)
                page.locator(selector).first.wait_for(state="attached")
                check_viewer(page,path,engine)
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
        print(f"{engine}: all nine pages and three landing sections at four viewport sizes, selected part and planner workflows passed.")
finally:
    host.shutdown()
