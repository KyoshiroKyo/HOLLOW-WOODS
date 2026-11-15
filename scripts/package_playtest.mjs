// scripts/package_playtest.mjs
// Script to package HOLLOW WOODS V1.2 for friends / playtesting

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('================================================================');
console.log('📦 PACKAGING HOLLOW WOODS V1.2 PLAYTEST DISTRIBUTION');
console.log('================================================================\n');

const releaseRootDir = 'release';
const bundleDir = path.join(releaseRootDir, 'HOLLOW_WOODS_V1.2_PLAYTEST');
const zipFile = path.join(releaseRootDir, 'HOLLOW_WOODS_V1.2_PLAYTEST.zip');

// 1. Tạo thư mục release nếu chưa có
if (!fs.existsSync(releaseRootDir)) {
  fs.mkdirSync(releaseRootDir, { recursive: true });
}

// 2. Làm sạch thư mục bundle trước khi copy
if (fs.existsSync(bundleDir)) {
  try {
    fs.rmSync(bundleDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    // Nếu thư mục gốc đang bị Explorer hoặc tiến trình giữ, xóa các tệp con bên trong
    const items = fs.readdirSync(bundleDir);
    for (const item of items) {
      try {
        fs.rmSync(path.join(bundleDir, item), { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      } catch {
        // bỏ qua nếu tệp bị khóa tạm thời
      }
    }
  }
}
fs.mkdirSync(bundleDir, { recursive: true });

// 3. Sao chép nội dung từ dist/ sang bundleDir
console.log('1. Đang sao chép tệp từ dist/...');
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

copyDirRecursive('dist', bundleDir);
console.log('   ✅ Đã sao chép index.html và assets/');

// 4. Tạo server.ps1 (Universal Windows PowerShell Embedded HTTP Server)
console.log('2. Đang tạo máy chủ tích hợp server.ps1...');
const serverPs1Content = `param([int]$Port = 8080)

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
Write-Host "  HOLLOW WOODS V1.2 - DI CANH RUNG LIEU (PLAYTEST)" -ForegroundColor Cyan
Write-Host "  May chu dang chay tai: $prefix" -ForegroundColor Yellow
Write-Host "  Dang tu dong mo trinh duyet..." -ForegroundColor White
Write-Host "  Nhan [Ctrl + C] de thoat khi choi xong." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green

Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json; charset=utf-8"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
    ".ogg"  = "audio/ogg"
    ".ico"  = "image/x-icon"
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
        # Bo qua loi khi client ngat ket noi
    }
}
`;
fs.writeFileSync(path.join(bundleDir, 'server.ps1'), serverPs1Content, 'utf8');
console.log('   ✅ Đã tạo server.ps1');

// 5. Tạo CHƠI_GAME.bat (1-Click Windows Launcher)
console.log('3. Đang tạo launcher Windows CHƠI_GAME.bat...');
const batContent = `@echo off
chcp 65001 >nul
title HOLLOW WOODS V1.2 - Playtest Launcher

echo ========================================================
echo   HOLLOW WOODS V1.2 - DỊ CẢNH RỪNG LIỄU
echo   Khởi động máy chủ chơi thử nghiệm nội bộ...
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Kiem tra Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Python...
    start http://localhost:8080/
    python -m http.server 8080
    exit /b
)

:: 2. Kiem tra py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Python Launcher...
    start http://localhost:8080/
    py -m http.server 8080
    exit /b
)

:: 3. Kiem tra npx (Node.js)
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Node serve...
    start http://localhost:8080/
    npx serve -l 8080 -s .
    exit /b
)

:: 4. Mac dinh tren moi may tinh Windows (PowerShell HttpListener tich hop)
echo [OK] Dang khoi dong may chu tich hop Windows PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
`;
fs.writeFileSync(path.join(bundleDir, 'CHƠI_GAME.bat'), batContent, 'utf8');
console.log('   ✅ Đã tạo CHƠI_GAME.bat');

// 6. Tạo CHƠI_GAME.sh (1-Click macOS / Linux Launcher)
console.log('4. Đang tạo launcher Mac/Linux CHƠI_GAME.sh...');
const shContent = `#!/bin/bash
cd "$(dirname "$0")"
echo "========================================================"
echo "  HOLLOW WOODS V1.2 - DỊ CẢNH RỪNG LIỄU (PLAYTEST)"
echo "========================================================"

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
fs.writeFileSync(path.join(bundleDir, 'CHƠI_GAME.sh'), shContent, 'utf8');
console.log('   ✅ Đã tạo CHƠI_GAME.sh');

// 7. Tạo HUONG_DAN_CHOI_GAME.txt
console.log('5. Đang tạo tài liệu hướng dẫn HUONG_DAN_CHOI_GAME.txt...');
const readmeContent = `================================================================================
           HOLLOW WOODS V1.2 — DỊ CẢNH RỪNG LIỄU (THE FOG THAT REMEMBERS)
                           BẢN ĐÓNG GÓI CHƠI THỬ (PLAYTEST BUILD)
================================================================================

1. CÁCH KHỞI ĐỘNG GAME (RẤT ĐƠN GIẢN):
--------------------------------------------------------------------------------
- Trên Windows: 
  👉 Bạn chỉ cần NHẤP ĐÚP CHUỘT vào tệp: "CHƠI_GAME.bat"
  Hệ thống sẽ tự động bật máy chủ cục bộ và mở cửa sổ game trên trình duyệt mặc định 
  (Chrome, Edge, Firefox, Brave, Cốc Cốc...). Không cần cài đặt thêm phần mềm nào!

- Trên macOS / Linux:
  👉 Mở Terminal tại thư mục này và gõ: bash CHƠI_GAME.sh
  Hoặc nếu có Python: python3 -m http.server 8080 rồi mở trình duyệt vào http://localhost:8080

* Lưu ý: Khi chơi xong, bạn chỉ cần đóng cửa sổ trình duyệt và cửa sổ dòng lệnh màu đen là xong.


2. BẢNG PHÍM ĐIỀU KHIỂN (CONTROLS):
--------------------------------------------------------------------------------
- [W] [A] [S] [D] hoặc [Các phím mũi tên]: Di chuyển nhân vật Lữ Khách Rêu Phong
- [Shift] (giữ): Chạy nhanh (tiêu hao Thể Lực)
- [E]: Tương tác / Nói chuyện với NPC / Thu thập tài nguyên / Khảo sát bia đá, bệ thờ
- [F] hoặc Phím [3]: Bật / Tắt Đèn Lồng Hổ Phách
- [1]: Sử dụng Thuốc Đắp Thảo Mộc (Hồi máu)
- [2]: Bơm Dầu Đèn Lồng (khi có Bình Dầu Đèn)
- [C] hoặc [I] hoặc [TAB]: Mở bảng Túi Đồ & Bàn Chế Tạo (Crafting)
- [J]: Mở Sổ Tay Ghi Chép Cốt Truyện & Danh Sách Nhiệm Vụ (Journal)
- [M]: Bật / Tắt Âm thanh môi trường & Hiệu ứng
- [ESC]: Tạm dừng game / Mở Menu Cài Đặt / Lưu Game Thủ Công


3. HƯỚNG DẪN CỐT TRUYỆN & CÁC BƯỚC ĐẦU GAME:
--------------------------------------------------------------------------------
- Bạn tỉnh dậy bên bìa sương mù và tiến vào làng Bellhollow an bình.
- Bước 1: Hãy đến gặp Bác Garth (Người gác cổng làng phía Đông) để nhận thông tin cảnh báo.
- Bước 2: Đến nhà Bà Lão Edda (Người giữ chuông làng) để lắng nghe 3 Quy Tắc Bằng Máu.
- Bước 3: Tìm Cô Neris (Người chữa thảo mộc) để được chữa thương và nhận công thức pha chế Dầu Đèn.
- Bước 4: Nhặt Gỗ Khô và Nhựa Cây xung quanh làng hoặc tại Nông Trại Sanctuary Farm (phía Nam làng).
- Bước 5: Mở bảng Chế Tạo ([I] hoặc [C]) để pha chế Bình Dầu Đèn hoàn chỉnh.
- Bước 6: Quay lại Cổng Đông, Bác Garth sẽ mở cổng để bạn tiến vào Rừng Ngoài (Outer Woods), 
  Đường Mòn Quanh Co (The Crooked Path), Rừng Sâu (Deep Forest) và Đầm Lầy Tĩnh Lặng (Silent Mire)!


4. CÁC ĐIỂM ĐẶC SẮC TRONG BẢN V1.2:
--------------------------------------------------------------------------------
- Đồ họa Pixel Art thủ công sắc nét (Dark Woodland Pixel Art).
- Hệ thống nông trại thảo dược mini 4 ô đất tại Sanctuary Farm (phía Nam làng Bellhollow).
- Quái vật The Listener (Kẻ Lắng Nghe) rình rập trong Rừng Sâu theo thính giác âm thanh.
- Trận địa Giải đố Ba Cột Đá Cổ Ngữ (Ancient Rune Puzzle) huyền bí giữa Đầm Lầy Tĩnh Lặng.
- Hỗ trợ gõ tiếng Việt hoàn hảo, tự động lưu tiến trình game an toàn vào trình duyệt.

Chúc bạn có những giờ phút trải nghiệm sinh tồn kỳ bí và hấp dẫn cùng HOLLOW WOODS!
================================================================================
`;
fs.writeFileSync(path.join(bundleDir, 'HUONG_DAN_CHOI_GAME.txt'), readmeContent, 'utf8');
console.log('   ✅ Đã tạo HUONG_DAN_CHOI_GAME.txt');

// 8. Đóng gói thành file ZIP
console.log('6. Đang nén tệp zip HOLLOW_WOODS_V1.2_PLAYTEST.zip...');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  // Sử dụng PowerShell Compress-Archive
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${bundleDir}\\*' -DestinationPath '${zipFile}' -Force"`, { stdio: 'inherit' });
  const stat = fs.statSync(zipFile);
  console.log(`   ✅ Đã nén thành công file ZIP: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
} catch (err) {
  console.error('   ❌ Lỗi khi nén file zip:', err.message);
}

// 9. Thống kê
console.log('\n================================================================');
console.log('🎉 ĐÃ HOÀN TẤT ĐÓNG GÓI BẢN CHƠI THỬ (PLAYTEST BUNDLE)!');
console.log('================================================================');
console.log(`📁 Thư mục xuất bản: ${path.resolve(bundleDir)}`);
console.log(`📦 Tệp ZIP gửi bạn: ${path.resolve(zipFile)}`);
console.log('================================================================\n');
