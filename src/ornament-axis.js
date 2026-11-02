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

 const RHYTHM_GROUPS=Object.freeze([
  {id:"one",title:"Uma nota",description:"Posição, duração e respiro antes da chegada."},
  {id:"two",title:"Duas notas",description:"Pares de semicolcheias, colcheias e síncopes."},
  {id:"phrases",title:"Três ou quatro notas",description:"Frases mais densas, com ataques e silêncios."}
 ]);
 // off = ticks anteriores à nota-alvo. offset -1 é a última
 // semicolcheia antes da chegada; length = duração medida em ticks.
 // A nota-alvo mantém rigorosamente tick e duração originais.
 const RHYTHMS=Object.freeze([
  {id:"one-sixteenth",group:"one",title:"Última semicolcheia",subtitle:"Um ataque imediatamente antes",notes:[{off:-1,length:1}]},
  {id:"one-eighth",group:"one",title:"Colcheia de chamada",subtitle:"Uma colcheia antes da chegada",notes:[{off:-2,length:2}]},
  {id:"early-sixteenth",group:"one",title:"Ataque e respiro",subtitle:"Semicolcheia seguida de silêncio",notes:[{off:-2,length:1}]},
  {id:"two-sixteenths",group:"two",title:"Duas semicolcheias",subtitle:"Duas entradas consecutivas",notes:[{off:-2,length:1},{off:-1,length:1}]},
  {id:"eighth-sixteenth",group:"two",title:"Colcheia + semicolcheia",subtitle:"Duração longa, seguida de curta",notes:[{off:-3,length:2},{off:-1,length:1}]},
  {id:"sixteenth-eighth",group:"two",title:"Semicolcheia + colcheia",subtitle:"Curta seguida de duração longa",notes:[{off:-3,length:1},{off:-2,length:2}]},
  {id:"syncope-gap",group:"two",title:"Dois ataques com respiro",subtitle:"Semicolcheias separadas por pausa",notes:[{off:-4,length:1},{off:-2,length:1}]},
  {id:"dotted-eighth",group:"two",title:"Colcheia pontuada + semicolcheia",subtitle:"Prolongamento de três subdivisões",notes:[{off:-4,length:3},{off:-1,length:1}]},
  {id:"three-sixteenths",group:"phrases",title:"Três semicolcheias",subtitle:"Escalada até a nota-alvo",notes:[{off:-3,length:1},{off:-2,length:1},{off:-1,length:1}]},
  {id:"three-with-rest",group:"phrases",title:"Três ataques e respiro",subtitle:"Pausa entre os primeiros ataques",notes:[{off:-4,length:1},{off:-2,length:1},{off:-1,length:1}]},
  {id:"four-sixteenths",group:"phrases",title:"Quatro semicolcheias",subtitle:"Um tempo completo de ornamentos",notes:[{off:-4,length:1},{off:-3,length:1},{off:-2,length:1},{off:-1,length:1}]}
 ].map(p=>Object.freeze({...p,notes:Object.freeze(p.notes.map(n=>Object.freeze(n)))})));
 function rhythm(id){
  const result=RHYTHMS.find(x=>x.id===id);
  if(!result)throw new RangeError("Fraseologia rítmica desconhecida: "+id);
  return result;
 }
 function settings(opts={}){
  const style=STYLES.find(x=>x.id===(opts.ornament??"none"));
  const target=TARGETS.find(x=>x.id===String(opts.ornamentTarget??"auto"));
  const rhythmic=rhythm(opts.ornamentRhythm??"one-sixteenth");
  if(!style||!target)throw new RangeError("Aproximação ou nota-alvo inválida");
  return{style,target,rhythmic};
 }
 function freeTargets(base,pattern=RHYTHMS[0]){
  const first=pattern.notes[0].off;
  return base.map((e,i)=>{
   const previous=i===0?null:base[i-1];
   const gapStart=previous?previous.tick+previous.length:0;
   const gap=e.tick-gapStart;
   const free=e.tick+first>=gapStart&&e.tick+first>=0;
   return{index:i,free,gapTicks:gap,requiredTicks:-first,
    tick:e.tick,at:e.at,name:e.name};
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
  const {mode}=M.option(opts),{style,target,rhythmic}=settings(opts);
  const base=M.events(id,opts);
  const opportunities=freeTargets(base,rhythmic);
  const index=target.id==="auto"?opportunities.find(o=>o.free)?.index:Number(target.id);
  const eligible=index!==undefined&&opportunities[index]?.free===true;
  if(style.id==="none")return{base,events:base,opportunities,ornament:null,ornaments:[],
    rhythmic,status:"Desligado: somente as quatro notas estruturais."};
  if(!eligible){
   const n=rhythmic.notes.length;
   const reason=target.id==="auto"
    ?"Nenhuma nota-alvo tem espaço suficiente para este desenho ("+rhythmic.title+")."
    :"A "+(Number(target.id)+1)+"ª nota-alvo não tem espaço suficiente para "+rhythmic.title+".";
   return{base,events:base,opportunities,ornament:null,ornaments:[],rhythmic,
    status:rhythmic.id==="one-sixteenth"
     ?(target.id==="auto"
       ?"Esta célula não tem semicolcheia livre imediatamente antes das notas-alvo."
       :"Não há uma semicolcheia livre imediatamente antes da "+(Number(target.id)+1)+"ª nota-alvo.")
     :reason+" Precisa de "+opportunities[index===undefined?0:index]?.requiredTicks+" subdivisões livres."};
  }
  const arrival=base[index];
  const pitch=pitchFor(arrival,mode,style);
  const ornaments=rhythmic.notes.map((part,j)=>{
   const tick=arrival.tick+part.off;
   return {...pitch,index:4+j,tick,length:part.length,at:E.beatLabel(tick),
    beat:tick/4+1,durationBeats:part.length/4,accent:tick%4===0,
    ornament:true,ornamentStyle:style.id,targetIndex:index,
    ornamentRhythm:rhythmic.id,
    label:"Auxiliar de "+arrival.name+arrival.octave};
  });
  const events=[...base,...ornaments].sort((a,b)=>a.tick-b.tick);
  const count=ornaments.length,phrase=ornaments.map(o=>o.name+o.octave+" ("+o.at+")").join(" → ");
  return{base,events,opportunities,ornament:ornaments[0],ornaments,rhythmic,
   status:rhythmic.title+": "+phrase+" → "+arrival.name+arrival.octave+
    " ("+arrival.at+"). "+count+" ataque"+(count===1?"":"s")+" auxiliar"+(count===1?"":"es")+
    "; quatro notas-alvo preservadas."};
 }
 return{STYLES,TARGETS,RHYTHM_GROUPS,RHYTHMS,rhythm,settings,freeTargets,pitchFor,analyze,events:(id,opts)=>analyze(id,opts).events};
});
