const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const E=require("../src/rhythm-lab.js");
const M=require("../src/melodic-axis.js");
const O=require("../src/ornament-axis.js");
const I=require("../src/instrument-map.js");
const N=require("../src/rhythm-notation.js");
const html=fs.readFileSync(path.join(__dirname,"../laboratorio-improviso/index.html"),"utf8");
const loopSource=fs.readFileSync(path.join(__dirname,"../src/seamless-loop.js"),"utf8");

function page(){
 let now=0,next=0;
 const timers=new Map(),audio=[];
 const setTimer=(fn,ms)=>{const id=++next;timers.set(id,{at:now+Math.max(0,ms)/1000,fn});return id};
 const clearTimer=id=>timers.delete(id);
 const sandbox={module:{exports:{}},setTimeout:setTimer,clearTimeout:clearTimer};
 vm.runInNewContext(loopSource,sandbox,{filename:"seamless-loop.js"});
 class Element{
  constructor(tag="div",dataset={}){
   this.tag=tag;this.dataset=dataset;this.children=[];this.handlers={};
   this.attrs={};this.style={};this.value="";this.checked=true;
   this.disabled=false;this.textContent="";this.innerHTML="";this.className="";
   this.classList={
    toggle:(name,value)=>{
     const flags=new Set(this.className.split(/\s+/).filter(Boolean));
     if(value===undefined)value=!flags.has(name);
     value?flags.add(name):flags.delete(name);this.className=[...flags].join(" ");
    },
    add:(...names)=>names.forEach(n=>this.classList.toggle(n,true)),
    remove:(...names)=>names.forEach(n=>this.classList.toggle(n,false))
   };
  }
  addEventListener(name,fn){this.handlers[name]=fn}
  append(...items){this.children.push(...items)}
  replaceChildren(...items){this.children=items}
  setAttribute(k,v){this.attrs[k]=String(v)}
 }
 const els=new Map();
 const scoreButtons=["rhythm","melodic"].map(v=>new Element("button",{scoreMode:v}));
 const instrumentButtons=["piano","guitar"].map(v=>new Element("button",{instrument:v}));
 const diagButtons=[4,5,6,7].map(v=>new Element("span",{diagTick:String(v)}));
 const walk=e=>e.children.flatMap(c=>[c,...walk(c)]);
 const all=()=>[...els.values()].flatMap(e=>[e,...walk(e)]);
 const document={
  getElementById(id){if(!els.has(id))els.set(id,new Element());return els.get(id)},
  createElement(name){return new Element(name)},
  createTextNode(value){const e=new Element("#text");e.textContent=value;return e},
  querySelectorAll(query){
   if(query==="[data-score-mode]")return scoreButtons;
   if(query==="[data-instrument]")return instrumentButtons;
   if(query==="[data-diag-tick]")return diagButtons;
   if(query===".subdiv,.tick")return all().filter(e=>/^(subdiv|tick)/.test(e.className));
   if(query===".sounding")return all().filter(e=>e.className.split(/\s+/).includes("sounding"));
   const m=query.match(/^\[data-index="(\d+)"\]$/);
   return m?all().filter(e=>e.dataset.index===m[1]):[];
  }
 };
 class AudioContext{
  state="running";destination={};get currentTime(){return now}
  createOscillator(){
   const osc={type:"sine",frequency:{setValueAtTime(freq){osc.freq=freq}},connect(){},
    start(at){audio.push({at,type:osc.type,midi:Math.round(69+12*Math.log2(osc.freq/440))})},
    stop(){}};
   return osc;
  }
  createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
  async resume(){}
 }
 const window={RhythmLabEngine:E,RhythmLabMelody:M,RhythmLabOrnaments:O,RhythmLabNotation:N,RhythmLabInstruments:I,
  SeamlessLoop:sandbox.module.exports,AudioContext,addEventListener(){}};
 const script=html.slice(html.lastIndexOf("<script>")+8,html.lastIndexOf("</script>"));
 vm.runInNewContext(script,{window,document,setTimeout:setTimer,clearTimeout:clearTimer});
 function advance(until){
  let count=0;
  while(true){
   if(count++>100000)throw Error("timer overflow");
   const nextJob=[...timers.entries()].sort((a,b)=>a[1].at-b[1].at)[0];
   if(!nextJob||nextJob[1].at>until+1e-9)break;
   timers.delete(nextJob[0]);now=nextJob[1].at;nextJob[1].fn();
  }
  now=until;
 }
 const notes=()=>audio.filter(x=>x.type==="triangle").sort((a,b)=>a.at-b.at);
 return {get:id=>document.getElementById(id),window,advance,notes,timers,instrumentButtons};
}
test("Registro e ordem mudam no próximo compasso sem interromper Loop ou metrônomo",async()=>{
 const ui=page(),$=ui.get;
 $("loop").handlers.click();
 await $("play").handlers.click();
 ui.advance(.6);
 const oldNotes=ui.notes().slice(0,4);
 assert.deepEqual(oldNotes.map(n=>n.midi),[60,64,67,71]);
 $("axis-inversion").handlers.change({target:{value:"2"}});
 $("axis-path").handlers.change({target:{value:"23"}});
 assert.equal($("play").disabled,true);
 assert.match($("axis-live-status").textContent,/Próxima volta disponível:/);
 assert.equal(ui.notes().length,4);
 ui.advance(3.25);
 const all=ui.notes();
 assert.deepEqual(all.slice(0,4).map(x=>x.midi),[60,64,67,71]);
 assert.deepEqual(all.slice(4,8).map(x=>x.midi),[71,67,76,72]);
 assert.equal(all[4].at-all[0].at,3);
 assert.match($("axis-live-status").textContent,/Em execução:/);
 assert.equal($("play").disabled,true);
});
test("Trocas rápidas escolhem somente a última ordem, sem reiniciar ou duplicar notas",async()=>{
 const ui=page(),$=ui.get;
 $("loop").handlers.click();
 await $("play").handlers.click();
 ui.advance(.4);
 for(const value of ["3","13","20","23"]){
  $("axis-path").handlers.change({target:{value}});
 }
 ui.advance(3.20);
 assert.equal(ui.notes().length,8);
 assert.deepEqual(ui.notes().slice(4,8).map(x=>x.midi),M.notes({path:23}).map(x=>x.midi));
 assert.equal($("play").disabled,true);
 $("stop").handlers.click();
 const previousCount=ui.notes().length;
 ui.advance(9);
 assert.equal(ui.notes().length,previousCount);
});
test("Alterar quase na virada não modifica notas já programadas",async()=>{
 const ui=page(),$=ui.get;
 $("loop").handlers.click();
 await $("play").handlers.click();
 ui.advance(2.97);
 $("axis-path").handlers.change({target:{value:"23"}});
 assert.match($("axis-live-status").textContent,/Próxima volta/);
 ui.advance(6.25);
 const arr=ui.notes();
 assert.deepEqual(arr.slice(4,8).map(x=>x.midi),[60,64,67,71]);
 assert.deepEqual(arr.slice(8,12).map(x=>x.midi),M.notes({path:23}).map(x=>x.midi));
});
test("Comparação de células usa compassos individuais e continua sem pausa",async()=>{
 const ui=page(),$=ui.get;
 $("loop").handlers.click();
 await $("compare").handlers.click();
 ui.advance(.5);
 $("axis-inversion").handlers.change({target:{value:"2"}});
 ui.advance(3.3);
 const arr=ui.notes();
 assert.equal(arr.length,8);
 assert.deepEqual(arr.slice(4,8).map(x=>x.midi),M.notes({inversion:2}).map(x=>x.midi));
 assert.ok(Math.abs(arr[4].at-arr[0].at-3)<1e-9);
});

