/**
 * Đóng gói P2Game từ manifest tại root và media đã chuẩn bị trong public/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = process.cwd();
const PUBLIC_MEDIA_DIR = path.join(ROOT_DIR, 'public', 'media');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_MEDIA_DIR = path.join(DIST_DIR, 'media');
const RELEASE_P2GAME_DIR = path.join(ROOT_DIR, 'release', 'p2game');
const RELEASE_MEDIA_DIR = path.join(RELEASE_P2GAME_DIR, 'media_v1.5');

export function readReleaseMetadata(rootDir = ROOT_DIR) {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'p2game.json'), 'utf8'));
  const { version } = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const { avatar, icon, cover, background, screenshots } = manifest.assets;
  if (!Array.isArray(screenshots)) {
    throw new Error('p2game.json: assets.screenshots must be an array');
  }
  const media = [...new Set([avatar, icon, cover, background, ...screenshots])];
  for (const asset of media) {
    if (typeof asset !== 'string' || !asset.startsWith('media/') || path.posix.normalize(asset) !== asset || asset.includes('\\')) {
      throw new Error(`p2game.json: invalid media path ${JSON.stringify(asset)}`);
    }
    const file = path.join(rootDir, 'public', asset);
    if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) {
      throw new Error(`p2game.json: missing public/${asset}`);
    }
  }
  return { manifest: { ...manifest, version: version || manifest.version }, media };
}

function prepareReleaseMetadata(manifest, media) {
  fs.mkdirSync(RELEASE_MEDIA_DIR, { recursive: true });
  for (const asset of media) {
    const destination = path.join(RELEASE_MEDIA_DIR, asset.slice('media/'.length));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(ROOT_DIR, 'public', asset), destination);
  }
  fs.writeFileSync(path.join(RELEASE_MEDIA_DIR, 'P2GAME_STORE_INFO_V1.5.txt'), [
    `${manifest.name} V${manifest.version}`,
    manifest.description,
    manifest.controls.keyboard,
    ...media,
  ].join('\n\n') + '\n', 'utf8');

  const json = JSON.stringify(manifest, null, 2) + '\n';
  for (const dir of [ROOT_DIR, path.join(ROOT_DIR, 'public'), RELEASE_P2GAME_DIR]) {
    fs.writeFileSync(path.join(dir, 'p2game.json'), json, 'utf8');
  }
}

function packageZipRelease(version) {
  console.log(`\n--- 3. Đóng gói file release/p2game/hollow-woods-p2game-v${version}.zip ---`);

  if (!fs.existsSync(DIST_DIR)) {
    console.log('Thư mục dist/ chưa tồn tại. Đang tiến hành build tự động...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Đảm bảo toàn bộ media và p2game.json đều có mặt trong dist
  fs.cpSync(PUBLIC_MEDIA_DIR, DIST_MEDIA_DIR, { recursive: true });

  const pubP2Game = path.join(ROOT_DIR, 'public', 'p2game.json');
  const distP2Game = path.join(DIST_DIR, 'p2game.json');
  if (fs.existsSync(pubP2Game)) {
    fs.copyFileSync(pubP2Game, distP2Game);
  }

  const p2gameZipOut = path.join(RELEASE_P2GAME_DIR, `hollow-woods-p2game-v${version}.zip`);
  if (fs.existsSync(p2gameZipOut)) {
    fs.unlinkSync(p2gameZipOut);
  }

  // Sử dụng Python zipfile để nén mức 9 tuyệt đối sạch
  const pyScript = `
import zipfile
import os

dist_dir = r'''${DIST_DIR}'''
zip_path = r'''${p2gameZipOut}'''

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(dist_dir):
        # V15-FIX-06: Loại bỏ thư mục thừa không cần cho runtime web release
        dirs[:] = [d for d in dirs if d not in ('maps', 'store')]
        dirs.sort()
        files.sort()
        for file in files:
            full = os.path.join(root, file)
            arc = os.path.relpath(full, dist_dir).replace('\\\\', '/')
            # Loại bỏ các file rác, file nén archive, source art và media trùng lặp
            if arc.lower().endswith(('.bak', '.tmp', '.rar', '.zip', '.7z', '.tar', '.gz', '.psd', '.aseprite', '.log')) or arc.startswith('store/') or 'screen_03_crafting_journal' in arc:
                continue
            zf.write(full, arc)

# Kiểm tra lại các file bắt buộc trong ZIP
with zipfile.ZipFile(zip_path, 'r') as zf:
    namelist = zf.namelist()
    assert 'index.html' in namelist, 'index.html missing'
    assert 'p2game.json' in namelist, 'p2game.json missing'
    import json
    assets = json.loads(zf.read('p2game.json'))['assets']
    required_media = [assets[key] for key in ('avatar', 'icon', 'cover', 'background')]
    required_media.extend(assets['screenshots'])
    for asset in required_media:
        assert asset in namelist, f'{asset} missing'
    print(f"VERIFY_OK: Total {len(namelist)} entries in ZIP.")
`;

  const tmpPy = path.join(ROOT_DIR, 'scripts', `_temp_p2game_zip_${Date.now()}.py`);
  fs.writeFileSync(tmpPy, pyScript.trim(), 'utf8');
  try {
    execSync(`python "${tmpPy}"`, { stdio: 'inherit' });
  } finally {
    if (fs.existsSync(tmpPy)) fs.unlinkSync(tmpPy);
  }

  const zipStat = fs.statSync(p2gameZipOut);
  console.log(`✅ Đã xuất gói P2Game: ${p2gameZipOut}`);
  console.log(`📦 Dung lượng P2Game ZIP: ${(zipStat.size / (1024 * 1024)).toFixed(2)} MB (${zipStat.size.toLocaleString()} bytes)`);

  // Đồng thời sao chép sang alias v1.5.0 để tương thích mọi link cũ
  const legacyZip = path.join(RELEASE_P2GAME_DIR, 'hollow-woods-p2game-v1.5.0.zip');
  if (p2gameZipOut !== legacyZip) {
    fs.copyFileSync(p2gameZipOut, legacyZip);
    console.log(`  ✔ [ALIAS] Đã đồng bộ sang: ${legacyZip}`);
  }

  console.log('\n' + '='.repeat(72));
  console.log('🎉 QUY TRÌNH POST-BUILD P2GAME HOÀN TẤT THÀNH CÔNG VƯỢT TRỘI!');
  console.log('='.repeat(72));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const { manifest, media } = readReleaseMetadata();
    prepareReleaseMetadata(manifest, media);
    packageZipRelease(manifest.version);
  } catch (error) {
    console.error('Lỗi quy trình build P2Game release:', error);
    process.exitCode = 1;
  }
}
