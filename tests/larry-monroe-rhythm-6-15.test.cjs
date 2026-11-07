const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','laboratorio-larry-monroe');
const patterns={
 6:[['H','Q','Q'],['H','R2'],['R2','H'],['Q','Q','H']],
 7:[['H','R2'],['R2','H'],['Q','Q','R2'],['R2','Q','Q']],
 8:[['W'],['R2','Q','Q'],['Q','Q','Q','Q'],['R2','H']],
 9:[['Q','Q','H'],['R4'],['R2','Q','Q'],['H','Q','Q']],
 10:[['Q','Q','R2'],['R2','Q','Q'],['R2','Q','Q'],['Q','Q','R2']],
 11:[['R2','H'],['Q','Q','R2'],['R2','Q','Q'],['R2','Q','Q']],
 12:[['H','H'],['Q','Q','R2'],['R2','H'],['Q','Q','R2'],['Q','Q','Q','Q'],['R4'],['R2','H'],['Q','Q','R2']],
 13:[['H','Q','Q'],['Q','Q','R2'],['R2','Q','Q'],['R2','H'],['R2','Q','Q'],['R4'],['R2','Q','Q'],['H','R2']],
 14:[['H','Q','Q'],['H','Q','Q'],['R2','Q','Q'],['H','Q','Q'],['R2','H'],['Q','Q','R2'],['R2','H'],['R2','Q','Q']],
 15:[['R2','Q','Q'],['H','R2'],['R4'],['Q','Q','R2'],['R2','H'],['R2','H'],['Q','Q','R2'],['R2','H']]
};
const durations={Q:1,H:2,W:4,R2:2,R4:4};
function readBars(source) {
 const bars=[...source.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
 return bars.map((match,i)=>{
  assert.equal(Number(match[1]),i+1);
  const notes=[...match[2].matchAll(/<note>([\s\S]*?)<\/note>/g)];
  const names=notes.map(n=>{
   let rest=n[1].includes('<rest/>');
   let raw=n[1].match(/<duration>(\d+)<\/duration>/);
   assert.ok(raw);
   let value=Number(raw[1])/4;
   assert.ok([1,2,4].includes(value));
   if(!rest){assert.match(n[1],/<step>F<\/step><octave>4<\/octave>/)}
   return rest?'R'+value:{1:'Q',2:'H',4:'W'}[value];
  });
  assert.equal(names.reduce((sum,n)=>sum+durations[n],0),4);
  return names
 })
}
test('dez novas transcrições preservam ritmos, pausas e números de compasso',()=>{
 for(const [ex,reference] of Object.entries(patterns)){
   const file=path.join(base,'partituras','v1-ex'+String(ex).padStart(3,'0')+'.musicxml');
   const raw=fs.readFileSync(file,'utf8');
   assert.deepEqual(readBars(raw),reference,'Exercício '+ex);
   assert.match(raw,/<beats>4<\/beats><beat-type>4<\/beat-type>/);
   assert.match(raw,/revisão documental pendente/);
 }
});
test('o leitor páginas 8–9 preserva 6 pautas e 4 exercícios de duas linhas',()=>{
 const html=fs.readFileSync(path.join(base,'estudos-ritmicos-p8-9.html'),'utf8');
 assert.match(html,/id="page8"/);assert.match(html,/id="page9"/);
 assert.match(html,/four=\[6,7,8,9,10,11\]/);
 assert.match(html,/eight=\[12,13,14,15\]/);
 assert.match(html,/for\(let line=0;line<Math\.ceil\(bars\.length\/4\);line\+\+\)/);
 assert.match(html,/const rest=n\(elem,"rest"\)\.length>0/);
 assert.match(html,/function schedule\(cycle\)/);
 assert.match(html,/data-onset/);
 assert.match(html,/location\.hash\.match/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script[1]));
});
test('registro liga os dez exercícios à folha 6 e às páginas 8–9',()=>{
 const idx=JSON.parse(fs.readFileSync(path.join(base,'partituras/index.json'),'utf8'));
 const cat=JSON.parse(fs.readFileSync(path.join(base,'catalogo.json'),'utf8'));
 const entries=idx.entries.filter(e=>e.volume===1&&e.exerciseNumber>=6&&e.section==='Estudos rítmicos');
 assert.deepEqual(entries.map(e=>e.exerciseNumber),[6,7,8,9,10,11,12,13,14,15]);
 assert.ok(entries.every(e=>e.pdfSheet===6&&e.status==='pilot'));
 assert.deepEqual(entries.map(e=>e.printedPage),[8,8,8,8,8,8,9,9,9,9]);
 const leaf=cat.volumes[0].sheets[5];
 assert.equal(leaf.printedLeft,8);
 assert.equal(leaf.printedRight,9);
 assert.equal(leaf.studies.length,10);
 assert.ok(leaf.studies.every(s=>s.onlineHref==='./estudos-ritmicos-p8-9.html'));
});
test('primeiro estudo melódico possui 16 mínimas e solfejo completo de dó maior',()=>{
 const raw=fs.readFileSync(path.join(base,'partituras/v1-mel001.musicxml'),'utf8');
 const notes=[...raw.matchAll(/<note>([\s\S]*?)<\/note>/g)].map(x=>x[1]);
 const expected=['C4','D4','E4','F4','G4','A4','B4','C5','C5','B4','A4','G4','F4','E4','D4','C4'];
 assert.equal(notes.length,16);
 assert.deepEqual(notes.map(n=>{let pitch=n.match(/<step>([A-G])<\/step><octave>(\d)<\/octave>/);return pitch[1]+pitch[2]}),expected);
 assert.ok(notes.every(n=>n.includes('<duration>8</duration><type>half</type>')));
 assert.deepEqual(notes.map(n=>n.match(/<text>(.*?)<\/text>/)[1]),['do','re','mi','fa','sol','la','ti','do','do','ti','la','sol','fa','mi','re','do']);
 const idx=JSON.parse(fs.readFileSync(path.join(base,'partituras/index.json'),'utf8'));
 assert.ok(idx.entries.some(e=>e.id==='v1-mel001'&&e.sectionKey==='melodicos'));
 const player=fs.readFileSync(path.join(base,'partitura.html'),'utf8');
 assert.match(player,/secao/);
});
