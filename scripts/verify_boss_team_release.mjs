import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PORT = 5225;
const CDP_PORT = 9265;
const TMP_PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-boss-cdp-'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];
const rec = (name, pass, detail = '') => {
  results.push({ test: name, pass: Boolean(pass), detail });
  console.log(`  ${pass ? '✅' : '❌'} ${name}${detail ? ': ' + detail : ''}`);
};

let viteProc = null;
let chromeProc = null;
let ws = null;

async function cleanup() {
  try { ws?.close(); } catch {}
  try { chromeProc?.kill('SIGKILL'); } catch {}
  try { viteProc?.kill('SIGKILL'); } catch {}
  await sleep(300);
  try { fs.rmSync(TMP_PROFILE, { recursive: true, force: true }); } catch {}
}

try {
  // 1. Start Vite dev server
  viteProc = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT_DIR, stdio: 'ignore', shell: true, env: { ...process.env, VITE_HOLLOW_WOODS_QA: '1' } }
  );

  let serverReady = false;
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/`);
      if (r.ok) { serverReady = true; break; }
    } catch {}
  }
  if (!serverReady) throw new Error('Vite server failed to start');

  // 2. Launch headless Chrome
  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', `--remote-debugging-port=${CDP_PORT}`,
    '--use-gl=swiftshader', '--disable-gpu', '--no-sandbox',
    '--window-size=1280,720', `--user-data-dir=${TMP_PROFILE}`,
    `http://127.0.0.1:${PORT}/`
  ], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch {}
  }
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No CDP page target');

  ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 1;
  const pending = new Map();
  const runtimeErrors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(m.params.exceptionDetails.text);
    }
  };
  const sendCDP = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalJS = async (expression) => {
    const r = await sendCDP('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`${r.exceptionDetails.text} ${r.exceptionDetails.exception?.description || ''}`);
    return r.result?.value;
  };

  await sendCDP('Runtime.enable');
  await sendCDP('Page.enable');

  // Wait for MainMenuScene and start New Game -> skip prologue -> GameScene
  let menuReady = false;
  for (let i = 0; i < 60; i++) {
    await sleep(400);
    const s = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (s.includes('MainMenuScene')) { menuReady = true; break; }
  }
  rec('BOOT: MainMenuScene ready', menuReady);

  await evalJS(`(() => {
    const g = window.__PHASER_GAME__;
    const m = g.scene.getScene('MainMenuScene');
    m.scene.start('GameScene', { isNewGame: true, skipPrologue: true });
  })()`);

  let gameReady = false;
  for (let i = 0; i < 60; i++) {
    await sleep(400);
    const ok = await evalJS(`(() => {
      const gs = window.__PHASER_GAME__?.scene?.getScene('GameScene');
      return Boolean(gs && gs.scene.isActive() && gs.player && gs.wildlifeSystem);
    })()`);
    if (ok) { gameReady = true; break; }
  }
  rec('BOOT: GameScene active with player and wildlifeSystem', gameReady);

  // Test 1: Phase B quick checks (Edda name, node_resin_ow_1 pos, abyssal_chasm locked)
  const phaseBCheck = await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    const edda = gs.npcs?.find(n => n.spec?.id === 'npc_edda');
    const nodes = gs.inventorySystem?.nodes || [];
    const resin = nodes.find(r => r.spec?.id === 'node_resin_ow_1');
    const chasm = gs.worldBuilder?.getZone?.('abyssal_chasm');
    return {
      eddaName: edda?.spec?.name || null,
      resinPos: resin ? { x: resin.spec.x, y: resin.spec.y } : null,
      chasmStatus: chasm?.status || null
    };
  })()`);
  rec('REG-EDDA: Edda display name is "Edda"', phaseBCheck.eddaName === 'Edda', JSON.stringify(phaseBCheck.eddaName));
  rec('REG-MICRO01: node_resin_ow_1 at (1520,595)', phaseBCheck.resinPos?.x === 1520 && phaseBCheck.resinPos?.y === 595, JSON.stringify(phaseBCheck.resinPos));
  rec('REG-CHASM: abyssal_chasm remains pending/locked', phaseBCheck.chasmStatus === 'pending' || phaseBCheck.chasmStatus === 'pending_construction', JSON.stringify(phaseBCheck.chasmStatus));

  // Test 2: Shadow Behemoth in silent_mire
  const smCheck = await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    const dev = gs.devPanel.manager;
    dev.setEnabled(true);
    dev.teleportToZone('silent_mire');
    gs.wildlifeSystem.update(performance.now(), 16, {
      playerX: gs.player.x, playerY: gs.player.y, isNight: true,
      currentZoneId: 'silent_mire', isSafeZone: false, isLightOn: false
    });
    const beh = gs.wildlifeSystem.getShadowBehemoth();
    return {
      zone: gs.currentZoneId,
      hasBehemoth: Boolean(beh),
      behPos: beh ? { x: beh.x, y: beh.y } : null
    };
  })()`);
  rec('BOSS-BEHEMOTH-1: Shadow Behemoth spawns in silent_mire', smCheck.hasBehemoth && smCheck.zone === 'silent_mire', JSON.stringify(smCheck));

  // Test 3: Mire Warden 500 HP in broken_bell_shrine & NO Behemoth overlap
  const mwCheck = await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    const dev = gs.devPanel.manager;
    gs.playerState.setFlag('mire_root_seal_broken');
    dev.teleportToZone('broken_bell_shrine');
    if (!gs.mireWardenBoss) {
      gs.triggerMireWardenBossEncounter();
    }
    gs.wildlifeSystem.update(performance.now(), 16, {
      playerX: gs.player.x, playerY: gs.player.y, isNight: true,
      currentZoneId: 'broken_bell_shrine', isSafeZone: false, isLightOn: false
    });
    const mw = gs.mireWardenBoss;
    const beh = gs.wildlifeSystem.getShadowBehemoth();
    const initialHp = mw?.bossHp;
    const maxHp = mw?.maxBossHp;
    mw?.breakShield();
    const hit1 = mw?.takeDamage(120, gs.player.x, gs.player.y);
    const after120 = mw?.bossHp;
    const stillAliveAfter120 = mw?.active && mw?.currentState !== 'DEFEATED';
    const seal1 = mw?.applySeal();
    mw?.stagger();
    const seal2 = mw?.applySeal();
    const phaseAfterSeal2 = mw?.phase;
    mw?.stagger();
    const seal3 = mw?.applySeal();
    if (mw?.bossHp <= 0 || mw?.currentState === 'DEFEATED') {
      gs.finishMireWardenDefeat();
    }
    const defeatedFlag = gs.playerState.hasFlag('boss_mire_warden_defeated');
    return {
      zone: gs.currentZoneId,
      initialHp,
      maxHp,
      hasBehemothInArena: Boolean(beh),
      hit1,
      after120,
      stillAliveAfter120,
      seal1,
      seal2,
      phaseAfterSeal2,
      seal3,
      defeatedFlag
    };
  })()`);
  rec('BOSS-MIRE-1: Mire Warden spawns with 500/500 HP', mwCheck.initialHp === 500 && mwCheck.maxHp === 500, `hp=${mwCheck.initialHp}/${mwCheck.maxHp}`);
  rec('BOSS-MIRE-2: Shadow Behemoth does NOT spawn in broken_bell_shrine', mwCheck.hasBehemothInArena === false, `hasBehemothInArena=${mwCheck.hasBehemothInArena}`);
  rec('BOSS-MIRE-3: Survives 120 dmg (380 HP left), Phase 2 at seal 2, defeats at seal 3', mwCheck.after120 === 380 && mwCheck.stillAliveAfter120 && mwCheck.phaseAfterSeal2 === 2 && mwCheck.defeatedFlag, JSON.stringify(mwCheck));

  // Test 4: Dark Knight 300 HP + 2x100 guards + Vaelen assist once at <=150 HP in deep_forest
  const dkCheck = await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    const dev = gs.devPanel.manager;
    let vaelenEvents = 0;
    gs.events.on('hooded_knight_vaelen_assist', () => { vaelenEvents++; });
    dev.teleportToZone('deep_forest');
    gs.wildlifeSystem.update(performance.now(), 16, {
      playerX: gs.player.x, playerY: gs.player.y, isNight: true,
      currentZoneId: 'deep_forest', isSafeZone: false, isLightOn: false
    });
    const dk = gs.wildlifeSystem.getHoodedKnight();
    const guards = gs.wildlifeSystem.getFallenKnights().filter(g => g.active);
    const guardHps = guards.map(g => g.maxHp);
    const maxHp = dk?.maxHp;
    const initHp = dk?.currentHp;
    dk?.takeDamage(149, gs.player.x, gs.player.y); // 300 -> 151
    const hpAfter149 = dk?.currentHp;
    const eventsAt151 = vaelenEvents;
    dk?.takeDamage(8, gs.player.x, gs.player.y);   // 151 -> 143 (crosses 150)
    const hpAfter8 = dk?.currentHp;
    const eventsAt143 = vaelenEvents;
    dk?.takeDamage(20, gs.player.x, gs.player.y);  // 143 -> 123 (should NOT re-trigger)
    const eventsAfterExtra = vaelenEvents;
    return {
      maxHp,
      initHp,
      guardCount: guards.length,
      guardHps,
      hpAfter149,
      eventsAt151,
      hpAfter8,
      eventsAt143,
      eventsAfterExtra
    };
  })()`);
  rec('BOSS-DARK-1: Dark Knight 300 HP & 2 FallenKnight guards 100 HP each', dkCheck.maxHp === 300 && dkCheck.guardHps.filter(h => h === 100).length === 2, JSON.stringify(dkCheck));
  rec('BOSS-DARK-2: Vaelen assist fires ONCE when crossing >150 to <=150 HP', dkCheck.hpAfter149 === 151 && dkCheck.eventsAt151 === 0 && dkCheck.hpAfter8 === 143 && dkCheck.eventsAt143 === 1 && dkCheck.eventsAfterExtra === 1, JSON.stringify(dkCheck));

  rec('RUNTIME-ERRORS: Zero uncaught exceptions', runtimeErrors.length === 0, runtimeErrors.join('; '));

  const passedCount = results.filter(r => r.pass).length;
  console.log(`\nSUMMARY: ${passedCount}/${results.length} PASS`);
  if (passedCount !== results.length) {
    process.exitCode = 1;
  }
} finally {
  await cleanup();
}
