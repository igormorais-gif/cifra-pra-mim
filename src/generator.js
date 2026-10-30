window.addEventListener("DOMContentLoaded", (function buildUI(){
  "use strict";
  const q=id=>document.getElementById(id);
  const form=q("generator-form");
  const SVG="http://www.w3.org/2000/svg";
  const keys={0:0,2:1,4:2,5:3,7:4,9:5,11:6};
  const black={1:0,3:1,6:3,8:4,10:5};
  const mod=(a,b)=>((a%b)+b)%b;
  const make=(tag,className,text)=>{
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  function svgnode(tag,attrs){
    const node=document.createElementNS(SVG,tag);
    for(const key in attrs)node.setAttribute(key,String(attrs[key]));
    return node;
  }
  function keyboard(notes){
    // Mesmo enquadramento C3–B5 em toda figura, preservando a oitava real.
    const start=48,octaves=3,width=420;
    const svg=svgnode("svg",{viewBox:"0 0 420 99",role:"img","aria-label":"Teclado de Dó3 a Si5. Graus: "+notes.map(n=>n.name+" "+n.label).join(", "),"class":"piano"});
    for(let i=0;i<21;i++)svg.appendChild(svgnode("rect",{x:i*20+.4,y:.5,width:19.3,height:88,fill:"#fff",stroke:"#222","stroke-width":1}));
    for(let oct=0;oct<octaves;oct++)for(const [pc,pos] of Object.entries(black)){
      svg.appendChild(svgnode("rect",{x:oct*140+(pos+1)*20-7,y:.5,width:14,height:58,fill:"#111"}));
    }
    for(const note of notes){
      const rel=note.midi-start,oct=Math.floor(rel/12),pc=mod(rel,12);
      if(rel<0||rel>=36)continue;
      const isBlack=Object.prototype.hasOwnProperty.call(black,pc);
      const x=isBlack?oct*140+(black[pc]+1)*20:(oct*7+keys[pc])*20+10;
      const cy=isBlack?36:66;
      svg.appendChild(svgnode("circle",{cx:x,cy:cy,r:isBlack?5.6:6.6,fill:isBlack?"#fff":"#111"}));
      const label=svgnode("text",{x:x,y:isBlack?54:83,"text-anchor":"middle","font-family":"Arial, Helvetica, sans-serif","font-weight":"700","font-size":note.label.length>2?"8.5":"9.5",fill:isBlack?"#fff":"#111"});
      label.textContent=window.CifraPresentation.dotLabel(note.label);
      svg.appendChild(label);
    }
    return svg;
  }
  function card(chord,voicing,index,previous){
    const card=make("article","shape");
    const head=make("div","shape-heading");
    head.append(make("strong","chord-symbol",chord.raw),make("strong","chord-fullname",window.CifraPresentation.name(chord)));
    card.append(head);
    const hand=window.CifraPresentation.hand(chord,voicing);
    const handLine=make("div","hand-line");
    handLine.append(make("span","hand-left","M.E.: "+hand.left),make("span","hand-divider","|"),make("span","hand-right","M.D.: "+hand.right));
    card.append(handLine,keyboard(voicing.notes));
    if(previous&&Math.abs(voicing.top-previous.top)>2){
      card.classList.add("has-exception");
      card.title="Salto de "+Math.abs(voicing.top-previous.top)+" semitons (não foi encontrada ponta a até 2 ST)";
    }
    if(voicing.omitted.length){
      card.append(make("p","omission","Omitida: "+voicing.omitted.map(n=>window.CifraPresentation.note(n.name)+" ("+n.label+")").join(", ")));
    }
    return card;
  }
  function shapeSet(title,chords,track){
    const set=make("div","shape-set");
    set.append(make("h4","shape-set-name",title));
    const grid=make("div","diagrams");
    chords.forEach((chord,i)=>grid.append(card(chord,track[i],i,i>0?track[i-1]:null)));
    set.append(grid);return set;
  }
  function section(n,title,subtitle){
    const page=make("section","arrangement-page");
    page.append(make("h3","page-title",String(n)+") "+title),make("p","page-subtitle",subtitle));
    return page;
  }
  function draw(skipScroll=false){
    q("error").hidden=true;
    try{
      const output=window.CifraEngine.generate(q("chords").value);
      const title=q("song-title").value.trim()||"Progressão sem título";
      const composer=q("song-author").value.trim();
      const raw=q("source-text").value.trim();
      q("source-output").textContent=raw;
      q("print-source").hidden=!(raw&&q("include-source").checked);
      q("print-song-title").textContent=title;
      q("print-song-author").textContent=composer;
      const sheets=q("sheets");
      sheets.replaceChildren();
      const origin=section(1,"Formas Originais","");
      // Somente uma forma original para cada acorde: posição fundamental / desenho 1–3–5.
      origin.append(shapeSet("",output.chords,output.originalTrack));
      sheets.append(origin);
      const labels=["I — 1–3–5","II — 3–5–1","III — 5–1–3"];
      labels.forEach((label,i)=>{
        const page=section(i+2,"Adaptando Pontas ("+label+")","");
        page.append(shapeSet("",output.chords,output.adapted[i]));
        sheets.append(page);
      });
      const jumps=output.adapted.reduce((sum,track)=>sum+track.slice(1).filter((c,i)=>Math.abs(c.top-track[i].top)>2).length,0);
      q("result-stats").textContent=output.chords.length+" acordes · 1 coleção de Formas Originais (1–3–5) · 3 adaptações"+(jumps?" · "+jumps+" salto(s) acima de 2 semitons, assinalados":" · todas as pontas dentro de 2 semitons");
      q("results").hidden=false;
      q("print-btn").disabled=false;
      if(!skipScroll)q("results").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }catch(error){
      q("error").textContent=(error&&error.message)||"Não foi possível gerar este arranjo.";
      q("error").hidden=false;
      q("results").hidden=true;
      q("print-btn").disabled=true;
    }
  }
  let sourceDirty=false;
  const setStatus=(text,isError=false)=>{
    q("import-status").textContent=text;
    q("import-status").classList.toggle("status-error",isError);
  };
  function extract(){
    const result=window.CifraImport.chordsFromText(q("source-text").value);
    q("chords").value=result.progression;
    sourceDirty=false;
    setStatus(result.total+" acorde(s) encontrado(s). "+
      (result.truncated?"Apenas os primeiros 48 foram enviados ao gerador. ":"")+
      "Revise a sequência em 'Acordes reconhecidos' antes de imprimir.");
    return result;
  }
  q("source-text").addEventListener("input",()=>{sourceDirty=true;setStatus("");});
  q("include-source").addEventListener("change",()=>{q("print-source").hidden=!(q("source-text").value.trim()&&q("include-source").checked);});
  q("extract-btn").addEventListener("click",()=>{
    try{extract();draw();}catch(error){setStatus(error.message||"Não foi possível ler a cifra.",true);}
  });
  q("import-file").addEventListener("change",async event=>{
    const file=event.target.files?.[0];if(!file)return;
    q("extract-btn").disabled=true;
    setStatus("Lendo arquivo "+file.name+"…");
    try{
      const raw=await window.CifraImport.readFile(file);
      q("source-text").value=raw;
      sourceDirty=true;
      extract();
      draw();
    }catch(error){setStatus("Falha na importação: "+(error?.message||"arquivo inválido"),true);}
    finally{q("extract-btn").disabled=false;event.target.value="";}
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(sourceDirty&&q("source-text").value.trim()){
      try{extract();}catch(error){setStatus(error.message||"Erro ao extrair acordes",true);return;}
    }
    draw();
  });
  q("sample-btn").addEventListener("click",()=>{
    q("chords").value="C Am F G";
    q("song-title").value="Exercício de tríades";
    q("source-text").value="";
    sourceDirty=false;
    setStatus("");
    draw();
  });
  // PDF criado no navegador, sem depender da janela de impressão do iOS.
  let currentPdf=null,pdfUrl=null,pdfName="";
  const pdfPanel=q("pdf-panel"),pdfActions=q("pdf-actions"),pdfStatus=q("pdf-status");
  const pdfButtons=[q("print-btn"),q("print-btn-bottom")];
  function pdfMessage(message,isError=false){
    pdfStatus.textContent=message;
    pdfStatus.classList.toggle("status-error",isError);
  }
  function revokePreviousPdf(){
    if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=null;}
    currentPdf=null;pdfActions.hidden=true;
  }
  async function generatePdf(event){
    if(!window.CifraPDF){pdfPanel.hidden=false;pdfMessage("O exportador de PDF não carregou. Reabra a página no Safari.",true);return;}
    pdfPanel.hidden=false;
    pdfActions.hidden=true;
    pdfButtons.forEach(b=>b.disabled=true);
    pdfMessage("Preparando PDF A4…");
    if(event?.currentTarget?.id==="print-btn-bottom")pdfPanel.scrollIntoView({block:"center",behavior:"smooth"});
    try{
      if(sourceDirty&&q("source-text").value.trim())extract();
      const output=window.CifraEngine.generate(q("chords").value);
      const options={
        output,
        title:q("song-title").value.trim()||"Progressão sem título",
        composer:q("song-author").value.trim(),
        source:q("source-text").value,
        includeSource:q("include-source").checked
      };
      const result=await window.CifraPDF.create(options,(done,total)=>{
        pdfMessage("Montando PDF: "+done+" de "+total+" seções prontas…");
      });
      revokePreviousPdf();
      currentPdf=result.blob;
      pdfName=window.CifraPDF.filename(options.title);
      pdfUrl=URL.createObjectURL(currentPdf);
      const open=q("pdf-open"),download=q("pdf-download");
      open.href=pdfUrl;
      download.href=pdfUrl;
      download.download=pdfName;
      q("pdf-share").hidden=typeof navigator.share!=="function";
      pdfActions.hidden=false;
      pdfMessage("PDF criado: "+result.pages+" página(s). Agora abra, baixe ou compartilhe o arquivo.");
    }catch(error){
      pdfActions.hidden=true;
      pdfMessage("Não foi possível gerar o PDF: "+(error?.message||"erro desconhecido"),true);
    }finally{
      pdfButtons.forEach(b=>b.disabled=false);
    }
  }
  for(const button of pdfButtons)button.addEventListener("click",generatePdf);
  q("pdf-share").addEventListener("click",()=>{
    if(!currentPdf){pdfMessage("Gere o PDF antes de compartilhar.",true);return;}
    try{
      const file=new File([currentPdf],pdfName,{type:"application/pdf"});
      if(typeof navigator.share!=="function"||(navigator.canShare&&!navigator.canShare({files:[file]}))){
        pdfMessage("Compartilhamento de arquivos indisponível aqui. Toque em 'Abrir PDF', depois Compartilhar → Salvar em Arquivos.",true);
        return;
      }
      // A chamada parte diretamente do clique, requisito do compartilhamento nativo.
      navigator.share({files:[file],title:pdfName}).catch(error=>{
        if(error?.name!=="AbortError")pdfMessage("Não foi possível compartilhar. Use 'Abrir PDF' ou 'Baixar PDF'.",true);
      });
    }catch(error){
      pdfMessage("Este navegador não conseguiu compartilhar o arquivo. Use 'Abrir PDF' ou 'Baixar PDF'.",true);
    }
  });
  q("print-legacy").addEventListener("click",()=>window.print());
  // Pré-carrega uma progressão real de teste para que o gerador apareça pronto ao abrir.
  draw(true);
}));
