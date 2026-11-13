(function (root) {
  'use strict';

  function timeline(exercise, pattern) {
    const [numerator, denominator] = exercise.meter;
    const measureLength = numerator * 4 / denominator;
    const pulseLength = pattern ? pattern.beatUnit : 4 / denominator;
    const pulsesPerMeasure = Math.round(measureLength / pulseLength);
    const measures = [];
    const notes = [];
    const openTies = new Map();
    let end = 0;

    for (const [index, bar] of exercise.bars.entries()) {
      const start = end;
      let barPosition = 0;
      for (const note of bar) {
        const offset = note.at ?? barPosition;
        barPosition = Math.max(barPosition, offset + note.d);
        if (note.t === 'r') continue;
        const pitch = note.midi ?? 72;
        const voice = (note.voice ?? 1) + ':' + pitch;
        const previous = openTies.get(voice);
        const position = start + offset;
        const continues = note.tieStop && previous && Math.abs(position - previous.end) < 0.0001;
        const event = continues ? previous : { start: position, pitch };
        event.end = position + note.d;
        if (!continues) notes.push(event);
        if (note.tieStart) openTies.set(voice, event);
        else openTies.delete(voice);
      }
      end += barPosition || measureLength;
      const phaseOffset = index === 0 && barPosition > 0 && barPosition < measureLength
        ? measureLength - barPosition : 0;
      measures.push({ start, end, phaseOffset });
    }

    return { measures, notes, end, pulseLength, pulsesPerMeasure };
  }

  function positionAt(score, quarters) {
    const position = Math.max(0, Math.min(quarters, score.end - 0.000001));
    const measure = score.measures.findIndex(item => position < item.end);
    if (measure < 0) return { position: 0, measure: 0, beat: 0 };
    const { start, phaseOffset } = score.measures[measure];
    const beat = (position - start + phaseOffset) / score.pulseLength;
    return { position, measure, beat: beat % score.pulsesPerMeasure };
  }

  function renderWave(score, bpm, withClick, rate = 22050) {
    const secondsPerQuarter = 60 / bpm / score.pulseLength;
    const frames = Math.max(1, Math.round(score.end * secondsPerQuarter * rate));
    const pcm = new Float32Array(frames);

    function oscillator(position, seconds, frequency, gain, click = false) {
      const start = Math.round(position * secondsPerQuarter * rate);
      const samples = Math.min(frames - start, Math.floor(seconds * rate));
      const step = Math.PI * 2 * frequency / rate;
      for (let sample = 0; sample < samples; sample++) {
        const time = sample / rate;
        const release = (samples - 1 - sample) / rate;
        const envelope = click
          ? Math.exp(-time * 65) * Math.min(1, release / 0.005)
          : Math.min(1, time / 0.008, release / 0.04) * Math.exp(-time * 0.45);
        const sound = 0.82 * Math.sin(sample * step) + 0.18 * Math.sin(sample * 2 * step);
        pcm[start + sample] += sound * gain * envelope;
      }
    }

    for (const note of score.notes) {
      oscillator(note.start, (note.end - note.start) * secondsPerQuarter * 0.95,
        440 * 2 ** ((note.pitch - 69) / 12), 0.28);
    }
    if (withClick) {
      for (const { start, end, phaseOffset } of score.measures) {
        for (let i = 0; i < score.pulsesPerMeasure; i++) {
          const pulse = start + i * score.pulseLength - phaseOffset;
          if (pulse >= start - 0.00001 && pulse < end - 0.00001) {
            oscillator(Math.max(start, pulse), 0.075, i === 0 ? 1160 : 820, i === 0 ? 0.32 : 0.21, true);
          }
        }
      }
    }

    const bytes = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(bytes);
    function label(offset, value) {
      for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
    }
    label(0, 'RIFF');
    view.setUint32(4, 36 + frames * 2, true);
    label(8, 'WAVE');
    label(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    label(36, 'data');
    view.setUint32(40, frames * 2, true);
    for (let i = 0; i < frames; i++) {
      const sample = Math.max(-0.97, Math.min(0.97, pcm[i]));
      view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
    }
    return new Blob([bytes], { type: 'audio/wav' });
  }

  root.MonroeAudio = { recordingBpm: 80, timeline, positionAt, renderWave };
})(typeof module === 'undefined' ? globalThis : module.exports);
