/* Motor de áudio nativo para o Surdo de Terceira.
   Monta uma faixa WAV com os próprios samples do laboratório e reproduz
   com HTMLAudioElement. Não depende de Web Audio nem de arquivos externos. */
(function(root){
 'use strict';
 const RATE=22050;
 function parseWav(base64){
  if(!base64)return null;
  const bin=atob(base64),buffer=new ArrayBuffer(bin.length),data=new DataView(buffer);
  for(let i=0;i<bin.length;i++)data.setUint8(i,bin.charCodeAt(i));
  const tag=at=>String.fromCharCode(...new Uint8Array(buffer,at,4));
  if(tag(0)!=='RIFF'||tag(8)!=='WAVE')throw new Error('O sample não é WAV');
  let sampleRate=0,channels=0,bitDepth=0,format=0,offset=12,start=-1,size=0;
  while(offset+8<=data.byteLength){
   const kind=tag(offset),chunk=data.getUint32(offset+4,true);
   if(kind==='fmt '){
    format=data.getUint16(offset+8,true);
    channels=data.getUint16(offset+10,true);
    sampleRate=data.getUint32(offset+12,true);
    bitDepth=data.getUint16(offset+22,true);
   }
   if(kind==='data'){start=offset+8;size=Math.min(chunk,data.byteLength-start);break}
   offset+=8+chunk+(chunk%2);
  }
  if(start<0||format!==1||![8,16].includes(bitDepth)||!channels||!sampleRate)
   throw new Error('Formato WAV incompatível');
  const frames=Math.floor(size/(channels*(bitDepth/8))),pcm=new Float32Array(frames);
  for(let i=0;i<frames;i++){
   let total=0;
   for(let c=0;c<channels;c++){
    const at=start+(i*channels+c)*(bitDepth/8);
    total+=bitDepth===16?data.getInt16(at,true)/32768:(data.getUint8(at)-128)/128;
   }
   pcm[i]=total/channels;
  }
  return{pcm,rate:sampleRate};
 }
 function value(s,t){
  if(!s||t<0)return 0;
  const pos=t*s.rate,i=Math.floor(pos);
  if(i>=s.pcm.length)return 0;
  const a=s.pcm[i],b=s.pcm[Math.min(i+1,s.pcm.length-1)];
  return a+(b-a)*(pos-i);
 }
 function wav(samples){
  const count=samples.length,b=new ArrayBuffer(44+count*2),d=new DataView(b);
  const put=(p,s)=>{for(let i=0;i<s.length;i++)d.setUint8(p+i,s.charCodeAt(i));};
  put(0,'RIFF');d.setUint32(4,36+count*2,true);put(8,'WAVE');
  put(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);
  d.setUint16(22,1,true);d.setUint32(24,RATE,true);
  d.setUint32(28,RATE*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);
  put(36,'data');d.setUint32(40,count*2,true);
  let max=0;
  for(const x of samples)max=Math.max(max,Math.abs(x));
  const adjust=max>0.95?0.95/max:1;
  for(let i=0;i<count;i++)
   d.setInt16(44+2*i,Math.round(Math.max(-1,Math.min(1,samples[i]*adjust))*32767),true);
  return new Blob([b],{type:'audio/wav'});
 }
 function addSample(mix,sample,at,gain=.55){
  if(!sample)return;
  const first=Math.max(0,Math.ceil(at*RATE));
  const frames=Math.min(mix.length-first,Math.ceil(sample.pcm.length*RATE/sample.rate)+1);
  for(let i=0;i<frames;i++){
   const position=first+i,time=position/RATE-at;
   mix[position]+=value(sample,time)*gain;
  }
 }
 function click(mix,at,accent){
  const first=Math.max(0,Math.round(at*RATE)),len=Math.min(Math.round(.058*RATE),mix.length-first);
  for(let i=0;i<len;i++){
   const t=i/RATE;
   mix[first+i]+=(accent?.17:.10)*Math.sin(2*Math.PI*(accent?850:570)*t)*Math.exp(-90*t);
  }
 }
 function build({recording,recordingSeconds,sourceBpm,bpm,bar=0,mode='integral',events=[],short,open,markFirst,markSecond,markMode='off',markVolume=0.4,tick=false,sound=true,seconds}){
  if(!(seconds>0&&seconds<120))throw new Error('Duração de reprodução inválida');
  const length=Math.max(1,Math.ceil(seconds*RATE)),mix=new Float32Array(length);
  if(recording&&sound){
   const sample=parseWav(recording),start=mode==='integral'?0:bar*recordingSeconds/4,step=bpm/sourceBpm;
   for(let i=0;i<length;i++)mix[i]+=value(sample,start+i/RATE*step)*.90;
  }else if(sound){
   const shortSample=parseWav(short),openSample=parseWav(open);
   for(const e of events){
    const t=((e.at%seconds)+seconds)%seconds;
    addSample(mix,e.kind==='qui'?shortSample:openSample,t,e.kind==='qui'?.64:.57);
   }
  }
  if(markMode!=='off'&&markVolume>0){
   const f=parseWav(markFirst),s=parseWav(markSecond),step=15/bpm;
   const count=mode==='integral'?32:8;
   for(let k=0;k<count;k++){
    if(k%8===0&&(markMode==='both'||markMode==='second'))addSample(mix,s,k*step,markVolume*.58);
    if(k%8===4&&(markMode==='both'||markMode==='first'))addSample(mix,f,k*step,markVolume*.69);
   }
  }
  if(tick){
   const step=15/bpm,count=mode==='integral'?32:8;
   for(let k=0;k<count;k++)if(k%8===0||k%8===4)click(mix,k*step,k%8===0);
  }
  return wav(mix);
 }
 function start(params){
  const blob=build(params),url=URL.createObjectURL(blob),player=new Audio();
  let stopped=false;
  player.preload='auto';player.src=url;player.volume=1;player.muted=false;
  player.loop=params.loop!==false;
  function stop(){
   if(stopped)return;
   stopped=true;player.pause();player.removeAttribute('src');player.load();URL.revokeObjectURL(url);
  }
  player.addEventListener('error',()=>{if(!stopped){params.onError?.('O navegador não conseguiu abrir o WAV.');stop();}},{once:true});
  player.addEventListener('ended',()=>{if(!stopped){stop();params.onFinish?.()}},{once:true});
  // IMPORTANTE: play() ocorre diretamente no clique original do usuário.
  try{
   const result=player.play();
   if(result?.catch)result.catch(err=>{if(!stopped){params.onError?.(String(err?.message||err));stop();}});
  }catch(err){params.onError?.(String(err?.message||err));stop();}
  return{player,cancel:stop};
 }
 root.NativeSurdoAudio={start,build,parseWav};
})(typeof window!=='undefined'?window:globalThis);
