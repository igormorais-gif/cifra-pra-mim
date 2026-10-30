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
    // Escala fixa C3–B5 em TODOS os diagramas. Antes cada acorde começava numa oitava diferente.
    const start=48;
    const octaves=3;
    const width=octaves*7*20;
    const svg=svgnode("svg",{viewBox:"0 0 "+width+" 106",role:"img","aria-label":"Teclado fixo de Dó3 a Si5, notas "+notes.map(n=>n.name+(Math.floor(n.midi/12)-1)).join(", "),"class":"piano"});
    for(let i=0;i<octaves*7;i++)svg.appendChild(svgnode("rect",{x:i*20+0.5,y:1,width:19,height:79,rx:1,fill:"#fff",stroke:"#222","stroke-width":.8}));
    for(let octave=0;octave<octaves;octave++)for(const [pc,white] of Object.entries(black)){
      svg.appendChild(svgnode("rect",{x:octave*140+(white+1)*20-7,y:0,width:14,height:49,rx:1.5,fill:"#1b1b1b"}));
    }
    for(const note of notes){
      const rel=note.midi-start,octave=Math.floor(rel/12),pc=mod(rel,12);
      const isBlack=Object.prototype.hasOwnProperty.call(black,pc);
      const x=isBlack?octave*140+(black[pc]+1)*20:(octave*7+keys[pc])*20+10;
      const y=isBlack?36:64;
      svg.appendChild(svgnode("circle",{cx:x,cy:y,r:isBlack?6.2:8.5,fill:isBlack?"#fff":"#111",stroke:isBlack?"#111":"none","stroke-width":1}));
      svg.appendChild(svgnode("circle",{cx:x,cy:y,r:isBlack?2:3,fill:isBlack?"#111":"#fff"}));
    }
    for(let oct=0;oct<octaves;oct++){
      const label=svgnode("text",{x:oct*140+10,y:99,"text-anchor":"middle","font-size":"10",fill:"#444"});
      label.textContent="C"+(3+oct);
      svg.appendChild(label);
    }
    return svg;
  }
  function card(chord,voicing,index,previous){
    const card=make("article","shape");
    const head=make("div","shape-heading");
    head.append(make("strong","chord-symbol",chord.raw),make("span","position-index",String(index+1).padStart(2,"0")));
    card.append(head,keyboard(voicing.notes));
    const left=make("p","hand");
    left.append(make("b",null,"M.E. "),document.createTextNode(chord.bass));
    card.append(left);
    const right=make("p","hand");
    right.append(make("b",null,"M.D. "),document.createTextNode(voicing.notes.map(n=>n.name).join(" – ")));
    card.append(right);
    const degrees=make("p","degrees");
    degrees.append(make("b",null,"Graus "),document.createTextNode(voicing.notes.map(n=>n.label).join(" – ")));
    card.append(degrees);
    const ponta=voicing.notes[voicing.notes.length-1];
    const pontaName=ponta.name+(Math.floor(ponta.midi/12)-1);
    const delta=previous?voicing.top-previous.top:null;
    const text=delta===null?"Ponta: "+pontaName+" · referência absoluta":
      "Ponta: "+pontaName+" · movimento "+(delta>0?"+":"")+delta+" ST"+(Math.abs(delta)>2?" · exceção: acima de 2 ST":"");
    card.append(make("p","movement"+(delta!==null&&Math.abs(delta)>2?" outside":""),text));
    if(voicing.omitted.length)card.append(make("p","omission","Nota omitida: "+voicing.omitted.map(n=>n.name+" ("+n.label+")").join(", ")));
    return card;
  }
  function shapeSet(title,chords,track){
    const set=make("div","shape-set");
    set.append(make("h4",null,title));
    const grid=make("div","diagrams");
    chords.forEach((chord,i)=>grid.append(card(chord,track[i],i,i>0?track[i-1]:null)));
    set.append(grid);return set;
  }
  function section(n,title,subtitle){
    const page=make("section","arrangement-page");
    page.append(make("div","section-meta","ARRANJA PRA MIM / "+String(n).padStart(2,"0")),make("h3","page-title",title),make("p","page-subtitle",subtitle));
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
      const origin=section(1,"Formas Originais","Três formas de origem possíveis. Cada adaptação começa com a primeira forma da variante correspondente.");
      ["Forma de origem I","Forma de origem II","Forma de origem III"].forEach((label,i)=>origin.append(shapeSet(label,output.chords,output.originalTracks[i])));
      sheets.append(origin);
      ["I","II","III"].forEach((label,i)=>{
        const page=section(i+2,"Adaptando Pontas — "+label,"Primeiro acorde igual à respectiva forma de origem; inversões seguintes priorizam pontas próximas.");
        page.append(shapeSet("Condução de vozes",output.chords,output.adapted[i]));
        sheets.append(page);
      });
      const jumps=output.adapted.reduce((sum,track)=>sum+track.slice(1).filter((c,i)=>Math.abs(c.top-track[i].top)>2).length,0);
      q("result-stats").textContent=output.chords.length+" acordes · 3 formas de origem · 3 adaptações"+(jumps?" · "+jumps+" salto(s) acima de 2 semitons, assinalados":" · todas as pontas dentro de 2 semitons");
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
  q("print-btn").addEventListener("click",()=>window.print());
  q("print-btn-bottom").addEventListener("click",()=>window.print());
  // Pré-carrega uma progressão real de teste para que o gerador apareça pronto ao abrir.
  draw(true);
}));
