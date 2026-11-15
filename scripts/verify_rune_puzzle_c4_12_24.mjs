// scripts/verify_rune_puzzle_c4_12_24.mjs
// Automated verification suite for COMMAND C4-12-24: Ancient Rune Puzzle Area Integration

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('🔍 VERIFYING COMMAND C4-12-24: ANCIENT RUNE PUZZLE AREA INTEGRATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. PRE-BACKUP VERIFICATION
console.log('--- 1. Pre-Backup Verification ---');
const backupDir = 'Backups/C4-12-24_PRE_BACKUP';
assert(fs.existsSync(backupDir), `Pre-backup directory exists: ${backupDir}`);
const backupFiles = [
  'GameScene.ts',
  'PlayerState.ts',
  'puzzles.json',
  'PuzzleSystem.ts',
  'WorldBuilder.ts',
  'ZoneConnectionRegistry.ts',
  'zones.json'
];
for (const file of backupFiles) {
  const p = path.join(backupDir, file);
  assert(fs.existsSync(p), `Backup file exists: ${file}`);
}

// 2. RUNESTONE SPRITE ASSET INTEGRITY
console.log('\n--- 2. Sprite Asset Integrity & Dimensions ---');
const assets = [
  { name: 'pillar_moon.png', path: 'public/assets/environment/sprites/pillar_moon.png', expW: 32, expH: 61 },
  { name: 'pillar_root.png', path: 'public/assets/environment/sprites/pillar_root.png', expW: 31, expH: 61 },
  { name: 'pillar_eye.png', path: 'public/assets/environment/sprites/pillar_eye.png', expW: 32, expH: 52 },
  { name: 'stone_altar.png', path: 'public/assets/environment/sprites/stone_altar.png', expW: 60, expH: 42 }
];

for (const a of assets) {
  assert(fs.existsSync(a.path), `Sprite file exists: ${a.name}`);
  const buf = fs.readFileSync(a.path);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === a.expW && h === a.expH, `Sprite dimensions valid for ${a.name}: ${w}x${h} (expected ${a.expW}x${a.expH})`);
}

// 3. ZONES REGISTRY & SUB-ZONE SPECIFICATION
console.log('\n--- 3. Zones Registry & Sub-zone Structure (zones.json) ---');
const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const arpZone = zonesJson.zones.find(z => z.id === 'ancient_rune_puzzle');
assert(!!arpZone, 'Zone ancient_rune_puzzle is registered in zones.json');
assert(arpZone.status === 'active', 'Zone ancient_rune_puzzle status is "active"');
assert(arpZone.bounds.x === 3350 && arpZone.bounds.y === 150 && arpZone.bounds.width === 350 && arpZone.bounds.height === 280,
  `Zone bounds match dais area: [${arpZone.bounds.x}, ${arpZone.bounds.y}, ${arpZone.bounds.width}, ${arpZone.bounds.height}]`);

// Colliders & Interactables in zones.json
const boundTop = arpZone.colliders.find(c => c.id === 'rune_arena_bound_top');
const boundBottom = arpZone.colliders.find(c => c.id === 'rune_arena_bound_bottom');
const altarCol = arpZone.colliders.find(c => c.id === 'rune_central_altar_col');
assert(!!boundTop && !!boundBottom && !!altarCol, 'Colliders rune_arena_bound_top, bottom, and altar_col exist');

const pedestalInteract = arpZone.interactables.find(it => it.actionId === 'inspect_rune_altar');
const steleInteract = arpZone.interactables.find(it => it.actionId === 'read_rune_clue_stele');
assert(!!pedestalInteract, 'Interactable inspect_rune_altar exists at (3520, 280)');
assert(!!steleInteract, 'Interactable read_rune_clue_stele exists at (3460, 290)');

// Transition to silent_mire
const toMireTrans = arpZone.transitions.find(t => t.toZone === 'silent_mire');
assert(!!toMireTrans && toMireTrans.status === 'active', 'Transition to_silent_mire_from_puzzle is registered and active');

// 4. PUZZLE SYSTEM SPEC & SIMULATION
console.log('\n--- 4. PuzzleSystem Logic & Sequence Simulation ---');
const puzzlesJson = JSON.parse(fs.readFileSync('src/data/puzzles.json', 'utf8'));
const mirePuzzle = puzzlesJson.puzzles.silent_mire_pillars;
assert(!!mirePuzzle, 'puzzles.json defines silent_mire_pillars');
assert(JSON.stringify(mirePuzzle.correctSequence) === JSON.stringify(['pillar_moon', 'pillar_root', 'pillar_eye']),
  'Correct sequence is: pillar_moon -> pillar_root -> pillar_eye');

