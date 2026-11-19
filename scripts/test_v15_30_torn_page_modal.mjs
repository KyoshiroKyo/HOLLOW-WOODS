/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ TỰ ĐỘNG BƯỚC V15-30
 * Xác minh Giao diện Trang Giấy Cổ Tương Tác (Torn Page Modal) & Đổi Trạng Thái Mẩu Nhật Ký Thế Giới
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== BẮT ĐẦU KIỂM THỬ BƯỚC V15-30: TORN PAGE MODAL & DỮ LIỆU NHẬT KÝ THẾ GIỚI ===\n');

// 1. Kiểm tra file dữ liệu src/data/tornPagesData.ts
console.log('1. Kiểm thử Registry Dữ Liệu Nhật Ký (tornPagesData.ts):');
const tornPagesDataPath = path.resolve('src/data/tornPagesData.ts');
assert(fs.existsSync(tornPagesDataPath), 'File src/data/tornPagesData.ts tồn tại');

const tornPagesContent = fs.readFileSync(tornPagesDataPath, 'utf-8');
assert(tornPagesContent.includes('export interface TornPageEntry'), 'Khai báo interface TornPageEntry');
assert(tornPagesContent.includes('export const TORN_PAGES_REGISTRY'), 'Khai báo hằng TORN_PAGES_REGISTRY');

const expectedKeys = [
  'inspect_fog_journal_1',
  'inspect_bellmaker_dew_journal',
  'inspect_elian_unsent_letter',
  'read_blacksmith_journal',
  'inspect_knights_memorial_stele',
  'read_black_knight_stele',
  'inspect_root_cellar_alchemy',
  'read_bellhollow_notice_board',
  'inspect_shrine_parchment_map',
  'read_rune_clue_stele',
  'read_shrine_stele',
  'read_fog_origin_mural'
];

for (const key of expectedKeys) {
  assert(tornPagesContent.includes(`${key}: {`), `Registry chứa mục "${key}"`);
}

// 2. Kiểm tra Modal Giao Diện src/ui/TornPageModal.ts
console.log('\n2. Kiểm thử Modal Giao Diện (TornPageModal.ts):');
const tornPageModalPath = path.resolve('src/ui/TornPageModal.ts');
assert(fs.existsSync(tornPageModalPath), 'File src/ui/TornPageModal.ts tồn tại');

const tornPageModalContent = fs.readFileSync(tornPageModalPath, 'utf-8');
assert(tornPageModalContent.includes('export class TornPageModal'), 'Khai báo class TornPageModal');
assert(tornPageModalContent.includes('renderAgedParchmentGraphics'), 'Hàm vẽ giấy da dê cổ rách viền renderAgedParchmentGraphics()');
assert(tornPageModalContent.includes('drawStowButton'), 'Hàm vẽ nút cất vào sổ tay drawStowButton()');
assert(tornPageModalContent.includes('nextPage'), 'Hàm chuyển trang nextPage()');
assert(tornPageModalContent.includes('prevPage'), 'Hàm chuyển trang prevPage()');
assert(tornPageModalContent.includes('stowAndClose'), 'Hàm cất vào sổ tay stowAndClose()');
assert(tornPageModalContent.includes('setupKeyboardListeners'), 'Đăng ký phím tắt điều khiển setupKeyboardListeners()');
assert(tornPageModalContent.includes('unlockLore'), 'Tự động mở khóa lore trong PlayerState');
assert(tornPageModalContent.includes('collected_note_'), 'Ghi nhận cờ collected_note_<id>');
assert(tornPageModalContent.includes('setMemoryAwakeningStage'), 'Cập nhật tiến trình Thức Tỉnh Ký Ức nếu có');

// 3. Kiểm tra Tích hợp UIScene.ts
console.log('\n3. Kiểm thử Tích hợp UIScene (UIScene.ts):');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf-8');
assert(uiSceneContent.includes("import { TornPageModal } from '../ui/TornPageModal';"), 'UIScene import TornPageModal');
assert(uiSceneContent.includes('public tornPageModal!: TornPageModal;'), 'UIScene khai báo biến tornPageModal');
assert(uiSceneContent.includes('this.getTornPageModal();'), 'UIScene khởi tạo getTornPageModal() trong create()');
assert(uiSceneContent.includes('this.tornPageModal.isOpen'), 'isAnyModalOpen kiểm tra trạng thái tornPageModal.isOpen');
assert(uiSceneContent.includes('getTornPageModal(): TornPageModal'), 'Phương thức getter getTornPageModal()');
assert(uiSceneContent.includes('openTornPage(entry: TornPageEntry'), 'Phương thức openTornPage()');
assert(uiSceneContent.includes('this.tornPageModal.destroy()'), 'Dọn dẹp tornPageModal trong shutdown');

// 4. Kiểm tra Tích hợp GameScene.ts
console.log('\n4. Kiểm thử Tích hợp GameScene (GameScene.ts):');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf-8');
assert(gameSceneContent.includes("import { TORN_PAGES_REGISTRY } from '../data/tornPagesData';"), 'GameScene import TORN_PAGES_REGISTRY');
assert(gameSceneContent.includes('if (TORN_PAGES_REGISTRY[actionId])'), 'executeMapInteraction kiểm tra và mở TornPageModal');
assert(gameSceneContent.includes('openTornPage(tornEntry'), 'executeMapInteraction gọi uiScene.openTornPage');
assert(gameSceneContent.includes('collected_note_'), 'handleInteractions kiểm tra cờ collected_note_');
assert(gameSceneContent.includes('Đã thu thập (Có thể nhấn [E] để xem lại)'), 'Đổi prompt sang "Đã thu thập (Có thể nhấn [E] để xem lại)"');
assert(gameSceneContent.includes('this.listenerMonster.body') &&
       gameSceneContent.includes('setVelocity(0, 0)'),
       'Tạm dừng chuyển động của Listener khi UI mở');

console.log('\n======================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
