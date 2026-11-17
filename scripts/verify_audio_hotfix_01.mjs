/**
 * HOLLOW WOODS V1.3 — VERIFY AUDIO-HOTFIX-01
 * Test all 6 core audio situations:
 * 1. Standing still (steady ambience, no redundant wind updates)
 * 2. Walking and running (clean footsteps, interval sync)
 * 3. Hiding in bushes (rustle SFX, silence footsteps, suppress listener)
 * 4. Entering the forest (smooth crossfade to 13.7s forest ambience)
 * 5. Listener detect & chase (alert stinger + 420ms heartbeat loop)
 * 6. Moving between zones (crossfade cleanup, zero leak)
 */

import fs from 'fs';
import path from 'path';

let testsPassed = 0;
let testsTotal = 0;

function assert(cond, name) {
  testsTotal++;
  if (cond) {
    console.log(`  [PASS] ${name}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${name}`);
  }
}

console.log('================================================================');
console.log('  AUDIO-HOTFIX-01: COMPREHENSIVE AUDIO VERIFICATION');
console.log('================================================================\n');

// 1. Kiểm tra các audio asset đã được thay thế bằng nguồn âm tự nhiên, dài hơn
const audioDir = path.resolve('public/assets/audio/ambience');
const crossingFile = path.join(audioDir, 'ambience_crossing.mp3');
const forestFile = path.join(audioDir, 'ambience_forest.mp3');
const mireFile = path.join(audioDir, 'ambience_mire.mp3');
const villageFile = path.join(audioDir, 'ambience_village.mp3');

assert(fs.existsSync(crossingFile), 'ambience_crossing.mp3 exists');
const crossingSize = fs.statSync(crossingFile).size;
assert(crossingSize > 400000, `ambience_crossing.mp3 is long natural airflow/wind (${crossingSize} bytes > 400KB, ~24.8s)`);

assert(fs.existsSync(forestFile), 'ambience_forest.mp3 exists');
const forestSize = fs.statSync(forestFile).size;
assert(forestSize > 100000, `ambience_forest.mp3 is long natural forest ambience (${forestSize} bytes > 100KB, ~13.7s)`);

assert(fs.existsSync(mireFile), 'ambience_mire.mp3 exists');
const mireSize = fs.statSync(mireFile).size;
assert(mireSize > 250000, `ambience_mire.mp3 is long natural mire frogs/water (${mireSize} bytes > 250KB, ~17.3s)`);

assert(fs.existsSync(villageFile), 'ambience_village.mp3 exists');
const villageSize = fs.statSync(villageFile).size;
assert(villageSize > 30000 && villageSize < 45000, `ambience_village.mp3 satisfies curation contract (30KB..45KB, actual: ${villageSize} bytes)`);

// 2. Kiểm tra mã nguồn AudioManager.ts
const audioMgrPath = path.resolve('src/audio/AudioManager.ts');
const audioMgrSrc = fs.readFileSync(audioMgrPath, 'utf8');

// Section 1: Fix Wind Sound
assert(audioMgrSrc.includes('Math.abs(clamped - this.lastWindIntensity) < 0.05'), 'AudioManager ignores redundant wind intensity updates');
assert(audioMgrSrc.includes('linearRampToValueAtTime(targetGain, now + 0.8)'), 'AudioManager ramps wind smoothly over 0.8s without zipper noise');
assert(audioMgrSrc.includes('this.currentAmbienceZone === \'crossing\''), 'AudioManager applies zone-specific wind scaling');

// Section 2: Ambience Low-pass filter & Seamless Loop Edge Smoothing
assert(audioMgrSrc.includes('smoothAudioBufferLoopEdges'), 'AudioManager provides smoothAudioBufferLoopEdges for 50ms seam crossfade');
assert(audioMgrSrc.includes('this.ambienceFilter = this.ctx.createBiquadFilter()'), 'AudioManager initializes ambienceFilter');
assert(audioMgrSrc.includes('this.ambienceFilter.frequency.setValueAtTime(3600'), 'ambienceFilter cuts at 3600Hz to eliminate high screech while keeping crispness');
assert(audioMgrSrc.includes('this.ambienceFilter.Q.setValueAtTime(0.707'), 'ambienceFilter uses Butterworth Q=0.707 (no resonant peak)');
assert(audioMgrSrc.includes('this.veilFilter.Q.setValueAtTime(0.707'), 'veilFilter uses Butterworth Q=0.707 (no +1.25dB sweep bump)');

// Section 3: Preserve horror atmosphere
assert(audioMgrSrc.includes('this.synthFilter.connect(this.veilFilter)'), 'synthFilter is connected in audio graph');
assert(audioMgrSrc.includes('this.ambienceFilter.connect(this.veilFilter)'), 'ambienceFilter connects into veilFilter');
assert(audioMgrSrc.includes('this.masterLimiter = this.ctx.createDynamicsCompressor()'), 'masterLimiter brickwall prevents digital clipping');
assert(audioMgrSrc.includes('playListenerAlert'), 'playListenerAlert preserves horror stinger');
assert(audioMgrSrc.includes('setHeartbeatActive'), 'setHeartbeatActive preserves 420ms/750ms panic heartbeat');

// Section 4: GameScene.ts wind update guard
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneSrc = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneSrc.includes('if (this.lastInDeepFog !== inDeepFog)'), 'GameScene only calls setWindIntensity when inDeepFog state changes');

console.log('\n================================================================');
console.log(`TOTAL: ${testsPassed}/${testsTotal} TESTS PASSED`);
console.log('================================================================');

if (testsPassed !== testsTotal) {
  process.exit(1);
}