test("Aproximação muda na próxima volta sem parar o Loop",async()=>{
 const ui=page(),$=ui.get;
 ui.window.RhythmLabUI.select("respiros");
 $("loop").handlers.click();
 await $("play").handlers.click();
 ui.advance(.5);
 $("ornament-style").handlers.change({target:{value:"diatonic-below"}});
 assert.equal($("play").disabled,true);
 assert.match($("axis-live-status").textContent,/Próxima volta disponível/);
 ui.advance(3.35);
 const notes=ui.notes();
 assert.equal(notes.length,9);
 assert.deepEqual(notes.slice(0,4).map(x=>x.midi),[60,64,67,71]);
 const applied=O.analyze("respiros",{ornament:"diatonic-below"}).events;
 assert.deepEqual(notes.slice(4).map(x=>x.midi),applied.map(x=>x.midi));
 assert.ok(Math.abs(notes[4].at-notes[0].at-3)<1e-9);
 assert.match($("ornament-status").textContent,/auxiliar|aproximação|semicolcheia/i);
 assert.match($("score").innerHTML,/score-approach/);
});
test("Aviso sem espaço e botão de demonstração em célula compatível",()=>{
 const ui=page(),$=ui.get;
 $("ornament-style").handlers.change({target:{value:"chromatic-below"}});
 assert.match($("ornament-status").textContent,/não tem semicolcheia livre/);
 assert.equal($("ornament-demo").hidden,false);
 $("ornament-demo").handlers.click();
 assert.notEqual(ui.window.RhythmLabUI.get().rhythm,"regular");
 assert.equal(ui.window.RhythmLabUI.get().events.length,5);
 assert.equal($("ornament-demo").hidden,true);
});

test("Piano e Violão alternam enquanto o Loop toca, sem reiniciar áudio",async()=>{
 const ui=page(),$=ui.get;
 assert.match($("instrument-view").innerHTML,/piano-svg/);
 assert.equal($("instrument-current").textContent,"—");
 $("loop").handlers.click();
 await $("play").handlers.click();
 ui.advance(.25);
 assert.equal($("instrument-current").textContent,"Dó4");
 ui.instrumentButtons[1].handlers.click();
 assert.match($("instrument-view").innerHTML,/guitar-svg/);
 assert.equal(ui.instrumentButtons[1].attrs["aria-pressed"],"true");
 assert.equal($("play").disabled,true);
 assert.equal(ui.notes().length,4);
 ui.advance(3.25);
 assert.equal(ui.notes().length,8);
 assert.equal($("play").disabled,true);
 ui.instrumentButtons[0].handlers.click();
 assert.match($("instrument-view").innerHTML,/piano-svg/);
 $("stop").handlers.click();
 assert.equal($("instrument-current").textContent,"—");
});
test("Gráfico permanece na frase que soa até a mudança melódica entrar na volta",async()=>{
 const ui=page(),$=ui.get;
 $("loop").handlers.click();await $("play").handlers.click();
 ui.advance(.5);
 const before=$("instrument-view").innerHTML;
 $("axis-path").handlers.change({target:{value:"23"}});
 ui.instrumentButtons[1].handlers.click();
 assert.match($("instrument-view").innerHTML,/guitar-svg/);
 ui.instrumentButtons[0].handlers.click();
 assert.equal($("instrument-view").innerHTML,before);
 ui.advance(3.20);
 assert.match($("instrument-view").innerHTML,/piano-svg/);
 assert.match($("instrument-view").innerHTML,/data-midi="71"/);
 assert.equal(ui.notes().length,8);
});
