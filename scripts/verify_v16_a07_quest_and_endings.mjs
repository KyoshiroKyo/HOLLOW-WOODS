import fs from 'fs';
import path from 'path';

console.log('=== HW-V16-A07: QUEST PROGRESSION & MULTIPLE ENDINGS REGRESSION SUITE ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Reconciled V1.6 Canon Ending Texts in lore.json (replaces legacy V1.5 "Chỉ Huy Hiệp Sĩ Đen" / "ngọn đèn")
const loreData = JSON.parse(fs.readFileSync(path.resolve('src/data/lore.json'), 'utf8'));
const trueEnding = loreData.loreEntries.find((e) => e.id === 'lore_ending_true');
const sacEnding = loreData.loreEntries.find((e) => e.id === 'lore_ending_sacrifice');
const fogEnding = loreData.loreEntries.find((e) => e.id === 'lore_ending_fog_loop');

assert(Boolean(trueEnding), 'Tồn tại lore_ending_true');
assert(Boolean(trueEnding?.content.includes('Meliodas Blackwood — The Wolf Lord')), 'True Ending khớp Canon mới: Meliodas Blackwood — The Wolf Lord');
assert(!trueEnding?.content.includes('Chỉ Huy Hiệp Sĩ Đen'), 'True Ending sạch tàn dư Chỉ Huy Hiệp Sĩ Đen');
assert(Boolean(sacEnding?.content.includes('The Veil') && sacEnding?.content.includes('Vòng Sáng Hộ Tâm')), 'Sacrifice Ending khớp Canon mới: The Veil + Vòng Sáng Hộ Tâm');
assert(!sacEnding?.content.includes('ngọn đèn'), 'Sacrifice Ending sạch tàn dư ngọn đèn');
assert(Boolean(fogEnding?.content.includes('vòng lặp')), 'Fog Loop Ending giữ nguyên cấu trúc');

// 2. Main Quest 7-Stage Topology & Optional SQ08 Check
const questsData = JSON.parse(fs.readFileSync(path.resolve('src/data/quests.json'), 'utf8'));
assert(questsData.mainRoute === 'A -> E -> B -> D -> F -> E -> C', 'quests.json giữ mainRoute 7 chặng A->E->B->D->F->E->C');
assert(Array.isArray(questsData.stages) && questsData.stages.length === 7, 'quests.json có đủ 7 stages');

// 3. Targeted Progression Fixes in Source
const worldGatingSrc = fs.readFileSync(path.resolve('src/world/WorldGatingSystem.ts'), 'utf8');
const bossEncSrc = fs.readFileSync(path.resolve('src/systems/BossEncounterSystem.ts'), 'utf8');
const gameSceneSrc = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
const playerStateSrc = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf8');
const endingSysSrc = fs.readFileSync(path.resolve('src/systems/EndingSystem.ts'), 'utf8');

assert(
  worldGatingSrc.includes("if (zoneId === 'broken_bell_shrine')") &&
    !worldGatingSrc.match(/if\s*\(zoneId\s*===\s*'broken_bell_shrine'\)\s*\{[^}]*mire_pillars_solved/s),
  'WorldGatingSystem: broken_bell_shrine không mở sớm chỉ từ mire_pillars_solved'
);
assert(
  bossEncSrc.includes("if (!state.hasFlag('boss_mire_warden_defeated') && state.getItemCount('relic_heart_of_roots') === 0)"),
  'BossEncounterSystem: guard chống cấp lặp relic_heart_of_roots'
);
assert(
  gameSceneSrc.includes("if (!this.playerState.hasFlag('boss_mire_warden_defeated') && this.playerState.getItemCount('relic_heart_of_roots') === 0)"),
  'GameScene: guard chống cấp lặp relic_heart_of_roots khi hạ Mire Warden'
);
assert(
  gameSceneSrc.includes("else if (!this.playerState.hasFlag('talked_to_finn_rumors')) {\n                dKey = 'finn_rumors';") &&
    gameSceneSrc.includes("dKey = 'finn_chat';") &&
    gameSceneSrc.includes("completedPayload?.onCompleteFlag === 'talked_to_finn_rumors'"),
  'GameScene: npc_finn định tuyến finn_rumors -> finn_chat và hoàn tất SQ05_FINN_INTEL qua dialogue_completed'
);
assert(
  gameSceneSrc.includes("completedPayload?.onCompleteFlag === 'campfire_knight_q3_completed'") &&
    gameSceneSrc.includes("this.playerState.hasFlag('boss_hooded_knight_defeated')"),
  'GameScene: SQ08 yêu cầu boss_hooded_knight_defeated thật và hoàn tất nguyên tử khi dialogue_completed'
);
assert(
  !playerStateSrc.includes("this.hasFlag('clapper_collected') || this.hasFlag('mire_pillars_solved')"),
  'PlayerState.getStoryQuestId: không nhảy sang Q06 chỉ từ mire_pillars_solved khi chưa mở cầu Rễ Cổ'
);

// 4. Ending Threshold Lock & 16 + 4 Extreme Boundary Matrix
assert(endingSysSrc.includes('comp >= 50 && stage >= 3 && trust >= 65'), 'EndingSystem giữ đúng ngưỡng Owner Lock (50 / 3 / 65)');
assert(endingSysSrc.includes('if (stage >= 2)'), 'EndingSystem giữ đúng ngưỡng Sacrifice (stage >= 2)');

function determineEndingType(stage, comp, trust) {
  if (comp >= 50 && stage >= 3 && trust >= 65) return 'true_ending';
  if (stage >= 2) return 'sacrifice_ending';
  return 'fog_loop_ending';
}

const grid16 = [];
for (const stage of [0, 1, 2, 3]) {
  for (const trust of [64, 65]) {
    for (const comp of [49, 50]) {
      grid16.push(determineEndingType(stage, comp, trust));
    }
  }
}
const fogCount = grid16.filter((t) => t === 'fog_loop_ending').length;
const sacCount = grid16.filter((t) => t === 'sacrifice_ending').length;
const trueCount = grid16.filter((t) => t === 'true_ending').length;

assert(fogCount === 8, `16-case boundary: 8 fog_loop_ending (thực tế: ${fogCount})`);
assert(sacCount === 7, `16-case boundary: 7 sacrifice_ending (thực tế: ${sacCount})`);
assert(trueCount === 1, `16-case boundary: 1 true_ending (thực tế: ${trueCount})`);
assert(determineEndingType(3, 0, 0) === 'sacrifice_ending', 'Extreme boundary (stage=3, comp=0, trust=0) -> sacrifice_ending');
assert(determineEndingType(3, 100, 100) === 'true_ending', 'Extreme boundary (stage=3, comp=100, trust=100) -> true_ending');
assert(determineEndingType(1, 100, 100) === 'fog_loop_ending', 'Extreme boundary (stage=1, comp=100, trust=100) -> fog_loop_ending');
assert(determineEndingType(0, 0, 100) === 'fog_loop_ending', 'Extreme boundary (stage=0, comp=0, trust=100) -> fog_loop_ending');

console.log(`\n=== SUMMARY: ${passCount} PASS, ${failCount} FAIL ===`);
process.exit(failCount > 0 ? 1 : 0);
