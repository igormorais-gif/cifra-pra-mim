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
  ctx.fillStyle="#fff";ctx.fillRect(x+i*key,y,key,89);
  ctx.strokeStyle="#111";ctx.lineWidth=1;ctx.strokeRect(x+i*key,y,key,89);
 }
 for(let oct=0;oct<3;oct++)for(const [pc,j] of Object.entries(black)){
  ctx.fillStyle="#111";ctx.fillRect(x+(oct*7+j+1)*key-key*.32,y,key*.64,59);
 }
 for(const n of notes){
  if(n.midi<48||n.midi>83)continue;
  const rel=n.midi-48,oct=Math.floor(rel/12),pc=mod(rel,12);
  const isBlack=Object.prototype.hasOwnProperty.call(black,pc);
  const xx=isBlack?x+(oct*7+black[pc]+1)*key:x+(oct*7+white[pc]+.5)*key;
  const cy=y+(isBlack?37:65);
  ctx.beginPath();ctx.arc(xx,cy,isBlack?5.5:6.6,0,Math.PI*2);
  ctx.fillStyle=isBlack?"#fff":"#111";ctx.fill();
  const degree=window.CifraPresentation.dotLabel(n.label);
  ctx.font="bold "+(degree.length>2?9:10)+"px Arial";
  ctx.fillStyle=isBlack?"#fff":"#111";
  ctx.textBaseline="top";
  ctx.fillText(degree,xx-ctx.measureText(degree).width/2,y+(isBlack?48:78));
 }
}
function chordCard(ctx,chord,voice,prev,index,x,y,w){
 // Molde clássico: Cifra / Nome por extenso / M.E. | M.D. / régua / teclado.
 const center=x+w/2,hand=window.CifraPresentation.hand(chord,voice);
 const symbol=chord.raw,fullName=window.CifraPresentation.name(chord);
 ctx.textBaseline="top";ctx.textAlign="center";
 write(ctx,symbol,center,y+3,21,true);
 fitted(ctx,fullName,center,y+30,w-18,19,12,true);
 ctx.textAlign="left";
 const l="M.E.: "+hand.left;
 const r="M.D.: "+hand.right;
 ctx.font="15px Arial";
 const combined=l+"    |    "+r;
 // Mantém a separação das mãos como na folha antiga.
 fitted(ctx,combined,x+8,y+64,w-16,15,10);
 rule(ctx,x+24,y+94,w-48,"#222",1);
 keyboard(ctx,voice.notes,x+19,y+128,w-38);
 // Evitar textos grandes abaixo das figuras: os graus estão dentro das teclas.
 if(voice.omitted.length)fitted(ctx,"Omitida: "+voice.omitted.map(t=>window.CifraPresentation.note(t.name)).join(", "),x+16,y+225,w-32,12,10,false,"#7c3030");
}
function addSection(options,name,sub,track,images){
 const chords=options.output.chords,cardW=457,rows=4,chunk=8;
 const total=Math.ceil(chords.length/chunk);
 for(let part=0;part<total;part++){
  const p=page(),ctx=p.ctx;
  ctx.textAlign="center";
  const title=options.title;
  ctx.font="bold 32px Arial";
  ctx.fillStyle="#111";ctx.fillText(title,W/2,99);
  const tw=Math.min(ctx.measureText(title).width,C);
  rule(ctx,(W-tw)/2,142,tw,"#111",2);
  ctx.textAlign="left";
  write(ctx,name+(total>1?" ("+(part+1)+"/"+total+")":""),M,179,25,true);
  if(sub)fitted(ctx,sub,M,211,C,15,11,false,"#666");
  const left=120,top=265,step=296;
  for(let r=0;r<rows;r++)for(let c=0;c<2;c++){
    const idx=part*chunk+r*2+c;
    if(idx>=chords.length)continue;
    const x=left+c*(cardW+68);
    chordCard(ctx,chords[idx],track[idx],idx>0?track[idx-1]:null,idx,x,top+r*step,cardW);
  }
  footer(ctx,images.length+1);
  images.push(jpg(p.canvas));
  p.canvas.width=p.canvas.height=1;
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
 ["1) Formas Originais — I","",options.output.originalTracks[0]],
 ["1) Formas Originais — II","",options.output.originalTracks[1]],
 ["1) Formas Originais — III","",options.output.originalTracks[2]],
 ["2) Adaptando Pontas (I)","",options.output.adapted[0]],
 ["3) Adaptando Pontas (II)","",options.output.adapted[1]],
 ["4) Adaptando Pontas (III)","",options.output.adapted[2]]
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