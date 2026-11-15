from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
FILES = {p.relative_to(ROOT).as_posix():p.read_text('utf8') for p in ROOT.rglob('*') if p.is_file() and p.suffix in ['.html','.js','.json','.css']}
DATA={k:json.loads(v) for k,v in FILES.items() if k.endswith('.json')}
PAGES=['index.html','exploded.html','catalogue.html','electrical.html','real-photo-gallery.html','photo-teardown.html','manual-index.html']

results=[]
def load(browser,name,width=1440):
 page=browser.new_page(viewport={'width':width,'height':900 if width>600 else 840},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 soup=BeautifulSoup(FILES[name],'html.parser')
 for meta in list(soup.select('meta[http-equiv="Content-Security-Policy"]')):meta.decompose()
 # remove scripts temporarily but preserve original evaluation order
 scripts=[]
 for e in list(soup.select('script')):
  scripts.append(('src',e.get('src')) if e.get('src') else ('inline',e.text))
  e.decompose()
 for link in list(soup.select('link[rel=stylesheet]')):
  href=link.get('href')
  if href in FILES:
   tag=soup.new_tag('style');tag.string=FILES[href];link.replace_with(tag)
 page.set_content(str(soup),wait_until='domcontentloaded',timeout=15000)
 page.set_default_timeout(1300)
 page.evaluate("document.addEventListener('click', e => {const a=e.target.closest('a');if(a)e.preventDefault()},true)")
 page.evaluate('''data => {window.__fetchCalls=[];window.fetch = async (input) => {
  const u=String(input);window.__fetchCalls.push(u);let key=u.replace(/^\\.\\//,'').split('?')[0];
  if (key in data)return {ok:true,status:200,json:async()=>data[key]};
  throw new Error('Request not provided in test harness: '+key);
 }}''',DATA)
 # bootstrap copilot module
 for typ,src in scripts:
  if typ=='src':
   if src in FILES:
    js=FILES[src]
    if src=='app.js':
     dep=FILES['copilot.js'].replace('export function answerEvidenceQuery','function answerEvidenceQuery')
     dep+='\n'+FILES['component-evidence.js'].replace('export const ', 'const ').replace('export function ', 'function ')
     js=dep+'\n'+\
       js.replace("import {answerEvidenceQuery} from './copilot.js';",'').replace("import {renderComponentEvidence, relatedComponentEvidence} from './component-evidence.js';",'')
    page.add_script_tag(content='(function(){\n'+js+'\n})();')
   else:errors.append('script source does not exist '+str(src))
  else:
   if src.strip() and 'application/json' not in (src[:80]):
    page.add_script_tag(content=src)
 page.wait_for_timeout(250)
 return page,errors

def test_page(browser,name,w):
 print('TEST',name,w,flush=True)
 p,errors=load(browser,name,w)
 rep={'page':name,'width':w,'title':p.title(),'errors':[],'actions':[]}
 def do(label,call):
  try:call();p.wait_for_timeout(60);rep['actions'].append({'name':label,'ok':True})
  except Exception as e:rep['actions'].append({'name':label,'ok':False,'error':str(e)[:250]})
 try:
  if name=='index.html':
   do('catalogue loaded',lambda:p.locator('#catalogueStatus').inner_text())
   do('front-brake torque',lambda:(p.locator('[data-id="front-brake"]').first.evaluate('(el)=>el.click()'),p.locator('[data-tab="torque"]').first.evaluate('(el)=>el.click()')))
   do('search',lambda:(p.locator('#partSearch').fill('Nissin'),p.locator('#resultCount').inner_text()))
   do('search hostile',lambda:p.locator('#partSearch').fill('<img src=x onerror="window.__xss=1">'))
   do('reset search',lambda:p.locator('#partSearch').fill(''))
   do('maintenance',lambda:p.locator('#maintenanceList input[type=checkbox]').first.check())
   do('assistant',lambda:(p.locator('#askInput').fill('front axle torque'),p.locator('#askForm button[type=submit]').first.evaluate('(el)=>el.click()')))
   do('source tab',lambda:p.locator('[data-dataset="torque"]').first.evaluate('(el)=>el.click()'))
   do('source filter',lambda:p.locator('#referenceQuery').fill('front wheel spindle'))
   do('manual reader',lambda:p.locator('#libraryGotoTorque').evaluate('(el)=>el.click()'))
  if name=='exploded.html':
   do('assemblies',lambda:p.locator('#assemblyTitle').inner_text())
   do('switch assembly',lambda:p.locator('[data-assembly="front-brakes"]').first.evaluate('(el)=>el.click()'))
   do('explode slider',lambda:p.locator('#explodeRange').fill('75'))
   do('source tab',lambda:p.locator('#tabFiche').evaluate('(el)=>el.click()'))
   do('back to callouts',lambda:p.locator('#tabExploded').evaluate('(el)=>el.click()'))
   do('search',lambda:p.locator('#partSearch').fill('bolt'))
   do('next part',lambda:p.locator('#nextPart').evaluate('(el)=>el.click()'))
   do('bike context',lambda:p.locator('#tabBike').evaluate('(el)=>el.click()'))
  if name=='electrical.html':
   do('fuses',lambda:p.locator('#fuseCount').inner_text())
   do('harness',lambda:p.locator('#harnessCount').inner_text())
   do('fuse source',lambda:p.locator('#fuses [data-page]').first.evaluate('(el)=>el.click()'))
   do('harness search',lambda:p.locator('#harnessSearch').fill('coolant'))
   do('harness source',lambda:p.locator('#harness [data-page]').first.evaluate('(el)=>el.click()'))
   do('part search',lambda:p.locator('#partsSearch').fill('fuse'))
   do('part details',lambda:p.locator('#electricalParts [data-part]').first.evaluate('(el)=>el.click()'))
   do('diagram source',lambda:p.locator('#drawings [data-page]').first.evaluate('(el)=>el.click()'))
  if name=='catalogue.html':
   do('catalogue search',lambda:p.locator('input[type=search]').first.fill('Electrical'))
   do('catalogue results',lambda:p.locator('body').inner_text())
  if name=='real-photo-gallery.html':
   do('all photos',lambda:p.locator('#allBtn').evaluate('(el)=>el.click()'))
   do('only photos',lambda:p.locator('#photosBtn').evaluate('(el)=>el.click()'))
   do('only fiches',lambda:p.locator('#ficheBtn').evaluate('(el)=>el.click()'))
   do('search',lambda:p.locator('#filterSearch').fill('brake'))
   do('hostile search',lambda:p.locator('#filterSearch').fill('<img src=x onerror="window.__xss=1">'))
  if name=='photo-teardown.html':
   do('angles',lambda:p.locator('#viewOptions button').nth(1).evaluate('(el)=>el.click()'))
   do('stages',lambda:p.locator('#stageOptions button').nth(1).evaluate('(el)=>el.click()'))
   do('parts search',lambda:p.locator('#partSearch').fill('brake'))
   do('torque search',lambda:(p.locator('#torqueSearch').fill('front wheel'),p.locator('#torqueButton').evaluate('(el)=>el.click()')))
   do('photo marker action',lambda:p.locator('#editHotspot').evaluate('(el)=>el.click()'))
   do('export markers',lambda:p.locator('#exportAnnotations').evaluate('(el)=>el.click()'))
  if name=='manual-index.html':
   do('manual count',lambda:p.locator('#manualCount').inner_text())
   do('search',lambda:p.locator('#manualSearch').fill('wheels'))
   do('torque tab',lambda:p.locator('[data-manual-tab="torques"]').evaluate('(el)=>el.click()'))
   do('torque page',lambda:p.locator('#manualResults [data-page]').first.evaluate('(el)=>el.click()'))
   do('tools tab',lambda:p.locator('[data-manual-tab="tools"]').evaluate('(el)=>el.click()'))
   do('schedule tab',lambda:p.locator('[data-manual-tab="schedule"]').evaluate('(el)=>el.click()'))
 except Exception as e: rep['errors'].append('harness '+str(e)[:300])
 rep['errors']+=errors
 rep['horizontal_overflow']=p.evaluate('document.documentElement.scrollWidth > window.innerWidth+2')
 rep['xss_executed']=p.evaluate('Boolean(window.__xss)')
 rep['fetches']=p.evaluate('window.__fetchCalls')
 rep['buttons']=p.locator('button').count()
 rep['links']=p.locator('a').count()
 p.close();return rep

if __name__=='__main__':
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path=__import__('os').environ.get('CHROME_BIN') or None,args=['--no-sandbox','--disable-gpu'])
  for name in PAGES:
   for w in [1440,390]:
    result=test_page(b,name,w);results.append(result)
    print(name,w, 'OK',sum(x['ok'] for x in result['actions']),'/',len(result['actions']),'errors',len(result['errors']),'overflow',result['horizontal_overflow'])
    for x in result['actions']:
     if not x['ok']:print(' ISSUE',x['name'],x.get('error','')[:200])
    for er in result['errors']:print(' ERROR',er[:200])
  b.close()
 Path(str(ROOT/'tests'/'browser-results.json')).write_text(json.dumps(results,indent=2))
 failed=[(x['page'],x['width'],x['errors'],[a['name'] for a in x['actions'] if not a['ok']],x['horizontal_overflow'],x['xss_executed']) for x in results if x['errors'] or any(not a['ok'] for a in x['actions']) or x['horizontal_overflow'] or x['xss_executed']]
 total=sum(len(x['actions']) for x in results)
 print(f'Browser smoke: {len(results)} page/width combinations, {total} actions, {len(failed)} failures')
 if failed:raise SystemExit('Browser smoke failed: '+str(failed))
