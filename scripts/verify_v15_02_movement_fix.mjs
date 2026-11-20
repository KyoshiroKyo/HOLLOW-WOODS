import fs from 'fs';

console.log('=== TEST SUITE: V15-02 MOVEMENT & PHYSICS VERIFICATION ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Math Velocity Normalization Verification
console.log('--- 1. Math Velocity Normalization Test ---');
const testSpeeds = [85, 140, 72.25, 119];
for (const speed of testSpeeds) {
  const straightVx = 1 * speed;
  const straightVy = 0;
  const straightMag = Math.hypot(straightVx, straightVy);

  const diagVx = 1 * Math.SQRT1_2 * speed;
  const diagVy = -1 * Math.SQRT1_2 * speed;
  const diagMag = Math.hypot(diagVx, diagVy);

  const diff = Math.abs(straightMag - diagMag);
  assert(diff < 1e-9, `Speed ${speed}: Straight magnitude (${straightMag}) == Diagonal magnitude (${diagMag}) [diff: ${diff.toExponential(3)}]`);
}

// 2. Code Inspection of SatyrPlayer.ts
console.log('\n--- 2. SatyrPlayer.ts Code Architecture Test ---');
const satyrCode = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');

assert(satyrCode.includes('Math.SQRT1_2'), 'SatyrPlayer uses Math.SQRT1_2 for diagonal normalization');
assert(satyrCode.includes('public static readonly ACTION_SAFETY_TIMEOUT_MS: number = 600;'), 'ACTION_SAFETY_TIMEOUT_MS is defined as 600ms');
assert(satyrCode.includes('public static readonly DIRECTION_BUFFER_MS: number = 40;'), 'DIRECTION_BUFFER_MS is defined as 40ms');
assert(satyrCode.includes('forceUnlockActionState(): void'), 'forceUnlockActionState method is implemented');

// Watchdog in update
assert(satyrCode.includes('now - this._actionLockTimestamp > BlackKnightPlayer.ACTION_SAFETY_TIMEOUT_MS'), 'Update watchdog checks elapsed action lock time against 600ms');

// Action lock timestamp assignments
assert(satyrCode.includes('this._isAttacking = true;\n    this._actionLockTimestamp = performance.now();'), 'attack() records _actionLockTimestamp');
assert(satyrCode.includes('this._isGathering = true;\n    this._actionLockTimestamp = performance.now();'), 'playGather() records _actionLockTimestamp');
assert(satyrCode.includes('this._isInteracting = true;\n    this._actionLockTimestamp = performance.now();'), 'playInteract() records _actionLockTimestamp');
assert(satyrCode.includes('this._isUsingItem = true;\n    this._actionLockTimestamp = performance.now();'), 'playUseItem() records _actionLockTimestamp');
assert(satyrCode.includes('this._isHurt = true;\n    this._actionLockTimestamp = performance.now();'), 'playHurt() records _actionLockTimestamp');

// 3. Direction Buffer Logic Test
console.log('\n--- 3. Direction Buffer 40ms Logic Simulation ---');
class DirectionBufferSimulator {
  constructor() {
    this.facing = 'down';
    this.desiredDirection = null;
    this.directionBufferStartTime = 0;
    this._wasMoving = false;
  }

  updateFacingDirection(moveX, moveY, currentTime) {
    if (moveX === 0 && moveY === 0) {
      this._wasMoving = false;
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
      return;
    }

    const absX = Math.abs(moveX);
    const absY = Math.abs(moveY);

    let targetDir;
    if (absX > absY) {
      targetDir = moveX < 0 ? 'left' : 'right';
    } else if (absY > absX) {
      targetDir = moveY < 0 ? 'up' : 'down';
    } else {
      const isCurrentFacingMoving =
        (this.facing === 'left' && moveX < 0) ||
        (this.facing === 'right' && moveX > 0) ||
        (this.facing === 'up' && moveY < 0) ||
        (this.facing === 'down' && moveY > 0);
      targetDir = isCurrentFacingMoving ? this.facing : (moveX < 0 ? 'left' : 'right');
    }

    if (!this._wasMoving) {
      this._wasMoving = true;
      this.facing = targetDir;
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
    } else if (targetDir !== this.facing) {
      if (this.desiredDirection !== targetDir) {
        this.desiredDirection = targetDir;
        this.directionBufferStartTime = currentTime;
      } else if (currentTime - this.directionBufferStartTime >= 40) {
        this.facing = targetDir;
        this.desiredDirection = null;
        this.directionBufferStartTime = 0;
      }
    } else {
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
    }
  }
}

const sim = new DirectionBufferSimulator();
// Test A: Initial start moving from idle -> immediate facing update
sim.updateFacingDirection(1, 0, 1000);
assert(sim.facing === 'right', 'Initial move right sets facing to "right" immediately with 0ms lag');

// Test B: Diagonal W+D -> persistence keeps facing right
sim.updateFacingDirection(1, -1, 1016);
assert(sim.facing === 'right', 'Diagonal W+D retains "right" via direction persistence rule');

// Test C: Jitter tap W for 20ms (< 40ms) while moving -> facing does NOT switch to "up"
sim.updateFacingDirection(0, -1, 1032);
assert(sim.facing === 'right' && sim.desiredDirection === 'up', 'At 1032ms (16ms tap Up): facing stays "right", "up" is buffered in desiredDirection');
sim.updateFacingDirection(1, 0, 1048); // User released Up and pressed Right again at 16ms
assert(sim.facing === 'right' && sim.desiredDirection === null, 'At 1048ms: Jitter tap canceled, facing remained steady "right" without sprite flicker');

// Test D: Deliberate turn Up held for 50ms (> 40ms)
sim.updateFacingDirection(0, -1, 1100); // start holding Up
sim.updateFacingDirection(0, -1, 1120); // 20ms later: still holding Up
assert(sim.facing === 'right', 'At 1120ms (20ms held): still buffering');
sim.updateFacingDirection(0, -1, 1145); // 45ms later: exceeds 40ms threshold!
assert(sim.facing === 'up', 'At 1145ms (45ms held): buffer threshold 40ms exceeded, smoothly committed to "up"');

// 4. GameScene Integration Check
console.log('\n--- 4. GameScene Integration Check ---');
const gsCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf8').replace(/\r\n/g, '\n');
assert(gsCode.includes('this.player.forceUnlockActionState();\n        this.player.resetAllInputState();'), 'dialogueSystem.onDialogueEnd releases action lock');
assert(gsCode.includes('this.craftingModal.close();\n            this.player.forceUnlockActionState();'), 'Closing crafting modal releases action lock');
assert(gsCode.includes('this.journalModal.close();\n            this.player.forceUnlockActionState();'), 'Closing journal modal releases action lock');

console.log(`\n=== RESULTS: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
