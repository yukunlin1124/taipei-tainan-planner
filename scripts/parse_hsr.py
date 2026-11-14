"""Parse the HSR (High Speed Rail) timetable PDF, which has a text layer.

Reads timetables/source/hsr_timetable.pdf, writes timetables/hsr_*.json. Run from anywhere:
    python scripts/parse_hsr.py
"""
import pymupdf, re, json
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "timetables", "source")   # original PDFs
OUT = os.path.join(ROOT, "timetables")                 # parsed timetables the planner uses
TIME=re.compile(r'^(\d{1,2}):(\d{2})$'); TRAIN=re.compile(r'^\d{3,4}$')
d=pymupdf.open(os.path.join(SOURCE, 'hsr_timetable.pdf'))
def page_dir(p):
    t=p.get_text(); return 'NB' if 'Northbound' in t else ('SB' if 'Southbound' in t else '?')
def tables_of(p):
    hdr=[w for w in p.get_text('words') if w[1]<70]
    trains=sorted([w[0] for w in hdr if w[4]=='Train'])
    tai=sorted([(w[0],w[4]) for w in hdr if w[4] in ('Tainan','Taipei')])
    tbs=[]
    for i,tx in enumerate(trains):
        nxt=trains[i+1] if i+1<len(trains) else 1e9
        cols=[(x,n) for x,n in tai if tx<x<nxt]
        tn=[x for x,n in cols if n=='Tainan']; tp=[x for x,n in cols if n=='Taipei']
        if tn and tp: tbs.append(dict(train_x=tx,tainan_x=tn[0],taipei_x=tp[0],x_lo=tx-25,x_hi=nxt-25))
    return tbs
def near(x,c,tol=16): return abs(x-c)<tol
def parse_page(p):
    rows=[]
    for tb in tables_of(p):
        ws=[w for w in p.get_text('words') if w[1]>70 and tb['x_lo']<w[0]<tb['x_hi']]
        anchors=[w for w in ws if TRAIN.match(w[4]) and near(w[0],tb['train_x'],30)]
        for a in anchors:
            ay=(a[1]+a[3])/2
            band=[w for w in ws if abs((w[1]+w[3])/2-ay)<6]
            tainan=taipei=None
            for x0,y0,x1,y1,word,*_ in band:
                m=TIME.match(word)
                if not m: continue
                v=f'{int(m.group(1)):02d}:{m.group(2)}'
                if near(x0,tb['tainan_x']): tainan=v
                elif near(x0,tb['taipei_x']): taipei=v
            if tainan and taipei: rows.append({'train':a[4],'tainan':tainan,'taipei':taipei})
    return rows
allrows={'NB':[],'SB':[]}
for i,p in enumerate(d):
    dr=page_dir(p); r=parse_page(p); allrows[dr]+=r
    print('page',i,dr,len(r))
def dedupe(rows):
    seen=set(); out=[]
    for r in rows:
        k=(r['train'],r['tainan'],r['taipei'])
        if k not in seen: seen.add(k); out.append(r)
    return out
nb=dedupe(allrows['NB']); sb=dedupe(allrows['SB'])
nb.sort(key=lambda r:r['tainan']); sb.sort(key=lambda r:r['taipei'])
json.dump([{'train':r['train'],'dep':r['tainan'],'arr':r['taipei']} for r in nb],open(os.path.join(OUT, 'hsr_tainan_taipei.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
json.dump([{'train':r['train'],'dep':r['taipei'],'arr':r['tainan']} for r in sb],open(os.path.join(OUT, 'hsr_taipei_tainan.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('Tainan->Taipei',len(nb),'Taipei->Tainan',len(sb))
# train number dupes?
import collections
for lbl,rows in [('NB',nb),('SB',sb)]:
    c=collections.Counter(r['train'] for r in rows)
    dups={k:v for k,v in c.items() if v>1}
    if dups: print(lbl,'dup train#:',dups)
