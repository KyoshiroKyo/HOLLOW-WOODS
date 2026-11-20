/**
 * scripts/pack_source_for_gemini.mjs
 * Đóng gói mã nguồn HOLLOW WOODS V1.5 tinh gọn chuẩn AI-Readable cho Gemini:
 * 1. release/gemini_review/hollow-woods-v1.5-source-for-gemini.zip (< 2 MB)
 * 2. release/gemini_review/HOLLOW_WOODS_V1.5_FULL_CODEBASE.md (Gộp 100% code kèm TOC)
 * 3. release/p2game/hollow-woods-p2game-v1.5.0.zip (Bản chạy release hoàn chỉnh)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const GEMINI_DIR = path.join(ROOT_DIR, 'release', 'gemini_review');
const P2GAME_RELEASE_DIR = path.join(ROOT_DIR, 'release', 'p2game');

console.log('='.repeat(70));
console.log('🚀 HOLLOW WOODS V1.5 — ĐÓNG GÓI MÃ NGUỒN CHUẨN AI-READABLE CHO GEMINI');
console.log('='.repeat(70));

// Đảm bảo các thư mục đích tồn tại
fs.mkdirSync(GEMINI_DIR, { recursive: true });
fs.mkdirSync(P2GAME_RELEASE_DIR, { recursive: true });

function runPythonScript(scriptContent) {
  const tmpPy = path.join(ROOT_DIR, 'scripts', `_temp_${Date.now()}_zip.py`);
  fs.writeFileSync(tmpPy, scriptContent.trim(), 'utf8');
  try {
    execSync(`python "${tmpPy}"`, { stdio: 'inherit' });
  } finally {
    if (fs.existsSync(tmpPy)) fs.unlinkSync(tmpPy);
  }
}

// 1. Quét cây danh mục tài nguyên runtime public/assets/ (Không lấy binary)
console.log('\n--- 1. Quét cây danh mục tài nguyên runtime public/assets/ ---');
const publicAssetsDir = path.join(ROOT_DIR, 'public', 'assets');
const assetEntries = [];

function scanAssets(dir, relPath = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const rel = path.join(relPath, item).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanAssets(full, rel);
    } else {
      assetEntries.push({
        path: 'public/assets/' + rel,
        size: stat.size,
        ext: path.extname(item).toLowerCase()
      });
    }
  }
}
scanAssets(publicAssetsDir);
console.log(`✓ Đã quét ${assetEntries.length} tài nguyên runtime.`);

// Tạo bản tóm tắt danh mục tài nguyên
const assetSummary = {
  totalFiles: assetEntries.length,
  totalBytes: assetEntries.reduce((acc, cur) => acc + cur.size, 0),
  categories: {
    audio: assetEntries.filter(a => a.path.includes('/audio/')),
    maps: assetEntries.filter(a => a.path.includes('/maps/')),
    characters: assetEntries.filter(a => a.path.includes('/characters/')),
    environment: assetEntries.filter(a => a.path.includes('/environment/')),
    monsters: assetEntries.filter(a => a.path.includes('/monsters/')),
    ui: assetEntries.filter(a => a.path.includes('/ui/'))
  }
};

const assetManifestPath = path.join(GEMINI_DIR, 'ASSETS_MANIFEST.json');
fs.writeFileSync(assetManifestPath, JSON.stringify(assetSummary, null, 2), 'utf8');

// 2. Thu thập danh sách toàn bộ các file code và cấu hình cần đóng gói
console.log('\n--- 2. Thu thập danh sách tệp mã nguồn sạch (Bỏ qua .bak, node_modules, dist, Backups, binary) ---');

const codeFiles = [];

function scanCode(dir, baseRel = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    // Bỏ qua các file/folder không mong muốn
    if (
      item.endsWith('.bak') ||
      item === '.git' ||
      item === 'node_modules' ||
      item === 'dist' ||
      item === 'Backups' ||
      item === 'Pixel_Art' ||
      item === 'Sound_Effects' ||
      item === 'release' ||
      item.startsWith('_temp_')
    ) {
      continue;
    }
    const full = path.join(dir, item);
    const rel = path.join(baseRel, item).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanCode(full, rel);
    } else {
      const ext = path.extname(item).toLowerCase();
      const allowedExts = ['.ts', '.js', '.mjs', '.json', '.html', '.md', '.py', '.css', '.txt'];
      if (allowedExts.includes(ext) && !item.endsWith('.zip') && !item.endsWith('.rar')) {
        codeFiles.push({
          fullPath: full,
          relPath: rel,
          size: stat.size,
          ext: ext
        });
      }
    }
  }
}

// Quét các thư mục code
scanCode(path.join(ROOT_DIR, 'src'), 'src');
scanCode(path.join(ROOT_DIR, 'scripts'), 'scripts');
scanCode(path.join(ROOT_DIR, 'tests'), 'tests');

// Các file gốc cấu hình quan trọng
const rootConfigFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'p2game.json',
  'index.html',
  'README.md',
  '.gitignore',
  'docs/FOLDER_STRUCTURE_RULES.md'
];

for (const rel of rootConfigFiles) {
  const full = path.join(ROOT_DIR, rel);
  if (fs.existsSync(full)) {
    codeFiles.push({
      fullPath: full,
      relPath: rel.replace(/\\/g, '/'),
      size: fs.statSync(full).size,
      ext: path.extname(rel).toLowerCase()
    });
  }
}

console.log(`✓ Thu thập thành công ${codeFiles.length} file mã nguồn & tài liệu cấu hình.`);

// 3. ĐỊNH DẠNG 1: Tạo gói ZIP Mã Nguồn Sạch cho Gemini (< 2 MB)
console.log('\n--- 3. Tạo Gói ZIP Mã Nguồn Sạch cho Gemini (< 2 MB) ---');
const zipOutPath = path.join(GEMINI_DIR, 'hollow-woods-v1.5-source-for-gemini.zip');
if (fs.existsSync(zipOutPath)) fs.unlinkSync(zipOutPath);

// Chuẩn bị danh sách file để Python nén an toàn
const fileListJson = path.join(GEMINI_DIR, '_temp_files_to_zip.json');
const zipManifest = [
  ...codeFiles.map(f => ({ full: f.fullPath, arc: f.relPath })),
  { full: assetManifestPath, arc: 'ASSETS_MANIFEST.json' }
];
fs.writeFileSync(fileListJson, JSON.stringify(zipManifest, null, 2), 'utf8');

const pythonZipScript = `
import zipfile
import json
import os

list_file = r'''${fileListJson}'''
zip_out = r'''${zipOutPath}'''

with open(list_file, 'r', encoding='utf-8') as f:
    files = json.load(f)

with zipfile.ZipFile(zip_out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for item in files:
        full_p = item['full']
        arc_p = item['arc'].replace('\\\\', '/')
        if os.path.exists(full_p):
            zf.write(full_p, arc_p)

print('ZIP_OK: ' + zip_out)
`;

runPythonScript(pythonZipScript);
if (fs.existsSync(fileListJson)) fs.unlinkSync(fileListJson);

const zipStat = fs.statSync(zipOutPath);
console.log(`✅ Đã xuất gói ZIP: ${zipOutPath}`);
console.log(`📦 Dung lượng ZIP: ${(zipStat.size / 1024).toFixed(2)} KB (${(zipStat.size / (1024 * 1024)).toFixed(2)} MB)`);

// 4. ĐỊNH DẠNG 2: Tạo File Markdown Gộp Toàn Bộ Mã Nguồn (HOLLOW_WOODS_V1.5_FULL_CODEBASE.md)
console.log('\n--- 4. Tạo File Markdown Gộp Toàn Bộ Codebase cho Gemini ---');
const mdOutPath = path.join(GEMINI_DIR, 'HOLLOW_WOODS_V1.5_FULL_CODEBASE.md');
const mdStream = fs.createWriteStream(mdOutPath, { encoding: 'utf8' });

mdStream.write(`# HOLLOW WOODS V1.5 — TOÀN BỘ MÃ NGUỒN VÀ KIẾN TRÚC DỰ ÁN (FULL CODEBASE)\n\n`);
mdStream.write(`> **Dự án:** HOLLOW WOODS — The Fog That Remembers (Sương Mù Ghi Nhớ)\n`);
mdStream.write(`> **Phiên bản:** V1.5.0 (Cập nhật hoàn tất 36 bước Overhaul toàn diện)\n`);
mdStream.write(`> **Thời điểm xuất:** ${new Date().toISOString()}\n`);
mdStream.write(`> **Mục đích:** Cung cấp toàn bộ mã nguồn, cấu hình và sơ đồ cây thư mục trong 1 tài liệu duy nhất để AI Gemini đọc trọn vẹn không bỏ sót dòng code nào.\n\n`);
mdStream.write(`---\n\n`);

// 4.1. Sơ đồ cây thư mục
mdStream.write(`## 1. SƠ ĐỒ CÂY THƯ MỤC CHUẨN HOÁ DỰ ÁN\n\n\`\`\`\n`);
mdStream.write(`HOLLOW WOODS/\n`);
mdStream.write(`├── src/ (94 files TypeScript + JSON Data + Assets)\n`);
mdStream.write(`│   ├── audio/ (AudioManager.ts, Web Audio API đa tầng)\n`);
mdStream.write(`│   ├── config/ (Constants.ts, GameConfig.ts, ContentRegistry)\n`);
mdStream.write(`│   ├── data/ (dialogues.json, lore.json, quests.json, tornPagesData.ts)\n`);
mdStream.write(`│   ├── entities/ (SatyrPlayer.ts, NPCEntity.ts, TheListener.ts, TheEcho.ts, Boss)\n`);
mdStream.write(`│   ├── scenes/ (PreloadScene.ts, MainMenuScene.ts, GameScene.ts, UIScene.ts)\n`);
mdStream.write(`│   ├── services/ (CloudSaveService.ts, LeaderboardService.ts, P2GameSDK)\n`);
mdStream.write(`│   ├── state/ (PlayerState.ts Singleton)\n`);
mdStream.write(`│   ├── systems/ (SafeSpawnResolver.ts, SaveManager.ts, VeilSystem.ts, TimeSystem.ts...)\n`);
mdStream.write(`│   ├── types/ (index.ts)\n`);
mdStream.write(`│   ├── ui/ (PaperNoteModal.ts, TornPageModal.ts, CraftingModal.ts, JournalModal.ts, PauseModal.ts...)\n`);
mdStream.write(`│   └── world/ (WorldBuilder.ts, WorldGatingSystem.ts, ZoneConnectionRegistry.ts)\n`);
mdStream.write(`├── public/assets/ (17 Tiled Map JSONs, Atlas textures, audio sfx/ambience)\n`);
mdStream.write(`├── docs/ (FOLDER_STRUCTURE_RULES.md, guides/, reports/, chat_and_commands/)\n`);
mdStream.write(`├── release/ (p2game/, school-dev/, archives/, gemini_review/)\n`);
mdStream.write(`├── Backups/ (chat_history/, maps/, assets_archive/, steps/)\n`);
mdStream.write(`├── scripts/ (Kiểm thử tự động, build automation)\n`);
mdStream.write(`└── tests/ (Unit tests & regression tests)\n\`\`\`\n\n---\n\n`);

// 4.2. Mục lục tương tác
mdStream.write(`## 2. MỤC LỤC TOÀN BỘ TỆP CODEBASE\n\n`);

// Phân nhóm
const configGroup = codeFiles.filter(f => !f.relPath.startsWith('src/') && !f.relPath.startsWith('scripts/') && !f.relPath.startsWith('tests/'));
const srcGroup = codeFiles.filter(f => f.relPath.startsWith('src/')).sort((a, b) => a.relPath.localeCompare(b.relPath));
const testScriptGroup = codeFiles.filter(f => f.relPath.startsWith('scripts/') || f.relPath.startsWith('tests/')).sort((a, b) => a.relPath.localeCompare(b.relPath));

mdStream.write(`### A. Cấu Hình Gốc & Quy Chuẩn\n`);
for (const f of configGroup) {
  const anchor = f.relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  mdStream.write(`- [${f.relPath}](#${anchor}) (${(f.size / 1024).toFixed(1)} KB)\n`);
}

mdStream.write(`\n### B. Mã Nguồn Trò Chơi (src/)\n`);
for (const f of srcGroup) {
  const anchor = f.relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  mdStream.write(`- [${f.relPath}](#${anchor}) (${(f.size / 1024).toFixed(1)} KB)\n`);
}

mdStream.write(`\n### C. Kịch Bản Kiểm Thử & Tự Động Hóa (scripts/ & tests/)\n`);
for (const f of testScriptGroup) {
  const anchor = f.relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  mdStream.write(`- [${f.relPath}](#${anchor}) (${(f.size / 1024).toFixed(1)} KB)\n`);
}

mdStream.write(`\n---\n\n`);

// 4.3. Xuất chi tiết nội dung từng file
mdStream.write(`## 3. NỘI DUNG CHI TIẾT TỪNG TỆP MÃ NGUỒN\n\n`);

function appendFilesToMd(files) {
  for (const f of files) {
    const anchor = f.relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');
    mdStream.write(`\n<a id="${anchor}"></a>\n`);
    mdStream.write(`### Tệp: \`${f.relPath}\`\n\n`);
    mdStream.write(`- **Đường dẫn:** \`${f.relPath}\`\n`);
    mdStream.write(`- **Dung lượng:** ${(f.size / 1024).toFixed(2)} KB (${f.size.toLocaleString()} bytes)\n\n`);

    let lang = 'typescript';
    if (f.ext === '.json') lang = 'json';
    else if (f.ext === '.html') lang = 'html';
    else if (f.ext === '.py') lang = 'python';
    else if (f.ext === '.md') lang = 'markdown';
    else if (f.ext === '.css') lang = 'css';
    else if (f.ext === '.js' || f.ext === '.mjs') lang = 'javascript';

    try {
      const content = fs.readFileSync(f.fullPath, 'utf8');
      // Tránh việc vỡ khối backtick markdown
      const safeContent = content.replace(/```/g, '` ` `');
      mdStream.write(`\`\`\`${lang}\n${safeContent}\n\`\`\`\n\n---\n`);
    } catch (err) {
      mdStream.write(`*(Không thể đọc nội dung file: ${err.message})*\n\n---\n`);
    }
  }
}

appendFilesToMd(configGroup);
appendFilesToMd(srcGroup);
appendFilesToMd(testScriptGroup);

mdStream.end();

mdStream.on('finish', () => {
  const mdStat = fs.statSync(mdOutPath);
  console.log(`✅ Đã xuất File Markdown Gộp: ${mdOutPath}`);
  console.log(`📄 Dung lượng Markdown: ${(mdStat.size / (1024 * 1024)).toFixed(2)} MB (${mdStat.size.toLocaleString()} bytes)`);

  // 5. ĐÓNG GÓI BẢN CHẠY P2GAME V1.5 RELEASE ZIP
  const pkgVersion = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')).version || '1.5.2';
  console.log(`\n--- 5. Đóng gói bản chạy phát hành release/p2game/hollow-woods-p2game-v${pkgVersion}.zip ---`);
  const distDir = path.join(ROOT_DIR, 'dist');
  const p2gameZipOut = path.join(P2GAME_RELEASE_DIR, `hollow-woods-p2game-v${pkgVersion}.zip`);

  if (fs.existsSync(p2gameZipOut)) fs.unlinkSync(p2gameZipOut);

  // Đảm bảo p2game.json được copy vào dist
  const p2gameSrc = path.join(ROOT_DIR, 'p2game.json');
  const p2gameDist = path.join(distDir, 'p2game.json');
  if (fs.existsSync(p2gameSrc)) {
    fs.copyFileSync(p2gameSrc, p2gameDist);
  }

  const p2gamePyScript = `
import zipfile
import os

dist_dir = r'''${distDir}'''
zip_path = r'''${p2gameZipOut}'''

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(dist_dir):
        dirs.sort()
        files.sort()
        for file in files:
            full = os.path.join(root, file)
            arc = os.path.relpath(full, dist_dir).replace('\\\\', '/')
            zf.write(full, arc)

print('P2GAME_ZIP_OK: ' + zip_path)
`;

  runPythonScript(p2gamePyScript);
  const p2gameZipStat = fs.statSync(p2gameZipOut);
  console.log(`✅ Đã xuất gói P2Game: ${p2gameZipOut}`);
  console.log(`📦 Dung lượng P2Game ZIP: ${(p2gameZipStat.size / (1024 * 1024)).toFixed(2)} MB (${p2gameZipStat.size.toLocaleString()} bytes)`);

  // Đồng thời sao chép sang alias v1.5.0
  const legacyP2GameZip = path.join(P2GAME_RELEASE_DIR, 'hollow-woods-p2game-v1.5.0.zip');
  fs.copyFileSync(p2gameZipOut, legacyP2GameZip);
  console.log(`  ✔ [ALIAS] Đã đồng bộ sang: ${legacyP2GameZip}`);

  console.log('\n🎉 HOÀN TẤT ĐÓNG GÓI TOÀN BỘ CÁC GÓI MÃ NGUỒN VÀ BẢN PHÁT HÀNH V1.5!');
});
