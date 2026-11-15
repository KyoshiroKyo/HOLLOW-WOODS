Add-Type -AssemblyName System.Drawing

$outDir = "G:\HOLLOW WOODS\public\assets\characters\mossbound_wayfarer"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# ============================================================================
# BẢNG MÀU CHUẨN THE MOSSBOUND WAYFARER (ĐỒNG NHẤT TUYỆT ĐỐI VỚI BƯỚC 1 & 2)
# ============================================================================
$PAL = New-Object 'System.Collections.Generic.Dictionary[string,string]'
$PAL['O'] = "#141115" # Viền mực tối
$PAL['h'] = "#241612" # Tóc nâu đen bóng râm
$PAL['H'] = "#3b251d" # Tóc nâu trầm
$PAL['j'] = "#57392c" # Tóc nâu sáng
$PAL['J'] = "#704c3b" # Tóc điểm sáng

$PAL['s'] = "#c7926f" # Da bóng râm
$PAL['S'] = "#eabfa0" # Da trung tính
$PAL['k'] = "#f7d6bc" # Da sáng
$PAL['E'] = "#181210" # Mắt đen
$PAL['w'] = "#f7f1e8" # Ánh mắt trắng

$PAL['c'] = "#183329" # Áo choàng xanh rêu tối
$PAL['C'] = "#254d3e" # Áo choàng xanh rêu trung
$PAL['g'] = "#386b56" # Áo choàng xanh rêu sáng
$PAL['m'] = "#4e8548" # Lá rêu vai áo
$PAL['M'] = "#6da358" # Lá rêu sáng
$PAL['L'] = "#8ec26b" # Đọt lá non
$PAL['a'] = "#c97a2b" # Lá thu / khuy vai

$PAL['t'] = "#6b4829" # Áo trong vàng đất tối
$PAL['T'] = "#8f643a" # Áo trong vàng đất vừa
$PAL['u'] = "#b07f4e" # Áo trong vàng đất sáng

$PAL['l'] = "#2b1b12" # Dây da / thắt lưng tối
$PAL['d'] = "#4a3020" # Dây da vừa
$PAL['D'] = "#66442e" # Túi hành lý / bao tay sáng
$PAL['p'] = "#7d5e42" # Cuộn chăn hành lý
$PAL['P'] = "#997656" # Cuộn chăn hành lý sáng
$PAL['B'] = "#e0b24c" # Khóa đồng cổ

$PAL['n'] = "#211d1a" # Quần tối
$PAL['N'] = "#332c28" # Quần vừa
$PAL['b'] = "#291a12" # Ủng da tối
$PAL['v'] = "#422b1d" # Ủng da vừa
$PAL['V'] = "#5c3d2a" # Ủng da sáng

$colorCache = @{}
function Get-Col([string]$hex, [int]$alpha = 255) {
  $key = "$hex-$alpha"
  if (-not $colorCache.ContainsKey($key)) {
    $clean = $hex.TrimStart('#')
    $r = [Convert]::ToInt32($clean.Substring(0,2), 16)
    $g = [Convert]::ToInt32($clean.Substring(2,2), 16)
    $b = [Convert]::ToInt32($clean.Substring(4,2), 16)
    $colorCache[$key] = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
  }
  return $colorCache[$key]
}

