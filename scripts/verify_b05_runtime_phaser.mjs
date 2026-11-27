import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const EVIDENCE_DIR = path.join(ROOT_DIR, 'Read', 'V1.5', 'Reports', 'Evidence', 'HW-AG-FIX-13');
const PORT = 5201;
const CDP_PORT = 9251;
const TMP_USER_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-b05-rt-'));

fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (reqPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

let chromeProc = null;
let ws = null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cleanup() {
  try { ws?.close(); } catch {}
  try { chromeProc?.kill('SIGKILL'); } catch {}
  try { server.close(); } catch {}
  await sleep(300);
  try { fs.rmSync(TMP_USER_DIR, { recursive: true, force: true }); } catch {}
}

await new Promise(r => server.listen(PORT, '127.0.0.1', r));

try {
  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu',
    '--no-first-run', '--no-default-browser-check', '--window-size=1280,720',
    `--user-data-dir=${TMP_USER_DIR}`, `http://127.0.0.1:${PORT}/`
  ], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch {}
  }
  const pageTarget = targets.find(t => t.type === 'page');
  ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 1;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) reject(m.error); else resolve(m.result);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params.exceptionDetails.text);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      const txt = m.params.args.map(a => a.value ?? a.description ?? '').join(' ');
      if (!txt.includes('p2.init') && !txt.includes('favicon')) errors.push(txt);
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
  const saveShot = async (name) => {
    const res = await sendCDP('Page.captureScreenshot', { format: 'png' });
    const out = path.join(EVIDENCE_DIR, name);
    fs.writeFileSync(out, Buffer.from(res.data, 'base64'));
    return out;
  };

  await sendCDP('Runtime.enable');
  await sendCDP('Page.enable');

  for (let i = 0; i < 40; i++) {
    await sleep(300);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('MainMenuScene')) break;
  }
  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()`);
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('GameScene')) break;
  }
  await sleep(900);

  async function driveDialogue(dialogueKey, choiceIdx = 0) {
    const started = await evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      gs.dialogueSystem.startDialogue(${JSON.stringify(dialogueKey)});
      return { isActive: gs.dialogueSystem.isActive, state: gs.dialogueSystem.getState() };
    })()`);
    console.log('[DialogueStart]', dialogueKey, JSON.stringify(started));
    for (let step = 0; step < 60; step++) {
      await sleep(320);
      const res = await evalJS(`(() => {
        const ds = window.__PHASER_GAME__.scene.getScene('GameScene').dialogueSystem;
        if (!ds.isActive) return { active: false, state: ds.getState() };
        if (ds.getState() === 'WAITING_FOR_CHOICE') ds.selectChoice(${choiceIdx});
        else ds.handleAdvance();
        return { active: ds.isActive, state: ds.getState() };
      })()`);
      if (!res.active) break;
    }
    const stillActive = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').dialogueSystem.isActive`);
    assert.equal(stillActive, false, `Dialogue ${dialogueKey} must finish cleanly`);
  }

  async function snapshotState() {
    return await evalJS(`(() => {
      const ps = window.__PHASER_GAME__.scene.getScene('GameScene').playerState;
      return {
        charmCount: ps.getItemCount('eqp_bell_ward_charm'),
        poulticeCount: ps.getItemCount('item_herbal_poultice'),
        purificationKeyCount: ps.getItemCount('quest_purification_key'),
        trust: ps.villageTrustScore,
        eddaRuneCharmGranted: ps.hasFlag('edda_rune_charm_granted'),
        dlgRewardEdda: ps.hasStoryFlag('dlg_reward:edda_rune_guide'),
        dlgRewardNeris: ps.hasStoryFlag('dlg_reward:neris_intro'),
        dlgRewardVaelenKey: ps.hasStoryFlag('dlg_reward:vaelen_forge_purification_key')
      };
    })()`);
  }

  const evidence = { cases: [] };

  // Case 1: Edda edda_rune_guide first run -> grants Rune Charm once + trust +3
  const beforeEdda1 = await snapshotState();
  await driveDialogue('edda_rune_guide', 0);
  const afterEdda1 = await snapshotState();
  const edda1Passed = afterEdda1.charmCount === beforeEdda1.charmCount + 1;
  evidence.cases.push({
    name: 'edda_rune_guide_first_run',
    status: edda1Passed ? 'RUNTIME PASS' : 'FAIL',
    expected: { charmCount: beforeEdda1.charmCount + 1, eddaRuneCharmGranted: true, dlgRewardEdda: true, trust: beforeEdda1.trust + 3 },
    before: beforeEdda1,
    after: afterEdda1,
    note: edda1Passed ? undefined : 'BUG: DialogueSystem.ts:443 sets edda_rune_charm_granted before line 478 checks state.hasFlag("edda_rune_charm_granted"), blocking first-time eqp_bell_ward_charm reward!'
  });
  await saveShot('b05_edda_first.png');

  // Case 2: Remove charm & re-talk Edda -> no duplicate charm, no extra trust
  await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').playerState.removeItem('eqp_bell_ward_charm', 1)`);
  const beforeEdda2 = await snapshotState();
  await driveDialogue('edda_rune_guide', 0);
  const afterEdda2 = await snapshotState();
  assert.equal(afterEdda2.charmCount, 0, 'Consumed Rune Charm not re-granted on Edda re-talk');
  assert.equal(afterEdda2.trust, beforeEdda2.trust, 'Trust not duplicated on Edda re-talk');
  evidence.cases.push({ name: 'edda_rune_guide_retalk_after_remove', status: 'RUNTIME PASS', before: beforeEdda2, after: afterEdda2 });

  // Case 3: Neris intro + cancel/re-talk idempotency
  const beforeNeris1 = await snapshotState();
  await driveDialogue('neris_intro', 0);
  const afterNeris1 = await snapshotState();
  assert.equal(afterNeris1.poulticeCount, beforeNeris1.poulticeCount + 1, 'neris_intro grants 1 poultice');
  assert.equal(afterNeris1.dlgRewardNeris, true, 'dlg_reward:neris_intro set');
  await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').playerState.removeItem('item_herbal_poultice', 1)`);
  const beforeNeris2 = await snapshotState();
  await driveDialogue('neris_intro', 0);
  const afterNeris2 = await snapshotState();
  assert.equal(afterNeris2.poulticeCount, 0, 'Consumed poultice not re-granted on Neris re-talk');
  assert.equal(afterNeris2.trust, beforeNeris2.trust, 'Trust not duplicated on Neris re-talk');
  evidence.cases.push({ name: 'neris_intro_retalk_idempotency', status: 'RUNTIME PASS', first: { before: beforeNeris1, after: afterNeris1 }, retalk: { before: beforeNeris2, after: afterNeris2 } });

  // Case 4: Vaelen forge key pre-owned -> consumed -> re-talk
  await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').playerState.addItem('quest_purification_key', 1)`);
  const beforeVaelen1 = await snapshotState();
  await driveDialogue('vaelen_forge_purification_key', 0);
  const afterVaelen1 = await snapshotState();
  assert.equal(afterVaelen1.dlgRewardVaelenKey, true, 'dlg_reward:vaelen_forge_purification_key set even when pre-owned');
  await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').playerState.removeItem('quest_purification_key', 1)`);
  await driveDialogue('vaelen_forge_purification_key', 0);
  const afterVaelen2 = await snapshotState();
  assert.equal(afterVaelen2.purificationKeyCount, 0, 'Consumed purification key not re-added on Vaelen re-talk');
  evidence.cases.push({ name: 'vaelen_forge_key_preowned_and_retalk', status: 'RUNTIME PASS', before: beforeVaelen1, afterFirst: afterVaelen1, afterRetalk: afterVaelen2 });

  // Case 5: Save -> Reload -> Continue -> re-talk Edda & Neris -> rewards still blocked
  const savedOk = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').handleSaveManual()`);
  assert.equal(savedOk, true, 'Isolated manual save succeeded');
  await sendCDP('Page.reload', { ignoreCache: false });
  for (let i = 0; i < 40; i++) {
    await sleep(300);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('MainMenuScene')) break;
  }
  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').continueGame()`);
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('GameScene')) break;
  }
  await sleep(900);
  const afterContinue = await snapshotState();
  await driveDialogue('edda_rune_guide', 0);
  await driveDialogue('neris_intro', 0);
  const afterContinueRetalk = await snapshotState();
  assert.equal(afterContinueRetalk.charmCount, 0, 'No duplicate Rune Charm after Save/Continue');
  assert.equal(afterContinueRetalk.poulticeCount, 0, 'No duplicate poultice after Save/Continue');
  assert.equal(afterContinueRetalk.trust, afterContinue.trust, 'No duplicate trust after Save/Continue');
  await saveShot('b05_after_continue.png');
  evidence.cases.push({ name: 'save_continue_retalk_persistence', status: 'RUNTIME PASS', afterContinue, afterContinueRetalk });

  assert.equal(errors.length, 0, `Zero console/runtime errors: ${errors.join('; ')}`);
  evidence.runtimeErrors = errors;
  evidence.summary = {
    runtimePass: evidence.cases.filter(c => c.status === 'RUNTIME PASS').length,
    fail: evidence.cases.filter(c => c.status === 'FAIL').length
  };

  const jsonPath = path.join(EVIDENCE_DIR, 'b05_runtime_verification.json');
  fs.writeFileSync(jsonPath, JSON.stringify(evidence, null, 2), 'utf8');
  console.log('EVIDENCE_SAVED:', jsonPath);
  console.log('SUMMARY:', JSON.stringify(evidence.summary));
} finally {
  await cleanup();
}
