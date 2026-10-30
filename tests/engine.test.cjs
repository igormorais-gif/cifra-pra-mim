const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sandbox={window:{}};
const source=fs.readFileSync(path.join(__dirname,"../src/engine.js"),"utf8");
vm.runInNewContext(source,sandbox,{filename:"src/engine.js"});
const engine=sandbox.window.CifraEngine;
const tones=s=>engine.parseChord(s).tones.map(t=>t.name+":"+t.label).join(", ");

test("tríades, menores e dominantes são reconhecidos",()=>{
  assert.equal(tones("C"),"C:1, E:3, G:5");
  assert.equal(tones("F#m7"),"E:♭7, A:♭3, C♯:5");
  assert.equal(tones("Bm7"),"A:♭7, D:♭3, F♯:5");
  assert.equal(tones("E7"),"D:♭7, G♯:3, B:5");
});

test("sétima maior e baixo invertido são distintos",()=>{
  assert.equal(tones("C7M/B"),"B:7, E:3, G:5");
  assert.equal(engine.parseChord("C7M/B").bass,"B");
  assert.equal(tones("Gm7"),"F:♭7, B♭:♭3, D:5");
});

test("sexta com #11 não recebe sétima artificial",()=>{
  assert.equal(tones("Bb6(#11)"),"B♭:1, D:3, F:5, E:♯11, G:6");
});

test("extensões e alterações são reconhecidas",()=>{
  assert.equal(tones("A7(b13)"),"G:♭7, C♯:3, F:♭13");
  assert.equal(tones("Gm7(b5)"),"F:♭7, B♭:♭3, D♭:♭5");
  assert.equal(tones("G°7"),"F♭:𝄫7, B♭:♭3, D♭:♭5");
  assert.equal(tones("C7(#9,b13)"),"B♭:♭7, E:3, A♭:♭13, D♯:♯9");
});

test("Formas Originais é uma coleção única em posição fundamental",()=>{
  const result=engine.generate("C G Am F");
  assert.equal(result.chords.length,4);
  assert.equal(result.originalTrack.length,4);
  assert.equal(result.originalTracks,undefined);
  assert.deepEqual(Array.from(result.originalTrack,x=>x.notes.map(n=>n.label).join("-")),
    ["1-3-5","1-3-5","1-♭3-5","1-3-5"]);
});

test("três adaptações começam em 135, 351 e 513, sem três formas originais",()=>{
  const result=engine.generate("F#m Bm E");
  assert.equal(result.adapted.length,3);
  assert.deepEqual(Array.from(result.adapted,t=>t[0].notes.map(n=>n.label).join("-")),
    ["1-♭3-5","♭3-5-1","5-1-♭3"]);
  assert.equal(result.adapted[0][0],result.originalTrack[0]);
  result.adapted.forEach(track=>assert.equal(track.length,3));
});

test("ponteiros de teclado respeitam a proximidade sempre que há alternativa",()=>{
  const result=engine.generate("C Am F G");
  for(const track of result.adapted){
    for(let i=1;i<track.length;i++)assert.ok(Math.abs(track[i].top-track[i-1].top)<=2);
  }
});

test("detecta acordes inválidos, entrada vazia e limites",()=>{
  assert.throws(()=>engine.generate(""),/pelo menos um acorde/);
  assert.throws(()=>engine.generate("H7"),/inválido/);
  assert.throws(()=>engine.generate(Array(49).fill("C").join(" ")),/48 acordes/);
});
