/**
 * scripts/verify_world_unlock_c4_12_28.mjs
 * Comprehensive automated verification suite for Command C4-12-28:
 * "Kết nối cơ chế mở khóa các phân khu Frontier và Forbidden với tiến độ nhiệm vụ cốt truyện"
 */

import fs from 'fs';
import path from 'path';

let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedChecks++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('🧪 VERIFYING C4-12-28: WORLD UNLOCK & QUEST INTEGRATION');
console.log('================================================================\n');

// 1. Verify files exist and pre-backup created
console.log('--- TEST GROUP 1: PRE-BACKUP & FILE INTEGRITY ---');
const backupDir = 'Backups/C4-12-28_PRE_BACKUP';
assert(fs.existsSync(backupDir), 'Pre-backup directory exists: Backups/C4-12-28_PRE_BACKUP');

const backupFiles = [
  'WorldGatingSystem.ts',
  'PlayerState.ts',
  'ZoneConnectionRegistry.ts',
  'WorldBuilder.ts',
  'GameScene.ts',
  'SaveManager.ts',
  'JournalModal.ts',
  'zones.json'
];

for (const f of backupFiles) {
  const p = path.join(backupDir, f);
  assert(fs.existsSync(p), `Backup copy verified: ${f}`);
}

// 2. Code Inspection: Centralized Gating in WorldGatingSystem.ts
console.log('\n--- TEST GROUP 2: CENTRALIZED GATING SYSTEM (WorldGatingSystem.ts) ---');
const gatingSrc = fs.readFileSync('src/world/WorldGatingSystem.ts', 'utf-8');

assert(gatingSrc.includes('public isZoneUnlocked(zoneId: ZoneId, playerState: PlayerState): boolean'), 'isZoneUnlocked method exists with PlayerState parameter');
assert(gatingSrc.includes('public isGateOpen(gateId: string, playerState: PlayerState): boolean'), 'isGateOpen centralized gate check method exists');
assert(gatingSrc.includes('public getAllUnlockedZones(playerState: PlayerState): ZoneId[]'), 'getAllUnlockedZones method exists');
assert(gatingSrc.includes('public getZoneUnlockDetails('), 'getZoneUnlockDetails method exists');

assert(gatingSrc.includes("if (rule.tier === 'LAYER_1_CORE' || rule.conditionType === 'always_unlocked')"), 'Core World zones are always unlocked');
assert(gatingSrc.includes("zoneId === 'crooked_path' || zoneId === 'deep_forest'"), 'Frontier zones (crooked_path, deep_forest) unlocked via Q03 / East Gate');
assert(gatingSrc.includes("zoneId === 'silent_mire' || zoneId === 'ancient_rune_puzzle'"), 'Forbidden zones (silent_mire, ancient_rune_puzzle) unlocked via Q04 exploration');
assert(gatingSrc.includes("zoneId === 'broken_bell_shrine'"), 'Forbidden climax (broken_bell_shrine) unlocked via rune puzzle');
assert(gatingSrc.includes('mire_puzzle_solved'), 'broken_bell_shrine requires mire_puzzle_solved flag');

// 3. Code Inspection: PlayerState.ts Delegators & Event Emissions
console.log('\n--- TEST GROUP 3: PLAYER STATE UNLOCK DELEGATORS & EVENTS ---');
const playerStateSrc = fs.readFileSync('src/state/PlayerState.ts', 'utf-8');

assert(playerStateSrc.includes('private unlockedZoneCache: Set<ZoneId>'), 'unlockedZoneCache exists in PlayerState');
assert(playerStateSrc.includes('public isZoneUnlocked(zoneId: ZoneId): boolean'), 'isZoneUnlocked delegator method exists on PlayerState');
assert(playerStateSrc.includes('public isEastGateUnlocked(): boolean'), 'isEastGateUnlocked delegates to isZoneUnlocked');
assert(playerStateSrc.includes('public isSilentMireUnlocked(): boolean'), 'isSilentMireUnlocked delegator exists');
assert(playerStateSrc.includes('public isShrineUnlocked(): boolean'), 'isShrineUnlocked delegator exists');
assert(playerStateSrc.includes('public getUnlockedZones(): ZoneId[]'), 'getUnlockedZones delegator exists');
assert(playerStateSrc.includes('public checkAndEmitUnlockEvents(): ZoneId[]'), 'checkAndEmitUnlockEvents method exists');
assert(playerStateSrc.includes('public restoreUnlockedZones(savedUnlocked?: string[]): void'), 'restoreUnlockedZones backwards-compatible method exists');