# An toàn tuyệt đối trong vùng [ox+2 .. ox+61, oy+2 .. oy+61]
function Set-Px([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$x, [int]$y, [string]$hex, [int]$alpha = 255) {
  $px = $ox + $x
  $py = $oy + $y
  if ($px -ge ($ox + 2) -and $px -le ($ox + 61) -and $py -ge ($oy + 2) -and $py -le ($oy + 61)) {
    $bmp.SetPixel($px, $py, (Get-Col $hex $alpha))
  }
}

function Draw-Grid([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$startX, [int]$startY, [string[]]$rows) {
  for ($r = 0; $r -lt $rows.Count; $r++) {
    $line = $rows[$r]
    for ($c = 0; $c -lt $line.Length; $c++) {
      $ch = [string]$line[$c]
      if ($ch -ne '.' -and $PAL.ContainsKey($ch)) {
        Set-Px $bmp $ox $oy ($startX + $c) ($startY + $r) $PAL[$ch] 255
      }
    }
  }
}

function Draw-LinePx([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$x0, [int]$y0, [int]$x1, [int]$y1, [string]$hexMain, [string]$hexShade) {
  $steps = [Math]::Max([Math]::Abs($x1 - $x0), [Math]::Abs($y1 - $y0))
  if ($steps -eq 0) {
    Set-Px $bmp $ox $oy $x0 $y0 $hexMain
    return
  }
  for ($i = 0; $i -le $steps; $i++) {
    $t = $i / [double]$steps
    $x = [Math]::Round($x0 + ($x1 - $x0) * $t)
    $y = [Math]::Round($y0 + ($y1 - $y0) * $t)
    Set-Px $bmp $ox $oy $x $y $hexShade
    Set-Px $bmp $ox $oy $x ($y - 1) $hexMain
  }
}

function Draw-CompactLanternAt([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$lx, [int]$ly, [int]$glowAlpha = 32) {
  if ($glowAlpha -gt 0) {
    for ($gy = -1; $gy -le 6; $gy++) {
      for ($gx = -1; $gx -le 5; $gx++) {
        $px = $ox + $lx + $gx
        $py = $oy + $ly + $gy
        if ($px -ge ($ox + 2) -and $px -le ($ox + 61) -and $py -ge ($oy + 2) -and $py -le ($oy + 61)) {
          if ($bmp.GetPixel($px, $py).A -eq 0) {
            $bmp.SetPixel($px, $py, (Get-Col "#f39c12" $glowAlpha))
          }
        }
      }
    }
  }
  Set-Px $bmp $ox $oy ($lx + 2) ($ly - 1) "#9c6f24"
  for ($dx = 1; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) $ly "#1c1512" }
  for ($dx = 0; $dx -le 4; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) ($ly + 1) "#261c16" }
  for ($dy = 2; $dy -le 4; $dy++) {
    Set-Px $bmp $ox $oy $lx ($ly + $dy) "#261c16"
    Set-Px $bmp $ox $oy ($lx + 4) ($ly + $dy) "#261c16"
    Set-Px $bmp $ox $oy ($lx + 1) ($ly + $dy) "#d35400"
    Set-Px $bmp $ox $oy ($lx + 2) ($ly + $dy) "#f39c12"
    Set-Px $bmp $ox $oy ($lx + 3) ($ly + $dy) "#d35400"
  }
  Set-Px $bmp $ox $oy ($lx + 2) ($ly + 3) "#fef9e7"
  for ($dx = 1; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) ($ly + 5) "#1c1512" }
}

$HEAD_DOWN = @(
  "....OO..OOO.....",
  "..OOjHOOhJHOO...",
  ".OhHJJjhhJjHHO..",
  ".OhHjjHHHHjHHO..",
  "OhHHHHHHHHHHHHO.",
  "OhHhsShHHhSsHHO.",
  "OhHsSSShsSSSsHO.",
  "OhHSwESSSSwESHO.",
  ".OhsSSSSSSSSsO..",
  ".O.OsSSSSSSsO...",
  "...OOsSSSSsOO...",
  ".....OOOOOO....."
)

$HEAD_LEFT = @(
  "....OOO.OOO.....",
  "..OOhJHOhHHOO...",
  ".OhHJJhhhHjHHO..",
  ".OhHjHHHHHHjHHO.",
  "OhHHHHhHHHHHHHO.",
  ".OhsSShHHHHHHHO.",
  ".OsSwESsHHHHHHO.",
  "OsSSSSsHHHHHHO..",
  ".OssSSsHHHHHO...",
  "..OOsSsHHHHO....",
  "....OOOOOOO.....",
  "................"
)

$HEAD_RIGHT = @(
  ".....OOO.OOO....",
  "...OOHHhOHJhOO..",
  "..OHHjhhhJJHHO..",
  ".OHHjHHHHHHjHHO.",
  ".OHHHHHHhHHHHHO.",
  ".OHHHHHHhSSsHO..",
  ".OHHHHHsSEwSsO..",
  "..OHHHHHsSSSSsO.",
  "...OHHHHsSSssO..",
  "....OHHHsSsOO...",
  ".....OOOOOOO....",
  "................"
)

$HEAD_UP = @(
  "....OO..OOO.....",
  "..OOjHOOhJHOO...",
  ".OhHJJjhhJjHHO..",
  ".OhHjjHHHHjHHO..",
  "OhHHHHHHHHHHHHO.",
  "OhHHHHhHHHHHHHO.",
  "OhhhhHhhHhhhhHO.",
  ".OhHHHHHHHHHHO..",
  ".OhHhhHHHhhHHO..",
  "..OhHO.OOhHO....",
  "...OO...OOO.....",
  "................"
)

$TORSO_DOWN = @(
  "..OOmmMMaMMmmOO..",
  ".OmMMLmCBMmLMmO..",
  "OmMMcOdTTTuCOmMmO",
  "OggCOuTTTTtCOcggO",
  "OgCO.OddTTtO.OCgO",
  "dSSO.OTddTtO.OSSd",
  ".OO..OTTDdtO..OO.",
  ".....OllBBllO....",
  ".....OttOOttO....",
  "......OO..OO....."
)

$TORSO_UP = @(
  "..OOmmMMaMMmmOO..",
  ".OmMMLmMMMmLMmO..",
  "OmMMOOOOOOOOOMmMO",
  "OggOlpPPllPplOggO",
  "OgCOlpppllpppOCgO",
  "OgCOOOOOOOOOOOCgO",
  "OgcCCgCcCCcGgCcgO",
  "OcCCCgCcCCcGgCCcO",
  ".OcccgCcCCcGcccO.",
  "..OOOOOOOOOOOOO.."
)

function Draw-GroundShadow([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$rx = 8) {
  for ($y = 56; $y -le 58; $y++) {
    $rad = if ($y -eq 57) { $rx } else { $rx - 2 }
    for ($dx = -$rad; $dx -le $rad; $dx++) {
      $px = $ox + 32 + $dx
      $py = $oy + $y
      if ($bmp.GetPixel($px, $py).A -eq 0) {
        $bmp.SetPixel($px, $py, (Get-Col "#0a0e0c" 95))
      }
    }
  }
}

function Draw-BaseWayfarerBody(
  [System.Drawing.Bitmap]$bmp,
  [int]$ox,
  [int]$oy,
  [string]$dir,
  [int]$shiftX,
  [int]$crouchY,
  [int]$capeFlare
) {
  $cx = 32 + $shiftX
  $headY = [Math]::Min(44, 29 + $crouchY)
  $torsoY = [Math]::Min(47, 40 + $crouchY)
  $legTopY = [Math]::Min(54, 50 + [Math]::Floor($crouchY * 0.7))

  if ($dir -eq 'down') {
    for ($dy = 0; $dy -le 10; $dy++) {
      $ty = $torsoY + $dy
      if ($ty -ge 57) { break }
      $halfW = 6 + [Math]::Floor(($dy + $capeFlare) / 3)
      for ($dx = -$halfW; $dx -le $halfW; $dx++) {
        $col = if ([Math]::Abs($dx) -eq $halfW -or $dy -eq 10) { $PAL['O'] } elseif ([Math]::Abs($dx) -ge ($halfW - 2)) { $PAL['C'] } else { $PAL['c'] }
        Set-Px $bmp $ox $oy ($cx + $dx) $ty $col
      }
    }
    for ($y = $legTopY; $y -le 58; $y++) {
      $colL = if ($y -lt 54) { $PAL['N'] } elseif ($y -eq 54) { $PAL['C'] } elseif ($y -lt 57) { $PAL['v'] } else { $PAL['O'] }
      $colR = if ($y -lt 54) { $PAL['n'] } elseif ($y -eq 54) { $PAL['C'] } elseif ($y -lt 57) { $PAL['v'] } else { $PAL['O'] }
      Set-Px $bmp $ox $oy ($cx - 5) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx - 4) $y $colL; Set-Px $bmp $ox $oy ($cx - 3) $y $colL; Set-Px $bmp $ox $oy ($cx - 2) $y $PAL['O']
      Set-Px $bmp $ox $oy ($cx + 1) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx + 2) $y $colR; Set-Px $bmp $ox $oy ($cx + 3) $y $colR; Set-Px $bmp $ox $oy ($cx + 4) $y $PAL['O']
    }
    Draw-Grid $bmp $ox $oy ($cx - 8) $torsoY $TORSO_DOWN
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_DOWN
  }
  elseif ($dir -eq 'left') {
    for ($y = $legTopY; $y -le 58; $y++) {
      $cF = if ($y -lt 54) { $PAL['N'] } elseif ($y -lt 57) { $PAL['v'] } else { $PAL['O'] }
      $cB = if ($y -lt 54) { $PAL['n'] } elseif ($y -lt 57) { $PAL['b'] } else { $PAL['O'] }
      Set-Px $bmp $ox $oy ($cx - 3) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx - 2) $y $cF; Set-Px $bmp $ox $oy ($cx - 1) $y $cF; Set-Px $bmp $ox $oy $cx $y $PAL['O']
      Set-Px $bmp $ox $oy ($cx + 1) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx + 2) $y $cB; Set-Px $bmp $ox $oy ($cx + 3) $y $PAL['O']
    }
    Draw-Grid $bmp $ox $oy ($cx + 4) ($torsoY - 1) @(".OOOO.", "OpPPpO", "OppppO", "OllllO", ".OOOO.")
    for ($dy = 0; $dy -le 10; $dy++) {
      $ty = $torsoY + $dy
      if ($ty -ge 57) { break }
      $leftEdge = $cx - 4 + [Math]::Floor($dy / 5)
      $rightEdge = $cx + 3 + [Math]::Floor(($dy * (3 + $capeFlare)) / 10)
      for ($x = $leftEdge; $x -le $rightEdge; $x++) {
        $col = if ($x -eq $leftEdge -or $x -eq $rightEdge -or $dy -eq 10) { $PAL['O'] } elseif ($dy -le 2) { $PAL['M'] } elseif ($x -lt ($cx - 1)) { $PAL['T'] } else { $PAL['C'] }
        Set-Px $bmp $ox $oy $x $ty $col
      }
    }
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_LEFT
  }
  elseif ($dir -eq 'right') {
    for ($y = $legTopY; $y -le 58; $y++) {
      $cB = if ($y -lt 54) { $PAL['n'] } elseif ($y -lt 57) { $PAL['b'] } else { $PAL['O'] }
      $cF = if ($y -lt 54) { $PAL['N'] } elseif ($y -lt 57) { $PAL['v'] } else { $PAL['O'] }
      Set-Px $bmp $ox $oy ($cx - 3) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx - 2) $y $cB; Set-Px $bmp $ox $oy ($cx - 1) $y $PAL['O']
      Set-Px $bmp $ox $oy $cx $y $PAL['O']; Set-Px $bmp $ox $oy ($cx + 1) $y $cF; Set-Px $bmp $ox $oy ($cx + 2) $y $cF; Set-Px $bmp $ox $oy ($cx + 3) $y $PAL['O']
    }
    Draw-Grid $bmp $ox $oy ($cx - 10) ($torsoY - 1) @(".OOOO.", "OpPPpO", "OppppO", "OllllO", ".OOOO.")
    for ($dy = 0; $dy -le 10; $dy++) {
      $ty = $torsoY + $dy
      if ($ty -ge 57) { break }
      $leftEdge = $cx - 3 - [Math]::Floor(($dy * (3 + $capeFlare)) / 10)
      $rightEdge = $cx + 4 - [Math]::Floor($dy / 5)
      for ($x = $leftEdge; $x -le $rightEdge; $x++) {
        $col = if ($x -eq $leftEdge -or $x -eq $rightEdge -or $dy -eq 10) { $PAL['O'] } elseif ($dy -le 2) { $PAL['M'] } elseif ($x -gt ($cx + 1)) { $PAL['T'] } else { $PAL['C'] }
        Set-Px $bmp $ox $oy $x $ty $col
      }
    }
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_RIGHT
  }
  elseif ($dir -eq 'up') {
    for ($y = $legTopY; $y -le 58; $y++) {
      $colIn = if ($y -lt 54) { $PAL['n'] } elseif ($y -lt 57) { $PAL['v'] } else { $PAL['O'] }
      Set-Px $bmp $ox $oy ($cx - 5) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx - 4) $y $colIn; Set-Px $bmp $ox $oy ($cx - 3) $y $colIn; Set-Px $bmp $ox $oy ($cx - 2) $y $PAL['O']
      Set-Px $bmp $ox $oy ($cx + 1) $y $PAL['O']; Set-Px $bmp $ox $oy ($cx + 2) $y $colIn; Set-Px $bmp $ox $oy ($cx + 3) $y $colIn; Set-Px $bmp $ox $oy ($cx + 4) $y $PAL['O']
    }
    Draw-Grid $bmp $ox $oy ($cx - 8) $torsoY $TORSO_UP
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_UP
  }
}

