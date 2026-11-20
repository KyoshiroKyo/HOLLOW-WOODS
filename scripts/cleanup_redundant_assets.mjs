import fs from 'fs';
import path from 'path';

const backupBase = 'Backups/steps/backup_v152_09/redundant_assets';
fs.mkdirSync(`${backupBase}/environment_sprites`, { recursive: true });
fs.mkdirSync(`${backupBase}/v14_trees`, { recursive: true });
fs.mkdirSync(`${backupBase}/characters_satyr`, { recursive: true });
fs.mkdirSync(`${backupBase}/environment_trees`, { recursive: true });

function moveFile(src, destDir) {
  if (fs.existsSync(src)) {
    const fileName = path.basename(src);
    const dest = path.join(destDir, fileName);
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
    console.log(`[MOVED] ${src} -> ${dest}`);
  }
}

// 1. Dời 21 PNG trong environment/sprites/ đã có trong Atlas (giữ fog_smooth.png)
const spritesDir = 'public/assets/environment/sprites';
if (fs.existsSync(spritesDir)) {
  const files = fs.readdirSync(spritesDir);
  for (const file of files) {
    if (file !== 'fog_smooth.png' && file.endsWith('.png')) {
      moveFile(path.join(spritesDir, file), `${backupBase}/environment_sprites`);
    }
  }
}

// 2. Dời các file trong environment/v14/trees/ (đã có trong Atlas)
const v14TreesDir = 'public/assets/environment/v14/trees';
if (fs.existsSync(v14TreesDir)) {
  const files = fs.readdirSync(v14TreesDir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      moveFile(path.join(v14TreesDir, file), `${backupBase}/v14_trees`);
    }
  }
  // Xóa thư mục rỗng nếu không còn file
  try { fs.rmdirSync(v14TreesDir); } catch {}
}

// 3. Hợp nhất cặp cây trùng: dời tree_pine_tall_topdown.png
moveFile('public/assets/environment/trees/tree_pine_tall_topdown.png', `${backupBase}/environment_trees`);

// 4. Dọn sprite thế hệ cũ satyr_sheet.png (giữ satyr_portrait.png)
moveFile('public/assets/characters/satyr/satyr_sheet.png', `${backupBase}/characters_satyr`);

console.log('\n>>> ĐÃ HOÀN TẤT DI CHUYỂN TOÀN BỘ ASSETS TRÙNG LẶP VÀO BACKUP! <<<');
