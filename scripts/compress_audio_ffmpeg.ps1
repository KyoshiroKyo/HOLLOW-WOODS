<#
.SYNOPSIS
    Script tự động nén vật lý toàn bộ Audio nặng cho HOLLOW WOODS v1.5.2 bằng ffmpeg.
.DESCRIPTION
    1. Nén 5 bài BGM (từ ~38 MB xuống ~10 MB) với bitrate 112k stereo.
    2. Nén các file SFX nặng (> 1 MB WAV/MP3) sang MP3 96k và gọt khoảng lặng thừa.
    3. Tự động sao lưu file gốc sang Backups/audio_raw/.
#>

param(
    [string]$FfmpegPath = "ffmpeg"
)

Write-Host "=== HOLLOW WOODS V1.5.2 - AUDIO PHYSICAL COMPRESSION SCRIPT ===" -ForegroundColor Cyan

# 1. Kiểm tra ffmpeg
try {
    & $FfmpegPath -version | Out-Null
    Write-Host "[OK] Tìm thấy ffmpeg: $FfmpegPath" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Không tìm thấy ffmpeg tại '$FfmpegPath'!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt ffmpeg (e.g. winget install Gyan.FFmpeg) hoặc truyền tham số -FfmpegPath 'C:\path\to\ffmpeg.exe'." -ForegroundColor Yellow
    Exit 1
}

$BackupDir = "Backups/audio_raw"
New-Item -ItemType Directory -Force -Path "$BackupDir/bgm" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupDir/sfx_v14" | Out-Null

# 2. Nén 5 bài BGM
Write-Host "`n--- 1. Nén BGM (Bitrate 112k Stereo, 44.1kHz) ---" -ForegroundColor Yellow
$bgmFiles = @(
    "beyond_the_hills.mp3",
    "embervale.mp3",
    "evergrove.mp3",
    "forgotten_orchard.mp3",
    "knights_quiet_fire.mp3"
)

foreach ($bgm in $bgmFiles) {
    $srcPath = "public/assets/audio/bgm/$bgm"
    if (Test-Path $srcPath) {
        $tempPath = "public/assets/audio/bgm/temp_$bgm"
        $backupPath = "$BackupDir/bgm/$bgm"

        Copy-Item -Path $srcPath -Destination $backupPath -Force
        $oldSize = (Get-Item $srcPath).Length

        & $FfmpegPath -y -i $srcPath -codec:a libmp3lame -b:a 112k -ar 44100 $tempPath 2>$null

        if (Test-Path $tempPath) {
            Move-Item -Path $tempPath -Destination $srcPath -Force
            $newSize = (Get-Item $srcPath).Length
            $ratio = [math]::Round(($newSize / $oldSize) * 100, 1)
            Write-Host ("  [PASS] {0}: {1:N2} MB -> {2:N2} MB ({3}%)" -f $bgm, ($oldSize/1MB), ($newSize/1MB), $ratio) -ForegroundColor Green
        }
    }
}

# 3. Nén các file SFX nặng trong sfx/v14
Write-Host "`n--- 2. Nén SFX Nặng trong sfx/v14 (MP3 96k Mono/Stereo, gọt khoảng lặng) ---" -ForegroundColor Yellow
$heavySfx = @(
    "behemoth_thud.wav",
    "bell_toll_low.wav",
    "boss_drone.wav",
    "footstep_leaves_1.mp3",
    "footstep_stone_2.wav",
    "footstep_wood_2.wav",
    "rune_shift.wav",
    "scout_whistle.wav"
)

foreach ($sfx in $heavySfx) {
    $srcPath = "public/assets/audio/sfx/v14/$sfx"
    if (Test-Path $srcPath) {
        $backupPath = "$BackupDir/sfx_v14/$sfx"
        Copy-Item -Path $srcPath -Destination $backupPath -Force
        $oldSize = (Get-Item $srcPath).Length

        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($sfx)
        $outMp3 = "public/assets/audio/sfx/v14/$baseName.mp3"
        $tempPath = "public/assets/audio/sfx/v14/temp_$baseName.mp3"

        & $FfmpegPath -y -i $srcPath -af "silenceremove=start_periods=1:start_duration=0.03:start_threshold=-55dB:detection=peak" -codec:a libmp3lame -b:a 96k -ar 44100 $tempPath 2>$null

        if (Test-Path $tempPath) {
            # Nếu gốc là .wav, xóa file .wav cũ và thay bằng file .mp3 nén
            if ($sfx.EndsWith(".wav")) {
                Remove-Item -Path $srcPath -Force
            }
            Move-Item -Path $tempPath -Destination $outMp3 -Force
            $newSize = (Get-Item $outMp3).Length
            $ratio = [math]::Round(($newSize / $oldSize) * 100, 1)
            Write-Host ("  [PASS] {0} -> {1}.mp3: {2:N2} MB -> {3:N2} MB ({4}%)" -f $sfx, $baseName, ($oldSize/1MB), ($newSize/1MB), $ratio) -ForegroundColor Green
        }
    }
}

Write-Host "`n>>> TẤT CẢ TIẾN TRÌNH NÉN ĐÃ HOÀN TẤT THÀNH CÔNG! <<<" -ForegroundColor Cyan