# Helper vẽ cây gậy gỗ + đèn lồng cố định bên tay giữ gậy
function Draw-SupportStaffAndLantern([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [string]$dir, [int]$crouchY) {
  $dy = [Math]::Min(3, $crouchY)
  if ($dir -eq 'down') {
    Draw-LinePx $bmp $ox $oy 22 57 22 (33 + $dy) $PAL['P'] $PAL['d']
    Set-Px $bmp $ox $oy 21 (33 + $dy) $PAL['d']; Set-Px $bmp $ox $oy 20 (34 + $dy) $PAL['l']
    Draw-CompactLanternAt $bmp $ox $oy 16 (35 + $dy) 30
  }
  elseif ($dir -eq 'left') {
    Draw-LinePx $bmp $ox $oy 24 57 22 (33 + $dy) $PAL['P'] $PAL['d']
    Set-Px $bmp $ox $oy 21 (33 + $dy) $PAL['d']; Set-Px $bmp $ox $oy 20 (34 + $dy) $PAL['l']
    Draw-CompactLanternAt $bmp $ox $oy 16 (35 + $dy) 30
  }
  elseif ($dir -eq 'right') {
    Draw-LinePx $bmp $ox $oy 40 57 42 (33 + $dy) $PAL['P'] $PAL['d']
    Set-Px $bmp $ox $oy 43 (33 + $dy) $PAL['d']; Set-Px $bmp $ox $oy 44 (34 + $dy) $PAL['l']
    Draw-CompactLanternAt $bmp $ox $oy 43 (35 + $dy) 30
  }
  elseif ($dir -eq 'up') {
    Draw-LinePx $bmp $ox $oy 41 57 42 (33 + $dy) $PAL['P'] $PAL['d']
    Set-Px $bmp $ox $oy 43 (33 + $dy) $PAL['d']; Set-Px $bmp $ox $oy 44 (34 + $dy) $PAL['l']
    Draw-CompactLanternAt $bmp $ox $oy 43 (35 + $dy) 26
  }
}

# ============================================================================
# 1. WAYFARER_INTERACT.PNG (4 HƯỚNG x 4 FRAMES = 256x256 px)
# Tư thế đưa tay tương tác tự nhiên (trò chuyện NPC, mở vật thể, thao tác bàn chế tạo)
# ============================================================================
function Draw-WayfarerInteractFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64
  Draw-GroundShadow $bmp $ox $oy 8

  $shiftX = 0
  $crouchY = if ($f -eq 1 -or $f -eq 2) { 1 } else { 0 }
  if ($f -eq 1 -or $f -eq 2) {
    if ($dir -eq 'left') { $shiftX = -1 }
    elseif ($dir -eq 'right') { $shiftX = 1 }
  }

  Draw-BaseWayfarerBody $bmp $ox $oy $dir $shiftX $crouchY 1
  Draw-SupportStaffAndLantern $bmp $ox $oy $dir $crouchY

  # Vẽ cánh tay & bàn tay tương tác đưa ra tự nhiên theo từng frame (0: chuẩn bị, 1: đưa tay chạm/mở, 2: thao tác, 3: thu tay)
  if ($dir -eq 'down') {
    $hx = @(39, 41, 42, 39)[$f]
    $hy = @(45, 44, 42, 45)[$f]
    Draw-LinePx $bmp $ox $oy 37 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx + 1) $hy $PAL['k']; Set-Px $bmp $ox $oy $hx ($hy + 1) $PAL['O']
    if ($f -eq 1 -or $f -eq 2) {
      # Điểm sáng tương tác nhẹ nơi đầu ngón tay (thao tác chế tạo / chạm vật thể)
      Set-Px $bmp $ox $oy ($hx + 2) ($hy - 1) "#fef9e7" 220
      Set-Px $bmp $ox $oy ($hx + 1) ($hy - 2) "#e0b24c" 200
    }
  }
  elseif ($dir -eq 'left') {
    $hx = @(25, 21, 20, 24)[$f]
    $hy = @(45, 43, 42, 45)[$f]
    Draw-LinePx $bmp $ox $oy 28 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx - 1) $hy $PAL['k']; Set-Px $bmp $ox $oy $hx ($hy + 1) $PAL['O']
    if ($f -eq 1 -or $f -eq 2) {
      Set-Px $bmp $ox $oy ($hx - 2) ($hy - 1) "#fef9e7" 220
      Set-Px $bmp $ox $oy ($hx - 1) ($hy - 2) "#e0b24c" 200
    }
  }
  elseif ($dir -eq 'right') {
    $hx = @(39, 43, 44, 40)[$f]
    $hy = @(45, 43, 42, 45)[$f]
    Draw-LinePx $bmp $ox $oy 36 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx + 1) $hy $PAL['k']; Set-Px $bmp $ox $oy $hx ($hy + 1) $PAL['O']
    if ($f -eq 1 -or $f -eq 2) {
      Set-Px $bmp $ox $oy ($hx + 2) ($hy - 1) "#fef9e7" 220
      Set-Px $bmp $ox $oy ($hx + 1) ($hy - 2) "#e0b24c" 200
    }
  }
  elseif ($dir -eq 'up') {
    $hx = @(24, 22, 21, 24)[$f]
    $hy = @(44, 41, 40, 44)[$f]
    Draw-LinePx $bmp $ox $oy 26 43 $hx $hy $PAL['C'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy $hx ($hy - 1) $PAL['k']
    if ($f -eq 1 -or $f -eq 2) {
      Set-Px $bmp $ox $oy ($hx - 1) ($hy - 2) "#fef9e7" 210
      Set-Px $bmp $ox $oy $hx ($hy - 3) "#e0b24c" 190
    }
  }
}

