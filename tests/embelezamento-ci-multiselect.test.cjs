const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

function setup(){
 const html=fs.readFileSync(path.join(__dirname,"../laboratorio-embelezamento/index.html"),"utf8");
 const begin=html.indexOf("<script>",html.indexOf("</head>"))+8;
 const src=html.slice(begin,html.lastIndexOf("</script>"));
 const elements=new Map(),sounds=[];
 class Node{
  constructor(tag,dataset={}){this.tag=tag;this.dataset=dataset;this.children=[];this.attrs={};this.hidden=false;this.disabled=false;this.value="";this.textContent="";this.innerHTML="";
   this.classList={items:new Set(),add:n=>this.classList.items.add(n),remove:n=>this.classList.items.delete(n),toggle:(n,force)=>{if(force===undefined)force=!this.classList.items.has(n);if(force)this.classList.items.add(n);else this.classList.items.delete(n)}}}
  append(...xs){this.children.push(...xs)}
  replaceChildren(...xs){this.children=xs}
  setAttribute(k,v){this.attrs[k]=String(v)}
  getBoundingClientRect(){return{width:1080}}
  querySelector(tag){return new Node(tag)}
 }
 const groups={};
 for(const [name,key,values] of [
   ["target","target",["1","3","5"]],["conn-index","connIndex",["0","1"]],
   ["kind","kind",["ci","di","ds","diatonic","chromatic"]],["form","form",["135","351","513"]],
   ["group","group",["321","432"]],["quality","quality",["major","minor"]],
   ["instrument","instrument",["piano","guitar"]],["conn-group","connGroup",["321","432"]]
 ])groups["[data-"+name+"]"]=values.map(v=>new Node("button",{[key]:v}));
 const document={
  getElementById(id){if(!elements.has(id))elements.set(id,new Node(id));return elements.get(id)},
  createElement:t=>new Node(t),createElementNS:(_,t)=>new Node(t),
  querySelectorAll:s=>groups[s]||[],querySelector:s=>new Node(s),
  documentElement:new Node("html")
 };
 class AudioContext{
  currentTime=0;sampleRate=1000;state="running";destination={};
  createGain(){return{gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
  createOscillator(){const o={type:"sine",frequency:{setValueAtTime(freq,when){o.freq=freq;o.when=when}},connect(){},start(){sounds.push({type:o.type,midi:Math.round(69+12*Math.log2(o.freq/440)),when:o.when})},stop(){}};return o}
  createConvolver(){return{connect(){},buffer:null}}
  createBiquadFilter(){return{type:"lowpass",frequency:{value:1000},connect(){}}}
  createBuffer(_,len){return{getChannelData(){return new Float32Array(len)}}}
 }
 const window={innerWidth:1024,location:{search:""},AudioContext};
 new Function("document","window","setTimeout","clearTimeout",src)(document,window,()=>1,()=>{});
 return{app:window.CifraPraMimEmbelezamento,buttons:groups,el:id=>document.getElementById(id),sounds};
}
test("C.I.1, C.I.3 e C.I.5 são botões independentes, inclusive sem seleção",()=>{
 const {app,buttons,el}=setup();
 const b=buttons["[data-target]"];
 assert.deepEqual(app.get().ciSelected,["1"]);
 b[2].onclick();assert.deepEqual(app.get().ciSelected,["1","5"]);
 b[1].onclick();assert.deepEqual(app.get().ciSelected,["1","3","5"]);
 b[0].onclick();assert.deepEqual(app.get().ciSelected,["3","5"]);
 b[2].onclick();b[1].onclick();assert.deepEqual(app.get().ciSelected,[]);
 assert.equal(el("playTour").disabled,true);
 assert.equal(el("motion").textContent,"Nenhum C.I. selecionado");
 assert.deepEqual(b.map(x=>x.attrs["aria-pressed"]),["false","false","false"]);
});
test("violão C/513/321 preserva o localizador e dois C.I. aparecem ao mesmo tempo",()=>{
 const {app,buttons,el}=setup();
 app.show("C","513","1","guitar","major","321");
 buttons["[data-target]"][2].onclick();
 assert.equal(app.get().bass.string,5);
 assert.equal(app.get().bass.fret,15);
 assert.equal(el("guitar").children.filter(n=>n.tag==="text"&&n.textContent==="C.I.").length,2);
 assert.deepEqual(app.get().ciSelected,["1","5"]);
});
test("áudio toca somente os C.I. escolhidos, sem modificar botões",()=>{
 const {app,buttons,el,sounds}=setup();
 app.show("C","513","1","guitar","major","321");
 buttons["[data-target]"][2].onclick();
 el("playTour").onclick();
 const sung=sounds.filter(n=>n.type==="sine").map(n=>n.midi);
 assert.deepEqual(sung,[66,67,71,72]);
 assert.deepEqual(app.get().ciSelected,["1","5"]);
 sounds.length=0;
 el("playTriad").onclick();
 const withChord=sounds.filter(n=>n.type==="sine").map(n=>n.midi);
 assert.ok(!withChord.includes(75),"não deve soar C.I.3");
 assert.ok(withChord.includes(66)&&withChord.includes(71));
 assert.deepEqual(app.get().ciSelected,["1","5"]);
});
test("a multi-seleção do C.I. não altera os botões de conexão",()=>{
 const {app,buttons}=setup();
 buttons["[data-target]"][1].onclick();
 buttons["[data-kind]"][3].onclick();
 buttons["[data-conn-index]"][1].onclick();
 assert.deepEqual(app.get().connSelected,[0,1]);
 buttons["[data-kind]"][0].onclick();
 assert.deepEqual(app.get().ciSelected,["1","3"]);
});

test("D.I. e D.S. usam a nota diatônica vizinha, não uma terça cromática fixa",()=>{
 const {app,buttons,el}=setup();
 app.show("C","513","3","piano","major","321");
 buttons["[data-kind]"][1].onclick();
 assert.equal(app.get().kind,"di");
 assert.equal(el("motion").textContent,"Ré → Mi");
 assert.equal(el("moveDetail").textContent,"D.I.3 · 2 semitons abaixo");
 buttons["[data-kind]"][2].onclick();
 assert.equal(app.get().kind,"ds");
 assert.equal(el("motion").textContent,"Fá → Mi");
 assert.equal(el("moveDetail").textContent,"D.S.3 · 1 semitom acima");
 buttons["[data-kind]"][0].onclick();
 assert.equal(el("motion").textContent,"Ré♯ → Mi");
});
test("C/513/321 com D.I. e D.S. mantém baixo na casa 15 e várias bolinhas ativas",()=>{
 const {app,buttons,el}=setup();
 app.show("C","513","1","guitar","major","321");
 buttons["[data-target]"][2].onclick();
 for(const [kindIndex,label] of [[1,"D.I."],[2,"D.S."]]){
  buttons["[data-kind]"][kindIndex].onclick();
  const data=app.get();
  assert.equal(data.bass.string,5);
  assert.equal(data.bass.fret,15);
  assert.deepEqual(data.ciSelected,["1","5"]);
  assert.equal(el("guitar").children.filter(n=>n.tag==="text"&&n.textContent===label).length,2);
 }
});
test("D.I. e D.S. percorrem só os alvos marcados e mantêm as outras conexões",()=>{
 const {app,buttons,el,sounds}=setup();
 app.show("C","513","1","guitar","major","321");
 buttons["[data-target]"][2].onclick();
 buttons["[data-kind]"][1].onclick();
 el("playTour").onclick();
 assert.deepEqual(sounds.filter(n=>n.type==="sine").map(n=>n.midi),[65,67,71,72]);
 sounds.length=0;
 buttons["[data-kind]"][2].onclick();
 el("playTour").onclick();
 assert.deepEqual(sounds.filter(n=>n.type==="sine").map(n=>n.midi),[69,67,74,72]);
 assert.deepEqual(app.get().ciSelected,["1","5"]);
 buttons["[data-kind]"][3].onclick();
 buttons["[data-conn-index]"][1].onclick();
 assert.deepEqual(app.get().connSelected,[0,1]);
});
