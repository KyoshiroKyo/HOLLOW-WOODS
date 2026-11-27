import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const phaserNodeStubPlugin = {
  name: 'phaser-node-stub',
  setup(b) {
    b.onResolve({ filter: /^phaser$/ }, () => ({ path: 'phaser', namespace: 'phaser-stub' }));
    b.onLoad({ filter: /.*/, namespace: 'phaser-stub' }, () => ({
      contents: `
        class EventEmitter {
          constructor() { this._l = new Map(); }
          on(ev, fn) { if (!this._l.has(ev)) this._l.set(ev, []); this._l.get(ev).push(fn); return this; }
          once(ev, fn) { const w = (...a) => { this.off(ev, w); fn(...a); }; return this.on(ev, w); }
          off(ev, fn) { const arr = this._l.get(ev) || []; this._l.set(ev, arr.filter(f => f !== fn)); return this; }
          emit(ev, ...a) { for (const fn of [...(this._l.get(ev) || [])]) fn(...a); return true; }
          removeAllListeners(ev) { if (ev) this._l.delete(ev); else this._l.clear(); return this; }
        }
        export const Events = { EventEmitter };
        export const Scene = class {};
        export default { Events, Scene };
      `,
      loader: 'js'
    }));
  }
};

async function loadModules() {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => { storage.set(k, String(v)); },
    removeItem: (k) => { storage.delete(k); }
  };
  globalThis.window = {
    localStorage: globalThis.localStorage,
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const entrySource = `
    export { PlayerState } from './src/state/PlayerState.ts';
    export { QuestSystem } from './src/systems/QuestSystem.ts';
    export { BossEncounterSystem } from './src/systems/BossEncounterSystem.ts';
    export { WorldGatingSystem } from './src/world/WorldGatingSystem.ts';
    export { DialogueSystem } from './src/systems/DialogueSystem.ts';
  `;
  const result = await build({
    stdin: { contents: entrySource, resolveDir: ROOT_DIR, loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    mainFields: ['module', 'main'],
    plugins: [phaserNodeStubPlugin],
    logLevel: 'silent'
  });

  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`);
}

const { PlayerState, QuestSystem, BossEncounterSystem, WorldGatingSystem, DialogueSystem } = await loadModules();
const ps = PlayerState.getInstance();
const qs = QuestSystem.getInstance();
const wg = WorldGatingSystem.getInstance();
const bes = BossEncounterSystem.getInstance();

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

try {
// 1. OPEN-02: broken_bell_shrine remains locked until root seal broken / bridge lowered
ps.reset();
ps.setFlag('mire_pillars_solved');
ps.setFlag('mire_puzzle_solved');
assert.equal(wg.isZoneUnlocked('broken_bell_shrine', ps), false, 'broken_bell_shrine must stay locked before root seal broken');
assert.equal(ps.hasFlag('clapper_collected'), false, 'clapper_collected must not fire early');
pass('OPEN-02 broken_bell_shrine locked before root seal broken');

// 2. Consumed/converted Purification Key cannot be re-crafted after breaking root seal
ps.reset();
ps.addItem('item_bell_mold', 1);
ps.setFlag('has_bell_mold');
ps.addItem('quest_rune_fragment', 1);
ps.setFlag('has_rune_fragment');
assert.equal(qs.craftPurificationKey(ps), true);
assert.equal(ps.getItemCount('quest_purification_key'), 1);
assert.equal(qs.unlockBridge(ps), true);
assert.equal(wg.isZoneUnlocked('broken_bell_shrine', ps), true);
ps.removeItem('quest_purification_key', 1);
assert.equal(qs.craftPurificationKey(ps), false, 'Must not re-add quest_purification_key after root seal broken');
assert.equal(ps.getItemCount('quest_purification_key'), 0);
pass('Consumed quest_purification_key after mire_root_seal_broken cannot be re-crafted');

// 3. H4-NEW-03 / OPEN-01: Boss defeat grants relic_heart_of_roots once even if consumed later
ps.reset();
bes.completeEncounter();
assert.equal(ps.getItemCount('relic_heart_of_roots'), 1);
assert.equal(ps.hasFlag('boss_mire_warden_defeated'), true);
assert.equal(ps.hasFlag('clapper_collected'), false, 'Boss defeat must not set clapper_collected prematurely');
ps.removeItem('relic_heart_of_roots', 1);
bes.completeEncounter();
assert.equal(ps.getItemCount('relic_heart_of_roots'), 0, 'Consumed relic_heart_of_roots must not re-drop');
pass('BossEncounterSystem single-drop guard holds even when relic_heart_of_roots consumed');

// 4. DialogueSystem reward guard — static source check
// (Phaser timer-based typewriter prevents runtime test in Node; verify source guards directly)
const dsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/systems/DialogueSystem.ts'), 'utf8');
assert.ok(
  dsSrc.includes("const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && hadRuneCharmBeforePass;"),
  'edda_rune_guide charm guard uses pre-pass hadRuneCharmBeforePass snapshot (FIX-23)'
);
assert.ok(
  dsSrc.includes('state.setStoryFlag(rewardMarker);'),
  'reward marker setStoryFlag always called (idempotent, even when item already owned)'
);
assert.ok(
  dsSrc.includes('!state.hasFlag(rewardMarker)') && dsSrc.includes('!state.hasStoryFlag(rewardMarker)'),
  'duplicate-item guard checks both flag stores'
);
pass('DialogueSystem reward idempotency guards verified via static source analysis');

// 5. DialogueSystem trust marker guard — static source check
assert.ok(
  dsSrc.includes('const rewardMarker = `dlg_reward:${dialogueKey}`'),
  'dlg_reward marker key is scoped per dialogue key'
);
assert.ok(
  dsSrc.includes('!questAlreadyOwned') && dsSrc.includes('!runeCharmAlreadyGranted'),
  'reward item gated by questAlreadyOwned and runeCharmAlreadyGranted'
);
pass('DialogueSystem trust/reward per-key scope guards verified via static source analysis');

// 6. Static check of GameScene routing guards (isSealAlreadyBroken / isKeyAlreadyCrafted)
const gsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/scenes/GameScene.ts'), 'utf8').replace(/\r\n/g, '\n');
assert.ok(gsSrc.includes('if (hasPurificationKey && !isSealAlreadyBroken)'), 'Vaelen reminder gated by !isSealAlreadyBroken');
assert.ok(gsSrc.includes('else if (!isKeyAlreadyCrafted && hasMold && hasRune)'), 'Vaelen forge gated by !isKeyAlreadyCrafted');
assert.ok(gsSrc.includes('if (!hasKey && !isKeyAlreadyCrafted && hasMold && hasRune)'), 'Bram forge gated by !isKeyAlreadyCrafted');
pass('GameScene Vaelen/Bram consumed-key routing guards verified');
} catch (err) {
  console.error('FAILED:', err?.stack || err);
  process.exit(1);
}
