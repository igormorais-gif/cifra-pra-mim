const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','laboratorio-larry-monroe');
const idx=JSON.parse(fs.readFileSync(path.join(base,'partituras','index.json'),'utf8'));
const cat=JSON.parse(fs.readFileSync(path.join(base,'catalogo.json'),'utf8'));
const lesson7=idx.entries.filter(e=>e.volume===1&&e.sectionKey==='licao7-ritmicos');
function measures(e){
 const s=fs.readFileSync(path.join(base,e.musicXml),'utf8');
 const rows=[...s.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
 return {s,rows:rows.map((m,k)=>{
  assert.equal(Number(m[1]),k+1);
  const notes=[...m[2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(x=>x[1]);
  const d=notes.reduce((sum,n)=>sum+Number(n.match(/<duration>(\d+)<\/duration>/)?.[1]||0),0);
  assert.equal(d,12,e.id+' compasso '+(k+1));
  return notes;
 })}
}
test('Lição 7: sete estudos reais estão indexados nas páginas 61–62',()=>{
 assert.deepEqual(lesson7.map(x=>x.exerciseNumber),[9,10,11,12,13,14,15]);
 assert.deepEqual(lesson7.map(x=>x.printedPage),[61,61,61,62,62,62,62]);
 assert.ok(lesson7.every(x=>x.time==='3/4'&&x.status==='pilot'&&x.pdfSheet===(x.printedPage===61?32:33)));
 for(const s of cat.volumes[0].sheets.slice(31,33)){
  const found=s.studies.filter(x=>x.sectionKey==='licao7-ritmicos');
  assert.equal(found.length,s.sheet===32?3:4);
  assert.ok(found.every(x=>x.onlineHref.includes('/livro.html?pagina=')));
 }
});
test('MusicXML verifica compassos 3/4, colcheias, ligaduras e pontuações',()=>{
 let noteCount=0,beamCount=0,dots=0,tieStarts=0,tieStops=0;
 for(const e of lesson7){
  const {s,rows}=measures(e);
  assert.equal(rows.length,e.exerciseNumber<=11?4:8);
  assert.match(s,/<beats>3<\/beats><beat-type>4<\/beat-type>/);
  for(const row of rows)for(const n of row){
   noteCount++;
   if(n.includes('<beam number="1">'))beamCount++;
   if(n.includes('<dot/>'))dots++;
   if(n.includes('<tie type="start"/>'))tieStarts++;
   if(n.includes('<tie type="stop"/>'))tieStops++;
  }
 }
 assert.ok(noteCount>110);
 assert.ok(beamCount>20);
 assert.ok(dots>8);
 assert.equal(tieStarts,tieStops);
 assert.ok(tieStarts>=4);
});
test('As notas ligadas não recebem segundo ataque no leitor unificado',()=>{
 const html=fs.readFileSync(path.join(base,'livro.html'),'utf8');
 assert.match(html,/tieStart:ties\.includes\("start"\)/);
 assert.match(html,/tieStop:ties\.includes\("stop"\)/);
 assert.match(html,/if\(note\.rest\|\|note\.tieStop\)continue/);
 assert.match(html,/duration\+=next\.duration/);
 assert.match(html,/next\.midi!==note\.midi/);
 assert.match(html,/Curvas de ligadura/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
});
test('Lição 6 fecha os dois estudos que estavam ausentes, números 10 e 15',()=>{
 const l6=idx.entries.filter(x=>x.sectionKey==='licao6-ritmicos');
 assert.deepEqual(l6.map(e=>e.exerciseNumber),Array.from({length:18},(_,i)=>i+1));
 for(const n of [10,15]){
  const e=l6.find(x=>x.exerciseNumber===n);
  assert.ok(e);
  assert.equal(e.printedPage,n===10?52:54);
  const parsed=measures(e);
  assert.equal(parsed.rows.length,8);
 }
});
