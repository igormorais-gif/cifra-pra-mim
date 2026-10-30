/* PDF A4 gerado no dispositivo. Não depende de window.print ou de bibliotecas externas. */
window.CifraPDF=(function(){
"use strict";
const W=1190,H=1684,M=76,C=W-2*M;
const white={0:0,2:1,4:2,5:3,7:4,9:5,11:6},black={1:0,3:1,6:3,8:4,10:5};
const mod=(a,b)=>((a%b)+b)%b;
function pdfFromJpegs(images){
  if(!images.length)throw Error("Não há páginas para exportar.");
  const enc=new TextEncoder(),parts=[],offsets=[0];let size=0;
  const push=bytes=>{parts.push(bytes);size+=bytes.length;};
  const text=s=>push(enc.encode(s));
  const obj=(id,body)=>{offsets[id]=size;text(id+" 0 obj\n");body();text("\nendobj\n");};
  const pw="595.28",ph="841.89";
  text("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1,()=>text("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2,()=>text("<< /Type /Pages /Kids ["+images.map((_,i)=>(3+i*3)+" 0 R").join(" ")+"] /Count "+images.length+" >>"));
  images.forEach((jpg,i)=>{
    const page=3+i*3,img=page+1,stream=page+2;
    obj(page,()=>text("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+pw+" "+ph+"] /Resources << /XObject << /Im0 "+img+" 0 R >> >> /Contents "+stream+" 0 R >>"));
    obj(img,()=>{text("<< /Type /XObject /Subtype /Image /Width "+W+" /Height "+H+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpg.length+" >>\nstream\n");push(jpg);text("\nendstream");});
    const commands=enc.encode("q\n"+pw+" 0 0 "+ph+" 0 0 cm\n/Im0 Do\nQ\n");
    obj(stream,()=>{text("<< /Length "+commands.length+" >>\nstream\n");push(commands);text("endstream");});
  });
  const xref=size;
  text("xref\n0 "+(3+3*images.length)+"\n0000000000 65535 f \n");
  for(let i=1;i<3+3*images.length;i++)text(String(offsets[i]).padStart(10,"0")+" 00000 n \n");
  text("trailer\n<< /Size "+(3+3*images.length)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n");
  return new Blob(parts,{type:"application/pdf"});
}
function page(){
 const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx)throw Error("Não foi possível gerar uma página neste navegador.");
 ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.textBaseline="top";
 return {canvas,ctx};
}
function jpg(canvas){
 const data=canvas.toDataURL("image/jpeg",0.83);
 if(!data.startsWith("data:image/jpeg;base64,"))throw Error("Não foi possível codificar uma página.");
 const bin=atob(data.split(",")[1]),array=new Uint8Array(bin.length);
 for(let i=0;i<array.length;i++)array[i]=bin.charCodeAt(i);
 return array;
}
function write(ctx,s,x,y,size=19,bold=false,color="#191919",family="Arial"){
 ctx.fillStyle=color;ctx.font=(bold?"bold ":"")+size+"px "+family;ctx.fillText(String(s),x,y);
}
function fitted(ctx,s,x,y,max,size=19,min=13,bold=false,color="#191919",family="Arial"){
 s=String(s);
 for(let n=size;n>=min;n--){
  ctx.font=(bold?"bold ":"")+n+"px "+family;
  if(ctx.measureText(s).width<=max){write(ctx,s,x,y,n,bold,color,family);return;}
 }
 ctx.font=(bold?"bold ":"")+min+"px "+family;
 let t="";for(const ch of s){if(ctx.measureText(t+ch+"…").width>max)break;t+=ch;}
 write(ctx,t+"…",x,y,min,bold,color,family);
}
function rule(ctx,x,y,w,color="#c8c8c8",thick=1){ctx.fillStyle=color;ctx.fillRect(x,y,w,thick);}
function footer(ctx,n){
 rule(ctx,M,H-88,C);
 write(ctx,"Cifra pra Mim · Igor Morais · Confira a harmonia no contexto musical.",M,H-68,15,false,"#555");
 write(ctx,String(n),W-M-22,H-68,15,false,"#555");
}
function header(ctx,label){
 write(ctx,"CIFRA PRA MIM / ARRANJA PRA MIM",M,55,17,true);
 ctx.font="16px Arial";
 const width=ctx.measureText(label).width;
 write(ctx,label,W-M-width,56,16,false,"#555");
 rule(ctx,M,100,C,"#111",2);
}
function keyboard(ctx,notes,x,y,width){
 const key=width/21;
 for(let i=0;i<21;i++){
  ctx.fillStyle="#fff";ctx.fillRect(x+i*key,y,key,67);
  ctx.strokeStyle="#333";ctx.lineWidth=1;ctx.strokeRect(x+i*key,y,key,67);
 }
 for(let oct=0;oct<3;oct++)for(const [pc,j] of Object.entries(black)){
  ctx.fillStyle="#181818";ctx.fillRect(x+(oct*7+j+1)*key-key*.31,y,key*.62,39);
 }
 for(const note of notes){
  if(note.midi<48||note.midi>83)continue;
  const rel=note.midi-48,oct=Math.floor(rel/12),pc=mod(rel,12);
  const b=Object.prototype.hasOwnProperty.call(black,pc);
  const xx=b?x+(oct*7+black[pc]+1)*key:x+(oct*7+white[pc]+.5)*key;
  const yy=y+(b?29:55);
  ctx.beginPath();ctx.arc(xx,yy,b?7:10,0,Math.PI*2);ctx.fillStyle=b?"#fff":"#111";ctx.fill();
  ctx.beginPath();ctx.arc(xx,yy,3.5,0,Math.PI*2);ctx.fillStyle=b?"#111":"#fff";ctx.fill();
 }
 for(let oct=0;oct<3;oct++)write(ctx,"C"+(3+oct),x+oct*7*key+3,y+73,15,false,"#555");
}
function chordCard(ctx,chord,voice,prev,index,x,y,w){
 rule(ctx,x,y,w);
 const px=x+14,usable=w-28;
 fitted(ctx,chord.raw,px,y+13,usable-40,27,17,true);
 write(ctx,String(index+1).padStart(2,"0"),x+w-36,y+19,14,false,"#777");
 keyboard(ctx,voice.notes,px+11,y+60,usable-22);
 const descriptors=[["M.E.",chord.bass],["M.D.",voice.notes.map(n=>n.name).join(" - ")],["Graus",voice.notes.map(n=>n.label).join(" - ")]];
 descriptors.forEach(([tag,value],j)=>{write(ctx,tag,px,y+159+j*26,17,true);fitted(ctx,value,px+78,y+159+j*26,usable-82,18,12);});
 const top=voice.notes[voice.notes.length-1],name=top.name+(Math.floor(top.midi/12)-1);
 const d=prev?voice.top-prev.top:null;
 const suffix=d===null?"início":"movimento "+(d>0?"+":"")+d+" ST"+(Math.abs(d)>2?" · exceção":"");
 fitted(ctx,"Ponta: "+name+" · "+suffix,px,y+242,usable,17,12,true,Math.abs(d??0)>2?"#8b2828":"#111");
 if(voice.omitted.length)fitted(ctx,"Omitida: "+voice.omitted.map(n=>n.name+" ("+n.label+")").join(", "),px,y+270,usable,15,12,false,"#8b2828");
}
function addSection(options,name,sub,track,images){
 const chordList=options.output.chords,cardW=(C-30)/2,rows=4,chunk=8;
 const pageCount=Math.ceil(chordList.length/chunk);
 for(let part=0;part<pageCount;part++){
  const p=page();header(p.ctx,"TECLADO / FORMAS E PONTAS");
  fitted(p.ctx,options.title,M,134,C,31,23,true);
  write(p.ctx,name+(pageCount>1?" · "+(part+1)+"/"+pageCount:""),M,196,28,true);
  fitted(p.ctx,sub,M,235,C,19,14,false,"#555");
  for(let row=0;row<rows;row++)for(let col=0;col<2;col++){
   const idx=part*chunk+row*2+col;if(idx>=chordList.length)continue;
   chordCard(p.ctx,chordList[idx],track[idx],idx>0?track[idx-1]:null,idx,M+col*(cardW+30),290+row*321,cardW);
  }
  footer(p.ctx,images.length+1);images.push(jpg(p.canvas));p.canvas.width=p.canvas.height=1;
 }
}
function sourcePages(options,images){
 if(!options.includeSource||!options.source.trim())return;
 const lines=options.source.replace(/\r/g,"").split("\n");
 if(lines.length>1800)throw Error("O texto é longo demais para exportar no iPhone; reduza a letra.");
 let p=null,y=0;
 function begin(){p=page();header(p.ctx,"LETRA E CIFRA");fitted(p.ctx,options.title,M,152,C,34,23,true);if(options.composer)fitted(p.ctx,options.composer,M,205,C,19,14);y=260;}
 function finish(){footer(p.ctx,images.length+1);images.push(jpg(p.canvas));p.canvas.width=p.canvas.height=1;p=null;}
 begin();
 for(const raw of lines){
  let rem=raw.replace(/\t/g,"    ");
  const wrapped=[];
  if(!rem)wrapped.push("");
  while(rem){
   p.ctx.font="21px monospace";
   let n=Math.min(rem.length,150);
   while(n>1&&p.ctx.measureText(rem.slice(0,n)).width>C)n--;
   wrapped.push(rem.slice(0,n));rem=rem.slice(n);
  }
  for(const line of wrapped){
   if(y+31>H-112){finish();begin();}
   write(p.ctx,line,M,y,21,false,"#111","monospace");y+=30;
  }
 }
 finish();
}
async function create(options,progress){
 if(!options.output?.chords?.length)throw Error("Gere o arranjo antes de exportar.");
 const images=[];sourcePages(options,images);
 const groups=[
 ["Formas Originais I","Primeira forma de origem.",options.output.originalTracks[0]],
 ["Formas Originais II","Segunda forma de origem.",options.output.originalTracks[1]],
 ["Formas Originais III","Terceira forma de origem.",options.output.originalTracks[2]],
 ["Adaptando Pontas I","Primeira forma preservada; pontas aproximadas.",options.output.adapted[0]],
 ["Adaptando Pontas II","Primeira forma preservada; pontas aproximadas.",options.output.adapted[1]],
 ["Adaptando Pontas III","Primeira forma preservada; pontas aproximadas.",options.output.adapted[2]]
 ];
 for(let i=0;i<groups.length;i++){
  addSection(options,...groups[i],images);
  progress?.(i+1,groups.length);
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 return {blob:pdfFromJpegs(images),pages:images.length};
}
function filename(title){
 const cleaned=String(title||"arranjo").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"arranjo";
 return "cifra-pra-mim-"+cleaned+".pdf";
}
return {pdfFromJpegs,create,filename};
})();