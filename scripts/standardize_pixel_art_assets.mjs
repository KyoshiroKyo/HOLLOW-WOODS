/**
 * Step V15-09: Standardize Pixel Art Scale, Anchors, Outlines, and Palettes
 * Using pngjs to:
 * 1. Trim padding and align feet to bottom baseline (origin 0.5, 1.0)
 * 2. Enforce Unified Scale Standard (Wayfarer & Adult NPCs: 42-48px; Finn: 34-36px)
 * 3. Soften outlines to dark charcoal #18141a
 * 4. Harmonize color palette to Muted Dark Woodland
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const BACKUP_DIR = 'backup_v15_09_assets';

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Color conversion helpers
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) return [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

function processAsset({ filePath, fw, fh, targetHeight, name }) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  // Backup original
  const relPath = path.relative('public', filePath);
  const backupTarget = path.join(BACKUP_DIR, relPath);
  fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
  if (!fs.existsSync(backupTarget)) {
    fs.copyFileSync(filePath, backupTarget);
  }

  const data = fs.readFileSync(filePath);
  const srcPng = PNG.sync.read(data);
  const cols = Math.floor(srcPng.width / fw);
  const rows = Math.floor(srcPng.height / fh);

  // Measure initial global bounds
  let globalMinY = fh, globalMaxY = -1;
  let globalMinX = fw, globalMaxX = -1;
  let hasContent = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const px = c * fw + x;
          const py = r * fh + y;
          const idx = (py * srcPng.width + px) * 4;
          if (srcPng.data[idx + 3] > 15) {
            hasContent = true;
            if (y < globalMinY) globalMinY = y;
            if (y > globalMaxY) globalMaxY = y;
            if (x < globalMinX) globalMinX = x;
            if (x > globalMaxX) globalMaxX = x;
          }
        }
      }
    }
  }

  if (!hasContent) {
    return { name, filePath, status: 'empty' };
  }

  const origHeight = globalMaxY - globalMinY + 1;
  const scale = targetHeight ? Math.min(1.0, targetHeight / origHeight) : 1.0;
  const baselineY = fh - 1; // foot rests on frame bottom edge
  const centerX = Math.floor(fw / 2);
  const globalCenterX = Math.round((globalMinX + globalMaxX) / 2);

  const dstPng = new PNG({ width: srcPng.width, height: srcPng.height });

  // Clear dst to transparent
  for (let i = 0; i < dstPng.data.length; i += 4) {
    dstPng.data[i] = 0;
    dstPng.data[i + 1] = 0;
    dstPng.data[i + 2] = 0;
    dstPng.data[i + 3] = 0;
  }

  // Process frames
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let dy = 0; dy < fh; dy++) {
        for (let dx = 0; dx < fw; dx++) {
          const relY = dy - baselineY; // distance from ground
          const relX = dx - centerX;   // distance from center

          const srcRelY = Math.round(relY / scale);
          const srcRelX = Math.round(relX / scale);

          const srcY = globalMaxY + srcRelY;
          const srcX = globalCenterX + srcRelX;

          if (srcX >= 0 && srcX < fw && srcY >= 0 && srcY < fh) {
            const sPx = c * fw + srcX;
            const sPy = r * fh + srcY;
            const sIdx = (sPy * srcPng.width + sPx) * 4;
            const alpha = srcPng.data[sIdx + 3];

            if (alpha > 15) {
              let red = srcPng.data[sIdx];
              let green = srcPng.data[sIdx + 1];
              let blue = srcPng.data[sIdx + 2];

              // Charcoal outline normalization: replace harsh pitch black with #18141a
              if (red <= 26 && green <= 26 && blue <= 26) {
                red = 24;
                green = 20;
                blue = 26;
              } else {
                // Muted dark woodland color grading: desaturate oversaturated tones
                const [h, s, l] = rgbToHsl(red, green, blue);
                if (s > 0.55) {
                  const newS = Math.min(0.55, s * 0.82);
                  const [nr, ng, nb] = hslToRgb(h, newS, l);
                  red = nr; green = ng; blue = nb;
                }
              }

              const dPx = c * fw + dx;
              const dPy = r * fh + dy;
              const dIdx = (dPy * dstPng.width + dPx) * 4;

              dstPng.data[dIdx] = red;
              dstPng.data[dIdx + 1] = green;
              dstPng.data[dIdx + 2] = blue;
              dstPng.data[dIdx + 3] = alpha;
            }
          }
        }
      }
    }
  }

  // Write out updated PNG
  fs.writeFileSync(filePath, PNG.sync.write(dstPng));

  // Measure result
  let resMinY = fh, resMaxY = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const px = c * fw + x;
          const py = r * fh + y;
          const idx = (py * dstPng.width + px) * 4;
          if (dstPng.data[idx + 3] > 15) {
            if (y < resMinY) resMinY = y;
            if (y > resMaxY) resMaxY = y;
          }
        }
      }
    }
  }

  const finalHeight = resMaxY - resMinY + 1;
  const bottomGap = fh - 1 - resMaxY;

  return {
    name,
    filePath,
    fw,
    fh,
    origHeight,
    finalHeight,
    bottomGap,
    scale: scale.toFixed(3)
  };
}

// ASSETS LIST
const ASSET_REGISTRY = [
  // 1. Wayfarer Player
  { name: 'Wayfarer Idle', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_idle.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Walk', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_walk.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Run', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_run.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Attack', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_attack.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Hurt', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_hurt.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Death', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_death.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Interact', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_interact.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Gather', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_gather.png', fw: 64, fh: 64, targetHeight: 43 },
  { name: 'Wayfarer Use Item', filePath: 'public/assets/characters/mossbound_wayfarer/wayfarer_use_item.png', fw: 64, fh: 64, targetHeight: 43 },

  // 2. Villager NPCs
  { name: 'Garth Walk Sheet', filePath: 'public/assets/characters/villagers/garth_walk_sheet.png', fw: 64, fh: 64, targetHeight: 46 },
  { name: 'Garth NPC Single', filePath: 'public/assets/characters/villagers/npc_garth.png', fw: 64, fh: 64, targetHeight: 46 },
  { name: 'Garth Char Single', filePath: 'public/assets/characters/garth.png', fw: 64, fh: 64, targetHeight: 46 },
  { name: 'Garth NPC Copy', filePath: 'public/assets/characters/npcs/npc_garth.png', fw: 64, fh: 64, targetHeight: 46 },

  { name: 'Edda Idle Sheet', filePath: 'public/assets/characters/villagers/edda_idle_sheet.png', fw: 64, fh: 64, targetHeight: 45 },
  { name: 'Edda Idle Subdir', filePath: 'public/assets/characters/villagers/edda/edda_idle_sheet.png', fw: 64, fh: 64, targetHeight: 45 },
  { name: 'Edda NPC Single', filePath: 'public/assets/characters/villagers/npc_edda.png', fw: 64, fh: 64, targetHeight: 45 },
  { name: 'Edda Char Single', filePath: 'public/assets/characters/edda.png', fw: 64, fh: 64, targetHeight: 45 },
  { name: 'Edda NPC Copy', filePath: 'public/assets/characters/npcs/npc_edda.png', fw: 64, fh: 64, targetHeight: 45 },

  { name: 'Neris Idle Sheet', filePath: 'public/assets/characters/villagers/neris_idle_sheet.png', fw: 64, fh: 64, targetHeight: 44 },
  { name: 'Neris Idle Subdir', filePath: 'public/assets/characters/villagers/neris/neris_idle_sheet.png', fw: 64, fh: 64, targetHeight: 44 },
  { name: 'Neris NPC Single', filePath: 'public/assets/characters/villagers/npc_neris.png', fw: 64, fh: 64, targetHeight: 44 },
  { name: 'Neris Char Single', filePath: 'public/assets/characters/neris.png', fw: 64, fh: 64, targetHeight: 44 },
  { name: 'Neris NPC Copy', filePath: 'public/assets/characters/npcs/npc_neris.png', fw: 64, fh: 64, targetHeight: 44 },

  { name: 'Blacksmith Sheet', filePath: 'public/assets/characters/villagers/blacksmith_sheet.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Blacksmith NPC Single', filePath: 'public/assets/characters/villagers/npc_blacksmith.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Potter Walk Sheet', filePath: 'public/assets/characters/villagers/potter_walk_sheet.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Blacksmith NPC Copy', filePath: 'public/assets/characters/npcs/npc_blacksmith.png', fw: 64, fh: 64, targetHeight: 47 },

  { name: 'Finn Walk Sheet', filePath: 'public/assets/characters/villagers/errand_boy_walk_sheet.png', fw: 64, fh: 64, targetHeight: 35 },
  { name: 'Finn NPC Single', filePath: 'public/assets/characters/villagers/npc_finn.png', fw: 64, fh: 64, targetHeight: 35 },
  { name: 'Finn NPC Copy', filePath: 'public/assets/characters/npcs/npc_finn.png', fw: 64, fh: 64, targetHeight: 35 },

  { name: 'Campfire Knight Idle', filePath: 'public/assets/characters/npcs/campfire_knight_idle_sheet.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Campfire Knight Pray', filePath: 'public/assets/characters/npcs/campfire_knight_pray_sheet.png', fw: 64, fh: 64, targetHeight: 44 },
  { name: 'Campfire Knight Idle Villagers', filePath: 'public/assets/characters/villagers/campfire_knight_idle_sheet.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Campfire Knight Pray Villagers', filePath: 'public/assets/characters/villagers/campfire_knight_pray_sheet.png', fw: 64, fh: 64, targetHeight: 44 },

  // 3. Monsters
  { name: 'Bat Sheet', filePath: 'public/assets/characters/monsters/bat_sheet.png', fw: 32, fh: 32, targetHeight: 30 },
  { name: 'Ghost Sheet', filePath: 'public/assets/characters/monsters/ghost_sheet.png', fw: 32, fh: 32, targetHeight: 30 },
  { name: 'Goblin Scout', filePath: 'public/assets/characters/monsters/goblin_scout_dagger_sheet.png', fw: 64, fh: 64, targetHeight: 24 },
  { name: 'Skull Wolf', filePath: 'public/assets/characters/monsters/skull_wolf_sheet.png', fw: 64, fh: 64, targetHeight: 52 },
  { name: 'The Listener', filePath: 'public/assets/monsters/the_listener.png', fw: 64, fh: 64, targetHeight: 62 },
  { name: 'Shadow Crow', filePath: 'public/assets/characters/monsters/shadow_crow_sheet.png', fw: 64, fh: 64, targetHeight: 32 },
  { name: 'Shadow Eyes', filePath: 'public/assets/characters/monsters/shadow_eyes_sheet.png', fw: 48, fh: 48, targetHeight: 36 },
  { name: 'Fallen Knight', filePath: 'public/assets/characters/enemies/fallen_knight_sheet.png', fw: 64, fh: 64, targetHeight: 47 },
  { name: 'Dread Horseman', filePath: 'public/assets/characters/enemies/dread_horseman_sheet.png', fw: 64, fh: 64, targetHeight: 60 },
  { name: 'Hooded Knight Boss', filePath: 'public/assets/characters/bosses/hooded_knight_sheet.png', fw: 160, fh: 160, targetHeight: 140 }
];

console.log('=== EXECUTING STEP V15-09: PIXEL ART ASSET STANDARDIZATION ===\n');

const results = [];
for (const spec of ASSET_REGISTRY) {
  const res = processAsset(spec);
  if (res) {
    results.push(res);
    console.log(`[DONE] ${spec.name.padEnd(28)} | Orig: ${res.origHeight}px -> Final: ${res.finalHeight}px (Scale: ${res.scale}) | BottomGap: ${res.bottomGap}px`);
  }
}

console.log(`\nProcessed ${results.length} sprite assets successfully.`);
fs.writeFileSync('scripts/standardize_results.json', JSON.stringify(results, null, 2));
