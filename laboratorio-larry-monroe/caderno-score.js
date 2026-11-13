(function (root) {
  "use strict";

  const ink = "#292b27";
  const paper = "#fffef9";
  const diatonic = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const noteValues = { whole: 4, half: 2, quarter: 1, eighth: .5, "16th": .25, "32nd": .125 };
  const flags = { eighth: 1, "16th": 2, "32nd": 3 };
  const accidentals = { flat: "♭", sharp: "♯", natural: "♮", "double-sharp": "𝄪", "flat-flat": "𝄫" };
  // Leituras das páginas impressas 25, 26 e 34 que divergem da transcrição anterior.
  // Cada letra representa a figura; colcheias consecutivas entre colchetes formam um grupo.
  const barCorrections = {
    "3-11": [3, "[ee]qqq"],
    "3-13": [2, "[ee]qq[ee]"],
    "4-15": [6, "q[ee][ee]q"]
  };
  const cache = new Map();
  // Longer beam groups and adjacent separate beams checked on pp. 41–43 and 60.
  const sourceBeams = {
    '5-2': { 0: [[2, 3, 4, 5]], 2: [[0, 1, 2, 3]] },
    '5-4': { 0: [[0, 1], [3, 4, 5, 6]] },
    '5-11': { 0: [[0, 1, 2, 3], [4, 5]], 1: [[1, 2, 3, 4]], 3: [[0, 1, 2, 3], [4, 5]] },
    '5-15': { 6: [[0, 1], [3, 4, 5, 6]] },
    '7-2': { 0: [[1, 2]], 1: [[2, 3]] }
  };
  const close = (a, b) => Math.abs(a - b) < .00001;
  const children = (element, name) => element ? [...element.children].filter(child => child.localName === name) : [];
  const first = (element, name) => children(element, name)[0];
  const text = (element, name) => first(element, name)?.textContent.trim() || "";
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function meterFor(exercise) {
    return Array.isArray(exercise.meter) ? exercise.meter : [exercise.meter, 4];
  }

  function parseMusicXML(raw) {
    const document = new DOMParser().parseFromString(raw, "application/xml");
    const root = document.documentElement;
    const parts = children(root, "part");
    if (root.localName !== "score-partwise" || parts.length !== 1) {
      throw new Error("Esperava uma partitura monofônica em MusicXML.");
    }
    const bars = [];
    const barStyles = [];
    const systemStarts = [0];
    let divisions = 1;
    let clef = "G";
    let meter;
    let timeSymbol = "";

    for (const measure of children(parts[0], "measure")) {
      const attributes = first(measure, "attributes");
      divisions = Number(text(attributes, "divisions")) || divisions;
      clef = text(first(attributes, "clef"), "sign") || clef;
      const time = first(attributes, "time");
      if (time) {
        const signature = [Number(text(time, "beats")), Number(text(time, "beat-type"))];
        if (meter && !meter.every((value, index) => value === signature[index])) {
          throw new Error("Mudança de fórmula dentro do exercício.");
        }
        meter = signature;
        timeSymbol = time.getAttribute("symbol") || "";
      }
      if (bars.length && children(measure, "print").some(print =>
        print.getAttribute("new-system") === "yes" || print.getAttribute("new-page") === "yes"
      )) {
        systemStarts.push(bars.length);
      }
      if (first(measure, "backup") || first(measure, "forward")) {
        throw new Error("Deslocamento de voz em exercício monofônico.");
      }
      const bar = children(measure, "note").map(note => {
        if (first(note, "chord") || first(note, "grace")) {
          throw new Error("Nota não sequencial em exercício monofônico.");
        }
        const rest = first(note, "rest");
        const pitch = first(note, "pitch");
        const step = text(pitch, "step");
        const octave = Number(text(pitch, "octave"));
        const alter = Number(text(pitch, "alter"));
        const duration = Number(text(note, "duration")) / divisions;
        if (!(duration > 0) || (!rest && (!(step in diatonic) || !Number.isInteger(octave)))) {
          throw new Error("Duração ou altura inválida.");
        }
        const notations = first(note, "notations");
        const tie = kind => [...children(note, "tie"), ...children(notations, "tied")]
          .find(mark => mark.getAttribute("type") === kind);
        const tieStart = tie("start");
        const tieStop = tie("stop");
        const beams = [];
        for (const beam of children(note, "beam")) {
          beams[Number(beam.getAttribute("number") || 1) - 1] = beam.textContent.trim();
        }
        return {
          t: rest ? "r" : "n",
          d: duration,
          type: rest?.getAttribute("measure") === "yes" ? "whole" : text(note, "type"),
          dots: children(note, "dot").length,
          beams,
          step, octave,
          midi: rest ? null : (octave + 1) * 12 + semitones[step] + alter,
          stem: text(note, "stem"),
          accidental: text(note, "accidental"),
          lyric: text(first(note, "lyric"), "text"),
          tieStart: Boolean(tieStart),
          tieStop: Boolean(tieStop),
          tiePlacement: tieStart?.getAttribute("placement") || tieStop?.getAttribute("placement") || "",
          slurs: children(notations, "slur").map(mark => ({
            type: mark.getAttribute("type"),
            number: mark.getAttribute("number") || "1",
            placement: mark.getAttribute("placement") || ""
          }))
        };
      });
      if (!meter || !meter.every(value => Number.isInteger(value) && value > 0) ||
          !close(bar.reduce((sum, note) => sum + note.d, 0), meter[0] * 4 / meter[1])) {
        throw new Error("Duração divergente da fórmula do compasso.");
      }
      bars.push(bar);
      const right = children(measure, "barline").find(barline => barline.getAttribute("location") === "right");
      barStyles.push(text(right, "bar-style"));
    }
    if (!bars.length) throw new Error("Partitura sem compassos.");

    return {
      meter, bars, barStyles, clef, timeSymbol,
      systems: systemStarts.length > 1 ?
        systemStarts.map((start, index) => (systemStarts[index + 1] ?? bars.length) - start) : null
    };
  }

  function fileFor(exercise) {
    const { l, n } = exercise;
    if (l === 7 && n === 6) return "./vol1_p61_ex06.musicxml";
    if (l === 1) return "./partituras/v1-ex" + String(n).padStart(3, "0") + ".musicxml";
    if ([2, 3, 4, 6, 7].includes(l)) {
      return "./partituras/v1-l" + l + "-r" + String(n).padStart(3, "0") + ".musicxml";
    }
    return null;
  }

  function sameRhythm(original, transcribed) {
    function attacks(bar) {
      let at = 0;
      const notes = [];
      for (const event of bar) {
        if (event.t === "n") notes.push({ at, duration: event.d });
        at += event.d;
      }
      return { notes, length: at };
    }
    return original.length === transcribed.length && original.every((bar, barIndex) => {
      const left = attacks(bar);
      const right = attacks(transcribed[barIndex]);
      return close(left.length, right.length) && left.notes.length === right.notes.length &&
        left.notes.every(({ at, duration }, index) =>
          close(at, right.notes[index].at) && close(duration, right.notes[index].duration)
        );
    });
  }

  function applySourceCorrections(exercise) {
    const correction = barCorrections[exercise.l + "-" + exercise.n];
    if (!correction) return exercise;

    const [index, notation] = correction;
    const template = exercise.bars[index][0];
    const bars = exercise.bars.slice();
    bars[index] = [...notation.matchAll(/\[e+\]|q/g)].flatMap(([group]) => {
      if (group === "q") return { ...template, t: "n", type: "quarter", d: 1, dots: 0, beams: [] };
      const count = group.length - 2;
      return Array.from({ length: count }, (_, position) => ({
        ...template, t: "n", type: "eighth", d: .5, dots: 0,
        beams: [position === 0 ? "begin" : position === count - 1 ? "end" : "continue"]
      }));
    });
    return { ...exercise, bars };
  }

  async function load(exercise) {
    const systems = root.MonroeSystems?.[exercise.l + "-" + exercise.n] ?? (exercise.bars.length ? [exercise.bars.length] : null);
    const initial = { ...exercise, meter: meterFor(exercise), systems, timeSymbol: exercise.l === 5 ? 'common' : '' };
    const file = exercise.bars.length ? fileFor(exercise) : null;
    if (!file) return initial;
    if (!cache.has(file)) {
      cache.set(file, fetch(file)
        .then(response => response.ok ? response.text() : Promise.reject(new Error(response.statusText)))
        .then(parseMusicXML)
        .catch(() => {
          cache.delete(file);
          return null;
        }));
    }
    const score = await cache.get(file);
    if (!score || !score.meter.every((value, index) => value === initial.meter[index]) ||
        !sameRhythm(exercise.bars, score.bars)) return applySourceCorrections(initial);

    return applySourceCorrections({ ...initial, ...score, systems: score.systems ?? systems });
  }

  function beamGroups(events, level, beatUnit) {
    const groups = [];
    const assigned = new Set();
    let group = [];
    const finish = () => {
      if (group.length > 1) {
        groups.push(group);
        group.forEach(index => assigned.add(index));
      }
      group = [];
    };
    events.forEach((event, index) => {
      const beam = event.beams?.[level - 1];
      if (beam === "begin") {
        finish();
        group.push(index);
      } else if (group.length && (beam === "continue" || beam === "end")) {
        group.push(index);
        if (beam === "end") finish();
      } else {
        finish();
        if (beam === "forward hook" || beam === "backward hook") {
          groups.push([index]);
          assigned.add(index);
        }
      }
    });
    finish();

    // Um MusicXML sem barra para uma nota curta manda manter sua bandeirola.
    // Apenas a transcrição abreviada não contém essa informação.
    events.forEach((event, index) => {
      const prior = group.length ? events[group[group.length - 1]] : null;
      if (prior && (!close(prior.on + prior.d, event.on) ||
          Math.floor((prior.on + .00001) / beatUnit) !== Math.floor((event.on + .00001) / beatUnit))) finish();
      if (event.t === "n" && event.beams === undefined && flags[event.type] >= level) group.push(index);
      else finish();
    });
    finish();
    return { groups, assigned };
  }

  function normalizeBar(bar, start, length, clef) {
    let cursor = start;
    return bar.map(note => {
      const isFullRest = note.t === "r" && bar.length === 1 && close(note.d, length);
      const type = note.type || (isFullRest ? "whole" :
        Object.keys(noteValues).find(value => [1, 1.5, 1.75].some(multiplier =>
          close(noteValues[value] * multiplier, note.d)
        )) || "quarter");
      const dots = note.dots ?? (isFullRest ? 0 :
        close(note.d / noteValues[type], 1.5) ? 1 : close(note.d / noteValues[type], 1.75) ? 2 : 0);
      const octave = note.octave ?? 4;
      const step = note.step || "F";
      const bottom = clef === "F" ? 2 * 7 + diatonic.G : 4 * 7 + diatonic.E;
      const y = 77 - (octave * 7 + diatonic[step] - bottom) * 5;
      const on = cursor;
      cursor += note.d;
      return { ...note, on, type, dots, y, isFullRest };
    });
  }

  function reviewedBeams(bar, groups) {
    if (!groups) return bar;
    const marked = bar.map(note => ({ ...note, beams: [] }));
    for (const group of groups) {
      group.forEach((index, position) => {
        if (marked[index]?.d === 0.5) {
          marked[index].beams = [position === 0 ? 'begin' : position === group.length - 1 ? 'end' : 'continue'];
        }
      });
    }
    return marked;
  }

  const line = (x1, y1, x2, y2, width = 1, color = ink, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const label = (x, y, value, size, extra = "") =>
    `<text x="${x}" y="${y}" font-size="${size}" font-family="Georgia,serif" fill="${ink}" ${extra}>${escape(value)}</text>`;
  const circle = (x, y, radius) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${ink}"/>`;
  const rect = (x, y, width, height) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${ink}"/>`;
  const path = (d, width, extra = "") =>
    `<path d="${d}" stroke="${ink}" stroke-width="${width}" fill="none" ${extra}/>`;

  function drawRest(event, x) {
    const { type, dots } = event;
    let out;
    if (type === "whole" || type === "half") {
      out = rect(x - 8, type === "whole" ? 47 : 52, 16, 5);
    } else if (type === "quarter") {
      out = path(`M ${x + 1} 39 l -5 8 7 8 -6 7 q -4 5 3 11 q -3 -7 5 -7`, 2.7, 'stroke-linejoin="round"');
    } else {
      const count = flags[type] || 1;
      out = line(x + 6, 45, x - 3, 63 + (count - 1) * 7, 1.8);
      for (let flag = 0; flag < count; flag++) {
        const y = 49 + flag * 7;
        out += circle(x - flag * 2, y, 2.7) + path(`M ${x - flag * 2} ${y} q 3 3 ${6 - flag} -4`, 1.7);
      }
    }
    for (let dot = 0; dot < dots; dot++) out += circle(x + 13 + dot * 6, 52, 1.8);
    return out;
  }

  function drawNote(event, x, stem, beamed) {
    const { type, y, dots, accidental, lyric } = event;
    let out = "";
    for (let ledger = 87; ledger <= y; ledger += 10) out += line(x - 11, ledger, x + 11, ledger);
    for (let ledger = 27; ledger >= y; ledger -= 10) out += line(x - 11, ledger, x + 11, ledger);
    const hollow = type === "whole" || type === "half";
    const radius = type === "whole" ? 8.9 : 6.8;
    out += `<ellipse cx="${x}" cy="${y}" rx="${radius}" ry="4.4" transform="rotate(-18 ${x} ${y})" fill="${hollow ? paper : ink}" stroke="${ink}" stroke-width="1.5"/>`;
    if (accidentals[accidental]) out += label(x - 15, y + 5, accidentals[accidental], 18, 'text-anchor="middle"');
    for (let dot = 0; dot < dots; dot++) {
      out += circle(x + radius + 6 + dot * 6, (77 - y) % 10 === 0 ? y - 5 : y, 1.8);
    }
    if (stem) {
      const { x: sx, end, direction } = stem;
      out += line(sx, y, sx, end, 1.5);
      for (let flag = 0; flag < (flags[type] || 0); flag++) {
        if (beamed[flag].assigned.has(event.index)) continue;
        const dy = direction === "up" ? 1 : -1;
        const fy = end + flag * 6 * dy;
        out += path(`M ${sx} ${fy} c 1 ${9 * dy} 15 ${7 * dy} 10 ${20 * dy}`, 2);
      }
    }
    if (lyric) out += label(x, 20, lyric, 14, 'text-anchor="middle" class="score-lyric"');
    return out;
  }

  function drawConnections(notes, left, right) {
    let out = "";
    const openSlurs = new Map();
    function curve(start, end, placement, kind) {
      const above = placement === "above";
      const y1 = start.y + (above ? -9 : 9);
      const y2 = end.y + (above ? -9 : 9);
      const x1 = start.x + 5;
      const x2 = end.x - 5;
      if (x2 <= x1) return "";
      const depth = Math.min(17, (x2 - x1) * .31);
      return path(`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + (above ? -depth : depth)} ${x2} ${y2}`,
        1.5, `class="score-${kind}"`);
    }
    notes.forEach((note, index) => {
      const next = notes[index + 1];
      const placement = note.tiePlacement || (note.stem === "down" ? "above" : "below");
      if (note.tieStop && index === 0) out += curve({ x: left, y: note.y }, note, placement, "tie");
      if (note.tieStart) {
        if (next?.tieStop && note.midi === next.midi && close(note.on + note.d, next.on)) {
          out += curve(note, next, placement, "tie");
        } else if (!next) {
          out += curve(note, { x: right, y: note.y }, placement, "tie");
        }
      }
      for (const mark of note.slurs || []) {
        if (mark.type === "start") openSlurs.set(mark.number, { note, placement: mark.placement });
        if (mark.type === "stop") {
          const start = openSlurs.get(mark.number);
          out += curve(start?.note || { x: left, y: note.y }, note,
            start?.placement || mark.placement || "above", "slur");
          openSlurs.delete(mark.number);
        }
      }
    });
    for (const { note, placement } of openSlurs.values()) {
      out += curve(note, { x: right, y: note.y }, placement || "above", "slur");
    }
    return out;
  }

  function drawBar(events, left, width, length, beatUnit) {
    let out = "";
    const beamed = [1, 2, 3].map(level => beamGroups(events, level, beatUnit));
    const notes = [];
    const stems = new Map();
    const groupDirections = new Map();
    for (const group of beamed[0].groups) {
      const firstStem = group.map(index => events[index].stem).find(stem => stem === "up" || stem === "down");
      const average = group.reduce((sum, index) => sum + events[index].y, 0) / group.length;
      for (const index of group) groupDirections.set(index, firstStem || (average < 57 ? "down" : "up"));
    }
    events.forEach((event, index) => {
      const at = event.on - events[0].on;
      const x = event.isFullRest ? left + width / 2 : left + 19 + at / length * (width - 30);
      let stem = null;
      if (event.t === "n" && event.type !== "whole" && event.stem !== "none") {
        const direction = groupDirections.get(index) || event.stem || (event.y < 57 ? "down" : "up");
        const sign = direction === "down" ? -1 : 1;
        stem = { x: x + sign * 6, y: event.y, end: event.y - sign * 31, direction };
        stems.set(index, stem);
      }
      out += `<g class="score-event" data-on="${event.on}" data-dur="${event.d}">`;
      out += event.t === "r" ? drawRest(event, x) : drawNote({ ...event, index }, x, stem, beamed);
      out += "</g>";
      if (event.t === "n") notes.push({ ...event, x, stem: stem?.direction });
    });
    beamed.forEach(({ groups }, level) => {
      for (const group of groups) {
        const groupStems = group.map(index => stems.get(index)).filter(Boolean);
        if (!groupStems.length) continue;
        const start = groupStems[0];
        const end = groupStems[groupStems.length - 1];
        const sign = start.direction === "down" ? -1 : 1;
        const primaryGroup = beamed[0].groups.find(indices => indices.includes(group[0])) || group;
        const tips = primaryGroup.map(index => stems.get(index)?.end).filter(Number.isFinite);
        const y = (sign === 1 ? Math.min(...tips) : Math.max(...tips)) + level * 6 * sign;
        const x2 = group.length > 1 ? end.x : start.x + (events[group[0]].beams?.[level] === "backward hook" ? -9 : 9);
        out += `<g class="score-beam" data-level="${level + 1}">`;
        if (level === 0) for (const stem of groupStems) out += line(stem.x, stem.end, stem.x, y, 1.5);
        out += line(start.x, y, x2, y, 4) + "</g>";
      }
    });
    return { out, notes };
  }

  function drawSystem(exercise, bars, firstBar, width, offset, length, beatUnit) {
    const right = width - 6;
    const clef = exercise.clef || "G";
    const barWidth = (right - offset) / bars.length;
    const continuationClef = root.MonroeContinuationClefs?.includes(exercise.l + "-" + exercise.n);
    const showClef = !firstBar || continuationClef;
    const endBar = firstBar + bars.length;
    const range = bars.length === 1 ? "Compasso " + endBar : "Compassos " + (firstBar + 1) + "–" + endBar;
    const notes = [];
    let out = `<div class="system" data-start="${firstBar}" data-end="${endBar - 1}" style="--system-width:${width}px">`;
    out += `<svg viewBox="0 0 ${width} 112" role="img" aria-label="${range}">`;
    for (let y = 37; y <= 77; y += 10) out += line(6, y, right, y, .9, "#66675e");
    if (showClef) {
      out += label(9, clef === "F" ? 67 : 76, clef === "F" ? "𝄢" : "𝄞", 45,
        'style="font-family:Apple Symbols,Segoe UI Symbol,Georgia,serif"');
    } else {
      out += line(6, 37, 6, 77, 1.2);
    }
    if (!firstBar) {
      const [numerator, denominator] = meterFor(exercise);
      if (exercise.timeSymbol === "common") out += label(46, 65, "C", 26);
      else if (exercise.timeSymbol === "cut") out += label(46, 65, "¢", 26);
      else {
        out += label(51, 53, numerator, 18, 'text-anchor="middle" font-weight="bold"');
        out += label(51, 73, denominator, 18, 'text-anchor="middle" font-weight="bold"');
      }
    }
    bars.forEach((bar, index) => {
      const barIndex = firstBar + index;
      const left = offset + barWidth * index;
      const end = left + barWidth;
      const contents = drawBar(bar, left, barWidth, length, beatUnit);
      out += `<g class="score-measure" data-measure="${barIndex + 1}">${contents.out}`;
      notes.push(...contents.notes);
      const barStyle = exercise.barStyles?.[barIndex];
      const final = barIndex === exercise.bars.length - 1;
      if (barStyle === "light-heavy" || barStyle === "light-light" || (final && !barStyle)) {
        out += line(end - 5, 37, end - 5, 77, 1.05) + line(end, 37, end, 77, barStyle === "light-light" ? 1.05 : 2.6);
      } else if (barStyle !== "none") {
        out += line(end, 37, end, 77, 1.05);
      }
      out += "</g>";
    });
    return out + drawConnections(notes, offset, right) + "</svg></div>";
  }

  function render(exercise, systems = exercise.systems) {
    if (!Array.isArray(systems) || !systems.every(count => Number.isInteger(count) && count > 0) ||
        systems.reduce((sum, count) => sum + count, 0) !== exercise.bars.length) {
      return '<p class="pending-note">A diagramação deste exercício ainda precisa de conferência com o original.</p>';
    }
    const [numerator, denominator] = meterFor(exercise);
    const length = numerator * 4 / denominator;
    const beatUnit = denominator === 8 && numerator >= 6 && numerator % 3 === 0 ? 1.5 : 4 / denominator;
    const clef = exercise.clef || "G";
    const beamGroups = sourceBeams[exercise.l + '-' + exercise.n];
    const bars = exercise.bars.map((bar, index) => normalizeBar(reviewedBeams(bar, beamGroups?.[index]), index * length, length, clef));
    const minBarWidth = Math.max(118, ...bars.map(bar => {
      const gaps = bar.slice(0, -1).map(event => length / event.d * (event.dots ? 25 : 19) + 30);
      return Math.ceil(Math.max(118, ...gaps));
    }));
    const width = Math.max(720, 75 + Math.max(...systems) * minBarWidth);
    let out = '<div class="score-window">';
    let firstBar = 0;
    for (const count of systems) {
      const continuationClef = root.MonroeContinuationClefs?.includes(exercise.l + "-" + exercise.n);
      const offset = firstBar === 0 ? 69 : continuationClef ? 41 : 7;
      out += drawSystem(exercise, bars.slice(firstBar, firstBar + count), firstBar, width, offset, length, beatUnit);
      firstBar += count;
    }
    return out + "</div>";
  }

  const api = { load, render, parseMusicXML };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MonroeScore = api;
})(globalThis);
