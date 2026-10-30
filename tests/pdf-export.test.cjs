const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const pdfCode=fs.readFileSync(path.join(__dirname,"../src/pdf-export.js"),"utf8");
const engineCode=fs.readFileSync(path.join(__dirname,"../src/engine.js"),"utf8");
const presentationCode=fs.readFileSync(path.join(__dirname,"../src/presentation.js"),"utf8");
const imageBase64="/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2aiiigD//2Q==";
const context2d={
  fillRect(){},strokeRect(){},beginPath(){},arc(){},fill(){},fillText(){},
  measureText(s){return {width:String(s).length*11};}
};
const sandbox={
  window:{},
  TextEncoder,Blob,Uint8Array,atob,setTimeout,
  document:{createElement(kind){
    assert.equal(kind,"canvas");
    return {width:0,height:0,getContext:()=>context2d,
      toDataURL:()=> "data:image/jpeg;base64,"+imageBase64};
  }}
};
vm.createContext(sandbox);
vm.runInContext(engineCode,sandbox,{filename:"src/engine.js"});
vm.runInContext(presentationCode,sandbox,{filename:"src/presentation.js"});
vm.runInContext(pdfCode,sandbox,{filename:"src/pdf-export.js"});
const {CifraPDF,CifraEngine}=sandbox.window;

test("PDF independente de window.print começa e termina com estruturas válidas",async()=>{
  const jpeg=Buffer.from(imageBase64,"base64");
  const blob=CifraPDF.pdfFromJpegs([jpeg,jpeg]);
  assert.equal(blob.type,"application/pdf");
  const bytes=Buffer.from(await blob.arrayBuffer());
  const pdf=bytes.toString("latin1");
  assert.ok(pdf.startsWith("%PDF-1.4"));
  assert.ok(pdf.endsWith("%%EOF\n"));
  assert.equal((pdf.match(/\/Type \/Page /g)||[]).length,2);
  const xrefPos=Number(pdf.match(/startxref\n(\d+)\n%%EOF\n$/)[1]);
  assert.equal(pdf.slice(xrefPos,xrefPos+4),"xref");
  const entries=pdf.slice(xrefPos).split("\n").slice(3,3+2+2*3).slice(0,8);
  for(let i=0;i<8;i++)assert.match(pdf.slice(Number(entries[i].slice(0,10))),new RegExp("^"+(i+1)+" 0 obj"));
});

test("exporta quatro seções e inclui a letra original opcional",async()=>{
  const output=CifraEngine.generate("C Am F G");
  const a=await CifraPDF.create({output,title:"Exercício",composer:"",source:"",includeSource:false});
  const b=await CifraPDF.create({output,title:"Exercício",composer:"Igor",source:"C Am F G\nMinha música",includeSource:true});
  assert.equal(a.pages,4);
  assert.equal(b.pages,5);
  assert.ok((await b.blob.arrayBuffer()).byteLength>(await a.blob.arrayBuffer()).byteLength);
});

test("gera nome de arquivo seguro",()=>{
  assert.equal(CifraPDF.filename("Música Nº 1"),"cifra-pra-mim-musica-n-1.pdf");
  assert.equal(CifraPDF.filename(""),"cifra-pra-mim-arranjo.pdf");
});