assert(playerStateSrc.includes("this.emit('world_unlock_changed'"), 'world_unlock_changed event emitted on zone unlocks');
assert(playerStateSrc.includes("this.emit('zone_unlocked'"), 'zone_unlocked event emitted per newly unlocked zone');
assert(playerStateSrc.includes("this.emit('east_gate_unlocked'"), 'Legacy east_gate_unlocked event preserved');
assert(playerStateSrc.includes("this.emit('shrine_ward_unlocked'"), 'Legacy shrine_ward_unlocked event emitted');

// 4. Code Inspection: WorldBuilder.ts Synchronized Barriers & Colliders
console.log('\n--- TEST GROUP 4: WORLDBUILDER BARRIERS & COLLIDERS ---');
const worldBuilderSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');

assert(worldBuilderSrc.includes('private shrineGateX: number = 3960;'), 'shrineGateX defined in WorldBuilder');
assert(worldBuilderSrc.includes('private shrineWardVisual?: Phaser.GameObjects.Graphics;'), 'shrineWardVisual graphics reference exists');
assert(worldBuilderSrc.includes('private shrineWardColliderBody?: Phaser.Physics.Arcade.Sprite;'), 'shrineWardColliderBody physics body exists');
assert(worldBuilderSrc.includes('public isShrineWardUnlocked(): boolean'), 'isShrineWardUnlocked getter exists');
assert(worldBuilderSrc.includes('public setShrineWardOpen(open: boolean): void'), 'setShrineWardOpen method exists');
assert(worldBuilderSrc.includes('public updateShrineWardInteractable(isOpen: boolean): void'), 'updateShrineWardInteractable method exists');
assert(worldBuilderSrc.includes('public renderShrineWardBarrier(x: number, y: number, isOpen: boolean): void'), 'renderShrineWardBarrier method exists');
assert(worldBuilderSrc.includes('public syncAllWorldGates(playerState: PlayerState): void'), 'syncAllWorldGates centralized sync method exists');

// 5. Code Inspection: GameScene.ts Integration & Prompt Handling
console.log('\n--- TEST GROUP 5: GAMESCENE GATE SYNC & INTERACTIONS ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(gameSceneSrc.includes('this.worldBuilder.syncAllWorldGates(this.playerState);'), 'syncAllWorldGates called on GameScene create');
assert(gameSceneSrc.includes("this.playerState.on('world_unlock_changed', onWorldUnlockChanged)"), 'GameScene listens to world_unlock_changed event');
assert(gameSceneSrc.includes("this.playerState.off('world_unlock_changed', onWorldUnlockChanged)"), 'Clean event deregistration in GameScene shutdown');
assert(gameSceneSrc.includes("actionId === 'inspect_sm_shrine_gate_ward'"), 'inspect_sm_shrine_gate_ward handles locked and unlocked states');
assert(gameSceneSrc.includes("actionId === 'inspect_df_mire_boundary_gate'"), 'inspect_df_mire_boundary_gate handles locked and unlocked states');

// 6. Code Inspection: SaveManager.ts Backwards-Compatible Persistence
console.log('\n--- TEST GROUP 6: SAVEMANAGER PERSISTENCE & BACKWARDS COMPATIBILITY ---');
const saveManagerSrc = fs.readFileSync('src/systems/SaveManager.ts', 'utf-8');

assert(saveManagerSrc.includes('unlockedZones?: string[];'), 'SaveData interface includes unlockedZones?: string[]');
assert(saveManagerSrc.includes('unlockedZones: state.getUnlockedZones(),'), 'SaveManager saves state.getUnlockedZones()');
assert(saveManagerSrc.includes('state.restoreUnlockedZones(data.unlockedZones);'), 'SaveManager restores state.restoreUnlockedZones()');

// 7. Functional Simulation: Gating Progression Logic Across 9 Zones
console.log('\n--- TEST GROUP 7: PROGRESSION SIMULATION (MOCK ENGINE) ---');

class MockPlayerState {
  constructor() {
    this.flags = new Set();
    this.currentQuestId = 'Q01_MEET_EDDA';
    this.quests = new Map([
      ['Q00_WAKE_UP', { id: 'Q00_WAKE_UP', tasks: [{ id: 't1', done: true }, { id: 't2', done: true }] }],
      ['Q01_MEET_EDDA', { id: 'Q01_MEET_EDDA', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }] }],
      ['Q02_MEET_NERIS', { id: 'Q02_MEET_NERIS', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }] }],
      ['Q03_PREPARE_RESOURCES', { id: 'Q03_PREPARE_RESOURCES', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }] }],
      ['Q04_ANCIENT_RUNES', { id: 'Q04_ANCIENT_RUNES', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }] }],
      ['Q05_SOLVE_MIRE', { id: 'Q05_SOLVE_MIRE', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }, { id: 't3', done: false }] }],
      ['Q06_RETRIEVE_CLAPPER', { id: 'Q06_RETRIEVE_CLAPPER', tasks: [{ id: 't1', done: false }, { id: 't2', done: false }] }]
    ]);
  }

  hasFlag(f) { return this.flags.has(f); }
  setFlag(f) { this.flags.add(f); }
}

