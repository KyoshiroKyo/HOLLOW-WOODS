import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log('================================================================');
console.log('VERIFYING MILESTONE C4-13-14: MENU BUTTON, DIALOGUE PADDING & VIETNAMESE LORE');
console.log('================================================================\n');

// 1. Kiểm tra MainMenuScene.ts
console.log('--- 1. RÚT GỌN NHÃN NÚT TRÊN MAINMENUSCENE.TS ---');
const mainMenuPath = path.resolve('src/scenes/MainMenuScene.ts');
const mainMenuCode = fs.readFileSync(mainMenuPath, 'utf8');

assert(
  mainMenuCode.includes("'► BƯỚC VÀO MÀN SƯƠNG'"),
  "Nút bắt đầu trên MainMenuScene đã đổi thành '► BƯỚC VÀO MÀN SƯƠNG'"
);
assert(
  !mainMenuCode.includes("'► BƯỚC VÀO MÀN SƯƠNG (") && !mainMenuCode.includes("'▶ BƯỚC VÀO MÀN SƯƠNG ("),
  "Đã loại bỏ hoàn toàn cụm lặp ý phụ trong nhãn nút bắt đầu"
);

// 2. Kiểm tra UIScene.ts
console.log('\n--- 2. KHUNG HỘI THOẠI & CHỐNG CẮT LẸM CHỮ TRÊN UISCENE.TS ---');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf8');

assert(
  uiSceneCode.includes('-halfW + 202, -halfH + 20'),
  'Tọa độ x của dialogueSpeakerText được dịch sang phải 18px (-halfW + 202)'
);
assert(
  uiSceneCode.includes('-halfW + 202, -halfH + 60'),
  'Tọa độ x của dialogueContentText được dịch sang phải 18px (-halfW + 202)'
);
assert(
  uiSceneCode.includes('padding: { left: 12, right: 12, top: 6, bottom: 6 }'),
  'Thuộc tính padding { left: 12, right: 12, top: 6, bottom: 6 } được cấu hình cho văn bản'
);
assert(
  uiSceneCode.includes('wordWrap: { width: boxWidth - 250 }'),
  'wordWrap.width được giảm nhẹ tương ứng (boxWidth - 250) chống tràn và cắt mép'
);

// 3. Kiểm tra dialogues.json
console.log('\n--- 3. ĐỒNG BỘ NGÔN NGỮ TIẾNG VIỆT TRONG DIALOGUES.JSON ---');
const dialoguesPath = path.resolve('src/data/dialogues.json');
const dialoguesData = JSON.parse(fs.readFileSync(dialoguesPath, 'utf8')).dialogues;

// Garth
assert(
  dialoguesData.garth_warning.lines.some(l => l.includes('Khu rừng Hollow Woods')),
  'garth_warning chuyển sang "Khu rừng Hollow Woods"'
);
assert(
  !dialoguesData.garth_warning.lines.some(l => l.includes('The Hollow Woods')),
  'garth_warning loại bỏ hoàn toàn cụm tiếng Anh "The Hollow Woods"'
);
assert(
  !dialoguesData.garth_east_gate_open.lines.some(l => l.includes('The Crooked Path')),
  'garth_east_gate_open loại bỏ hoàn toàn cụm tiếng Anh "The Crooked Path"'
);

// Edda
assert(
  !dialoguesData.edda_intro.lines.some(l => l.includes('The Veil?')),
  'edda_intro loại bỏ hoàn toàn cụm tiếng Anh "The Veil?"'
);
assert(
  dialoguesData.edda_intro.lines.some(l => l.includes('Màn Sương Rừng Sâu')),
  'edda_intro sử dụng tiếng Việt mượt mà "Màn Sương Rừng Sâu"'
);

// Neris
assert(
  !dialoguesData.neris_intro.lines.some(l => l.includes('The Hollow Woods')),
  'neris_intro loại bỏ hoàn toàn cụm tiếng Anh "The Hollow Woods"'
);
assert(
  dialoguesData.neris_intro.lines.some(l => l.includes('Khu rừng Hollow Woods')),
  'neris_intro chuyển sang "Khu rừng Hollow Woods"'
);

// Wayfarer
assert(
  dialoguesData.clapper_found.speaker === 'Lữ Khách Rêu Phong',
  'clapper_found chuyển tên người nói thành "Lữ Khách Rêu Phong"'
);

console.log('\n================================================================');
console.log('>>> TẤT CẢ 12 HẠNG MỤC KIỂM TRA C4-13-14 ĐỀU ĐẠT CHUẨN 100%! <<<');
console.log('================================================================');
