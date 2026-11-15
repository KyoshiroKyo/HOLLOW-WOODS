import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const EXTRACTED_DIR = path.join(ROOT_DIR, 'Pixel_Art', 'extracted');

// Directories to write outputs
const VILLAGERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'villagers');
const NPCS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'npcs');
const CHARACTERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters');
const EDDA_SUBDIR = path.join(VILLAGERS_DIR, 'edda');
const NERIS_SUBDIR = path.join(VILLAGERS_DIR, 'neris');

[VILLAGERS_DIR, NPCS_DIR, CHARACTERS_DIR, EDDA_SUBDIR, NERIS_SUBDIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Resize PNG using nearest-neighbor interpolation to preserve crisp pixel art.
 */
function resizeNearestNeighbor(srcPng, targetWidth, targetHeight) {
  const dstPng = new PNG({ width: targetWidth, height: targetHeight });
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor((x + 0.5) * srcPng.width / targetWidth);
      const srcY = Math.floor((y + 0.5) * srcPng.height / targetHeight);
      const srcIdx = (srcY * srcPng.width + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      for (let c = 0; c < 4; c++) {
        dstPng.data[dstIdx + c] = srcPng.data[srcIdx + c];
      }
    }
  }
  return dstPng;
}

/**
 * Save PNG to multiple destinations simultaneously.
 */
function savePngMulti(png, targetPaths) {
  const buffer = PNG.sync.write(png);
  for (const tPath of targetPaths) {
    const parent = path.dirname(tPath);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.writeFileSync(tPath, buffer);
  }
}

console.log('--- Step 1: Processing Edda Assets ---');

// 1. Process Edda Idle Sheet (9 frames)
const eddaFrames = [];
for (let i = 1; i <= 9; i++) {
  const idleFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Eleonore', 'Idle', `Idle${i}.png`);
  const shadowFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Eleonore', 'Idle', 'Shadow', `Shadow${i}.png`);

  if (!fs.existsSync(idleFile)) throw new Error(`Missing Edda idle frame: ${idleFile}`);
  if (!fs.existsSync(shadowFile)) throw new Error(`Missing Edda shadow frame: ${shadowFile}`);

  const idlePng = PNG.sync.read(fs.readFileSync(idleFile));
  const shadowPng = PNG.sync.read(fs.readFileSync(shadowFile));

  const framePng = new PNG({ width: 64, height: 64 });

  // Composite shadow underneath:
  // Shadow center is (15.5, 16.0) in 32x32.
  // In frame 64x64, anchor at (36, 57) so bottom of shadow hits maxY=58.
  for (let sy = 0; sy < shadowPng.height; sy++) {
    for (let sx = 0; sx < shadowPng.width; sx++) {
      const sIdx = (sy * shadowPng.width + sx) * 4;
      const sa = shadowPng.data[sIdx + 3];
      if (sa > 0) {
        const tx = Math.round(36 + (sx - 15.5));
        const ty = Math.round(57 + (sy - 16.0));
        if (tx >= 0 && tx < 64 && ty >= 0 && ty < 64) {
          const tIdx = (ty * 64 + tx) * 4;
          framePng.data[tIdx] = shadowPng.data[sIdx];
          framePng.data[tIdx + 1] = shadowPng.data[sIdx + 1];
          framePng.data[tIdx + 2] = shadowPng.data[sIdx + 2];
          framePng.data[tIdx + 3] = sa;
        }
      }
    }
  }

  // Composite idle sprite on top (dx=+1, dy=+1 for horizontal centering 31.5 and foot anchor at 57)
  for (let y = 0; y < idlePng.height; y++) {
    for (let x = 0; x < idlePng.width; x++) {
      const idx = (y * idlePng.width + x) * 4;
      const a = idlePng.data[idx + 3];
      if (a > 0) {
        const tx = x + 1;
        const ty = y + 1;
        if (tx >= 0 && tx < 64 && ty >= 0 && ty < 64) {
          const tIdx = (ty * 64 + tx) * 4;
          framePng.data[tIdx] = idlePng.data[idx];
          framePng.data[tIdx + 1] = idlePng.data[idx + 1];
          framePng.data[tIdx + 2] = idlePng.data[idx + 2];
          framePng.data[tIdx + 3] = a;
        }
      }
    }
  }

  eddaFrames.push(framePng);
}

