const {test}=require("node:test");
const assert=require("node:assert/strict");
const E=require("../src/rhythm-lab.js");
const M=require("../src/melodic-axis.js");
const O=require("../src/ornament-axis.js");
const N=require("../src/rhythm-notation.js");

test("aproximações: quatro modalidades e modo desligado",()=>{
 assert.deepEqual(O.STYLES.map(s=>s.id),[
  "none","diatonic-below","diatonic-above","chromatic-below","chromatic-above"
 ]);
 assert.equal(O.analyze("respiros").events.length,4);
 assert.equal(O.TARGETS.length,5);
});
test("nota auxiliar ocupa somente a semicolcheia realmente livre antes da chegada",()=>{
 const a=O.analyze("respiros",{ornament:"diatonic-below",mode:"dorian"});
 assert.equal(a.ornament.tick,4);
 assert.equal(a.ornament.length,1);
 assert.equal(a.ornament.index,4);
 assert.equal(a.ornament.targetIndex,1);
 assert.equal(a.ornament.name,"Ré");
 assert.equal(a.events.length,5);
 assert.deepEqual(a.events.map(n=>n.tick),[0,4,5,10,14]);
 const target=a.base[a.ornament.targetIndex];
 assert.equal(target.tick-a.ornament.tick,1);
 assert.equal(a.ornament.midi,target.midi-1);
});
test("aproximação diatônica revela a diferença real entre Jônico e Lídio",()=>{
 const common={ornament:"diatonic-below",ornamentTarget:"2"};
 const j=O.analyze("respiros",{...common,mode:"ionian"});
 const l=O.analyze("respiros",{...common,mode:"lydian"});
 assert.equal(j.ornament.name,"Fá");
 assert.equal(l.ornament.name,"Fá♯");
 assert.deepEqual(j.base.map(n=>n.midi),l.base.map(n=>n.midi));
 assert.equal(l.ornament.midi-j.ornament.midi,1);
 assert.match(N.svg("respiros","melodic",l.events),/score-accidental/);
});
test("aproximação cromática inferior sobe um semitom até o alvo",()=>{
 const a=O.analyze("respiros",{ornament:"chromatic-below",mode:"ionian"});
 assert.equal(a.ornament.name,"Ré♯");
 assert.equal(a.ornament.midi,63);
 assert.equal(a.base[1].midi,64);
 const c=O.analyze("entrada-tardia",{ornament:"chromatic-below",mode:"ionian",ornamentTarget:"0"});
 assert.equal(c.ornament.name,"Si");
 assert.equal(c.ornament.octave,3);
 assert.equal(c.ornament.midi,59);
});
test("aproximação diatônica inferior para Dó dórico mantém a sétima menor da escala",()=>{
 const a=O.analyze("entrada-tardia",{
  ornament:"diatonic-below",mode:"dorian",ornamentTarget:"0"
 });
 assert.equal(a.ornament.name,"Si♭");
 assert.equal(a.ornament.midi,58);
 assert.equal(a.ornament.octave,3);
 assert.equal(a.ornament.tick,0);
});
test("sem espaço livre, nunca sobrepõe ataques, mesmo que o usuário escolha alvo impossível",()=>{
 for(const p of E.PATTERNS){
  for(const target of O.TARGETS)for(const style of O.STYLES){
   const a=O.analyze(p.id,{ornament:style.id,ornamentTarget:target.id});
   assert.equal(a.base.length,4);
   const ordered=a.events;
   assert.ok(ordered.length===4||ordered.length===5);
   for(let i=1;i<ordered.length;i++){
    assert.ok(ordered[i-1].tick+ordered[i-1].length<=ordered[i].tick,
     p.id+" gerou sobreposição");
   }
   assert.deepEqual(ordered.filter(n=>!n.ornament).map(n=>[n.tick,n.length]),
    a.base.map(n=>[n.tick,n.length]));
   const tokens=N.plan(p.id,ordered);
   assert.equal(tokens.reduce((sum,n)=>sum+n.length,0),16);
  }
 }
 const noSpace=O.analyze("regular",{ornament:"chromatic-below"});
 assert.equal(noSpace.ornament,null);
 assert.match(noSpace.status,/não tem semicolcheia livre/);
});
test("no caso de aproximação há cinco ataques na pauta, mas quatro continuam estruturais",()=>{
 const a=O.analyze("respiros",{ornament:"chromatic-above"});
 assert.equal(a.events.filter(n=>n.ornament).length,1);
 const svg=N.svg("respiros","melodic",a.events);
 assert.match(svg,/score-approach/);
 const tokens=N.plan("respiros",a.events);
 assert.equal(tokens.filter(t=>t.kind==="note"&&t.first).length,5);
 assert.equal(tokens.filter(t=>t.kind==="note"&&t.ornament&&t.first).length,1);
 assert.equal(a.events.filter(n=>!n.ornament).length,4);
});
test("opções de ornamentação incorretas são rejeitadas",()=>{
 assert.throws(()=>O.settings({ornament:"bordadura"}),RangeError);
 assert.throws(()=>O.settings({ornamentTarget:"7"}),RangeError);
});
