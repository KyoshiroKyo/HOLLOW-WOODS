/**
 * verify_micro01_r1_runtime_node.mjs — HW-AG-MICRO-01-R1
 * Targeted CDP verification of runtime resource node `node_resin_ow_1` at (1520,595)
 * and non-overlap with `hide_tree_ow_north` (1360,620) in `outer_woods`.
 *
 * Distinct from HW-AG-MICRO-01:
 *  - Verifies actual runtime `InventorySystem` node `node_resin_ow_1` (not only `gather_resin_ow_1`)
 *  - Uses `player.getFootPosition()` for range/candidate checks
 *  - Verifies walkability via real WASD movement & collision
 *  - Asserts exact active prompt text, outline target, inventory delta (+1), depleted state, no double-grant
 *  - Fails exit code on any runtime exception or failed assertion
 *  - Writes separate evidence to Read/V1.5/Reports/Evidence/HW-AG-MICRO-01-R1/
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_DIR = path.join(ROOT_DIR, 'Read', 'V1.5', 'Reports', 'Evidence', 'HW-AG-MICRO-01-R1');
const PORT = 5224;
const CDP_PORT = 9263;
const TMP_USER_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-micro01-r1-'));
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const results = [];
const trace = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let chromeProc = null;
let ws = null;

async function cleanup() {
  try { ws?.close(); } catch {}
  try { chromeProc?.kill('SIGKILL'); } catch {}
  await sleep(300);
  try { fs.rmSync(TMP_USER_DIR, { recursive: true, force: true }); } catch {}
}

function record(name, pass, detail = '') {
  results.push({ test: name, pass: Boolean(pass), detail });
  console.log(`  ${pass ? '✅' : '❌'} ${name}${detail ? ': ' + detail : ''}`);
}

try {
  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--use-gl=swiftshader',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,720',
    `--user-data-dir=${TMP_USER_DIR}`,
    `http://localhost:${PORT}/?dev=1`
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
    if (m.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(m.params.exceptionDetails.text + (m.params.exceptionDetails.exception?.description ? ': ' + m.params.exceptionDetails.exception.description : ''));
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
  const shot = async (name) => {
    const res = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(EVIDENCE_DIR, name), Buffer.from(res.data, 'base64'));
  };
  const pressKey = async (key, code, vk, holdMs = 90) => {
    await sendCDP('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk });
    await sleep(holdMs);
    await sendCDP('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
  };

  await sendCDP('Runtime.enable');
  await sendCDP('Page.enable');

  let menuReady = false;
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    const s = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (s.includes('MainMenuScene')) { menuReady = true; break; }
  }
  if (!menuReady) throw new Error('MainMenuScene did not become active in time');
  await evalJS(`window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()`);
  await sleep(300);
  await pressKey(' ', 'Space', 32, 60);
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const s = await evalJS(`window.__PHASER_GAME__?.scene?.getScenes(true)?.map(s => s.scene.key) || []`);
    if (s.includes('GameScene')) break;
  }
  // Wait until GameScene player + inventorySystem + uiScene are fully initialized
  for (let i = 0; i < 30; i++) {
    const ready = await evalJS(`(() => {
      const gs = window.__PHASER_GAME__?.scene?.getScene('GameScene');
      const ui = window.__PHASER_GAME__?.scene?.getScene('UIScene');
      return Boolean(gs?.player?.getFootPosition && gs?.inventorySystem && gs?.worldBuilder && ui?.promptText);
    })()`);
    if (ready) break;
    await sleep(300);
  }
  await sleep(1200);

  // Install lightweight observation hook on renderInteractionOutline + executeMapInteraction (read-only spy)
  await evalJS(`(() => {
    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
    window.__r1OutlineTarget = null;
    window.__r1HideCalls = 0;
    const origOutline = gs.renderInteractionOutline.bind(gs);
    gs.renderInteractionOutline = (target) => {
      window.__r1OutlineTarget = {
        x: target.x,
        y: target.y,
        id: target.targetRef?.id || null,
        actionId: target.targetRef?.actionId || null
      };
      return origOutline(target);
    };
    const origClear = gs.clearInteractionOutline.bind(gs);
    gs.clearInteractionOutline = () => {
      window.__r1OutlineTarget = null;
      return origClear();
    };
    const origExec = gs.executeMapInteraction.bind(gs);
    gs.executeMapInteraction = (actionId, name) => {
      if (actionId === 'hide_player') window.__r1HideCalls++;
      return origExec(actionId, name);
    };
  })()`);

  // Fixture helper: places player so that footPosition equals (fx, fy)
  async function placeFootAt(fx, fy, zone = 'outer_woods') {
    for (let attempt = 0; attempt < 5; attempt++) {
      await evalJS(`(() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const curFoot = gs.player.getFootPosition();
        const dx = curFoot.x - gs.player.x;
        const dy = curFoot.y - gs.player.y;
        const tx = ${fx} - dx;
        const ty = ${fy} - dy;
        gs.player.setPosition(tx, ty);
        gs.player.body?.reset(tx, ty);
        gs.cameras?.main?.centerOn(tx, ty);
        gs.worldBuilder?.setActiveZone?.('${zone}');
      })()`);
      await sleep(500);
      const dist = await evalJS(`(() => {
        const f = window.__PHASER_GAME__.scene.getScene('GameScene').player.getFootPosition();
        return Math.hypot(f.x - ${fx}, f.y - ${fy});
      })()`);
      if (dist <= 5) break;
    }
  }

  async function readSnapshot() {
    return evalJS(`(() => {
      const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
      const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
      const ps = gs['playerState'];
      const inv = gs['inventorySystem'];
      const foot = gs.player.getFootPosition();
      const runtimeNodesInRange = inv.getNearbyAvailableNodes(foot.x, foot.y, 65);
      const worldInRange = gs.worldBuilder.getNearbyInteractables(foot, 65).map(({ item, dist }) => ({
        id: item.id, type: item.type, actionId: item.actionId, dist: Math.round(dist), x: item.x, y: item.y
      }));
      const nodeResinOw1 = (inv['nodes'] || []).find(n => n.spec.id === 'node_resin_ow_1');
      return {
        foot: { x: Math.round(foot.x), y: Math.round(foot.y) },
        prompt: ui?.lastPromptText ?? null,
        outlineCmdCount: gs['interactionOutlineGfx']?.commandBuffer?.length ?? 0,
        outlineTarget: window.__r1OutlineTarget ?? null,
        isHiding: gs.player?.stats?.isHiding ?? false,
        resinCount: ps?.getItemCount?.('res_tree_resin') ?? -1,
        nodeDepleted: ps?.isNodeDepleted?.('node_resin_ow_1') ?? null,
        gatherFlag: ps?.hasFlag?.('gathered_gather_resin_ow_1') ?? false,
        runtimeNodesInRange,
        worldInRange,
        nodeResinOw1: nodeResinOw1 ? {
          id: nodeResinOw1.spec.id,
          x: nodeResinOw1.spec.x,
          y: nodeResinOw1.spec.y,
          itemId: nodeResinOw1.spec.itemId,
          count: nodeResinOw1.spec.count,
          available: nodeResinOw1.available,
          visible: nodeResinOw1.visual?.visible ?? null
        } : null,
        hideCalls: window.__r1HideCalls ?? 0
      };
    })()`);
  }

  // ── 1. Runtime node existence & hide_tree_ow_north while node_resin_ow_1 is AVAILABLE ──
  console.log('\n── 1. Hiding at hide_tree_ow_north (1360,620) while node_resin_ow_1 is available ──');
  await placeFootAt(1360, 620, 'outer_woods');
  const s1 = await readSnapshot();
  trace.push({ step: '1_at_hide_while_node_available', snapshot: s1 });
  await shot('R1_01_hide_spot_node_available.png');

  record('R1-1: node_resin_ow_1 exists at (1520,595) & available=true',
    s1.nodeResinOw1 && s1.nodeResinOw1.x === 1520 && s1.nodeResinOw1.y === 595 && s1.nodeResinOw1.available === true && !s1.nodeDepleted,
    JSON.stringify(s1.nodeResinOw1));

  record('R1-2: node_resin_ow_1 NOT in range at hide_tree_ow_north (1360,620)',
    !s1.runtimeNodesInRange.some(n => n.id === 'node_resin_ow_1'),
    `runtimeNodesInRange=${JSON.stringify(s1.runtimeNodesInRange.map(n => n.id))}`);

  record('R1-3: Exact prompt at (1360,620) is "[E] Ẩn nấp" with outline on hide_tree_ow_north',
    s1.prompt === '[E] Ẩn nấp' && s1.outlineCmdCount > 0 && s1.outlineTarget?.id === 'hide_tree_ow_north',
    `prompt="${s1.prompt}", outlineTarget=${JSON.stringify(s1.outlineTarget)}`);

  await pressKey('e', 'KeyE', 69);
  await sleep(500);
  const s1AfterE = await readSnapshot();
  trace.push({ step: '1_after_E_hide', snapshot: s1AfterE });
  await shot('R1_02_hiding_active.png');

  record('R1-4: E hides player, exact exit prompt "[E] Rời chỗ ẩn nấp", resin unchanged, single dispatch',
    s1AfterE.isHiding === true && s1AfterE.prompt === '[E] Rời chỗ ẩn nấp' && s1AfterE.resinCount === 0 && s1AfterE.hideCalls === 1,
    `isHiding=${s1AfterE.isHiding}, prompt="${s1AfterE.prompt}", resin=${s1AfterE.resinCount}, hideCalls=${s1AfterE.hideCalls}`);

  // E exits hiding
  await pressKey('e', 'KeyE', 69);
  await sleep(500);
  const s1ExitE = await readSnapshot();
  record('R1-5: E exits hiding cleanly',
    s1AfterE.isHiding === true && s1ExitE.isHiding === false,
    `wasHiding=${s1AfterE.isHiding}, isHiding=${s1ExitE.isHiding}`);

  // Re-enter then WASD exits
  await pressKey('e', 'KeyE', 69);
  await sleep(400);
  const s1Reenter = await readSnapshot();
  await pressKey('w', 'KeyW', 87, 250);
  await sleep(400);
  const s1Wasd = await readSnapshot();
  record('R1-6: WASD exits hiding cleanly',
    s1Reenter.isHiding === true && s1Wasd.isHiding === false,
    `wasHiding=${s1Reenter.isHiding}, isHiding=${s1Wasd.isHiding}`);

  // ── 2. Walkability & normal WASD approach to node_resin_ow_1 (1520,595) ──
  console.log('\n── 2. Normal WASD approach & harvest of node_resin_ow_1 (1520,595) ──');
  // Start in open clearing east/southeast of ranger outpost and walk north-west/north to (1520,595)
  await placeFootAt(1520, 650, 'outer_woods');
  const beforeWalk = await readSnapshot();
  // Hold W to walk up from y=650 toward y=595 through collision
  await pressKey('w', 'KeyW', 87, 450);
  await sleep(400);
  const atNode = await readSnapshot();
  trace.push({ step: '2_walked_to_node_resin_ow_1', beforeWalk: beforeWalk.foot, snapshot: atNode });
  await shot('R1_03_walked_to_node_resin_ow_1.png');

  const distToNode = Math.hypot(atNode.foot.x - 1520, atNode.foot.y - 595);
  record('R1-7: node_resin_ow_1 (1520,595) is walkable via normal WASD movement (foot moved & within 50px)',
    atNode.foot.y < beforeWalk.foot.y && distToNode <= 50,
    `startFoot=${JSON.stringify(beforeWalk.foot)}, endFoot=${JSON.stringify(atNode.foot)}, dist=${Math.round(distToNode)}`);

  record('R1-8: Exact prompt "[E] Thu thập Nhựa Cây Dính (x1)" & outline on node_resin_ow_1',
    atNode.prompt === '[E] Thu thập Nhựa Cây Dính (x1)' && atNode.outlineCmdCount > 0 && atNode.outlineTarget?.id === 'node_resin_ow_1',
    `prompt="${atNode.prompt}", outlineTarget=${JSON.stringify(atNode.outlineTarget)}`);

  const resinBefore = atNode.resinCount;
  await pressKey('e', 'KeyE', 69);
  await sleep(500);
  const afterHarvest = await readSnapshot();
  trace.push({ step: '2_after_harvest_node_resin_ow_1', snapshot: afterHarvest });
  await shot('R1_04_after_harvest_node_resin_ow_1.png');

  record('R1-9: E collects node_resin_ow_1 (+1 delta), marks node_resin_ow_1 depleted & hidden',
    afterHarvest.resinCount === resinBefore + 1 &&
    afterHarvest.nodeDepleted === true &&
    afterHarvest.nodeResinOw1?.available === false &&
    afterHarvest.nodeResinOw1?.visible === false,
    `resin=${resinBefore}->${afterHarvest.resinCount}, depleted=${afterHarvest.nodeDepleted}, avail=${afterHarvest.nodeResinOw1?.available}, visible=${afterHarvest.nodeResinOw1?.visible}`);

  // Press E again — must NOT grant a second time
  await pressKey('e', 'KeyE', 69);
  await sleep(400);
  const afterSecondE = await readSnapshot();
  record('R1-10: Second E on depleted node_resin_ow_1 does NOT double-grant',
    afterSecondE.resinCount === afterHarvest.resinCount && afterSecondE.prompt !== '[E] Thu thập Nhựa Cây Dính (x1)',
    `resin=${afterSecondE.resinCount}, prompt="${afterSecondE.prompt}"`);

  // ── 3. Hiding at hide_tree_ow_north after node_resin_ow_1 is depleted ──
  console.log('\n── 3. Hiding at hide_tree_ow_north after node_resin_ow_1 depleted ──');
  await placeFootAt(1360, 620, 'outer_woods');
  const s3 = await readSnapshot();
  record('R1-11: Exact prompt "[E] Ẩn nấp" at (1360,620) after node_resin_ow_1 depleted',
    s3.prompt === '[E] Ẩn nấp' && s3.outlineTarget?.id === 'hide_tree_ow_north',
    `prompt="${s3.prompt}", outline=${JSON.stringify(s3.outlineTarget)}`);
  await pressKey('e', 'KeyE', 69);
  await sleep(400);
  const s3Hide = await readSnapshot();
  record('R1-12: E hides player after node_resin_ow_1 depleted',
    s3Hide.isHiding === true,
    `isHiding=${s3Hide.isHiding}`);
  await pressKey('e', 'KeyE', 69);
  await sleep(300);

  // ── 4. Map interactable gather_resin_ow_1 (1170,630), neighbor bush, bonfire ──
  console.log('\n── 4. Map gather_resin_ow_1, neighbor bush & bonfire exact prompts ──');
  await placeFootAt(1170, 630, 'outer_woods');
  const sMapResin = await readSnapshot();
  const resinBeforeMap = sMapResin.resinCount;
  await pressKey('e', 'KeyE', 69);
  await sleep(500);
  const sMapResinAfter = await readSnapshot();
  record('R1-13: Map gather_resin_ow_1 (1170,630) remains usable (+2 resin, flag set)',
    sMapResinAfter.gatherFlag === true && sMapResinAfter.resinCount === resinBeforeMap + 2,
    `promptBefore="${sMapResin.prompt}", flag=${sMapResinAfter.gatherFlag}, resin=${resinBeforeMap}->${sMapResinAfter.resinCount}`);

  await placeFootAt(1150, 655, 'outer_woods');
  const sBush = await readSnapshot();
  record('R1-14: Neighbor hide_bush_ow_s_curve (1150,655) exact prompt "[E] Ẩn nấp"',
    sBush.prompt === '[E] Ẩn nấp' && sBush.outlineTarget?.id === 'hide_bush_ow_s_curve',
    `prompt="${sBush.prompt}", outline=${JSON.stringify(sBush.outlineTarget)}`);

  await placeFootAt(1470, 710, 'outer_woods');
  const sBonfire = await readSnapshot();
  record('R1-15: Bonfire (1470,710) exact prompt "[E] Sưởi Ấm Bên Lửa Cổ" & no hiding spot in range',
    sBonfire.prompt === '[E] Sưởi Ấm Bên Lửa Cổ' && !sBonfire.worldInRange.some(w => w.type === 'hiding_spot'),
    `prompt="${sBonfire.prompt}", worldInRange=${JSON.stringify(sBonfire.worldInRange.map(w => w.id))}`);

  record('R1-16: Zero uncaught runtime errors',
    runtimeErrors.length === 0,
    runtimeErrors.length ? runtimeErrors.join(' | ') : '0 errors');

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const output = {
    timestamp: new Date().toISOString(),
    runtime_errors: runtimeErrors,
    results,
    trace,
    passed,
    total: results.length,
    summary: `${passed}/${results.length} PASS`
  };
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'micro01_r1_results.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== R1 FINAL: ${passed}/${results.length} PASS${failed > 0 ? ` (${failed} FAIL)` : ''} ===`);

  await cleanup();
  process.exit(failed > 0 ? 1 : 0);
} catch (err) {
  console.error('Fatal:', err);
  await cleanup();
  process.exit(2);
}
