const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','laboratorio-larry-monroe');
const registry=JSON.parse(fs.readFileSync(path.join(root,'partituras','index.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalogo.json'),'utf8'));

test('O leitor único mantém todo o Volume I navegável e representa apenas partituras cadastradas',()=>{
 const html=fs.readFileSync(path.join(root,'livro.html'),'utf8');
 for(const attr of ['id="spread"','id="pagePick"','id="nextMusic"','id="play"','id="bpm"','id="loop"'])assert.ok(html.includes(attr));
 for(const frag of ['function parseMusicXML(raw)','function renderStudy(entry,music,parent)','async function openSpread(page)','function schedule(cycle)','function pitchY(n,clef)'])assert.ok(html.includes(frag));
 assert.ok(html.includes('fetch("./partituras/index.json")'));
 assert.ok(html.includes('Páginas sem transcrição aparecem identificadas'));
 assert.doesNotMatch(html,/gerar partituras não existentes/i);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
});
test('Todas as 92 páginas impressas de 4 a 95 têm localizador de folha no PDF',()=>{
 const sheets=catalog.volumes[0].sheets;
 assert.equal(sheets.length,49);
 for(let n=4;n<=49;n++){
 const leaf=sheets[n-1];
 assert.equal(leaf.printedLeft,2*n-4);
 assert.equal(leaf.printedRight,2*n-3);
 assert.equal(leaf.sourcePage,n);
 }
 assert.equal(sheets[48].printedRight,95);
});
test('15 exercícios rítmicos da Lição 3 têm compassos legíveis e colcheias agrupadas',()=>{
 const items=registry.entries.filter(x=>x.sectionKey==='licao3-ritmicos');
 assert.deepEqual(items.map(x=>x.exerciseNumber),Array.from({length:15},(_,i)=>i+1));
 assert.deepEqual(items.map(x=>x.printedPage),[...Array(5).fill(24),...Array(6).fill(25),...Array(4).fill(26)]);
 let eighths=0,beams=0,notes=0;
 for(const item of items){
  const raw=fs.readFileSync(path.join(root,item.musicXml),'utf8');
  const bars=[...raw.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(bars.length,item.exerciseNumber<=11?4:8);
  assert.ok(raw.includes('<beats>4</beats><beat-type>4</beat-type>'));
  for(let i=0;i<bars.length;i++){
   assert.equal(Number(bars[i][1]),i+1);
   const blocks=[...bars[i][2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(x=>x[1]);
   const duration=blocks.reduce((sum,n)=>sum+Number(n.match(/<duration>(\d+)<\/duration>/)?.[1]),0);
   assert.equal(duration,16,item.id+' bar '+(i+1));
   eighths+=blocks.filter(x=>x.includes('<type>eighth</type>')).length;
   beams+=blocks.filter(x=>x.includes('<beam number="1">')).length;
   notes+=blocks.filter(x=>!x.includes('<rest/>')).length;
  }
 }
 assert.ok(eighths>100);assert.ok(beams>50);assert.ok(notes>200);
});
test('Estudo melódico inicial da Lição 3 usa Fá maior e sílabas da escala',()=>{
 const item=registry.entries.find(e=>e.id==='v1-l3-m001');
 assert.ok(item);
 assert.equal(item.printedPage,27);
 assert.equal(item.sectionKey,'licao3-melodicos');
 const source=fs.readFileSync(path.join(root,item.musicXml),'utf8');
 assert.match(source,/<fifths>-1<\/fifths>/);
 assert.equal((source.match(/<duration>8<\/duration>/g)||[]).length,16);
 assert.equal((source.match(/<alter>-1<\/alter>/g)||[]).length,2);
 assert.equal((source.match(/<lyric>/g)||[]).length,16);
 assert.equal((source.match(/<measure number="/g)||[]).length,8);
});
