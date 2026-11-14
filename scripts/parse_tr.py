"""Parse the TR (Taiwan Railway) timetable PDFs, which are images, with OCR.

Reads timetables/source/tr_*.pdf, writes timetables/tr_*.json. Run from anywhere:
    python scripts/parse_tr.py
"""
import pymupdf, re, json, sys, tempfile
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "timetables", "source")   # original PDFs
OUT = os.path.join(ROOT, "timetables")                 # parsed timetables the planner uses
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
TIME = re.compile(r'^(\d{1,2}):(\d{2})$')
TRAIN = re.compile(r'(\d{3,4})')

def boxes(png):
    res,_ = ocr(png)
    out=[]
    for box,text,score in (res or []):
        x=min(p[0] for p in box); y=min(p[1] for p in box)
        out.append((y,x,text.strip()))
    return out

def parse_pdf(path, tmp):
    doc=pymupdf.open(path)
    trains=[]
    for i,page in enumerate(doc):
        pix=page.get_pixmap(dpi=200); png=os.path.join(tmp, f'page_{i}.png'); pix.save(png)
        bx=boxes(png)
        # time tokens by column
        deps=[(y,m.group(0)) for y,x,t in bx if 540<x<670 for m in [TIME.match(t)] if m]
        arrs=[(y,x,t,m.group(0)) for y,x,t in bx if 690<x<810 for m in [TIME.match(t)] if m]
        # train number boxes (left col, first occurrence per block), near x 150..360, contains 區間
        tnums=[(y,m.group(1)) for y,x,t in bx if 150<x<380 and ('區間' in t or '沙' in t) for m in [TRAIN.search(t)] if m]
        for y,dep in deps:
            # nearest arr within same row band
            cand=[(abs(y-ay),at2) for ay,ax,at,at2 in arrs if abs(y-ay)<30]
            if not cand: continue
            arr=min(cand)[1]
            # nearest train number above-or-at
            tc=[(abs(y-ty),tn) for ty,tn in tnums if ty<=y+10]
            tn=min(tc)[1] if tc else None
            trains.append({'train':tn,'dep':dep,'arr':arr})
    # dedupe by (train,dep,arr), sort by dep
    seen=set(); uniq=[]
    for r in sorted(trains,key=lambda r:r['dep']):
        k=(r['train'],r['dep'],r['arr'])
        if k in seen: continue
        seen.add(k); uniq.append(r)
    return uniq

for path,name in [('tr_tainan-shalun.pdf','tr_tainan_shalun'),('tr_shalun-tainan.pdf','tr_shalun_tainan')]:
    with tempfile.TemporaryDirectory() as tmp:
        data=parse_pdf(os.path.join(SOURCE, path), tmp)
    json.dump(data,open(os.path.join(OUT, f'{name}.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(name, len(data),'trains')
