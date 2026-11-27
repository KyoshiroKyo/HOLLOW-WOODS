#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const FORBIDDEN_EXTENSIONS = new Set(['.rar', '.zip', '.7z', '.tar', '.gz', '.bak', '.tmp', '.psd', '.aseprite']);

const errors = [];
const warnings = [];
const checks = [];

function check(cond, name, detail = '') {
  checks.push({ name, passed: Boolean(cond), detail });
  if (!cond) errors.push(`${name}: ${detail}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const rootManifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'p2game.json'), 'utf8'));
const pubManifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'p2game.json'), 'utf8'));

check(pkg.version === '1.5.5', 'package.json baseline version is 1.5.5', `got ${pkg.version}`);
check(rootManifest.version === pkg.version, 'root p2game.json version matches package.json', `${rootManifest.version} vs ${pkg.version}`);
check(pubManifest.version === pkg.version, 'public/p2game.json version matches package.json', `${pubManifest.version} vs ${pkg.version}`);
check(rootManifest.schemaVersion === 1 && rootManifest.id === 'hollow-woods', 'p2game.json identity metadata valid');
check(rootManifest.entry === 'index.html' && rootManifest.sdk?.version === '1.1', 'p2game.json entry & sdk valid');

const mediaRefs = [
  rootManifest.assets?.avatar,
  rootManifest.assets?.icon,
  rootManifest.assets?.cover,
  rootManifest.assets?.background,
  ...(rootManifest.assets?.screenshots || []),
].filter(Boolean);

for (const rel of mediaRefs) {
  check(!rel.startsWith('/') && fs.existsSync(path.join(PUBLIC_DIR, rel)), `public media exists: ${rel}`);
}

check(fs.existsSync(path.join(DIST_DIR, 'index.html')), 'dist/index.html exists');
if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  const html = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  check(!/src="\/(?!\/)|href="\/(?!\/)/i.test(html), 'dist/index.html uses strictly relative URLs');
  check(!html.includes('window.top') && !html.includes('serviceWorker') && !html.includes('<form'), 'dist/index.html obeys P2Game sandbox rules');
  check(html.includes('./startup-status.js') && fs.existsSync(path.join(DIST_DIR, 'startup-status.js')), 'dist/startup-status.js present and relative');
}

check(fs.existsSync(path.join(DIST_DIR, 'p2game.json')), 'dist/p2game.json exists');

let distCount = 0;
let distBytes = 0;
const forbiddenFound = [];
const jsChunks = {};

function walkDist(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDist(full);
    } else {
      distCount++;
      const size = fs.statSync(full).size;
      distBytes += size;
      const ext = path.extname(entry.name).toLowerCase();
      const rel = path.relative(DIST_DIR, full).replace(/\\/g, '/');
      if (FORBIDDEN_EXTENSIONS.has(ext)) {
        forbiddenFound.push(rel);
      }
      if (ext === '.js') {
        jsChunks[rel] = size;
      }
    }
  }
}

walkDist(DIST_DIR);
check(forbiddenFound.length === 0, 'Zero forbidden archives/backups in dist/', forbiddenFound.join(', '));
check(fs.existsSync(path.join(DIST_DIR, 'assets', 'ui', 'fonts', 'hollow-woods-ui-regular.woff')), 'UI font regular.woff bundled in dist/');
check(fs.existsSync(path.join(DIST_DIR, 'assets', 'ui', 'fonts', 'hollow-woods-ui-bold.woff')), 'UI font bold.woff bundled in dist/');

// Check unreferenced legacy media in public/media as warning (non-blocking if preserved as historical)
const pubMediaDir = path.join(PUBLIC_DIR, 'media');
const refSet = new Set(mediaRefs.map(r => r.replace(/^media\//, '')));
if (fs.existsSync(pubMediaDir)) {
  const unreferenced = fs.readdirSync(pubMediaDir).filter(f => !refSet.has(f));
  if (unreferenced.length > 0) {
    warnings.push(`Unreferenced legacy files in public/media/ (${unreferenced.length}): ${unreferenced.join(', ')}`);
  }
}

const report = {
  passed: errors.length === 0,
  checksPassed: checks.filter(c => c.passed).length,
  checksTotal: checks.length,
  errors,
  warnings,
  distSummary: {
    fileCount: distCount,
    totalBytes: distBytes,
    totalMB: Number((distBytes / (1024 * 1024)).toFixed(2)),
    jsChunks,
  },
  checks,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length > 0) process.exit(1);
