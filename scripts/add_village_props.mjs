import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingDir = path.resolve('staging/env_audit/05_the_fantasy_tileset/The Fan-tasy Tileset (Free)/Art/Props');
const targetDir = path.resolve('public/assets/environment/v14/village');

function desaturateAndDarken(srcPath, destPath, factor = 0.70) {
  const png = PNG.sync.read(fs.readFileSync(srcPath));
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 0) {
      let r = png.data[i];
      let g = png.data[i + 1];
      let b = png.data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.round((r * 0.7 + gray * 0.3) * factor);
      g = Math.round((g * 0.7 + gray * 0.3) * factor);
      b = Math.round((b * 0.7 + gray * 0.3) * factor);
      png.data[i] = Math.min(255, Math.max(0, r));
      png.data[i + 1] = Math.min(255, Math.max(0, g));
      png.data[i + 2] = Math.min(255, Math.max(0, b));
    }
  }
  fs.writeFileSync(destPath, PNG.sync.write(png));
  console.log(`  Processed ${path.basename(destPath)}`);
}

const chopped = path.join(stagingDir, 'Chopped_Tree_1.png');
const crate = path.join(stagingDir, 'Crate_Medium_Closed.png');

if (fs.existsSync(chopped)) {
  desaturateAndDarken(chopped, path.join(targetDir, 'prop_chopped_wood_v14.png'));
}
if (fs.existsSync(crate)) {
  desaturateAndDarken(crate, path.join(targetDir, 'prop_crate_weathered_v14.png'));
}
