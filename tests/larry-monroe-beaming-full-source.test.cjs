const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','laboratorio-larry-monroe','livro.html'),'utf8');
const begin=source.indexOf('function beamGroupsForBar(bar){');
const end=source.indexOf('function drawMusic(',begin);
const groups=new Function(source.slice(begin,end)+';return beamGroupsForBar')();
const e=(at,beam='')=>({at,duration:.5,type:'eighth',rest:false,beam});
const q=at=>({at,duration:1,type:'quarter',rest:false,beam:''});
const rest=at=>({at,duration:.5,type:'eighth',rest:true,beam:''});

test('colcheias consecutivas sem marcação MusicXML recebem barra dentro de cada tempo',()=>{
 assert.deepEqual(groups([e(0),e(.5)]).groups,[[0,1]]);
 assert.deepEqual(groups([e(0),e(.5),e(1),e(1.5)]).groups,[[0,1],[2,3]]);
 assert.deepEqual([...groups([e(0),e(.5)]).assigned],[0,1]);
});
test('grupos explícitos de quatro colcheias MusicXML são preservados, mesmo atravessando tempos',()=>{
 const src=[e(0,'begin'),e(.5,'continue'),e(1,'continue'),e(1.5,'end')];
 assert.deepEqual(groups(src).groups,[[0,1,2,3]]);
});
test('colcheias isoladas, atravessando pulsos sem marcação e separadas por pausas permanecem com bandeirola',()=>{
 assert.deepEqual(groups([e(.5),e(1)]).groups,[]);
 assert.deepEqual(groups([e(0),rest(.5),e(1)]).groups,[]);
 assert.deepEqual(groups([e(0),q(.5),e(1.5)]).groups,[]);
 assert.match(source,/n\.type==="eighth"&&!beamedNotes\.has\(ni\)/);
});
test('volume original completo pode ser carregado de forma privada em 49 folhas, com páginas originais na ausência de MusicXML',()=>{
 for(const id of ['id="sourcePdf"','id="sourceSheet"','id="sourceSide"','id="sourceCanvas"','id="sourceDetails"'])assert.ok(source.includes(id));
 assert.match(source,/for\(let sheet=1;sheet<=49;sheet\+\+\)/);
 assert.match(source,/function loadPdfJs\(/);
 assert.match(source,/async function cachedSheet\(/);
 assert.match(source,/async function paintOriginalPage\(/);
 assert.match(source,/async function loadPrivatePdf\(/);
 assert.match(source,/indexedDB\.open/);
 assert.match(source,/sourceDocument\)\{[\s\S]*?await paintOriginalPage\(number,scan\)/);
 assert.match(source,/A digitalização fica no seu aparelho, sem envio ao servidor/);
 const s=source.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(s);assert.doesNotThrow(()=>new Function(s[1]));
});
