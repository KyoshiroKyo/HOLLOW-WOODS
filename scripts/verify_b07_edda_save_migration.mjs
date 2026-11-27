import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import test, { beforeEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const local = new Map();
const cloud = new Map();
const cloudReads = [];
globalThis.localStorage = {
  getItem: key => local.get(key) ?? null,
  setItem: (key, value) => local.set(key, String(value)),
  removeItem: key => local.delete(key)
};
globalThis.window = { localStorage: globalThis.localStorage };

const bundle = await build({
  stdin: {
    resolveDir: root,
    loader: 'ts',
    contents: `
      export { SaveManager } from './src/systems/SaveManager.ts';
      export { PlayerState } from './src/state/PlayerState.ts';
      export { DialogueSystem } from './src/systems/DialogueSystem.ts';
      export { CraftingSystem } from './src/systems/CraftingSystem.ts';
      export { LOCAL_PREFIX, SAVE_KEY_PROGRESS } from './src/services/CloudSaveService.ts';
    `
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  define: { 'import.meta.env': JSON.stringify({ DEV: false, VITE_HOLLOW_WOODS_QA: '0' }) },
  plugins: [{
    name: 'phaser-node-stub',
    setup(builder) {
      builder.onResolve({ filter: /^phaser$/ }, () => ({ path: 'phaser', namespace: 'stub' }));
      builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
        resolveDir: root,
        contents: `
          import { EventEmitter } from 'node:events';
          export const Events = { EventEmitter };
          export const Scene = class {};
          export const Math = { Clamp: (value, min, max) => globalThis.Math.min(max, globalThis.Math.max(min, value)) };
          export const Textures = { FilterMode: { LINEAR: 0 } };
        `
      }));
    }
  }]
});
const payload = Buffer.from(bundle.outputFiles[0].text).toString('base64');
const { SaveManager, PlayerState, DialogueSystem, CraftingSystem, LOCAL_PREFIX, SAVE_KEY_PROGRESS } =
  await import('data:text/javascript;base64,' + payload);

const state = PlayerState.getInstance();
const slot = LOCAL_PREFIX + 'slot_1';
const charm = 'eqp_bell_ward_charm';
const grant = 'edda_rune_charm_granted';
const reward = 'dlg_reward:edda_rune_guide';
const migrated = 'migrated_edda_rune_charm_v161';
const quest = 'Q01_MEET_EDDA';
const dialogues = JSON.parse(readFileSync(new URL('../src/data/dialogues.json', import.meta.url), 'utf8')).dialogues;

function fixture(overrides = {}) {
  return {
    saveVersion: 3,
    saveSchemaVersion: 3,
    version: '1.6.0',
    timestamp: 1700000000000,
    checkpointName: 'B07-R1 fixture',
    zoneId: 'bellhollow',
    playerPos: { x: 800, y: 700 },
    currentQuestId: quest,
    quests: [{ id: quest, tasks: [{ id: 't1', done: true }] }],
    inventory: [['res_dry_wood', 5]],
    flags: ['fixture_world_flag'],
    storyFlags: ['fixture_story_flag'],
    equippedSlots: { body: 'eqp_moss_cloak', feet: null, back: null, charm: null },
    storageChest: [['res_flint', 2]],
    legacyExtraData: { fixtureExtension: { revision: 2, values: [1, 4] } },
    ...overrides
  };
}

function affectedShape() {
  // Matches the observed pre-FIX-23 symptom, but the serialized shape cannot prove provenance.
  return fixture({ storyFlags: ['fixture_story_flag', grant, reward] });
}

function ownedCount(data) {
  assert.ok(data);
  const count = entries => entries.reduce((sum, [id, qty]) => sum + (id === charm ? qty : 0), 0);
  return count(data.inventory) + count(data.storageChest) + Number(data.equippedSlots.charm === charm);
}

function seedLocal(data, key = slot) {
  local.set(key, JSON.stringify(data));
}

function mockSdk() {
  window.p2 = {
    storage: {
      get: async key => {
        cloudReads.push(key);
        return structuredClone(cloud.get(key));
      },
      set: async (key, data) => { cloud.set(key, structuredClone(data)); }
    }
  };
}

function assertPreserved(data) {
  assert.equal(data.saveVersion, 3);
  assert.equal(data.saveSchemaVersion, 3);
  assert.equal(data.version, '1.6.0');
  assert.equal(data.currentQuestId, quest);
  assert.equal(data.quests.find(entry => entry.id === quest)?.tasks.find(task => task.id === 't1')?.done, true);
  assert.equal(new Map(data.inventory).get('res_dry_wood'), 5);
  assert.equal(new Map(data.storageChest).get('res_flint'), 2);
  assert.equal(data.equippedSlots.body, 'eqp_moss_cloak');
  assert.ok(data.flags.includes('fixture_world_flag'));
  assert.ok(data.storyFlags.includes('fixture_story_flag'));
  assert.deepEqual(data.legacyExtraData.fixtureExtension, { revision: 2, values: [1, 4] });
}

