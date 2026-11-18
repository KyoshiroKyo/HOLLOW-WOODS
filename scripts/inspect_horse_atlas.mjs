import fs from 'fs';
import { PNG } from 'pngjs';

const horseDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0';
const hBuf = fs.readFileSync(`${horseDir}/64x64_Atlas_HorseRider_II_Complete.png`);
const hPng = PNG.sync.read(hBuf);

// Let's inspect other Rider files in PixelHorse to know what row 0..5 correspond to:
const riderDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0/Rider/Rider Complete';
for (const f of fs.readdirSync(riderDir).filter(x => x.endsWith('.png'))) {
  const buf = fs.readFileSync(`${riderDir}/${f}`);
  const png = PNG.sync.read(buf);
  console.log(`${f}: ${png.width}x${png.height} -> ${png.width/64} cols x ${png.height/64} rows`);
}
