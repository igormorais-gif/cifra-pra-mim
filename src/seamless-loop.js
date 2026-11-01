/* Sequenciador compartilhado: o áudio usa AudioContext.currentTime,
   nunca o instante de retorno de setTimeout como início da próxima volta. */
(function(root,factory){
 const api=factory();
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.SeamlessLoop=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function create({audio,cycleSeconds,schedule,shouldRepeat=()=>false,onFinish=()=>{},lead=.09,horizon=.65,interval=25}){
  if(!audio||!Number.isFinite(audio.currentTime))throw new Error("AudioContext necessário");
  if(!(cycleSeconds>0)||!Number.isFinite(cycleSeconds))throw new RangeError("Duração do ciclo inválida");
  if(typeof schedule!=="function")throw new TypeError("É necessário agendar os sons");
  let nextAt=audio.currentTime+lead,cycle=0,running=true,finished=false;
  let timer=null,finishTimer=null,lastEnd=nextAt;
  const planned=[];
  function finish(){
   if(finished)return;
   finished=true;
   if(timer!==null)clearTimeout(timer);
   if(finishTimer!==null)clearTimeout(finishTimer);
   timer=null;finishTimer=null;
   onFinish();
  }
  function pump(){
   if(!running)return;
   while(running&&nextAt<=audio.currentTime+horizon){
    if(cycle>0&&!shouldRepeat()){
     running=false;
     finishTimer=setTimeout(finish,Math.max(0,(lastEnd-audio.currentTime)*1000+8));
     return;
    }
    schedule(nextAt,cycle);
    planned.push(nextAt);
    if(planned.length>32)planned.shift(); // histórico limitado: loop pode ficar horas ligado
    lastEnd=nextAt+cycleSeconds;
    nextAt=lastEnd;cycle++;
   }
   if(running)timer=setTimeout(pump,interval);
  }
  pump();
  return{
   cancel(){
    running=false;finished=true;
    if(timer!==null)clearTimeout(timer);
    if(finishTimer!==null)clearTimeout(finishTimer);
    timer=null;finishTimer=null;
   },
   get planned(){return planned.slice()},
   get active(){return running}
  };
 }
 return{create};
});
