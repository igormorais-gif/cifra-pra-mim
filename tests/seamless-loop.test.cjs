const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","src","seamless-loop.js"),"utf8");

function simulator(){
 const audio={currentTime:0};
 let elapsed=0,nextId=1;
 const jobs=new Map();
 const sandbox={
  module:{exports:{}},
  setTimeout(fn,ms){const id=nextId++;jobs.set(id,{fn,at:elapsed+Math.max(0,ms)/1000});return id},
  clearTimeout(id){jobs.delete(id)}
 };
 vm.runInNewContext(source,sandbox,{filename:"seamless-loop.js"});
 function advance(until){
  let safety=0;
  while(true){
   if(++safety>100000)throw new Error("Scheduler travou");
   const due=[...jobs.entries()].sort((a,b)=>a[1].at-b[1].at)[0];
   if(!due||due[1].at>until+1e-9)break;
   jobs.delete(due[0]);
   elapsed=due[1].at;audio.currentTime=elapsed;
   due[1].fn();
  }
  elapsed=until;audio.currentTime=until;
 }
 return {clock:sandbox.module.exports,audio,advance,jobs};
}
test("O relógio mantém as voltas exatamente periódicas, sem lacunas",()=>{
 for(const duration of [0.5,1.5,3,6.03]){
  const {clock,audio,advance}=simulator();
  const starts=[];let finished=0;
  const runner=clock.create({
   audio,cycleSeconds:duration,
   schedule:(at)=>starts.push(at),
   shouldRepeat:()=>starts.length<5,
   onFinish:()=>finished++
  });
  advance(duration*6+1);
  assert.equal(starts.length,5,"ciclos em "+duration+" s");
  for(let i=1;i<starts.length;i++){
   assert.ok(Math.abs(starts[i]-starts[i-1]-duration)<1e-8,
    "Descontinuidade entre ciclos de "+duration+" s");
  }
  assert.equal(finished,1);
  assert.equal(runner.active,false);
 }
});
test("O ciclo seguinte é agendado antecipadamente, não ao fim do anterior",()=>{
 const {clock,audio,advance}=simulator();
 let starts=[];
 clock.create({audio,cycleSeconds:2,schedule:at=>starts.push(at),shouldRepeat:()=>true});
 advance(1.45);
 assert.equal(starts.length,2);
 assert.ok(Math.abs(starts[0]-.09)<1e-9);
 assert.ok(Math.abs(starts[1]-2.09)<1e-9);
 assert.ok(audio.currentTime<starts[1]);
});
test("Parar cancela futuras iterações e impede callback final",()=>{
 const {clock,audio,advance,jobs}=simulator();
 const starts=[];let finished=0;
 const runner=clock.create({
  audio,cycleSeconds:2,schedule:at=>starts.push(at),
  shouldRepeat:()=>true,onFinish:()=>finished++
 });
 advance(.8);runner.cancel();advance(12);
 assert.equal(starts.length,1);
 assert.equal(finished,0);
 assert.equal(jobs.size,0);
});
test("Desligar Loop preserva a volta em execução, sem iniciar outra",()=>{
 const {clock,audio,advance}=simulator();
 let repeating=true;const starts=[];let finished=0;
 clock.create({
  audio,cycleSeconds:2,schedule:at=>starts.push(at),
  shouldRepeat:()=>repeating,onFinish:()=>finished++
 });
 advance(.7);repeating=false;advance(3);
 assert.deepEqual(starts,[.09]);
 assert.equal(finished,1);
});
