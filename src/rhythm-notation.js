/**
 * Notação de um compasso 4/4, conforme princípios de legibilidade
 * demonstrados por Larry Monroe, Workbook for Ear Training 1, pp. 1–6
 * (páginas 2–7 do PDF enviado): valores, pausas, pontos, ligaduras,
 * barras por pulsação e linha imaginária antes do tempo 3.
 *
 * Uma fonte de verdade: os 16 ticks utilizados pelo áudio.
 */
(function(root,factory){
 const engine=typeof module!=="undefined"&&module.exports
  ?require("./rhythm-lab.js"):root.RhythmLabEngine;
 const api=factory(engine);
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.RhythmLabNotation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(E){
 "use strict";
 const COLORS={ink:"#233643",muted:"#556879",staff:"#717b7f",paper:"#fbf7ee",accent:"#bd885d"};
 const DIATONIC={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
 const escape=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const pos=t=>145+t*53;
 const line=(x1,y1,x2,y2,color=COLORS.ink,width=1.4,extra="")=>
  '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+width+'" '+extra+'/>';
 function noteY(t){
  if(t.letter&&Number.isInteger(t.octave))return 114-((t.octave-4)*7+DIATONIC[t.letter])*6;
  return ({60:114,64:102,67:90,71:78})[t.midi]??78;
 }
 function validLength(v){return Number.isInteger(v)&&v>0&&v<=16}
 function splitNote(e){
  if(!Number.isInteger(e.tick)||!validLength(e.length)||e.tick<0||e.tick+e.length>16)
   throw new RangeError("Evento fora do compasso 4/4");
  const res=[];let at=e.tick,left=e.length;
  while(left){
   const room=4-at%4;
   // A metade do compasso deve ficar visível; ao escrever
   // semicolcheias, cada tempo fica legível como unidade.
   let max=Math.min(left,room);
   if(at===0||at===8){
    if(left>=8)max=8; // mínima no primeiro ou terceiro tempo: figura simples
    else if(left<=4)max=left;
   }
   const d=[8,4,3,2,1].find(n=>n<=max);
   if(!d)throw new Error("Não é possível escrever a duração");
   res.push({
    kind:"note",tick:at,length:d,index:e.index,midi:e.midi,name:e.name,
    degree:e.degree,letter:e.letter,octave:e.octave,alteration:e.alteration,
    first:res.length===0
   });
   at+=d;left-=d;
  }
  res.forEach((t,i)=>{t.tieIn=i>0;t.tieOut=i<res.length-1});
  return res;
 }
 function splitRest(tick,length){
  if(!Number.isInteger(tick)||!Number.isInteger(length)||length<0||tick<0||tick+length>16)
   throw new RangeError("Pausa fora do compasso");
  const items=[];let at=tick,left=length;
  if(tick===0&&length===16)return[{kind:"rest",tick:0,length:16}];
  while(left){
   const max=Math.min(left,4-at%4);
   const d=[4,3,2,1].find(n=>n<=max);
   if(!d)throw new Error("Pausa não representável");
   items.push({kind:"rest",tick:at,length:d});
   at+=d;left-=d;
  }
  return items;
 }
 function plan(id,seq=E.events(id)){
  if(!Array.isArray(seq)||seq.length!==4)throw new RangeError("Quatro ataques são necessários");
  const tokens=[];let cursor=0;
  for(const ev of seq){
   if(ev.tick>cursor)tokens.push(...splitRest(cursor,ev.tick-cursor));
   if(ev.tick<cursor)throw new Error("Ataques sobrepostos");
   tokens.push(...splitNote(ev));
   cursor=ev.tick+ev.length;
  }
  if(cursor<16)tokens.push(...splitRest(cursor,16-cursor));
  if(tokens.reduce((sum,x)=>sum+x.length,0)!==16)throw new Error("Compasso não soma 4/4");
  return tokens;
 }
 function beamGroups(tokens){
  // Barras unem apenas notas contíguas dentro de UM tempo. Nunca cruzam
  // uma pausa nem a fronteira imaginária do 3º tempo.
  const groups=[];let current=[];
  const flush=()=>{if(current.length>1)groups.push(current);current=[]};
  for(const token of tokens){
   if(token.kind!=="note"||token.length>3){flush();continue}
   const prev=current[current.length-1];
   if(prev&&(Math.floor(prev.tick/4)!==Math.floor(token.tick/4)||
     prev.tick+prev.length!==token.tick)){flush()}
   current.push(token);
  }
  flush();
  return groups.map(group=>({
   tokens:group,
   indices:group.map(t=>t.index),
   tick:group[0].tick,
   beat:Math.floor(group[0].tick/4)+1,
   direction:group.reduce((s,t)=>s+noteY(t),0)/group.length<78?"down":"up"
  }));
 }
 function headerSvg(mode){
  let out='<rect x="2" y="1" width="1096" height="192" rx="12" fill="'+COLORS.paper+'"/>';
  if(mode==="melodic"){
   for(const y of [54,66,78,90,102])out+=line(21,y,1043,y,COLORS.staff,1.25);
   out+='<text x="28" y="106" font-family="Apple Symbols,Bravura,serif" font-size="68" fill="'+COLORS.ink+'">𝄞</text>';
  }else{
   out+=line(21,80,1043,80,COLORS.staff,1.35);
   out+=line(28,65,28,95,COLORS.ink,3)+line(41,65,41,95,COLORS.ink,3);
  }
  out+='<text x="96" y="73" font-family="Georgia,serif" font-size="25" font-weight="bold" text-anchor="middle" fill="'+COLORS.ink+'">4</text>';
  out+='<text x="96" y="98" font-family="Georgia,serif" font-size="25" font-weight="bold" text-anchor="middle" fill="'+COLORS.ink+'">4</text>';
  for(let b=0;b<4;b++){
   const x=pos(b*4);
   out+='<text class="score-beat-label" x="'+x+'" y="26" text-anchor="middle" font-size="15" font-weight="'+(b===0?850:b===2?750:500)+'" fill="'+(b===0?COLORS.ink:b===2?COLORS.accent:COLORS.muted)+'">'+(b+1)+'</text>';
  }
  // Destaque editorial acima da pauta: limite entre as duas metades;
  // não se desenha uma falsa barra de compasso dentro do pentagrama.
  out+=line(pos(8)-20,34,pos(8)-20,42,"#bba18c",1.4,'stroke-dasharray="2 4"');
  return out;
 }
 function noteGlyph(t,mode,beamInfo){
  const x=pos(t.tick),y=mode==="melodic"?noteY(t):80;
  const stemDir=beamInfo?.direction||(y<78?"down":"up");
  const up=stemDir==="up",stemX=x+(up?9:-9),stemEnd=beamInfo?.beamY??(y+(up?-39:39));
  const beamed=!!beamInfo;
  const hollow=t.length===8,notWhole=t.length!==16,dotted=t.length===3||t.length===6;
  let out='<g class="score-hit" data-index="'+t.index+'" data-tick="'+t.tick+'" data-length="'+t.length+'" data-kind="note">';
  if(mode==="melodic"){
   for(let ledger=114;ledger<=y;ledger+=12)out+=line(x-16,ledger,x+16,ledger,COLORS.ink,1.8);
   for(let ledger=42;ledger>=y;ledger-=12)out+=line(x-16,ledger,x+16,ledger,COLORS.ink,1.8);
  }
  if(mode==="rhythm"){
   out+='<path class="score-note" d="M '+(x-8)+' '+(y-6)+' L '+(x+8)+' '+(y+6)+' M '+(x+8)+' '+(y-6)+' L '+(x-8)+' '+(y+6)+'" stroke="'+COLORS.ink+'" stroke-width="3" stroke-linecap="round" fill="none"/>';
  }else{
   out+='<ellipse class="score-note" cx="'+x+'" cy="'+y+'" rx="'+(t.length===16?11:10)+'" ry="6.7" transform="rotate(-18 '+x+' '+y+')" fill="'+(hollow||t.length===16?COLORS.paper:COLORS.ink)+'" stroke="'+COLORS.ink+'" stroke-width="2.2"/>';
  }
  if(notWhole){
   out+=line(stemX,y,stemX,stemEnd,COLORS.ink,2.7);
   if(!beamed){
    const count=t.length===1?2:(t.length===2||t.length===3?1:0);
    for(let j=0;j<count;j++){
     const fy=stemEnd+(up?j*12:-j*12);
     if(up){
      out+='<path class="score-flag" d="M '+stemX+' '+fy+' C '+(stemX+27)+' '+(fy+3)+' '+(stemX+28)+' '+(fy+20)+' '+(stemX+9)+' '+(fy+30)+' C '+(stemX+18)+' '+(fy+12)+' '+(stemX+12)+' '+(fy+8)+' '+stemX+' '+(fy+8)+' Z" fill="'+COLORS.ink+'"/>';
     }else{
      out+='<path class="score-flag" d="M '+stemX+' '+fy+' C '+(stemX-27)+' '+(fy-3)+' '+(stemX-28)+' '+(fy-20)+' '+(stemX-9)+' '+(fy-30)+' C '+(stemX-18)+' '+(fy-12)+' '+(stemX-12)+' '+(fy-8)+' '+stemX+' '+(fy-8)+' Z" fill="'+COLORS.ink+'"/>';
     }
    }
   }
  }
  if(dotted)out+='<circle class="score-dot" cx="'+(x+23)+'" cy="'+((y-54)%12===0?y-6:y)+'" r="3.4" fill="'+COLORS.ink+'"/>';
  if(mode==="melodic"&&t.alteration&&t.first)
   out+='<text class="score-accidental" x="'+(x-24)+'" y="'+(y+6)+'" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="'+COLORS.ink+'">'+escape(t.alteration)+'</text>';
  if(t.first)out+='<text class="score-pitch-label" x="'+x+'" y="173" text-anchor="middle" font-size="14" font-weight="700" fill="#405764">'+escape(mode==="melodic"?t.name:t.degree)+'</text>';
  out+='</g>';return out;
 }
 function restSvg(t){
  const x=pos(t.tick),dotted=t.length===3;
  let out='<g class="score-rest" data-tick="'+t.tick+'" data-length="'+t.length+'" data-kind="rest">';
  if(t.length===16){
   out+='<rect x="'+(x-12)+'" y="66" width="24" height="6" fill="'+COLORS.muted+'"/>';
  }else if(t.length===8){
   out+='<rect x="'+(x-12)+'" y="78" width="24" height="6" fill="'+COLORS.muted+'"/>';
  }else if(t.length===4){
   out+='<path d="M '+(x+3)+' 66 l -9 11 l 10 12 l -8 7 l 7 11 l -10 -5" fill="none" stroke="'+COLORS.muted+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  }else{
   const n=t.length===1?2:1;
   out+=line(x+3,70,x-7,109,COLORS.muted,2.8);
   for(let i=0;i<n;i++){
    const cy=73+i*12;
    out+='<circle cx="'+(x-7)+'" cy="'+cy+'" r="4.8" fill="'+COLORS.muted+'"/>';
    out+=line(x-6,cy+1,x+4,cy-3,COLORS.muted,2);
   }
  }
  if(dotted)out+='<circle class="score-dot" cx="'+(x+16)+'" cy="84" r="3.3" fill="'+COLORS.muted+'"/>';
  return out+"</g>";
 }
 function beamHeight(group,mode){
  const ys=group.tokens.map(t=>mode==="melodic"?noteY(t):80);
  return group.direction==="up"?Math.min(...ys)-39:Math.max(...ys)+39;
 }
 function beamSvg(group,mode){
  const list=group.tokens,up=group.direction==="up";
  const ys=list.map(t=>mode==="melodic"?noteY(t):80);
  const beamY=beamHeight(group,mode);
  const xs=list.map(t=>pos(t.tick)+(up?9:-9));
  let out='<g class="score-beam-group" data-beat="'+group.beat+'" data-first-tick="'+group.tick+'">';
  // O traço principal é indivisível DENTRO de um tempo.
  out+=line(xs[0],beamY,xs.at(-1),beamY,COLORS.ink,5.5);
  for(let i=0;i<list.length;i++){
   const t=list[i];if(t.length!==1)continue;
   // Segundo traço conecta semicolcheias contíguas; senão um gancho curto.
   const prev=i>0&&list[i-1].length===1&&list[i-1].tick+1===t.tick;
   const next=i<list.length-1&&list[i+1].length===1&&t.tick+1===list[i+1].tick;
   if(next)out+=line(xs[i],beamY+(up?9:-9),xs[i+1],beamY+(up?9:-9),COLORS.ink,5);
   else if(!prev){
    const right=i<list.length-1;
    out+=line(xs[i],beamY+(up?9:-9),xs[i]+(right?17:-17),beamY+(up?9:-9),COLORS.ink,5);
   }
  }
  out+="</g>";return out;
 }
 function tiesSvg(tokens,mode){
  let out="";
  for(let i=0;i<tokens.length-1;i++){
   const t=tokens[i],other=tokens[i+1];
   if(t.kind!=="note"||!t.tieOut||other.kind!=="note"||other.index!==t.index)continue;
   const y=mode==="melodic"?noteY(t):80;
   const x1=pos(t.tick)+11,x2=pos(other.tick)-11;
   const baseline=y+14;
   out+='<path class="score-tie" d="M '+x1+' '+baseline+' Q '+((x1+x2)/2)+' '+(baseline+15)+' '+x2+' '+baseline+'" fill="none" stroke="'+COLORS.ink+'" stroke-width="2.5" stroke-linecap="round"/>';
  }
  return out;
 }
 function svg(id,mode="melodic",seq=E.events(id)){
  if(!["rhythm","melodic"].includes(mode))throw new RangeError("Modo de partitura inválido");
  const tokens=plan(id,seq),p=E.pattern(id),groups=beamGroups(tokens);
  const byToken=new Map();
  for(const group of groups)for(const token of group.tokens)byToken.set(token,{direction:group.direction,beamY:beamHeight(group,mode)});
  let out='<svg class="score-svg" viewBox="0 0 1100 195" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escape(p.title+" — "+(mode==="melodic"?"partitura melódica":"partitura rítmica")+", compasso 4/4, agrupamento por tempos")+'">';
  out+=headerSvg(mode);
  for(const t of tokens)out+=t.kind==="note"?noteGlyph(t,mode,byToken.get(t)):restSvg(t);
  for(const group of groups)out+=beamSvg(group,mode);
  out+=tiesSvg(tokens,mode);
  out+=line(1043,mode==="melodic"?54:66,1043,mode==="melodic"?102:94,COLORS.ink,3);
  out+="</svg>";
  return out;
 }
 return{plan,svg,splitRest,splitNote,beamGroups,noteY};
});
