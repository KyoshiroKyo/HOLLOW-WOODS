import fs from 'fs';
import { PNG } from 'pngjs';

const buf = fs.readFileSync('public/assets/environment/sprites/signpost.png');
const png = PNG.sync.read(buf);

console.log(`Original signpost dimensions: ${png.width}x${png.height}`);

// Wood base colors:
// Light wood face: 135, 109, 78
// Carved dark groove: 99, 65, 40
// Highlight groove edge: 145, 122, 92

// Let's first restore the sign face between y=8..11 and x=4..22 to clean wood face
const woodFaceR = 135;
const woodFaceG = 109;
const woodFaceB = 78;

const grooveR = 98;
const grooveG = 64;
const grooveB = 38;

const highlightR = 144;
const highlightG = 120;
const highlightB = 90;

function setPixel(x, y, r, g, b, a = 255) {
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function getPixel(x, y) {
  const idx = (png.width * y + x) << 2;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3]
  };
}

// Clear the existing "EAST" carving area (x=5..21, y=8..11) back to base wood face
for (let y = 8; y <= 11; y++) {
  for (let x = 5; x <= 21; x++) {
    // only if pixel is already part of the sign board
    const p = getPixel(x, y);
    if (p.a > 200) {
      setPixel(x, y, woodFaceR, woodFaceG, woodFaceB, 255);
    }
  }
}

// Now let's carve "ĐÔNG ►" in pixel-art
// Total width available on sign face: x=4..22 (19 px)
// y=7..11
// Pattern matrix for "ĐÔNG ►":
// x=4: Đ (3x4), x=8: Ô (3x4), x=12: N (3x4), x=16: G (3x4), x=20: ► (2x3)

const textPattern = [
  // y=7 (accent marks: bar for Đ, hat ^ for Ô)
  " .X. .X. ... ... .. ", // y=7
  // y=8 (top of letters)
  " XXX XXX X.X XXX ...", // y=8
  // y=9 (mid)
  " XXX X.X XX. X.. .X.", // y=9
  // y=10 (mid-lower)
  " X.X X.X X.X X.X XX.", // y=10
  // y=11 (bottom)
  " XX. XXX X.X XXX .X."  // y=11
];

const startX = 4;
const startY = 7;

for (let row = 0; row < textPattern.length; row++) {
  const y = startY + row;
  const line = textPattern[row];
  for (let col = 0; col < line.length; col++) {
    const ch = line[col];
    const x = startX + col;
    if (ch === 'X') {
      // Carved groove pixel
      setPixel(x, y, grooveR, grooveG, grooveB, 255);
      // If bottom edge can have subtle highlight
      if (y + 1 <= 12) {
        const below = getPixel(x, y + 1);
        if (below.a > 200 && below.r === woodFaceR) {
          // keep natural or give slight depth
        }
      }
    }
  }
}

const outBuf = PNG.sync.write(png);
fs.writeFileSync('public/assets/environment/sprites/signpost.png', outBuf);
console.log('Successfully updated signpost.png with "ĐÔNG ►" carving!');
