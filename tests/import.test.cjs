const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sandbox={window:{}};
for(const relative of ["src/engine.js","src/import.js"]){
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",relative),"utf8"),sandbox,{filename:relative});
}
const {chordsFromText,valid,pdfLines}=sandbox.window.CifraImport;

test("reconhece acordes acima das letras sem confundir palavras com cifras",()=>{
  const input="Tom: G\n      Am7    D7     G7M\nQuando o dia vem\n      C7M     F7M\nChega a música";
  const result=chordsFromText(input);
  assert.equal(result.progression,"Am7 D7 G7M C7M F7M");
});

test("aceita acordes dentro dos colchetes no texto",()=>{
  const result=chordsFromText("[Em]Quero [C7M]sentir [D7]o som");
  assert.equal(result.progression,"Em C7M D7");
});

test("preserva tensões entre parênteses",()=>{
  const result=chordsFromText("C7(#9,b13) Bb6(#11) A7(b13) Gm7(b5)");
  assert.equal(result.progression,"C7(#9,b13) Bb6(#11) A7(b13) Gm7(b5)");
});

test("não considera palavras portuguesas comuns como acordes",()=>{
  const result=chordsFromText("Tom: C\nA noite chegou\nEmoção sem fim\n  G D7");
  assert.equal(result.progression,"G D7");
  assert.equal(valid("Amigo"),false);
});

test("limita a 48 acordes e informa truncamento",()=>{
  const result=chordsFromText(Array(25).fill("C G").join("\n"));
  assert.equal(result.total,50);
  assert.equal(result.chords.length,48);
  assert.equal(result.truncated,true);
});

test("reconstitui linhas de PDF usando coordenadas, e não apenas itens isolados",()=>{
  const text=pdfLines([
    {str:"D7",transform:[1,0,0,1,95,700],width:18},
    {str:"Am7",transform:[1,0,0,1,30,700],width:25},
    {str:"Meu amor",transform:[1,0,0,1,30,680],width:60}
  ]);
  assert.equal(text,"Am7 D7\nMeu amor");
});

test("ponta da mão direita permanece no registro C4–A5 e início é idêntico",()=>{
  const engine=sandbox.window.CifraEngine;
  for(const source of ["C Am F G","F#m7 Bm7 E7","Bb6(#11) A7(b13) Gm9","G G7M G7 Gm7 Gm7(b5) G°7"]){
    const result=engine.generate(source);
    for(let i=0;i<3;i++){
      assert.equal(result.adapted[i][0],result.originalTracks[i][0]);
      for(const chord of result.adapted[i])assert.ok(chord.top>=60&&chord.top<=81);
      for(let n=1;n<result.adapted[i].length;n++){
        const prev=result.adapted[i][n-1];
        const target=result.chords[n];
        const all=engine.candidates(target);
        const minDiff=Math.min(...all.map(c=>Math.abs(c.top-prev.top)));
        assert.equal(Math.abs(result.adapted[i][n].top-prev.top),minDiff);
      }
    }
  }
});
