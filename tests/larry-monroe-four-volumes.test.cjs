const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'laboratorio-larry-monroe','catalogo.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'laboratorio-larry-monroe','catalogo.html'),'utf8');
const book=fs.readFileSync(path.join(root,'laboratorio-larry-monroe','index.html'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('os quatro volumes e as 186 folhas de fonte estão presentes e em ordem',()=>{
  assert.deepEqual(data.volumes.map(v=>v.volume),[1,2,3,4]);
  assert.deepEqual(data.volumes.map(v=>v.source.pdfSheets),[49,52,46,39]);
  assert.equal(data.volumes.reduce((n,v)=>n+v.sheets.length,0),186);
  for(const v of data.volumes) {
    assert.equal(v.sheets.length,v.source.pdfSheets);
    assert.deepEqual(v.sheets.map(s=>s.sheet),Array.from({length:v.source.pdfSheets},(_,i)=>i+1));
    assert.deepEqual(v.sheets.map(s=>s.sourcePage),v.sheets.map(s=>s.sheet));
    assert.match(v.source.driveUrl,/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view$/);
  }
});

test('fonte escaneada, página impressa e exercício são entidades diferentes',()=>{
  const sheet=data.volumes[0].sheets[4];
  assert.equal(sheet.sheet,5);
  assert.equal(sheet.printedLeft,6);
  assert.equal(sheet.printedRight,7);
  assert.deepEqual(sheet.studies.map(e=>e.exercise),[1,2,3,4,5]);
  assert.deepEqual(sheet.studies.map(e=>e.state),['pilot','pilot','pilot','pending','pending']);
  assert.ok(sheet.studies.every(e=>e.printedPage===7));
});

test('não declarar transcrição verificada antes de auditoria',()=>{
  const all=data.volumes.flatMap(v=>v.sheets.flatMap(s=>s.studies));
  assert.equal(all.filter(s=>s.state==='pilot').length,3);
  assert.equal(all.filter(s=>s.state==='verified').length,0);
  assert.equal(data.volumes.filter(v=>v.sheets.some(s=>s.status!=='not_inventoried')).length,1);
});

test('índice permite selecionar os quatro volumes e as páginas de origem',()=>{
 assert.match(html,/id="volumes"/);
 assert.match(html,/id="pages"/);
 assert.match(html,/id="sourceLink"/);
 assert.match(html,/id="togglePreview"/);
 assert.match(html,/id="drivePreview"/);
 assert.match(html,/function chooseVolume\(next\)/);
 assert.match(html,/function chooseSheet\(next\)/);
 assert.match(html,/aria-label="Folhas digitalizadas"/);
 assert.match(home,/href="laboratorio-larry-monroe\/catalogo\.html"/);
 assert.match(book,/href="\.\/catalogo\.html"/);
});

test('navegador recebe JavaScript sintaticamente válido',()=>{
 const match=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(match,'A página contém controlador');
 assert.doesNotThrow(()=>new Function(match[1]));
});
