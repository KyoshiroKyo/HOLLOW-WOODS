import fs from 'fs';
import path from 'path';

const targetFiles = [
  'Read/V1.2/README_INDEX.md',
  'Read/V1.2/Reports/C4-12-32/C4-12-32_V1.2_HANDOFF.md',
  'Read/V1.2/QA/V1.2_REGRESSION_CHECKLIST.md'
];

let totalLinks = 0;
let brokenLinks = 0;

for (const tf of targetFiles) {
  if (!fs.existsSync(tf)) {
    console.error('File not found:', tf);
    continue;
  }
  const content = fs.readFileSync(tf, 'utf8');
  const regex = /file:\/\/\/([^\s\)\"\']+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    totalLinks++;
    let target = decodeURIComponent(match[1]);
    if (!fs.existsSync(target)) {
      console.error(`❌ BROKEN LINK in ${tf} -> ${target}`);
      brokenLinks++;
    } else {
      console.log(`✅ [OK] ${target}`);
    }
  }
}

console.log(`\n======================================================`);
console.log(`Link validation completed: ${totalLinks} total links inspected, ${brokenLinks} broken.`);
if (brokenLinks > 0) {
  process.exit(1);
}
