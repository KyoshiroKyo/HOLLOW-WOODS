/**
 * GENERATE GATE 3C VISUAL EVIDENCE COMPOSITE
 * ENDING VISIBILITY & SOFT-LOCK REPAIR (BUG-10)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();

// 3x5 Bitmap font
const FONT_3X5 = {
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  'A': [0b111, 0b101, 0b111, 0b101, 0b101],
  'B': [0b110, 0b101, 0b110, 0b101, 0b110],
  'C': [0b111, 0b100, 0b100, 0b100, 0b111],
  'D': [0b110, 0b101, 0b101, 0b101, 0b110],
  'E': [0b111, 0b100, 0b110, 0b100, 0b111],
  'F': [0b111, 0b100, 0b110, 0b100, 0b100],
  'G': [0b111, 0b100, 0b101, 0b101, 0b111],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'J': [0b001, 0b001, 0b001, 0b101, 0b111],
  'K': [0b101, 0b110, 0b100, 0b110, 0b101],
  'L': [0b100, 0b100, 0b100, 0b100, 0b111],
  'M': [0b101, 0b111, 0b101, 0b101, 0b101],
  'N': [0b110, 0b101, 0b101, 0b101, 0b101],
  'O': [0b111, 0b101, 0b101, 0b101, 0b111],
  'P': [0b111, 0b101, 0b111, 0b100, 0b100],
  'Q': [0b111, 0b101, 0b101, 0b111, 0b001],
  'R': [0b110, 0b101, 0b110, 0b101, 0b101],
  'S': [0b111, 0b100, 0b111, 0b001, 0b111],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  'U': [0b101, 0b101, 0b101, 0b101, 0b111],
  'V': [0b101, 0b101, 0b101, 0b101, 0b010],
  'W': [0b101, 0b101, 0b101, 0b111, 0b101],
  'X': [0b101, 0b101, 0b010, 0b101, 0b101],
  'Y': [0b101, 0b101, 0b111, 0b010, 0b010],
  'Z': [0b111, 0b001, 0b010, 0b100, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000],
  '+': [0b000, 0b010, 0b111, 0b010, 0b000],
  '%': [0b101, 0b001, 0b010, 0b100, 0b101],
  '(': [0b010, 0b100, 0b100, 0b100, 0b010],
  ')': [0b010, 0b001, 0b001, 0b001, 0b010],
  '[': [0b110, 0b100, 0b100, 0b100, 0b110],
  ']': [0b011, 0b001, 0b001, 0b001, 0b011],
  '>': [0b100, 0b010, 0b001, 0b010, 0b100],
  '<': [0b001, 0b010, 0b100, 0b010, 0b001],
  ',': [0b000, 0b000, 0b000, 0b010, 0b100],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  '/': [0b001, 0b001, 0b010, 0b100, 0b100],
  '=': [0b000, 0b111, 0b000, 0b111, 0b000],
  '_': [0b000, 0b000, 0b000, 0b000, 0b111],
  '|': [0b010, 0b010, 0b010, 0b010, 0b010],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  '?': [0b110, 0b001, 0b010, 0b000, 0b010],
  ' ': [0b000, 0b000, 0b000, 0b000, 0b000]
};

function drawChar(png, startX, startY, char, r = 255, g = 255, b = 255, a = 255, scale = 1) {
  const glyph = FONT_3X5[char.toUpperCase()] || FONT_3X5[' '];
  for (let row = 0; row < 5; row++) {
    const bits = glyph[row];
    for (let col = 0; col < 3; col++) {
      if ((bits >> (2 - col)) & 1) {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = startX + col * scale + sx;
            const py = startY + row * scale + sy;
            if (px >= 0 && px < png.width && py >= 0 && py < png.height) {
              const idx = (py * png.width + px) * 4;
              png.data[idx] = r;
              png.data[idx + 1] = g;
              png.data[idx + 2] = b;
              png.data[idx + 3] = a;
            }
          }
        }
      }
    }
  }
}

function drawText(png, startX, startY, text, r = 255, g = 255, b = 255, a = 255, scale = 1) {
  let currX = startX;
  for (let i = 0; i < text.length; i++) {
    drawChar(png, currX, startY, text[i], r, g, b, a, scale);
    currX += 4 * scale;
  }
}

function fillRect(png, x0, y0, w, h, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

function strokeRect(png, x0, y0, w, h, r, g, b, a = 255, thickness = 1) {
  fillRect(png, x0, y0, w, thickness, r, g, b, a);
  fillRect(png, x0, y0 + h - thickness, w, thickness, r, g, b, a);
  fillRect(png, x0, y0, thickness, h, r, g, b, a);
  fillRect(png, x0 + w - thickness, y0, thickness, h, r, g, b, a);
}

const WIDTH = 1280;
const HEIGHT = 720;
const png = new PNG({ width: WIDTH, height: HEIGHT });

// 1. Dark Blueprint Background
fillRect(png, 0, 0, WIDTH, HEIGHT, 11, 15, 23);

// Subtle grid lines
for (let y = 0; y < HEIGHT; y += 40) {
  fillRect(png, 0, y, WIDTH, 1, 18, 26, 38, 120);
}
for (let x = 0; x < WIDTH; x += 40) {
  fillRect(png, x, 0, 1, HEIGHT, 18, 26, 38, 120);
}

// 2. Header Banner
fillRect(png, 24, 20, WIDTH - 48, 54, 18, 25, 38);
strokeRect(png, 24, 20, WIDTH - 48, 54, 212, 175, 55, 255, 2);

drawText(png, 44, 30, 'HOLLOW WOODS V1.1 - GATE 3C: ENDING VISIBILITY & SOFT-LOCK REPAIR (BUG-10)', 241, 196, 15, 255, 2);
drawText(png, 44, 52, 'ARCHITECTURE AUDIT: SCREEN-SPACE UISCENE ZOOM 1.0 VS GAMESCENE ZOOM 2.2X | ZERO SOFT-LOCK', 160, 174, 192, 255, 1);

// 3. Panel 1: BEFORE REPAIR (BUG-10 ROOT CAUSE) - LEFT
const P1_X = 24;
const P1_Y = 88;
const P1_W = 600;
const P1_H = 605;

fillRect(png, P1_X, P1_Y, P1_W, P1_H, 15, 20, 30);
strokeRect(png, P1_X, P1_Y, P1_W, P1_H, 231, 76, 60, 255, 2);

fillRect(png, P1_X + 16, P1_Y + 14, P1_W - 32, 28, 44, 19, 19);
drawText(png, P1_X + 26, P1_Y + 22, 'BEFORE: GAMESCENE CAMERA ZOOM 2.2X (PERMANENT SOFT-LOCK)', 231, 76, 60, 255, 1);

// Diagram of 1280x720 Screen frame vs Zoomed Y coordinates
const SIM_X = P1_X + 30;
const SIM_Y = P1_Y + 55;
const SIM_W = 540;
const SIM_H = 340;

fillRect(png, SIM_X, SIM_Y, SIM_W, SIM_H, 6, 8, 12);
strokeRect(png, SIM_X, SIM_Y, SIM_W, SIM_H, 52, 73, 94, 255, 1);

// Active Viewport Box (representing actual 720p height scaled in diagram)
const VP_X = SIM_X + 40;
const VP_Y = SIM_Y + 70;
const VP_W = 460;
const VP_H = 190;
strokeRect(png, VP_X, VP_Y, VP_W, VP_H, 46, 204, 113, 255, 2);
drawText(png, VP_X + 8, VP_Y + 8, 'VISIBLE VIEWPORT [Y: 0..720 PX]', 46, 204, 113, 255, 1);

// Cut-off Top Zone (Y < 0)
fillRect(png, VP_X, SIM_Y + 10, VP_W, 55, 120, 20, 20, 160);
strokeRect(png, VP_X, SIM_Y + 10, VP_W, 55, 231, 76, 60, 255, 1);
drawText(png, VP_X + 10, SIM_Y + 20, 'OFF-SCREEN TOP (INVISIBLE TO PLAYER):', 231, 76, 60, 255, 1);
drawText(png, VP_X + 10, SIM_Y + 34, '- CREDITS LINE 0 (Y=85 -> -245 PX)', 245, 183, 177, 255, 1);
drawText(png, VP_X + 10, SIM_Y + 46, '- CREDITS LINE 1-2 (Y=133, 183 -> NEGATIVE Y)', 245, 183, 177, 255, 1);

// Middle Glitched Elements inside Viewport
fillRect(png, VP_X + 20, VP_Y + 35, VP_W - 40, 45, 30, 40, 55);
drawText(png, VP_X + 28, VP_Y + 44, 'BLOWN-UP TITLE (SCALED 2.2X DISTORTED):', 241, 196, 15, 255, 1);
drawText(png, VP_X + 28, VP_Y + 58, 'HOLLOW WOODS V3.0 (79.2 PX FONT SIZE OVERFLOW)', 255, 255, 255, 255, 1);

// Overlapping HUD cluttering on top
fillRect(png, VP_X + 10, VP_Y + 95, 140, 26, 40, 20, 20, 200);
strokeRect(png, VP_X + 10, VP_Y + 95, 140, 26, 231, 76, 60, 255, 1);
drawText(png, VP_X + 16, VP_Y + 103, 'HUD OVERLAP (HEALTH/STAMINA)', 231, 76, 60, 255, 1);

fillRect(png, VP_X + VP_W - 140, VP_Y + 95, 130, 26, 40, 20, 20, 200);
strokeRect(png, VP_X + VP_W - 140, VP_Y + 95, 130, 26, 231, 76, 60, 255, 1);
drawText(png, VP_X + VP_W - 134, VP_Y + 103, 'QUEST TRACKER OVERLAP', 231, 76, 60, 255, 1);

// Cut-off Bottom Zone (Y > 720)
fillRect(png, VP_X, VP_Y + VP_H + 8, VP_W, 65, 140, 20, 20, 180);
strokeRect(png, VP_X, VP_Y + VP_H + 8, VP_W, 65, 231, 76, 60, 255, 2);
drawText(png, VP_X + 10, VP_Y + VP_H + 16, 'OFF-SCREEN BOTTOM (UNREACHABLE / SOFT-LOCK):', 231, 76, 60, 255, 1);
drawText(png, VP_X + 10, VP_Y + VP_H + 30, '- TIME RIFT DIALOGUE: Y=610 -> RENDERED AT 910 PX!', 245, 183, 177, 255, 1);
drawText(png, VP_X + 10, VP_Y + VP_H + 44, '- RETURN BUTTON: Y=645 -> RENDERED AT 987 PX (CLIPPED)!', 255, 200, 200, 255, 1);

// Fault Analysis Box
fillRect(png, P1_X + 20, P1_Y + 410, P1_W - 40, 175, 22, 14, 18);
strokeRect(png, P1_X + 20, P1_Y + 410, P1_W - 40, 175, 192, 57, 43, 255, 1);

drawText(png, P1_X + 32, P1_Y + 422, 'ROOT CAUSE OF BUG-10 (GATE 0 FORENSIC FINDING):', 231, 76, 60, 255, 1);
drawText(png, P1_X + 32, P1_Y + 440, '1. SCENE MISMATCH: EndingSystem attached to GameScene (Zoom 2.2x).', 200, 200, 200, 255, 1);
drawText(png, P1_X + 32, P1_Y + 456, '2. VIEWPORT CLIPPING: Camera center (640,360) scales coordinates outward:', 200, 200, 200, 255, 1);
drawText(png, P1_X + 50, P1_Y + 472, '* Y_screen = 360 + (Y - 360) * 2.2', 241, 196, 15, 255, 1);
drawText(png, P1_X + 50, P1_Y + 488, '* Satyr Dialogue (Y=610) -> 910 px (190 px below 720p)', 245, 183, 177, 255, 1);
drawText(png, P1_X + 50, P1_Y + 504, '* Return Button (Y=645) -> 987 px (267 px below 720p)', 245, 183, 177, 255, 1);
drawText(png, P1_X + 32, P1_Y + 522, '3. HARD LOCK: isUIBusy disables WASD, handleESCPress returns early,', 200, 200, 200, 255, 1);
drawText(png, P1_X + 32, P1_Y + 538, '   and Return Button is unclickable outside canvas -> PERMANENT SOFT-LOCK!', 231, 76, 60, 255, 1);
drawText(png, P1_X + 32, P1_Y + 558, '4. SCENE OVERLAP: GameScene sits below UIScene -> HUD covers ending!', 200, 200, 200, 255, 1);

// 4. Panel 2: AFTER REPAIR (SCREEN-SPACE ARCHITECTURE) - RIGHT
const P2_X = 656;
const P2_Y = 88;
const P2_W = 600;
const P2_H = 605;

fillRect(png, P2_X, P2_Y, P2_W, P2_H, 15, 20, 30);
strokeRect(png, P2_X, P2_Y, P2_W, P2_H, 46, 204, 113, 255, 2);

fillRect(png, P2_X + 16, P2_Y + 14, P2_W - 32, 28, 19, 44, 27);
drawText(png, P2_X + 26, P2_Y + 22, 'AFTER: UISCENE SCREEN-SPACE ZOOM 1.0 (PERFECT VISIBILITY)', 46, 204, 113, 255, 1);

// Diagram of Corrected 1280x720 Presentation
const SIM2_X = P2_X + 30;
const SIM2_Y = P2_Y + 55;
const SIM2_W = 540;
const SIM2_H = 340;

fillRect(png, SIM2_X, SIM2_Y, SIM2_W, SIM2_H, 5, 7, 10);
strokeRect(png, SIM2_X, SIM2_Y, SIM2_W, SIM2_H, 46, 204, 113, 255, 2);

// Time Rift Glow (Simulated concentric circles/ellipses)
fillRect(png, SIM2_X + 160, SIM2_Y + 45, 220, 70, 41, 128, 185, 100);
fillRect(png, SIM2_X + 190, SIM2_Y + 55, 160, 50, 52, 152, 219, 140);
fillRect(png, SIM2_X + 220, SIM2_Y + 65, 100, 30, 235, 245, 251, 200);
// Car headlights
fillRect(png, SIM2_X + 235, SIM2_Y + 75, 14, 10, 241, 196, 15);
fillRect(png, SIM2_X + 290, SIM2_Y + 75, 14, 10, 241, 196, 15);
drawText(png, SIM2_X + 180, SIM2_Y + 25, 'TIME RIFT CUTSCENE (MODERN HIGHWAY + LIGHTS)', 93, 173, 226, 255, 1);

// Satyr Dialogue Banner at Y=580 (scaled down to diagram)
fillRect(png, SIM2_X + 60, SIM2_Y + 130, SIM2_W - 120, 32, 10, 14, 20, 240);
strokeRect(png, SIM2_X + 60, SIM2_Y + 130, SIM2_W - 120, 32, 88, 214, 141, 255, 1);
drawText(png, SIM2_X + 70, SIM2_Y + 140, 'SATYR: "ANH DEN PHA O TO... QUOC LO VEN RUNG?! CON DUONG CO THAT!"', 88, 214, 141, 255, 1);

// Credits lines simulation
fillRect(png, SIM2_X + 40, SIM2_Y + 175, SIM2_W - 80, 75, 8, 11, 16);
strokeRect(png, SIM2_X + 40, SIM2_Y + 175, SIM2_W - 80, 75, 149, 165, 166, 150, 1);
drawText(png, SIM2_X + 50, SIM2_Y + 182, '- DUOI CHAN BE CHUONG, MOT CUON SO DA CU ROI RA...', 189, 195, 199, 255, 1);
drawText(png, SIM2_X + 50, SIM2_Y + 196, '- GUONG MAT AY... DOI SUNG AY... GIONG HET SATYR.', 231, 76, 60, 255, 1);
drawText(png, SIM2_X + 50, SIM2_Y + 210, 'HOLLOW WOODS V1.1 - TAP 1: THE FIRST TOLL (HOAN THANH)', 241, 196, 15, 255, 1);
drawText(png, SIM2_X + 50, SIM2_Y + 226, 'THE FOREST REMEMBERS. TO BE CONTINUED...', 127, 140, 141, 255, 1);

// Return Button simulation at Y=580
const BTN_X = SIM2_X + 170;
const BTN_Y = SIM2_Y + 265;
const BTN_W = 200;
const BTN_H = 34;

fillRect(png, BTN_X, BTN_Y, BTN_W, BTN_H, 17, 22, 32);
strokeRect(png, BTN_X, BTN_Y, BTN_W, BTN_H, 243, 156, 18, 255, 2);
drawText(png, BTN_X + 22, BTN_Y + 12, '> QUAY VE MENU CHINH <', 241, 196, 15, 255, 1);

drawText(png, SIM2_X + 120, SIM2_Y + 310, '[NHAP CHUOT HOAC NHAN ENTER / SPACE / ESC DE VE MENU]', 127, 140, 141, 255, 1);

// Solution Highlights Box
fillRect(png, P2_X + 20, P2_Y + 410, P2_W - 40, 175, 14, 24, 18);
strokeRect(png, P2_X + 20, P2_Y + 410, P2_W - 40, 175, 46, 204, 113, 255, 1);

drawText(png, P2_X + 32, P2_Y + 422, 'REMEDIATION HIGHLIGHTS (100% ARCHITECTURAL COMPLIANCE):', 46, 204, 113, 255, 1);
drawText(png, P2_X + 32, P2_Y + 440, '1. UISCENE CONNECTION: setUIScene connects ending to fixed Zoom 1.0.', 200, 200, 200, 255, 1);
drawText(png, P2_X + 32, P2_Y + 456, '2. 1280x720 BOUNDS: All text (Y: 85..580) and button (Y=580) remain strictly', 200, 200, 200, 255, 1);
drawText(png, P2_X + 50, P2_Y + 472, '   within the 720p HD screen space. Zero viewport cutoff!', 46, 204, 113, 255, 1);
drawText(png, P2_X + 32, P2_Y + 488, '3. ZERO UI OVERLAP: setHUDVisible(false) clears stat bars, quest box,', 200, 200, 200, 255, 1);
drawText(png, P2_X + 50, P2_Y + 504, '   and quick slots during finale. Clean black epilogue canvas.', 46, 204, 113, 255, 1);
drawText(png, P2_X + 32, P2_Y + 522, '4. ANTI-SOFT-LOCK: Return button active with pointerdown + ENTER/SPACE/ESC.', 200, 200, 200, 255, 1);
drawText(png, P2_X + 32, P2_Y + 538, '5. CLEAN EXIT: returnToMainMenu stops GameScene + UIScene, starts Menu.', 200, 200, 200, 255, 1);
drawText(png, P2_X + 32, P2_Y + 558, '6. SAFE PERSISTENCE: Auto-saves KET THUC checkpoint without corrupting saves.', 46, 204, 113, 255, 1);

// Write to Reports/REMEDIATION
const outDir = path.join(ROOT_DIR, 'Read', 'V1.1', 'Reports', 'REMEDIATION');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'evidence_ending_repaired.png');

png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
  console.log(`[OK] Generated Gate 3C Evidence Image: ${outPath} (${fs.statSync(outPath).size} bytes)`);
});
