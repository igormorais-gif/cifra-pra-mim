const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = readFileSync(path.join(root, 'laboratorio-larry-monroe', 'conducting.js'), 'utf8');

function setup(onReady) {
  const frames = [];
  const images = [];
  const context = {
    fillRect() {}, clearRect() {}, beginPath() {}, rect() {}, fill() {}, stroke() {},
    strokeRect() {}, fillText() {},
    drawImage(_atlas, x, y, w, h, left, top, width, height) {
      assert.deepEqual([w, h, left, top, width, height], [260, 360, 0, 0, 300, 415]);
      frames.push(x / w + y / h * 11);
    }
  };
  const canvas = { getContext: () => context };
  const environment = {
    window: {},
    document: { currentScript: { src: 'https://example.com/book/laboratorio-larry-monroe/conducting.js' } },
    URL,
    Image: class { constructor() { images.push(this); } }
  };
  vm.runInNewContext(source, environment);
  const { create, patternFor } = environment.window.MonroeConducting;
  return { patternFor, ...create(canvas, onReady), canvas, image: images[0], frames };
}

test('the book uses all 105 frames of the original atlas in order and anchors each 4/4 ictus to its beat', () => {
  const asset = readFileSync(path.join(root, 'metronomo-regencia', 'hand.webp'));
  assert.equal(createHash('sha256').update(asset).digest('hex'),
    'd22dad0e514177194fef1eb23ab48170257aafe5c34233198b12a474c42bf597');
  const standalone = readFileSync(path.join(root, 'metronomo-regencia', 'index.html'), 'utf8');
  assert.match(standalone, /const SRC='\.\/hand\.webp'/);
  assert.match(standalone, /Math\.floor\(cyc\/4\*count\)/);

  const { draw, image, frames, canvas } = setup();
  assert.equal(image.src, undefined);
  draw({ meter: [4, 4], beat: 0 });
  assert.equal(image.src, 'https://example.com/book/metronomo-regencia/hand.webp');
  assert.deepEqual([canvas.width, canvas.height], [300, 415]);
  image.onload();
  for (let step = 0; step < 4000; step++) draw({ meter: [4, 4], beat: step / 1000 });
  assert.deepEqual(frames, Array.from({ length: 105 }, (_, frame) => (frame + 101) % 105));
  frames.length = 0;
  for (const beat of [4, 5, 6, 7, 8]) draw({ meter: [4, 4], beat });
  assert.deepEqual(frames, [101, 27, 58, 86, 101]);
});

test('duple and triple patterns land on their respective beats and loop at the downbeat', () => {
  const { draw, image, frames } = setup();
  image.onload();
  for (const beat of [0, 1, 1.9, 2]) draw({ meter: [2, 4], beat });
  assert.deepEqual(frames, [101, 86, 99, 101]);
  frames.length = 0;
  for (const beat of [0, 1, 2, 2.9, 3]) draw({ meter: [3, 4], beat });
  assert.deepEqual(frames, [101, 58, 86, 99, 101]);
});

test('the renderer exposes the pulse unit and subdivision count without running a clock', () => {
  const readiness = [];
  const { draw, image, frames, patternFor } = setup(ready => readiness.push(ready));
  const cases = [
    [[2, 2], [2, 2, 2]],
    [[3, 4], [3, 1, 2]],
    [[4, 4], [4, 1, 2]],
    [[6, 8], [2, 1.5, 3]],
    [[9, 8], [3, 1.5, 3]],
    [[12, 8], [4, 1.5, 3]]
  ];
  for (const [meter, expected] of cases) {
    const { beats, beatUnit, subdivisions } = patternFor(meter);
    assert.deepEqual([beats, beatUnit, subdivisions], expected);
  }
  assert.equal(patternFor([5, 4]), null);
  assert.equal(draw({ meter: [5, 4], beat: 0 }), false);
  assert.equal(draw({ meter: [9, 8], beat: NaN }), false);
  draw({ meter: [4, 4], beat: 1 });
  draw({ meter: [9, 8], beat: 1 });
  assert.deepEqual(frames, []);
  image.onload();
  assert.deepEqual(frames, [58]);
  assert.deepEqual(readiness, [true]);
  draw({ meter: [9, 8], beat: 1 });
  assert.deepEqual(frames, [58]);
});
