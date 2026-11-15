Add-Type -AssemblyName System.Drawing

$outDir = "G:\HOLLOW WOODS\public\assets\characters\mossbound_wayfarer"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# ============================================================================
# BẢNG MÀU CHUẨN THE MOSSBOUND WAYFARER (C4-12-05 CONCEPT REFERENCE PALETTE)
# ============================================================================
$PAL = New-Object 'System.Collections.Generic.Dictionary[string,string]'
$PAL['O'] = "#141115" # Viền mực tối (Crisp dark outline)
$PAL['h'] = "#241612" # Tóc nâu đen bóng râm (Hair deep shadow)
$PAL['H'] = "#3b251d" # Tóc nâu trầm (Hair mid-tone)
$PAL['j'] = "#57392c" # Tóc nâu sáng (Hair light)
$PAL['J'] = "#704c3b" # Tóc điểm sáng (Hair highlight)

$PAL['s'] = "#c7926f" # Da bóng râm (Skin shadow)
$PAL['S'] = "#eabfa0" # Da trung tính (Skin base)
$PAL['k'] = "#f7d6bc" # Da sáng (Skin highlight)
$PAL['E'] = "#181210" # Mắt đen (Eye dark)
$PAL['w'] = "#f7f1e8" # Ánh mắt trắng (Eye glint)

$PAL['c'] = "#183329" # Áo choàng xanh rêu tối (Cloak deep teal-green)
$PAL['C'] = "#254d3e" # Áo choàng xanh rêu trung (Cloak mid)
$PAL['g'] = "#386b56" # Áo choàng xanh rêu sáng (Cloak light)
$PAL['m'] = "#4e8548" # Lá rêu vai áo (Moss mantle mid)
$PAL['M'] = "#6da358" # Lá rêu sáng (Moss mantle bright)
$PAL['L'] = "#8ec26b" # Đọt lá non (Leaf highlight)
$PAL['a'] = "#c97a2b" # Lá thu / khuy vai (Autumn leaf accent)

$PAL['t'] = "#6b4829" # Áo trong vàng đất tối (Ochre tunic dark)
$PAL['T'] = "#8f643a" # Áo trong vàng đất vừa (Ochre tunic mid)
$PAL['u'] = "#b07f4e" # Áo trong vàng đất sáng (Ochre tunic light)

$PAL['l'] = "#2b1b12" # Dây da / thắt lưng tối (Leather dark)
$PAL['d'] = "#4a3020" # Dây da vừa (Leather mid)
$PAL['D'] = "#66442e" # Túi hành lý / bao tay sáng (Pack/Leather light)
$PAL['p'] = "#7d5e42" # Cuộn chăn hành lý (Bedroll mid)
$PAL['P'] = "#997656" # Cuộn chăn hành lý sáng (Bedroll light)
$PAL['B'] = "#e0b24c" # Khóa đồng cổ (Brass buckle)

$PAL['n'] = "#211d1a" # Quần tối (Trousers dark)
$PAL['N'] = "#332c28" # Quần vừa (Trousers mid)
$PAL['b'] = "#291a12" # Ủng da tối (Boot dark)
$PAL['v'] = "#422b1d" # Ủng da vừa (Boot mid)
$PAL['V'] = "#5c3d2a" # Ủng da sáng (Boot highlight)

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

