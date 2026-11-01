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
  // Todas as células são originais: quatro ataques, um compasso 4/4.
  // Agrupadas por ideia rítmica, não pela melodia de nenhum músico.
  const PATTERNS=Object.freeze([
    {id:"regular",family:"base",title:"Pulso",subtitle:"Quatro semínimas",description:"Cada altura entra no início de um tempo: referência estável.",hits:[{tick:0,length:4},{tick:4,length:4},{tick:8,length:4},{tick:12,length:4}]},
    {id:"pulso-dividido",family:"base",title:"Pulso dividido",subtitle:"Dois ataques no primeiro tempo",description:"Duas colcheias abrem a frase; o tempo 2 fica em silêncio.",hits:[{tick:0,length:2},{tick:2,length:2},{tick:8,length:4},{tick:12,length:4}]},
    {id:"contratempos",family:"sincopes",title:"Contratempos",subtitle:"Entradas em 2& e 4&",description:"Segunda e quarta notas começam no contratempo.",hits:[{tick:0,length:4},{tick:6,length:2},{tick:8,length:4},{tick:14,length:2}]},
    {id:"deslocado",family:"sincopes",title:"Deslocado",subtitle:"Entradas em 1& e 3&",description:"Dó e Sol passam para a segunda metade de seus tempos.",hits:[{tick:2,length:2},{tick:4,length:4},{tick:10,length:2},{tick:12,length:4}]},
    {id:"antecipado",family:"sincopes",title:"Antecipações",subtitle:"Última semicolcheia de cada tempo",description:"Quatro entradas antes dos tempos seguintes, com silêncios entre elas.",hits:[{tick:3,length:1},{tick:7,length:1},{tick:11,length:1},{tick:15,length:1}]},
    {id:"sincopa-longa",family:"sincopes",title:"Síncope longa",subtitle:"Contratempo sustentado",description:"Mi começa em 1& e se sustenta por três colcheias.",hits:[{tick:0,length:2},{tick:2,length:6},{tick:10,length:2},{tick:12,length:4}]},
    {id:"respiros",family:"pausas",title:"Respiros",subtitle:"Notas curtas e silêncios",description:"Quatro colcheias separadas por respiros de tamanhos diferentes.",hits:[{tick:0,length:2},{tick:5,length:2},{tick:10,length:2},{tick:14,length:2}]},
    {id:"entrada-tardia",family:"pausas",title:"Entrada tardia",subtitle:"Silêncio antes da primeira nota",description:"Uma semicolcheia de silêncio abre o compasso; há espaço após o segundo ataque.",hits:[{tick:1,length:1},{tick:2,length:2},{tick:7,length:1},{tick:12,length:4}]},
    {id:"resposta",family:"pausas",title:"Resposta",subtitle:"Espera e fechamento curto",description:"Duas notas iniciais dão lugar a um silêncio longo antes da resposta final.",hits:[{tick:0,length:4},{tick:4,length:2},{tick:11,length:1},{tick:15,length:1}]},
    {id:"duas-curtas",family:"densidade",title:"Duas curtas",subtitle:"Densidade logo no início",description:"Duas semicolcheias seguidas de uma semínima pontuada e uma nota conclusiva.",hits:[{tick:0,length:1},{tick:1,length:1},{tick:2,length:6},{tick:12,length:4}]},
    {id:"pontilhado",family:"densidade",title:"Pontilhado",subtitle:"Durações assimétricas",description:"Colcheias pontuadas e semicolcheias criam um recorte desigual do pulso.",hits:[{tick:0,length:3},{tick:5,length:1},{tick:7,length:3},{tick:12,length:4}]},
    {id:"final-ativo",family:"densidade",title:"Final ativo",subtitle:"Dois ataques próximos no final",description:"O compasso abre espaçado e concentra movimento no quarto tempo.",hits:[{tick:0,length:4},{tick:8,length:4},{tick:13,length:1},{tick:14,length:2}]}
  ]);
  const FAMILIES=Object.freeze([
    {id:"all",title:"Todas"},
    {id:"base",title:"Fundamentos"},
    {id:"sincopes",title:"Síncopes"},
    {id:"pausas",title:"Pausas"},
    {id:"densidade",title:"Densidade"}
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
  return{NOTES,PATTERNS,FAMILIES,pattern,events,beatLabel,validate,beatsToSeconds,comparePlan};
});