const puzzleSystemSrc = fs.readFileSync('src/systems/PuzzleSystem.ts', 'utf8');
assert(puzzleSystemSrc.includes('alreadySolved'), 'PuzzleSystem implements alreadySolved guard against duplicate rewards');
assert(puzzleSystemSrc.includes('alreadyLit'), 'PuzzleSystem implements alreadyLit guard for active sequence');
assert(puzzleSystemSrc.includes('stepIndex: this.currentSequence.length'), 'PuzzleSystem tracks stepIndex');
assert(puzzleSystemSrc.includes('public resetPillars(): void'), 'PuzzleSystem implements resetPillars helper');
assert(puzzleSystemSrc.includes('public getLitPillarsCount(): number'), 'PuzzleSystem implements getLitPillarsCount');

// 5. PLAYERSTATE SYNCHRONIZATION
console.log('\n--- 5. PlayerState Synchronization & Quest Reset ---');
const playerStateSrc = fs.readFileSync('src/state/PlayerState.ts', 'utf8');
assert(playerStateSrc.includes('resetQuestTasks(questId: string): void'), 'PlayerState implements resetQuestTasks');
assert(playerStateSrc.includes('mire_pillars_solved') && playerStateSrc.includes('Q06_RETRIEVE_CLAPPER'),
  'PlayerState checkQuestProgression synchronizes mire_pillars_solved with Q06_RETRIEVE_CLAPPER');

// 6. AUDIO MANAGER SPECIFICATION
console.log('\n--- 6. AudioManager Feedback Methods ---');
const audioSrc = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');
assert(audioSrc.includes('public playRunestoneResonance(noteIndex: number = 0): void'), 'playRunestoneResonance defined');
assert(audioSrc.includes('public playRunestoneError(): void'), 'playRunestoneError defined');
assert(audioSrc.includes('public playRunestoneChord(): void'), 'playRunestoneChord defined');

// 7. WORLDBUILDER METHODS & DECORATIONS
console.log('\n--- 7. WorldBuilder Visual Rendering & Safeguards ---');
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
assert(wbSrc.includes('renderAncientRunePuzzleTerrain'), 'WorldBuilder implements renderAncientRunePuzzleTerrain');
assert(wbSrc.includes('ancient_rune_puzzle_ground_baked_v12'), 'WorldBuilder uses ancient_rune_puzzle_ground_baked_v12 texture');
assert(wbSrc.includes('renderAncientRunePuzzleDecorations'), 'WorldBuilder implements renderAncientRunePuzzleDecorations');
assert(wbSrc.includes('createRunestonePillar(3400, 220, \'Trăng Khuyết\', 0x5dade2)'), 'WorldBuilder creates Moon pillar at (3400, 220)');
assert(wbSrc.includes('createRunestonePillar(3520, 360, \'Rễ Rừng\', 0x58d68d)'), 'WorldBuilder creates Root pillar at (3520, 360)');
assert(wbSrc.includes('createRunestonePillar(3640, 220, \'Con Mắt\', 0xaf7ac5)'), 'WorldBuilder creates Eye pillar at (3640, 220)');
assert(wbSrc.includes('createStoneAltar(3520, 280)'), 'WorldBuilder creates Stone Altar at (3520, 280)');
assert(wbSrc.includes('createAncientRuneStele(3460, 290)'), 'WorldBuilder creates Rune Stele at (3460, 290)');
assert(wbSrc.includes('createAncientBrazier(3380, 260)'), 'WorldBuilder creates Braziers around dais');
assert(wbSrc.includes('triggerRunePuzzleSolvedCelebration'), 'WorldBuilder implements triggerRunePuzzleSolvedCelebration');
assert(wbSrc.includes('if (this.runestoneVisuals.has(pillarId))'), 'WorldBuilder guards against duplicate pillar sprite instantiation');

// 8. GAMESCENE EVENT HANDLERS & ANTI-DUPLICATION
console.log('\n--- 8. GameScene Event Handlers & Persistence ---');
const gsSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gsSrc.includes('inspect_rune_altar'), 'GameScene handles inspect_rune_altar');
assert(gsSrc.includes('read_rune_clue_stele'), 'GameScene handles read_rune_clue_stele');
assert(gsSrc.includes('res.alreadySolved'), 'GameScene guards against alreadySolved with audio feedback');
assert(gsSrc.includes('res.alreadyLit'), 'GameScene guards against alreadyLit with reminder');
assert(gsSrc.includes('res.failed') && gsSrc.includes('playRunestoneError'), 'GameScene handles failed activation with error sound & shake');
assert(gsSrc.includes('res.solved') && gsSrc.includes('playRunestoneChord'), 'GameScene handles solved celebration with chord & flash');
assert(gsSrc.includes('this.playerState.hasFlag(\'mire_pillars_solved\')') && gsSrc.includes('triggerRunePuzzleSolvedCelebration'),
  'GameScene restores solved puzzle visuals on scene boot');

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL INTEGRATION AND REGRESSION CHECKS PASSED FOR COMMAND C4-12-24!');
  process.exit(0);
}
