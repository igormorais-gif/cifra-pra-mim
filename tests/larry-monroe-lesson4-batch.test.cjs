const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..","laboratorio-larry-monroe");
const idx=JSON.parse(fs.readFileSync(path.join(root,"partituras","index.json"),"utf8"));
const cat=JSON.parse(fs.readFileSync(path.join(root,"catalogo.json"),"utf8"));
test("Lição 4 tem 15 estudos ordenados nas páginas 32, 33 e 34",()=>{
 const items=idx.entries.filter(x=>x.sectionKey==="licao4-ritmicos");
 assert.deepEqual(items.map(x=>x.exerciseNumber),Array.from({length:15},(_,i)=>i+1));
 assert.deepEqual(items.map(x=>x.printedPage),[...Array(5).fill(32),...Array(6).fill(33),...Array(4).fill(34)]);
 assert.ok(items.every(x=>x.status==="pilot"&&Object.values(x.review).every(Boolean)===false));
});
test("Lição 4 tem 4/4 íntegro em cada compasso, incluindo semínimas pontuadas e colcheias",()=>{
 const items=idx.entries.filter(x=>x.sectionKey==="licao4-ritmicos");let dotted=0,eighth=0;
 for(const x of items){
  const raw=fs.readFileSync(path.join(root,x.musicXml),"utf8");
  const bars=[...raw.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(bars.length,x.exerciseNumber<=11?4:8);
  for(let i=0;i<bars.length;i++){
   assert.equal(Number(bars[i][1]),i+1);
   const notes=[...bars[i][2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(y=>y[1]);
   const dur=notes.reduce((s,y)=>s+Number(y.match(/<duration>(\d+)<\/duration>/)?.[1]),0);
   assert.equal(dur,16,x.id+":"+i);
   for(const n of notes){if(n.includes("<dot/>")){assert.match(n,/<duration>6<\/duration>|<duration>12<\/duration>/);dotted++}
   if(n.includes("<type>eighth</type>"))eighth++}
  }
 }
 assert.ok(dotted>15);assert.ok(eighth>80);
});
test("Leitor do livro escreve semínimas pontuadas com cabeça preenchida",()=>{
 const html=fs.readFileSync(path.join(root,"livro.html"),"utf8");
 assert.match(html,/filled=\["quarter","eighth","16th","32nd"\]/);
 const main=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 assert.match(main,/href="laboratorio-larry-monroe\/livro\.html\?pagina=24"/);
});
