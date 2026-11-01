const {test}=require("node:test");
const assert=require("node:assert/strict");
const E=require("../src/rhythm-lab.js");

test("há exatamente doze células originais, todas em 4/4",()=>{
 assert.equal(E.PATTERNS.length,12);
 assert.equal(new Set(E.PATTERNS.map(p=>p.id)).size,5);
 for(const p of E.PATTERNS)assert.equal(E.validate(p),true,p.id);
});
test("as células usam as mesmas quatro alturas e a mesma sequência de graus",()=>{
 for(const p of E.PATTERNS){
  assert.deepEqual(E.events(p.id).map(n=>n.midi),[60,64,67,71],p.id);
  assert.deepEqual(E.events(p.id).map(n=>n.degree),["1","3","5","7"],p.id);
 }
});
test("cada célula tem quatro ataques únicos dentro das 16 semicolcheias",()=>{
 for(const p of E.PATTERNS){
  const ev=E.events(p.id);
  assert.equal(ev.length,4,p.id);
  assert.equal(new Set(ev.map(e=>e.tick)).size,4,p.id);
  assert.ok(ev.every(e=>e.tick>=0&&e.tick<16&&e.length>0&&e.tick+e.length<=16),p.id);
 }
});
test("nenhuma nota invade a próxima: pausas e durações são explícitas",()=>{
 for(const p of E.PATTERNS){
  const ev=E.events(p.id);
  assert.ok(ev.every((e,i)=>i===3||e.tick+e.length<=ev[i+1].tick),p.id);
 }
});
test("pulso de referência usa os quatro tempos",()=>{
 assert.deepEqual(E.events("regular").map(n=>n.at),["1","2","3","4"]);
 assert.deepEqual(E.events("regular").map(n=>n.durationBeats),[1,1,1,1]);
});
test("contratempos respeitam os ataques em 2& e 4&",()=>{
 assert.deepEqual(E.events("contratempos").map(n=>n.at),["1","2&","3","4&"]);
 assert.deepEqual(E.events("contratempos").map(n=>n.tick),[0,6,8,14]);
});
test("deslocamento preserva alturas e move apenas posições de ataque",()=>{
 assert.deepEqual(E.events("deslocado").map(n=>n.at),["1&","2","3&","4"]);
 assert.deepEqual(E.events("deslocado").map(n=>n.midi),E.events("regular").map(n=>n.midi));
});
test("antecipações usam a última semicolcheia de cada tempo",()=>{
 assert.deepEqual(E.events("antecipado").map(n=>n.at),["1a","2a","3a","4a"]);
 assert.deepEqual(E.events("antecipado").map(n=>n.durationBeats),[.25,.25,.25,.25]);
});
test("respiros incluem quatro notas curtas e espaços de silêncio",()=>{
 assert.deepEqual(E.events("respiros").map(n=>n.at),["1","2e","3&","4&"]);
 assert.deepEqual(E.events("respiros").map(n=>n.length),[2,2,2,2]);
});
test("conversão de semicolcheia e BPM",()=>{
 assert.equal(E.beatsToSeconds(4,80),.75);
 assert.equal(E.beatsToSeconds(1,60),.25);
 assert.throws(()=>E.beatsToSeconds(4,0),RangeError);
 assert.throws(()=>E.beatsToSeconds(4,300),RangeError);
});
test("a comparação completa toca 48 notas e conserva um tempo de pausa entre compassos",()=>{
 const plan=E.comparePlan();
 assert.equal(plan.length,48);
 assert.deepEqual(plan.filter(e=>e.index===0).map(e=>e.globalTick),E.PATTERNS.map((p,i)=>i*20+p.hits[0].tick));
 assert.deepEqual([...new Set(plan.map(e=>e.patternId))],E.PATTERNS.map(p=>p.id));
});
test("em cada compasso, as alturas mantêm a mesma ordem na comparação",()=>{
 const plan=E.comparePlan();
 for(const p of E.PATTERNS)assert.deepEqual(plan.filter(x=>x.patternId===p.id).map(x=>x.midi),[60,64,67,71]);
});
test("rótulos das subdivisões seguem a grade 1 e & a, até o quarto tempo",()=>{
 assert.deepEqual([0,1,2,3,4,5,6,7,12,13,14,15].map(E.beatLabel),["1","1e","1&","1a","2","2e","2&","2a","4","4e","4&","4a"]);
 assert.throws(()=>E.beatLabel(16),RangeError);
});
test("padrões inexistentes e células com sobreposição são rejeitados",()=>{
 assert.throws(()=>E.events("inexistente"),RangeError);
 assert.equal(E.validate({hits:[{tick:0,length:4},{tick:3,length:2},{tick:8,length:4},{tick:12,length:4}]}),false);
});

test("quatro famílias cobrem todas as doze células originais",()=>{
 assert.deepEqual(E.FAMILIES.map(x=>x.id),["all","base","sincopes","pausas","densidade"]);
 for(const p of E.PATTERNS)assert.ok(E.FAMILIES.slice(1).some(x=>x.id===p.family),p.id);
 assert.deepEqual(E.FAMILIES.slice(1).map(f=>E.PATTERNS.filter(p=>p.family===f.id).length),[2,4,3,3]);
});
test("células exibem durações pontuadas e síncopes estruturais",()=>{
 assert.deepEqual(E.events("sincopa-longa").map(e=>[e.tick,e.length]),[[0,2],[2,6],[10,2],[12,4]]);
 assert.deepEqual(E.events("pontilhado").map(e=>e.length),[3,1,3,4]);
 assert.deepEqual(E.events("final-ativo").map(e=>e.tick),[0,8,13,14]);
});
test("comparação parcial usa somente a família pedida e pausa entre compassos",()=>{
 const ids=E.PATTERNS.filter(p=>p.family==="pausas").map(p=>p.id);
 const plan=E.comparePlan(ids);
 assert.equal(plan.length,12);
 assert.deepEqual([...new Set(plan.map(e=>e.patternId))],ids);
 assert.deepEqual(plan.filter(e=>e.index===0).map(e=>e.globalTick),ids.map((id,i)=>i*20+E.pattern(id).hits[0].tick));
});