function assertBothEddaFlags(data) {
  for (const flag of [grant, reward]) {
    assert.ok(data.flags.includes(flag) || data.storyFlags.includes(flag), flag);
  }
}

function completeDialogue(dialogueKey, choiceIndex) {
  const system = new DialogueSystem({ events: new EventEmitter() });
  const data = dialogues[dialogueKey];
  // Start at the completed dialogue node. UI input, typewriter and rendering are out of scope.
  system.isActive = true;
  system.currentDialogueKey = dialogueKey;
  system.currentPayload = data;
  system.sessionChain = [{ dialogueKey, payload: data, selectedChoice: data.choices?.[choiceIndex] ?? null }];
  system.endDialogue();
}

beforeEach(() => {
  local.clear();
  cloud.clear();
  cloudReads.length = 0;
  delete window.p2;
  state.reset();
});

for (const [label, raw] of [
  ['neither reward flag', fixture()],
  ['pre-FIX-23 symptom without provenance', affectedShape()],
  ['grant only, in flags', fixture({ flags: [grant] })],
  ['grant only, in storyFlags', fixture({ storyFlags: [grant] })],
  ['reward only, in flags', fixture({ flags: [reward] })],
  ['reward only, in storyFlags', fixture({ storyFlags: [reward] })],
  ['both flags, missing optional ownership fields', { saveVersion: 3, saveSchemaVersion: 3, version: '1.6.0', flags: [grant], storyFlags: [reward] }]
]) {
  test('sanitize leaves no charm and mints no flags: ' + label, () => {
    const before = structuredClone(raw);
    const result = SaveManager.sanitizeAndMigrateSaveData(raw);
    assert.equal(ownedCount(result), 0);
    assert.deepEqual(result.flags, raw.flags ?? []);
    assert.deepEqual(result.storyFlags, raw.storyFlags ?? []);
    assert.deepEqual(raw, before);
  });
}

test('preserves existing ownership in bag, equipped slot and legacy chest alias', () => {
  const raw = affectedShape();
  const cases = [
    [{ ...raw, inventory: [...raw.inventory, [charm, 2]] }, 2],
    [{ ...raw, equippedSlots: { ...raw.equippedSlots, charm } }, 1],
    [{ ...raw, storageChestInventory: [...raw.storageChest, [charm, 1]] }, 1]
  ];
  for (const [input, expected] of cases) {
    const result = SaveManager.sanitizeAndMigrateSaveData(input);
    assert.equal(ownedCount(result), expected);
    assertPreserved(result);
    assert.deepEqual(result.flags, raw.flags);
    assert.deepEqual(result.storyFlags, raw.storyFlags);
  }
});

test('preserves existing migration marker from either flag set without using it as proof', () => {
  for (const key of ['flags', 'storyFlags']) {
    const raw = affectedShape();
    raw[key].push(migrated);
    const result = SaveManager.sanitizeAndMigrateSaveData(raw);
    assert.equal(ownedCount(result), 0);
    assert.deepEqual(result.flags, raw.flags);
    assert.deepEqual(result.storyFlags, raw.storyFlags);
  }
});

test('craft_purified_crest_ward uses real recipe; save does not add a charm or an Edda flag', () => {
  state.addItem('quest_corrupted_crest', 1);
  state.addItem('res_tree_resin', 2);
  state.addItem('res_herbs', 2);
  assert.equal(new CraftingSystem().craft('craft_purified_crest_ward'), true);
  assert.equal(state.getItemCount('quest_corrupted_crest'), 0);
  assert.equal(SaveManager.saveGame('crafted', 'bellhollow', 800, 700), true);
  state.reset();
  const result = SaveManager.loadGame();
  assert.equal(ownedCount(result), 1);
  assert.ok(result.flags.includes('crafted_craft_purified_crest_ward'));
  for (const flag of [grant, reward, migrated]) assert.ok(!state.hasFlag(flag));
});

for (const key of [slot, SaveManager.LEGACY_SAVE_KEY]) {
  test('summary and hasSave are read-only for ' + key, () => {
    const raw = affectedShape();
    seedLocal(raw, key);
    const storageBefore = [...local];
    state.addItem('res_flint', 3);
    state.setStoryFlag('unchanged_probe');
    const stateBefore = [Array.from(state.inventory), Array.from(state.flags), state.getStoryFlags()];
    assert.equal(SaveManager.getSaveSummary()?.checkpoint, raw.checkpointName);
    assert.equal(SaveManager.hasSave(), true);
    assert.deepEqual([...local], storageBefore);
    assert.deepEqual([Array.from(state.inventory), Array.from(state.flags), state.getStoryFlags()], stateBefore);
    assert.equal(cloud.size, 0);
  });
}

