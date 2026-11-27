import assert from 'node:assert/strict';
import { build } from 'esbuild';

const output = await build({
  entryPoints: ['src/systems/SafeSpawnResolver.ts'],
  write: false, bundle: true, format: 'esm', platform: 'node'
});
const url = 'data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64');
const { SafeSpawnResolver } = await import(url);
const bounds = { x: 480, y: -800, width: 960, height: 440 };
const scene = {
  worldBuilder: {
    getZone: zone => zone === 'whispering_grove_sanctum' ? { bounds } : undefined,
    colliderGroup: { getChildren: () => colliders }
  }
};
const zone = 'whispering_grove_sanctum';
let colliders = [];

assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, 1020, -600, zone).adjusted, false);
assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, 1600, -420, zone).x, 1440);
assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, 2000, -420, zone).x, 960);
assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, NaN, Infinity, zone).x, 960);
assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, 1000, -600, 'unknown'), null);

colliders = [{ body: { enable: true, x: 400, y: -900, width: 1200, height: 700 } }];
assert.equal(SafeSpawnResolver.resolveSafeSpawn(scene, 1020, -600, zone), null);
console.log('WORLD-02 resolver 6/6 PASS');
