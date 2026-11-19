import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🧹 HOLLOW WOODS V1.5 — THỰC HIỆN BƯỚC V15-FIX-05 KHỬ TRÙNG LẶP ASSETS');
console.log('========================================================================\n');

const rootDir = process.cwd();
const backupBase = path.join(rootDir, 'Backups', 'steps', 'backup_v15_fix_05');
const dupAudioDir = path.join(backupBase, 'dup_audio');
const dupNpcsDir = path.join(backupBase, 'dup_npcs');
const dupEnvDir = path.join(backupBase, 'dup_env');

fs.mkdirSync(dupAudioDir, { recursive: true });
fs.mkdirSync(dupNpcsDir, { recursive: true });
fs.mkdirSync(dupEnvDir, { recursive: true });

let totalMovedFiles = 0;
let totalMovedBytes = 0;

function moveFile(src, dest) {
  if (!fs.existsSync(src)) return false;
  const stat = fs.statSync(src);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);
  totalMovedFiles++;
  totalMovedBytes += stat.size;
  console.log(`  ✔ [MOVED] ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)} (${(stat.size / 1024).toFixed(1)} KB)`);
  return true;
}

function moveDirectory(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  const list = fs.readdirSync(srcDir);
  for (const item of list) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      moveDirectory(srcPath, destPath);
    } else {
      moveFile(srcPath, destPath);
    }
  }
  // Xóa thư mục rỗng
  try {
    fs.rmdirSync(srcDir);
  } catch {}
}

// -----------------------------------------------------------------------------
// 1. Khử trùng lặp Âm thanh (public/assets/audio/*.mp3, *.wav)
// -----------------------------------------------------------------------------
console.log('--- 1. Di chuyển các tệp âm thanh rời trùng lặp trong public/assets/audio/ ---');
const looseAudioFiles = [
  'ambience_crossing.mp3',
  'ambience_forest.mp3',
  'ambience_mire.mp3',
  'ambience_village.mp3',
  'attack_swing.mp3',
  'bell_low.mp3',
  'bush_rustle.mp3',
  'craft_success.wav',
  'dialogue_blip.wav',
  'footstep_grass.mp3',
  'herb_gather.wav',
  'hurt.wav',
  'interact.wav',
  'lantern_toggle.mp3',
  'listener_alert.mp3',
  'monster_step.mp3',
  'player_death.wav',
  'quest_update.wav',
  'resource_gather.mp3',
  'rune_error.mp3',
  'rune_resonance.mp3'
];

for (const file of looseAudioFiles) {
  const src = path.join(rootDir, 'public', 'assets', 'audio', file);
  const dest = path.join(dupAudioDir, file);
  moveFile(src, dest);
}

// -----------------------------------------------------------------------------
// 2. Hợp nhất Sprite & Portrait NPC về 1 nguồn duy nhất (public/assets/characters/npcs/)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Di chuyển các tệp NPC & Portrait trùng lặp sang Backups/steps/backup_v15_fix_05/dup_npcs/ ---');
// 2a. Các file rời trong public/assets/characters/*.png
const looseCharFiles = [
  'edda.png',
  'garth.png',
  'neris.png',
  'npc_edda.png',
  'npc_finn.png',
  'npc_garth.png',
  'npc_neris.png',
  'portrait_edda.png',
  'portrait_finn.png',
  'portrait_garth.png',
  'portrait_neris.png'
];

for (const file of looseCharFiles) {
  const src = path.join(rootDir, 'public', 'assets', 'characters', file);
  const dest = path.join(dupNpcsDir, 'characters_loose', file);
  moveFile(src, dest);
}

// 2b. Thư mục public/assets/npcs/
const npcsOldDir = path.join(rootDir, 'public', 'assets', 'npcs');
if (fs.existsSync(npcsOldDir)) {
  moveDirectory(npcsOldDir, path.join(dupNpcsDir, 'npcs'));
}

// 2c. Thư mục public/assets/portraits/
const portraitsOldDir = path.join(rootDir, 'public', 'assets', 'portraits');
if (fs.existsSync(portraitsOldDir)) {
  moveDirectory(portraitsOldDir, path.join(dupNpcsDir, 'portraits'));
}

// 2d. Thư mục public/assets/characters/villagers/
const villagersOldDir = path.join(rootDir, 'public', 'assets', 'characters', 'villagers');
if (fs.existsSync(villagersOldDir)) {
  moveDirectory(villagersOldDir, path.join(dupNpcsDir, 'villagers'));
}

// -----------------------------------------------------------------------------
// 3. Khử trùng lặp Tài nguyên Môi trường (public/assets/environment/)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Di chuyển 26 tệp môi trường trùng lặp trong environment/sprites/ ---');
const duplicateEnvSprites = [
  'campfire_tier1.png',
  'campfire_tier2.png',
  'campfire_tier3.png',
  'campfire_unlit.png',
  'decal_autumn_leaves.png',
  'decal_fern_cluster.png',
  'decal_glowing_mushrooms.png',
  'decal_pebbles_stones.png',
  'decal_swamp_puddle.png',
  'decal_wild_grass.png',
  'prop_cauldron_tripod.png',
  'prop_chest_bronze.png',
  'prop_lantern_post.png',
  'prop_signpost_wood.png',
  'prop_wayfarer_tent.png',
  'res_dry_wood.png',
  'res_flint.png',
  'res_herbs.png',
  'res_runed_iron.png',
  'res_tree_resin.png',
  'tree_mist_pine.png',
  'tree_mossy_oak_grand.png',
  'tree_pine_med_topdown.png',
  'tree_pine_slender_topdown.png',
  'tree_weeping_willow.png',
  'tree_withered_gnarled.png'
];

for (const file of duplicateEnvSprites) {
  const src = path.join(rootDir, 'public', 'assets', 'environment', 'sprites', file);
  const dest = path.join(dupEnvDir, file);
  moveFile(src, dest);
}

console.log('\n========================================================================');
console.log(`🎉 HOÀN TẤT DI CHUYỂN: Đã khử trùng ${totalMovedFiles} tệp thừa!`);
console.log(`📦 Tổng dung lượng đã giải phóng/di chuyển: ${(totalMovedBytes / 1024 / 1024).toFixed(2)} MB (${totalMovedBytes} bytes)`);
console.log('========================================================================\n');