// Assemble edda_idle_sheet.png (9 frames horizontal = 576 x 64)
const eddaSheet = new PNG({ width: 576, height: 64 });
for (let f = 0; f < 9; f++) {
  const frame = eddaFrames[f];
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const srcIdx = (y * 64 + x) * 4;
      const dstIdx = (y * 576 + (f * 64 + x)) * 4;
      for (let c = 0; c < 4; c++) {
        eddaSheet.data[dstIdx + c] = frame.data[srcIdx + c];
      }
    }
  }
}

savePngMulti(eddaSheet, [
  path.join(VILLAGERS_DIR, 'edda_idle_sheet.png'),
  path.join(NPCS_DIR, 'edda_idle_sheet.png'),
  path.join(EDDA_SUBDIR, 'edda_idle_sheet.png')
]);
console.log('Saved edda_idle_sheet.png (576x64)');

// Frame 0 as npc_edda.png (64x64)
savePngMulti(eddaFrames[0], [
  path.join(VILLAGERS_DIR, 'npc_edda.png'),
  path.join(NPCS_DIR, 'npc_edda.png'),
  path.join(CHARACTERS_DIR, 'npc_edda.png'),
  path.join(NPCS_DIR, 'edda.png'),
  path.join(CHARACTERS_DIR, 'edda.png')
]);
console.log('Saved npc_edda.png (64x64)');

// Edda Portraits
const eleonore1Path = path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Eleonore', 'Eleonore1.png');
const eleonore2Path = path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Eleonore', 'Eleonore2.png');

if (fs.existsSync(eleonore1Path)) {
  const e1 = PNG.sync.read(fs.readFileSync(eleonore1Path));
  const portraitEdda = resizeNearestNeighbor(e1, 64, 64);
  savePngMulti(portraitEdda, [
    path.join(VILLAGERS_DIR, 'portrait_edda.png'),
    path.join(NPCS_DIR, 'portrait_edda.png'),
    path.join(CHARACTERS_DIR, 'portrait_edda.png'),
    path.join(VILLAGERS_DIR, 'edda_portrait.png'),
    path.join(EDDA_SUBDIR, 'edda_portrait.png')
  ]);
  console.log('Saved portrait_edda.png (64x64) from Eleonore1.png');
}

if (fs.existsSync(eleonore2Path)) {
  const e2 = PNG.sync.read(fs.readFileSync(eleonore2Path));
  const portraitEddaAlt = resizeNearestNeighbor(e2, 64, 64);
  savePngMulti(portraitEddaAlt, [
    path.join(VILLAGERS_DIR, 'portrait_edda_alt.png'),
    path.join(NPCS_DIR, 'portrait_edda_alt.png'),
    path.join(CHARACTERS_DIR, 'portrait_edda_alt.png')
  ]);
  console.log('Saved portrait_edda_alt.png (64x64) from Eleonore2.png');
}

console.log('\n--- Step 2: Processing Neris Assets ---');

// 2. Process Neris Idle Sheet (6 frames)
const nerisFrames = [];
for (let i = 1; i <= 6; i++) {
  const idleFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Joanna', 'Idle', `Idle${i}.png`);
  if (!fs.existsSync(idleFile)) throw new Error(`Missing Joanna idle frame: ${idleFile}`);

  const idlePng = PNG.sync.read(fs.readFileSync(idleFile));
  const framePng = new PNG({ width: 64, height: 64 });

  // Generate soft matching ellipse shadow underneath feet:
  // Center at x=31.5, y=57. y spans 56..58 (maxY=58)
  const shadowPixels = [];
  for (let x = 24; x <= 39; x++) shadowPixels.push({ x, y: 56 });
  for (let x = 22; x <= 41; x++) shadowPixels.push({ x, y: 57 });
  for (let x = 24; x <= 39; x++) shadowPixels.push({ x, y: 58 });

  for (const p of shadowPixels) {
    const idx = (p.y * 64 + p.x) * 4;
    framePng.data[idx] = 0x22;
    framePng.data[idx + 1] = 0x20;
    framePng.data[idx + 2] = 0x34;
    framePng.data[idx + 3] = 255;
  }

  // Draw Joanna sprite on top (dx=-1, dy=+5 to align feet at y=57, horizontal center at 32)
  for (let y = 0; y < idlePng.height; y++) {
    for (let x = 0; x < idlePng.width; x++) {
      const idx = (y * idlePng.width + x) * 4;
      const a = idlePng.data[idx + 3];
      if (a > 0) {
        const tx = x - 1;
        const ty = y + 5;
        if (tx >= 0 && tx < 64 && ty >= 0 && ty < 64) {
          const tIdx = (ty * 64 + tx) * 4;
          framePng.data[tIdx] = idlePng.data[idx];
          framePng.data[tIdx + 1] = idlePng.data[idx + 1];
          framePng.data[tIdx + 2] = idlePng.data[idx + 2];
          framePng.data[tIdx + 3] = a;
        }
      }
    }
  }

  nerisFrames.push(framePng);
}

