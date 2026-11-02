/**
 * Eixo de aproximações: notas auxiliares inseridas em silêncio real,
 * sem alterar os quatro ataques originais nem a duração da frase.
 * Nota de chegada: quatro notas estruturais definidas pelo eixo melódico.
 */
(function(root,factory){
 const E=typeof module!=="undefined"&&module.exports?require("./rhythm-lab.js"):root.RhythmLabEngine;
 const M=typeof module!=="undefined"&&module.exports?require("./melodic-axis.js"):root.RhythmLabMelody;
 const api=factory(E,M);
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.RhythmLabOrnaments=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(E,M){
 "use strict";
 const STYLES=Object.freeze([
  {id:"none",label:"Sem embelezamento"},
  {id:"diatonic-below",label:"Aproximação diatônica inferior"},
  {id:"diatonic-above",label:"Aproximação diatônica superior"},
  // C.S. excluído por decisão metodológica: estudo específico de baixos, não deste laboratório.
  {id:"chromatic-below",label:"Aproximação cromática inferior"}
 ]);
 const TARGETS=Object.freeze([
  {id:"auto",label:"Primeiro alvo com espaço"},
  ...[0,1,2,3].map(i=>({id:String(i),label:String(i+1)+"ª nota-alvo"}))
 ]);
 const NATURAL=[0,2,4,5,7,9,11];
 const LETTERS=["C","D","E","F","G","A","B"];
 const NAMES=["Dó","Ré","Mi","Fá","Sol","Lá","Si"];
 function settings(opts={}){
  const style=STYLES.find(x=>x.id===(opts.ornament??"none"));
  const target=TARGETS.find(x=>x.id===String(opts.ornamentTarget??"auto"));
  if(!style||!target)throw new RangeError("Aproximação ou nota-alvo inválida");
  return{style,target};
 }
 function freeTargets(base){
  return base.map((e,i)=>{
   const previous=i===0?null:base[i-1];
   const free=e.tick>0&&(!previous||previous.tick+previous.length<=e.tick-1);
   return{index:i,free,tick:e.tick,at:e.at,name:e.name};
  });
 }
 function pitchFor(target,mode,style){
  const degree=target.diatonic-1;
  const down=style.id.endsWith("below");
  const k=(degree+(down?6:1))%7;
  const shift=(down&&degree===0)?-12:(!down&&degree===6)?12:0;
  const midi=style.id.startsWith("chromatic")
   ?target.midi+(down?-1:1)
   :target.midi+mode.scale[k]-mode.scale[degree]+shift;
  const octave=target.octave+(shift/12);
  const natural=60+12*(octave-4)+NATURAL[k];
  const difference=midi-natural;
  if(difference< -2||difference>2)throw new Error("Alteração de nota fora do limite");
  const alt=difference===-2?"♭♭":difference===-1?"♭":difference===1?"♯":difference===2?"𝄪":"";
  return{midi,name:NAMES[k]+alt,letter:LETTERS[k],octave,degree:alt+String(k+1),
   alteration:alt,diatonic:k+1};
 }
 function analyze(id,opts={}){
  const {mode}=M.option(opts),{style,target}=settings(opts);
  const base=M.events(id,opts);
  const opportunities=freeTargets(base);
  const index=target.id==="auto"?opportunities.find(o=>o.free)?.index:Number(target.id);
  const eligible=index!==undefined&&opportunities[index]?.free===true;
  if(style.id==="none")return{base,events:base,opportunities,ornament:null,
    status:"Desligado: somente as quatro notas estruturais."};
  if(!eligible){
   return{base,events:base,opportunities,ornament:null,
    status:target.id==="auto"
     ?"Esta célula não tem semicolcheia livre imediatamente antes das notas-alvo."
     :"Não há uma semicolcheia livre imediatamente antes da "+(Number(target.id)+1)+"ª nota-alvo."};
  }
  const arrival=base[index];
  const pitch=pitchFor(arrival,mode,style);
  const tick=arrival.tick-1;
  const ornament={...pitch,index:4,tick,length:1,at:E.beatLabel(tick),
   beat:tick/4+1,durationBeats:.25,accent:tick%4===0,
   ornament:true,ornamentStyle:style.id,targetIndex:index,
   label:"Aproximação de "+arrival.name+arrival.octave};
  const events=[...base,ornament].sort((a,b)=>a.tick-b.tick);
  return{base,events,opportunities,ornament,
   status:"Aproximação "+ornament.name+ornament.octave+" → "+arrival.name+arrival.octave+
   " (grau "+ornament.degree+" → "+arrival.degree+"), na semicolcheia anterior à chegada."};
 }
 return{STYLES,TARGETS,settings,freeTargets,pitchFor,analyze,events:(id,opts)=>analyze(id,opts).events};
});
