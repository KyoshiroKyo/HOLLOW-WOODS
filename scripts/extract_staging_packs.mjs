import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const stagingDir = 'staging/env_audit';
if (!fs.existsSync('staging')) fs.mkdirSync('staging');
if (!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir, { recursive: true });

const packs = [
  { name: '01_resurrected_rpg', archive: 'Pixel_Art/Resurrected RPG 1.1.rar' },
  { name: '02_updated_trees', archive: 'Pixel_Art/Updated-Trees.zip' },
  { name: '03_forest_asset_pack', archive: 'Pixel_Art/Forest-Asset-Pack.zip' },
  { name: '04_pixel_art_top_down_basic', archive: 'Pixel_Art/Pixel Art Top Down - Basic v1.2.3.zip' },
  { name: '05_the_fantasy_tileset', archive: 'Pixel_Art/The Fan-tasy Tileset (Free) 1.5.9.zip' },
  { name: '06_shadow_series', archive: 'Pixel_Art/SHADOW Series - The Free Assets.rar' }
];

for (const p of packs) {
  const outDir = path.resolve(stagingDir, p.name);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log(`Extracting ${p.archive} -> ${outDir}...`);
  try {
    const cmd = `7z x "${p.archive}" "-o${outDir}" -y`;
    const res = execSync(cmd, { encoding: 'utf8' });
    console.log(`  [OK] Extracted ${p.name}`);
  } catch (err) {
    console.error(`  [FAIL] Failed ${p.name}:`, err.message);
  }
}
