const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','laboratorio-larry-monroe');
const expected={
 6:[['G4','F4','E4'],['C4','B3'],['A3','B3','C4'],['E4'],['D4','E4','F4','G4'],['F4','G4','A4','G4'],['G4','F4','E4'],['D4']],
 7:[['E4','F4','G4'],['A4','B4'],['B4','B4','A4','G4'],['E4'],['D4','C4','B3','A3'],['B3','C4','E4'],['G4','A4','B4','C5'],['C5']]
};
test('estudos 6 e 7: alturas e durações registradas em 8 compassos completos',()=>{
 for(let n of [6,7]){
  const xml=fs.readFileSync(path.join(root,'partituras','v1-mel'+String(n).padStart(3,'0')+'.musicxml'),'utf8');
  const bars=[...xml.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(bars.length,8);
  assert.deepEqual(bars.map((m,i)=>{
   assert.equal(Number(m[1]),i+1);
   const notes=[...m[2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(v=>v[1]);
   assert.equal(notes.reduce((s,v)=>s+Number(v.match(/<duration>(\d+)<\/duration>/)[1])/4,0),4);
   return notes.map(v=>{const m=v.match(/<step>([A-G])<\/step><octave>(\d)<\/octave>/);return m[1]+m[2]})
  }),expected[n]);
 }
});
test('página 12 mantém 4 estudos com partitura SVG e reprodutor compartilhado',()=>{
 const html=fs.readFileSync(path.join(root,'estudos-melodicos-p12.html'),'utf8');
 for(let n of [4,5,6,7]){
  assert.match(html,new RegExp('id="score'+n+'"'));
  assert.match(html,new RegExp('id="ex-mel'+n+'"'));
 }
 assert.match(html,/for\(let id of \[4,5,6,7\]\)/);
 assert.match(html,/function schedule\(cycle\)/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
 const cat=JSON.parse(fs.readFileSync(path.join(root,'catalogo.json'),'utf8'));
 assert.deepEqual(cat.volumes[0].sheets[7].studies.map(x=>x.state),['pilot','pilot','pilot','pilot']);
});
