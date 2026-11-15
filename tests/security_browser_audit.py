from pathlib import Path
import sys, json, os,re
sys.path.insert(0,str(Path(__file__).resolve().parent))
from browser_audit import load,DATA,PAGES,ROOT
from playwright.sync_api import sync_playwright
issues=[];counts={'dynamic_links':0,'downloads':0,'pdf_choosers':0,'injection_tests':0}
script='''() => [...document.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),target:a.target,rel:a.rel}));'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=__import__('os').environ.get('CHROME_BIN') or None,args=['--no-sandbox'])
 for name in PAGES:
  page,errs=load(b,name,1440)
  # Additional navigation controls that display only after interactions
  if name=='index.html':
   page.locator('#partSearch').fill('front');page.locator('#partSearch').fill('')
   page.locator('[data-tab="torque"]').first.evaluate('(el)=>el.click()')
   page.locator('#askInput').fill('front caliper');page.locator('#askForm button[type=submit]').first.evaluate('(el)=>el.click()')
  if name=='electrical.html':
   page.locator('#electricalParts [data-part]').first.evaluate('(el)=>el.click()')
   page.locator('#fuses [data-page]').first.evaluate('(el)=>el.click()')
   counts['pdf_choosers']+=int(page.locator('#localPdf').count() and 'source' in page.locator('#pdfStatus').inner_text().lower())
  if name=='exploded.html':
   page.locator('#tabFiche').evaluate('(el)=>el.click()')
  links=page.evaluate(script)
  for item in links:
   href=item['href'];counts['dynamic_links']+=1
   if href=='#':continue
   if href.startswith(('blob:','data:','mailto:','tel:')):continue
   if href.startswith('https://'):pass
   elif href.startswith(('http:','javascript:','vbscript:')):issues.append((name,'unsafe href',href[:150]))
   elif href.startswith('#'):
    if not page.evaluate('(id)=>Boolean(document.getElementById(id))',href[1:]):issues.append((name,'missing anchor',href))
   else:
    u=href.split('#')[0].split('?')[0];
    if u and not os.path.exists(str(ROOT)+'/'+u):issues.append((name,'missing local file',u))
   if item['target']=='_blank' and 'noopener' not in item['rel']:issues.append((name,'tabnabbing rel',href[:150]))
  assert not errs,(name,errs)
  page.close()
 # Injection in catalogue JSON previously entered as HTML
 original=DATA['data/catalogue-categories.json'];DATA['data/catalogue-categories.json']={'categories':['Normal', '<img src=x onerror="window.__xss=1">','<svg onload=alert(1)>']}
 page,e=load(b,'catalogue.html',1440)
 assert not e and not page.evaluate('Boolean(window.__xss)'),e
 assert page.locator('#categoryList img').count()==0
 assert '<img' in page.locator('#categoryList').inner_text()
 counts['injection_tests']+=1;page.close();DATA['data/catalogue-categories.json']=original
 # Injection into torque operation fields and external URL scheme in source JSON
 original=DATA['data/exploded-2018.json']
 altered=json.loads(json.dumps(original));a=altered['assemblies'][0];a['oemFicheUrl']='javascript:alert(1)'
 a['operations'][0]['torqueNm']='<img src=x onerror="window.__xss=1">'
 DATA['data/exploded-2018.json']=altered
 page,e=load(b,'exploded.html',1440)
 assert not e,e
 assert not page.evaluate('Boolean(window.__xss)')
 assert not page.locator('#fastenerOperations img').count()
 assert page.locator('#ficheLink').get_attribute('href')=='catalogue.html'
 counts['injection_tests']+=1;page.close();DATA['data/exploded-2018.json']=original
 # Local manual chooser workflow should follow the selected page in app without uploading
 page,e=load(b,'electrical.html',1440)
 page.locator('#fuses [data-page]').first.evaluate('(el)=>el.click()')
 file_data={'name':'t120-sample.pdf','mimeType':'application/pdf','buffer':b'%PDF-1.4\n1 0 obj <</Type/Catalog>> endobj\n%%EOF'}
 page.locator('#localPdf').set_input_files(file_data)
 page.wait_for_timeout(100)
 assert page.locator('#localPdfViewer').get_attribute('src').startswith('blob:')
 assert '#page=671' in page.locator('#openPdfTab').get_attribute('href')
 counts['pdf_choosers']+=1;page.close()
 page,e=load(b,'manual-index.html',1440)
 page.locator('#manualResults [data-page]').first.evaluate('(el)=>el.click()')
 assert 'select' in page.locator('#manualNotice').inner_text().lower()
 page.locator('#manualUpload').set_input_files(file_data)
 page.wait_for_timeout(70)
 assert page.locator('#manualOpenLink').count()==1
 assert '#page=' in page.locator('#manualOpenLink').get_attribute('href')
 counts['pdf_choosers']+=1;page.close()
 b.close()
print('DYNAMIC_LINKS',counts,'ISSUES',issues)
json.dump({'counts':counts,'issues':issues},open(str(ROOT/'tests'/'security-browser-results.json'),'w'),indent=2)
if issues:exit(1)
