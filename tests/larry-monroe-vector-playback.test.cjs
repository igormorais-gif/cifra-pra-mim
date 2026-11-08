const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','laboratorio-larry-monroe');
const expected=[
  {volume:1,pages:98,staves:425,notes:3134},
  {volume:2,pages:104,staves:457,notes:3781},
  {volume:3,pages:92,staves:589,notes:5886},
  {volume:4,pages:78,staves:402,notes:3835}
];
test('Monroe: dados vetoriais completos e consistentes nos quatro volumes',()=>{
 const context={window:{}};vm.createContext(context);
 for(const item of expected){
  const js=fs.readFileSync(path.join(root,'vetor-v'+item.volume+'.js'),'utf8');
  new vm.Script(js,{filename:'vetor-v'+item.volume+'.js'}).runInContext(context);
  const encoded=context.window['MONROE_V'+item.volume];
  assert.equal(typeof encoded,'string');
  assert.match(encoded,/^[a-zA-Z0-9_\-|.]*$/);
  const pages=encoded.split('|');
  assert.equal(pages.length,item.pages);
  const staves=pages.flatMap(x=>x.split('.')).filter(Boolean);
  assert.equal(staves.length,item.staves);
  assert.equal(staves.reduce((n,x)=>n+x.length,0),item.notes);
 }
});
test('Monroe: leitor online, controles e links para o laboratório',()=>{
 const html=fs.readFileSync(path.join(root,'volumes.html'),'utf8');
 const script=html.match(/<script>([\s\S]+?)<\/script>/);
 assert.ok(script);
 new vm.Script(script[1]);
 for(const id of ['volume','page','play','tempo','clef','key','loop'])
  assert.ok(html.includes('id="'+id+'"'),id);
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.ok(index.includes('./volumes.html'));
 const book=fs.readFileSync(path.join(root,'livro.html'),'utf8');
 assert.ok(book.includes('./volumes.html'));
});