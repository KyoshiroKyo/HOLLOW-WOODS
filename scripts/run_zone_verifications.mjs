import { execSync } from 'child_process';

const testScripts = [
  'scripts/verify_outer_woods_c4_12_20.mjs',
  'scripts/verify_silent_mire_c4_12_23.mjs',
  'scripts/verify_rune_puzzle_c4_12_24.mjs',
  'scripts/verify_v14_p8_08_skull_wolf.mjs',
  'scripts/verify_v14_p8_09_shadow_monsters.mjs',
  'scripts/verify_v14_p8_10_evil_knights.mjs',
  'scripts/verify_v14_p8_11_deep_forest_visibility.mjs',
  'scripts/verify_v14_p8_12_menu_hud_redesign.mjs',
  'scripts/verify_v14_p8_13_detour_path.mjs',
  'scripts/verify_v14_p8_14a_campfire_knight.mjs',
  'scripts/verify_v14_p8_14b_campfire_knight_sanctuary.mjs',
  'scripts/verify_v14_p8_14c_campfire_knight_quests.mjs',
  'scripts/verify_v14_p8_15a_memory_awakening.mjs',
  'scripts/verify_v14_p8_15b_black_knight_awakening.mjs'
];

console.log('=== CHẠY KIỂM ĐỊNH HỆ THỐNG CÁC PHÂN KHU & TÍNH NĂNG V1.4 ===\n');

let passed = 0;
let failed = 0;

for (const script of testScripts) {
  try {
    const res = execSync(`node ${script}`, { stdio: 'pipe' }).toString();
    console.log(`[PASS] ${script}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${script}`);
    console.error(err.stdout?.toString() || err.message);
    failed++;
  }
}

console.log(`\nTổng kết: ${passed}/${testScripts.length} bộ kiểm thử đạt. Thất bại: ${failed}`);
