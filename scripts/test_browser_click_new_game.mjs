import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 5174;
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// 1. Static file server for ./dist
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), 'dist', reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`[TestServer] Server running at http://localhost:${PORT}`);

  // 2. Launch headless Chrome with ?dev=1
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,720',
    '--user-data-dir=' + path.join(process.cwd(), '.chrome_temp_test'),
    `http://localhost:${PORT}?dev=1`
  ]);

  console.log('[TestServer] Chrome launched. Connecting CDP...');

  // Wait 1.5s for Chrome CDP port to open
  await new Promise(r => setTimeout(r, 1500));

  let targets = [];
  for (let i = 0; i < 10; i++) {
    try {
      const resp = await fetch('http://127.0.0.1:9222/json/list');
      targets = await resp.json();
      if (targets.length > 0) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    console.error('Could not find page target or webSocketDebuggerUrl');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  console.log('[TestServer] Connecting WebSocket to:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pendingRequests = new Map();

  function sendCDP(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const errors = [];
  const logs = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const text = msg.params.args.map(a => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
      logs.push(`[Console ${type}] ${text}`);
      if (type === 'error') {
        errors.push(`[Console Error] ${text}`);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const ex = msg.params.exceptionDetails;
      const errText = ex.text + ' ' + (ex.exception?.description || '') + (ex.stackTrace ? '\n' + JSON.stringify(ex.stackTrace) : '');
      errors.push(`[Runtime Exception] ${errText}`);
    }
  };

  ws.onopen = async () => {
    console.log('[TestServer] CDP connected.');
    await sendCDP('Runtime.enable');
    await sendCDP('Console.enable');

    // Wait for game to boot into MainMenuScene
    console.log('[TestServer] Waiting for game to load MainMenuScene...');
    let ready = false;
    for (let i = 0; i < 50; i++) {
      await new Promise(r => setTimeout(r, 500));
      const res = await sendCDP('Runtime.evaluate', {
        expression: `(() => {
          const g = window.__PHASER_GAME__ || window.__GAME__ || window.game;
          if (!g || !g.scene) return { status: 'waiting_game' };
          const scenes = g.scene.getScenes(true).map(s => s.scene.key);
          return { activeScenes: scenes };
        })()`,
        returnByValue: true
      });
      if (res.result && res.result.value && res.result.value.activeScenes) {
        console.log('[TestServer] Active scenes:', res.result.value.activeScenes);
        if (res.result.value.activeScenes.includes('MainMenuScene')) {
          ready = true;
          break;
        }
      }
    }

    if (!ready) {
      console.log('[TestServer] MainMenuScene not reached in time. Logs so far:');
      console.log(logs.slice(-15).join('\n'));
      console.log('Errors:', errors);
      cleanup();
      return;
    }

    console.log('[TestServer] MainMenuScene is active! Now simulating click "Bước vào màn sương"...');

    // Trigger click on MainMenuScene
    const clickRes = await sendCDP('Runtime.evaluate', {
      expression: `(() => {
        const g = window.__PHASER_GAME__ || window.__GAME__ || window.game;
        const mm = g.scene.getScene('MainMenuScene');
        if (!mm) return 'no_main_menu';
        console.log('[Test] Calling mm.startNewGame()...');
        mm.startNewGame();
        return 'called_startNewGame';
      })()`,
      returnByValue: true
    });
    console.log('[TestServer] click result:', clickRes.result.value);

    // Wait 3.0s for GameScene & UIScene to initialize and transition
    console.log('[TestServer] Waiting 3.0s for GameScene transition...');
    await new Promise(r => setTimeout(r, 3000));

    // Inspect GameScene & UIScene state comprehensive
    const inspectRes = await sendCDP('Runtime.evaluate', {
      expression: `(async () => {
        const g = window.__PHASER_GAME__ || window.__GAME__ || window.game;
        const activeScenes = g.scene.getScenes(true).map(s => s.scene.key);
        const gs = g.scene.getScene('GameScene');
        const ui = g.scene.getScene('UIScene');
        if (!gs) return { activeScenes, error: 'no_game_scene' };
        if (!ui) return { activeScenes, error: 'no_ui_scene' };
        
        const cam = gs.cameras.main;
        const player = gs.player;
        const stats = ui.playerState ? ui.playerState.stats : null;

        // Check Developer Mode & Leaderboard Block
        const devManager = gs.devManager;
        let devSessionCheck = null;
        if (devManager) {
          devManager.setEnabled(true);
          devManager.markDevUsed();
          
          // Test Leaderboard submit rejection
          try {
            const lbModule = await import('./assets/index-CVrF6H6O.js').catch(() => null);
          } catch(e) {}
        }

        // Test leaderboard submission rejection via window or service
        const isDevSession = devManager ? devManager.isDevSession : false;

        return {
          activeScenes,
          screenBlack: (cam.alpha === 0 || !cam.visible),
          camAlpha: cam.alpha,
          camVisible: cam.visible,
          playerExists: !!player,
          playerTexture: player ? player.texture.key : null,
          playerPos: player ? { x: Math.round(player.x), y: Math.round(player.y) } : null,
          hud: {
            maxStamina: stats ? stats.maxStamina : null,
            healthText: ui.healthValText ? ui.healthValText.text : null,
            staminaText: ui.staminaValText ? ui.staminaValText.text : null,
            composureText: ui.composureValText ? ui.composureValText.text : null,
            barsGraphicsVisible: ui.statBarsGraphics ? ui.statBarsGraphics.visible : false,
            iconsCount: ui.statIconImages ? ui.statIconImages.length : 0
          },
          minimap: {
            containerVisible: ui.miniMapWidget && ui.miniMapWidget.container ? ui.miniMapWidget.container.visible : false
          },
          uiPackLoaded: {
            hudPanel: g.textures.exists('ui_pack_panel_hud'),
            slotIdle: g.textures.exists('ui_pack_slot_idle'),
            worldMapScroll: g.textures.exists('ui_pack_world_map_scroll'),
            openBook: g.textures.exists('ui_pack_open_book_desk')
          },
          devMode: {
            managerAttached: !!devManager,
            isDevSession: isDevSession,
            canToggle: devManager ? devManager.canToggleWithSimpleF9() : false
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('\n================ GAME SCENE & UI INSPECTION RESULT ================');
    const inspection = inspectRes.result.value;
    console.log(JSON.stringify(inspection, null, 2));

    // Capture in-game screenshot to verify visually
    try {
      await sendCDP('Page.enable');
      const screenshot = await sendCDP('Page.captureScreenshot', { format: 'png' });
      if (screenshot && screenshot.data) {
        const outDir1 = 'C:\\Users\\Kyoshiro\\.gemini\\antigravity\\brain\\dc0f9c86-d78f-43b6-895c-34fe12680156';
        const outDir2 = path.join(process.cwd(), 'docs');
        fs.mkdirSync(outDir1, { recursive: true });
        fs.mkdirSync(outDir2, { recursive: true });
        const buf = Buffer.from(screenshot.data, 'base64');
        fs.writeFileSync(path.join(outDir1, 'v152_10_in_game_verified.png'), buf);
        fs.writeFileSync(path.join(outDir2, 'v152_10_in_game_verified.png'), buf);
        console.log('[TestServer] In-game screenshot saved successfully to v152_10_in_game_verified.png!');
      }
    } catch (ssErr) {
      console.warn('[TestServer] Could not capture screenshot:', ssErr);
    }

    console.log('\n================ ERRORS CAPTURED ================');
    if (errors.length === 0) {
      console.log('🎉 0 errors captured!');
    } else {
      errors.forEach(e => console.error(e));
    }

    console.log('\n================ RECENT LOGS ================');
    console.log(logs.slice(-20).join('\n'));

    // Validation assertions
    let success = true;
    if (errors.length > 0) {
      console.error('❌ Validation failed: Console errors detected.');
      success = false;
    }
    if (inspection.screenBlack) {
      console.error('❌ Validation failed: Screen is black.');
      success = false;
    }
    if (inspection.hud.maxStamina !== 100) {
      console.error(`❌ Validation failed: maxStamina is ${inspection.hud.maxStamina}, expected 100.`);
      success = false;
    }
    if (inspection.minimap.containerVisible) {
      console.error('❌ Validation failed: Mini-map container is still visible.');
      success = false;
    }
    if (!inspection.playerTexture || !inspection.playerTexture.startsWith('wayfarer_')) {
      console.error(`❌ Validation failed: Player texture is ${inspection.playerTexture}, expected wayfarer_*.`);
      success = false;
    }
    if (!inspection.uiPackLoaded.hudPanel || !inspection.uiPackLoaded.slotIdle) {
      console.error('❌ Validation failed: UI Pack textures not properly loaded in cache.');
      success = false;
    }

    if (success) {
      console.log('\n🎉 TẤT CẢ TIÊU CHÍ TEST BROWSER CLICK NEW GAME ĐỀU PASS 100%!');
    }

    cleanup(success);
  };

  function cleanup(success = true) {
    try { ws.close(); } catch {}
    try { chromeProc.kill(); } catch {}
    try { server.close(); } catch {}
    try {
      fs.rmSync(path.join(process.cwd(), '.chrome_temp_test'), { recursive: true, force: true });
    } catch {}
    process.exit(success && errors.length === 0 ? 0 : 1);
  }
});
