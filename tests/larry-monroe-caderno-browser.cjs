// Run with Playwright installed: node tests/larry-monroe-caderno-browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { webkit, devices } = require('playwright');

const root = path.join(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.musicxml': 'application/xml', '.wav': 'audio/wav' };

async function run() {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const file = path.join(root, url.pathname, url.pathname.endsWith('/') ? 'index.html' : '');
    try {
      const data = await fs.readFile(file);
      const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
      const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
      if (range) {
        const start = Number(range[1]);
        const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
        headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + data.length;
        headers['Content-Length'] = end - start + 1;
        response.writeHead(206, headers).end(data.subarray(start, end + 1));
      } else {
        response.writeHead(200, { ...headers, 'Content-Length': data.length }).end(data);
      }
    } catch (_) {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await webkit.launch();
    const context = await browser.newContext(devices['iPhone 13']);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.MONROE_TEST_URL || `http://127.0.0.1:${server.address().port}/laboratorio-larry-monroe/`);
    await page.waitForFunction(() => document.querySelectorAll('.system').length === 1);
    await page.locator('#exstrip [data-n="12"]').click();
    await page.waitForFunction(() => document.querySelectorAll('.system').length === 2);
    const readSystems = () => page.locator('.system').evaluateAll(systems => systems.map(system => system.querySelectorAll('[data-measure]').length));
    const layout = await readSystems();
    assert.deepEqual(layout, [4, 4]);
    const score = page.locator('#score');
    const measureViewport = () => score.evaluate(el => ({ width: el.scrollWidth, view: el.clientWidth, offset: el.scrollLeft }));
    const beforeZoom = await measureViewport();
    assert.ok(beforeZoom.width > beforeZoom.view);
    await page.locator('#zoom-in').click();
    assert.ok((await measureViewport()).width > beforeZoom.width);
    await score.evaluate(el => { el.scrollLeft = 66; });
    await page.locator('#conductor-toggle').click();
    assert.ok(await page.locator('#conductor').isVisible());
    await page.waitForFunction(() => {
      const ctx = document.querySelector('#conductor-hand').getContext('2d');
      return ctx.getImageData(0, 0, 300, 415).data.some((value, i, data) => i % 4 === 0 && value > data[i + 1] + 35);
    });
    const audio = page.locator('audio');
    await page.locator('#play').tap();
    try {
      await page.waitForFunction(() => document.querySelector('audio').currentTime > 1.0, null, { timeout: 7000 });
    } catch (error) {
      console.error(await audio.evaluate(el => ({
        error: el.error?.message, code: el.error?.code, paused: el.paused, currentTime: el.currentTime,
        readyState: el.readyState, networkState: el.networkState, wav: el.canPlayType('audio/wav'),
        source: el.src.slice(0, 115), worker: navigator.serviceWorker?.controller?.scriptURL,
        message: document.querySelector('#audio-state').textContent
      })));
      console.error(await audio.evaluate(async el => {
        const response = await fetch(el.src, { headers: { Range: 'bytes=0-1' } });
        return { status: response.status, range: response.headers.get('Content-Range'), size: (await response.arrayBuffer()).byteLength };
      }));
      throw error;
    }
    const matchScore = (meter, earliest) => page.waitForFunction(({ meter, earliest }) => {
      const time = document.querySelector('audio').currentTime / 0.75;
      if (time < earliest) return false;
      const marker = document.querySelector('.score-event.current');
      const beat = Math.floor((time % meter) * 2);
      const active = [...document.querySelector('#beats').children].findIndex(element => element.classList.contains('on'));
      return Boolean(marker && Number(marker.dataset.on) <= time + 0.08
        && Number(marker.dataset.on) + Number(marker.dataset.dur) > time - 0.08
        && (beat === active || Math.abs(time * 2 - Math.round(time * 2)) < 0.12));
    }, { meter, earliest }, { timeout: 5000 });
    await matchScore(4, 1.3);
    const during = await measureViewport();
    assert.equal(during.offset, 66);

    const bpm = page.locator('#bpm');
    await bpm.fill('120');
    await page.waitForFunction(() => {
      const element = document.querySelector('audio');
      return !element.paused && element.currentTime > 1.25 && element.playbackRate === 1.5;
    });
    await matchScore(4, 2);
    await page.locator('#metro').uncheck();
    await page.waitForFunction(() => {
      const element = document.querySelector('audio');
      return !element.paused && !element.currentSrc.includes('-click') && element.currentTime > 1.4;
    });
    await matchScore(4, 2);
    await page.locator('#play').tap();
    await page.waitForFunction(() => document.querySelector('audio').paused);
    const paused = await audio.evaluate(el => el.currentTime);
    await page.waitForTimeout(120);
    assert.ok(Math.abs(await audio.evaluate(el => el.currentTime) - paused) < 0.03);
    await page.locator('#restart').tap();
    await page.waitForFunction(() => {
      const element = document.querySelector('audio');
      return !element.paused && element.currentTime > 0.02 && element.currentTime < 0.6;
    });
    await page.locator('#loop').check();
    assert.equal(await audio.evaluate(el => el.loop), true);
    const showingHeight = await page.locator('#study').evaluate(el => el.offsetHeight);
    await page.locator('#conductor-toggle').click();
    assert.equal(await page.locator('#conductor').isVisible(), false);
    assert.ok(await page.locator('#study').evaluate(el => el.offsetHeight) < showingHeight);
    assert.deepEqual(await readSystems(), [4, 4]);
    assert.equal(await audio.evaluate(el => el.paused), false);

    await page.locator('#chapters [data-l="6"]').click();
    await page.waitForFunction(() => document.querySelector('#instruction').textContent.startsWith('3/4'));
    assert.deepEqual(await readSystems(), [4]);
    await page.locator('#exstrip [data-n="7"]').click();
    await page.waitForFunction(() => document.querySelectorAll('.system').length === 2);
    assert.deepEqual(await readSystems(), [4, 4]);
    await page.locator('#conductor-toggle').click();
    await page.locator('#play').tap();
    await page.waitForFunction(() => document.querySelector('audio').currentTime > 1.65);
    await matchScore(3, 2.25);
    assert.equal(await page.locator('#beats > span:not(.subdivision)').count(), 3);
    assert.match(await page.locator('#conductor-meter').textContent(), /3\/4/);
    await page.locator('#complete').click();
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#instruction').textContent.startsWith('3/4'));
    assert.match(await page.locator('#complete').textContent(), /Concluído/);
    assert.deepEqual(errors, []);
    console.log('WebKit', browser.version(), '– leitura móvel, duas fórmulas, pausa, reinício, andamento, regência e progresso OK');
  } finally {
    await browser?.close();
    server.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
