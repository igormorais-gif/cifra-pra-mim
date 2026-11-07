const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source=fs.readFileSync(path.join(__dirname, '..', 'laboratorio-larry-monroe', 'index.html'),'utf8');
function parseExercise(number) {
  const start=source.indexOf(" "+number+":[",source.indexOf("const studies="));
  assert.ok(start>=0,"Exercício "+number+" presente no catálogo musical");
  const close=source.indexOf("\n ]",start);
  assert.ok(close>start,"Fim do exercício "+number);
  const raw=source.slice(start,close);
  return [...raw.matchAll(/\{measure:(\d+),beat:(\d+),duration:(\d+),pitch:"([^"]+)",frequency:([\d.]+),type:"(\w+)"\}/g)]
    .map(x=>({measure:+x[1],beat:+x[2],duration:+x[3],pitch:x[4],frequency:+x[5],type:x[6]}));
}
function checkMeasures(notes){
 assert.equal(notes.reduce((sum,n)=>sum+n.duration,0),16);
 for(let m=1;m<=4;m++){
  const bar=notes.filter(n=>n.measure===m);
  let beat=0;
  for(const note of bar){
   assert.equal(note.beat,beat,"Sem lacunas nem sobreposição");
   assert.ok(["quarter","half","whole"].includes(note.type));
   assert.equal(note.duration,{quarter:1,half:2,whole:4}[note.type]);
   assert.equal(note.pitch,"F4");
   assert.ok(Math.abs(note.frequency-349.228231)<.01);
   beat+=note.duration;
  }
  assert.equal(beat,4,"Compasso deve ter quatro tempos");
 }
}
test("Exercício 2: duas mínimas, semibreve, quatro semínimas, duas mínimas",()=>{
 const n=parseExercise(2);checkMeasures(n);
 assert.deepEqual(n.filter(x=>x.measure===1).map(x=>x.duration),[2,2]);
 assert.deepEqual(n.filter(x=>x.measure===2).map(x=>x.duration),[4]);
 assert.deepEqual(n.filter(x=>x.measure===3).map(x=>x.duration),[1,1,1,1]);
 assert.deepEqual(n.filter(x=>x.measure===4).map(x=>x.duration),[2,2]);
});
test("Exercício 3: quatro semínimas, semibreve, mínima mais duas semínimas, semibreve",()=>{
 const n=parseExercise(3);checkMeasures(n);
 assert.deepEqual(n.filter(x=>x.measure===1).map(x=>x.duration),[1,1,1,1]);
 assert.deepEqual(n.filter(x=>x.measure===2).map(x=>x.duration),[4]);
 assert.deepEqual(n.filter(x=>x.measure===3).map(x=>x.duration),[2,1,1]);
 assert.deepEqual(n.filter(x=>x.measure===4).map(x=>x.duration),[4]);
});
test("Partituras 2 e 3 mantêm pautas independentes, layout original contínuo e seleção integrada",()=>{
 assert.match(source,/id="score2"/);
 assert.match(source,/id="score3"/);
 assert.match(source,/data-exercise="2"/);
 assert.match(source,/data-exercise="3"/);
 assert.match(source,/function drawStudy\(id\)/);
 assert.match(source,/function selectStudy\(n\)/);
 assert.match(source,/Transcrição musical em conferência/);
});
