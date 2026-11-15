import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const EXTRACTED_DIR = path.join(ROOT_DIR, 'Pixel_Art', 'extracted');
const TOWN_FOLK_DIR = path.join(ROOT_DIR, 'Pixel_Art', 'town-folk-2-free-v1.0');

// Output directories
const VILLAGERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'villagers');
const NPCS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'npcs');
const CHARACTERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'characters');

[VILLAGERS_DIR, NPCS_DIR, CHARACTERS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

/**
 * Nearest-neighbor resize function.
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
 * Crop bust from source sheet and upscale nearest-neighbor to 64x64.
 */
function cropAndUpscaleBust(sheetPng, cropX, cropY, cropSize) {
  const portrait = new PNG({ width: 64, height: 64 });
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const sx = cropX + Math.floor(x * cropSize / 64);
      const sy = cropY + Math.floor(y * cropSize / 64);
      const sIdx = (sy * sheetPng.width + sx) * 4;
      const dIdx = (y * 64 + x) * 4;
      for (let c = 0; c < 4; c++) {
        portrait.data[dIdx + c] = sheetPng.data[sIdx + c];
      }
    }
  }
  return portrait;
}

console.log('========================================================================');
console.log('       BUILD VILLAGER ASSETS V1.2 (C4-12-08 PART 1 + PART 2)            ');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. EDDA (Eleonore)
// -----------------------------------------------------------------------------
console.log('--- Processing NPC 1: Edda (Elder Bell Keeper) ---');
const eddaFrames = [];
for (let i = 1; i <= 9; i++) {
  const idleFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Eleonore', 'Idle', `Idle${i}.png`);
  const shadowFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Eleonore', 'Idle', 'Shadow', `Shadow${i}.png`);
  const idlePng = PNG.sync.read(fs.readFileSync(idleFile));
  const shadowPng = PNG.sync.read(fs.readFileSync(shadowFile));
  const framePng = new PNG({ width: 64, height: 64 });

  // Shadow underneath (anchor at 36, 57 so bottom hits maxY=58)
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

  // Sprite overlay (dx=1, dy=1)
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

const eddaSheet = new PNG({ width: 576, height: 64 });
for (let f = 0; f < 9; f++) {
  const frame = eddaFrames[f];
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const sIdx = (y * 64 + x) * 4;
      const dIdx = (y * 576 + (f * 64 + x)) * 4;
      for (let c = 0; c < 4; c++) eddaSheet.data[dIdx + c] = frame.data[sIdx + c];
    }
  }
}
savePngMulti(eddaSheet, [path.join(VILLAGERS_DIR, 'edda_idle_sheet.png'), path.join(NPCS_DIR, 'edda_idle_sheet.png')]);
savePngMulti(eddaFrames[0], [path.join(VILLAGERS_DIR, 'npc_edda.png'), path.join(NPCS_DIR, 'npc_edda.png'), path.join(CHARACTERS_DIR, 'npc_edda.png')]);

