/**
 * verify_fix23.mjs — HW-AG-FIX-23: Edda Rune Charm reward verification
 * Pattern: Chrome headless + CDP (same as verify_b05_runtime_phaser.mjs)
 * Uses Vite dev server at port 5223 (must be already running).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_DIR = path.join(ROOT_DIR, 'Read', 'V1.5', 'Reports', 'Evidence', 'HW-AG-FIX-23');
const PORT = 5223;    // Vite dev server already running
const CDP_PORT = 9261;
const TMP_USER_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-fix23-'));

fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

let chromeProc = null;
let ws = null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];

async function cleanup() {
  try { ws?.close(); } catch {}
  try { chromeProc?.kill('SIGKILL'); } catch {}
  await sleep(300);
  try { fs.rmSync(TMP_USER_DIR, { recursive: true, force: true }); } catch {}
}

try {
  // --- Launch Chrome headless with CDP ---
  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', `--remote-debugging-port=${CDP_PORT}`,
    '--use-gl=swiftshader', '--disable-gpu',
    '--no-first-run', '--no-default-browser-check',
    '--disable-web-security', '--window-size=1280,720',
    `--user-data-dir=${TMP_USER_DIR}`,
    `http://127.0.0.1:${PORT}/?dev=1`
  ], { stdio: 'ignore' });

  // --- Wait for CDP target ---
  let targets = [];
  for (let i = 0; i < 25; i++) {
    await sleep(400);
    try {
      targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch {}
  }
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No CDP page target found');

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
      if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
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

  // --- Wait for MainMenuScene ---
  for (let i = 0; i < 50; i++) {
    await sleep(400);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('MainMenuScene')) break;
  }
  console.log('MainMenuScene ready, starting new game...');

  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()`);
  await sleep(300);
  // Press Space to skip any intro
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });

  // --- Wait for GameScene ---
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('GameScene')) break;
  }
  await sleep(1500);
  console.log('GameScene ready');

  // Helper: drive a dialogue to completion
  async function driveDialogue(dialogueKey, choiceIdx = 0) {
    await evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      gs.dialogueSystem.startDialogue(${JSON.stringify(dialogueKey)});
    })()`);
    for (let step = 0; step < 60; step++) {
      await sleep(280);
      const done = await evalJS(`(() => {
        const ds = window.__PHASER_GAME__.scene.getScene('GameScene').dialogueSystem;
        if (!ds.isActive) return true;
        const st = ds.getState ? ds.getState() : ds.state;
        if (st === 'WAITING_FOR_CHOICE') { ds.selectChoice(${choiceIdx}); return false; }
        ds.handleAdvance();
        return false;
      })()`);
      if (done) break;
    }
    // Extra step for APPLY_EFFECTS_ONCE → COMPLETE → IDLE
    await sleep(400);
  }

  // Helper: get PlayerState values
  async function readState() {
    return evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      const ps = gs['playerState'];  // private bracket access
      if (!ps) return { error: 'no playerState' };
      return {
        charmCount: ps.getItemCount('eqp_bell_ward_charm'),
        edda_rune_charm_granted: ps.hasFlag('edda_rune_charm_granted'),
        dlg_reward_edda: (ps.hasFlag('dlg_reward:edda_rune_guide') || ps.hasStoryFlag('dlg_reward:edda_rune_guide')),
        trust: ps.villageTrust,
      };
    })()`);
  }

  // =========================================================
  // BASELINE
  const before = await readState();
  console.log('BEFORE:', JSON.stringify(before));
  await saveShot('before_charm.png');

  // =========================================================
  // TC0: Cancel mid-dialogue BEFORE first grant -> no grant, no flags
  console.log('\n--- TC0: Cancel mid edda_rune_guide before first grant ---');
  await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    gs.dialogueSystem.startDialogue('edda_rune_guide');
  })()`);
  await sleep(300);
  await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    gs.dialogueSystem.cancelDialogue();
  })()`);
  await sleep(300);
  const afterCancelPre = await readState();
  console.log('AFTER CANCEL PRE-GRANT:', JSON.stringify(afterCancelPre));

  const tc0Pass = afterCancelPre.charmCount === 0 &&
                  afterCancelPre.edda_rune_charm_granted === false &&
                  afterCancelPre.dlg_reward_edda === false;
  results.push({
    test: 'TC0_cancel_before_grant',
    desc: 'Cancel mid-dialogue before first grant gives 0 charm and sets no reward flags',
    before_charm: before.charmCount,
    after_charm: afterCancelPre.charmCount,
    edda_rune_charm_granted: afterCancelPre.edda_rune_charm_granted,
    dlg_reward_edda: afterCancelPre.dlg_reward_edda,
    pass: tc0Pass,
  });
  console.log(tc0Pass ? '  ✅ TC0 PASS' : '  ❌ TC0 FAIL');

  // =========================================================
  // TC1: First completion → charm 0→1
  console.log('\n--- TC1: First edda_rune_guide completion ---');
  await driveDialogue('edda_rune_guide', 0);
  const after1 = await readState();
  console.log('AFTER FIRST:', JSON.stringify(after1));
  await saveShot('after_charm.png');

  const tc1Pass = typeof after1.charmCount === 'number' &&
                  typeof before.charmCount === 'number' &&
                  after1.charmCount === before.charmCount + 1 &&
                  after1.edda_rune_charm_granted === true &&
                  after1.dlg_reward_edda === true;
  results.push({
    test: 'TC1_first_completion',
    desc: 'eqp_bell_ward_charm 0→1 on first edda_rune_guide completion',
    before_charm: before.charmCount,
    after_charm: after1.charmCount,
    edda_rune_charm_granted: after1.edda_rune_charm_granted,
    dlg_reward_edda: after1.dlg_reward_edda,
    pass: tc1Pass,
  });
  console.log(tc1Pass ? '  ✅ TC1 PASS' : '  ❌ TC1 FAIL', `charm ${before.charmCount}→${after1.charmCount}`);

  // =========================================================
  // TC2: Repeat → no duplicate
  console.log('\n--- TC2: Repeat edda_rune_guide (no duplicate) ---');
  await driveDialogue('edda_rune_guide', 0);
  const after2 = await readState();
  console.log('AFTER REPEAT:', JSON.stringify(after2));

  const tc2Pass = after2.charmCount === after1.charmCount;
  results.push({
    test: 'TC2_repeat_no_duplicate',
    desc: 'No additional charm on second edda_rune_guide',
    before_charm: after1.charmCount,
    after_charm: after2.charmCount,
    pass: tc2Pass,
  });
  console.log(tc2Pass ? '  ✅ TC2 PASS' : '  ❌ TC2 FAIL', `charm ${after1.charmCount}→${after2.charmCount}`);

  // =========================================================
  // TC3: B05 guard check (neris_intro grants once, repeat blocked)
  console.log('\n--- TC3: B05 guard (neris_intro) ---');
  const poulticeBefore = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene')['playerState'].getItemCount('item_herbal_poultice')`);
  await driveDialogue('neris_intro', 0);
  const poulticeAfter1 = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene')['playerState'].getItemCount('item_herbal_poultice')`);
  await driveDialogue('neris_intro', 0);
  const poulticeAfter2 = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene')['playerState'].getItemCount('item_herbal_poultice')`);
  const tc3Pass = poulticeAfter1 === poulticeBefore + 1 && poulticeAfter2 === poulticeAfter1;
  results.push({
    test: 'TC3_b05_neris_guard',
    desc: 'B05 guard: neris_intro grants 1 poultice once and blocks repeat',
    poulticeBefore,
    poulticeAfter1,
    poulticeAfter2,
    pass: tc3Pass,
  });
  console.log(tc3Pass ? '  ✅ TC3 PASS' : '  ❌ TC3 FAIL', `poultice ${poulticeBefore}→${poulticeAfter1}→${poulticeAfter2}`);

  // =========================================================
  // TC4: Save -> Reload -> Continue -> verify no loss & no duplicate on re-talk
  console.log('\n--- TC4: Save -> Reload -> Continue -> re-talk ---');
  const savedOk = await evalJS(`window.__PHASER_GAME__.scene.getScene('GameScene').handleSaveManual()`);
  await sleep(400);
  await sendCDP('Page.reload', { ignoreCache: false });
  for (let i = 0; i < 50; i++) {
    await sleep(400);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('MainMenuScene')) break;
  }
  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').continueGame()`);
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const scenes = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (scenes.includes('GameScene')) break;
  }
  await sleep(1200);
  const afterContinue = await readState();
  await driveDialogue('edda_rune_guide', 0);
  const afterContinueRetalk = await readState();
  console.log('AFTER CONTINUE:', JSON.stringify(afterContinue));
  console.log('AFTER CONTINUE RETALK:', JSON.stringify(afterContinueRetalk));
  await saveShot('after_continue.png');

  const tc4Pass = savedOk === true &&
                  afterContinue.charmCount === 1 &&
                  afterContinueRetalk.charmCount === 1 &&
                  afterContinueRetalk.edda_rune_charm_granted === true &&
                  afterContinueRetalk.dlg_reward_edda === true;
  results.push({
    test: 'TC4_save_continue_no_loss_no_dup',
    desc: 'Save -> Reload -> Continue preserves 1 charm and blocks duplicate on re-talk',
    savedOk,
    afterContinue,
    afterContinueRetalk,
    pass: tc4Pass,
  });
  console.log(tc4Pass ? '  ✅ TC4 PASS' : '  ❌ TC4 FAIL');

  // =========================================================
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  const output = {
    timestamp: new Date().toISOString(),
    runtime_errors: errors,
    results,
    passed,
    total,
    summary: `${passed}/${total} PASS`
  };
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'fix23_results.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== FINAL: ${passed}/${total} PASS ===`);
  if (errors.length) console.log('Runtime errors:', errors);

  await cleanup();
  process.exit(passed === total ? 0 : 1);

} catch (err) {
  console.error('Fatal error:', err);
  await cleanup();
  process.exit(2);
}
