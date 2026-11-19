"""Fail CI if a Node.js runtime used by the pipeline predates the fix for CVE-2026-111497
("Node2Shell" / "HTTP2Shell", Brotli out-of-bounds write).

Fixed releases: Node.js 22.23.4, 24.22.1, 26.12.1 (Node.js security release, 21 October 2026).
Release lines 20, 23 and 25 are end of life and get no fix, so they fail too.

  --system-node      check `node` on PATH (the runtime the validate job uses)
  --playwright-node  check the Node.js copy bundled inside the Playwright driver
"""
import os, re, subprocess, sys

FIXED = {22: (22, 23, 4), 24: (24, 22, 1), 26: (26, 12, 1)}
NEWEST_FIXED_LINE = max(FIXED)

def verdict(label, text):
    m = re.search(r'v?(\d+)\.(\d+)\.(\d+)', text or '')
    if not m:
        return False, f'{label}: could not read a version from {text!r}'
    v = tuple(int(x) for x in m.groups())
    shown = '.'.join(map(str, v))
    if v[0] in FIXED:
        ok = v >= FIXED[v[0]]
        need = '.'.join(map(str, FIXED[v[0]]))
        return ok, f'{label}: Node.js {shown} ({"patched" if ok else "VULNERABLE, needs >= " + need}) for CVE-2026-111497'
    if v[0] > NEWEST_FIXED_LINE:
        return True, f'{label}: Node.js {shown} (newer release line than the CVE-2026-111497 fixes)'
    return False, f'{label}: Node.js {shown} is on an end-of-life line with no CVE-2026-111497 fix'

def system_node():
    return subprocess.run(['node', '--version'], capture_output=True, text=True, check=True).stdout.strip()

def playwright_node():
    import playwright
    base = os.path.join(os.path.dirname(playwright.__file__), 'driver')
    exe = os.path.join(base, 'node.exe' if os.name == 'nt' else 'node')
    return subprocess.run([exe, '--version'], capture_output=True, text=True, check=True).stdout.strip()

def main(argv):
    checks = []
    if '--system-node' in argv: checks.append(('system node', system_node))
    if '--playwright-node' in argv: checks.append(('Playwright driver node', playwright_node))
    if not checks:
        print(__doc__); return 2
    failed = False
    for label, get in checks:
        ok, msg = verdict(label, get())
        print(('PASS ' if ok else 'FAIL ') + msg)
        failed |= not ok
    return 1 if failed else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
