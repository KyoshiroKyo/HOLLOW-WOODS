import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('  VERIFYING P2GAME PACKAGING & CONFIGURATION (C4-13-22)');
console.log('================================================================\n');

// 1. Vite config relative base
const viteConfigPath = path.join(rootDir, 'vite.config.ts');
assert(fs.existsSync(viteConfigPath), 'vite.config.ts exists');
if (fs.existsSync(viteConfigPath)) {
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  assert(content.includes("base: './'"), "vite.config.ts specifies base: './'");
}

// 2. p2game.json contract manifest
const manifestPath = path.join(rootDir, 'public', 'p2game.json');
assert(fs.existsSync(manifestPath), 'public/p2game.json exists');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.schemaVersion === 1, 'manifest.schemaVersion === 1');
  assert(manifest.id === 'hollow-woods', 'manifest.id === "hollow-woods"');
  assert(manifest.name === 'HOLLOW WOODS', 'manifest.name === "HOLLOW WOODS"');
  assert(manifest.version === '1.4.0' || manifest.version === '1.3.4' || manifest.version === '1.3.3' || manifest.version === '1.3.2' || manifest.version === '1.3.1', 'manifest.version is "1.4.0" (or earlier valid version)');
  assert(manifest.entry === 'index.html', 'manifest.entry === "index.html"');
  assert(manifest.engine === 'webgl', 'manifest.engine === "webgl"');
  assert(manifest.orientation === 'landscape', 'manifest.orientation === "landscape"');
  assert(manifest.minViewport && manifest.minViewport.width === 960 && manifest.minViewport.height === 540, 'manifest.minViewport is 960x540');
  assert(manifest.assets && manifest.assets.icon === 'store/icon.png', 'manifest.assets.icon is "store/icon.png"');
  assert(manifest.assets && manifest.assets.cover === 'store/cover.png', 'manifest.assets.cover is "store/cover.png"');
  assert(manifest.assets && Array.isArray(manifest.assets.screenshots) && manifest.assets.screenshots.length >= 3, 'manifest.assets.screenshots has >= 3 items');
  assert(manifest.controls && !!manifest.controls.keyboard, 'manifest.controls has keyboard description');
  assert(manifest.attestation && manifest.attestation.ownsRights === true, 'manifest.attestation.ownsRights is true');
}

// 3. Store assets dimensions
const storeDir = path.join(rootDir, 'public', 'store');
assert(fs.existsSync(storeDir), 'public/store directory exists');

function checkPngDimensions(filename, expectedW, expectedH) {
  const filePath = path.join(storeDir, filename);
  if (!fs.existsSync(filePath)) {
    assert(false, `${filename} exists in public/store/`);
    return;
  }
  const buffer = fs.readFileSync(filePath);
  const png = PNG.sync.read(buffer);
  assert(png.width === expectedW && png.height === expectedH, `${filename} dimensions are ${expectedW}x${expectedH} (actual: ${png.width}x${png.height})`);
}

checkPngDimensions('icon.png', 512, 512);
checkPngDimensions('cover.png', 1280, 720);
checkPngDimensions('screenshot1.png', 1280, 720);
checkPngDimensions('screenshot2.png', 1280, 720);
checkPngDimensions('screenshot3.png', 1280, 720);

// 4. Codebase CSP RT-002 and relative paths
function checkSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let hasEvalOrFunction = false;
  let hasAbsoluteAssets = false;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = checkSourceFiles(fullPath);
      if (sub.hasEvalOrFunction) hasEvalOrFunction = true;
      if (sub.hasAbsoluteAssets) hasAbsoluteAssets = true;
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      if (/\beval\(|new\s+Function\(/.test(code)) {
        console.error(`Found eval/Function in: ${fullPath}`);
        hasEvalOrFunction = true;
      }
      if (/['"]\/assets\//.test(code)) {
        console.error(`Found absolute /assets/ in: ${fullPath}`);
        hasAbsoluteAssets = true;
      }
    }
  }
  return { hasEvalOrFunction, hasAbsoluteAssets };
}

const srcCheck = checkSourceFiles(path.join(rootDir, 'src'));
assert(!srcCheck.hasEvalOrFunction, 'No eval() or new Function() in src/ (CSP RT-002 compliant)');
assert(!srcCheck.hasAbsoluteAssets, 'No absolute "/assets/" paths in src/ (relative path compliant)');

// 5. Dist folder verification
const distDir = path.join(rootDir, 'dist');
assert(fs.existsSync(distDir), 'dist/ directory exists');
if (fs.existsSync(distDir)) {
  const distIndex = path.join(distDir, 'index.html');
  assert(fs.existsSync(distIndex), 'dist/index.html exists at root of dist');
  if (fs.existsSync(distIndex)) {
    const html = fs.readFileSync(distIndex, 'utf8');
    assert(html.includes('./assets/'), 'dist/index.html references assets relatively (./assets/)');
    assert(!html.includes('src="/assets/'), 'dist/index.html does not use absolute /assets/');
  }

  const distManifest = path.join(distDir, 'p2game.json');
  assert(fs.existsSync(distManifest), 'dist/p2game.json exists at root of dist');

  const distStore = path.join(distDir, 'store');
  assert(fs.existsSync(path.join(distStore, 'icon.png')), 'dist/store/icon.png exists');
  assert(fs.existsSync(path.join(distStore, 'cover.png')), 'dist/store/cover.png exists');
  assert(fs.existsSync(path.join(distStore, 'screenshot1.png')), 'dist/store/screenshot1.png exists');
  assert(fs.existsSync(path.join(distStore, 'screenshot2.png')), 'dist/store/screenshot2.png exists');
  assert(fs.existsSync(path.join(distStore, 'screenshot3.png')), 'dist/store/screenshot3.png exists');

  // Check total dist size
  let distSize = 0;
  function getDirSize(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) getDirSize(full);
      else distSize += fs.statSync(full).size;
    }
  }
  getDirSize(distDir);
  const distSizeMB = (distSize / (1024 * 1024)).toFixed(2);
  assert(distSize < 30 * 1024 * 1024, `dist/ size is under 30 MB (actual: ${distSizeMB} MB)`);
}

// 6. Zip archive verification
const zipPath = fs.existsSync(path.join(rootDir, 'hollow-woods-p2game-v1.3.4.zip'))
  ? path.join(rootDir, 'hollow-woods-p2game-v1.3.4.zip')
  : fs.existsSync(path.join(rootDir, 'hollow-woods-p2game-v1.3.3.zip'))
  ? path.join(rootDir, 'hollow-woods-p2game-v1.3.3.zip')
  : fs.existsSync(path.join(rootDir, 'hollow-woods-p2game-v1.3.2.zip'))
  ? path.join(rootDir, 'hollow-woods-p2game-v1.3.2.zip')
  : path.join(rootDir, 'hollow-woods-p2game-v1.3.1.zip');
assert(fs.existsSync(zipPath), 'hollow-woods-p2game archive exists');
if (fs.existsSync(zipPath)) {
  const stat = fs.statSync(zipPath);
  const zipSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
  assert(stat.size < 30 * 1024 * 1024, `ZIP size is under 30 MB (actual: ${zipSizeMB} MB)`);
}

console.log('\n================================================================');
console.log(`P2GAME VERIFICATION SUMMARY:`);
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
