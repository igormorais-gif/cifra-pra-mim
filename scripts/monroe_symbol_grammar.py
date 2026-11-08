#!/usr/bin/env python3
"""Monroe: intérprete experimental de símbolos musicais impressos.

Uso (recortes PRIVADOS, não publicados):
 python scripts/monroe_symbol_grammar.py REF_P61.png ALVO.png

Detecta pentagramas, cabeças preenchidas, pausas de semínima, barras de
compasso, hastes sem cabeça preenchida e ligaduras inferiores.
No exercício de uma pauta, testa também pontos, bandeirolas e durações.
NÃO confundir reconhecimento de símbolos com transcrição musical completa.
Necessita: numpy, opencv-python-headless, scipy.
"""
import sys,json
import cv2,numpy as np
from scipy.ndimage import maximum_filter,gaussian_filter1d
from scipy.signal import find_peaks

TEMPLATES={
 "filled":((185,140),(20,12),.70,(26,37)),
 "quarter_rest":((440,116),(35,56),.69,(32,45))
}
def find_staves(image):
 z=gaussian_filter1d(((255-image[20:-20,68:132]).astype(float)/255).mean(axis=1),1)
 peaks,_=find_peaks(z,prominence=.035,distance=12)
 peaks=peaks+20
 candidates=[]
 for i in range(len(peaks)-4):
  lines=peaks[i:i+5];diff=np.diff(lines)
  if (diff>=18).all() and (diff<=28).all() and max(diff)-min(diff)<=5:
   candidates.append((float(sum(z[v-20] for v in lines)),list(map(int,lines))))
 result=[]
 for _,lines in sorted(candidates,reverse=True):
  if not any(abs(lines[0]-other[0])<80 for other in result):result.append(lines)
 return sorted(result,key=lambda v:v[0])
