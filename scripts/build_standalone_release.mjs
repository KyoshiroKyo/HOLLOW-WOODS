#!/usr/bin/env node

/**
 * ============================================================================
 * HOLLOW WOODS V1.5 — BUILD STANDALONE PLAYTEST PACKAGE FOR TEAMMATES
 * ============================================================================
 * Tự động đóng gói bản chơi độc lập cho đồng đội:
 * - Không cần mã nguồn hay môi trường lập trình (Node.js/npm)
 * - Tự động copy toàn bộ nội dung đã build từ dist/
 * - Tích hợp launcher 1-click CHƠI_GAME.bat & server.ps1 (chạy ngay trên mọi máy Windows)
 * - Tích hợp CHƠI_GAME.sh cho macOS / Linux
 * - Tích hợp HUONG_DAN_CHOI_GAME.txt chi tiết hướng dẫn phím và lộ trình V1.5
 * - Xuất tệp release/HOLLOW_WOODS_V1.5_STANDALONE.zip
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RELEASE_DIR = path.join(ROOT_DIR, 'release');
const STANDALONE_DIR = path.join(RELEASE_DIR, 'HOLLOW_WOODS_V1.5_STANDALONE');
const STANDALONE_ZIP = path.join(RELEASE_DIR, 'HOLLOW_WOODS_V1.5_STANDALONE.zip');

console.log('========================================================================');
console.log('🎮 HOLLOW WOODS V1.5 — ĐÓNG GÓI BẢN CHƠI THỬ ĐỘC LẬP CHO ĐỒNG ĐỘI');
console.log('========================================================================');

// 1. Kiểm tra dist
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('Thư mục dist/ chưa được build. Đang tiến hành build tự động...');
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
}

// 2. Chuẩn bị thư mục release/HOLLOW_WOODS_V1.5_STANDALONE
console.log('\n--- 1. Chuẩn bị thư mục xuất bản độc lập ---');
if (fs.existsSync(STANDALONE_DIR)) {
  fs.rmSync(STANDALONE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STANDALONE_DIR, { recursive: true });

// Copy đệ quy dist/ sang STANDALONE_DIR
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(DIST_DIR, STANDALONE_DIR);
console.log(`  ✔ Đã sao chép toàn bộ nội dung web build từ dist/ -> release/HOLLOW_WOODS_V1.5_STANDALONE/`);

// 3. Tạo CHƠI_GAME.bat
console.log('\n--- 2. Tạo Launcher 1-Click CHƠI_GAME.bat ---');
const batContent = `@echo off
chcp 65001 >nul
title HOLLOW WOODS V1.5 - The Fog That Remembers (Playtest Launcher)

echo ========================================================================
echo   🌲 HOLLOW WOODS V1.5: THE FOG THAT REMEMBERS
echo   🎮 BẢN CHƠI THỬ ĐỘC LẬP CHO ĐỒNG ĐỘI (STANDALONE PLAYTEST)
echo   🚀 Đang khởi động máy chủ cục bộ và tự động mở trình duyệt...
echo ========================================================================
echo.

cd /d "%~dp0"

:: 1. Kiểm tra Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Đang khởi động máy chủ bằng Python...
    start http://localhost:8080/
    python -m http.server 8080
    exit /b
)

:: 2. Kiểm tra py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Đang khởi động máy chủ bằng Python Launcher...
    start http://localhost:8080/
    py -m http.server 8080
    exit /b
)

:: 3. Kiểm tra npx (Node.js)
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Đang khởi động máy chủ bằng Node serve...
    start http://localhost:8080/
    npx serve -l 8080 -s .
    exit /b
)

:: 4. Mặc định trên mọi máy Windows (PowerShell HttpListener tích hợp - Không cần cài đặt gì)
echo [OK] Đang khởi động máy chủ tích hợp Windows PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
`;
fs.writeFileSync(path.join(STANDALONE_DIR, 'CHƠI_GAME.bat'), batContent, 'utf8');
console.log(`  ✔ [SAVED] CHƠI_GAME.bat`);

// 4. Tạo server.ps1
console.log('\n--- 3. Tạo Native PowerShell Web Server (server.ps1) ---');
const ps1Content = `param([int]$Port = 8080)

$Root = $PSScriptRoot
if (-not $Root) { $Root = Get-Location }

# Tự động chọn port khả dụng
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
} catch {
    $Port = 8081
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    try {
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    } catch {
        $Port = 8888
        $prefix = "http://localhost:$Port/"
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    }
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  🌲 HOLLOW WOODS V1.5 - THE FOG THAT REMEMBERS" -ForegroundColor Cyan
Write-Host "  May chu dang chay tai: $prefix" -ForegroundColor Yellow
Write-Host "  Dang tu dong mo trinh duyet..." -ForegroundColor White
Write-Host "  Nhan [Ctrl + C] de thoat khi choi xong." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green

Start-Process $prefix

$mimeMap = @{
    ".html"  = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".json"  = "application/json; charset=utf-8"
    ".wav"   = "audio/wav"
    ".mp3"   = "audio/mpeg"
    ".ogg"   = "audio/ogg"
    ".ico"   = "image/x-icon"
    ".wasm"  = "application/wasm"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".txt"   = "text/plain; charset=utf-8"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrEmpty($rawUrl)) {
            $rawUrl = "/index.html"
        }
        $relPath = $rawUrl.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($Root, $relPath)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeMap.ContainsKey($ext)) {
                $mime = $mimeMap[$ext]
            }
            $response.ContentType = $mime
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Bỏ qua lỗi ngắt kết nối đột ngột
    }
}
`;
fs.writeFileSync(path.join(STANDALONE_DIR, 'server.ps1'), ps1Content, 'utf8');
console.log(`  ✔ [SAVED] server.ps1`);

// 5. Tạo CHƠI_GAME.sh
console.log('\n--- 4. Tạo Launcher cho macOS/Linux (CHƠI_GAME.sh) ---');
const shContent = `#!/bin/bash
cd "$(dirname "$0")"
echo "========================================================================"
echo "  🌲 HOLLOW WOODS V1.5 - THE FOG THAT REMEMBERS"
echo "  🎮 BẢN CHƠI THỬ ĐỘC LẬP CHO ĐỒNG ĐỘI (PLAYTEST BUILD)"
echo "========================================================================"

if command -v python3 &>/dev/null; then
    echo "Khởi động máy chủ bằng Python 3..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    python3 -m http.server 8080
elif command -v python &>/dev/null; then
    echo "Khởi động máy chủ bằng Python..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    python -m http.server 8080
elif command -v npx &>/dev/null; then
    echo "Khởi động máy chủ bằng npx serve..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    npx serve -l 8080 .
else
    echo "Vui lòng cài đặt Python hoặc Node.js để chạy máy chủ tĩnh cục bộ."
    read -p "Nhấn Enter để đóng..."
fi
`;
fs.writeFileSync(path.join(STANDALONE_DIR, 'CHƠI_GAME.sh'), shContent, 'utf8');
console.log(`  ✔ [SAVED] CHƠI_GAME.sh`);

// 6. Tạo HUONG_DAN_CHOI_GAME.txt
console.log('\n--- 5. Tạo Sổ Tay Hướng Dẫn Chi Tiết (HUONG_DAN_CHOI_GAME.txt) ---');
const readmeContent = `================================================================================
           🌲 HOLLOW WOODS V1.5 — THE FOG THAT REMEMBERS 🌲
           🎮 BẢN CHƠI THỬ ĐỘC LẬP DÀNH CHO ĐỒNG ĐỘI (STANDALONE BUILD)
================================================================================

1. CÁCH KHỞI ĐỘNG GAME (1-CLICK KHÔNG CẦN CÀI ĐẶT):
--------------------------------------------------------------------------------
- Trên Windows (10/11/Server):
  👉 Chỉ cần giải nén file ZIP và NHẤP ĐÚP CHUỘT vào tệp: "CHƠI_GAME.bat"
  Hệ thống sẽ tự động bật máy chủ cục bộ bằng PowerShell tích hợp sẵn trên Windows
  và tự động mở game trên trình duyệt mặc định (Chrome, Edge, Firefox, Brave...).
  * Bạn hoàn toàn KHÔNG cần cài Node.js, Python, hay bất kỳ phần mềm nào khác!

- Trên macOS / Linux:
  👉 Mở Terminal tại thư mục này và gõ: bash CHƠI_GAME.sh
  Hoặc: python3 -m http.server 8080 rồi mở trình duyệt vào http://localhost:8080

* Khi chơi xong: Đóng tab trình duyệt và tắt cửa sổ dòng lệnh màu đen là hoàn tất.


2. BẢNG PHÍM ĐIỀU KHIỂN CHUẨN V1.5 (CONTROLS):
--------------------------------------------------------------------------------
- [W] [A] [S] [D] hoặc Mũi Tên : Di chuyển Hiệp Sĩ The Mossbound Wayfarer (4 hướng)
- [Shift] (giữ)               : Chạy nhanh (tiêu hao Thể Lực)
- [F]                         : BẬT / TẮT VÒNG SÁNG HỘ TÂM (Tiêu hao Thể Lực để 
                                bảo vệ Tinh Thần; nhưng quái vật sẽ phát hiện xa hơn +30%)
- Phím [Space] / Chuột trái   : Vung kiếm tấn công quái vật bóng tối
- [E]                         : Tương tác NPC / Thu thập / Nấp bụi rậm / Khảo sát di tích
- [Q]                         : Ném mồi nhử đánh lạc hướng quái vật thính giác (The Listener)
- [1] đến [8]                 : Kích hoạt / sử dụng vật phẩm nhanh trong Thanh Túi Đồ
- [I] hoặc [C]                : Mở Bảng Chế Tạo DST 2 Tầng (Có tìm kiếm, danh mục, ghim)
- [J]                         : Mở Sổ Tay Lữ Khách & Danh Sách Nhiệm Vụ 7 Chặng
- [N]                         : Mở La Bàn & Bản Đồ Khám Phá Rừng Liễu
- [F8]                        : GỠ KẸT KHẨN CẤP (Emergency Unstuck đưa về điểm an toàn)
- [ESC]                       : Tạm dừng / Mở Menu Tùy Chọn Âm Lượng & Lưu Game


3. HỆ THỐNG 3 CHỈ SỐ SINH TỒN V1.5:
--------------------------------------------------------------------------------
- Sinh Lực (HP - Đỏ)         : Cạn kiệt = Tử nạn. Dùng Thuốc Đắp [1] hoặc nghỉ ngơi để hồi.
- Thể Lực (Stamina - Vàng)   : Tiêu hao khi chạy nhanh [Shift] hoặc duy trì Vòng Sáng [F].
                               Tự hồi phục khi đi bộ hoặc đứng yên trong bóng râm.
- Tinh Thần (Sanity - Tím)   : Giảm dần trong bóng tối sương độc, khi bị quái vật săn đuổi
                               hoặc nghe tiếng gọi thì thầm.
                               * Khi Tinh Thần < 45%: Nhịp tim hoảng loạn đập dồn dập (Web Audio).
                               * Khi Tinh Thần < 30%: Xuất hiện Ảo Giác Kỵ Sĩ Sa Ngã & Viền Ám Ảnh.
                               * Hồi phục Tinh Thần: Đứng gần Đống Lửa Làng, nhận Phước Lành 
                                 Sir Vaelen tại Trạm Lửa, hoặc dùng Trà Thảo Mộc.


4. LỘ TRÌNH NHIỆM VỤ CHÍNH TUYẾN 7 CHẶNG (A -> E -> B -> D -> F -> E -> C):
--------------------------------------------------------------------------------
- Chặng 1 (A -> E): Nhận lệnh từ Garth & Edda tại Làng Bellhollow (A), tiến vào Đầm Lầy (E).
- Chặng 2 (E -> B): Lối vào Miếu Chuông bị khóa bởi "Phong Ấn Rễ Cổ". Nhặt Huy Hiệu Kỵ Sĩ 
                    Sa Ngã, mang về Trạm Lửa Rừng Tĩnh Lặng (B) gặp Sir Vaelen.
- Chặng 3 (B -> D): Sir Vaelen trao Bản Đồ Mộ Cổ và Chìa Khóa Cổng Đông. Tiến vào Hầm Mộ 
                    Nữ Tu (D) để thu hồi Ngọc Thanh Tẩy.
- Chặng 4 (D -> F): Mang Ngọc Thanh Tẩy đến Trại Rèn Phế Tích (F) nhờ Bram tôi luyện thành 
                    "Chìa Khóa Thanh Tẩy".
- Chặng 5 (F -> E): Trở lại Đầm Lầy Tĩnh Lặng (E), cắm Chìa Khóa Thanh Tẩy giải trừ Rễ Cổ.
- Chặng 6 (E -> C): Vượt qua lối cầu rêu phong dẫn vào Miếu Chuông Phế Tích (C).
- Chặng 7 (C): Đại chiến giải đố với Kẻ Nuốt Tiếng Chuông (SHADOW Series), phá 3 Trụ Rễ 
               Ma Quái, rung Chuông Đồng Cổ và mở ra các nhánh Kết Thúc (Tươi Sáng / Bi Kịch)!


5. ĐIỂM NỔI BẬT TRONG PHIÊN BẢN V1.5:
--------------------------------------------------------------------------------
✔ Đồ họa 100% Pixel Art thuần túy, loại bỏ hoàn toàn nét vẽ tạm vector.
✔ Hiệp sĩ The Mossbound Wayfarer bước đi 4 hướng mượt mà, chân thực.
✔ Hệ thống âm thanh nhịp tim Web Audio động (75..135 BPM) biến chuyển theo tâm lý.
✔ Hệ thống bẫy thính giác Tiếng Gọi Trong Sương và Nghịch Lý Ánh Sáng [F].
✔ Tự động sao lưu tiến trình chơi (Cloud Save & Local Storage) an toàn tuyệt đối.

Chúc bạn và đồng đội có những giờ phút sinh tồn nghẹt thở và đầy cảm xúc trong HOLLOW WOODS!
================================================================================
`;
fs.writeFileSync(path.join(STANDALONE_DIR, 'HUONG_DAN_CHOI_GAME.txt'), readmeContent, 'utf8');
console.log(`  ✔ [SAVED] HUONG_DAN_CHOI_GAME.txt`);

// 7. Nén thành file ZIP
console.log('\n--- 6. Đóng gói tệp release/HOLLOW_WOODS_V1.5_STANDALONE.zip ---');
if (fs.existsSync(STANDALONE_ZIP)) {
  fs.unlinkSync(STANDALONE_ZIP);
}

const pyZipScript = `
import zipfile
import os

src_dir = r'''${STANDALONE_DIR}'''
zip_path = r'''${STANDALONE_ZIP}'''

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(src_dir):
        dirs.sort()
        files.sort()
        for file in files:
            full = os.path.join(root, file)
            arc = os.path.relpath(full, src_dir).replace('\\\\', '/')
            if arc.lower().endswith(('.bak', '.tmp', '.rar', '.zip', '.7z', '.tar', '.gz', '.psd', '.aseprite', '.log')):
                continue
            zf.write(full, arc)

with zipfile.ZipFile(zip_path, 'r') as zf:
    names = zf.namelist()
    assert 'CHƠI_GAME.bat' in names, 'CHƠI_GAME.bat missing'
    assert 'server.ps1' in names, 'server.ps1 missing'
    assert 'CHƠI_GAME.sh' in names, 'CHƠI_GAME.sh missing'
    assert 'HUONG_DAN_CHOI_GAME.txt' in names, 'HUONG_DAN_CHOI_GAME.txt missing'
    assert 'index.html' in names, 'index.html missing'
    print(f"VERIFY_OK: Standalone ZIP contains {len(names)} files.")
`;

const tmpPy = path.join(ROOT_DIR, 'scripts', `_temp_standalone_zip_${Date.now()}.py`);
fs.writeFileSync(tmpPy, pyZipScript.trim(), 'utf8');
try {
  execSync(`python "${tmpPy}"`, { stdio: 'inherit' });
} finally {
  if (fs.existsSync(tmpPy)) fs.unlinkSync(tmpPy);
}

const zipStat = fs.statSync(STANDALONE_ZIP);
console.log(`✅ Đã xuất gói chơi thử độc lập: ${STANDALONE_ZIP}`);
console.log(`📦 Dung lượng Standalone ZIP: ${(zipStat.size / (1024 * 1024)).toFixed(2)} MB (${zipStat.size.toLocaleString()} bytes)`);

// Tạo thêm alias với version v1.5.1
const v151Zip = path.join(RELEASE_DIR, 'HOLLOW_WOODS_V1.5.1_STANDALONE.zip');
fs.copyFileSync(STANDALONE_ZIP, v151Zip);
console.log(`  ✔ [ALIAS V1.5.1] Đã xuất: ${v151Zip}`);

console.log('========================================================================');
console.log('🎉 ĐÃ HOÀN TẤT ĐÓNG GÓI BẢN CHƠI THỬ ĐỘC LẬP CHO ĐỒNG ĐỘI!');
console.log('========================================================================\n');
