// Leitura local de cifras digitadas e de arquivos PDF/TXT. Nenhum documento é enviado a um servidor.
window.CifraImport = (function(){
  "use strict";
  const pattern=/^[A-G](?:#|b)?(?:(?:m7M|m7b5|m7|m6|m9|maj7|Maj7|M7|7M|7|6|9|11|13|m|°7|º7|°|º|dim7|dim|aug|sus2|sus4|ø7|ø|\+|-)?(?:\((?:[#b]?(?:5|9|11|13))(?:,[#b]?(?:5|9|11|13))*\))?)(?:\/[A-G](?:#|b)?)?$/;
  function valid(token){
    const s=token.replace(/[♯]/g,"#").replace(/[♭]/g,"b");
    if(!pattern.test(s))return false;
    try{window.CifraEngine.parseChord(s);return true;}catch{return false;}
  }
  function chordsFromText(text){
    const lines=String(text||"").replace(/\r/g,"").split("\n");
    const found=[],selection=[];
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(/^\s*(?:tom|capotraste|afinação|afinacao)\s*:/i.test(line))continue;
      const brackets=[...line.matchAll(/\[([^\]\n]{1,30})\]/g)].map(m=>m[1].trim()).filter(valid);
      if(brackets.length){
        selection.push({line:i+1,chords:brackets});
        found.push(...brackets);
        continue;
      }
      let cleaned=line.replace(/^\s*(?:intro|introdução|introducao|refrão|refrao|estrofe|verso|ponte|solo|instrumental|final|pré-refrão|pre-refrao)\s*:\s*/i,"");
      cleaned=cleaned.replace(/\|:|:\||[|;,]+/g," ").replace(/\b(?:x[2-9]|bis)\b/gi," ").trim();
      if(!cleaned)continue;
      const tokens=cleaned.split(/\s+/).map(t=>t.replace(/^[([{]+|[)\]}.,:]+$/g,"")).filter(Boolean);
      const matched=tokens.filter(valid);
      if(!matched.length)continue;
      const single=matched.length===1&&tokens.length===1;
      const definiteSingle=single&&(/^\s+/.test(line)||/\|/.test(line)||/[#b°ø0-9]/.test(matched[0])||/:\s*/.test(line));
      if((matched.length>=2&&matched.length/tokens.length>=.8)||(single&&definiteSingle)){
        found.push(...matched);
        selection.push({line:i+1,chords:matched});
      }
    }
    if(!found.length)throw Error("Não identifiquei linhas de acordes nesse texto. Cole uma cifra com linhas como 'Am7 D7 G7M' ou acordes entre colchetes, como '[Am7]'.");
    return {chords:found.slice(0,48),total:found.length,lines:selection,progression:found.slice(0,48).join(" "),truncated:found.length>48};
  }
  function pdfLines(items){
    const rows=[];
    for(const item of items){
      if(!item.str||!item.str.trim())continue;
      const x=item.transform?.[4]??0,y=item.transform?.[5]??0;
      let row=rows.find(r=>Math.abs(r.y-y)<2.2);
      if(!row){row={y,items:[]};rows.push(row);}
      row.items.push({str:item.str,x,w:item.width??0});
    }
    rows.sort((a,b)=>b.y-a.y);
    return rows.map(row=>{
      row.items.sort((a,b)=>a.x-b.x);
      let s="",end=-1e6;
      for(const item of row.items){
        if(s&&item.x-end>3&&!s.endsWith(" ")&&!item.str.startsWith(" "))s+=" ";
        s+=item.str;
        end=item.x+item.w;
      }
      return s.trimEnd();
    }).join("\n");
  }
  async function readFile(file){
    if(!file)throw Error("Selecione um arquivo PDF ou TXT.");
    if(file.size>12*1024*1024)throw Error("O arquivo é maior que 12 MB. Para este protótipo, use um PDF menor ou cole o texto.");
    const ext=file.name.toLowerCase().split(".").pop();
    if(ext==="txt"||file.type==="text/plain")return await file.text();
    if(ext!=="pdf"&&file.type!=="application/pdf")throw Error("Formato não suportado. Selecione PDF ou TXT.");
    if(!window.pdfjsLib)throw Error("A biblioteca de leitura de PDF não carregou. Confira a internet ou cole o texto manualmente.");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const doc=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    try{
      if(doc.numPages>40)throw Error("Este PDF tem mais de 40 páginas. Selecione um trecho menor.");
      const pages=[];
      for(let n=1;n<=doc.numPages;n++){
        const page=await doc.getPage(n);
        const content=await page.getTextContent();
        pages.push(pdfLines(content.items));
        page.cleanup();
      }
      const text=pages.join("\n\n").trim();
      if(!text)throw Error("Este PDF parece ser uma imagem digitalizada, sem texto selecionável. Esta versão não faz OCR: use um PDF com texto ou cole a cifra.");
      return text;
    }finally{await doc.destroy();}
  }
  return {valid,chordsFromText,readFile,pdfLines};
})();
