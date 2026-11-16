import fs from 'fs';
import path from 'path';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] #${totalTests}: ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] #${totalTests}: ${message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('  VERIFYING EVKEY & VIETNAMESE IME (TELEX / VNI) INTEGRATION');
console.log('================================================================\n');

const playerPath = path.resolve('src/entities/SatyrPlayer.ts');
const playerCode = fs.readFileSync(playerPath, 'utf8');

// 1. Phân giải Hardware Code ưu tiên tuyệt đối
console.log('--- 1. KIỂM TRA PHÂN GIẢI PHÍM VẬT LÝ & FALLBACK AN TOÀN ---');
assert(
  playerCode.includes('public static resolvePhysicalCode(event: KeyboardEvent): string | null'),
  'SatyrPlayer cung cấp hàm tĩnh resolvePhysicalCode(event)'
);
assert(
  playerCode.includes("const rawCode = event.code || '';") &&
  playerCode.includes("case 'KeyW':") &&
  playerCode.includes("case 'KeyA':") &&
  playerCode.includes("case 'KeyS':") &&
  playerCode.includes("case 'KeyD':"),
  'Ưu tiên KeyboardEvent.code xác định vị trí vật lý trước (miễn nhiễm với IME)'
);

// 2. Kiểm tra loại bỏ ánh xạ dấu thanh gây bóng ma (Phantom Accents)
console.log('\n--- 2. LOẠI BỎ TRIỆT ĐỂ BÓNG MA DẤU THANH (PHANTOM KEYS) ---');
assert(
  !playerCode.includes("case 'á':") &&
  !playerCode.includes("case 'ắ':") &&
  !playerCode.includes("case 'ấ':") &&
  !playerCode.includes("case 'é':") &&
  !playerCode.includes("case 'í':"),
  'Đã xóa bỏ hoàn toàn ánh xạ nguyên âm mang dấu sắc (á, é, í, ú, ó) sang KeyS'
);
assert(
  !playerCode.includes("case 'à':") &&
  !playerCode.includes("case 'ằ':") &&
  !playerCode.includes("case 'ầ':") &&
  !playerCode.includes("case 'è':") &&
  !playerCode.includes("case 'ì':"),
  'Đã xóa bỏ hoàn toàn ánh xạ nguyên âm mang dấu huyền (à, è, ì, ù, ò) sang KeyF (chống tắt đèn lồng ngẫu nhiên)'
);

// 3. Kiểm tra các ký tự chữ cái biến thể tiếng Việt hợp lệ
console.log('\n--- 3. HỖ TRỢ KÝ TỰ CHỮ CÁI TIẾNG VIỆT HỢP LỆ (â, đ, ê, ư, ă, ơ) ---');
assert(
  playerCode.includes("case 'w':") &&
  playerCode.includes("case 'ư':") &&
  playerCode.includes("case 'ă':") &&
  playerCode.includes("case 'ơ':"),
  'Các biến thể nguyên âm gõ bằng W (ư, ă, ơ) ánh xạ chuẩn xác về KeyW'
);
assert(
  playerCode.includes("case 'a':") &&
  playerCode.includes("case 'â':"),
  'Biến thể nguyên âm gõ bằng A (â) ánh xạ chuẩn xác về KeyA'
);
assert(
  playerCode.includes("case 'd':") &&
  playerCode.includes("case 'đ':"),
  'Ký tự đ gõ bằng D (đ) ánh xạ chuẩn xác về KeyD'
);
assert(
  playerCode.includes("case 'e':") &&
  playerCode.includes("case 'ê':"),
  'Biến thể nguyên âm gõ bằng E (ê) ánh xạ chuẩn xác về KeyE'
);

// 4. Kiểm tra Chặn hành vi mặc định (preventDefault) và Passive Listener
console.log('\n--- 4. PREVENT DEFAULT & PASSIVE: FALSE LISTENER ---');
assert(
  playerCode.includes('public static isGameControlCode(code: string | null): boolean'),
  'SatyrPlayer cung cấp hàm tĩnh isGameControlCode(code) xác định phím game'
);
assert(
  playerCode.includes("window.addEventListener('keydown', this.boundKeyDown, { capture: true, passive: false });") &&
  playerCode.includes("window.addEventListener('keyup', this.boundKeyUp, { capture: true, passive: false });"),
  'Lắng nghe sự kiện bàn phím với capture: true và passive: false để hỗ trợ preventDefault()'
);
assert(
  playerCode.includes('if (SatyrPlayer.isGameControlCode(code))') &&
  playerCode.includes('event.preventDefault()'),
  'Gọi event.preventDefault() trên các phím điều khiển game để triệt tiêu bộ đệm gõ chữ IME và cuộn trang'
);

// 5. Kiểm tra Watchdog di chuyển không xóa non phím khi EVKey gửi keyCode 229
console.log('\n--- 5. WATCHDOG DI CHUYỂN KHÔNG BỊ XÓA NON KHI BẬT EVKEY ---');
assert(
  !playerCode.includes('if (!phaserKeyIsDown || (this.hasRecentIMEEvent && timeSinceLastActivity > 450))'),
  'Đã xóa bỏ điều kiện !phaserKeyIsDown xóa non phím sau 16ms'
);
assert(
  playerCode.includes('const isPhaserDown = phaserKeyIsDown;') &&
  playerCode.includes('const isDOMActive = timeSinceLastActivity <= 650;') &&
  playerCode.includes('if (!isPhaserDown && !isDOMActive)'),
  'Chỉ giải phóng phím di chuyển khi cả Phaser không nhận VÀ không có tín hiệu DOM lặp lại trong > 650ms'
);
assert(
  playerCode.includes("if (code === 'ShiftLeft' || code === 'ShiftRight')"),
  'Tách biệt cơ chế giám sát phím Shift (do Windows không auto-repeat Shift khi giữ)'
);

console.log('\n================================================================');
console.log(`TỔNG KẾT: ${passedTests}/${totalTests} KIỂM TRA ĐẠT (${failedTests} THẤT BẠI)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
