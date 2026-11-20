import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

async function loadSaveService(qaBuild) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/services/CloudSaveService.ts', import.meta.url))],
    bundle: true,
    write: false,
    format: 'esm',
    define: { 'import.meta.env': JSON.stringify({ DEV: false, VITE_HOLLOW_WOODS_QA: qaBuild ? '1' : '0' }) }
  });
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64');
  return import(moduleUrl);
}

const { migrateSaveSchema, loadGameProgress, saveGameNow, LOCAL_PREFIX, MAX_KEY_COUNT } = await loadSaveService(false);

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value)
};

const fixture = {
  version: '1.5.0',
  saveVersion: 3,
  saveSchemaVersion: 3,
  checkpointName: 'Điểm lưu kiểm thử',
  zoneId: 'fog_crossing',
  playerPos: { x: 128, y: 195 },
  inventory: [['lore_satyr_journal', 1]],
  activeWeapon: 'wpn_iron_spear',
  villageTrustScore: 72,
  storyFlags: ['bellhollow_accord'],
  herbPlots: [{ id: 'plot_2', stage: 'planted', plantedAt: 1000, cropType: 'mushroom', isPrepared: true }]
};
const expected = JSON.parse(JSON.stringify(migrateSaveSchema(fixture)));
assert.deepEqual(JSON.parse(JSON.stringify(migrateSaveSchema(expected))), expected);
assert.equal(expected.version, '1.5.0');
assert.equal(expected.saveVersion, 3);
assert.equal(expected.saveSchemaVersion, 3);
assert.equal(expected.player.activeWeapon, fixture.activeWeapon);
assert.equal(expected.player.villageTrustScore, fixture.villageTrustScore);
assert.deepEqual(expected.player.storyFlags, fixture.storyFlags);
assert.deepEqual(expected.inventory, fixture.inventory);
assert.deepEqual(expected.herbPlots, fixture.herbPlots);
assert.ok(Object.keys(expected).length <= MAX_KEY_COUNT);
assert.equal(migrateSaveSchema({ saveVersion: '1.3' }).saveVersion, '1.3');
assert.equal(migrateSaveSchema({ version: '1.4' }).saveSchemaVersion, undefined);

assert.deepEqual(await saveGameNow({ ...fixture, version: '1.5.1' }), { ok: true, source: 'local' });
const written = JSON.parse(storage.get(LOCAL_PREFIX + 'slot_1'));
assert.equal(written.version, '1.5.1');
assert.deepEqual(JSON.parse(JSON.stringify(await loadGameProgress())), written);
assert.deepEqual(written, { ...expected, version: '1.5.1', updatedAt: written.updatedAt, timestamp: written.timestamp });
console.log('PASS schema 3 metadata, compatibility IDs, farming, and local save/load round trip');


const qa = await loadSaveService(true);
const savedNormal = new Map(storage);
const calls = [];
globalThis.window = {
  p2: {
    storage: {
      get: async (key) => calls.push(['get', key]),
      set: async (key) => calls.push(['set', key])
    },
    onBeforeUnload: () => calls.push('unload hook'),
    auth: { onChange: () => calls.push('auth hook') }
  }
};
assert.equal(await qa.loadGameProgress(), null);
assert.deepEqual(await qa.saveGameNow(fixture), { ok: true, source: 'local' });
assert.equal((await qa.loadGameProgress()).saveSchemaVersion, 3);
assert.equal(JSON.parse(storage.get('hollow_woods_qa_v1_savegame')).checkpointName, fixture.checkpointName);
await qa.saveSettings({ masterVolume: 0.21 });
assert.equal((await qa.loadSettings()).masterVolume, 0.21);
const cleanup = qa.bindCloudSaveLifecycle(() => fixture);
qa.scheduleDebouncedSave({ ...fixture, checkpointName: 'Discarded after shutdown' }, 5);
cleanup();
await new Promise((resolve) => setTimeout(resolve, 25));
assert.equal((await qa.loadGameProgress()).checkpointName, fixture.checkpointName);
for (const [key, value] of savedNormal) assert.equal(storage.get(key), value);
assert.deepEqual(calls, []);
console.log('PASS QA progress/settings namespace and cancelled pending save with zero SDK writes or reads');
