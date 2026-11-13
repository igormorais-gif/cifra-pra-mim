// Volume I, números de compassos por sistema conferidos nas páginas impressas
// 7–9, 15–18, 24–26, 32–34, 41–43, 51–54 e 60–62 do original.
(function (root) {
  const systems = {};
  const entries = [
    [1, [1, 2, 3, 6, 7, 8, 9, 10, 11], [4]],
    [1, [12, 13, 14, 15], [4, 4]],
    [2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [4]],
    [2, [18, 19, 20, 21], [4, 4]],
    [3, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [4]],
    [3, [12, 13, 14, 15], [4, 4]],
    [4, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [4]],
    [4, [12, 13, 14, 15], [4, 4]],
    [5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [4]],
    [5, [12, 13, 14, 15], [4, 4]],
    [6, [1, 2, 3, 4, 5, 6], [4]],
    [6, [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [4, 4]],
    [7, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [4]],
    [7, [12, 13, 14, 15], [4, 4]]
  ];
  for (const [lesson, exercises, measures] of entries) {
    for (const exercise of exercises) systems[lesson + "-" + exercise] = measures;
  }
  root.MonroeSystems = systems;
  // A segunda pauta começa com clave na página 18, mesmo sem repetir o compasso.
  root.MonroeContinuationClefs = ["2-18", "2-19", "2-20", "2-21"];
})(globalThis);
