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
 assert.match(html,/function scheduleConnectionCycle\(/);
 assert.match(html,/function playApproach\(/);
 assert.equal((html.match(/window\.SeamlessLoop\.create/g)||[]).length,2);
});
test("Todos os laboratórios usam o mesmo relógio musical, sem pausas artificiais",()=>{
 for(const [name,file] of LABS){
  const html=read(file);
  assert.match(html,/seamless-loop\.js\?v=8/,name);
  const code=file==="laboratorio.html"?read("src/app.js"):html;
  assert.match(code,/SeamlessLoop\.create/,name);
  assert.doesNotMatch(code,/await (?:wait|pause|delay)\(130\)/,name);
 }
});
test("Módulos modernos cancelam o transport ao apertar Parar",()=>{
 for(const [,file] of LABS.filter(x=>x[0]!=="Transições (legado)")){
  const s=read(file);
  assert.match(s,/state\.token/);
  assert.match(s,/loopClock\.cancel\(\)|loopTransport\.cancel\(\)/,file);
 }
});
test("Improvisação usa relógio comum para célula, comparação e metrônomo",()=>{
 const html=read("laboratorio-improviso/index.html");
 assert.equal((html.match(/window\.SeamlessLoop\.create/g)||[]).length,3);
 assert.match(html,/cycleSeconds:4\*beat/);
 assert.match(html,/cycleSeconds:4\*beat,\s*shouldRepeat:\(\)=>barsScheduled<compared\.length\|\|state\.loop/);
 assert.match(html,/cycleSeconds:beat\*4/);
});
test("Laboratório legado cancela as vozes ao mudar de exercício",()=>{
 const js=read("src/app.js");
 assert.match(js,/playbackToken\+\+/);
 assert.match(js,/loopClock\.cancel\(\)/);
 assert.match(js,/schedulePass\(at,token\)/);
 assert.match(js,/cancelAudio\(\);selected = index;/);
});
