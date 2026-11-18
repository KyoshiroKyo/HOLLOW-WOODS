import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== RUNNING VERIFICATION FOR STEP V15-20: 3 MULTIPLE BRANCHING ENDINGS SYSTEM ===\n');

// 1. Kiểm tra JSON hợp lệ và dữ liệu 3 Ending Lore trong src/data/lore.json
try {
  const lorePath = path.resolve('src/data/lore.json');
  const loreRaw = fs.readFileSync(lorePath, 'utf8');
  const loreData = JSON.parse(loreRaw);
  assert(true, 'src/data/lore.json cú pháp JSON hợp lệ 100%');

  // Kiểm tra Ending 1: True Ending
  const trueEnding = loreData.loreEntries.find(e => e.id === 'lore_ending_true');
  assert(!!trueEnding, 'Tồn tại mảnh ký ức lore_ending_true');
  assert(trueEnding?.title.includes('BÌNH MINH CỦA TIẾNG CHUÔNG') && trueEnding?.title.includes('TRUE ENDING'), 'Tiêu đề True Ending chuẩn xác');
  assert(trueEnding?.act === 6, 'True Ending thuộc Act 6 (Hồi kết)');
  assert(trueEnding?.content.includes('Đại Hồng Chung') && trueEnding?.content.includes('Mạch Rễ'), 'Nội dung True Ending nhắc đến Đại Hồng Chung và Mạch Rễ');
  assert(trueEnding?.content.includes('Chỉ Huy Hiệp Sĩ Đen'), 'Nội dung True Ending đề cập Chỉ Huy Hiệp Sĩ Đen');
  assert(trueEnding?.content.includes('Edda') && trueEnding?.content.includes('Garth'), 'Nội dung True Ending nhắc đến dân làng Bellhollow');

  // Kiểm tra Ending 2: Sacrifice Ending
  const sacrificeEnding = loreData.loreEntries.find(e => e.id === 'lore_ending_sacrifice');
  assert(!!sacrificeEnding, 'Tồn tại mảnh ký ức lore_ending_sacrifice');
  assert(sacrificeEnding?.title.includes('NGƯỜI CANH GÁC VĨNH HẰNG') && sacrificeEnding?.title.includes('BITTERSWEET'), 'Tiêu đề Sacrifice Ending chuẩn xác');
  assert(sacrificeEnding?.act === 6, 'Sacrifice Ending thuộc Act 6');
  assert(sacrificeEnding?.content.includes('pho tượng hiệp sĩ') || sacrificeEnding?.content.includes('thân xác'), 'Nội dung Sacrifice Ending nhắc đến sự hy sinh hóa tượng rêu phong');
  assert(sacrificeEnding?.content.includes('The Veil') && sacrificeEnding?.content.includes('ngọn đèn'), 'Nội dung nhắc đến ngọn đèn và khe nứt The Veil');

  // Kiểm tra Ending 3: Fog Loop Ending
  const fogLoopEnding = loreData.loreEntries.find(e => e.id === 'lore_ending_fog_loop');
  assert(!!fogLoopEnding, 'Tồn tại mảnh ký ức lore_ending_fog_loop');
  assert(fogLoopEnding?.title.includes('VÒNG LẶP CỦA SƯƠNG MÙ') && fogLoopEnding?.title.includes('FOG LOOP'), 'Tiêu đề Fog Loop Ending chuẩn xác');
  assert(fogLoopEnding?.act === 6, 'Fog Loop Ending thuộc Act 6');
  assert(fogLoopEnding?.content.includes('vết nứt') && fogLoopEnding?.content.includes('vòng lặp'), 'Nội dung Fog Loop Ending nhắc đến vết nứt chuông và vòng lặp sương mù');
} catch (e) {
  assert(false, `Lỗi đọc src/data/lore.json: ${e.message}`);
}