function Set-Px([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$x, [int]$y, [string]$hex, [int]$alpha = 255) {
  $px = $ox + $x
  $py = $oy + $y
  if ($px -ge $ox -and $px -lt ($ox + 64) -and $py -ge $oy -and $py -lt ($oy + 64)) {
    $bmp.SetPixel($px, $py, (Get-Col $hex $alpha))
  }
}

function Draw-Grid([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy, [int]$startX, [int]$startY, [string[]]$rows) {
  for ($r = 0; $r -lt $rows.Count; $r++) {
    $line = $rows[$r]
    for ($c = 0; $c -lt $line.Length; $c++) {
      $ch = [string]$line[$c]
      if ($ch -ne '.' -and $PAL.ContainsKey($ch) -and $null -ne $PAL[$ch]) {
        Set-Px $bmp $ox $oy ($startX + $c) ($startY + $r) $PAL[$ch] 255
      }
    }
  }
}

# ============================================================================
# CÁC MẪU ĐẦU & TÓC PIXEL ART ĐƯỢC ĐIÊU KHẮC TỈ MỈ (16x13 px) CHO 4 HƯỚNG
# Không hộp vuông, có chỏm tóc rối tự nhiên, cằm thon và đôi mắt có hồn.
# ============================================================================
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

# Vẽ đèn lồng hổ phách nhỏ gọn (5x6 px) + gậy gỗ tự nhiên
function Draw-StaffAndLantern(
  [System.Drawing.Bitmap]$bmp,
  [int]$ox,
  [int]$oy,
  [int]$staffX,
  [int]$staffTopY,
  [int]$staffBotY,
  [int]$lanternSide, # -1 = treo bên trái gậy, +1 = treo bên phải gậy
  [int]$glowBoost = 0,
  [int]$tilt = 0     # Độ nghiêng nhẹ khi chạy (-1, 0, +1)
) {
  # Vẽ thân gậy gỗ có độ cong tự nhiên
  for ($y = $staffTopY; $y -le $staffBotY; $y++) {
    $prog = ($y - $staffTopY) / [Math]::Max(1.0, ($staffBotY - $staffTopY))
    $sx = $staffX + [Math]::Round($prog * $tilt)
    Set-Px $bmp $ox $oy $sx $y "#24160e"
    Set-Px $bmp $ox $oy ($sx + 1) $y "#5c3b24"
  }
  # Đầu gậy uốn cong treo đèn
  $branchX = if ($lanternSide -lt 0) { $staffX - 3 } else { $staffX + 1 }
  for ($bx = 0; $bx -lt 4; $bx++) {
    Set-Px $bmp $ox $oy ($branchX + $bx) $staffTopY "#24160e"
    Set-Px $bmp $ox $oy ($branchX + $bx) ($staffTopY + 1) "#5c3b24"
  }

  # Vị trí lồng đèn nhỏ gọn (5x6 px)
  $lx = if ($lanternSide -lt 0) { $staffX - 5 } else { $staffX + 2 }
  $ly = $staffTopY + 2

  # Quầng sáng hổ phách dịu nhẹ (alpha thấp, không che mặt/thân)
  $ga = 28 + $glowBoost
  for ($gy = -1; $gy -le 6; $gy++) {
    for ($gx = -1; $gx -le 5; $gx++) {
      $px = $ox + $lx + $gx
      $py = $oy + $ly + $gy
      if ($px -ge $ox -and $px -lt ($ox + 64) -and $py -ge $oy -and $py -lt ($oy + 64)) {
        if ($bmp.GetPixel($px, $py).A -eq 0) {
          $bmp.SetPixel($px, $py, (Get-Col "#f39c12" $ga))
        }
      }
    }
  }

  # Dây treo & Nắp đèn
  Set-Px $bmp $ox $oy ($lx + 2) ($ly - 1) "#9c6f24"
  for ($dx = 1; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) $ly "#1c1512" }
  for ($dx = 0; $dx -le 4; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) ($ly + 1) "#261c16" }

  # Thân đèn phát sáng hổ phách (3x3 lõi sáng bên trong khung 5x3)
  for ($dy = 2; $dy -le 4; $dy++) {
    Set-Px $bmp $ox $oy $lx ($ly + $dy) "#261c16"
    Set-Px $bmp $ox $oy ($lx + 4) ($ly + $dy) "#261c16"
    Set-Px $bmp $ox $oy ($lx + 1) ($ly + $dy) "#d35400"
    Set-Px $bmp $ox $oy ($lx + 2) ($ly + $dy) "#f39c12"
    Set-Px $bmp $ox $oy ($lx + 3) ($ly + $dy) "#d35400"
  }
  Set-Px $bmp $ox $oy ($lx + 2) ($ly + 3) "#fef9e7"

  # Đáy đèn
  for ($dx = 1; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($lx + $dx) ($ly + 5) "#1c1512" }
}

