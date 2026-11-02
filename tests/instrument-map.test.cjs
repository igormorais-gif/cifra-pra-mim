const {test}=require("node:test");
const assert=require("node:assert/strict");
const E=require("../src/rhythm-lab.js");
const M=require("../src/melodic-axis.js");
const O=require("../src/ornament-axis.js");
const I=require("../src/instrument-map.js");

test("Forma 1–3–5 de Dó maior e sétima quatro semitons acima da quinta",()=>{
 const opts={mode:"ionian",inversion:0,path:0};
 const events=M.events("regular",opts),g=I.guitar(events,opts);
 assert.deepEqual(g.positions.map(x=>x.midi),[60,64,67,71]);
 assert.deepEqual(g.core.map(x=>[x.string,x.fret]),[[3,5],[2,5],[1,3]]);
 assert.equal(g.seventh,4);
 assert.equal(g.positions[3].fret,7);
 assert.equal(g.positions[3].string,1);
 assert.equal(g.positions[3].continuation,true);
 assert.deepEqual(g.base,{from:3,to:5});
 assert.match(I.guitarSvg(events,opts),/next-form/);
});
test("Sétima menor respeita os três semitons acima da quinta, sem inventar sétima maior",()=>{
 const opts={mode:"mixolydian",inversion:0,path:0};
 const g=I.guitar(M.events("regular",opts),opts);
 assert.equal(g.positions[2].midi,67);
 assert.equal(g.positions[3].midi,70);
 assert.equal(g.seventh,3);
 assert.equal(g.positions[3].fret,6);
});
test("Modos com quinta diminuta mantêm as relações reais entre quinta e sétima",()=>{
 const opts={mode:"locrian",inversion:0,path:0};
 const g=I.guitar(M.events("regular",opts),opts);
 assert.equal(g.positions[2].midi,66);
 assert.equal(g.positions[3].midi,70);
 assert.equal(g.seventh,4);
});
test("Toda digitação exibida no violão produz a nota MIDI executada",()=>{
 for(const mode of M.MODES)for(const inversion of M.INVERSIONS)for(const path of M.PATHS){
  const opts={mode:mode.id,inversion:inversion.id,path:path.id};
  const notes=M.events("regular",opts),g=I.guitar(notes,opts);
  assert.equal(g.positions.length,4);
  for(const x of g.positions){
   assert.ok(x.string>=1&&x.string<=6);
   assert.ok(x.fret>=0&&x.fret<=24);
   assert.equal(x.midi,I.STRINGS.find(s=>s.string===x.string).midi+x.fret);
  }
  assert.match(I.guitarSvg(notes,opts),/class="instrument-svg guitar-svg"/);
  assert.match(I.pianoSvg(notes),/class="instrument-svg piano-svg"/);
 }
});
test("Piano destaca as alturas reais de cada evento, incluindo oitavas",()=>{
 const opts={mode:"dorian",inversion:2,path:23};
 const notes=M.events("respiros",opts),svg=I.pianoSvg(notes);
 for(const n of notes)assert.match(svg,new RegExp('data-midi="'+n.midi+'"'));
 assert.notEqual(notes[0].midi,notes[3].midi);
});
test("Ornamentos aparecem nos visores sem deslocar notas-alvo",()=>{
 const opts={mode:"ionian",inversion:0,path:0,ornament:"diatonic-below",ornamentRhythm:"three-sixteenths"};
 const notes=O.events("respiros",opts);
 assert.equal(notes.length,7);
 const keys=I.keyboard(notes),guitar=I.guitar(notes,opts);
 assert.equal(guitar.positions.length,7);
 assert.ok(notes.every(x=>keys.whites.includes(x.midi)||keys.blacks.includes(x.midi)));
 assert.equal(notes.filter(n=>!n.ornament).length,4);
 assert.equal(notes.filter(n=>n.ornament).length,3);
 assert.match(I.guitarSvg(notes,opts),/ornament/);
});
test("Não há digitação inventada para uma nota fora do braço",()=>{
 assert.throws(()=>I.fingerings(90),RangeError);
 assert.throws(()=>I.fingerings(39),RangeError);
});
