#!/usr/bin/env python3
"""Bloqueio de transcrições automáticas de Monroe antes da publicação.

Necessário, NÃO suficiente: mesmo se passar, conferir alturas e ritmos
nota a nota contra o original, sem publicar PDFs particulares.
Uso: python3 scripts/monroe_calibration_gate.py /pasta/com/mxl
Exit 2 bloqueia conversão em lote.
"""
import json,sys,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
GABARITO={
  "simple_v1p7_ex1": {"p":5,"r":0,"ties":0,"bars":4,"voices":1},
  "rhythm_v1p61_ex8":{"p":12,"r":3,"ties":3,"bars":4,"voices":1},
  "duet_v1p76_ex12":{"p":29,"r":1,"ties":0,"bars":4,"voices":2},
}
def read_mxl(path):
  with zipfile.ZipFile(path) as z:
    xml=[n for n in z.namelist() if n.endswith(".xml") and not n.startswith("META-INF/")]
    if not xml:raise ValueError("Sem MusicXML")
    root=ET.fromstring(z.read(xml[0]))
  parts=root.findall("./part")
  notes=[n for part in parts for n in part.iter("note")]
  p=sum(n.find("pitch") is not None for n in notes)
  r=sum(n.find("rest") is not None for n in notes)
  ties=sum(t.get("type")=="start" for n in notes for t in n.findall("tie"))
  bars=max([len(part.findall("measure")) for part in parts],default=0)
  staff=set((i,n.text) for i,part in enumerate(parts) for n in part.iter("staff") if n.text)
  declared=max([int(n.text) for part in parts for n in part.iter("staves") if n.text and n.text.isdigit()] or [1])
  voices=max(len(parts),len(staff),declared)
  clef=sorted({n.text for part in parts for n in part.iter("sign") if n.text})
  time=sorted({b.text+"/"+u.text for part in parts for t in part.iter("time") for b,u in [(t.find("beats"),t.find("beat-type"))] if b is not None and u is not None})
  return dict(p=p,r=r,ties=ties,bars=bars,voices=voices,clef=clef,time=time)
def main(root):
  report={"purpose":"preflight_only_not_fidelity_certification","cases":{}}
  for prefix,reference in GABARITO.items():
    variants=[]
    for f in sorted(root.glob(prefix+"_*.mxl")):
      try:
        got=read_mxl(f)
        mismatches={k:{"expected":v,"actual":got[k]} for k,v in reference.items() if got[k]!=v}
        if "G" not in got["clef"]:mismatches["clef"]={"expected":"G","actual":got["clef"]}
        if "4/4" not in got["time"]:mismatches["time"]={"expected":"4/4","actual":got["time"]}
        variants.append({"file":f.name,"metrics":got,"mismatches":mismatches,"passes":not mismatches})
      except Exception as e:variants.append({"file":f.name,"error":str(e),"passes":False})
    report["cases"][prefix]={"reference":reference,"variants":variants,"passes":any(v["passes"] for v in variants)}
  passed=all(item["passes"] for item in report["cases"].values())
  report["decision"]="NEEDS_NOTE_BY_NOTE_REVIEW" if passed else "BLOCK_FULL_BOOK_BATCH"
  print(json.dumps(report,ensure_ascii=False,indent=2))
  return 0 if passed else 2
if __name__=="__main__":
  if len(sys.argv)!=2:sys.exit("Uso: python monroe_calibration_gate.py PASTA_MXL")
  sys.exit(main(Path(sys.argv[1])))
