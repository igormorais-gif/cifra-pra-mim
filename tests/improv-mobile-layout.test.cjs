const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.resolve(__dirname,"../laboratorio-improviso/index.html"),"utf8");

test("Grade responsiva mantém 16 subdivisões visíveis dentro do card",()=>{
 const css=html.slice(html.indexOf("/* v11 · Grade inteira visível"));
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/\.chart-scroll\{overflow-x:visible/);
 assert.match(css,/\.ticks\{\s*width:100%;min-width:0!important/);
 assert.match(css,/grid-template-columns:repeat\(16,minmax\(0,1fr\)\)/);
 assert.match(html,/tick%4===0\?String\(tick\/4\+1\):\["","i","e","i"\]\[tick%4\]/);
});
test("Player flutuante contém controles principais e BPM, sem duplicar IDs",()=>{
 for(const id of ["transport-dock","play","compare","stop","loop","bpm","transport-caption"]){
  assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,"Controle duplicado: "+id);
 }
 const css=html.slice(html.indexOf("/* v11 · Grade inteira visível"));
 assert.match(css,/\.player \.control-row\{\s*position:fixed/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/bottom:calc\(7px \+ env\(safe-area-inset-bottom,0px\)\)/);
 assert.match(css,/\.player \.control-row \.tempo\{\s*grid-column:1\/-1/);
});
test("Barra flutuante não encobre o fim do conteúdo",()=>{
 const css=html.slice(html.indexOf("/* v11 · Grade inteira visível"));
 assert.match(css,/\.shell\{padding-bottom:calc\(180px \+ env\(safe-area-inset-bottom,0px\)\)\}/);
 assert.match(css,/html\{scroll-padding-bottom:calc\(178px \+ env\(safe-area-inset-bottom,0px\)\)\}/);
});
test("Estado do Loop e legenda móvel compartilham o mesmo controle",()=>{
 assert.match(html,/id="loop-label-full"/);
 assert.match(html,/id="loop-label-compact"/);
 assert.match(html,/\$\("loop-label-full"\)\.textContent=state\.loop\?/);
 assert.match(html,/\$\("loop-label-compact"\)\.textContent=state\.loop\?/);
 assert.match(html,/\$\("transport-caption"\)\.textContent=p\.title/);
 assert.match(html,/\$\("transport-caption"\)\.textContent=E\.pattern\(state\.id\)\.title/);
});
