const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','laboratorio-larry-monroe');
const expected={
4:[['B3','D4','E4'],['D4','E4','F4'],['E4','F4','G4','A4'],['A4'],['G4','A4','B4','C5'],['B4','A4','G4','F4'],['G4','F4','E4','D4'],['B3']],
5:[['C4','D4','E4','D4'],['E4','F4','G4','A4'],['G4','F4','E4','D4'],['E4','E4'],['F4','G4','A4','G4'],['F4','D4','C4'],['D4','F4','E4','D4'],['B3']]
};
test('estudos melódicos 4 e 5 possuem oito compassos e 4 tempos em cada um',()=>{
 for(let k of [4,5]){
  const xml=fs.readFileSync(path.join(base,'partituras','v1-mel'+String(k).padStart(3,'0')+'.musicxml'),'utf8');
  const bars=[...xml.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(bars.length,8);
  assert.deepEqual(bars.map((bar,i)=>{
   assert.equal(Number(bar[1]),i+1);
   const notes=[...bar[2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(m=>m[1]);
   assert.equal(notes.reduce((n,s)=>n+Number(s.match(/<duration>(\d+)<\/duration>/)[1])/4,0),4);
   return notes.map(s=>{const m=s.match(/<step>([A-G])<\/step><octave>(\d)<\/octave>/);return m[1]+m[2]})
  }),expected[k]);
 }
});
test('o livro da página 12 apresenta dois estudos executáveis com cabeçalhos originais',()=>{
 const h=fs.readFileSync(path.join(base,'estudos-melodicos-p12.html'),'utf8');
 assert.match(h,/id="page12"/);
 assert.match(h,/id="page13"/);
 assert.match(h,/id="ex-mel4"/);
 assert.match(h,/id="ex-mel5"/);
 assert.match(h,/id="score4"/);
 assert.match(h,/id="score5"/);
 assert.match(h,/function schedule\(cycle\)/);
 assert.match(h,/function readXml\(raw\)/);
 const s=h.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(s);
 assert.doesNotThrow(()=>new Function(s[1]));
 const cat=JSON.parse(fs.readFileSync(path.join(base,'catalogo.json'),'utf8'));
 assert.deepEqual(cat.volumes[0].sheets[7].studies.map(s=>s.exercise),[4,5,6,7]);
 assert.deepEqual(cat.volumes[0].sheets[7].studies.map(s=>s.state),['pilot','pilot','pending','pending']);
 const index=JSON.parse(fs.readFileSync(path.join(base,'partituras/index.json'),'utf8')).entries;
 assert.ok(index.some(x=>x.id==='v1-mel004'));
 assert.ok(index.some(x=>x.id==='v1-mel005'));
});