// Assemble neris_idle_sheet.png (6 frames horizontal = 384 x 64)
const nerisSheet = new PNG({ width: 384, height: 64 });
for (let f = 0; f < 6; f++) {
  const frame = nerisFrames[f];
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const srcIdx = (y * 64 + x) * 4;
      const dstIdx = (y * 384 + (f * 64 + x)) * 4;
      for (let c = 0; c < 4; c++) {
        nerisSheet.data[dstIdx + c] = frame.data[srcIdx + c];
      }
    }
  }
}

savePngMulti(nerisSheet, [
  path.join(VILLAGERS_DIR, 'neris_idle_sheet.png'),
  path.join(NPCS_DIR, 'neris_idle_sheet.png'),
  path.join(NERIS_SUBDIR, 'neris_idle_sheet.png')
]);
console.log('Saved neris_idle_sheet.png (384x64)');

// Frame 0 as npc_neris.png (64x64)
savePngMulti(nerisFrames[0], [
  path.join(VILLAGERS_DIR, 'npc_neris.png'),
  path.join(NPCS_DIR, 'npc_neris.png'),
  path.join(CHARACTERS_DIR, 'npc_neris.png'),
  path.join(NPCS_DIR, 'neris.png'),
  path.join(CHARACTERS_DIR, 'neris.png')
]);
console.log('Saved npc_neris.png (64x64)');

// Neris Portraits
const joanna1Path = path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)1.png');
const joanna3Path = path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)3.png');
const joanna4Path = path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)4.png');

if (fs.existsSync(joanna1Path)) {
  const j1 = PNG.sync.read(fs.readFileSync(joanna1Path));
  const portraitNeris = resizeNearestNeighbor(j1, 64, 64);
  savePngMulti(portraitNeris, [
    path.join(VILLAGERS_DIR, 'portrait_neris.png'),
    path.join(NPCS_DIR, 'portrait_neris.png'),
    path.join(CHARACTERS_DIR, 'portrait_neris.png'),
    path.join(VILLAGERS_DIR, 'neris_portrait.png'),
    path.join(NERIS_SUBDIR, 'neris_portrait.png')
  ]);
  console.log('Saved portrait_neris.png (64x64) from JoannaPortrait1(NOBG)1.png');
}

if (fs.existsSync(joanna3Path)) {
  const j3 = PNG.sync.read(fs.readFileSync(joanna3Path));
  const portraitNerisAlt3 = resizeNearestNeighbor(j3, 64, 64);
  savePngMulti(portraitNerisAlt3, [
    path.join(VILLAGERS_DIR, 'portrait_neris_alt3.png'),
    path.join(NPCS_DIR, 'portrait_neris_alt3.png'),
    path.join(CHARACTERS_DIR, 'portrait_neris_alt3.png')
  ]);
  console.log('Saved portrait_neris_alt3.png (64x64) from JoannaPortrait1(NOBG)3.png');
}

if (fs.existsSync(joanna4Path)) {
  const j4 = PNG.sync.read(fs.readFileSync(joanna4Path));
  const portraitNerisAlt4 = resizeNearestNeighbor(j4, 64, 64);
  savePngMulti(portraitNerisAlt4, [
    path.join(VILLAGERS_DIR, 'portrait_neris_alt4.png'),
    path.join(NPCS_DIR, 'portrait_neris_alt4.png'),
    path.join(CHARACTERS_DIR, 'portrait_neris_alt4.png')
  ]);
  console.log('Saved portrait_neris_alt4.png (64x64) from JoannaPortrait1(NOBG)4.png');
}

console.log('\n--- Asset Packaging Finished Successfully! ---');
