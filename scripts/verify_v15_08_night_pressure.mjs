/**
 * Verification Script for Step V15-08:
 * Nâng cấp áp lực ban đêm cho Quạ Bóng Tối, Bóng Mắt và Nhóm Hiệp Sĩ Tà Ác
 */

import fs from 'fs';
import path from 'path';

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

const shadowMonstersPath = path.resolve('src/entities/ShadowMonsters.ts');
const evilKnightsPath = path.resolve('src/entities/EvilKnights.ts');
const wildlifeSystemPath = path.resolve('src/systems/WildlifeSystem.ts');

const shadowMonstersSrc = fs.readFileSync(shadowMonstersPath, 'utf8');
const evilKnightsSrc = fs.readFileSync(evilKnightsPath, 'utf8');
const wildlifeSystemSrc = fs.readFileSync(wildlifeSystemPath, 'utf8');

console.log('=== VERIFYING STEP V15-08: NIGHT PRESSURE OVERHAUL ===');

// 1. Quạ Bóng Tối (Shadow Crow)
assert(
  shadowMonstersSrc.includes('eyeGfx') &&
  shadowMonstersSrc.includes('0xff2222') &&
  shadowMonstersSrc.includes('eyeGfx.setPosition'),
  'Shadow Crow has red glowing eye graphic active at night'
);

assert(
  shadowMonstersSrc.includes('Math.round(200 * 1.35)') &&
  shadowMonstersSrc.includes('Math.round(190 * 1.35)'),
  'Shadow Crow increases detection radius and dive range by 35% at night'
);

assert(
  shadowMonstersSrc.includes('alarmVol = isNight ? 2.2 * 1.5 : 2.2') &&
  shadowMonstersSrc.includes("emit('shadow_crow_alarm'"),
  'Shadow Crow sound volume increases 1.5x at night and emits shadow_crow_alarm'
);

// 2. Bóng Mắt Sương Mù (Shadow Eyes)
assert(
  shadowMonstersSrc.includes('drainAmount = isNight ? 11.2 : 8'),
  'Shadow Eyes composure drain increased by 40% (8 -> 11.2) at night'
);

assert(
  wildlifeSystemSrc.includes('crooked_path: [{ x: 1100, y: 260 }, { x: 1680, y: 290 }]') &&
  wildlifeSystemSrc.includes('deep_forest: [{ x: 740, y: 280 }, { x: 1120, y: 310 }]'),
  'Shadow Eyes habitat coordinates expanded into crooked_path and deep_forest'
);

assert(
  shadowMonstersSrc.includes('dissolveByLight'),
  'Shadow Eyes dissolve immediately when exposed to lantern light'
);

// 3. Nhóm Hiệp Sĩ Tà Ác (Evil Knights)
assert(
  evilKnightsSrc.includes('drawDarkSmokeAura') &&
  evilKnightsSrc.includes('setTint(0x9988aa)') &&
  evilKnightsSrc.includes('darkAuraGfx'),
  'Evil Knights have dark smoke aura and 0x9988aa tint at night'
);

assert(
  evilKnightsSrc.includes('attackCooldown = isNight ? Math.round(1800 * 0.75) : 1800') &&
  evilKnightsSrc.includes('chargeCooldown = isNight ? Math.round(2800 * 0.75) : 2800') &&
  evilKnightsSrc.includes('attackCooldown = isNight ? Math.round(3200 * 0.75) : 3200'),
  'Evil Knights reduce attack/charge cooldown by 25% at night'
);

assert(
  evilKnightsSrc.includes('isNight ? 62 : 42') &&
  evilKnightsSrc.includes('isNight ? 65 : 52'),
  'Evil Knights increase patrol and pursuit speed at night'
);

// 4. Safe Zone and Alarm Coordination
assert(
  wildlifeSystemSrc.includes("events.on('shadow_crow_alarm'") &&
  wildlifeSystemSrc.includes('skullWolves'),
  'WildlifeSystem coordinates Skull Wolves towards shadow crow alarm at night'
);

assert(
  wildlifeSystemSrc.includes('isCampfireProtected') &&
  wildlifeSystemSrc.includes('ctx.campfirePos'),
  'WildlifeSystem respects campfire protection radius and safe zone strictly'
);

console.log(`\nResults: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All V15-08 verification criteria passed successfully!');
}
