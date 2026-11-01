const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

const LABS=[
  ["Violão","laboratorio-violao/index.html","loop"],
  ["Piano","laboratorio-piano/index.html","loop"],
  ["Cavaquinho","laboratorio-cavaquinho/index.html","loop"],
  ["Jogo 4–3–2–1","laboratorio-violao/jogo-4321/index.html","loop"],
  ["Embelezamentos","laboratorio-embelezamento/index.html","loopPair"],
  ["Improvisação","laboratorio-improviso/index.html","loop"],
  ["Transições (legado)","laboratorio.html","loop"]
];
for(const [name,file,id] of LABS){
 test("Loop acessível no player: "+name,()=>{
   const html=read(file);
   assert.match(html,new RegExp('id="'+id+'"'));
   assert.match(html,/Loop: desligado/);
   assert.match(html,/aria-pressed="false"/);
   assert.match(html,/Parar|Parar reprodução/);
 });
}
test("Embelezamentos tem Loop em ambos os players",()=>{
 const html=read("laboratorio-embelezamento/index.html");
 assert.match(html,/id="loopPair"/);
 assert.match(html,/id="loopConn"/);
 assert.match(html,/runConnectionCycle\(token\)/);
 assert.match(html,/runApproachCycle\(mode,token\)/);
});
test("Todos os módulos modernos preservam o modo ligado e cancelam por token",()=>{
 for(const [,file] of LABS.filter(x=>x[0]!=="Transições (legado)")){
  const s=read(file);
  assert.match(s,/state\.loop/,"Estado de Loop ausente em "+file);
  assert.match(s,/state\.token/,"Cancelamento por token ausente em "+file);
 }
});
test("Improvisação repete célula, comparação e metrônomo isolado",()=>{
 const html=read("laboratorio-improviso/index.html");
 for(const name of ["runSelectedCycle","runCompareCycle","runMetronomeCycle"]){
   assert.match(html,new RegExp("function "+name+"\\("));
 }
 assert.match(html,/if\(state\.loop\)runSelectedCycle/);
 assert.match(html,/if\(state\.loop\)runCompareCycle/);
 assert.match(html,/if\(state\.loop\)runMetronomeCycle/);
});
test("Laboratório legado não agenda novas passagens após Parar",()=>{
 const js=read("src/app.js");
 assert.match(js,/playbackToken\+\+/);
 assert.match(js,/clearTimeout\(loopTimer\)/);
 assert.match(js,/if\(loopEnabled\)playPass\(token\)/);
 assert.match(js,/cancelAudio\(\);selected = index;/);
});
