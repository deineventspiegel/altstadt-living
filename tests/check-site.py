from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import struct
ROOT=Path(__file__).resolve().parents[1]/'public'
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.ids=[];self.links=[];self.images=[];self.maps=[];self.facts=0;self.visible=[];self.skip=0;self.sections=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if 'id' in d:self.ids.append(d['id'])
  if t in ['script','style']:self.skip+=1
  for k in ['href','src']:
   if k in d:self.links.append(d[k])
  if t=='img':self.images.append(d)
  if t=='iframe':self.maps.append(d)
  if t=='div' and d.get('class')=='fact-icon-box':self.facts+=1
  if t=='section':self.sections.append(d.get('class',''))
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip-=1
 def handle_data(self,d):
  if not self.skip:self.visible.append(d)
pages={}
for f in ROOT.glob('*.html'):
 if f.name=='dashboard.html':continue
 p=Page();p.feed(f.read_text());pages[f.name]=p
 assert len(p.ids)==len(set(p.ids)),f'Duplicate IDs: {f}'
 assert p.facts==({'index.html':12,'apartment-1.html':6,'apartment-2.html':6}.get(f.name,0)),f'Icons: {f}'
 assert len(p.maps)==(1 if f.name in ['index.html','apartment-1.html','apartment-2.html'] else 0)
 if p.maps:assert parse_qs(urlparse(p.maps[0]['src']).query)['q']==['Burgplatz 14, 40213 Düsseldorf, Deutschland']
 assert 'Gestaltungsvorschau · Buchungsstart in Vorbereitung' not in ''.join(p.visible)
 assert 'Beispielbild' not in ''.join(p.visible)
 for img in p.images:
  assert img.get('alt') and (ROOT/img['src']).is_file(),img
  assert (ROOT/img['src']).read_bytes().startswith(b'\xff\xd8'),img
for name,p in pages.items():
 for link in p.links:
  if urlparse(link).scheme:continue
  file,_,anchor=link.partition('#');file=file or name
  assert (ROOT/file).is_file(),(name,link)
  if anchor:assert anchor in pages[file].ids,(name,link)
 if name.startswith('apartment-'):
  order=p.sections
  assert order.index('room-reference-gallery wrap') < order.index('text-story wrap apartment-story') < order.index('booking room-booking-section wrap')
  assert order.index('room-details wrap') < order.index('location-map wrap apartment-map')
 print(name,': local links, image files, icon counts, map location and module order OK')