# ============================================================================
# 2. WAYFARER_GATHER.PNG (4 HƯỚNG x 4 FRAMES = 256x256 px)
# Tư thế cúi người thu thập tài nguyên trên mặt đất / hái thảo mộc rồi đứng dậy mượt mà
# ============================================================================
function Draw-WayfarerGatherFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64
  Draw-GroundShadow $bmp $ox $oy 9

  # Nhịp cúi người: f=0 (hạ gối crouch=2), f=1 (cúi sâu chạm đất crouch=5), f=2 (nhấc thảo mộc lên crouch=3), f=3 (đứng dậy cất vào túi crouch=1)
  $crouchY = @(2, 5, 3, 1)[$f]
  $shiftX = 0
  if ($f -eq 1 -or $f -eq 2) {
    if ($dir -eq 'left') { $shiftX = -1 }
    elseif ($dir -eq 'right') { $shiftX = 1 }
  }

  Draw-BaseWayfarerBody $bmp $ox $oy $dir $shiftX $crouchY 2
  Draw-SupportStaffAndLantern $bmp $ox $oy $dir $crouchY

  # Vẽ cánh tay vươn xuống đất hái thảo mộc & nhánh thảo mộc rừng (#6da358 / #8ec26b / #c97a2b)
  if ($dir -eq 'down') {
    $shX = 36; $shY = 42 + $crouchY
    $hx  = @(37, 36, 36, 35)[$f]
    $hy  = @(50, 56, 51, 46)[$f]
    Draw-LinePx $bmp $ox $oy $shX $shY $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx + 1) $hy $PAL['k']
    # Thảo mộc / tài nguyên thu thập
    if ($f -eq 1) {
      Set-Px $bmp $ox $oy ($hx - 1) 57 $PAL['M']; Set-Px $bmp $ox $oy $hx 57 $PAL['L']; Set-Px $bmp $ox $oy ($hx + 1) 56 $PAL['a']
    } elseif ($f -eq 2) {
      Set-Px $bmp $ox $oy $hx ($hy + 1) $PAL['M']; Set-Px $bmp $ox $oy ($hx + 1) ($hy + 1) $PAL['L']; Set-Px $bmp $ox $oy ($hx - 1) $hy $PAL['a']
    }
  }
  elseif ($dir -eq 'left') {
    $shX = 28; $shY = 42 + $crouchY
    $hx  = @(24, 22, 24, 26)[$f]
    $hy  = @(50, 56, 51, 46)[$f]
    Draw-LinePx $bmp $ox $oy $shX $shY $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx - 1) $hy $PAL['k']
    if ($f -eq 1) {
      Set-Px $bmp $ox $oy ($hx - 2) 57 $PAL['M']; Set-Px $bmp $ox $oy ($hx - 1) 57 $PAL['L']; Set-Px $bmp $ox $oy ($hx - 2) 56 $PAL['a']
    } elseif ($f -eq 2) {
      Set-Px $bmp $ox $oy ($hx - 1) ($hy + 1) $PAL['M']; Set-Px $bmp $ox $oy ($hx - 2) $hy $PAL['L']; Set-Px $bmp $ox $oy ($hx - 1) ($hy - 1) $PAL['a']
    }
  }
  elseif ($dir -eq 'right') {
    $shX = 36; $shY = 42 + $crouchY
    $hx  = @(40, 42, 40, 38)[$f]
    $hy  = @(50, 56, 51, 46)[$f]
    Draw-LinePx $bmp $ox $oy $shX $shY $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']; Set-Px $bmp $ox $oy ($hx + 1) $hy $PAL['k']
    if ($f -eq 1) {
      Set-Px $bmp $ox $oy ($hx + 2) 57 $PAL['M']; Set-Px $bmp $ox $oy ($hx + 1) 57 $PAL['L']; Set-Px $bmp $ox $oy ($hx + 2) 56 $PAL['a']
    } elseif ($f -eq 2) {
      Set-Px $bmp $ox $oy ($hx + 1) ($hy + 1) $PAL['M']; Set-Px $bmp $ox $oy ($hx + 2) $hy $PAL['L']; Set-Px $bmp $ox $oy ($hx + 1) ($hy - 1) $PAL['a']
    }
  }
  elseif ($dir -eq 'up') {
    $shX = 27; $shY = 42 + $crouchY
    $hx  = @(25, 24, 25, 26)[$f]
    $hy  = @(50, 55, 50, 46)[$f]
    Draw-LinePx $bmp $ox $oy $shX $shY $hx $hy $PAL['C'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']
    if ($f -eq 1 -or $f -eq 2) {
      Set-Px $bmp $ox $oy ($hx - 1) ($hy - 1) $PAL['M']; Set-Px $bmp $ox $oy $hx ($hy - 2) $PAL['L']
    }
  }
}

