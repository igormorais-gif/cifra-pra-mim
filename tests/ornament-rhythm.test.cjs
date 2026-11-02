const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const E=require("../src/rhythm-lab.js");
const M=require("../src/melodic-axis.js");
const O=require("../src/ornament-axis.js");
const N=require("../src/rhythm-notation.js");
const html=fs.readFileSync(path.join(__dirname,"../laboratorio-improviso/index.html"),"utf8");

test("O eixo tem 11 fraseologias em três famílias, separadas do ritmo estrutural",()=>{
 assert.equal(O.RHYTHMS.length,11);
 assert.deepEqual(O.RHYTHM_GROUPS.map(x=>x.id),["one","two","phrases"]);
 assert.deepEqual(O.RHYTHMS.map(x=>x.notes.length),[1,1,1,2,2,2,2,2,3,3,4]);
 assert.equal(E.PATTERNS.length,12);
 assert.ok(!O.STYLES.some(x=>x.id==="chromatic-above"));
});
test("Respiros acolhe três semicolcheias antes de Mi sem alterar as quatro notas-alvo",()=>{
 const a=O.analyze("respiros",{ornament:"diatonic-below",ornamentRhythm:"three-sixteenths"});
 assert.deepEqual(a.ornaments.map(x=>[x.tick,x.length]),[[2,1],[3,1],[4,1]]);
 assert.deepEqual(a.ornaments.map(x=>x.name),["Ré","Ré","Ré"]);
 assert.deepEqual(a.base.map(x=>[x.tick,x.length]),E.events("respiros").map(x=>[x.tick,x.length]));
 assert.deepEqual(a.events.map(x=>x.tick),[0,2,3,4,5,10,14]);
 assert.equal(N.plan("respiros",a.events).reduce((n,t)=>n+t.length,0),16);
});
test("Quatro semicolcheias exigem quatro subdivisões disponíveis",()=>{
 const a=O.analyze("respiros",{ornament:"chromatic-below",ornamentRhythm:"four-sixteenths"});
 assert.equal(a.ornaments.length,0);
 assert.match(a.status,/espaço suficiente/);
 const b=O.analyze("resposta",{ornament:"chromatic-below",ornamentRhythm:"four-sixteenths"});
 assert.deepEqual(b.ornaments.map(x=>x.tick),[7,8,9,10]);
 assert.equal(b.ornaments.length,4);
 assert.equal(b.events.length,8);
 assert.deepEqual(b.base.map(x=>[x.tick,x.length]),E.events("resposta").map(x=>[x.tick,x.length]));
});
test("Colcheia pontuada e semicolcheia são escritas sem alterar a métrica",()=>{
 const a=O.analyze("resposta",{ornament:"diatonic-above",ornamentRhythm:"dotted-eighth"});
 assert.deepEqual(a.ornaments.map(x=>[x.tick,x.length]),[[7,3],[10,1]]);
 const notation=N.plan("resposta",a.events);
 assert.equal(notation.reduce((s,n)=>s+n.length,0),16);
 assert.match(N.svg("resposta","melodic",a.events),/score-dot/);
});
test("A frase usa notas auxiliares mensuradas, sem antecipar um alvo ocupado",()=>{
 for(const pattern of E.PATTERNS){
  for(const rhythm of O.RHYTHMS){
   const result=O.analyze(pattern.id,{ornament:"diatonic-below",ornamentRhythm:rhythm.id});
   for(let i=1;i<result.events.length;i++){
    assert.ok(result.events[i-1].tick+result.events[i-1].length<=result.events[i].tick,
      "Sobreposição em "+pattern.id+" / "+rhythm.id);
   }
   assert.deepEqual(result.events.filter(n=>!n.ornament).map(n=>[n.tick,n.length]),
      E.events(pattern.id).map(n=>[n.tick,n.length]));
  }
 }
});
test("Modo, ordem e registro não modificam a estrutura rítmica do ornamento",()=>{
 const common={ornament:"diatonic-below",ornamentRhythm:"three-sixteenths"};
 const ionian=O.analyze("respiros",{...common,mode:"ionian",inversion:0,path:0});
 const dorian=O.analyze("respiros",{...common,mode:"dorian",inversion:3,path:23});
 assert.deepEqual(ionian.ornaments.map(n=>[n.tick,n.length]),dorian.ornaments.map(n=>[n.tick,n.length]));
 assert.deepEqual(ionian.base.map(n=>[n.tick,n.length]),dorian.base.map(n=>[n.tick,n.length]));
 assert.notDeepEqual(ionian.base.map(n=>n.midi),dorian.base.map(n=>n.midi));
});
test("O aplicativo mostra famílias, seleção e indisponibilidade sem esconder os ritmos",()=>{
 assert.match(html,/id="ornament-rhythm-sections"/);
 assert.match(html,/function rhythmGlyph\(pattern\)/);
 assert.match(html,/for\(const group of O\.RHYTHM_GROUPS\.filter\(g=>g\.id===state\.ornamentGroup\)\)/);
 assert.match(html,/O\.freeTargets\(result\.base,pattern\)/);
 assert.match(html,/aria-pressed/);
 assert.match(html,/changeAxis\("ornamentRhythm",pattern\.id\)/);
 assert.match(html,/ornamentRhythm:state\.ornamentRhythm/);
});
test("Cromático Superior não pode voltar como estilo ou frase rítmica",()=>{
 assert.throws(()=>O.settings({ornament:"chromatic-above"}),RangeError);
 assert.throws(()=>O.settings({ornamentRhythm:"chromatic-above"}),RangeError);
 assert.ok(!O.STYLES.some(x=>x.id==="chromatic-above"));
 assert.ok(!O.RHYTHMS.some(x=>x.id.includes("chromatic-above")));
});
