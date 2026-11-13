/**
 * HOLLOW WOODS V3.0 – PASS 0 Asset Inspector
 * Script kiểm tra Satyr sprite sheet và các gói môi trường.
 * Chạy bằng Node.js thuần (không cần thư viện ngoài).
 * Đọc PNG raw để phân tích kích thước, frame, alpha bounds.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const PIXEL_ART = 'G:\\HOLLOW WOODS V3\\Pixel_Art';

// ===================== PNG PARSER (no deps) =====================
function parsePNG(buf) {
  // Verify PNG signature
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== sig[i]) throw new Error('Not a PNG file');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;

  // Read IHDR chunk
  while (offset < buf.length) {
    const chunkLen = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    if (chunkType === 'IHDR') {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
      bitDepth = buf[offset + 16];
      colorType = buf[offset + 17];
      break;
    }
    offset += 12 + chunkLen;
  }

  return { width, height, bitDepth, colorType };
}

// Decode raw RGBA pixels from PNG using zlib inflate on IDAT chunks
import { inflateSync } from 'zlib';

function decodePNGPixels(buf) {
  const info = parsePNG(buf);
  const { width, height, bitDepth, colorType } = info;

  // Collect all IDAT data
  let offset = 8;
  const idatChunks = [];
  while (offset < buf.length) {
    const chunkLen = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    if (chunkType === 'IDAT') {
      idatChunks.push(buf.subarray(offset + 8, offset + 8 + chunkLen));
    }
    if (chunkType === 'IEND') break;
    offset += 12 + chunkLen;
  }

  const compressed = Buffer.concat(idatChunks);
  const raw = inflateSync(compressed);

  // Determine bytes per pixel
  let bpp;
  switch (colorType) {
    case 6: bpp = 4; break; // RGBA
    case 2: bpp = 3; break; // RGB
    case 4: bpp = 2; break; // Greyscale+Alpha
    case 0: bpp = 1; break; // Greyscale
    case 3: bpp = 1; break; // Indexed (palette)
    default: bpp = 4;
  }

  // Unfilter scanlines
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);

  // Parse palette if indexed
  let palette = null;
  let tRNS = null;
  if (colorType === 3) {
    offset = 8;
    while (offset < buf.length) {
      const chunkLen = buf.readUInt32BE(offset);
      const chunkType = buf.toString('ascii', offset + 4, offset + 8);
      if (chunkType === 'PLTE') {
        palette = buf.subarray(offset + 8, offset + 8 + chunkLen);
      }
      if (chunkType === 'tRNS') {
        tRNS = buf.subarray(offset + 8, offset + 8 + chunkLen);
      }
      if (chunkType === 'IEND') break;
      offset += 12 + chunkLen;
    }
  }

  for (let y = 0; y < height; y++) {
    const rawOffset = y * (stride + 1);
    const filterType = raw[rawOffset];
    const scanline = raw.subarray(rawOffset + 1, rawOffset + 1 + stride);
    const destOffset = y * stride;
    const prevLine = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? pixels[destOffset + x - bpp] : 0;
      const b = prevLine[x];
      const c = x >= bpp ? prevLine[x - bpp] : 0;
      let val = scanline[x];

      switch (filterType) {
        case 0: break; // None
        case 1: val = (val + a) & 0xFF; break; // Sub
        case 2: val = (val + b) & 0xFF; break; // Up
        case 3: val = (val + Math.floor((a + b) / 2)) & 0xFF; break; // Average
        case 4: { // Paeth
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
          val = (val + pr) & 0xFF;
          break;
        }
      }
      pixels[destOffset + x] = val;
    }
  }

  // Convert to RGBA if needed
  let rgba;
  if (colorType === 6) {
    rgba = pixels;
  } else if (colorType === 2) {
    // RGB -> RGBA
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = pixels[i * 3];
      rgba[i * 4 + 1] = pixels[i * 3 + 1];
      rgba[i * 4 + 2] = pixels[i * 3 + 2];
      rgba[i * 4 + 3] = 255;
    }
  } else if (colorType === 3 && palette) {
    // Indexed -> RGBA
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const idx = pixels[i];
      rgba[i * 4] = palette[idx * 3];
      rgba[i * 4 + 1] = palette[idx * 3 + 1];
      rgba[i * 4 + 2] = palette[idx * 3 + 2];
      rgba[i * 4 + 3] = tRNS && idx < tRNS.length ? tRNS[idx] : 255;
    }
  } else if (colorType === 4) {
    // GA -> RGBA
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const g = pixels[i * 2];
      const a2 = pixels[i * 2 + 1];
      rgba[i * 4] = g;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = g;
      rgba[i * 4 + 3] = a2;
    }
  } else {
    // Greyscale -> RGBA
    rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = pixels[i];
      rgba[i * 4 + 1] = pixels[i];
      rgba[i * 4 + 2] = pixels[i];
      rgba[i * 4 + 3] = 255;
    }
  }

  return { width, height, bitDepth, colorType, rgba };
}

// ===================== OPAQUE BOUNDS ANALYSIS =====================
function analyzeOpaqueBounds(rgba, width, height, alphaThreshold = 16) {
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let opaquePixels = 0;
  let totalPixels = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = rgba[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        opaquePixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (opaquePixels === 0) {
    return { opaqueWidth: 0, opaqueHeight: 0, minX: 0, minY: 0, maxX: 0, maxY: 0, opaquePixels: 0, totalPixels, footGapBottom: height };
  }

  return {
    opaqueWidth: maxX - minX + 1,
    opaqueHeight: maxY - minY + 1,
    minX, minY, maxX, maxY,
    opaquePixels,
    totalPixels,
    footGapBottom: height - 1 - maxY,
    headGapTop: minY,
  };
}

// ===================== FRAME ANALYSIS =====================
function analyzeFrames(rgba, canvasW, canvasH, frameW, frameH, alphaThreshold = 16) {
  const cols = Math.floor(canvasW / frameW);
  const rows = Math.floor(canvasH / frameH);
  const frames = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const fx = col * frameW;
      const fy = row * frameH;

      // Extract sub-region
      let hasContent = false;
      let fMinX = frameW, fMaxX = 0, fMinY = frameH, fMaxY = 0;

      for (let y = 0; y < frameH; y++) {
        for (let x = 0; x < frameW; x++) {
          const alpha = rgba[((fy + y) * canvasW + (fx + x)) * 4 + 3];
          if (alpha > alphaThreshold) {
            hasContent = true;
            if (x < fMinX) fMinX = x;
            if (x > fMaxX) fMaxX = x;
            if (y < fMinY) fMinY = y;
            if (y > fMaxY) fMaxY = y;
          }
        }
      }

      if (hasContent) {
        frames.push({
          row, col,
          x: fx, y: fy,
          opaqueWidth: fMaxX - fMinX + 1,
          opaqueHeight: fMaxY - fMinY + 1,
          footGapBottom: frameH - 1 - fMaxY,
        });
      }
    }
  }

  return { cols, rows, totalSlots: cols * rows, filledFrames: frames.length, frames };
}

// ===================== ZIP INSPECTION =====================
function inspectZipContents(zipPath) {
  try {
    const buf = readFileSync(zipPath);
    // Parse ZIP central directory
    // Find End of Central Directory
    let eocdOffset = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf.readUInt32LE(i) === 0x06054b50) {
        eocdOffset = i;
        break;
      }
    }
    if (eocdOffset < 0) return { error: 'No EOCD found' };

    const cdOffset = buf.readUInt32LE(eocdOffset + 16);
    const cdEntries = buf.readUInt16LE(eocdOffset + 10);

    const entries = [];
    let pos = cdOffset;
    for (let i = 0; i < cdEntries && pos < buf.length; i++) {
      if (buf.readUInt32LE(pos) !== 0x02014b50) break;
      const compSize = buf.readUInt32LE(pos + 20);
      const uncompSize = buf.readUInt32LE(pos + 24);
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
      entries.push({ name, compSize, uncompSize });
      pos += 46 + nameLen + extraLen + commentLen;
    }

    return {
      totalEntries: entries.length,
      entries: entries.filter(e => !e.name.endsWith('/')),
    };
  } catch (e) {
    return { error: e.message };
  }
}

// ===================== MAIN =====================
console.log('=== HOLLOW WOODS V3.0 – PASS 0 ASSET INSPECTION ===\n');

// 1. SATYR SPRITE_SHEET.png
console.log('──── 1. SATYR SPRITE_SHEET.png ────');
const sheetPath = join(PIXEL_ART, 'Satyr', 'SPRITE_SHEET.png');
const sheetBuf = readFileSync(sheetPath);
const sheet = decodePNGPixels(sheetBuf);
console.log(`Canvas: ${sheet.width}×${sheet.height}  BitDepth: ${sheet.bitDepth}  ColorType: ${sheet.colorType}`);

// Whole-sheet opaque bounds
const wholeBounds = analyzeOpaqueBounds(sheet.rgba, sheet.width, sheet.height);
console.log(`Whole-sheet opaque bounds: ${wholeBounds.opaqueWidth}×${wholeBounds.opaqueHeight}`);
console.log(`  Top-Left: (${wholeBounds.minX}, ${wholeBounds.minY})  Bottom-Right: (${wholeBounds.maxX}, ${wholeBounds.maxY})`);

// Try common frame sizes
const candidateFrameSizes = [];
for (let fw of [16, 24, 32, 48, 64, 96, 128]) {
  for (let fh of [16, 24, 32, 48, 64, 96, 128]) {
    if (sheet.width % fw === 0 && sheet.height % fh === 0) {
      const cols = sheet.width / fw;
      const rows = sheet.height / fh;
      if (cols >= 1 && rows >= 1 && cols <= 32 && rows <= 32) {
        candidateFrameSizes.push({ fw, fh, cols, rows });
      }
    }
  }
}

console.log(`\nCandidate frame sizes (divides canvas evenly):`);
let bestAnalysis = null;
let bestFrameW = 0, bestFrameH = 0;

for (const c of candidateFrameSizes) {
  const analysis = analyzeFrames(sheet.rgba, sheet.width, sheet.height, c.fw, c.fh);
  const fillRatio = analysis.filledFrames / analysis.totalSlots;
  console.log(`  ${c.fw}×${c.fh} → ${c.cols}col × ${c.rows}row = ${analysis.totalSlots} slots, ${analysis.filledFrames} filled (${(fillRatio * 100).toFixed(0)}%)`);

  // Pick the frame size with reasonable fill (>50%) and frame count
  if (analysis.filledFrames >= 2 && fillRatio > 0.3) {
    if (!bestAnalysis || (c.fw * c.fh > bestFrameW * bestFrameH && fillRatio > 0.3)) {
      bestAnalysis = analysis;
      bestFrameW = c.fw;
      bestFrameH = c.fh;
    }
  }
}

if (bestAnalysis) {
  console.log(`\n>>> Best frame size: ${bestFrameW}×${bestFrameH} (${bestAnalysis.cols} cols × ${bestAnalysis.rows} rows, ${bestAnalysis.filledFrames} filled frames)`);
  console.log(`\nPer-frame opaque analysis:`);

  // Group frames by row for direction analysis
  const byRow = {};
  for (const f of bestAnalysis.frames) {
    if (!byRow[f.row]) byRow[f.row] = [];
    byRow[f.row].push(f);
  }

  for (const [row, frames] of Object.entries(byRow)) {
    const avgW = frames.reduce((s, f) => s + f.opaqueWidth, 0) / frames.length;
    const avgH = frames.reduce((s, f) => s + f.opaqueHeight, 0) / frames.length;
    const avgFoot = frames.reduce((s, f) => s + f.footGapBottom, 0) / frames.length;
    console.log(`  Row ${row}: ${frames.length} frames, avg opaque ${avgW.toFixed(1)}×${avgH.toFixed(1)}, avg footGap ${avgFoot.toFixed(1)}`);
  }

  // Detailed per-frame output
  console.log(`\nAll frames detail:`);
  for (const f of bestAnalysis.frames) {
    console.log(`  [R${f.row},C${f.col}] opaque: ${f.opaqueWidth}×${f.opaqueHeight}, footGap: ${f.footGapBottom}`);
  }
}

// Display scaling
console.log(`\n──── Hiển thị phóng trên 640×360 ────`);
if (bestAnalysis && bestAnalysis.frames.length > 0) {
  const maxOH = Math.max(...bestAnalysis.frames.map(f => f.opaqueHeight));
  const maxOW = Math.max(...bestAnalysis.frames.map(f => f.opaqueWidth));
  console.log(`Max opaque size: ${maxOW}×${maxOH}`);
  for (const scale of [2, 3]) {
    const dispW = maxOW * scale;
    const dispH = maxOH * scale;
    const screenW = 640 * scale;
    const screenH = 360 * scale;
    const pctH = ((dispH / 360) * 100).toFixed(1);
    console.log(`  ${scale}× → display ${dispW}×${dispH} trên ${screenW}×${screenH} (virtual 640×360), chiếm ${pctH}% chiều cao virtual`);
  }
}

// 2. SATYR SPRITE_PORTRAIT.png
console.log('\n──── 2. SATYR SPRITE_PORTRAIT.png ────');
const portraitPath = join(PIXEL_ART, 'Satyr', 'SPRITE_PORTRAIT.png');
const portraitBuf = readFileSync(portraitPath);
const portrait = decodePNGPixels(portraitBuf);
console.log(`Canvas: ${portrait.width}×${portrait.height}  BitDepth: ${portrait.bitDepth}  ColorType: ${portrait.colorType}`);
const portraitBounds = analyzeOpaqueBounds(portrait.rgba, portrait.width, portrait.height);
console.log(`Opaque bounds: ${portraitBounds.opaqueWidth}×${portraitBounds.opaqueHeight}`);

// 3. SATYR_sprite_sheet _2.zip contents
console.log('\n──── 3. SATYR_sprite_sheet _2.zip ────');
const satyrZipPath = join(PIXEL_ART, 'SATYR_sprite_sheet _2.zip');
if (existsSync(satyrZipPath)) {
  const zipInfo = inspectZipContents(satyrZipPath);
  console.log(`Total file entries: ${zipInfo.totalEntries || 0}`);
  if (zipInfo.entries) {
    for (const e of zipInfo.entries.slice(0, 30)) {
      console.log(`  ${e.name} (${e.uncompSize} bytes)`);
    }
    if (zipInfo.entries.length > 30) console.log(`  ... and ${zipInfo.entries.length - 30} more`);
  }
} else {
  console.log('File not found');
}

// 4. Environment ZIPs
console.log('\n──── 4. Environment Asset ZIPs ────');
const envZips = [
  'Pixel Art Top Down - Basic v1.2.3.zip',
  'Pixel_Castle_Medieval_Tileset_v1.0.zip',
  'TopDownFantasy_Forest_v1.zip',
  'Pixel_Castle_Interior_Tileset_v1.0.zip',
  'Forest-Asset-Pack.zip',
  'Updated-Trees.zip',
  'The Fan-tasy Tileset (Free) 1.5.9.zip',
];

for (const z of envZips) {
  const zp = join(PIXEL_ART, z);
  if (existsSync(zp)) {
    const info = inspectZipContents(zp);
    console.log(`\n${z}:`);
    console.log(`  Files: ${info.totalEntries || 0}`);
    if (info.entries) {
      // Show key files (images)
      const images = info.entries.filter(e => /\.(png|jpg|jpeg|bmp)$/i.test(e.name));
      console.log(`  Image files: ${images.length}`);
      for (const img of images.slice(0, 15)) {
        console.log(`    ${img.name} (${img.uncompSize}b)`);
      }
      if (images.length > 15) console.log(`    ... and ${images.length - 15} more images`);
    }
  } else {
    console.log(`\n${z}: NOT FOUND`);
  }
}

// 5. PenzillaDesign License
console.log('\n──── 5. PenzillaDesign License ────');
const licPath = join(PIXEL_ART, 'PenzillaDesign_StandardLicense.pdf');
if (existsSync(licPath)) {
  const licSize = statSync(licPath).size;
  console.log(`Found: ${licPath} (${licSize} bytes)`);
  // Try to extract text from PDF (basic)
  const licBuf = readFileSync(licPath);
  const licText = licBuf.toString('latin1');
  // Find streams and extract text
  const textParts = [];
  const streamRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = streamRegex.exec(licText)) !== null) {
    const block = match[1];
    // Extract Tj text
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }
  }
  if (textParts.length > 0) {
    console.log(`Extracted text snippets: ${textParts.slice(0, 20).join(' | ')}`);
  } else {
    console.log('Could not extract text (binary/compressed PDF). Manual review needed.');
  }
} else {
  console.log('License file NOT FOUND');
}

// 6. Pixel Bat Pig Spider Worms status
console.log('\n──── 6. Pixel Bat Pig Spider Worms (CHƯA DUYỆT) ────');
const bpswDir = join(PIXEL_ART, 'Pixel Bat Pig Spider Worms');
if (existsSync(bpswDir)) {
  const subs = readdirSync(bpswDir);
  console.log(`Subfolders: ${subs.join(', ')}`);
  console.log('STATUS: CHƯA ĐƯỢC DUYỆT - Không đưa vào production');
}

// 7. Community assets summary
console.log('\n──── 7. Community Reference Assets ────');
const communityDir = 'G:\\HOLLOW WOODS V3\\reference\\community_asset_sources';
if (existsSync(communityDir)) {
  const folders = readdirSync(communityDir);
  for (const f of folders) {
    const fp = join(communityDir, f);
    if (statSync(fp).isDirectory()) {
      const metaPath = join(fp, 'SOURCE_METADATA.json');
      if (existsSync(metaPath)) {
        try {
          const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
          console.log(`  ${f}: ${meta.title || meta.name || 'N/A'} - License: ${meta.license || 'N/A'}`);
        } catch {
          console.log(`  ${f}: metadata parse error`);
        }
      } else {
        // count files
        const files = readdirSync(fp, { recursive: true });
        console.log(`  ${f}: ${files.length} items (no SOURCE_METADATA.json)`);
      }
    }
  }
}

console.log('\n=== INSPECTION COMPLETE ===');
process.exit(0);

