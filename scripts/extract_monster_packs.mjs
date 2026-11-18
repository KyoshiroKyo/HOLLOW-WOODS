import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const stagingMonsterDir = path.resolve('staging/monster_audit');

if (!fs.existsSync(stagingMonsterDir)) {
  fs.mkdirSync(stagingMonsterDir, { recursive: true });
}

const archives = [
  {
    name: '01_nexus_starter',
    archivePath: path.resolve('Pixel_Art/N3XUS-Starter-FREE-v1.1.zip'),
    targetDir: path.join(stagingMonsterDir, '01_nexus_starter')
  },
  {
    name: '02_goblin_scout',
    archivePath: path.resolve('Pixel_Art/goblin_scout_v5_silhouette_free.zip'),
    targetDir: path.join(stagingMonsterDir, '02_goblin_scout')
  },
  {
    name: '03_shadow_series',
    archivePath: path.resolve('Pixel_Art/SHADOW Series - The Free Assets.rar'),
    targetDir: path.join(stagingMonsterDir, '03_shadow_series')
  }
];

for (const arch of archives) {
  console.log(`Extracting ${arch.name} from ${arch.archivePath}...`);
  if (!fs.existsSync(arch.archivePath)) {
    console.error(`Archive not found: ${arch.archivePath}`);
    continue;
  }
  if (!fs.existsSync(arch.targetDir)) {
    fs.mkdirSync(arch.targetDir, { recursive: true });
  }

  try {
    execFileSync('7z', ['x', '-y', `-o${arch.targetDir}`, arch.archivePath], {
      stdio: 'inherit'
    });
    console.log(`[SUCCESS] Extracted ${arch.name}`);
  } catch (err) {
    console.error(`[ERROR] Failed to extract ${arch.name}:`, err.message);
  }
}

console.log('All extractions complete.');