const eleonore1Png = PNG.sync.read(fs.readFileSync(path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Eleonore', 'Eleonore1.png')));
const portraitEdda = resizeNearestNeighbor(eleonore1Png, 64, 64);
savePngMulti(portraitEdda, [path.join(VILLAGERS_DIR, 'portrait_edda.png'), path.join(NPCS_DIR, 'portrait_edda.png'), path.join(CHARACTERS_DIR, 'portrait_edda.png')]);

const eleonore2Png = PNG.sync.read(fs.readFileSync(path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Eleonore', 'Eleonore2.png')));
const portraitEddaAlt = resizeNearestNeighbor(eleonore2Png, 64, 64);
savePngMulti(portraitEddaAlt, [path.join(VILLAGERS_DIR, 'portrait_edda_alt.png'), path.join(NPCS_DIR, 'portrait_edda_alt.png'), path.join(CHARACTERS_DIR, 'portrait_edda_alt.png')]);
console.log('Edda completed: edda_idle_sheet.png, npc_edda.png, portrait_edda.png, portrait_edda_alt.png\n');

// -----------------------------------------------------------------------------
// 2. NERIS (Joanna)
// -----------------------------------------------------------------------------
console.log('--- Processing NPC 2: Neris (Apothecary) ---');
const nerisFrames = [];
for (let i = 1; i <= 6; i++) {
  const idleFile = path.join(EXTRACTED_DIR, 'EleonoreAndJoanna', 'Sprites', 'Joanna', 'Idle', `Idle${i}.png`);
  const idlePng = PNG.sync.read(fs.readFileSync(idleFile));
  const framePng = new PNG({ width: 64, height: 64 });

  // Ellipse contact shadow
  for (let x = 24; x <= 39; x++) { const idx = (56 * 64 + x) * 4; framePng.data[idx] = 0x22; framePng.data[idx+1] = 0x20; framePng.data[idx+2] = 0x34; framePng.data[idx+3] = 255; }
  for (let x = 22; x <= 41; x++) { const idx = (57 * 64 + x) * 4; framePng.data[idx] = 0x22; framePng.data[idx+1] = 0x20; framePng.data[idx+2] = 0x34; framePng.data[idx+3] = 255; }
  for (let x = 24; x <= 39; x++) { const idx = (58 * 64 + x) * 4; framePng.data[idx] = 0x22; framePng.data[idx+1] = 0x20; framePng.data[idx+2] = 0x34; framePng.data[idx+3] = 255; }

  // Joanna sprite overlay (dx=-1, dy=5)
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

const nerisSheet = new PNG({ width: 384, height: 64 });
for (let f = 0; f < 6; f++) {
  const frame = nerisFrames[f];
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const sIdx = (y * 64 + x) * 4;
      const dIdx = (y * 384 + (f * 64 + x)) * 4;
      for (let c = 0; c < 4; c++) nerisSheet.data[dIdx + c] = frame.data[sIdx + c];
    }
  }
}
savePngMulti(nerisSheet, [path.join(VILLAGERS_DIR, 'neris_idle_sheet.png'), path.join(NPCS_DIR, 'neris_idle_sheet.png')]);
savePngMulti(nerisFrames[0], [path.join(VILLAGERS_DIR, 'npc_neris.png'), path.join(NPCS_DIR, 'npc_neris.png'), path.join(CHARACTERS_DIR, 'npc_neris.png')]);

const joanna1Png = PNG.sync.read(fs.readFileSync(path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)1.png')));
const portraitNeris = resizeNearestNeighbor(joanna1Png, 64, 64);
savePngMulti(portraitNeris, [path.join(VILLAGERS_DIR, 'portrait_neris.png'), path.join(NPCS_DIR, 'portrait_neris.png'), path.join(CHARACTERS_DIR, 'portrait_neris.png')]);

const joanna3Png = PNG.sync.read(fs.readFileSync(path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)3.png')));
const portraitNerisAlt3 = resizeNearestNeighbor(joanna3Png, 64, 64);
savePngMulti(portraitNerisAlt3, [path.join(VILLAGERS_DIR, 'portrait_neris_alt3.png'), path.join(NPCS_DIR, 'portrait_neris_alt3.png'), path.join(CHARACTERS_DIR, 'portrait_neris_alt3.png')]);

const joanna4Png = PNG.sync.read(fs.readFileSync(path.join(EXTRACTED_DIR, 'Portraits_v1', 'Portraits', 'Joanna', 'JoannaPortrait1(NOBG)4.png')));
const portraitNerisAlt4 = resizeNearestNeighbor(joanna4Png, 64, 64);
savePngMulti(portraitNerisAlt4, [path.join(VILLAGERS_DIR, 'portrait_neris_alt4.png'), path.join(NPCS_DIR, 'portrait_neris_alt4.png'), path.join(CHARACTERS_DIR, 'portrait_neris_alt4.png')]);
console.log('Neris completed: neris_idle_sheet.png, npc_neris.png, portrait_neris.png, alt3, alt4\n');

// -----------------------------------------------------------------------------
// HELPER FOR TOWN FOLK GRID CHARACTER
// -----------------------------------------------------------------------------
function buildTownFolkCharacter(config) {
  const {
    id, name, srcRelPath, fw, fh, footY, centerX, scale, targetFootY,
    cropX, cropY, cropSize,
    sheetFileName, npcFileName, portraitFileName
  } = config;

  console.log(`--- Processing Town Folk: ${name} (${id}) ---`);
  const srcFile = path.join(TOWN_FOLK_DIR, srcRelPath);
  if (!fs.existsSync(srcFile)) throw new Error(`Missing source file: ${srcFile}`);

  const srcPng = PNG.sync.read(fs.readFileSync(srcFile));
  const sheetPng = new PNG({ width: 512, height: 256 });
  const frames = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const cellPng = new PNG({ width: 64, height: 64 });

      // Contact shadow matching Edda/Neris
      for (let x = 24; x <= 39; x++) { const idx = (56 * 64 + x) * 4; cellPng.data[idx] = 0x22; cellPng.data[idx+1] = 0x20; cellPng.data[idx+2] = 0x34; cellPng.data[idx+3] = 255; }
      for (let x = 22; x <= 41; x++) { const idx = (57 * 64 + x) * 4; cellPng.data[idx] = 0x22; cellPng.data[idx+1] = 0x20; cellPng.data[idx+2] = 0x34; cellPng.data[idx+3] = 255; }
      for (let x = 24; x <= 39; x++) { const idx = (58 * 64 + x) * 4; cellPng.data[idx] = 0x22; cellPng.data[idx+1] = 0x20; cellPng.data[idx+2] = 0x34; cellPng.data[idx+3] = 255; }

      // Scaled and anchored character sprite
      for (let sy = 0; sy < fh; sy++) {
        for (let sx = 0; sx < fw; sx++) {
          const sIdx = ((r * fh + sy) * srcPng.width + (c * fw + sx)) * 4;
          const a = srcPng.data[sIdx + 3];
          if (a > 10) {
            const ty = Math.round(targetFootY + (sy - footY) * scale);
            const tx = Math.round(32 + (sx - centerX) * scale);
            if (tx >= 0 && tx < 64 && ty >= 0 && ty < 64) {
              const dIdx = (ty * 64 + tx) * 4;
              cellPng.data[dIdx] = srcPng.data[sIdx];
              cellPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
              cellPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
              cellPng.data[dIdx + 3] = a;
            }
          }
        }
      }

      // Copy into 512x256 spritesheet
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const sIdx = (y * 64 + x) * 4;
          const dIdx = ((r * 64 + y) * 512 + (c * 64 + x)) * 4;
          for (let k = 0; k < 4; k++) sheetPng.data[dIdx + k] = cellPng.data[sIdx + k];
        }
      }

      if (r === 0) frames.push(cellPng);
    }
  }

  savePngMulti(sheetPng, [
    path.join(VILLAGERS_DIR, sheetFileName),
    path.join(NPCS_DIR, sheetFileName)
  ]);
  console.log(`Saved ${sheetFileName} (512x256)`);

  // Standing frame (row 0, col 0)
  const standingFrame = frames[0];
  savePngMulti(standingFrame, [
    path.join(VILLAGERS_DIR, npcFileName),
    path.join(NPCS_DIR, npcFileName),
    path.join(CHARACTERS_DIR, npcFileName)
  ]);
  console.log(`Saved ${npcFileName} (64x64)`);

  // Bust portrait
  const portrait = cropAndUpscaleBust(srcPng, cropX, cropY, cropSize);
  savePngMulti(portrait, [
    path.join(VILLAGERS_DIR, portraitFileName),
    path.join(NPCS_DIR, portraitFileName),
    path.join(CHARACTERS_DIR, portraitFileName)
  ]);
  console.log(`Saved ${portraitFileName} (64x64)\n`);

  return { id, name, sheetPng, standingFrame, portrait, frames };
}

// -----------------------------------------------------------------------------
// 3. GARTH (night_watchman)
// -----------------------------------------------------------------------------
const garthData = buildTownFolkCharacter({
  id: 'garth',
  name: 'Garth — Người Canh Cổng',
  srcRelPath: path.join('characters', 'night_watchman', 'walk.png'),
  fw: 63,
  fh: 63,
  footY: 60,
  centerX: 30,
  scale: 55 / 63,
  targetFootY: 56.5,
  cropX: 18,
  cropY: 0,
  cropSize: 30,
  sheetFileName: 'garth_walk_sheet.png',
  npcFileName: 'npc_garth.png',
  portraitFileName: 'portrait_garth.png'
});

// Also create backward compatible copy for garth_walk.png and garth_portrait.png
savePngMulti(garthData.sheetPng, [path.join(VILLAGERS_DIR, 'garth_walk.png'), path.join(NPCS_DIR, 'garth_walk.png')]);
savePngMulti(garthData.portrait, [path.join(VILLAGERS_DIR, 'garth_portrait.png'), path.join(NPCS_DIR, 'garth_portrait.png')]);

// -----------------------------------------------------------------------------
// 4. BRAM (potter)
// -----------------------------------------------------------------------------
const bramData = buildTownFolkCharacter({
  id: 'bram',
  name: 'Bram — Thợ Thủ Công',
  srcRelPath: path.join('characters', 'potter', 'walk.png'),
  fw: 62,
  fh: 62,
  footY: 59,
  centerX: 30,
  scale: 53 / 62,
  targetFootY: 56.5,
  cropX: 18,
  cropY: 0,
  cropSize: 28,
  sheetFileName: 'potter_walk_sheet.png',
  npcFileName: 'npc_bram.png',
  portraitFileName: 'portrait_bram.png'
});

// -----------------------------------------------------------------------------
// 5. FINN (errand_boy)
// -----------------------------------------------------------------------------
const finnData = buildTownFolkCharacter({
  id: 'finn',
  name: 'Finn — Cậu Bé Đưa Tin',
  srcRelPath: path.join('characters', 'errand_boy', 'walk.png'),
  fw: 65,
  fh: 65,
  footY: 60,
  centerX: 32,
  scale: 51 / 65,
  targetFootY: 56.0,
  cropX: 20,
  cropY: 0,
  cropSize: 26,
  sheetFileName: 'errand_boy_walk_sheet.png',
  npcFileName: 'npc_finn.png',
  portraitFileName: 'portrait_finn.png'
});

// -----------------------------------------------------------------------------
// 6. ASSEMBLE VILLAGER PREVIEW SHEET (640x320)
// -----------------------------------------------------------------------------
console.log('--- Generating villager_preview_sheet.png (640x320) ---');
// 5 rows (one per character). 10 columns: [Portrait 64, Standing 64, Frame 0..7 64 each]
const previewSheet = new PNG({ width: 640, height: 320 });

const previewRows = [
  { name: 'Garth', portrait: garthData.portrait, standing: garthData.standingFrame, animFrames: garthData.frames.slice(0, 8) },
  { name: 'Edda', portrait: portraitEdda, standing: eddaFrames[0], animFrames: eddaFrames.slice(0, 8) },
  { name: 'Neris', portrait: portraitNeris, standing: nerisFrames[0], animFrames: [...nerisFrames, nerisFrames[4], nerisFrames[5]] },
  { name: 'Bram', portrait: bramData.portrait, standing: bramData.standingFrame, animFrames: bramData.frames.slice(0, 8) },
  { name: 'Finn', portrait: finnData.portrait, standing: finnData.standingFrame, animFrames: finnData.frames.slice(0, 8) }
];

for (let r = 0; r < 5; r++) {
  const rowData = previewRows[r];
  const rowY = r * 64;

  // Col 0: Portrait
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const sIdx = (y * 64 + x) * 4;
      const dIdx = ((rowY + y) * 640 + x) * 4;
      for (let c = 0; c < 4; c++) previewSheet.data[dIdx + c] = rowData.portrait.data[sIdx + c];
    }
  }

  // Col 1: Standing frame
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const sIdx = (y * 64 + x) * 4;
      const dIdx = ((rowY + y) * 640 + (64 + x)) * 4;
      for (let c = 0; c < 4; c++) previewSheet.data[dIdx + c] = rowData.standing.data[sIdx + c];
    }
  }

  // Col 2..9: Animation frames
  for (let f = 0; f < 8; f++) {
    const fFrame = rowData.animFrames[f] || rowData.standing;
    const colX = (f + 2) * 64;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const sIdx = (y * 64 + x) * 4;
        const dIdx = ((rowY + y) * 640 + (colX + x)) * 4;
        for (let c = 0; c < 4; c++) previewSheet.data[dIdx + c] = fFrame.data[sIdx + c];
      }
    }
  }
}

