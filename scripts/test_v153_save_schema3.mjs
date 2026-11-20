import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// CloudSaveService has no imports or browser startup side effects.
const source = fs.readFileSync(new URL('../src/services/CloudSaveService.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
});
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64');
const { migrateSaveSchema, loadGameProgress, saveGameNow, LOCAL_PREFIX, MAX_KEY_COUNT } = await import(moduleUrl);

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
