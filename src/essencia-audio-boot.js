/* Essência do Lúdico — inicialização de áudio para Safari/iOS e navegadores embutidos.
   Não altera BPM, samples, eventos, clock nem duração dos loops. */
(function(root){
 'use strict';
 if(root.EssenciaAudioBoot)return;
 const Original=root.AudioContext||root.webkitAudioContext;
 const contexts=new Set();
 let gesture=false;
 let supported=!!Original;
 function playbackSession(){
  try{if(root.navigator&&root.navigator.audioSession)root.navigator.audioSession.type='playback'}catch(_){}
 }
 function wake(ctx){
  if(!ctx||ctx.state==='closed'){contexts.delete(ctx);return}
  if(ctx.state==='running')return;
  try{
   const attempt=ctx.resume();
   if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});
  }catch(_){}
  // O primeiro oscilador nasce ainda dentro do toque físico.
  // Não há som audível nem interferência na mixagem.
  try{
   const tone=ctx.createOscillator(),silence=ctx.createGain();
   silence.gain.value=0;
   tone.connect(silence);silence.connect(ctx.destination);
   const now=ctx.currentTime;
   tone.start(now);tone.stop(now+.025);
   tone.onended=()=>{try{tone.disconnect();silence.disconnect()}catch(_){}};
  }catch(_){}
 }
 function gestureStart(){
  playbackSession();
  gesture=true;
  for(const ctx of contexts)wake(ctx);
  // O listener em captura corre antes dos controles e dos handlers do laboratório.
  // Não se usa await: o desbloqueio acontece na ativação do usuário.
  Promise.resolve().then(()=>{gesture=false});
 }
 if(Original){
  function UnlockedAudioContext(...args){
   const ctx=new Original(...args);
   contexts.add(ctx);
   if(gesture)wake(ctx);
   return ctx;
  }
  try{Object.setPrototypeOf(UnlockedAudioContext,Original)}catch(_){}
  UnlockedAudioContext.prototype=Original.prototype;
  try{root.AudioContext=UnlockedAudioContext}catch(_){}
  try{root.webkitAudioContext=UnlockedAudioContext}catch(_){}
 }
 for(const event of ['touchstart','pointerdown','mousedown','click','keydown']){
  root.addEventListener(event,gestureStart,{capture:true,passive:true});
 }
 root.EssenciaAudioBoot={
  available:supported,
  retry:()=>{playbackSession();for(const ctx of contexts)wake(ctx)},
  states:()=>Array.from(contexts,ctx=>ctx.state)
 };
 playbackSession();
})(typeof window!=='undefined'?window:globalThis);
