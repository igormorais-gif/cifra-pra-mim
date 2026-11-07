const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','laboratorio-larry-monroe');
const expected={
 2:[['B3','C4'],['E4','C4'],['D4','E4'],['F4','E4'],['F4','G4'],['A4','G4'],['A4','B4'],['C5']],
 3:[['C5','B4'],['A4'],['A4','G4'],['G4'],['A4','G4'],['F4','E4'],['D4','C4'],['B3']]
};
function load(n){return fs.readFileSync(path.join(root,'partituras','v1-mel'+String(n).padStart(3,'0')+'.musicxml'),'utf8')}
test('melódicos 2–3 têm oito compassos completos e notas/pautas sequenciadas',()=>{
 for(const [str,bars] of Object.entries(expected)){
  const raw=load(Number(str));
  assert.match(raw,/transcription-state/);
  const mm=[...raw.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(mm.length,8);
  const observed=mm.map((m,i)=>{
   assert.equal(Number(m[1]),i+1);
   const ns=[...m[2].matchAll(/<note>([\s\S]*?)<\/note>/g)];
   const sum=ns.reduce((n,v)=>{const match=v[1].match(/<duration>(\d+)<\/duration>/);return n+Number(match[1])/4},0);
   assert.equal(sum,4);
   return ns.map(v=>{const m=v[1].match(/<step>([A-G])<\/step><octave>(\d)<\/octave>/);assert.ok(m);return m[1]+m[2]})
  });
  assert.deepEqual(observed,bars);
 }
});
test('leitor da página 11 busca MusicXML dos 3 melódicos e seleciona exercício pelo link',()=>{
 const html=fs.readFileSync(path.join(root,'estudos-melodicos-p10-11.html'),'utf8');
 for(let i=1;i<=3;i++){
  assert.match(html,new RegExp('id="ex-mel'+i+'"'));
  assert.match(html,new RegExp('id="melScore'+i+'"'));
  assert.match(html,new RegExp('data-mel="'+i+'"'));
 }
 assert.match(html,/const files=\[1,2,3\]/);
 assert.match(html,/fetch\(file\)/);
 assert.match(html,/location\.hash\.match/);
 const script=html.match(/<script>([\s\S]+?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
});
test('catálogo mantém numeração melódica separada dos rítmicos',()=>{
 const r=JSON.parse(fs.readFileSync(path.join(root,'partituras/index.json'),'utf8')).entries;
 const m=r.filter(x=>x.volume===1&&x.sectionKey==='melodicos');
 assert.deepEqual(m.slice(0,3).map(x=>x.exerciseNumber),[1,2,3]);
 assert.ok(m.slice(0,3).every(x=>x.pdfSheet===7&&x.printedPage===11&&x.status==='pilot'));
 const c=JSON.parse(fs.readFileSync(path.join(root,'catalogo.json'),'utf8'));
 assert.deepEqual(c.volumes[0].sheets[6].studies.map(s=>s.state),['pilot','pilot','pilot']);
});
