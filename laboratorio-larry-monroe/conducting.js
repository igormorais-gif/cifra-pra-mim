(function () {
  'use strict';

  const atlasUrl = new URL('../metronomo-regencia/hand.webp', document.currentScript.src);
  const width = 300;
  const height = 415;
  const tileWidth = 260;
  const tileHeight = 360;
  const columns = 11;
  const lastFrame = 104;

  // Simple and compound conducting patterns: Mann & Shannon, Music in Motion, chapters 2 and 8.
  // https://pressbooks.pub/musicinmotion/chapter/basic_beat_patterns/
  // https://pressbooks.pub/musicinmotion/chapter/chapter-7-compound-meter-beat-patterns/
  const patterns = new Map([
    ['2/2', { beats: 2, beatUnit: 2, subdivisions: 2 }],
    ['2/4', { beats: 2, beatUnit: 1, subdivisions: 2 }],
    ['2/8', { beats: 2, beatUnit: 0.5, subdivisions: 2 }],
    ['3/2', { beats: 3, beatUnit: 2, subdivisions: 2 }],
    ['3/4', { beats: 3, beatUnit: 1, subdivisions: 2 }],
    ['4/2', { beats: 4, beatUnit: 2, subdivisions: 2 }],
    ['4/4', { beats: 4, beatUnit: 1, subdivisions: 2 }],
    ['4/8', { beats: 4, beatUnit: 0.5, subdivisions: 2 }],
    ['6/8', { beats: 2, beatUnit: 1.5, subdivisions: 3 }],
    ['9/8', { beats: 3, beatUnit: 1.5, subdivisions: 3 }],
    ['12/8', { beats: 4, beatUnit: 1.5, subdivisions: 3 }]
  ]);
  for (const pattern of patterns.values()) Object.freeze(pattern);

  // For duple and triple time, edit the original footage at matching hand poses.
  // Each row begins on the ictus of a beat. The low pose is frame 101, the
  // outward pose is 58, and the upward pose is 86. The splice after frame 3
  // leaves the wrist in the same part of the image before the next gesture.
  const up = frameRange(86, 100);
  const rebound = [...frameRange(101, lastFrame), ...frameRange(0, 3)];
  const duple = [[...rebound, ...frameRange(73, 85)], up];
  const triple = [[...rebound, ...frameRange(44, 57)], frameRange(58, 85), up];
  // Unroll the original 4/4 loop from its low pose. Each interval retains
  // every frame in order and lands on the visible change of direction.
  const quadruple = [
    [...frameRange(101, lastFrame), ...frameRange(0, 26)],
    frameRange(27, 57),
    frameRange(58, 85),
    up
  ];
  const framesByBeats = { 2: duple, 3: triple, 4: quadruple };

  const beatLabels = {
    2: [['1', 150, 222], ['2', 150, 87]],
    3: [['1', 150, 222], ['2', 249, 157], ['3', 150, 87]],
    4: [['4', 150, 90], ['2', 67, 165], ['3', 253, 161], ['1', 152, 221]]
  };
  const quadrupleSubdivisions = [['e', 150, 66], ['e', 34, 166], ['e', 150, 185], ['e', 274, 160]];

  function frameRange(first, last) {
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  function patternFor(meter) {
    return Array.isArray(meter) && meter.length === 2 ? patterns.get(meter.join('/')) || null : null;
  }

  function frameAt(beat, beats) {
    const phase = ((beat % beats) + beats) % beats;
    const beatIndex = Math.floor(phase);
    const frames = framesByBeats[beats][beatIndex];
    return frames[Math.min(frames.length - 1, Math.floor((phase - beatIndex) * frames.length))];
  }

  function drawBoard(context, pattern) {
    context.fillStyle = '#e9e6e0';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#f9f9f6';
    context.strokeStyle = '#b8b6af';
    context.lineWidth = 4;
    context.beginPath();
    if (typeof context.roundRect === 'function') context.roundRect(7, 41, 286, 218, 5);
    else context.rect(7, 41, 286, 218);
    context.fill();
    context.stroke();
    context.strokeStyle = '#eee';
    context.lineWidth = 1;
    context.strokeRect(10, 44, 280, 212);

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#444748';
    context.font = '20px Georgia, serif';
    for (const [label, x, y] of beatLabels[pattern.beats]) context.fillText(label, x, y);
    if (pattern.beats === 4 && pattern.subdivisions === 2) {
      context.font = '12px Georgia, serif';
      for (const [label, x, y] of quadrupleSubdivisions) context.fillText(label, x, y);
    }
  }

  function create(canvas, onReady) {
    const context = canvas.getContext('2d', { alpha: false });
    canvas.width = width;
    canvas.height = height;
    const atlas = new Image();
    let requested = false;
    let ready = false;
    let pose = null;
    let previousPose = null;

    function paint() {
      if (!context || !pose) return;
      if (previousPose?.frame === pose.frame && previousPose.pattern === pose.pattern) return;
      drawBoard(context, pose.pattern);
      if (!ready) return;
      context.drawImage(
        atlas, pose.frame % columns * tileWidth, Math.floor(pose.frame / columns) * tileHeight,
        tileWidth, tileHeight, 0, 0, width, height
      );
      previousPose = pose;
    }

    atlas.onload = () => {
      ready = true;
      paint();
      onReady?.(true);
    };
    atlas.onerror = () => onReady?.(false);
    function draw({ meter, beat }) {
      const pattern = patternFor(meter);
      if (!pattern || !Number.isFinite(beat)) {
        pose = null;
        previousPose = null;
        context?.clearRect(0, 0, width, height);
        return false;
      }
      pose = { pattern, frame: frameAt(beat, pattern.beats) };
      if (!requested) {
        requested = true;
        atlas.src = atlasUrl.href;
      }
      paint();
      return true;
    }

    return { draw };
  }

  window.MonroeConducting = { create, patternFor };
})();