# Helper vẽ bình thuốc đắp / bình dầu đèn (Poultice / Lantern Oil Flask)
function Draw-UsableFlask([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$fx, [int]$fy, [bool]$activeGlow) {
  # Nút bần & cổ bình
  Set-Px $bmp $ox $oy $fx ($fy - 2) $PAL['P']
  Set-Px $bmp $ox $oy $fx ($fy - 1) $PAL['O']
  # Thân bình thủy tinh thảo dược / dầu hổ phách
  for ($dy = 0; $dy -le 2; $dy++) {
    Set-Px $bmp $ox $oy ($fx - 1) ($fy + $dy) $PAL['O']
    Set-Px $bmp $ox $oy ($fx + 2) ($fy + $dy) $PAL['O']
    $fillL = if ($dy -eq 0) { $PAL['L'] } else { $PAL['M'] }
    $fillR = if ($dy -eq 1) { "#f39c12" } else { $PAL['g'] }
    Set-Px $bmp $ox $oy $fx ($fy + $dy) $fillL
    Set-Px $bmp $ox $oy ($fx + 1) ($fy + $dy) $fillR
  }
  Set-Px $bmp $ox $oy $fx ($fy + 3) $PAL['O']
  Set-Px $bmp $ox $oy ($fx + 1) ($fy + 3) $PAL['O']

  if ($activeGlow) {
    Set-Px $bmp $ox $oy ($fx - 2) ($fy - 2) "#8ec26b" 220
    Set-Px $bmp $ox $oy ($fx + 2) ($fy - 3) "#fef9e7" 240
    Set-Px $bmp $ox $oy ($fx + 3) ($fy - 1) "#f39c12" 210
    Set-Px $bmp $ox $oy ($fx - 1) ($fy - 4) "#fef9e7" 200
  }
}

# ============================================================================
# 3. WAYFARER_USE_ITEM.PNG (4 HƯỚNG x 4 FRAMES = 256x256 px)
# Tư thế nâng vật phẩm lên sử dụng (thuốc đắp thảo dược / bình dầu đèn)
# Đồng nhất chiều cao 30px (y=29..58) và điểm tựa bàn chân (x=32, y=58)
# ============================================================================
function Draw-WayfarerUseItemFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64
  Draw-GroundShadow $bmp $ox $oy 8

  # Giữ nguyên chiều cao đứng chuẩn (crouchY = 0) để đồng nhất chiều cao và điểm tựa bàn chân
  Draw-BaseWayfarerBody $bmp $ox $oy $dir 0 0 1
  Draw-SupportStaffAndLantern $bmp $ox $oy $dir 0

  # f=0: rút vật phẩm từ túi hông, f=1: nâng lên ngang ngực, f=2: kích hoạt/sử dụng vật phẩm (kèm hạt sáng), f=3: hạ vật phẩm xuống
  $active = ($f -eq 2)

  if ($dir -eq 'down') {
    $hx = @(38, 37, 35, 38)[$f]
    $hy = @(45, 40, 38, 43)[$f]
    Draw-LinePx $bmp $ox $oy 37 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']
    Draw-UsableFlask $bmp $ox $oy ($hx + 1) ($hy - 2) $active
  }
  elseif ($dir -eq 'left') {
    $hx = @(25, 22, 21, 24)[$f]
    $hy = @(45, 40, 38, 43)[$f]
    Draw-LinePx $bmp $ox $oy 28 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']
    Draw-UsableFlask $bmp $ox $oy ($hx - 3) ($hy - 2) $active
  }
  elseif ($dir -eq 'right') {
    $hx = @(39, 42, 43, 40)[$f]
    $hy = @(45, 40, 38, 43)[$f]
    Draw-LinePx $bmp $ox $oy 36 43 $hx $hy $PAL['T'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']
    Draw-UsableFlask $bmp $ox $oy ($hx + 2) ($hy - 2) $active
  }
  elseif ($dir -eq 'up') {
    $hx = @(24, 23, 24, 24)[$f]
    $hy = @(44, 39, 37, 42)[$f]
    Draw-LinePx $bmp $ox $oy 26 43 $hx $hy $PAL['C'] $PAL['d']
    Set-Px $bmp $ox $oy $hx $hy $PAL['S']
    Draw-UsableFlask $bmp $ox $oy ($hx - 2) ($hy - 2) $active
  }
}

$dirs = @('down', 'up', 'left', 'right')

# 1. Tạo wayfarer_interact.png (256x256, 4x4)
$bmpInteract = New-Object System.Drawing.Bitmap(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($r = 0; $r -lt 4; $r++) {
  for ($c = 0; $c -lt 4; $c++) {
    Draw-WayfarerInteractFrame $bmpInteract $c $r $dirs[$r] $c
  }
}
$interactPath = Join-Path $outDir "wayfarer_interact.png"
$bmpInteract.Save($interactPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpInteract.Dispose()

# 2. Tạo wayfarer_gather.png (256x256, 4x4)
$bmpGather = New-Object System.Drawing.Bitmap(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($r = 0; $r -lt 4; $r++) {
  for ($c = 0; $c -lt 4; $c++) {
    Draw-WayfarerGatherFrame $bmpGather $c $r $dirs[$r] $c
  }
}
$gatherPath = Join-Path $outDir "wayfarer_gather.png"
$bmpGather.Save($gatherPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpGather.Dispose()

# 3. Tạo wayfarer_use_item.png (256x256, 4x4)
$bmpUseItem = New-Object System.Drawing.Bitmap(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($r = 0; $r -lt 4; $r++) {
  for ($c = 0; $c -lt 4; $c++) {
    Draw-WayfarerUseItemFrame $bmpUseItem $c $r $dirs[$r] $c
  }
}
$useItemPath = Join-Path $outDir "wayfarer_use_item.png"
$bmpUseItem.Save($useItemPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpUseItem.Dispose()

Write-Output "GENERATED_PART3_SUCCESS:"
Write-Output " - $interactPath"
Write-Output " - $gatherPath"
Write-Output " - $useItemPath"
