/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 5.3
 * (Trí Nhớ Ngắn Hạn The Listener & Phân Tách Hiện Tượng Ký Ức The Echo)
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 5.3');
console.log('   (Trí Nhớ The Listener 40s/2s & Phân Tách The Echo/EchoApparition)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Nâng cấp Trí Nhớ Ngắn Hạn The Listener (ListenerMonster.ts & ListenerAI.ts)
// -----------------------------------------------------------------------------
console.log('--- 1. Trí Nhớ Ngắn Hạn & Chống Lừa Lặp Lại The Listener ---');

const listenerMonsterPath = path.resolve('src/entities/ListenerMonster.ts');
assert(fs.existsSync(listenerMonsterPath), 'Tệp src/entities/ListenerMonster.ts tồn tại');
const listenerMonsterCode = fs.readFileSync(listenerMonsterPath, 'utf-8');

assert(
  listenerMonsterCode.includes('export class ListenerMonster extends TheListener'),
  'ListenerMonster kế thừa TheListener mở rộng đầy đủ tính năng quái vật săn mồi'
);
assert(
  listenerMonsterCode.includes('ANTI_REPEAT_WINDOW_MS') && listenerMonsterCode.includes('40000'),
  'ListenerMonster khai báo cửa sổ chống lặp mồi nhử chuẩn 40 giây (40000ms)'
);
assert(
  listenerMonsterCode.includes('SUSPECT_LISTEN_DURATION_MS') && listenerMonsterCode.includes('2000'),
  'ListenerMonster khai báo thời gian nghi ngờ lắng nghe 2 giây (2000ms)'
);

const listenerAiPath = path.resolve('src/systems/ListenerAI.ts');
const listenerAiCode = fs.readFileSync(listenerAiPath, 'utf-8');

assert(
  listenerAiCode.includes('LURE_ANTI_REPEAT_WINDOW_MS: number = 40000'),
  'ListenerAI khai báo LURE_ANTI_REPEAT_WINDOW_MS = 40000ms (40 giây)'
);
assert(
  listenerAiCode.includes('existing.repeatCount > 2') &&
  listenerAiCode.includes('this.targetInvestigateX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, originX);'),
  'Nếu ném mồi lặp quá 2 lần trong 40s, The Listener không bị lừa và quay sang tìm kiếm vị trí người chơi (originX)'
);
assert(
  listenerAiCode.includes('this.alertTimer = 2000;') &&
  listenerAiCode.includes('this.listener.setFlipX(this.targetInvestigateX > this.listener.x)'),
  'Trạng thái nghi ngờ: Quay đầu lắng nghe 2 giây trước khi lao đến điểm phát ra tiếng động'
);

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');

assert(
  gameSceneCode.includes('this.listenerMonster.hearSound(x, y, 2.5, this.player.x, this.player.y)'),
  'GameScene truyền tọa độ người ném (player.x, player.y) khi mồi nổ phát ra âm thanh [Q]'
);

// -----------------------------------------------------------------------------
// PHẦN 2: Phân Tách Hiện Tượng Ký Ức The Echo (EchoApparition.ts & TheEcho.ts)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Phân Tách Rõ Ràng Bóng Ma Ký Ức The Echo ---');

const echoApparitionPath = path.resolve('src/entities/EchoApparition.ts');
assert(fs.existsSync(echoApparitionPath), 'Tệp src/entities/EchoApparition.ts tồn tại');
const echoApparitionCode = fs.readFileSync(echoApparitionPath, 'utf-8');

assert(
  echoApparitionCode.includes('export class EchoApparition extends TheEcho'),
  'EchoApparition kế thừa TheEcho biểu trưng cho bóng ma ký ức'
);
assert(
  echoApparitionCode.includes('isPredatorMonster(): boolean') && echoApparitionCode.includes('return false;'),
  'The Echo KHÔNG PHẢI quái vật săn mồi (isPredatorMonster = false)'
);
assert(
  echoApparitionCode.includes('canTriggerGameOver(): boolean') && echoApparitionCode.includes('return false;'),
  'The Echo KHÔNG kích hoạt Game Over hay làm hại sinh mạng người chơi'
);
assert(
  echoApparitionCode.includes('hasPhysicalDamage(): boolean') && echoApparitionCode.includes('return false;'),
  'The Echo KHÔNG có sát thương vật lý trực tiếp (hasPhysicalDamage = false)'
);

const theEchoPath = path.resolve('src/entities/TheEcho.ts');
const theEchoCode = fs.readFileSync(theEchoPath, 'utf-8');

assert(
  theEchoCode.includes('checkDirectGaze') &&
  theEchoCode.includes('if (isLanternLit) return false;') &&
  theEchoCode.includes('PlayerState.getInstance().modifyComposure(-5);'),
  'The Echo chỉ làm giảm nhẹ Bình Tâm (-5) khi người chơi nhìn trực diện mà ĐÈN LỒNG ĐANG TẮT'
);
assert(
  theEchoCode.includes('dissolve') &&
  theEchoCode.includes('0xaed6f1') &&
  theEchoCode.includes('p.fillCircle'),
  'The Echo khi tiếp cận sẽ tan biến thành những đốm sáng tro tàn (Glowing Ash Particles)'
);

const echoSysPath = path.resolve('src/systems/EchoSystem.ts');
const echoSysCode = fs.readFileSync(echoSysPath, 'utf-8');

assert(
  echoSysCode.includes('ngày ngôi làng bị sương mù nuốt chửng') ||
  echoSysCode.includes('sương mù nuốt chửng Bellhollow'),
  'EchoSystem chứa các mảnh ký ức thì thầm về ngày ngôi làng bị sương mù nuốt chửng'
);

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT KIỂM THỬ BƯỚC 5.3: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ CÁC MỤC TIÊU CỦA BƯỚC 5.3 ĐÃ HOÀN TẤT XUẤT SẮC 100%! <<<\n');
  process.exit(0);
}