def template(image,center,size):
 x,y=center;w,h=size
 return image[y-h//2:y-h//2+h,x-w//2:x-w//2+w]
def match(image,model,threshold,nms,regions,rest=False):
 r=cv2.matchTemplate(image,model,cv2.TM_CCOEFF_NORMED)
 ys,xs=np.where((r>=threshold)&(r==maximum_filter(r,size=nms)))
 w,h=model.shape[1],model.shape[0];found=[]
 for y,x in zip(ys,xs):
  xx,yy=int(x+w//2),int(y+h//2)
  if any(x0<=xx<=x1 and y0<=yy<=y1 for x0,x1,y0,y1 in regions):
   found.append(dict(x=xx,y=yy,similarity=round(float(r[y,x]),3)))
 if rest:
  dedup=[]
  for item in sorted(found,key=lambda e:-e["similarity"]):
   if not any(abs(item["x"]-n["x"])<18 and abs(item["y"]-n["y"])<45 for n in dedup):
    dedup.append(item)
  found=dedup
 return sorted(found,key=lambda e:(e["x"],e["y"]))
def bars(image,y0,y1):
 mask=(image<140).astype("uint8")*255
 v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(2,85)))
 _,_,st,_=cv2.connectedComponentsWithStats(v);found=[]
 for x,y,w,h,area in st[1:]:
  if h>=85 and x>100 and y0<=y<y1:found.append([int(x+w//2),int(y),int(h)])
 return sorted(found)
def vertical_stems(image,minimum=40):
 mask=(image<140).astype("uint8")*255
 v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(2,minimum)))
 _,_,st,_=cv2.connectedComponentsWithStats(v)
 return [(int(x+w//2),int(y),int(h)) for x,y,w,h,a in st[1:]
         if h>=minimum and 120<=x<=image.shape[1]-75]
def unmatched_stems(image,heads,barlines):
 found=[]
 for x,y,h in vertical_stems(image):
  if any(abs(x-b[0])<=14 for b in barlines):continue
  if any(abs(x-n["x"])<=20 and y-30<=n["y"]<=y+h+30 for n in heads):continue
  found.append(dict(x=x,top=y,height=h))
 return sorted(found,key=lambda t:(t["x"],t["top"]))
def bottom_tracker(image,lines):
 xs=np.arange(100,image.shape[1]-50,40);ys=[];prev=lines[-1]
 for x in xs:
  lo=max(0,int(prev-9));hi=min(image.shape[0],int(prev+10))
  z=gaussian_filter1d((255-image[lo:hi,max(0,x-28):min(image.shape[1],x+28)]).mean(axis=1)/255,1)
  if len(z) and z.max()>.15:prev=int(np.argmax(z)+lo)
  ys.append(prev)
 return lambda x:float(np.interp(x,xs,ys))
def ties(image,heads,barlines,staff):
 bottom=bottom_tracker(image,staff)
 same=sorted((n for n in heads if bottom(n["x"])-95<n["y"]<bottom(n["x"])+30),key=lambda e:e["x"])
 result=[]
 for a,b in zip(same,same[1:]):
  x0,x1=a["x"],b["x"]
  if x1-x0>190 or any(x0<v[0]<x1 for v in barlines):continue
  y0=max(0,int(bottom((x0+x1)/2)+4));y1=min(image.shape[0],y0+33)
  mask=(image[y0:y1,x0:x1]<145).astype("uint8")*255
  _,_,st,_=cv2.connectedComponentsWithStats(mask)
  if any(w>=min(42,.48*(x1-x0)) and area>=100 and h>=5 for x,y,w,h,area in st[1:]):
   result.append(dict(from_x=x0,to_x=x1))
 return result
def read(reference,image):
 staves=find_staves(image)
 if not staves:raise ValueError("Nenhum pentagrama detectado")
 regions=[]
 for i,lines in enumerate(staves):
  lo=max(0,lines[0]-48)
  hi=min(image.shape[0],staves[i+1][0]-15 if i+1<len(staves) else lines[-1]+108)
  regions.append((120,image.shape[1]-70,lo,hi))
 found={"staves":staves}
 for name,(center,size,threshold,nms) in TEMPLATES.items():
  found[name]=match(image,template(reference,center,size),threshold,nms,regions,rest=(name=="quarter_rest"))
 found["barlines"]=bars(image,max(0,staves[0][0]-35),staves[0][-1]+75)
 found["hollow_stem_candidates"]=unmatched_stems(image,found["filled"],found["barlines"])
 found["tie_candidates"]=ties(image,found["filled"],found["barlines"],staves[0]) if len(staves)==1 else []
 return found
def measure_durations(image,found):
 """Exercício monofônico: padrão quartas, colcheias com flag, pontos e mínimas.
 Ainda NÃO implementa semicolcheias, barras de colcheias, síncopes ou vozes."""
 mask=(image<140).astype("uint8")*255
 v=cv2.morphologyEx(mask,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(2,40)))
 _,_,st,_=cv2.connectedComponentsWithStats(v)
 stems=[(int(x+w//2),int(y),int(h)) for x,y,w,h,a in st[1:] if h>=40]
 dark=(255-image).astype(float)/255
 events=[]
 for n in found["filled"]:
  x,y=n["x"],n["y"]
  roi=(image[y-10:y+12,x+17:x+47]<160).astype("uint8")*255
  _,_,components,_=cv2.connectedComponentsWithStats(roi)
  dotted=any(3<=w<=10 and 3<=h<=10 and area>=12 for xx,yy,w,h,area in components[1:])
  nearest=[s for s in stems if abs(s[0]-x)<=14 and s[1]<=y<=s[1]+s[2]+12]
  if not nearest:raise ValueError("Cabeça sem haste em x="+str(x))
  sx,sy,sh=min(nearest,key=lambda e:abs(e[0]-x))
  right=dark[sy+4:sy+43,sx+5:sx+35]
  bg=(dark[sy+4:sy+43,sx-35:sx-13].mean(axis=1)+dark[sy+4:sy+43,sx+40:sx+62].mean(axis=1))/2
  flag=float(np.maximum(0,right-bg[:,None]).sum())>75
  events.append(dict(x=x,type="eighth" if flag else "quarter",dotted=dotted,
                     duration=(.5 if flag else 1)*(1.5 if dotted else 1)))
 for n in found["hollow_stem_candidates"]:
  events.append(dict(x=n["x"],type="half_candidate",dotted=False,duration=2))
 for n in found["quarter_rest"]:
  events.append(dict(x=n["x"],type="quarter_rest",dotted=False,duration=1))
 boundaries=sorted(b[0] for b in found["barlines"])
 measures=[]
 for i,boundary in enumerate(boundaries):
  start=boundaries[i-1] if i else 0
  subset=sorted([e for e in events if start<=e["x"]<boundary],key=lambda e:e["x"])
  measures.append(dict(bar=i+1,beats=sum(e["duration"] for e in subset),events=subset))
 return measures
def main():
 if len(sys.argv)!=3:sys.exit("Uso: python monroe_symbol_grammar.py REF_P61.png ALVO.png")
 reference=cv2.imread(sys.argv[1],0);image=cv2.imread(sys.argv[2],0)
 if reference is None or image is None:sys.exit("Imagem inválida")
 result=read(reference,image)
 if len(result["staves"])==1:result["rhythm_test"]=measure_durations(image,result)
 print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