savePngMulti(previewSheet, [
  path.join(VILLAGERS_DIR, 'villager_preview_sheet.png'),
  path.join(NPCS_DIR, 'villager_preview_sheet.png')
]);
console.log('Saved villager_preview_sheet.png (640x320)\n');

// -----------------------------------------------------------------------------
// 7. VILLAGER ANIMATION MANIFEST JSON
// -----------------------------------------------------------------------------
console.log('--- Generating villager_animation_manifest.json ---');
const manifestData = {
  manifestVersion: "1.2.0",
  commandRef: "C4-12-08",
  description: "Standardized Animation Manifest for Bellhollow Village NPCs (Garth, Edda, Neris, Bram, Finn)",
  standardCell: {
    frameWidth: 64,
    frameHeight: 64,
    footAnchor: {
      x: 32,
      y: 58,
      originX: 0.5,
      originY: 0.90625
    },
    shadowStandard: {
      color: "#222034",
      alpha: 255,
      shape: "ellipse",
      contactRows: [56, 57, 58],
      maxY: 58
    }
  },
  previewSheet: "assets/characters/villagers/villager_preview_sheet.png",
  npcs: {
    garth: {
      id: "garth",
      name: "Garth",
      title: "Người Canh Cổng Làng Bellhollow (Gatekeeper)",
      sourcePackage: "town-folk-2-free-v1.0 (night_watchman)",
      sprite: "assets/characters/villagers/npc_garth.png",
      portrait: "assets/characters/villagers/portrait_garth.png",
      sheets: {
        walk: {
          file: "assets/characters/villagers/garth_walk_sheet.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 8,
          rows: 4,
          totalFrames: 32,
          fps: 8,
          loop: true,
          rowMapping: {
            DOWN: 0,
            LEFT: 1,
            RIGHT: 2,
            UP: 3
          },
          directions: {
            DOWN: { frames: [0, 1, 2, 3, 4, 5, 6, 7] },
            LEFT: { frames: [8, 9, 10, 11, 12, 13, 14, 15] },
            RIGHT: { frames: [16, 17, 18, 19, 20, 21, 22, 23] },
            UP: { frames: [24, 25, 26, 27, 28, 29, 30, 31] }
          }
        }
      }
    },
    edda: {
      id: "edda",
      name: "Edda",
      title: "Bà Lão Giữ Chuông Làng Bellhollow (Elder Bell Keeper)",
      sourcePackage: "EleonoreAndJoanna (Eleonore) & Portraits_v1",
      sprite: "assets/characters/villagers/npc_edda.png",
      portrait: "assets/characters/villagers/portrait_edda.png",
      portraitAlt: "assets/characters/villagers/portrait_edda_alt.png",
      sheets: {
        idle: {
          file: "assets/characters/villagers/edda_idle_sheet.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 9,
          rows: 1,
          totalFrames: 9,
          fps: 6,
          loop: true,
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        }
      }
    },
    neris: {
      id: "neris",
      name: "Neris",
      title: "Thầy Thuốc Thảo Mộc (Village Apothecary)",
      sourcePackage: "EleonoreAndJoanna (Joanna) & Portraits_v1",
      sprite: "assets/characters/villagers/npc_neris.png",
      portrait: "assets/characters/villagers/portrait_neris.png",
      portraitAlt3: "assets/characters/villagers/portrait_neris_alt3.png",
      portraitAlt4: "assets/characters/villagers/portrait_neris_alt4.png",
      sheets: {
        idle: {
          file: "assets/characters/villagers/neris_idle_sheet.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 6,
          rows: 1,
          totalFrames: 6,
          fps: 6,
          loop: true,
          frames: [0, 1, 2, 3, 4, 5]
        }
      }
    },
    bram: {
      id: "bram",
      name: "Bram",
      title: "Thợ Thủ Công Làng (Village Craftsman / Potter)",
      sourcePackage: "town-folk-2-free-v1.0 (potter)",
      sprite: "assets/characters/villagers/npc_bram.png",
      portrait: "assets/characters/villagers/portrait_bram.png",
      sheets: {
        walk: {
          file: "assets/characters/villagers/potter_walk_sheet.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 8,
          rows: 4,
          totalFrames: 32,
          fps: 8,
          loop: true,
          rowMapping: {
            DOWN: 0,
            LEFT: 1,
            RIGHT: 2,
            UP: 3
          },
          directions: {
            DOWN: { frames: [0, 1, 2, 3, 4, 5, 6, 7] },
            LEFT: { frames: [8, 9, 10, 11, 12, 13, 14, 15] },
            RIGHT: { frames: [16, 17, 18, 19, 20, 21, 22, 23] },
            UP: { frames: [24, 25, 26, 27, 28, 29, 30, 31] }
          }
        }
      }
    },
    finn: {
      id: "finn",
      name: "Finn",
      title: "Cậu Bé Đưa Tin (Errand Boy)",
      sourcePackage: "town-folk-2-free-v1.0 (errand_boy)",
      sprite: "assets/characters/villagers/npc_finn.png",
      portrait: "assets/characters/villagers/portrait_finn.png",
      sheets: {
        walk: {
          file: "assets/characters/villagers/errand_boy_walk_sheet.png",
          frameWidth: 64,
          frameHeight: 64,
          columns: 8,
          rows: 4,
          totalFrames: 32,
          fps: 8,
          loop: true,
          rowMapping: {
            DOWN: 0,
            LEFT: 1,
            RIGHT: 2,
            UP: 3
          },
          directions: {
            DOWN: { frames: [0, 1, 2, 3, 4, 5, 6, 7] },
            LEFT: { frames: [8, 9, 10, 11, 12, 13, 14, 15] },
            RIGHT: { frames: [16, 17, 18, 19, 20, 21, 22, 23] },
            UP: { frames: [24, 25, 26, 27, 28, 29, 30, 31] }
          }
        }
      }
    }
  }
};

const manifestJson = JSON.stringify(manifestData, null, 2);
fs.writeFileSync(path.join(VILLAGERS_DIR, 'villager_animation_manifest.json'), manifestJson, 'utf-8');
fs.writeFileSync(path.join(NPCS_DIR, 'villager_animation_manifest.json'), manifestJson, 'utf-8');
console.log('Saved villager_animation_manifest.json to villagers/ and npcs/\n');

console.log('========================================================================');
console.log('       ALL VILLAGER ASSETS BUILT AND SYNCHRONIZED SUCCESSFULLY!          ');
console.log('========================================================================');
