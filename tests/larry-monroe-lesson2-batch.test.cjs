const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","laboratorio-larry-monroe");
const catalogue=JSON.parse(fs.readFileSync(path.join(root,"catalogo.json"),"utf8"));
const registry=JSON.parse(fs.readFileSync(path.join(root,"partituras","index.json"),"utf8"));
const lesson=registry.entries.filter(x=>x.sectionKey==="licao2-ritmicos");
const expectedPage=n=>n<=5?15:n<=11?16:n<=17?17:18;
const expectedPdf=n=>n<=5?9:n<=17?10:11;

test("Lição Dois contém 21 exercícios, na ordem impressa e com seção independente",()=>{
 assert.deepEqual(lesson.map(x=>x.exerciseNumber),Array.from({length:21},(_,i)=>i+1));
 assert.ok(lesson.every(x=>x.volume===1&&x.status==="pilot"&&Object.values(x.review).every(v=>v===false)));
 for(const ex of lesson){
  assert.equal(ex.printedPage,expectedPage(ex.exerciseNumber));
  assert.equal(ex.pdfSheet,expectedPdf(ex.exerciseNumber));
  assert.match(ex.musicXml,/^partituras\/v1-l2-r\d{3}\.musicxml$/);
 }
});
test("Todos os 21 MusicXML têm compassos completos em 4/4, incluindo notas, pausas e pontos",()=>{
 let notes=0,rests=0,dots=0;
 for(const item of lesson){
  const source=fs.readFileSync(path.join(root,item.musicXml),"utf8");
  const bars=[...source.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
  assert.equal(bars.length,item.exerciseNumber<=17?4:8);
  assert.match(source,/<beats>4<\/beats><beat-type>4<\/beat-type>/);
  assert.match(source,/PILOTO/);
  for(let i=0;i<bars.length;i++){
   assert.equal(Number(bars[i][1]),i+1);
   const blocks=[...bars[i][2].matchAll(/<note>([\s\S]*?)<\/note>/g)].map(x=>x[1]);
   assert.ok(blocks.length>0,"Compassos sem eventos "+item.id);
   let total=0;
   for(const b of blocks){
    const duration=Number(b.match(/<duration>(\d+)<\/duration>/)?.[1]);
    assert.ok([4,8,12,16].includes(duration),item.id);
    const dotted=b.includes("<dot/>");
    assert.equal(dotted,duration===12);
    if(dotted){dots++;}
    const isRest=b.includes("<rest/>");
    if(isRest){rests++;}else{notes++;assert.match(b,/<step>F<\/step><octave>4<\/octave>/)}
    total+=duration;
   }
   assert.equal(total,16,"Compasso 4/4 incompleto em "+item.id+" #"+(i+1));
  }
 }
 assert.ok(notes>80);assert.ok(rests>40);assert.ok(dots>0);
});
test("Catálogo do PDF distingue folha 9 (p.14–15), folha 10 (p.16–17), folha 11 (p.18–19)",()=>{
 const sheets=catalogue.volumes[0].sheets;
 assert.deepEqual([9,10,11].map(n=>[sheets[n-1].printedLeft,sheets[n-1].printedRight]),[[14,15],[16,17],[18,19]]);
 assert.deepEqual([9,10,11].map(n=>sheets[n-1].studies.filter(x=>x.sectionKey==="licao2-ritmicos").length),[5,12,4]);
 for(const s of sheets.slice(8,11))for(const study of s.studies.filter(x=>x.sectionKey==="licao2-ritmicos")){
  assert.equal(study.onlineHref,"./licao2-ritmicos-p15-18.html");
  assert.equal(study.state,"pilot");
 }
});
test("Leitor de quatro páginas usa o mesmo player e notação, sem duplicar o layout",()=>{
 const html=fs.readFileSync(path.join(root,"licao2-ritmicos-p15-18.html"),"utf8");
 for(const i of [15,16,17,18])assert.match(html,new RegExp('id="page'+i+'"'));
 assert.match(html,/first=\[1,2,3,4,5\]/);
 assert.match(html,/fourth=\[18,19,20,21\]/);
 assert.match(html,/const ids=\[\.\.\.first,\.\.\.second,\.\.\.third,\.\.\.fourth\]/);
 assert.match(html,/v1-l2-r/);
 assert.match(html,/note\.duration===3/);
 assert.match(html,/if\(note\.duration===1\)/);
 assert.match(html,/function schedule\(cycle\)/);
 assert.match(html,/id="loop"/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
 const cat=fs.readFileSync(path.join(root,"catalogo.html"),"utf8");
 assert.match(cat,/encodeURIComponent\(item\.sectionKey\)/);
});
