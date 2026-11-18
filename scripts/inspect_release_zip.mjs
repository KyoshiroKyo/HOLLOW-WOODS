import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const zipPath = path.resolve('HOLLOW_WOODS_v1.4.zip');
if (!fs.existsSync(zipPath)) {
  console.error('File không tồn tại:', zipPath);
  process.exit(1);
}

const stat = fs.statSync(zipPath);
console.log('================================================================');
console.log('📦 BẢN PHÁT HÀNH: HOLLOW_WOODS_v1.4.zip');
console.log('================================================================');
console.log(`📁 Đường dẫn: ${zipPath}`);
console.log(`⚖️ Dung lượng: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${stat.size.toLocaleString('vi-VN')} bytes)`);

// Đọc danh sách entry trong file zip bằng PowerShell .NET ZipArchive
const psCommand = `powershell -NoProfile -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null; $zip = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/\\/g, '/')}'); $zip.Entries | Select-Object -ExpandProperty FullName | Sort-Object"`;

const output = execSync(psCommand, { encoding: 'utf-8' });
const allEntries = output.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

console.log(`\n📋 Tổng số file/entry trong gói zip: ${allEntries.length}`);

// Phân tích các file/thư mục ở tầng gốc (Root Level)
const rootItems = new Set();
for (const rawEntry of allEntries) {
  const entry = rawEntry.replace(/\\/g, '/');
  const parts = entry.split('/');
  if (parts.length === 1) {
    rootItems.add(parts[0]);
  } else {
    rootItems.add(parts[0] + '/');
  }
}

console.log('\n📂 Các mục nằm ở LỚP GỐC (ROOT LEVEL) bên trong file zip:');
for (const item of Array.from(rootItems).sort()) {
  console.log(`   ├── ${item}`);
}

// Kiểm tra các yêu cầu nghiêm ngặt
const hasIndexHtmlAtRoot = rootItems.has('index.html');
const hasP2GameJsonAtRoot = rootItems.has('p2game.json');
const hasDistFolderAtRoot = rootItems.has('dist/') || allEntries.some(e => e.startsWith('dist/'));
const hasUnwantedFiles = allEntries.some(e => 
  e.includes('node_modules') || 
  e.includes('.git') || 
  e.includes('.map') || 
  e.startsWith('src/') || 
  e.startsWith('docs/') || 
  e.includes('backup')
);

console.log('\n🔍 KIỂM TRA ĐỐI CHIẾU TIÊU CHUẨN:');
console.log(`   ${hasIndexHtmlAtRoot ? '✅' : '❌'} index.html nằm ngay ở lớp ngoài cùng: ${hasIndexHtmlAtRoot}`);
console.log(`   ${hasP2GameJsonAtRoot ? '✅' : '❌'} p2game.json nằm ngay ở lớp ngoài cùng: ${hasP2GameJsonAtRoot}`);
console.log(`   ${!hasDistFolderAtRoot ? '✅' : '❌'} Không bị bọc bởi thư mục 'dist/': ${!hasDistFolderAtRoot}`);
console.log(`   ${!hasUnwantedFiles ? '✅' : '❌'} Tuyệt đối không chứa thư mục/file rác: ${!hasUnwantedFiles}`);

console.log('================================================================');
