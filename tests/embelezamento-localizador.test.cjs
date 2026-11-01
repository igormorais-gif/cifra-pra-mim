const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../laboratorio-embelezamento/index.html"),"utf8");
const core=html.slice(html.indexOf("const ROOTS="),html.indexOf("function svg("));
assert.ok(core.startsWith("const ROOTS="),"Código dos acordes ausente");
const runner=core+"\nconst out=[];for(const r of ROOTS)for(const group of ['321','432'])for(const form of ['135','351','513']){state.root=r.symbol;state.instrument='guitar';state.form=form;state.group=group;const notes=guitar(),bass=locator(notes);out.push({root:r.symbol,group,form,notes,bass});}return out;";
const combinations=new Function(runner)();
test("C/513/321: baixo localizador na quinta corda, casa 15",()=>{
  const {notes,bass}=combinations.find(x=>x.root==="C"&&x.group==="321"&&x.form==="513");
  assert.deepEqual(notes.map(n=>n.string),[3,2,1]);
  assert.deepEqual(notes.map(n=>n.fret),[12,13,12]);
  assert.equal(bass.string,5);
  assert.equal(bass.fret,15);
});
test("localizador permanece abaixo e na região dos desenhos",()=>{
  assert.equal(combinations.length,102);
  for(const {root,group,form,notes,bass} of combinations){
    const id=root+"/"+group+"/"+form;
    assert.ok(bass,id+": sem baixo");
    assert.ok(bass.midi<notes[0].midi,id+": baixo não está abaixo da tríade");
    const avg=notes.reduce((sum,n)=>sum+n.fret,0)/3;
    assert.ok(Math.abs(bass.fret-avg)<=7,id+": baixo afastado do desenho");
  }
});