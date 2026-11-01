const {test}=require("node:test");
const assert=require("node:assert/strict");
const E=require("../src/rhythm-lab.js");
const N=require("../src/rhythm-notation.js");

test("as 12 partituras somam exatamente 16 semicolcheias (4/4)",()=>{
 for(const p of E.PATTERNS){
  const tokens=N.plan(p.id);
  assert.equal(tokens.reduce((sum,x)=>sum+x.length,0),16,p.id);
  assert.equal(tokens[0].tick,0,p.id);
  assert.equal(tokens.at(-1).tick+tokens.at(-1).length,16,p.id);
 }
});
test("os ataques e durações nas partituras correspondem aos eventos de áudio",()=>{
 for(const p of E.PATTERNS){
  const original=E.events(p.id);
  const pieces=N.plan(p.id).filter(x=>x.kind==="note");
  for(const e of original){
   const notes=pieces.filter(x=>x.index===e.index);
   assert.ok(notes.length>0,p.id+" nota "+e.index);
   assert.equal(notes[0].tick,e.tick,p.id);
   assert.equal(notes.reduce((sum,n)=>sum+n.length,0),e.length,p.id);
   assert.ok(notes.every(x=>x.midi===e.midi),p.id);
  }
 }
});
test("pausas cobrem os silêncios, sem notas ou pausas sobrepostas",()=>{
 for(const p of E.PATTERNS){
  const plan=N.plan(p.id);
  let time=0;
  for(const token of plan){
   assert.equal(token.tick,time,p.id);
   time+=token.length;
  }
  assert.equal(time,16,p.id);
 }
});
test("síncope de seis semicolcheias mantém uma única altura ligada sobre o pulso",()=>{
 const plan=N.plan("sincopa-longa");
 const tied=plan.filter(x=>x.kind==="note"&&x.index===1);
 assert.deepEqual(tied.map(x=>[x.tick,x.length,x.tieIn,x.tieOut]),[
  [2,2,false,true],[4,4,true,false]
 ]);
});
test("representação oferece pauta rítmica e pauta melódica 4/4",()=>{
 const a=N.svg("regular","rhythm");
 const b=N.svg("regular","melodic");
 assert.match(a,/partitura rítmica/);
 assert.match(b,/partitura melódica/);
 assert.match(a,/data-index="3"/);
 assert.match(b,/data-index="3"/);
 assert.match(b,/𝄞/);
 assert.match(a,/data-tick="12"/);
 assert.notEqual(a,b);
});
test("silêncios aparecem como pausas, sem virar notas extras",()=>{
 const score=N.svg("respiros","melodic");
 const plan=N.plan("respiros");
 assert.equal((score.match(/class="score-rest"/g)||[]).length,plan.filter(x=>x.kind==="rest").length);
 assert.equal(new Set(plan.filter(x=>x.kind==="note").map(x=>x.index)).size,4);
});
test("semicolcheias, colcheias pontuadas e ligaduras são desenhadas",()=>{
 const early=N.svg("antecipado","rhythm"),dotted=N.svg("pontilhado","melodic"),sync=N.svg("sincopa-longa","melodic");
 assert.equal((early.match(/class="score-hit"/g)||[]).length,4);
 assert.match(dotted,/r="3.2"/);
 assert.match(sync,/class="score-tie"/);
});
test("tempo e duração dos gráficos permanecem dentro do mesmo compasso",()=>{
 for(const p of E.PATTERNS){
  const ticks=N.plan(p.id).map(n=>n.tick);
  assert.ok(ticks.every(x=>x>=0&&x<16),p.id);
  assert.equal(N.svg(p.id,"rhythm").includes('viewBox="0 0 1100 195"'),true);
 }
});
test("não aceita tipos de pauta inexistentes",()=>{
 assert.throws(()=>N.svg("regular","violin"),RangeError);
 assert.throws(()=>N.plan("inexistente"),RangeError);
});
