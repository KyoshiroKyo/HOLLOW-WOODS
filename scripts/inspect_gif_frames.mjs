import fs from 'fs';

// Read GIF headers and count frames
function countGifFrames(filePath) {
  const buf = fs.readFileSync(filePath);
  let frames = 0;
  for (let i = 0; i < buf.length - 2; i++) {
    // 0x21, 0xF9 is Graphic Control Extension
    if (buf[i] === 0x21 && buf[i+1] === 0xF9) {
      frames++;
    }
  }
  return frames;
}

const previewDir = 'Pixel_Art/Hooded Knight Sprites/Previews';
for (const f of fs.readdirSync(previewDir).filter(x => x.endsWith('.gif'))) {
  const count = countGifFrames(`${previewDir}/${f}`);
  console.log(`${f}: ${count} frames`);
}
