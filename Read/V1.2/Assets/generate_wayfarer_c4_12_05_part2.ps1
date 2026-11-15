Add-Type -AssemblyName System.Drawing

$outDir = "G:\HOLLOW WOODS\public\assets\characters\mossbound_wayfarer"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# ============================================================================
# BẢNG MÀU CHUẨN THE MOSSBOUND WAYFARER (ĐỒNG NHẤT TUYỆT ĐỐI VỚI BƯỚC 1)
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

# An toàn tuyệt đối trong vùng [ox+2 .. ox+61, oy+2 .. oy+61] để không bao giờ bị cắt chi tiết sát mép ô 64x64
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

function Draw-CompactLanternAt([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$lx, [int]$ly, [int]$glowAlpha = 32, [bool]$dimmed = $false) {
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
    if ($dimmed) {
      Set-Px $bmp $ox $oy ($lx + 1) ($ly + $dy) "#5c2d16"
      Set-Px $bmp $ox $oy ($lx + 2) ($ly + $dy) "#a04000"
      Set-Px $bmp $ox $oy ($lx + 3) ($ly + $dy) "#5c2d16"
    } else {
      Set-Px $bmp $ox $oy ($lx + 1) ($ly + $dy) "#d35400"
      Set-Px $bmp $ox $oy ($lx + 2) ($ly + $dy) "#f39c12"
      Set-Px $bmp $ox $oy ($lx + 3) ($ly + $dy) "#d35400"
    }
  }
  if (-not $dimmed) {
    Set-Px $bmp $ox $oy ($lx + 2) ($ly + 3) "#fef9e7"
  }
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

$HEAD_DOWN_WINCE = @(
  "....OO..OOO.....",
  "..OOjHOOhJHOO...",
  ".OhHJJjhhJjHHO..",
  ".OhHjjHHHHjHHO..",
  "OhHHHHHHHHHHHHO.",
  "OhHhsShHHhSsHHO.",
  "OhHsSSShsSSSsHO.",
  "OhHEESSSSSEESHO.",
  ".OhsSSSssSSSsO..",
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

# Vẽ thân & chân cơ bản của Wayfarer có hỗ trợ dịch chuyển (shiftX, crouchY) cho Attack, Hurt và Death giai đoạn đầu
function Draw-BaseWayfarerBody(
  [System.Drawing.Bitmap]$bmp,
  [int]$ox,
  [int]$oy,
  [string]$dir,
  [int]$shiftX,
  [int]$crouchY,
  [int]$capeFlare,
  [bool]$wince = $false
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
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $(if ($wince) { $HEAD_DOWN_WINCE } else { $HEAD_DOWN })
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

# ============================================================================
# 1. WAYFARER_ATTACK.PNG (4 HƯỚNG x 6 FRAMES = 384x256 px)
# 3 Nhịp: Lấy đà (0..1) -> Vung gậy gỗ đang cầm (2..3) -> Thu gậy về tư thế chuẩn bị (4..5)
# ============================================================================
function Draw-WayfarerAttackFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64
  Draw-GroundShadow $bmp $ox $oy 8

  $shiftX = 0; $crouchY = 0; $capeFlare = 1
  if ($f -eq 1) { $crouchY = 1; $capeFlare = 2 }
  elseif ($f -eq 2) { $crouchY = 1; $capeFlare = 4; if ($dir -eq 'left') { $shiftX = -2 } elseif ($dir -eq 'right') { $shiftX = 2 } }
  elseif ($f -eq 3) { $crouchY = 1; $capeFlare = 3; if ($dir -eq 'left') { $shiftX = -1 } elseif ($dir -eq 'right') { $shiftX = 1 } }

  Draw-BaseWayfarerBody $bmp $ox $oy $dir $shiftX $crouchY $capeFlare $false

  # Tọa độ gốc bàn tay cầm gậy và đầu gậy gỗ + đèn lồng theo từng nhịp vung gậy
  $handX = 22; $handY = 44
  $tipX  = 22; $tipY  = 33
  $lanX  = 16; $lanY  = 35
  $drawArc = $false

  if ($dir -eq 'down') {
    switch ($f) {
      0 { $handX = 21; $handY = 43; $tipX = 17; $tipY = 30; $lanX = 12; $lanY = 32 } # Lấy đà nâng gậy
      1 { $handX = 20; $handY = 41; $tipX = 14; $tipY = 27; $lanX = 10; $lanY = 29 } # Nén lực lấy đà sâu
      2 { $handX = 28; $handY = 46; $tipX = 45; $tipY = 54; $lanX = 43; $lanY = 47; $drawArc = $true } # Vung gậy quét ngang phía trước
      3 { $handX = 33; $handY = 46; $tipX = 48; $tipY = 48; $lanX = 47; $lanY = 42; $drawArc = $true } # Hết tầm vung gậy
      4 { $handX = 25; $handY = 45; $tipX = 24; $tipY = 34; $lanX = 18; $lanY = 36 } # Thu gậy về
      5 { $handX = 22; $handY = 44; $tipX = 22; $tipY = 33; $lanX = 16; $lanY = 35 } # Trở lại chuẩn bị
    }
    if ($drawArc) {
      # Vệt gió vung gậy gỗ phía trước (y: 49..56, nằm gọn trong khung 64x64)
      for ($ax = 20; $ax -le 46; $ax++) {
        $ay = 53 + [Math]::Round([Math]::Sin(($ax - 20) / 26.0 * [Math]::PI) * 3)
        Set-Px $bmp $ox $oy $ax $ay "#f5e6c8" 210
        Set-Px $bmp $ox $oy $ax ($ay - 1) "#e0b24c" 160
      }
    }
  }
  elseif ($dir -eq 'left') {
    switch ($f) {
      0 { $handX = 26; $handY = 43; $tipX = 30; $tipY = 29; $lanX = 24; $lanY = 30 } # Kéo gậy ra sau lấy đà
      1 { $handX = 28; $handY = 42; $tipX = 34; $tipY = 27; $lanX = 28; $lanY = 28 }
      2 { $handX = 21; $handY = 44; $tipX = 8;  $tipY = 42; $lanX = 8;  $lanY = 35; $drawArc = $true } # Quét mạnh gậy sang trái
      3 { $handX = 20; $handY = 45; $tipX = 9;  $tipY = 49; $lanX = 9;  $lanY = 42; $drawArc = $true }
      4 { $handX = 22; $handY = 44; $tipX = 18; $tipY = 34; $lanX = 13; $lanY = 35 }
      5 { $handX = 23; $handY = 44; $tipX = 23; $tipY = 33; $lanX = 17; $lanY = 35 }
    }
    if ($drawArc) {
      for ($ay = 34; $ay -le 51; $ay++) {
        $ax = 11 - [Math]::Round([Math]::Sin(($ay - 34) / 17.0 * [Math]::PI) * 3)
        Set-Px $bmp $ox $oy $ax $ay "#f5e6c8" 210
        Set-Px $bmp $ox $oy ($ax + 1) $ay "#e0b24c" 160
      }
    }
  }
  elseif ($dir -eq 'right') {
    switch ($f) {
      0 { $handX = 38; $handY = 43; $tipX = 34; $tipY = 29; $lanX = 35; $lanY = 30 } # Kéo gậy lấy đà
      1 { $handX = 36; $handY = 42; $tipX = 30; $tipY = 27; $lanX = 31; $lanY = 28 }
      2 { $handX = 43; $handY = 44; $tipX = 55; $tipY = 42; $lanX = 50; $lanY = 35; $drawArc = $true } # Quét mạnh gậy sang phải
      3 { $handX = 44; $handY = 45; $tipX = 54; $tipY = 49; $lanX = 49; $lanY = 42; $drawArc = $true }
      4 { $handX = 42; $handY = 44; $tipX = 45; $tipY = 34; $lanX = 46; $lanY = 35 }
      5 { $handX = 40; $handY = 44; $tipX = 40; $tipY = 33; $lanX = 42; $lanY = 35 }
    }
    if ($drawArc) {
      for ($ay = 34; $ay -le 51; $ay++) {
        $ax = 52 + [Math]::Round([Math]::Sin(($ay - 34) / 17.0 * [Math]::PI) * 3)
        Set-Px $bmp $ox $oy $ax $ay "#f5e6c8" 210
        Set-Px $bmp $ox $oy ($ax - 1) $ay "#e0b24c" 160
      }
    }
  }
  elseif ($dir -eq 'up') {
    switch ($f) {
      0 { $handX = 42; $handY = 44; $tipX = 47; $tipY = 33; $lanX = 48; $lanY = 35 }
      1 { $handX = 43; $handY = 45; $tipX = 50; $tipY = 36; $lanX = 50; $lanY = 38 }
      2 { $handX = 38; $handY = 39; $tipX = 24; $tipY = 20; $lanX = 22; $lanY = 22; $drawArc = $true } # Vung gậy vòng lên phía trên đầu
      3 { $handX = 35; $handY = 39; $tipX = 19; $tipY = 24; $lanX = 17; $lanY = 26; $drawArc = $true }
      4 { $handX = 40; $handY = 42; $tipX = 42; $tipY = 31; $lanX = 43; $lanY = 33 }
      5 { $handX = 41; $handY = 44; $tipX = 41; $tipY = 33; $lanX = 43; $lanY = 35 }
    }
    if ($drawArc) {
      for ($ax = 20; $ax -le 44; $ax++) {
        $ay = 22 - [Math]::Round([Math]::Sin(($ax - 20) / 24.0 * [Math]::PI) * 3)
        Set-Px $bmp $ox $oy $ax $ay "#f5e6c8" 210
        Set-Px $bmp $ox $oy $ax ($ay + 1) "#e0b24c" 160
      }
    }
  }

  # Vẽ thân gậy gỗ nối từ chuôi qua tay cầm tới đầu gậy & đèn lồng
  $buttX = $handX - [Math]::Round(($tipX - $handX) * 0.35)
  $buttY = [Math]::Min(57, $handY + 9)
  Draw-LinePx $bmp $ox $oy $buttX $buttY $tipX $tipY "#5c3b24" "#24160e"
  # Bàn tay nắm chặt thân gậy
  Set-Px $bmp $ox $oy $handX $handY $PAL['S']
  Set-Px $bmp $ox $oy ($handX + 1) $handY $PAL['d']
  Draw-CompactLanternAt $bmp $ox $oy $lanX $lanY $(if ($drawArc) { 48 } else { 30 }) $false
}

# ============================================================================
# 2. WAYFARER_HURT.PNG (4 HƯỚNG x 3 FRAMES = 192x256 px)
# Phản ứng giật lùi ngắn khi va chạm (Frame 0..1) -> Lấy lại thăng bằng (Frame 2)
# ============================================================================
function Draw-WayfarerHurtFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64
  Draw-GroundShadow $bmp $ox $oy 8

  $recoilX = 0; $crouchY = 0; $capeFlare = 2
  if ($f -eq 0) {
    $crouchY = 1; $capeFlare = 3
    if ($dir -eq 'left') { $recoilX = 2 } elseif ($dir -eq 'right') { $recoilX = -2 }
  } elseif ($f -eq 1) {
    $crouchY = 2; $capeFlare = 4
    if ($dir -eq 'left') { $recoilX = 3 } elseif ($dir -eq 'right') { $recoilX = -3 }
  } else {
    $crouchY = 0; $capeFlare = 1; $recoilX = 0
  }

  Draw-BaseWayfarerBody $bmp $ox $oy $dir $recoilX $crouchY $capeFlare ($f -lt 2)

  # Gậy gỗ dựng chống đỡ lực đẩy và đèn lồng rung nhẹ
  if ($dir -eq 'down' -or $dir -eq 'left') {
    $sx = 21 + $recoilX - $(if ($f -eq 1) { 2 } else { 0 })
    $topY = 33 + $crouchY
    Draw-LinePx $bmp $ox $oy ($sx + 2) 57 $sx $topY "#5c3b24" "#24160e"
    Draw-CompactLanternAt $bmp $ox $oy ($sx - 5) ($topY + 2) 36 $false
  } else {
    $sx = 41 + $recoilX + $(if ($f -eq 1) { 2 } else { 0 })
    $topY = 33 + $crouchY
    Draw-LinePx $bmp $ox $oy ($sx - 2) 57 $sx $topY "#5c3b24" "#24160e"
    Draw-CompactLanternAt $bmp $ox $oy ($sx + 1) ($topY + 2) 36 $false
  }
}

# ============================================================================
# 3. WAYFARER_DEATH.PNG (4 HƯỚNG x 6 FRAMES = 384x256 px)
# Khuỵu gối hạ thấp người xuống đất theo từng nhịp kiểm soát (0..4) ->
# Frame thứ 6 (index 5) nằm yên ổn định trên mặt đất tại dòng neo y = 58.
# ============================================================================
function Draw-WayfarerDeathFrame([System.Drawing.Bitmap]$bmp, [int]$colIdx, [int]$rowIdx, [string]$dir, [int]$f) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64

  # Giai đoạn 1 (Frames 0, 1, 2): Khuỵu gối hạ thấp trọng tâm từng nấc
  if ($f -le 2) {
    Draw-GroundShadow $bmp $ox $oy (8 + $f)
    $crouchDrops = @(2, 5, 8)
    $crouchY = $crouchDrops[$f]
    Draw-BaseWayfarerBody $bmp $ox $oy $dir 0 $crouchY (2 + $f) $true

    # Cây gậy gỗ nghiêng dần xuống mặt đất theo nhịp khuỵu gối
    if ($dir -eq 'down' -or $dir -eq 'left') {
      $tipX = 20 - $f * 3
      $tipY = 35 + $f * 5
      Draw-LinePx $bmp $ox $oy 24 57 $tipX $tipY "#5c3b24" "#24160e"
      Draw-CompactLanternAt $bmp $ox $oy ($tipX - 4) ($tipY + 1) (26 - $f * 6) ($f -eq 2)
    } else {
      $tipX = 42 + $f * 3
      $tipY = 35 + $f * 5
      Draw-LinePx $bmp $ox $oy 39 57 $tipX $tipY "#5c3b24" "#24160e"
      Draw-CompactLanternAt $bmp $ox $oy ($tipX + 1) ($tipY + 1) (26 - $f * 6) ($f -eq 2)
    }
    return
  }

  # Giai đoạn 2 (Frames 3, 4, 5): Ngã gục xuống thảm cỏ và kết thúc ở tư thế nằm yên ổn định (Frame 5)
  Draw-GroundShadow $bmp $ox $oy 13
  $dropStage = $f - 3 # 0, 1, 2
  $baseY = 46 + $dropStage * 2 # 46, 48, 50 (đáy luôn neo chuẩn ở y = 58!)

  # Vẽ tà áo choàng xanh rêu & lá rừng trải trên mặt đất (x: 20..44, y: baseY..58)
  for ($y = $baseY; $y -le 58; $y++) {
    $halfW = 11 + [Math]::Min(2, $dropStage) - [Math]::Abs($y - ($baseY + 4))
    if ($halfW -lt 6) { $halfW = 6 }
    for ($dx = -$halfW; $dx -le $halfW; $dx++) {
      $wx = 32 + $dx
      $col = $PAL['C']
      if ($y -eq $baseY -or $y -eq 58 -or [Math]::Abs($dx) -eq $halfW) {
        $col = $PAL['O']
      } elseif ($dx -ge -3 -and $dx -le 4 -and $y -le ($baseY + 3)) {
        $col = $PAL['M']
      } elseif ($dx -gt 4) {
        $col = if ($y -ge 55) { $PAL['v'] } else { $PAL['N'] }
      } else {
        $col = $PAL['g']
      }
      Set-Px $bmp $ox $oy $wx $y $col
    }
  }

  # Túi cuộn hành lý trên lưng khi nằm xuống
  Draw-Grid $bmp $ox $oy 29 ($baseY + 1) @(
    ".OOOO.",
    "OpPPpO",
    "OppppO",
    ".OOOO."
  )

  # Đầu nhân vật gục sát đất (bên trái với DOWN/LEFT, bên phải với RIGHT/UP)
  $headX = if ($dir -eq 'right' -or $dir -eq 'up') { 34 } else { 20 }
  $headTop = $baseY - 2
  Draw-Grid $bmp $ox $oy $headX $headTop @(
    "..OOOOOO..",
    ".OhHJJHHO.",
    "OhHHHHHHHO",
    "OhHssssHHO",
    ".OOOOOOOO."
  )

  # Cây gậy gỗ và chiếc đèn lồng tắt dần nằm yên cạnh người trên mặt đất (y: 53..58)
  if ($dir -eq 'down' -or $dir -eq 'left') {
    Draw-LinePx $bmp $ox $oy 14 56 30 57 "#5c3b24" "#24160e"
    Draw-CompactLanternAt $bmp $ox $oy 10 51 $(if ($f -eq 5) { 0 } else { 10 }) $true
  } else {
    Draw-LinePx $bmp $ox $oy 34 57 50 56 "#5c3b24" "#24160e"
    Draw-CompactLanternAt $bmp $ox $oy 48 51 $(if ($f -eq 5) { 0 } else { 10 }) $true
  }
}

function Build-ActionSheet([string]$fileName, [string]$mode, [int]$cols) {
  $W = $cols * 64
  $H = 4 * 64
  $bmp = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.Dispose()

  $dirs = @('down', 'up', 'left', 'right')
  for ($r = 0; $r -lt 4; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
      if ($mode -eq 'attack') {
        Draw-WayfarerAttackFrame $bmp $c $r $dirs[$r] $c
      } elseif ($mode -eq 'hurt') {
        Draw-WayfarerHurtFrame $bmp $c $r $dirs[$r] $c
      } elseif ($mode -eq 'death') {
        Draw-WayfarerDeathFrame $bmp $c $r $dirs[$r] $c
      }
    }
  }

  $fullPath = Join-Path $outDir $fileName
  $bmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Generated $fullPath ($($W)x$($H) px, 4 rows x $cols cols)"
}

Build-ActionSheet "wayfarer_attack.png" "attack" 6
Build-ActionSheet "wayfarer_hurt.png"   "hurt"   3
Build-ActionSheet "wayfarer_death.png"  "death"  6