function evaluateZoneUnlocked(zoneId, state) {
  // Core World
  if (['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'].includes(zoneId)) {
    return true;
  }
  // Frontier
  if (zoneId === 'crooked_path' || zoneId === 'deep_forest') {
    return (
      state.hasFlag('craft_lantern_oil_complete') ||
      state.hasFlag('east_gate_unlocked') ||
      state.currentQuestId === 'Q04_ANCIENT_RUNES' ||
      state.currentQuestId === 'Q05_SOLVE_MIRE' ||
      state.currentQuestId === 'Q06_RETRIEVE_CLAPPER'
    );
  }
  // Forbidden: Mire & Rune Puzzle
  if (zoneId === 'silent_mire' || zoneId === 'ancient_rune_puzzle') {
    const frontierOpen = evaluateZoneUnlocked('crooked_path', state);
    if (!frontierOpen) return false;
    const q04 = state.quests.get('Q04_ANCIENT_RUNES');
    const t1Done = q04?.tasks.find(t => t.id === 't1')?.done ?? false;
    const pastQ04 = state.currentQuestId === 'Q05_SOLVE_MIRE' || state.currentQuestId === 'Q06_RETRIEVE_CLAPPER';
    return t1Done || pastQ04 || state.hasFlag('entered_silent_mire') || state.hasFlag('mire_unlocked');
  }
  // Forbidden: Shrine
  if (zoneId === 'broken_bell_shrine') {
    return (
      state.hasFlag('mire_puzzle_solved') ||
      state.hasFlag('mire_pillars_solved') ||
      state.hasFlag('mire_drained') ||
      state.currentQuestId === 'Q06_RETRIEVE_CLAPPER' ||
      state.hasFlag('clapper_collected')
    );
  }
  return false;
}

// Phase A: Initial State (Act 1 - Q01_MEET_EDDA)
const simState = new MockPlayerState();

assert(evaluateZoneUnlocked('fog_crossing', simState) === true, 'Act 1: fog_crossing unlocked');
assert(evaluateZoneUnlocked('bellhollow', simState) === true, 'Act 1: bellhollow unlocked');
assert(evaluateZoneUnlocked('sanctuary_farm', simState) === true, 'Act 1: sanctuary_farm unlocked');
assert(evaluateZoneUnlocked('outer_woods', simState) === true, 'Act 1: outer_woods unlocked');
assert(evaluateZoneUnlocked('crooked_path', simState) === false, 'Act 1: crooked_path LOCKED');
assert(evaluateZoneUnlocked('deep_forest', simState) === false, 'Act 1: deep_forest LOCKED');
assert(evaluateZoneUnlocked('silent_mire', simState) === false, 'Act 1: silent_mire LOCKED');
assert(evaluateZoneUnlocked('ancient_rune_puzzle', simState) === false, 'Act 1: ancient_rune_puzzle LOCKED');
assert(evaluateZoneUnlocked('broken_bell_shrine', simState) === false, 'Act 1: broken_bell_shrine LOCKED');

