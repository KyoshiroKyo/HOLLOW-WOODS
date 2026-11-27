/**
 * verify_micro01_hiding_overlap.mjs — HW-AG-MICRO-01
 * CDP test: hide_tree_ow_north interaction at outer_woods (1360,620)
 * Tests: prompt correctness, resin priority, hide/unhide dispatch, outline target,
 *        single-E-action guarantee, WASD exit, neighbor spots still work.
 * No Playwright — pure Chrome headless + CDP.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_DIR = path.join(ROOT_DIR, 'Read', 'V1.5', 'Reports', 'Evidence', 'HW-AG-MICRO-01');
const PORT = 5224;
const CDP_PORT = 9262;
const TMP_USER_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-micro01-'));
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const results = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let chromeProc = null, ws = null;

async function cleanup() {
  try { ws?.close(); } catch {}
  try { chromeProc?.kill('SIGKILL'); } catch {}
  await sleep(300);
  try { fs.rmSync(TMP_USER_DIR, { recursive: true, force: true }); } catch {}
}

function test(name, pass, detail = '') {
  results.push({ test: name, pass, detail });
  console.log(`  ${pass ? '✅' : '❌'} ${name}${detail ? ': ' + detail : ''}`);
}

try {
  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', `--remote-debugging-port=${CDP_PORT}`,
    '--use-gl=swiftshader', '--disable-gpu', '--no-sandbox',
    '--disable-web-security', '--window-size=1280,720',
    `--user-data-dir=${TMP_USER_DIR}`,
    `http://127.0.0.1:${PORT}/?dev=1`
  ], { stdio: 'ignore' });

  let targets = [];
  for (let i = 0; i < 25; i++) {
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
    if (m.method === 'Runtime.exceptionThrown') runtimeErrors.push(m.params.exceptionDetails.text);
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
  const shot = async (name) => {
    const res = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(EVIDENCE_DIR, name), Buffer.from(res.data, 'base64'));
  };

  await sendCDP('Runtime.enable');
  await sendCDP('Page.enable');

  // Wait for MainMenuScene
  for (let i = 0; i < 50; i++) {
    await sleep(400);
    const s = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (s.includes('MainMenuScene')) break;
  }
  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()`);
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const s = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (s.includes('GameScene')) break;
  }
  await sleep(1500);

  // Helper: teleport player and set zone
  async function teleport(x, y, zone = 'outer_woods') {
    await evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      gs.player.setPosition(${x}, ${y});
      gs.player.body?.reset(${x}, ${y});
      gs.cameras?.main?.centerOn(${x}, ${y});
      gs.worldBuilder?.setActiveZone?.('${zone}');
    })()`);
    await sleep(600);
  }

  // Helper: get current interaction prompt text visible in UIScene
  async function getPromptText() {
    return evalJS(`(() => {
      const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
      return ui?.lastPromptText || ui?.promptText?.text || null;
    })()`);
  }

  // Helper: get nearest interactable candidates from GameScene internals
  async function getCandidates(px, py) {
    return evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      if (!gs.worldBuilder) return [];
      const list = gs.worldBuilder.getNearbyInteractables({ x: ${px}, y: ${py} }, 65);
      return list.map(({ item, dist }) => ({ id: item.id, type: item.type, actionId: item.actionId, dist: Math.round(dist), x: item.x, y: item.y }));
    })()`);
  }

  // Helper: read player state
  async function readPlayerState() {
    return evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      const ps = gs['playerState'];
      return {
        isHiding: gs.player?.stats?.isHiding ?? false,
        resinCount: ps?.getItemCount?.('res_tree_resin') ?? -1,
        resinGathered: ps?.hasFlag?.('gathered_gather_resin_ow_1') ?? false,
      };
    })()`);
  }

  // ── SETUP: Check runtime resource nodes near hide_tree_ow_north ──
  console.log('\n── Setup: checking resin state ──');
  await teleport(1520, 595, 'outer_woods');
  const candidatesAtResin = await getCandidates(1520, 595);
  const promptAtRuntimeResin = await getPromptText();
  const beforeResin = await readPlayerState();
  console.log('Candidates at runtime node_resin_ow_1 (1520,595):', JSON.stringify(candidatesAtResin));
  console.log('Prompt at runtime node_resin_ow_1:', promptAtRuntimeResin);
  console.log('State before gather:', JSON.stringify(beforeResin));
  await shot('00_at_resin_before.png');

  // ════════════════════════════════════════════════════════
  // SCENARIO A: Resin still available — player stands AT hide spot (1360,620)
  // No resin in range; only hide_tree_ow_north should appear.
  // ════════════════════════════════════════════════════════
  console.log('\n── Scenario A: At hide_tree_ow_north with resin available ──');
  await teleport(1360, 620, 'outer_woods');
  await sleep(400);
  const candidatesAtHide = await getCandidates(1360, 620);
  const promptAtHide = await getPromptText();
  await shot('01A_at_hide_spot_resin_available.png');

  console.log('Candidates at hide spot:', JSON.stringify(candidatesAtHide));
  console.log('Prompt at hide spot:', promptAtHide);

  const resinInRange_A = candidatesAtHide.some(c => c.actionId === 'gather_resin_ow_1');
  const hideInRange_A = candidatesAtHide.some(c => c.id === 'hide_tree_ow_north');
  test('A1: gather_resin_ow_1 NOT in range at (1360,620)', !resinInRange_A, `resinInRange=${resinInRange_A}`);
  test('A2: hide_tree_ow_north IS in range at (1360,620)', hideInRange_A, `hideInRange=${hideInRange_A}`);

  // Check prompt correctness: should mention hiding, not resin
  const promptOkA = promptAtHide ? promptAtHide.toLowerCase().includes('ẩn') || promptAtHide.toLowerCase().includes('cây') : false;
  test('A3: Prompt at hide spot mentions hiding/tree (not resin)', promptOkA, `prompt="${promptAtHide}"`);

  // ── Trigger E at hide spot — should hide, not gather resin ──
  const stateBefore_A = await readPlayerState();
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(100);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(600);
  const stateAfter_A = await readPlayerState();
  await shot('01B_after_E_at_hide_spot.png');

  const isHidingA = stateAfter_A.isHiding;
  const resinNotGathered = stateAfter_A.resinCount === stateBefore_A.resinCount;
  test('A4: E at hide_tree_ow_north sets isHiding=true', isHidingA, `isHiding=${stateAfter_A.isHiding}`);
  test('A5: E at hide spot does NOT collect resin (no wrong dispatch)', resinNotGathered,
    `resin before=${stateBefore_A.resinCount} after=${stateAfter_A.resinCount}`);

  // ── WASD exit from hiding ──
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
  await sleep(500);
  const stateAfterWASD = await readPlayerState();
  await shot('01C_after_wasd_exit.png');
  test('A6: WASD exits hiding (isHiding=false)', !stateAfterWASD.isHiding, `isHiding=${stateAfterWASD.isHiding}`);

  // ── Press E again: should hide again (single-E, no double trigger) ──
  await teleport(1360, 620, 'outer_woods');
  await sleep(300);
  const stateBeforeE2 = await readPlayerState();
  let eCount = 0;
  // Patch a counter to detect double-dispatch
  await evalJS(`window.__hideCallCount = 0; const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); const orig = gs.executeMapInteraction.bind(gs); gs.executeMapInteraction = (a, n) => { if (a === 'hide_player') window.__hideCallCount++; return orig(a, n); };`);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(100);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(500);
  eCount = await evalJS(`window.__hideCallCount`);
  const stateAfterE2 = await readPlayerState();
  test('A7: Single E triggers hide_player exactly once (no double dispatch)', eCount === 1, `hideCallCount=${eCount}`);

  // ════════════════════════════════════════════════════════
  // SCENARIO B: Resin depleted — gather, then check hide spot
  // ════════════════════════════════════════════════════════
  console.log('\n── Scenario B: Gather resin, then check hide spot ──');
  // Unhide first
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(200);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(400);

  // Gather resin
  await teleport(1170, 630, 'outer_woods');
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(100);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(600);
  const stateAfterGather = await readPlayerState();
  const resinGathered = stateAfterGather.resinGathered;
  await shot('02A_after_gather_resin.png');
  test('B1: Gather resin action works (flag set)', resinGathered, `gathered=${resinGathered}, resinCount=${stateAfterGather.resinCount}`);

  // Now at hide spot — resin depleted
  await teleport(1360, 620, 'outer_woods');
  await sleep(400);
  const candidatesB = await getCandidates(1360, 620);
  const promptB = await getPromptText();
  await shot('02B_at_hide_spot_resin_depleted.png');
  const hideInRange_B = candidatesB.some(c => c.id === 'hide_tree_ow_north');
  const promptOkB = promptB ? (promptB.toLowerCase().includes('ẩn') || promptB.toLowerCase().includes('cây')) : false;
  test('B2: hide_tree_ow_north prompt correct after resin depleted', promptOkB && hideInRange_B,
    `prompt="${promptB}", hideInRange=${hideInRange_B}`);

  // E should hide
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(100);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(600);
  const stateB_hide = await readPlayerState();
  await shot('02C_after_E_hide_resin_depleted.png');
  test('B3: E hides player after resin depleted', stateB_hide.isHiding, `isHiding=${stateB_hide.isHiding}`);

  // ════════════════════════════════════════════════════════
  // SCENARIO C: Neighbor hide spot (hide_bush_ow_s_curve at 1150,655) still works
  // ════════════════════════════════════════════════════════
  console.log('\n── Scenario C: Neighboring hide_bush_ow_s_curve (1150,655) ──');
  // Unhide first
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(400);

  await teleport(1150, 655, 'outer_woods');
  await sleep(400);
  const candidatesC = await getCandidates(1150, 655);
  const bushInRange = candidatesC.some(c => c.id === 'hide_bush_ow_s_curve' || c.actionId === 'hide_player');
  const promptC = await getPromptText();
  await shot('03A_at_hide_bush.png');
  test('C1: hide_bush_ow_s_curve in range at (1150,655)', bushInRange, `candidates=${candidatesC.map(c=>c.id).join(',')}`);

  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(100);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
  await sleep(600);
  const stateC = await readPlayerState();
  await shot('03B_after_E_hide_bush.png');
  test('C2: E at hide_bush_ow_s_curve hides player', stateC.isHiding, `isHiding=${stateC.isHiding}`);

  // ════════════════════════════════════════════════════════
  // SCENARIO D: Bonfire & NPC area nearby (1470,710) — no residual prompt
  // ════════════════════════════════════════════════════════
  console.log('\n── Scenario D: Bonfire area prompt (1470,710) ──');
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(300);
  await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
  await sleep(400);

  await teleport(1470, 710, 'outer_woods');
  await sleep(400);
  const candidatesD = await getCandidates(1470, 710);
  const promptD = await getPromptText();
  await shot('04A_at_bonfire.png');
  const bonfireInRange = candidatesD.some(c => c.actionId === 'warm_quiet_bonfire');
  test('D1: Bonfire prompt shown near (1470,710)', bonfireInRange, `candidates=${candidatesD.map(c=>c.id).join(',')}, prompt="${promptD}"`);
  // Confirm no hiding prompt shown at bonfire
  const noHidingPromptAtBonfire = !promptD?.toLowerCase().includes('ẩn') || bonfireInRange;
  test('D2: No residual hiding prompt shown at bonfire area', !candidatesD.some(c => c.type === 'hiding_spot'),
    `hideSpotsInRange=${candidatesD.filter(c=>c.type==='hiding_spot').map(c=>c.id).join(',')}`);

  // ════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const output = {
    timestamp: new Date().toISOString(),
    runtime_errors: runtimeErrors,
    results,
    passed,
    total: results.length,
    summary: `${passed}/${results.length} PASS`
  };
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'micro01_results.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== FINAL: ${passed}/${results.length} PASS${failed > 0 ? ` (${failed} FAIL)` : ''} ===`);
  if (runtimeErrors.length) console.log('Runtime errors:', runtimeErrors);

  await cleanup();
  process.exit(failed > 0 ? 1 : 0);

} catch (err) {
  console.error('Fatal:', err);
  await cleanup();
  process.exit(2);
}
