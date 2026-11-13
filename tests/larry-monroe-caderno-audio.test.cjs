const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MonroeAudio } = require('../laboratorio-larry-monroe/caderno-audio.js');

const note = (d, extra = {}) => ({ t: 'n', d, midi: 65, ...extra });
const rest = d => ({ t: 'r', d });

test('tied notes produce one attack while each notated note retains its place in the bar', () => {
  const exercise = { meter: [3, 4], bars: [
    [note(2), note(1, { tieStart: true })],
    [note(1, { tieStop: true, tieStart: true }), note(1, { tieStop: true }), rest(1)]
  ] };
  const score = MonroeAudio.timeline(exercise, { beats: 3, beatUnit: 1 });
  assert.deepEqual(score.notes, [{ start: 0, end: 2, pitch: 65 }, { start: 2, end: 5, pitch: 65 }]);
  assert.deepEqual(MonroeAudio.positionAt(score, 3), { position: 3, measure: 1, beat: 0 });
  assert.deepEqual(MonroeAudio.positionAt(score, 4.5), { position: 4.5, measure: 1, beat: 1.5 });
});

test('the WAV and visual position use the same compound beat and tempo', async () => {
  const exercise = { meter: [6, 8], bars: Array.from({ length: 16 }, () => [rest(3)]) };
  const score = MonroeAudio.timeline(exercise, { beats: 2, beatUnit: 1.5 });
  assert.deepEqual(MonroeAudio.positionAt(score, 46.5), { position: 46.5, measure: 15, beat: 1 });
  for (const bpm of [60, 120]) {
    const wave = await MonroeAudio.renderWave(score, bpm, true).arrayBuffer();
    const view = new DataView(wave);
    const rate = view.getUint32(24, true);
    const samples = new Int16Array(wave, 44);
    const secondsPerPulse = 60 / bpm;
    const pulse = Math.round(31 * secondsPerPulse * rate);
    assert.equal(samples.length, 32 * secondsPerPulse * rate);
    assert.equal(samples[pulse - 5], 0);
    assert.notEqual(samples[pulse + 8], 0);
    const noClick = await MonroeAudio.renderWave(score, bpm, false).arrayBuffer();
    assert.equal(new Int16Array(noClick, 44).some(value => value !== 0), false);
  }
});

test('notes produce PCM signal with the metronome off and never sound through a rest', async () => {
  const exercise = { meter: [2, 4], bars: [[note(1), rest(1)]] };
  const score = MonroeAudio.timeline(exercise, { beats: 2, beatUnit: 1 });
  const wave = await MonroeAudio.renderWave(score, 60, false).arrayBuffer();
  const samples = new Int16Array(wave, 44);
  assert.equal(samples.length, 44100);
  assert.ok(samples.subarray(0, 22050).some(value => Math.abs(value) > 1000));
  assert.ok(samples.subarray(22050).every(value => value === 0));
});
