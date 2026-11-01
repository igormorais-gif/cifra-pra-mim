const {test}=require("node:test");
const assert=require("node:assert/strict");
const E=require("../src/rhythm-lab.js");
const M=require("../src/melodic-axis.js");
const N=require("../src/rhythm-notation.js");

test("sete modos, quatro disposições e 24 percursos: 96 combinações únicas por modo",()=>{
 assert.equal(M.MODES.length,7);
 assert.equal(M.INVERSIONS.length,4);
 assert.equal(M.PATHS.length,24);
 assert.equal(new Set(M.PATHS.map(p=>p.label)).size,24);
 for(const mode of M.MODES){
  const sequences=[];
  for(const inversion of M.INVERSIONS)for(const path of M.PATHS){
   const opts={mode:mode.id,inversion:inversion.id,path:path.id};
   const notes=M.notes(opts);
   assert.equal(notes.length,4);
   assert.equal(new Set(notes.map(n=>n.midi)).size,4);
   sequences.push(notes.map(n=>n.midi).join(","));
  }
  assert.equal(new Set(sequences).size,96,mode.id);
 }
});
test("percurso inicial é 1–3–5–7; a inversão altera registro, sem mudar os graus da seleção",()=>{
 assert.deepEqual(M.notes({}).map(n=>[n.degree,n.name,n.midi]),[
  ["1","Dó",60],["3","Mi",64],["5","Sol",67],["7","Si",71]
 ]);
 assert.deepEqual(M.notes({inversion:1}).map(n=>n.midi),[72,64,67,71]);
 assert.deepEqual(M.notes({inversion:3}).map(n=>n.midi),[72,76,79,71]);
 assert.deepEqual(M.PATHS[0].degrees,[1,3,5,7]);
 assert.equal(M.PATHS.filter(p=>p.degrees[0]===1).length,6);
});
test("escala inteira é informada, mas a melodia usa só 1, 3, 5, 7",()=>{
 assert.deepEqual(M.modalColors("dorian"),["1","2","♭3","4","5","6","♭7"]);
 assert.deepEqual(M.modalColors("phrygian"),["1","♭2","♭3","4","5","♭6","♭7"]);
 assert.deepEqual(M.modalColors("lydian"),["1","2","3","♯4","5","6","7"]);
 assert.deepEqual(M.modalColors("locrian"),["1","♭2","♭3","4","♭5","♭6","♭7"]);
 assert.deepEqual(M.distinctTetrads(),[
  ["Jônico","Lídio"],["Dórico","Frígio","Eólio"],["Mixolídio"],["Lócrio"]
 ]);
});
test("modos preservam nomes e alterações da tétrade sem inventar sonoridades",()=>{
 assert.deepEqual(M.notes({mode:"ionian"}).map(n=>n.name),["Dó","Mi","Sol","Si"]);
 assert.deepEqual(M.notes({mode:"dorian"}).map(n=>n.name),["Dó","Mi♭","Sol","Si♭"]);
 assert.deepEqual(M.notes({mode:"locrian"}).map(n=>n.name),["Dó","Mi♭","Sol♭","Si♭"]);
 assert.equal(M.chordSymbol("ionian"),"C7M");
 assert.equal(M.chordSymbol("mixolydian"),"C7");
 assert.equal(M.chordSymbol("locrian"),"Cm7(♭5)");
});
test("ritmo, modo e percurso são independentes: ticks e durações não se movem",()=>{
 for(const pattern of E.PATTERNS){
  const original=E.events(pattern.id).map(x=>[x.tick,x.length]);
  for(const mode of M.MODES)for(const inversion of M.INVERSIONS){
   const modified=M.events(pattern.id,{mode:mode.id,inversion:inversion.id,path:23});
   assert.deepEqual(modified.map(x=>[x.tick,x.length]),original);
  }
 }
});
test("partitura desenha alterações e desloca oitavas sem mudar a duração",()=>{
 for(const mode of M.MODES)for(const inversion of M.INVERSIONS)for(const path of M.PATHS){
  const ev=M.events("respiros",{mode:mode.id,inversion:inversion.id,path:path.id});
  const notation=N.plan("respiros",ev);
  assert.equal(notation.reduce((sum,x)=>sum+x.length,0),16);
  assert.deepEqual(notation.filter(t=>t.kind==="note"&&t.first).map(t=>t.midi),ev.map(t=>t.midi));
  const svg=N.svg("respiros","melodic",ev);
  assert.match(svg,/score-hit/);
  if(ev.some(n=>n.alteration==="♭"))assert.match(svg,/♭/);
 }
});
test("combinações inválidas são recusadas",()=>{
 assert.throws(()=>M.notes({mode:"inexistente"}),RangeError);
 assert.throws(()=>M.notes({inversion:4}),RangeError);
 assert.throws(()=>M.notes({path:24}),RangeError);
});

test("Registro e ordem são independentes: Dó dórico 7–3–1–5",()=>{
 const path=M.PATHS.find(x=>x.label==="7–3–1–5");
 const fundamental=M.notes({mode:"dorian",inversion:0,path:path.id});
 const second=M.notes({mode:"dorian",inversion:2,path:path.id});
 assert.deepEqual(fundamental.map(n=>n.name+n.octave),["Si♭4","Mi♭4","Dó4","Sol4"]);
 assert.deepEqual(second.map(n=>n.name+n.octave),["Si♭4","Mi♭5","Dó5","Sol4"]);
 assert.deepEqual(fundamental.map(n=>n.diatonic),second.map(n=>n.diatonic));
 const a=M.events("respiros",{mode:"dorian",inversion:0,path:path.id});
 const b=M.events("respiros",{mode:"dorian",inversion:2,path:path.id});
 assert.deepEqual(a.map(n=>[n.tick,n.length]),b.map(n=>[n.tick,n.length]));
});
