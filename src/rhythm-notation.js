/**
 * Notação SVG autocontida para um compasso 4/4.
 * A pauta e a grade são derivadas dos MESMOS 16 ticks usados pelo áudio.
 * Sem fontes musicais externas e sem transcrição de material de terceiros.
 */
(function(root,factory){
  const engine=typeof module!=="undefined"&&module.exports
    ?require("./rhythm-lab.js"):root.RhythmLabEngine;
  const api=factory(engine);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.RhythmLabNotation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(E){
  "use strict";
  const ALLOWED=[8,6,4,3,2,1];
  const DIATONIC={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  function noteY(t){
    if(t.letter&&Number.isInteger(t.octave)){
      return 114-((t.octave-4)*7+DIATONIC[t.letter])*6;
    }
    return ({60:114,64:102,67:90,71:78})[t.midi]??78;
  }
  const escape=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  function splitNote(e){
    const res=[];let at=e.tick,left=e.length;
    while(left){
      // Se uma nota começar entre tempos e atravessar o próximo pulso,
      // escreva notas ligadas: evidencia a síncope sem mudar o áudio.
      const boundary=4-(at%4);
      let wanted=left;
      if(at%4!==0&&left>boundary)wanted=boundary;
      const d=ALLOWED.find(x=>x<=wanted);
      if(!d)throw new Error("Duração notável não encontrada");
      res.push({kind:"note",tick:at,length:d,index:e.index,midi:e.midi,name:e.name,degree:e.degree,letter:e.letter,octave:e.octave,alteration:e.alteration,first:res.length===0});
      at+=d;left-=d;
    }
    res.forEach((x,i)=>{x.tieIn=i>0;x.tieOut=i<res.length-1});
    return res;
  }
  function splitRest(tick,length){
    const items=[];let at=tick,left=length;
    while(left){
      const boundary=4-(at%4);
      const max=Math.min(left,boundary);
      const d=[4,3,2,1].find(x=>x<=max);
      items.push({kind:"rest",tick:at,length:d});
      at+=d;left-=d;
    }
    return items;
  }
  function plan(id,seq=E.events(id)){
    if(!Array.isArray(seq)||seq.length!==4)throw new RangeError("Quatro ataques são necessários");
    const tokens=[];let cursor=0;
    for(const e of seq){
      if(e.tick>cursor)tokens.push(...splitRest(cursor,e.tick-cursor));
      if(e.tick<cursor)throw new Error("Ataques sobrepostos");
      tokens.push(...splitNote(e));
      cursor=e.tick+e.length;
    }
    if(cursor<16)tokens.push(...splitRest(cursor,16-cursor));
    if(tokens.reduce((s,t)=>s+t.length,0)!==16)throw new Error("Compasso não soma 4/4");
    return tokens;
  }
  function line(x1,y1,x2,y2,stroke="#283946",width=1.4){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  }
  const pos=t=>145+t*53;
  function noteSvg(t,mode){
    const x=pos(t.tick),y=mode==="melodic"?noteY(t):80;
    const stem=x+8,up=y-40,dotted=t.length===3||t.length===6;
    const flags=t.length===1?2:t.length===2||t.length===3?1:0;
    const hollow=t.length===8;
    let out='<g class="score-hit" data-index="'+t.index+'" data-tick="'+t.tick+'" data-length="'+t.length+'">';
    if(mode==="melodic"&&y>=114)for(let ledger=114;ledger<=y;ledger+=12)out+=line(x-16,ledger,x+16,ledger,"#33434e",1.9);
    if(mode==="rhythm"){
      out+='<path class="score-note" d="M '+(x-8)+' '+(y-6)+' L '+(x+8)+' '+(y+6)+' M '+(x+8)+' '+(y-6)+' L '+(x-8)+' '+(y+6)+'" stroke="#203543" stroke-width="3" stroke-linecap="round" fill="none"/>';
    }else{
      out+='<ellipse class="score-note" cx="'+x+'" cy="'+y+'" rx="10" ry="7" transform="rotate(-18 '+x+' '+y+')" fill="'+(hollow?"#fbf7ee":"#203543")+'" stroke="#203543" stroke-width="2.2"/>';
    }
    out+=line(stem,y,stem,up,"#203543",2.6);
    for(let f=0;f<flags;f++){
      const fy=up+f*11;
      out+='<path d="M '+stem+' '+fy+' C '+(stem+26)+' '+(fy+4)+' '+(stem+25)+' '+(fy+25)+' '+(stem+8)+' '+(fy+29)+' C '+(stem+19)+' '+(fy+13)+' '+(stem+11)+' '+(fy+10)+' '+stem+' '+(fy+10)+' Z" fill="#203543"/>';
    }
    if(dotted)out+='<circle cx="'+(x+24)+'" cy="'+(y-4)+'" r="3.2" fill="#203543"/>';
    if(mode==="melodic"&&t.alteration&&t.first)
      out+='<text x="'+(x-23)+'" y="'+(y+6)+'" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="#203543">'+escape(t.alteration)+'</text>';
    if(t.first)out+='<text x="'+x+'" y="165" text-anchor="middle" font-size="14" font-weight="700" fill="#344752">'+escape(mode==="melodic"?t.name:t.degree)+'</text>';
    out+='</g>';
    return out;
  }
  function restSvg(t){
    const x=pos(t.tick),dotted=t.length===3;
    let out='<g class="score-rest" data-tick="'+t.tick+'" data-length="'+t.length+'">';
    if(t.length===4){
      out+='<path d="M '+(x+2)+' 62 l -8 10 l 8 11 l -8 7 l 8 13 l -10 -8" fill="none" stroke="#596d7c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    }else{
      const flags=t.length===1?2:1;
      out+='<line x1="'+(x+4)+'" y1="69" x2="'+(x-5)+'" y2="109" stroke="#596d7c" stroke-width="2.7"/>';
      for(let i=0;i<flags;i++){
        const y=69+i*11;
        out+='<path d="M '+(x+4)+' '+y+' Q '+(x-13)+' '+(y-8)+' '+(x-6)+' '+(y+5)+' Q '+(x-1)+' '+(y+9)+' '+(x+4)+' '+y+'" fill="#596d7c"/>';
      }
    }
    if(dotted)out+='<circle cx="'+(x+14)+'" cy="82" r="3.2" fill="#596d7c"/>';
    return out+'</g>';
  }
  function svg(id,mode="melodic",seq=E.events(id)){
    if(!["rhythm","melodic"].includes(mode))throw new RangeError("Modo de partitura inválido");
    const tokens=plan(id,seq),p=E.pattern(id);
    let out='<svg class="score-svg" viewBox="0 0 1100 195" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escape(p.title+" — "+(mode==="melodic"?"partitura melódica":"partitura rítmica")+", um compasso 4/4")+'">';
    out+='<rect x="2" y="1" width="1096" height="192" rx="12" fill="#fbf7ee"/>';
    if(mode==="melodic"){
      for(const y of [54,66,78,90,102])out+=line(20,y,1043,y,"#6b7274",1.2);
      out+='<text x="29" y="109" font-family="serif" font-size="71" fill="#203543">𝄞</text>';
    }else{
      out+=line(20,80,1043,80,"#6b7274",1.4);
      out+='<path d="M 34 66 v 28 M 45 66 v 28" stroke="#203543" stroke-width="3.2"/>';
    }
    out+='<text x="94" y="73" font-family="Georgia,serif" font-size="25" font-weight="bold" text-anchor="middle" fill="#203543">4</text>';
    out+='<text x="94" y="97" font-family="Georgia,serif" font-size="25" font-weight="bold" text-anchor="middle" fill="#203543">4</text>';
    for(let i=0;i<4;i++){
      out+='<text x="'+pos(i*4)+'" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="#788a91">Tempo '+(i+1)+'</text>';
    }
    for(const t of tokens)out+=t.kind==="note"?noteSvg(t,mode):restSvg(t);
    // Todas as ligaduras são exatamente entre fragmentos da mesma nota.
    for(let i=0;i<tokens.length-1;i++){
      const t=tokens[i],next=tokens[i+1];
      if(t.kind!=="note"||!t.tieOut||next.kind!=="note"||next.index!==t.index)continue;
      const a=pos(t.tick)+10,b=pos(next.tick)-10,y=mode==="rhythm"?97:Math.max(noteY(t)+20,102);
      out+='<path class="score-tie" d="M '+a+' '+y+' Q '+((a+b)/2)+' '+(y+14)+' '+b+' '+y+'" fill="none" stroke="#203543" stroke-width="2.2"/>';
    }
    out+=line(1043,mode==="melodic"?54:67,1043,mode==="melodic"?102:94,"#243744",3);
    out+='</svg>';
    return out;
  }
  return{plan,svg,splitRest,splitNote};
});
