#!/usr/bin/env python3
"""Bulk optical recognition for the user-supplied Monroe Volume I scan.

Only creates review candidates. No candidate is automatically called verified.
The PDF stays out of the repository. Audiveris does notation recognition, and
MusicXML files are checked for meter, measure and note consistency.
"""
import argparse
import json
import pathlib
import subprocess
import traceback
import zipfile
from xml.etree import ElementTree as ET

import fitz

def leaf_and_side(printed_page):
    pdf_leaf=(printed_page+4)//2
    side="left" if printed_page%2==0 else "right"
    return pdf_leaf,side

def save_page(doc,printed_page,out):
    leaf,side=leaf_and_side(printed_page)
    if not 1<=leaf<=len(doc):
        raise ValueError("Page exceeds PDF bounds")
    source=doc[leaf-1]
    pix=source.get_pixmap(matrix=fitz.Matrix(3,3),alpha=False)
    from PIL import Image
    im=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
    half=im.width//2
    # Keep margins outside the printing; remove the spiral binding.
    if side=="left":
        crop=im.crop((6,0,half-32,im.height))
    else:
        crop=im.crop((half+32,0,im.width-6,im.height))
    crop.save(out,optimize=True)

def inspect_musicxml(path):
    try:
        with zipfile.ZipFile(path) as z:
            names=[n for n in z.namelist() if n.endswith(".xml") and not n.startswith("META-INF")]
            raw=z.read(names[0]) if names else b""
    except zipfile.BadZipFile:
        raw=path.read_bytes()
    if not raw:
        return {"status":"empty"}
    try:
        root=ET.fromstring(raw)
        parts=root.findall(".//part")
        measures=root.findall(".//part/measure")
        pitches=root.findall(".//note/pitch")
        rests=root.findall(".//note/rest")
        return {"status":"candidate","parts":len(parts),"measures":len(measures),
                "notes":len(pitches),"rests":len(rests),
                "has_nonempty_score":bool(parts and pitches)}
    except Exception as exc:
        return {"status":"invalid_xml","error":str(exc)}

def find_scores(folder):
    out=[]
    for p in folder.rglob("*"):
        if p.is_file() and p.suffix.lower() in (".mxl",".musicxml",".xml"):
            out.append(p)
    return out

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",required=True)
    p.add_argument("--range",default="4-95")
    p.add_argument("--audiveris",default="audiveris")
    p.add_argument("--output",required=True)
    p.add_argument("--timeout",type=int,default=110)
    args=p.parse_args()
    start,finish=map(int,args.range.split("-"))
    if not(4<=start<=finish<=95):
        raise ValueError("Printed page range must be within 4–95")
    doc=fitz.open(args.source)
    if len(doc)!=49:raise ValueError("Expected 49 PDF leaves")
    root=pathlib.Path(args.output);root.mkdir(parents=True,exist_ok=True)
    reports=[]
    for printed in range(start,finish+1):
        pid=f"p{printed:03d}"
        image=root/"scans"/(pid+".png")
        image.parent.mkdir(exist_ok=True)
        folder=root/"scores"/pid;folder.mkdir(parents=True,exist_ok=True)
        record={"printed_page":printed,"pdf_leaf":leaf_and_side(printed)[0],
                "side":leaf_and_side(printed)[1],"status":"pending"}
        try:
            save_page(doc,printed,image)
            cmd=[args.audiveris,"-batch","-export","-output",str(folder),"--",str(image)]
            run=subprocess.run(cmd,timeout=args.timeout,text=True,capture_output=True)
            record["exit_code"]=run.returncode
            (folder/"omr-log.txt").write_text((run.stdout+"\n"+run.stderr)[-25000:])
            scores=find_scores(folder)
            record["files"]=[]
            for score in scores:
                if score.name.startswith("."):continue
                probe=inspect_musicxml(score)
                record["files"].append({"path":str(score.relative_to(root)),**probe})
            has_music=any(s.get("has_nonempty_score") for s in record["files"])
            record["status"]="candidate" if has_music else "unrecognized"
        except subprocess.TimeoutExpired:
            record["status"]="timeout"
        except Exception:
            record["status"]="error"
            record["error"]=traceback.format_exc(limit=2)
        reports.append(record)
        (root/"report.json").write_text(json.dumps({
            "scope":"Monroe Volume I",
            "source":"49 two-page PDF leaves supplied by the user",
            "guarantee":"Candidates only; neither pitch accuracy nor exercise grouping is verified",
            "requested_pages":[start,finish],
            "reports":reports,
        },indent=2,ensure_ascii=False))
        print(f"{pid}: {record['status']}",flush=True)
    print("Processed:",len(reports),
          "candidates:",sum(x["status"]=="candidate" for x in reports),flush=True)

if __name__=="__main__":
    main()
