import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tempDir = path.resolve('Read/V3.0/Temp/executioner');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const zipPath = path.resolve('Pixel_Art/Undead executioner.zip');
console.log('Unzipping:', zipPath, '->', tempDir);

execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempDir}' -Force"`);
console.log('Extracted contents:');
console.log(fs.readdirSync(tempDir, { recursive: true }));

