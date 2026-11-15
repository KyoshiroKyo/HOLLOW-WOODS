import fs from 'fs';
import { PNG } from 'pngjs';

const sheets = [
  'wayfarer_idle.png',
  'wayfarer_walk.png',
  'wayfarer_run.png',
  'wayfarer_attack.png',
  'wayfarer_gather.png',
  'wayfarer_interact.png',
  'wayfarer_use_item.png',
  'wayfarer_hurt.png'
];

for (const sheet of sheets) {
  const filePath = `public/assets/characters/mossbound_wayfarer/${sheet}`;
  if (!fs.existsSync(filePath)) continue;
  const png = PNG.sync.read(fs.readFileSync(filePath));
  console.log(`\n=== SHEET: ${sheet} (${png.width}x${png.height}) ===`);
  const cols = png.width / 64;
  const rows = png.height / 64;
  const dirNames = ['DOWN', 'UP', 'LEFT', 'RIGHT'];

  for (let r = 0; r < Math.min(rows, 4); r++) {
    const dir = dirNames[r] || `Row ${r}`;
    for (let c = 0; c < Math.min(cols, 6); c++) {
      const amberPixels = [];
      const frameOx = c * 64;
      const frameOy = r * 64;

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const idx = (png.width * (frameOy + y) + (frameOx + x)) * 4;
          const a = png.data[idx + 3];
          if (a > 50) {
            const red = png.data[idx];
            const grn = png.data[idx + 1];
            const blu = png.data[idx + 2];
            // Look for amber lantern colors (golden amber, yellow flame, or lantern cage)
            if ((red > 210 && grn > 140 && blu < 110) || (red > 240 && grn > 180 && blu < 150)) {
              amberPixels.push({ x, y, red, grn, blu });
            }
          }
        }
      }

      if (amberPixels.length > 0) {
        const avgX = amberPixels.reduce((sum, p) => sum + p.x, 0) / amberPixels.length;
        const avgY = amberPixels.reduce((sum, p) => sum + p.y, 0) / amberPixels.length;
        // Relative to foot anchor (32, 58)
        const relX = Math.round(avgX - 32);
        const relY = Math.round(avgY - 58);
        console.log(`  ${dir} frame ${c}: center=(${avgX.toFixed(1)}, ${avgY.toFixed(1)}) -> offset from foot: (${relX}, ${relY}) [${amberPixels.length} px]`);
      } else {
        console.log(`  ${dir} frame ${c}: NO amber pixels found`);
      }
    }
  }
}
