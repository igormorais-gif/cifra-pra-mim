const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'laboratorio-larry-monroe', 'index.html'), 'utf8');
const raw = html.match(/var events=\[([\s\S]*?)\];/);
assert.ok(raw, 'Dados musicais do exercício devem existir');
const events = [...raw[1].matchAll(/\{measure:(\d+),beat:(\d+),duration:(\d+),pitch:"([^"]+)",frequency:([\d.]+),type:"(\w+)"\}/g)]
  .map(m => ({ measure:+m[1], beat:+m[2], duration:+m[3], pitch:m[4], frequency:+m[5], type:m[6] }));

test('o laboratório está ligado à navegação principal', () => {
  const hub=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.match(hub,/href="laboratorio-larry-monroe\/(?:catalogo\.html)?"/);
  assert.match(html,/id="play"/);
  assert.match(html,/id="bpm"/);
  assert.match(html,/id="click"/);
});

test('V1 exercício 1 tem 4 compassos em 4/4 e 5 ataques', () => {
  assert.equal(events.length,5);
  assert.deepEqual(events.map(x=>x.measure),[1,2,2,3,4]);
  assert.deepEqual(events.map(x=>x.beat),[0,0,2,0,0]);
  assert.deepEqual(events.map(x=>x.duration),[4,2,2,4,4]);
  assert.deepEqual(events.map(x=>x.type),['whole','half','half','whole','whole']);
});

test('sem lacunas, sobreposições ou compassos excedidos', () => {
  for (let measure=1;measure<=4;measure++) {
    const notes=events.filter(e=>e.measure===measure).sort((a,b)=>a.beat-b.beat);
    let cursor=0;
    for (const note of notes) {
      assert.equal(note.beat,cursor, 'Lacuna ou sobreposição no compasso '+measure);
      cursor+=note.duration;
      assert.ok(cursor<=4, 'Nota ultrapassa compasso '+measure);
    }
    assert.equal(cursor,4,'Compasso incompleto '+measure);
  }
});

test('afinação de Fá4 e fonte documental permanecem identificadas', () => {
  assert.ok(events.every(e=>e.pitch==='F4' && Math.abs(e.frequency-349.228231)<.01));
  assert.match(html,/Revisão provisória/);
  assert.match(html,/1ayJrsEaRRBLfIk95TP2fJuvzIhE2-R9r/);
});
test('o livro digital mantém duas páginas originais e exercício 1 em uma pauta contínua', () => {
  assert.match(html, /class="spread"/);
  assert.match(html, /id="page6"/);
  assert.match(html, /id="page7"/);
  assert.match(html, /No compasso simples de 4\/4/);
  assert.match(html, /Cante os estudos a seguir em diferentes andamentos/);
  assert.match(html, /id="score"/);
  assert.match(html, /for\(let j=0;j<5;j\+\+\)/);
  assert.doesNotMatch(html, /for\(var m=0;m<4;m\+\+\)/);
  assert.match(html, /Transcrição musical em conferência/);
});
