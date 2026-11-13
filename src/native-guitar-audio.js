/* Reproducao nativa de violao: arquivo WAV gerado localmente para Safari/iPhone.
   Inicia um HTMLAudioElement diretamente no toque, sem dependencias externas. */
(function(root){
 'use strict';
 const SAMPLE_RATE=22050;
 function wav(events,seconds,wrapTails=false){
  const length=Math.max(1,Math.ceil(seconds*SAMPLE_RATE));
  const mix=new Float32Array(length);
  for(const ev of events){
   const start=Math.max(0,Math.round(ev.at*SAMPLE_RATE));
   if(start>=length)continue;
   const duration=Math.min(1.85,Math.max(.17,(ev.duration||.35)+.19));
   const total=Math.ceil(duration*SAMPLE_RATE);
   const f=440*Math.pow(2,(ev.midi-69)/12);
   if(!Number.isFinite(f)||f<20||f>3000)continue;
   const bass=!!ev.bass,cav=ev.timbre==='cavaquinho';
   const strength=cav?.37:(bass?.42:.35);
   const decay=cav?6.4:(bass?3.9:4.9);
   const period=2*Math.PI*f/SAMPLE_RATE;
   for(let i=0;i<total;i++){
    const t=i/SAMPLE_RATE,phase=period*i;
    const attack=Math.min(1,t/.008);
    const envelope=attack*Math.exp(-decay*t/duration);
    const tone=Math.sin(phase)+(cav?.35:.29)*Math.sin(phase*2)+.105*Math.sin(phase*3)+.027*Math.sin(phase*4);
    const sample=strength*envelope*tone;
    const position=start+i;
    if(position>=length&&!wrapTails)break;
    mix[position%length]+=sample;
    // Cauda atravessa a fronteira do ciclo quando Loop está ligado.
    const echo=position+1500;
    if(echo<length||wrapTails)mix[echo%length]+=sample*.085;
   }
  }
  let peak=.01;
  for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(mix[i]));
  const scale=peak>0.9?.9/peak:1;
  const buffer=new ArrayBuffer(44+length*2),data=new DataView(buffer);
  const str=(pos,s)=>{for(let i=0;i<s.length;i++)data.setUint8(pos+i,s.charCodeAt(i));};
  str(0,'RIFF');data.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');
  data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,1,true);
  data.setUint32(24,SAMPLE_RATE,true);data.setUint32(28,SAMPLE_RATE*2,true);
  data.setUint16(32,2,true);data.setUint16(34,16,true);
  str(36,'data');data.setUint32(40,length*2,true);
  for(let i=0;i<length;i++)data.setInt16(44+2*i,Math.round(Math.max(-1,Math.min(1,mix[i]*scale))*32767),true);
  return new Blob([buffer],{type:'audio/wav'});
 }
 function create({events,cycleSeconds,shouldRepeat=()=>false,onTick=()=>{},onFinish=()=>{},onError=()=>{}}){
  if(!events?.length||!(cycleSeconds>0))throw new Error('Sequencia de audio invalida');
  const url=URL.createObjectURL(wav(events,cycleSeconds,Boolean(shouldRepeat())));
  const player=new Audio();
  let closed=false,interval=null;
  player.preload='auto';player.src=url;player.volume=1;player.muted=false;
  player.loop=Boolean(shouldRepeat());
  function cleanup(notify){
   if(closed)return;
   closed=true;clearInterval(interval);
   player.pause();player.removeAttribute('src');player.load();
   URL.revokeObjectURL(url);
   if(notify)onFinish();
  }
  player.addEventListener('ended',()=>cleanup(true),{once:true});
  player.addEventListener('error',()=>{onError('Nao foi possivel reproduzir o audio nativo.');cleanup(true)},{once:true});
  interval=setInterval(()=>{
   if(closed)return;
   player.loop=Boolean(shouldRepeat());
   if(!player.paused||player.currentTime>0)onTick(player.currentTime);
  },45);
  // Deve acontecer no mesmo gesto do botao; nao colocar await antes de play().
  try{
   const attempt=player.play();
   if(attempt&&typeof attempt.catch==='function')attempt.catch(e=>{
    onError('O navegador recusou reproduzir: '+(e?.message||e));cleanup(true);
   });
  }catch(e){onError('Falha ao iniciar: '+(e?.message||e));cleanup(true)}
  return{cancel(){cleanup(false)},get player(){return player}};
 }
 root.NativeGuitarAudio={create};
})(typeof window!=='undefined'?window:globalThis);