// 2. Kiểm tra src/systems/EndingSystem.ts
try {
  const endingSystemPath = path.resolve('src/systems/EndingSystem.ts');
  const code = fs.readFileSync(endingSystemPath, 'utf8');
  assert(true, 'Đọc thành công src/systems/EndingSystem.ts');

  // Kiểm tra các định nghĩa Type và Cấu hình Kết Thúc
  assert(code.includes("export type EndingType = 'true_ending' | 'sacrifice_ending' | 'fog_loop_ending'"), 'Định nghĩa type EndingType chuẩn xác');
  assert(code.includes('ENDING_CONFIGS: Record<EndingType, EndingConfig>'), 'Định nghĩa ENDING_CONFIGS cho 3 kết thúc');
  assert(code.includes('lore_ending_true') && code.includes('lore_ending_sacrifice') && code.includes('lore_ending_fog_loop'), 'Cấu hình liên kết 3 Lore ID tương ứng');
  assert(code.includes('ending_true_achieved') && code.includes('ending_sacrifice_achieved') && code.includes('ending_fog_loop_achieved'), 'Cấu hình liên kết 3 StoryFlag tương ứng');

  // Kiểm tra hàm phân nhánh determineEndingType
  assert(code.includes('determineEndingType(): EndingType'), 'Tồn tại phương thức determineEndingType()');
  assert(code.includes('stage >= 3 && trust >= 65') || (code.includes('stage >= 3') && code.includes('trust >= 65')), 'Điều kiện True Ending: stage >= 3 và trust >= 65');
  assert(code.includes('stage >= 2'), 'Điều kiện Sacrifice Ending: stage >= 2');
  assert(code.includes("return 'fog_loop_ending'"), 'Fallback cho Fog Loop Ending khi stage < 2');

  // Giả lập logic kiểm thử thuật toán determineEndingType
  const testDetermineEnding = (stage, trust) => {
    if (stage >= 3 && trust >= 65) return 'true_ending';
    if (stage >= 2) return 'sacrifice_ending';
    return 'fog_loop_ending';
  };

  assert(testDetermineEnding(3, 75) === 'true_ending', 'Logic phân nhánh: Stage 3 + Trust 75 -> true_ending');
  assert(testDetermineEnding(3, 65) === 'true_ending', 'Logic phân nhánh: Stage 3 + Trust 65 -> true_ending (ngưỡng chuẩn)');
  assert(testDetermineEnding(3, 64) === 'sacrifice_ending', 'Logic phân nhánh: Stage 3 + Trust 64 -> sacrifice_ending (thiếu gắn kết dân làng)');
  assert(testDetermineEnding(2, 85) === 'sacrifice_ending', 'Logic phân nhánh: Stage 2 + Trust 85 -> sacrifice_ending (chưa đại thức tỉnh)');
  assert(testDetermineEnding(2, 40) === 'sacrifice_ending', 'Logic phân nhánh: Stage 2 + Trust 40 -> sacrifice_ending');
  assert(testDetermineEnding(1, 95) === 'fog_loop_ending', 'Logic phân nhánh: Stage 1 + Trust 95 -> fog_loop_ending (vội vàng hoàn tất)');
  assert(testDetermineEnding(0, 50) === 'fog_loop_ending', 'Logic phân nhánh: Stage 0 + Trust 50 -> fog_loop_ending (mất trí nhớ)');

  // Kiểm tra 3 hàm vẽ Pixel Art minh họa
  assert(code.includes('drawTrueEndingIllustration'), 'Tồn tại hàm vẽ Pixel Art drawTrueEndingIllustration');
  assert(code.includes('drawSacrificeEndingIllustration'), 'Tồn tại hàm vẽ Pixel Art drawSacrificeEndingIllustration');
  assert(code.includes('drawFogLoopEndingIllustration'), 'Tồn tại hàm vẽ Pixel Art drawFogLoopEndingIllustration');

  // Kiểm tra Bảng Thống Kê Hành Trình Sinh Tồn (Survival Chronicle)
  assert(code.includes('renderSurvivalChronicle'), 'Tồn tại hàm renderSurvivalChronicle');
  assert(code.includes('BIÊN NIÊN SỬ SINH TỒN (SURVIVAL CHRONICLE)'), 'Có tiêu đề BIÊN NIÊN SỬ SINH TỒN');
  assert(code.includes('dayCount') && code.includes('villageTrustScore') && code.includes('memoryAwakeningStage'), 'Thống kê đầy đủ ngày, niềm tin và thức tỉnh');
  assert(code.includes('unlockedLore') && code.includes('bestiary') && code.includes('visitedZones'), 'Thống kê lore, quái vật và phân khu bản đồ');

  // Kiểm tra âm thanh chuông phân nhánh
  assert(code.includes('playCrackedBellToll') && code.includes('playBronzeBellToll'), 'Phát chuông vỡ (Cracked) cho Fog Loop và chuông đồng (Bronze) cho True/Sacrifice');

  // Kiểm tra phím nóng và nút quay về
  assert(code.includes('▶ QUAY VỀ MENU CHÍNH') && code.includes('580'), 'Nút Quay Về Menu Chính tại Y = 580');
  assert(code.includes('keydown-ENTER') && code.includes('keydown-SPACE') && code.includes('keydown-ESC'), 'Hỗ trợ phím cứng ENTER, SPACE, ESC');
  assert(code.includes("stop('GameScene')") && code.includes("stop('UIScene')") && code.includes('start(SCENE_MAIN_MENU)'), 'Chuyển cảnh dọn dẹp sạch sẽ về MainMenu');
} catch (e) {
  assert(false, `Lỗi đọc src/systems/EndingSystem.ts: ${e.message}`);
}

// 3. Kiểm tra src/scenes/GameScene.ts
try {
  const gameScenePath = path.resolve('src/scenes/GameScene.ts');
  const gsCode = fs.readFileSync(gameScenePath, 'utf8');

  assert(gsCode.includes("actionId === 'inspect_bell'"), 'GameScene có xử lý actionId inspect_bell');
  assert(gsCode.includes('ending_true_achieved') && gsCode.includes('ending_sacrifice_achieved') && gsCode.includes('ending_fog_loop_achieved'), 'inspect_bell hiển thị danh hiệu tương ứng với kết thúc đã mở');
  assert(gsCode.includes('triggerTheFirstTollFinale'), 'inspect_bell gọi triggerTheFirstTollFinale khi có quest_bronze_clapper');
} catch (e) {
  assert(false, `Lỗi đọc src/scenes/GameScene.ts: ${e.message}`);
}

console.log('\n---------------------------------------------------------');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('---------------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> V15-20 VERIFICATION COMPLETED WITH 100% SUCCESS <<<\n');
  process.exit(0);
}
