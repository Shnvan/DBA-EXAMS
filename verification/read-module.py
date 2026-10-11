from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
r=PdfReader(r'C:\Users\Ivan\Downloads\UPDATED-DBMS_MIDTERM_MODULE.pdf')
texts={str(i):p.extract_text() or '' for i,p in enumerate(r.pages,1)}
(root/'verification-artifacts').mkdir(exist_ok=True)
(root/'verification-artifacts'/'module-text.json').write_text(json.dumps(texts,ensure_ascii=False,indent=2),encoding='utf-8')
pages=[13,14,15,68,69,70,73,74,80,83,85,90,91,97,99,102,103,104]
for start in range(0,len(pages),6):
 group=pages[start:start+6];sheet=Image.new('RGB',(1800,1600),'#dddddd')
 for i,n in enumerate(group):
  im=Image.open(root/'.cache'/'module-images'/f'p{n}.png');im.thumbnail((590,760));x=(i%3)*600;y=(i//3)*800+25;sheet.paste(im,(x,y));ImageDraw.Draw(sheet).text((x+10,y-20),f'PAGE {n}',fill='black')
 sheet.save(root/'verification-artifacts'/f'module-contact-{start//6}.png')
print('Extracted 105 pages and made three visual inspection sheets')