test('local load → save → reload preserves an already recovered B07 fixture', () => {
  const raw = affectedShape();
  raw.inventory.push([charm, 1]);
  raw.flags.push(grant, reward, migrated);
  raw.storyFlags.push(migrated);
  seedLocal(raw);
  const loaded = SaveManager.loadGame();
  assert.equal(ownedCount(loaded), 1);
  assert.equal(state.getItemCount(charm), 1);
  assertPreserved(loaded);
  assert.equal(SaveManager.saveGame('round trip', 'bellhollow', 800, 700), true);
  state.reset();
  const reloaded = SaveManager.loadGame();
  assert.equal(ownedCount(reloaded), 1);
  assert.equal(state.getItemCount(charm), 1);
  assertPreserved(reloaded);
  assertBothEddaFlags(reloaded);
  assert.ok(reloaded.flags.includes(migrated) && reloaded.storyFlags.includes(migrated));
});

test('direct saveGame cannot grant a reward to a live state with ambiguous Edda flags', () => {
  const raw = SaveManager.sanitizeAndMigrateSaveData(fixture());
  SaveManager.applySaveToState(raw);
  state.setStoryFlag(grant);
  state.setStoryFlag(reward);
  assert.equal(state.getItemCount(charm), 0);
  mockSdk();
  assert.equal(SaveManager.saveGame('no grant', 'bellhollow', 800, 700), true);
  assert.equal(state.getItemCount(charm), 0);
  const localData = JSON.parse(local.get(slot));
  const cloudData = cloud.get(SAVE_KEY_PROGRESS);
  for (const saved of [localData, cloudData]) {
    assert.equal(ownedCount(saved), 0);
    const result = SaveManager.sanitizeAndMigrateSaveData(saved);
    assertPreserved(result);
    assertBothEddaFlags(result);
    assert.ok(!result.flags.includes(migrated) && !result.storyFlags.includes(migrated));
  }
});

test('real local and async cloud loaders agree for ambiguous and recovered fixtures', async () => {
  mockSdk();
  const raw = affectedShape();
  for (const count of [0, 1]) {
    if (count === 1) {
      raw.storageChest.push([charm, 1]);
      raw.storyFlags.push(migrated);
    }
    seedLocal(raw);
    const syncResult = SaveManager.loadGame();
    state.reset();
    local.clear();
    cloud.set(SAVE_KEY_PROGRESS, structuredClone(raw));
    const asyncResult = await SaveManager.loadGameAsync();
    for (const result of [syncResult, asyncResult]) {
      assert.equal(ownedCount(result), count);
      assertPreserved(result);
      assertBothEddaFlags(result);
    }
    const writtenLocal = JSON.parse(local.get(slot));
    assert.equal(ownedCount(SaveManager.sanitizeAndMigrateSaveData(writtenLocal)), count);
    assert.equal(state.storageChest.get(charm) ?? 0, count);
    assert.equal(cloudReads.at(-1), SAVE_KEY_PROGRESS);
    assert.equal(SaveManager.saveGame('cloud round trip', 'bellhollow', 800, 700), true);
    assert.equal(ownedCount(cloud.get(SAVE_KEY_PROGRESS)), count);
    local.clear();
    state.reset();
    const reloaded = await SaveManager.loadGameAsync();
    assert.equal(ownedCount(reloaded), count);
    assertPreserved(reloaded);
    assertBothEddaFlags(reloaded);
    assert.equal(reloaded.storyFlags.includes(migrated), count === 1);
  }
});

test('FIX-23: cancel, first grant, repeat and reload with actual dialogue data and reward code', () => {
  const dialogue = new DialogueSystem({ events: new EventEmitter() });
  dialogue.isActive = true;
  dialogue.currentDialogueKey = 'edda_rune_guide';
  dialogue.currentPayload = dialogues.edda_rune_guide;
  dialogue.cancelDialogue();
  assert.equal(state.getItemCount(charm), 0);
  assert.ok(!state.hasFlag(grant) && !state.hasFlag(reward));

  completeDialogue('edda_rune_guide', 0);
  assert.equal(state.getItemCount(charm), 1);
  completeDialogue('edda_rune_guide', 0);
  assert.equal(state.getItemCount(charm), 1);
  assert.equal(SaveManager.saveGame('post FIX-23', 'bellhollow', 800, 700), true);
  state.reset();
  const result = SaveManager.loadGame();
  assert.equal(ownedCount(result), 1);
  assertBothEddaFlags(result);
  assert.ok(!result.flags.includes(migrated) && !result.storyFlags.includes(migrated));
  completeDialogue('edda_rune_guide', 0);
  assert.equal(state.getItemCount(charm), 1);
});

test('FIX-23 regression: Neris grants first poultice once', () => {
  completeDialogue('neris_intro', 0);
  assert.equal(state.getItemCount('item_herbal_poultice'), 1);
  completeDialogue('neris_intro', 0);
  assert.equal(state.getItemCount('item_herbal_poultice'), 1);
});