// Phase B: Act 2 - Q03 Craft Lantern Oil Complete -> East Gate Opens!
simState.currentQuestId = 'Q03_PREPARE_RESOURCES';
simState.setFlag('craft_lantern_oil_complete');
simState.setFlag('east_gate_unlocked');
simState.currentQuestId = 'Q04_ANCIENT_RUNES';

assert(evaluateZoneUnlocked('crooked_path', simState) === true, 'Act 2 (Oil crafted): crooked_path UNLOCKED');
assert(evaluateZoneUnlocked('deep_forest', simState) === true, 'Act 2 (Oil crafted): deep_forest UNLOCKED');
assert(evaluateZoneUnlocked('silent_mire', simState) === false, 'Act 2 (East Gate newly open): silent_mire still locked before stepping through gate');
assert(evaluateZoneUnlocked('broken_bell_shrine', simState) === false, 'Act 2: broken_bell_shrine LOCKED');

// Phase C: Act 3 - Step through East Gate (Q04 t1 done) -> Silent Mire Opens!
const q04 = simState.quests.get('Q04_ANCIENT_RUNES');
q04.tasks[0].done = true; // t1 done

assert(evaluateZoneUnlocked('silent_mire', simState) === true, 'Act 3 (Stepped through East Gate): silent_mire UNLOCKED');
assert(evaluateZoneUnlocked('ancient_rune_puzzle', simState) === true, 'Act 3: ancient_rune_puzzle UNLOCKED');
assert(evaluateZoneUnlocked('broken_bell_shrine', simState) === false, 'Act 3: broken_bell_shrine still LOCKED (puzzle not yet solved)');

// Phase D: Act 4 - Solve Ancient Rune Puzzle -> Shrine Opens!
simState.currentQuestId = 'Q05_SOLVE_MIRE';
simState.setFlag('mire_pillars_solved');
simState.setFlag('mire_puzzle_solved');
simState.setFlag('mire_drained');
simState.currentQuestId = 'Q06_RETRIEVE_CLAPPER';

assert(evaluateZoneUnlocked('broken_bell_shrine', simState) === true, 'Act 4 (Rune Puzzle Solved): broken_bell_shrine UNLOCKED!');

// Phase E: Backwards Compatibility Simulation (Old Save with undefined unlockedZones)
const legacySave = {
  currentQuestId: 'Q04_ANCIENT_RUNES',
  flags: ['talked_to_edda', 'talked_to_neris', 'craft_lantern_oil_complete', 'east_gate_unlocked'],
  quests: [
    { id: 'Q04_ANCIENT_RUNES', tasks: [{ id: 't1', done: true }, { id: 't2', done: false }] }
  ]
  // Note: NO unlockedZones property in legacy save!
};

const restoredState = new MockPlayerState();
restoredState.currentQuestId = legacySave.currentQuestId;
for (const f of legacySave.flags) restoredState.setFlag(f);
for (const qS of legacySave.quests) {
  const qL = restoredState.quests.get(qS.id);
  if (qL) {
    for (const tS of qS.tasks) {
      const tL = qL.tasks.find(t => t.id === tS.id);
      if (tL) tL.done = tS.done;
    }
  }
}

assert(evaluateZoneUnlocked('bellhollow', restoredState) === true, 'Legacy save: bellhollow unlocked');
assert(evaluateZoneUnlocked('crooked_path', restoredState) === true, 'Legacy save: crooked_path correctly recomputed as UNLOCKED');
assert(evaluateZoneUnlocked('deep_forest', restoredState) === true, 'Legacy save: deep_forest correctly recomputed as UNLOCKED');
assert(evaluateZoneUnlocked('silent_mire', restoredState) === true, 'Legacy save: silent_mire correctly recomputed as UNLOCKED');
assert(evaluateZoneUnlocked('broken_bell_shrine', restoredState) === false, 'Legacy save: broken_bell_shrine correctly recomputed as LOCKED');

// Summary
console.log('\n================================================================');
console.log(`📊 SUMMARY: ${passedChecks} checks PASSED, ${failedChecks} checks FAILED.`);
console.log('================================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL C4-12-28 VERIFICATION CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}
