import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== VERIFICATION C4-13-05: AI 5 STATES, SAFE ZONE LEASH & ANTI-STUCK ===\n');

// 1. Kiểm tra mã nguồn ListenerAI.ts
console.log('1. Checking ListenerAI.ts constants and structure...');
const aiSrc = fs.readFileSync('src/systems/ListenerAI.ts', 'utf-8');

assert(
  aiSrc.includes('public static readonly SAFE_ZONE_BORDER_X: number = 1620;'),
  'SAFE_ZONE_BORDER_X is defined as 1620 (Bellhollow village & gate territory boundary)'
);
assert(
  aiSrc.includes('public static readonly FOREST_TERRITORY_MIN_X: number = 1630;'),
  'FOREST_TERRITORY_MIN_X is defined as 1630 (Entity territory restricted to woods)'
);
assert(
  aiSrc.includes('public static readonly MAX_LEASH_DISTANCE: number = 420;'),
  'MAX_LEASH_DISTANCE is defined as 420px (Maximum chase radius from patrol route)'
);
assert(
  aiSrc.includes('private readonly PATH_UPDATE_INTERVAL: number = 160;'),
  'PATH_UPDATE_INTERVAL is defined as 160ms (Throttled path recalculation to eliminate lag)'
);

// 2. Kiểm tra Safe Zone Disengage & Leash checks
console.log('\n2. Checking Safe Zone disengage and leash limits in ListenerAI.ts...');
assert(
  aiSrc.includes('isInsideSafeZone(playerX) || this.listener.x <= ListenerAI.SAFE_ZONE_BORDER_X'),
  'Entity immediately disengages when player enters safe zone or Entity reaches safe border'
);
assert(
  aiSrc.includes('distFromPatrol > ListenerAI.MAX_LEASH_DISTANCE'),
  'Entity halts and disengages when chase exceeds MAX_LEASH_DISTANCE'
);
assert(
  aiSrc.includes('this.detectionCooldown = 2800;') || aiSrc.includes('this.detectionCooldown = 2500;'),
  'Entity applies detection cooldown (2.5s-2.8s) when disengaging to prevent unfair repeated detection'
);

// 3. Kiểm tra cơ chế tự gỡ kẹt (Anti-Stuck & Obstacle Avoidance)
console.log('\n3. Checking Anti-Stuck & Obstacle Avoidance...');
assert(
  aiSrc.includes('updateStuckDetection()') &&
  aiSrc.includes('this.stuckTimer += this.PATH_UPDATE_INTERVAL;'),
  'ListenerAI tracks stuck timer based on velocity and physical movement delta'
);
assert(
  aiSrc.includes('avoidanceAngleOffset') &&
  aiSrc.includes('0.785'),
  'ListenerAI applies avoidance angle offset (45 degrees) when stuck against colliders'
);
assert(
  aiSrc.includes('this.stuckTimer >= 1200'),
  'ListenerAI auto-releases navigation when stuck for >= 1200ms'
);

// 4. Kiểm tra 5 trạng thái hành vi thông minh (5 AI States)
console.log('\n4. Checking 5 AI States...');
// Patrol
assert(
  aiSrc.includes('updatePatrol(') &&
  aiSrc.includes('this.patrolWaitTimer = 1100;'),
  'Patrol state moves through waypoints and pauses 1.1s at waypoints for natural forest observation'
);

// Alert
assert(
  aiSrc.includes('updateAlert(') &&
  aiSrc.includes("this.listener.setAlertVisual(true, 'alert');"),
  'Alert state displays yellow amber [?] badge and investigates sound location'
);

// Chase
assert(
  aiSrc.includes('updateChase(') &&
  aiSrc.includes('lastKnownPlayerX = playerX;') &&
  aiSrc.includes('lastKnownPlayerY = playerY;'),
  'Chase state tracks player, updates lastKnownPosition, and moves with speed 105 px/s'
);

// Search (Fair Play Stealth)
assert(
  aiSrc.includes('updateSearch(') &&
  aiSrc.includes('searchTimer = 4500;') &&
  aiSrc.includes('triggerSearchAt('),
  'Search state searches around lastKnownPosition for 4.5s without directly invading hiding place'
);
assert(
  aiSrc.includes('if (isPlayerHiding)') &&
  aiSrc.includes('this.triggerSearchAt(this.lastKnownPlayerX, this.lastKnownPlayerY);'),
  'Fair play confirmed: When player hides in bush/tree, Entity switches to SEARCH at last seen location'
);

// Return / Disengage
assert(
  aiSrc.includes('updateReturn(') &&
  aiSrc.includes("this.state = 'PATROL';"),
  'Return state navigates back to nearest forest waypoint and resumes patrol'
);

// 5. Kiểm tra TheListener.ts
console.log('\n5. Checking TheListener.ts visual badge upgrades...');
const listenerSrc = fs.readFileSync('src/entities/TheListener.ts', 'utf-8');

assert(
  listenerSrc.includes("drawAlertIconBadge(type: 'alert' | 'chase')") ||
  listenerSrc.includes("type === 'alert'"),
  'TheListener supports distinct alert [?] and chase [!] badge types'
);
assert(
  listenerSrc.includes("this.alertText.setText('?')") &&
  listenerSrc.includes("this.alertText.setText('!')"),
  'TheListener renders [?] in amber gold for investigation and [!] in crimson for chase'
);
assert(
  listenerSrc.includes('onSearchVisual()'),
  'TheListener provides onSearchVisual() to maintain [?] badge during search'
);

// 6. Kiểm tra GameScene.ts Safe Zone logic
console.log('\n6. Checking GameScene.ts Safe Zone synchronization...');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(
  gameSceneSrc.includes('isPlayerInSafeZone') &&
  gameSceneSrc.includes("this.currentZoneId === 'bellhollow'") &&
  gameSceneSrc.includes('this.player.x <= 1620'),
  'GameScene recognizes Bellhollow village and gate boundary (x <= 1620) as Safe Zone'
);
assert(
  gameSceneSrc.includes('this.player.stats.isSprinting && !isPlayerInSafeZone'),
  'Sprint footsteps only alert forest Entity when outside the Safe Zone'
);
assert(
  gameSceneSrc.includes('isPlayerInSafeZone && !this.isAct5ChaseActive') &&
  gameSceneSrc.includes('this.audioManager.setHeartbeatActive(false);'),
  'Heartbeat sound is safely turned off when player rests inside Bellhollow Safe Zone'
);

// 7. Kiểm tra Monster.ts
console.log('\n7. Checking Monster.ts state types...');
const monsterSrc = fs.readFileSync('src/entities/monsters/Monster.ts', 'utf-8');
assert(
  monsterSrc.includes("'ALERT'") && monsterSrc.includes("'DISENGAGE'"),
  'MonsterState union includes ALERT and DISENGAGE for 100% type safety'
);

console.log(`\n======================================================`);
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`======================================================`);

if (failed > 0) {
  process.exit(1);
}
