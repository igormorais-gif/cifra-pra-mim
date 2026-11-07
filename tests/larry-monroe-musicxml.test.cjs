const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','laboratorio-larry-monroe');
const entries=JSON.parse(fs.readFileSync(path.join(base,'partituras','index.json'),'utf8')).entries;
const layouts=[
 [[4],[2,2],[4],[4]],
 [[2,2],[4],[1,1,1,1],[2,2]],
 [[1,1,1,1],[4],[2,1,1],[4]]
];
test('Cada MusicXML mantém 4 compassos completos de 4/4 e notas com duração correta',()=>{
 assert.ok(entries.length>=14);
 for(let i=0;i<3;i++){
  const e=entries[i];
  assert.equal(e.volume,1);
  assert.equal(e.exerciseNumber,i+1);
  assert.equal(e.pdfSheet,5);
  assert.equal(e.printedPage,7);
  assert.equal(e.status,'pilot');
  assert.ok(Object.values(e.review).every(v=>v===false));
  const source=fs.readFileSync(path.join(base,e.musicXml),'utf8');
  const measures=[...source.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(measures.length,4);
  assert.match(source,/<beats>4<\/beats><beat-type>4<\/beat-type>/);
  const observed=measures.map((m,j)=>{
   assert.equal(Number(m[1]),j+1);
   const durations=[...m[2].matchAll(/<duration>(\d+)<\/duration>/g)].map(x=>Number(x[1])/4);
   assert.equal(durations.reduce((a,b)=>a+b,0),4);
   return durations;
  });
  assert.deepEqual(observed,layouts[i]);
  assert.match(source,/não conferido independentemente/);
 }
});
test('O motor MusicXML renderiza no hub e mantém playback próprio',()=>{
 const html=fs.readFileSync(path.join(base,'partitura.html'),'utf8');
 assert.match(html,/opensheetmusicdisplay@0\.8\.3/);
 assert.match(html,/function parseMusicXml\(raw\)/);
 assert.match(html,/function scheduleCycle\(cycle\)/);
 assert.match(html,/function play\(/);
 assert.match(html,/id="notation"/);
 assert.match(html,/id="play"/);
 assert.match(html,/id="click"/);
 assert.match(html,/id="loop"/);
 const script=html.match(/<script>([\s\S]*)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
 const cat=fs.readFileSync(path.join(base,'catalogo.html'),'utf8');
 assert.match(cat,/partitura\.html\?volume=/);
});
