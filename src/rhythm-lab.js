/**
 * Cifra pra Mim · Laboratório de Ritmo e Intervalos
 * Células rítmicas originais: nenhum lick de terceiro é reproduzido.
 * Um compasso de 4/4, grade de 16 semicolcheias.
 */
(function(root,factory){
  const engine=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=engine;
  if(root)root.RhythmLabEngine=engine;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const NOTES=Object.freeze([
    {degree:"1",name:"Dó",midi:60},
    {degree:"3",name:"Mi",midi:64},
    {degree:"5",name:"Sol",midi:67},
    {degree:"7",name:"Si",midi:71}
  ]);
  // tick = 1 semicolcheia (1/4 de tempo). Quatro inícios, quatro notas, um compasso.
  const PATTERNS=Object.freeze([
    {id:"regular",title:"Pulso",subtitle:"Quatro semínimas",description:"Uma nota em cada tempo; referência para comparar todos os deslocamentos.",hits:[{tick:0,length:4},{tick:4,length:4},{tick:8,length:4},{tick:12,length:4}]},
    {id:"contratempos",title:"Contratempos",subtitle:"Acentos fora do eixo",description:"Mi e Si entram no contratempo; a sequência de alturas continua idêntica.",hits:[{tick:0,length:4},{tick:6,length:2},{tick:8,length:4},{tick:14,length:2}]},
    {id:"deslocado",title:"Deslocado",subtitle:"Entradas após o pulso",description:"Dó e Sol chegam no meio do tempo; Mi e Si sustentam o eixo seguinte.",hits:[{tick:2,length:2},{tick:4,length:4},{tick:10,length:2},{tick:12,length:4}]},
    {id:"antecipado",title:"Antecipações",subtitle:"Última semicolcheia do tempo",description:"Cada nota antecipa o próximo pulso; há espaço entre os ataques.",hits:[{tick:3,length:1},{tick:7,length:1},{tick:11,length:1},{tick:15,length:1}]},
    {id:"respiros",title:"Respiros",subtitle:"Frase com pausas",description:"Ataques curtos com silêncios planejados antes dos próximos graus.",hits:[{tick:0,length:2},{tick:5,length:2},{tick:10,length:2},{tick:14,length:2}]}
  ]);
  const beatLabel=tick=>{
    if(!Number.isInteger(tick)||tick<0||tick>15)throw new RangeError("Semicolcheia inválida");
    return String(Math.floor(tick/4)+1)+["","e","&","a"][tick%4];
  };
  function pattern(id){
    const item=PATTERNS.find(x=>x.id===id);
    if(!item)throw new RangeError("Célula rítmica desconhecida: "+id);
    return item;
  }
  function validate(item){
    if(!item||!Array.isArray(item.hits)||item.hits.length!==4)return false;
    return item.hits.every((h,i)=>{
      const next=item.hits[i+1];
      return Number.isInteger(h.tick)&&Number.isInteger(h.length)&&h.length>0&&
        h.tick>=0&&h.tick<16&&h.tick+h.length<=16&&(!next||h.tick+h.length<=next.tick);
    });
  }
  function events(id){
    const p=pattern(id);
    if(!validate(p))throw new Error("Célula inconsistente: "+id);
    return p.hits.map((h,i)=>({
      ...NOTES[i],index:i,tick:h.tick,length:h.length,
      beat:h.tick/4+1,at:beatLabel(h.tick),durationBeats:h.length/4,
      accent:h.tick%4===0
    }));
  }
  function beatsToSeconds(ticks,bpm){
    if(!Number.isFinite(bpm)||bpm<30||bpm>240)throw new RangeError("Andamento fora de 30–240 BPM");
    return ticks*60/bpm/4;
  }
  function comparePlan(ids=PATTERNS.map(p=>p.id),pauseBeats=1){
    if(!Number.isFinite(pauseBeats)||pauseBeats<0)throw new RangeError("Pausa inválida");
    const out=[];
    ids.forEach((id,i)=>{
      const offset=i*(16+pauseBeats*4);
      for(const e of events(id))out.push({...e,patternId:id,globalTick:offset+e.tick});
    });
    return out;
  }
  PATTERNS.forEach(p=>{if(!validate(p))throw new Error("Padrão inválido: "+p.id)});
  return{NOTES,PATTERNS,pattern,events,beatLabel,validate,beatsToSeconds,comparePlan};
});
