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

test("Os dois modos de partitura têm cliques conectados e estado sincronizado",()=>{
 assert.match(html,/data-score-mode="rhythm"/);
 assert.match(html,/data-score-mode="melodic"/);
 assert.match(html,/for\(const btn of document\.querySelectorAll\("\[data-score-mode\]"\)\)\{\s*btn\.addEventListener\("click",\(\)=>setScoreMode\(btn\.dataset\.scoreMode\)\)/);
 assert.match(html,/state\.scoreMode=mode;\s*renderScore\(\)/);
 assert.match(html,/score:setScoreMode/);
 // Alternar uma visualização não pode parar uma frase em Loop.
 const method=html.slice(html.indexOf("function setScoreMode("),html.indexOf('$("score-fit").addEventListener',html.indexOf("function setScoreMode(")));
 assert.doesNotMatch(method,/stop\(\)/);
});

test("Semicolcheias exibem nomes reais, não pontos no lugar das notas",()=>{
 const css=html.slice(0,html.indexOf("</style>"));
 assert.match(css,/\.hit\.tiny \.hit-name\{[^}]*writing-mode:vertical-rl/);
 assert.match(css,/\.hit\.tiny:after\{content:none!important\}/);
 assert.doesNotMatch(css,/\.hit\.tiny\{font-size:0/);
 assert.match(html,/item\.append\(make\("span","hit-name",n\.name\)\)/);
 assert.match(html,/item\.setAttribute\("aria-label",\(n\.ornament\?"Aproximação ":"Nota-alvo "\)\+n\.name/);
 assert.match(html,/item\.style\.gridColumn=\(n\.tick\+1\)\+" \/ span "\+n\.length/);
});

test("Monitor vem antes das abas e não tampa os controles no celular",()=>{
 const order=["id=\"monitor\"","id=\"timeline\"","id=\"score\"","id=\"instrument-view\"","class=\"studio-tabs\""];
 const indices=order.map(x=>html.indexOf(x));
 assert.ok(indices.every(x=>x>=0));
 assert.ok(indices.every((x,i)=>i===0||x>indices[i-1]));
 assert.match(html,/@media\(max-width:740px\)\{[\s\S]*?\.selected\{position:static;top:auto;z-index:auto/);
 assert.match(html,/\.studio-tabs\{position:sticky;top:0;z-index:60/);
 assert.match(html,/@media\(min-width:741px\) and \(max-width:899px\)\{\s*#monitor\{position:static;top:auto;z-index:auto/);
 assert.match(html,/scoreFit:true/);
 assert.match(html,/\.selected \.ticks\{grid-template-rows:22px 46px\}/);
});
test("As abas separam Melodia, Ritmos e Embelezamentos sem esconder os três visores",()=>{
 for(const tab of ["melody","rhythms","ornaments"]){
  assert.match(html,new RegExp('data-studio-tab="'+tab+'"'));
  assert.match(html,new RegExp('id="studio-panel-'+tab+'"'));
 }
 assert.match(html,/function setStudioTab\(tab\)/);
 assert.match(html,/\$\("studio-panel-"\+key\)\.hidden=key!==tab/);
 assert.match(html,/\.studio-tabs button\.active/);
});
test("Teste auditivo de subdivisão não ocupa mais a interface principal",()=>{
 assert.doesNotMatch(html,/id="timing-check-title"/);
 assert.doesNotMatch(html,/id="diag-first-i"/);
 assert.doesNotMatch(html,/id="diag-e"/);
 assert.match(html,/<details class="metro-details">/);
 assert.match(html,/id="metro-mode"/);
});
test("Ornamentos mostram uma família de cada vez com ataques numerados",()=>{
 for(const group of ["one","two","phrases"])assert.match(html,new RegExp('data-ornament-group="'+group+'"'));
 assert.match(html,/function rhythmGlyph\(pattern\)/);
 assert.match(html,/kind:"attack",label:String\(index\+1\)/);
 assert.match(html,/\.ornament-preview \.ornament-step\.attack/);
 assert.match(html,/\.ornament-preview \.ornament-step\.rest/);
 assert.match(html,/\.ornament-preview \.ornament-step\.hold/);
});
