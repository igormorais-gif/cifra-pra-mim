/**
 * Instrumentos do Laboratório: teclado e violão em afinação padrão.
 * Toda posição corresponde ao MIDI efetivamente programado no áudio.
 * A forma é um apoio visual; extensões prosseguem para outra região
 * sem alterar oitava, ordem ou duração da frase.
 */
(function(root,factory){
 const M=typeof module!=="undefined"&&module.exports
   ?require("./melodic-axis.js"):root.RhythmLabMelody;
 const api=factory(M);
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.RhythmLabInstruments=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(M){
 "use strict";
 const STRINGS=Object.freeze([
  {string:1,name:"mi",midi:64},{string:2,name:"si",midi:59},
  {string:3,name:"sol",midi:55},{string:4,name:"ré",midi:50},
  {string:5,name:"lá",midi:45},{string:6,name:"mi",midi:40}
 ]);
 const BLACK=new Set([1,3,6,8,10]);
 const NAMES=["Dó","Dó♯","Ré","Ré♯","Mi","Fá","Fá♯","Sol","Sol♯","Lá","Lá♯","Si"];
 const label=midi=>NAMES[(midi%12+12)%12]+(Math.floor(midi/12)-1);
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const degreeOf=n=>n.diatonic??Number(String(n.degree).replace(/[^0-9]/g,""));
 function fingerings(midi,maxFret=24){
  if(!Number.isInteger(midi)||midi<40||midi>88)throw new RangeError("Nota fora do braço de violão suportado");
  return STRINGS.map(s=>({string:s.string,fret:midi-s.midi,midi}))
   .filter(p=>p.fret>=0&&p.fret<=maxFret);
 }
 function chooseTriad(options){
  let best=null,bestCost=Infinity;
  function visit(i,used){
   if(i===3){
    const frets=used.map(x=>x.fret);
    const span=Math.max(...frets)-Math.min(...frets);
    // Forma compacta: preferir três cordas adjacentes e evitar cordas soltas.
    const strings=used.map(x=>x.string);
    const sspan=Math.max(...strings)-Math.min(...strings);
    const duplicates=3-new Set(strings).size;
    const ascending=strings[0]>=strings[1]&&strings[1]>=strings[2];
    const cost=span*15+(span>4?45:0)+sspan*4+duplicates*18+
      (ascending?0:10)+used.filter(x=>x.fret===0).length*15+
      frets.reduce((a,b)=>a+b,0)*.28;
    if(cost<bestCost){best=used.slice();bestCost=cost}
    return;
   }
   for(const position of options[i])visit(i+1,[...used,position]);
  }
  visit(0,[]);
  return best;
 }
 function guitar(events,opts={}){
  const pool=M.pool(opts);
  const triad=[1,3,5].map(degree=>({...pool[degree],diatonic:degree}));
  const choices=triad.map(n=>fingerings(n.midi));
  const core=chooseTriad(choices);
  if(!core)throw new Error("Tríade fora da extensão do violão");
  const min=Math.min(...core.map(p=>p.fret)),max=Math.max(...core.map(p=>p.fret));
  const coreByDegree=new Map(triad.map((n,i)=>[n.diatonic,core[i]]));
  const mapped=[];
  let previous=null;
  for(const ev of events){
   const d=degreeOf(ev);
   const base=coreByDegree.get(d);
   const candidates=fingerings(ev.midi);
   if(!candidates.length)throw new Error("Não há posição para "+label(ev.midi));
   const chosen=base&&pool[d]?.midi===ev.midi
    ?base
    :candidates.reduce((best,p)=>{
      const cost=x=>{
       const outside=x.fret<min?min-x.fret:x.fret>max?x.fret-max:0;
       const travel=previous?Math.abs(x.fret-previous.fret)*.45+Math.abs(x.string-previous.string)*1.5:0;
       return outside*5+travel+(x.fret===0?8:0);
      };
      return !best||cost(p)<cost(best)?p:best;
     },null);
   const continuation=chosen.fret<min||chosen.fret>max;
   mapped.push({...ev,...chosen,continuation});
   previous=chosen;
  }
  const lower=Math.min(min,...mapped.map(n=>n.fret)),upper=Math.max(max,...mapped.map(n=>n.fret));
  return{triad,core,base:{from:min,to:max},positions:mapped,
   extension:mapped.filter(n=>n.continuation),
   bounds:{from:Math.max(0,lower-1),to:Math.min(24,Math.max(upper+1,lower+5))},
   seventh:pool[7].midi-pool[5].midi,
   label:opts.inversion===0||opts.inversion===undefined?"Forma 1–3–5":"Forma · "+M.option(opts).inversion.order};
 }
 function keyboard(events){
  const lo=Math.min(...events.map(x=>x.midi)),hi=Math.max(...events.map(x=>x.midi));
  const from=Math.floor(lo/12)*12,to=Math.max(from+24,Math.ceil((hi+1)/12)*12);
  return{from,to,notes:events.map(x=>({...x})),whites:Array.from({length:to-from+1},(_,i)=>from+i).filter(m=>!BLACK.has(m%12)),blacks:Array.from({length:to-from},(_,i)=>from+i).filter(m=>BLACK.has(m%12))};
 }
 function pianoSvg(events){
  const k=keyboard(events),unit=42,margin=12,width=k.whites.length*unit+margin*2,height=196;
  const positions=new Map(k.whites.map((m,i)=>[m,i]));
  let out='<svg class="instrument-svg piano-svg" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Teclado: '+esc(events.map(x=>x.name+x.octave).join(", "))+'">';
  out+='<rect x="0" y="0" width="'+width+'" height="'+height+'" rx="12" fill="#172532"/>';
  for(const midi of k.whites){
   const index=positions.get(midi),x=margin+index*unit;
   const used=events.some(n=>n.midi===midi);
   out+='<g class="piano-key'+(used?' in-path':'')+'" data-midi="'+midi+'"><rect x="'+x+'" y="12" width="'+(unit-2)+'" height="154" rx="4" fill="#f4f1e9" stroke="#8997a1" stroke-width="1"/>';
   if(used)out+='<circle class="key-target" cx="'+(x+unit/2-1)+'" cy="139" r="12" fill="#a4c5c5"/><text x="'+(x+unit/2-1)+'" y="143" text-anchor="middle" font-size="12" fill="#143140" font-weight="800">'+esc(label(midi).replace(/[0-9]/g,""))+'</text>';
   else if(midi%12===0)out+='<text x="'+(x+unit/2-1)+'" y="155" text-anchor="middle" font-size="10" fill="#677883">'+esc(label(midi))+'</text>';
   out+='</g>';
  }
  for(const midi of k.blacks){
   const prev=positions.get(midi-1),x=margin+(prev+1)*unit-13;
   const used=events.some(n=>n.midi===midi);
   out+='<g class="piano-key black-key'+(used?' in-path':'')+'" data-midi="'+midi+'"><rect x="'+x+'" y="12" width="25" height="94" rx="3" fill="#182a35" stroke="#526575"/>';
   if(used)out+='<circle class="key-target" cx="'+(x+12.5)+'" cy="73" r="11" fill="#d4b08a"/><text x="'+(x+12.5)+'" y="77" text-anchor="middle" font-size="11" font-weight="800" fill="#223542">'+esc(label(midi).replace(/[0-9]/g,""))+'</text>';
   out+='</g>';
  }
  out+='</svg>';return out;
 }
 function guitarSvg(events,opts={}){
  const g=guitar(events,opts),from=g.bounds.from,to=g.bounds.to;
  const unit=68,origin=78,width=(to-from+1)*unit+origin+20,height=256,top=54,spacing=28;
  const coreStart=origin+(g.base.from-from)*unit;
  const coreWidth=(g.base.to-g.base.from+1)*unit;
  let out='<svg class="instrument-svg guitar-svg" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Braço de violão: '+esc(events.map(x=>x.name+x.octave).join(", "))+'">';
  out+='<rect x="0" y="0" width="'+width+'" height="'+height+'" rx="12" fill="#172532"/>';
  out+='<rect x="'+coreStart+'" y="'+(top-14)+'" width="'+coreWidth+'" height="'+(5*spacing+28)+'" rx="6" fill="#365163" fill-opacity=".43" stroke="#7995a0" stroke-dasharray="4 5"/>';
  for(let fret=from;fret<=to;fret++){
   const x=origin+(fret-from)*unit;
   out+='<text x="'+(x+unit/2)+'" y="30" text-anchor="middle" fill="#c3d1d9" font-size="14" font-weight="700">'+fret+'</text>';
   if(fret>0)out+='<line x1="'+x+'" y1="'+(top-8)+'" x2="'+x+'" y2="'+(top+5*spacing+8)+'" stroke="#899caa" stroke-width="3"/>';
  }
  for(const s of STRINGS){
   const y=top+(s.string-1)*spacing;
   out+='<text x="43" y="'+(y+5)+'" fill="#c3d1d9" font-size="12" text-anchor="end">'+s.name+'</text>';
   out+='<line x1="'+origin+'" y1="'+y+'" x2="'+(origin+(to-from+1)*unit)+'" y2="'+y+'" stroke="#8ca3af" stroke-width="'+(1+(s.string-1)*.28)+'"/>';
  }
  for(const [i,p] of g.positions.entries()){
   const x=origin+(p.fret-from+.5)*unit,y=top+(p.string-1)*spacing;
   const role=p.ornament?" ornament":"";
   const cont=p.continuation?" next-form":"";
   out+='<g class="guitar-mark'+role+cont+'" data-midi="'+p.midi+'" data-index="'+p.index+'">';
   out+='<circle cx="'+x+'" cy="'+y+'" r="12.5" fill="'+(p.continuation?"#d7ab7e":p.ornament?"#c9b89d":"#8fbdc2")+'" stroke="#183344" stroke-width="2"/>';
   out+='<text x="'+x+'" y="'+(y+4.5)+'" text-anchor="middle" fill="#102c3b" font-size="12" font-weight="800">'+esc(String(p.degree).replace(/[^0-9♭♯]/g,""))+'</text>';
   out+='</g>';
  }
  out+='</svg>';return out;
 }
 return{STRINGS,fingerings,guitar,keyboard,pianoSvg,guitarSvg,label};
});
