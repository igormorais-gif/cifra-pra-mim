// Volume I, números de compassos por sistema nas páginas impressas 7–9,
// 15–18, 24–26 e 32–34, conferidas nas digitalizações de ritmicos-64.html.
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
    [4, [12, 13, 14, 15], [4, 4]]
  ];
  for (const [lesson, exercises, measures] of entries) {
    for (const exercise of exercises) systems[lesson + "-" + exercise] = measures;
  }
  root.MonroeSystems = systems;
  // A segunda pauta começa com clave na página 18, mesmo sem repetir o compasso.
  root.MonroeContinuationClefs = ["2-18", "2-19", "2-20", "2-21"];
})(globalThis);
