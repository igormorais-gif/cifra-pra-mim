// With Playwright and its WebKit installed: node scripts/monroe-render-audio.cjs
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { webkit } = require('playwright');
const { MonroeAudio } = require('../laboratorio-larry-monroe/caderno-audio.js');

const root = path.join(__dirname, '..', 'laboratorio-larry-monroe');
const output = path.join(root, 'audio');
const sources = ['caderno-systems.js', 'caderno-score.js', 'caderno-catalog.js', 'conducting.js'];

async function render() {
  const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(sources.map(source => `<script src="/${source}"></script>`).join(''));
      return;
    }
    try {
      const file = await fs.readFile(path.join(root, pathname));
      response.writeHead(200, { 'Content-Type': pathname.endsWith('.js') ? 'text/javascript' : 'application/xml' });
      response.end(file);
    } catch (_) {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await webkit.launch();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const catalog = await page.evaluate(async () => {
      const available = window.MonroeCatalog.filter(item => item.bars.length && item.status !== 'c');
      return Promise.all(available.map(async item => {
        const score = await window.MonroeScore.load(item);
        return { score, pattern: window.MonroeConducting.patternFor(score.meter) };
      }));
    });
    await fs.mkdir(output, { recursive: true });
    for (const { score, pattern } of catalog) {
      const timeline = MonroeAudio.timeline(score, pattern);
      const name = score.l + '-' + score.n;
      for (const click of [false, true]) {
        const wave = await MonroeAudio.renderWave(timeline, MonroeAudio.recordingBpm, click, 8000).arrayBuffer();
        await fs.writeFile(path.join(output, name + (click ? '-click' : '') + '.wav'), Buffer.from(wave));
      }
    }
    console.log(`Áudio renderizado para ${catalog.length} exercícios.`);
  } finally {
    await browser?.close();
    server.close();
  }
}

render().catch(error => { console.error(error); process.exitCode = 1; });