# Vẽ bóng đổ mặt đất mềm dưới hai bàn chân
function Draw-GroundShadow([System.Drawing.Bitmap]$bmp, [int]$ox, [int]$oy) {
  for ($y = 56; $y -le 58; $y++) {
    $rx = if ($y -eq 57) { 8 } else { 6 }
    for ($dx = -$rx; $dx -le $rx; $dx++) {
      $px = $ox + 32 + $dx
      $py = $oy + $y
      if ($bmp.GetPixel($px, $py).A -eq 0) {
        $bmp.SetPixel($px, $py, (Get-Col "#0a0e0c" 95))
      }
    }
  }
}

# ============================================================================
# HÀM VẼ 1 FRAME (64x64) CỦA THE MOSSBOUND WAYFARER
# Chiều cao hiển thị: 29–30px (y = 29..58), đúng bằng ~1.53x Satyr cũ (19px).
# Điểm neo bàn chân (Bottom-Center Foot Anchor): (x = 32, y = 58).
# ============================================================================
function Draw-WayfarerFrame(
  [System.Drawing.Bitmap]$bmp,
  [int]$colIdx,
  [int]$rowIdx,
  [string]$dir,
  [string]$mode,
  [int]$frameIdx
) {
  $ox = $colIdx * 64
  $oy = $rowIdx * 64

  Draw-GroundShadow $bmp $ox $oy

  # Thông số nhịp cơ thể & bước chân theo từng frame
  $bobY = 0
  $leanX = 0
  $capeFlare = 0
  $lStepX = 0; $lLiftY = 0
  $rStepX = 0; $rLiftY = 0
  $staffDX = 0; $staffDY = 0; $staffTilt = 0
  $offArmDX = 0; $offArmDY = 0
  $glowBoost = 0

  if ($mode -eq 'idle') {
    switch ($frameIdx) {
      0 { $bobY = 0;  $capeFlare = 0; $staffDY = 0;  $glowBoost = 0 }
      1 { $bobY = -1; $capeFlare = 1; $staffDY = -1; $glowBoost = 8 }
      2 { $bobY = -1; $capeFlare = 1; $staffDY = 0;  $glowBoost = 14 }
      3 { $bobY = 0;  $capeFlare = 0; $staffDY = 0;  $glowBoost = 6 }
    }
  } elseif ($mode -eq 'walk') {
    switch ($frameIdx) {
      0 { $bobY = 0;  $lStepX = -2; $lLiftY = 1; $rStepX = 2;  $rLiftY = 0; $staffDX = 1;  $staffDY = 0;  $offArmDX = -1; $capeFlare = 1 }
      1 { $bobY = 1;  $lStepX = -1; $lLiftY = 0; $rStepX = 1;  $rLiftY = 1; $staffDX = 1;  $staffDY = 1;  $offArmDX = -1; $capeFlare = 2 }
      2 { $bobY = -1; $lStepX = 0;  $lLiftY = 2; $rStepX = 0;  $rLiftY = 0; $staffDX = 0;  $staffDY = -1; $offArmDX = 0;  $capeFlare = 1 }
      3 { $bobY = 0;  $lStepX = 2;  $lLiftY = 0; $rStepX = -2; $rLiftY = 1; $staffDX = -1; $staffDY = 0;  $offArmDX = 1;  $capeFlare = 1 }
      4 { $bobY = 1;  $lStepX = 1;  $lLiftY = 1; $rStepX = -1; $rLiftY = 0; $staffDX = -1; $staffDY = 1;  $offArmDX = 1;  $capeFlare = 2 }
      5 { $bobY = -1; $lStepX = 0;  $lLiftY = 0; $rStepX = 0;  $rLiftY = 2; $staffDX = 0;  $staffDY = -1; $offArmDX = 0;  $capeFlare = 1 }
    }
  } elseif ($mode -eq 'run') {
    if ($dir -eq 'left') { $leanX = -1; $staffTilt = 2 }
    elseif ($dir -eq 'right') { $leanX = 1; $staffTilt = -2 }
    switch ($frameIdx) {
      0 { $bobY = 0;  $lStepX = -4; $lLiftY = 2; $rStepX = 3;  $rLiftY = 0; $staffDX = 2;  $staffDY = -1; $offArmDX = -2; $offArmDY = -1; $capeFlare = 3; $glowBoost = 10 }
      1 { $bobY = 1;  $lStepX = -2; $lLiftY = 0; $rStepX = 2;  $rLiftY = 2; $staffDX = 1;  $staffDY = 1;  $offArmDX = -1; $offArmDY = 0;  $capeFlare = 4; $glowBoost = 4 }
      2 { $bobY = -1; $lStepX = 0;  $lLiftY = 3; $rStepX = 0;  $rLiftY = 0; $staffDX = 0;  $staffDY = -2; $offArmDX = 0;  $offArmDY = -1; $capeFlare = 2; $glowBoost = 12 }
      3 { $bobY = 0;  $lStepX = 3;  $lLiftY = 0; $rStepX = -4; $rLiftY = 2; $staffDX = -2; $staffDY = -1; $offArmDX = 2;  $offArmDY = -1; $capeFlare = 3; $glowBoost = 10 }
      4 { $bobY = 1;  $lStepX = 2;  $lLiftY = 2; $rStepX = -2; $rLiftY = 0; $staffDX = -1; $staffDY = 1;  $offArmDX = 1;  $offArmDY = 0;  $capeFlare = 4; $glowBoost = 4 }
      5 { $bobY = -1; $lStepX = 0;  $lLiftY = 0; $rStepX = 0;  $rLiftY = 3; $staffDX = 0;  $staffDY = -2; $offArmDX = 0;  $offArmDY = -1; $capeFlare = 2; $glowBoost = 12 }
    }
  }

  $headY = 29 + $bobY   # Đỉnh đầu tại y = 29 (hoặc 28 khi nhún lên) -> chiều cao 30px (y: 29..58)
  $torsoY = 40 + $bobY  # Thân áo từ y = 40..50

  # ==========================================================================
  # HƯỚNG 1: DOWN (NHÌN XUỐNG / MẶT TRƯỚC - ROW 0)
  # ==========================================================================
  if ($dir -eq 'down') {
    # 1. Tà áo choàng xanh rêu xòe hình thang tự nhiên phía sau lưng
    for ($dy = 0; $dy -le 11; $dy++) {
      $halfW = 6 + [Math]::Floor(($dy + $capeFlare) / 3)
      for ($dx = -$halfW; $dx -le $halfW; $dx++) {
        $col = if ([Math]::Abs($dx) -eq $halfW -or $dy -eq 11) { $PAL['O'] } elseif ([Math]::Abs($dx) -ge ($halfW - 2)) { $PAL['C'] } else { $PAL['c'] }
        Set-Px $bmp $ox $oy (32 + $dx) ($torsoY + $dy) $col
      }
    }
    # Túi cuộn hành lý nhô nhẹ bên vai phải (x: 37..40)
    Draw-Grid $bmp $ox $oy 36 ($torsoY - 2) @(
      ".OOO.",
      "OpPPO",
      "OpppO",
      ".OOO."
    )

    # 2. Hai chân & ủng da (Chân chạm đúng dòng y = 58)
    $lFootBottom = 58 - $lLiftY
    $rFootBottom = 58 - $rLiftY
    # Đảm bảo ít nhất 1 bàn chân trụ chạm y = 58 để neo mặt đất vững chắc
    if ($lFootBottom -lt 58 -and $rFootBottom -lt 58) { $rFootBottom = 58 }

    for ($y = 50; $y -le $lFootBottom; $y++) {
      $colIn = if ($y -lt ($lFootBottom - 4)) { $PAL['N'] } elseif ($y -eq ($lFootBottom - 4)) { $PAL['C'] } elseif ($y -lt ($lFootBottom - 1)) { $PAL['v'] } else { $PAL['V'] }
      Set-Px $bmp $ox $oy 27 $y $PAL['O']
      Set-Px $bmp $ox $oy 28 $y $colIn
      Set-Px $bmp $ox $oy 29 $y $colIn
      Set-Px $bmp $ox $oy 30 $y $PAL['O']
    }
    for ($dx = 27; $dx -le 30; $dx++) { Set-Px $bmp $ox $oy $dx $lFootBottom $PAL['O'] }

    for ($y = 50; $y -le $rFootBottom; $y++) {
      $colIn = if ($y -lt ($rFootBottom - 4)) { $PAL['n'] } elseif ($y -eq ($rFootBottom - 4)) { $PAL['C'] } elseif ($y -lt ($rFootBottom - 1)) { $PAL['v'] } else { $PAL['V'] }
      Set-Px $bmp $ox $oy 33 $y $PAL['O']
      Set-Px $bmp $ox $oy 34 $y $colIn
      Set-Px $bmp $ox $oy 35 $y $colIn
      Set-Px $bmp $ox $oy 36 $y $PAL['O']
    }
    for ($dx = 33; $dx -le 36; $dx++) { Set-Px $bmp $ox $oy $dx $rFootBottom $PAL['O'] }

    # 3. Thân áo vàng đất (Ochre Tunic), dây đai chéo, khóa đồng & khăn choàng lá rừng (Moss Mantle)
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
    Draw-Grid $bmp $ox $oy 24 $torsoY $TORSO_DOWN

    # 4. Đầu & Mái tóc nâu rối tự nhiên
    Draw-Grid $bmp $ox $oy 24 $headY $HEAD_DOWN

    # 5. Gậy gỗ & Đèn lồng hổ phách nhỏ gọn bên tay phải (bên trái màn hình x = 22)
    $stBot = if ($mode -eq 'idle') { 58 } else { 57 }
    Draw-StaffAndLantern $bmp $ox $oy (22 + $staffDX) (34 + $staffDY) $stBot -1 $glowBoost 0
  }

  # ==========================================================================
  # HƯỚNG 2: LEFT (NHÌN TRÁI - ROW 1)
  # ==========================================================================
  elseif ($dir -eq 'left') {
    $cx = 32 + $leanX

    # 1. Gậy gỗ & Đèn lồng đưa ra phía trước mặt (bên trái x ~ 22)
    $stBot = if ($mode -eq 'idle') { 58 } else { 56 }
    Draw-StaffAndLantern $bmp $ox $oy ($cx - 9 + $staffDX) (34 + $staffDY) $stBot -1 $glowBoost $staffTilt

    # 2. Hai chân bước sang trái (Chân trụ tại y = 58, chân bước có độ vươn lStepX / rStepX)
    $fLegX = $cx - 2 + $lStepX
    $bLegX = $cx + 1 + $rStepX
    $fFootY = 58 - $lLiftY
    $bFootY = 58 - $rLiftY
    if ($fFootY -lt 58 -and $bFootY -lt 58) { $bFootY = 58 }

    # Chân sau
    for ($y = 50; $y -le $bFootY; $y++) {
      $cIn = if ($y -lt ($bFootY - 4)) { $PAL['n'] } else { $PAL['b'] }
      Set-Px $bmp $ox $oy $bLegX $y $PAL['O']
      Set-Px $bmp $ox $oy ($bLegX + 1) $y $cIn
      Set-Px $bmp $ox $oy ($bLegX + 2) $y $cIn
      Set-Px $bmp $ox $oy ($bLegX + 3) $y $PAL['O']
    }
    for ($dx = 0; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($bLegX + $dx) $bFootY $PAL['O'] }

    # Chân trước (mũi ủng hướng sang trái)
    for ($y = 50; $y -le $fFootY; $y++) {
      $cIn = if ($y -lt ($fFootY - 4)) { $PAL['N'] } elseif ($y -eq ($fFootY - 4)) { $PAL['C'] } elseif ($y -lt ($fFootY - 1)) { $PAL['v'] } else { $PAL['V'] }
      Set-Px $bmp $ox $oy $fLegX $y $PAL['O']
      Set-Px $bmp $ox $oy ($fLegX + 1) $y $cIn
      Set-Px $bmp $ox $oy ($fLegX + 2) $y $cIn
      Set-Px $bmp $ox $oy ($fLegX + 3) $y $PAL['O']
    }
    Set-Px $bmp $ox $oy ($fLegX - 1) ($fFootY - 1) $PAL['O']
    for ($dx = -1; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($fLegX + $dx) $fFootY $PAL['O'] }

    # 3. Túi cuộn hành lý đeo sau lưng (nhô ra bên phải áo choàng)
    Draw-Grid $bmp $ox $oy ($cx + 4) ($torsoY - 1) @(
      ".OOOO.",
      "OpPPpO",
      "OppppO",
      "OllllO",
      "OppppO",
      ".OOOO."
    )

    # 4. Thân nghiêng trái & Áo choàng xanh rêu lượn sóng chéo về phía sau (không vuông hộp!)
    for ($dy = 0; $dy -le 10; $dy++) {
      $leftEdge = $cx - 4 + [Math]::Floor($dy / 5)
      $rightEdge = $cx + 3 + [Math]::Floor(($dy * (3 + $capeFlare)) / 10)
      for ($x = $leftEdge; $x -le $rightEdge; $x++) {
        $col = $PAL['C']
        if ($x -eq $leftEdge -or $x -eq $rightEdge -or $dy -eq 10) { $col = $PAL['O'] }
        elseif ($dy -le 2) { $col = if (($x + $dy) % 2 -eq 0) { $PAL['M'] } else { $PAL['m'] } }
        elseif ($x -lt ($cx - 1)) {
          $col = if ($dy -eq 7) { $PAL['l'] } elseif ($dy -eq 8) { $PAL['B'] } else { $PAL['T'] }
        }
        elseif ($x -ge ($rightEdge - 2)) { $col = $PAL['c'] }
        else { $col = $PAL['g'] }
        Set-Px $bmp $ox $oy $x ($torsoY + $dy) $col
      }
    }

    # Cánh tay đưa ra phía trước cầm gậy (nối từ vai tới gậy)
    $armY = $torsoY + 3 + $staffDY
    for ($ax = ($cx - 8 + $staffDX); $ax -le ($cx - 1); $ax++) {
      Set-Px $bmp $ox $oy $ax ($armY - 1) $PAL['O']
      $armCol = if ($ax -le ($cx - 7 + $staffDX)) { $PAL['S'] } elseif ($ax -le ($cx - 5 + $staffDX)) { $PAL['d'] } else { $PAL['g'] }
      Set-Px $bmp $ox $oy $ax $armY $armCol
      Set-Px $bmp $ox $oy $ax ($armY + 1) $armCol
      Set-Px $bmp $ox $oy $ax ($armY + 2) $PAL['O']
    }

    # 5. Đầu nhìn nghiêng sang trái
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_LEFT
  }

  # ==========================================================================
  # HƯỚNG 3: RIGHT (NHÌN PHẢI - ROW 2)
  # Bất đối xứng chuẩn: Tay phải ở mặt gần cầm gậy đưa ra phía trước bên phải,
  # túi hành lý và tà áo choàng lượn sóng về phía sau bên trái.
  # ==========================================================================
  elseif ($dir -eq 'right') {
    $cx = 32 + $leanX

    # 1. Hai chân bước sang phải (Neo đáy tại y = 58)
    $bLegX = $cx - 4 + $lStepX
    $fLegX = $cx - 1 + $rStepX
    $bFootY = 58 - $lLiftY
    $fFootY = 58 - $rLiftY
    if ($fFootY -lt 58 -and $bFootY -lt 58) { $fFootY = 58 }

    # Chân sau
    for ($y = 50; $y -le $bFootY; $y++) {
      $cIn = if ($y -lt ($bFootY - 4)) { $PAL['n'] } else { $PAL['b'] }
      Set-Px $bmp $ox $oy $bLegX $y $PAL['O']
      Set-Px $bmp $ox $oy ($bLegX + 1) $y $cIn
      Set-Px $bmp $ox $oy ($bLegX + 2) $y $cIn
      Set-Px $bmp $ox $oy ($bLegX + 3) $y $PAL['O']
    }
    for ($dx = 0; $dx -le 3; $dx++) { Set-Px $bmp $ox $oy ($bLegX + $dx) $bFootY $PAL['O'] }

    # Chân trước (mũi ủng hướng sang phải)
    for ($y = 50; $y -le $fFootY; $y++) {
      $cIn = if ($y -lt ($fFootY - 4)) { $PAL['N'] } elseif ($y -eq ($fFootY - 4)) { $PAL['C'] } elseif ($y -lt ($fFootY - 1)) { $PAL['v'] } else { $PAL['V'] }
      Set-Px $bmp $ox $oy $fLegX $y $PAL['O']
      Set-Px $bmp $ox $oy ($fLegX + 1) $y $cIn
      Set-Px $bmp $ox $oy ($fLegX + 2) $y $cIn
      Set-Px $bmp $ox $oy ($fLegX + 3) $y $PAL['O']
    }
    Set-Px $bmp $ox $oy ($fLegX + 4) ($fFootY - 1) $PAL['O']
    for ($dx = 0; $dx -le 4; $dx++) { Set-Px $bmp $ox $oy ($fLegX + $dx) $fFootY $PAL['O'] }

    # 2. Túi cuộn hành lý đeo sau lưng (nhô ra bên trái áo choàng)
    Draw-Grid $bmp $ox $oy ($cx - 10) ($torsoY - 1) @(
      ".OOOO.",
      "OpPPpO",
      "OppppO",
      "OllllO",
      "OppppO",
      ".OOOO."
    )

    # 3. Thân nghiêng phải & Áo choàng xanh rêu lượn sóng chéo về phía sau bên trái
    for ($dy = 0; $dy -le 10; $dy++) {
      $leftEdge = $cx - 3 - [Math]::Floor(($dy * (3 + $capeFlare)) / 10)
      $rightEdge = $cx + 4 - [Math]::Floor($dy / 5)
      for ($x = $leftEdge; $x -le $rightEdge; $x++) {
        $col = $PAL['C']
        if ($x -eq $leftEdge -or $x -eq $rightEdge -or $dy -eq 10) { $col = $PAL['O'] }
        elseif ($dy -le 2) { $col = if (($x + $dy) % 2 -eq 0) { $PAL['M'] } else { $PAL['m'] } }
        elseif ($x -gt ($cx + 1)) {
          $col = if ($dy -eq 7) { $PAL['l'] } elseif ($dy -eq 8) { $PAL['B'] } else { $PAL['T'] }
        }
        elseif ($x -le ($leftEdge + 2)) { $col = $PAL['c'] }
        else { $col = $PAL['g'] }
        Set-Px $bmp $ox $oy $x ($torsoY + $dy) $col
      }
    }

    # 4. Đầu nhìn nghiêng sang phải
    Draw-Grid $bmp $ox $oy ($cx - 8) $headY $HEAD_RIGHT

    # 5. Cánh tay phải ở mặt gần (Foreground) cầm gậy gỗ & đèn lồng đưa ra phía trước bên phải
    $stBot = if ($mode -eq 'idle') { 58 } else { 56 }
    $stX = $cx + 8 - $staffDX
    $armY = $torsoY + 3 + $staffDY
    for ($ax = ($cx + 1); $ax -le $stX; $ax++) {
      Set-Px $bmp $ox $oy $ax ($armY - 1) $PAL['O']
      $armCol = if ($ax -ge ($stX - 1)) { $PAL['S'] } elseif ($ax -ge ($stX - 3)) { $PAL['d'] } else { $PAL['g'] }
      Set-Px $bmp $ox $oy $ax $armY $armCol
      Set-Px $bmp $ox $oy $ax ($armY + 1) $armCol
      Set-Px $bmp $ox $oy $ax ($armY + 2) $PAL['O']
    }
    Draw-StaffAndLantern $bmp $ox $oy $stX (34 + $staffDY) $stBot 1 $glowBoost $staffTilt
  }

  # ==========================================================================
  # HƯỚNG 4: UP (NHÌN LÊN / MẶT SAU - ROW 3)
  # ==========================================================================
  elseif ($dir -eq 'up') {
    # 1. Gậy gỗ & Đèn lồng bên tay phải (bên phải màn hình x = 42)
    $stBot = if ($mode -eq 'idle') { 58 } else { 57 }
    Draw-StaffAndLantern $bmp $ox $oy (41 - $staffDX) (34 + $staffDY) $stBot 1 $glowBoost 0

    # 2. Hai chân nhìn từ phía sau (Neo đáy tại y = 58)
    $lFootBottom = 58 - $lLiftY
    $rFootBottom = 58 - $rLiftY
    if ($lFootBottom -lt 58 -and $rFootBottom -lt 58) { $rFootBottom = 58 }

    for ($y = 50; $y -le $lFootBottom; $y++) {
      $colIn = if ($y -lt ($lFootBottom - 4)) { $PAL['n'] } else { $PAL['b'] }
      Set-Px $bmp $ox $oy 27 $y $PAL['O']
      Set-Px $bmp $ox $oy 28 $y $colIn
      Set-Px $bmp $ox $oy 29 $y $colIn
      Set-Px $bmp $ox $oy 30 $y $PAL['O']
    }
    for ($dx = 27; $dx -le 30; $dx++) { Set-Px $bmp $ox $oy $dx $lFootBottom $PAL['O'] }

    for ($y = 50; $y -le $rFootBottom; $y++) {
      $colIn = if ($y -lt ($rFootBottom - 4)) { $PAL['n'] } else { $PAL['v'] }
      Set-Px $bmp $ox $oy 33 $y $PAL['O']
      Set-Px $bmp $ox $oy 34 $y $colIn
      Set-Px $bmp $ox $oy 35 $y $colIn
      Set-Px $bmp $ox $oy 36 $y $PAL['O']
    }
    for ($dx = 33; $dx -le 36; $dx++) { Set-Px $bmp $ox $oy $dx $rFootBottom $PAL['O'] }

    # 3. Mặt sau Áo Choàng Xanh Rêu phủ lá rừng & Túi Cuộn Hành Lý đeo ngang lưng
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
    Draw-Grid $bmp $ox $oy 24 $torsoY $TORSO_UP

    # 4. Đầu nhìn từ phía sau (Mái tóc nâu rối tự nhiên che gáy)
    Draw-Grid $bmp $ox $oy 24 $headY $HEAD_UP
  }
}

function Build-WayfarerSheet([string]$fileName, [string]$mode, [int]$cols) {
  $W = $cols * 64
  $H = 4 * 64
  $bmp = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.Dispose()

  $dirs = @('down', 'up', 'left', 'right')
  for ($r = 0; $r -lt 4; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
      Draw-WayfarerFrame $bmp $c $r $dirs[$r] $mode $c
    }
  }

  $fullPath = Join-Path $outDir $fileName
  $bmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Generated $fullPath ($($W)x$($H) px, 4 rows x $cols cols)"
}

Build-WayfarerSheet "wayfarer_idle.png" "idle" 4
Build-WayfarerSheet "wayfarer_walk.png" "walk" 6
Build-WayfarerSheet "wayfarer_run.png"  "run"  6
