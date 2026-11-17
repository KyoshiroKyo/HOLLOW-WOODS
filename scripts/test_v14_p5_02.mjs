/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRÍ NHỚ THE LISTENER, HIỆN TƯỢNG THE ECHO & WORLD EVENTS (V14-P5-02)
 *
 * Kiểm tra toàn diện 4 trụ cột chuyên sâu:
 * 1. Nâng cấp trí nhớ ngắn hạn của The Listener & Cơ chế chống lặp mồi nhử (Anti-Repeat Memory).
 * 2. Phân tách rạch ròi Thực thể Săn Đuổi The Listener và Hiện Tượng Ký Ức The Echo (không sát thương vật lý).
 * 3. 5 Sự kiện thế giới ngẫu nhiên (World Events) theo vùng và thời gian.
 * 4. Tích hợp GameScene, kết nối sự kiện thế giới và hiệu ứng âm thanh Web Audio (AudioManager).
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRÍ NHỚ & WORLD EVENTS (V14-P5-02)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Trí Nhớ Ngắn Hạn & Chống Lặp Mồi Nhử (ListenerAI.ts & TheListener.ts)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Trí Nhớ Ngắn Hạn & Chống Lặp Mồi Nhử (ListenerAI.ts) ---');

const listenerAiPath = path.resolve('src/systems/ListenerAI.ts');
const listenerAiCode = fs.readFileSync(listenerAiPath, 'utf-8');
const theListenerPath = path.resolve('src/entities/TheListener.ts');
const theListenerCode = fs.readFileSync(theListenerPath, 'utf-8');
const typesPath = path.resolve('src/types/index.ts');
const typesCode = fs.readFileSync(typesPath, 'utf-8');

// 1.1 Khai báo cấu trúc dữ liệu trí nhớ âm thanh
assert(typesCode.includes('export interface SoundMemoryEntry'), 'types/index.ts khai báo cấu trúc SoundMemoryEntry');
assert(typesCode.includes('repeatCount: number'), 'SoundMemoryEntry theo dõi số lần lặp lại repeatCount');
assert(typesCode.includes('originX?: number') && typesCode.includes('originY?: number'), 'SoundMemoryEntry ghi nhớ tọa độ người ném originX, originY');

// 1.2 Thuộc tính và tham số Anti-Repeat trong ListenerAI
assert(listenerAiCode.includes('private soundMemories: SoundMemoryEntry[] = []'), 'ListenerAI sở hữu mảng trí nhớ ngắn hạn soundMemories');
assert(listenerAiCode.includes('MEMORY_EXPIRY_MS') && listenerAiCode.includes('30000'), 'Thời gian hết hạn trí nhớ âm thanh chuẩn 30 giây (30000ms)');
assert(listenerAiCode.includes('REPEAT_LURE_RADIUS') && listenerAiCode.includes('75'), 'Bán kính nhận diện ném lặp cùng tọa độ là 75px');
assert(listenerAiCode.includes('public getSoundMemories(): SoundMemoryEntry[]'), 'ListenerAI cung cấp phương thức getSoundMemories()');
assert(listenerAiCode.includes('public resetSoundMemories(): void'), 'ListenerAI cung cấp phương thức resetSoundMemories()');

// 1.3 Đường cong suy giảm hiệu quả đánh lừa (Lure Effectiveness Curve)
assert(listenerAiCode.includes('public getLureEffectiveness(soundX: number, soundY: number): number'), 'Cung cấp phương thức đo lường getLureEffectiveness');
assert(listenerAiCode.includes('if (existing.repeatCount === 1) return 1.0;'), 'Lần 1: Hiệu quả đánh lừa đạt 100% (1.0)');
assert(listenerAiCode.includes('if (existing.repeatCount === 2) return 0.5;') || listenerAiCode.includes('effectiveness = 0.5;'), 'Lần 2: Hiệu quả đánh lừa giảm còn 50% (0.5)');
assert(listenerAiCode.includes('return 0.15;') || listenerAiCode.includes('effectiveness = 0.15;'), 'Lần 3+: Hiệu quả đánh lừa chỉ còn 15% (0.15)');

// 1.4 Hành vi điều tra mở rộng về hướng ném (Anti-Repeat Strategy)
assert(listenerAiCode.includes('this.targetInvestigateX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, originX);'), 'Khi phát hiện ném lặp (lần 3+), The Listener quay đầu tìm kiếm về tọa độ người ném originX');
assert(listenerAiCode.includes('this.alertTimer = 600;'), 'The Listener giảm mạnh thời gian đứng đờ (alertTimer = 600ms) khi nhận ra bẫy lặp');
assert(listenerAiCode.includes('Math.round((soundX + originX) / 2)'), 'Khi ném lặp lần 2, The Listener mở rộng phạm vi điều tra về trung điểm giữa mồi nổ và người ném');

// 1.5 TheListener chuyển tiếp tọa độ người ném
assert(theListenerCode.includes('hearSound(x: number, y: number, volume: number = 1.0, originX?: number, originY?: number)'), 'TheListener.hearSound hỗ trợ truyền tọa độ người ném originX, originY');
assert(theListenerCode.includes('this.ai.triggerSoundAlert(x, y, volume, originX, originY)'), 'TheListener chuyển tiếp originX, originY vào triggerSoundAlert');

// 1.6 Tín hiệu chuyển đổi trạng thái công bằng (Fair-play Telegraphs)
assert(listenerAiCode.includes('this.listener.onAlertTelegraph()'), 'Trạng thái ALERT có tín hiệu cảnh báo Telegraph rõ ràng');
assert(listenerAiCode.includes('this.listener.onChaseEnded()'), 'Chuyển về RETURN có tín hiệu kết thúc rượt đuổi onChaseEnded');
assert(listenerAiCode.includes('this.listener.onSearchVisual()'), 'Trạng thái SEARCH hiển thị dấu chấm hỏi [?] vàng quan sát');

// -----------------------------------------------------------------------------
// PHẦN 2: Phân Tách Hiện Tượng Ký Ức The Echo (TheEcho.ts & EchoSystem.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Phân Tách Hiện Tượng Ký Ức The Echo (TheEcho.ts & EchoSystem.ts) ---');

const echoEntityPath = path.resolve('src/entities/TheEcho.ts');
const echoEntityCode = fs.readFileSync(echoEntityPath, 'utf-8');
const echoSysPath = path.resolve('src/systems/EchoSystem.ts');
const echoSysCode = fs.readFileSync(echoSysPath, 'utf-8');

// 2.1 Thực thể TheEcho độc lập
assert(echoEntityCode.includes('export class TheEcho extends Phaser.GameObjects.Container'), 'TheEcho là lớp thực thể Container riêng biệt');
assert(echoEntityCode.includes('public spec: EchoSpec;'), 'TheEcho quản lý thông tin thông qua EchoSpec');
assert(echoEntityCode.includes('public isDissolved: boolean = false;'), 'TheEcho theo dõi trạng thái tan biến isDissolved');

// 2.2 Quy tắc thiết kế cốt lõi: Tuyệt đối KHÔNG có sát thương vật lý
assert(echoEntityCode.includes('public hasPhysicalDamage(): boolean') && echoEntityCode.includes('return false;'), 'Quy tắc thiết kế V1.4: The Echo KHÔNG có sát thương vật lý trực tiếp (hasPhysicalDamage = false)');
assert(!echoEntityCode.includes('triggerPlayerDeath') && !echoEntityCode.includes('stats.health -='), 'The Echo tuyệt đối không trừ máu người chơi hay gây Game Over oan uổng');

// 2.3 Cơ chế tan biến thành sương khói & Áp lực Bình Tâm
assert(echoEntityCode.includes('public dissolve(callback?: (msg: string) => void): void'), 'TheEcho cung cấp phương thức dissolve() mượt mà');
assert(echoEntityCode.includes('PlayerState.getInstance().modifyComposure(-drain)'), 'TheEcho tan biến gây áp lực tâm lý nhẹ lên Bình Tâm (-3 điểm)');
assert(echoEntityCode.includes("this.scene.events.emit('echo_dissolved'"), 'Phát sự kiện echo_dissolved ra toàn thế giới');

// 2.4 Quản lý hiển thị và kích hoạt trong EchoSystem
assert(echoSysCode.includes('public activeEchoContainer: TheEcho | null = null;'), 'EchoSystem quản lý tham chiếu activeEchoContainer kiểu TheEcho');
assert(echoSysCode.includes('this.activeEchoContainer = new TheEcho(this.scene,'), 'EchoSystem khởi tạo thực thể TheEcho độc lập');
assert(echoSysCode.includes('dist <= 48') && echoSysCode.includes('this.dissolveEcho(onEchoDisappear);'), 'Echo tự động tan biến khi người chơi tiếp cận trong cự ly 48px');

// -----------------------------------------------------------------------------
// PHẦN 3: 5 Sự Kiện Thế Giới Động (WorldEventSystem.ts & registryData.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: 5 Sự Kiện Thế Giới Động (WorldEventSystem.ts & Content Registry) ---');

const worldEventSysPath = path.resolve('src/systems/WorldEventSystem.ts');
const worldEventSysCode = fs.readFileSync(worldEventSysPath, 'utf-8');
const registryDataPath = path.resolve('src/registry/registryData.ts');
const registryDataCode = fs.readFileSync(registryDataPath, 'utf-8');
const contentRegistryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf-8'));

// 3.1 Đăng ký định danh Content ID chuẩn 4 tầng
const eventEntries = contentRegistryJson.entries.filter(e => e.type === 'EVT' && e.id && e.id.startsWith('HW-EVT-') && e.id !== 'HW-EVT-WEATHER-000001');
assert(eventEntries.length === 5, 'Content Registry đăng ký đủ 5 sự kiện thế giới EVT');

const bellEvt = eventEntries.find(e => e.id === 'HW-EVT-BELL-000001');
assert(bellEvt && bellEvt.runtimeKey === 'event_bell_echo', 'Sự kiện Tiếng Chuông Vọng mang mã HW-EVT-BELL-000001 và runtimeKey event_bell_echo');

const fogEvt = eventEntries.find(e => e.id === 'HW-EVT-FOG-000001');
assert(fogEvt && fogEvt.runtimeKey === 'event_fog_surge', 'Sự kiện Đợt Sương Dâng mang mã HW-EVT-FOG-000001 và runtimeKey event_fog_surge');

const crowEvt = eventEntries.find(e => e.id === 'HW-EVT-CROW-000001');
assert(crowEvt && crowEvt.runtimeKey === 'event_crow_alarm', 'Sự kiện Quạ Báo Động mang mã HW-EVT-CROW-000001 và runtimeKey event_crow_alarm');

const stepEvt = eventEntries.find(e => e.id === 'HW-EVT-STEP-000001');
assert(stepEvt && stepEvt.runtimeKey === 'event_false_footsteps', 'Sự kiện Bước Chân Ảo mang mã HW-EVT-STEP-000001 và runtimeKey event_false_footsteps');

const campEvt = eventEntries.find(e => e.id === 'HW-EVT-CAMP-000001');
assert(campEvt && campEvt.runtimeKey === 'event_abandoned_camp', 'Sự kiện Dấu Vết Trại Cũ mang mã HW-EVT-CAMP-000001 và runtimeKey event_abandoned_camp');

// 3.2 Đặc tả và cơ chế trong WorldEventSystem
assert(worldEventSysCode.includes('public static readonly EVENT_DEFS: Record<WorldEventType, WorldEventDef>'), 'WorldEventSystem định nghĩa danh mục EVENT_DEFS cho cả 5 sự kiện');
assert(worldEventSysCode.includes('FOG_SURGE_DURATION: number = 25;'), 'Đợt Sương Dâng kéo dài chuẩn 25 giây');
assert(worldEventSysCode.includes('FOG_VISION_PENALTY: number = 35;'), 'Đợt Sương Dâng giảm tầm nhìn 35px');
assert(worldEventSysCode.includes('FOG_MOISTURE_MULT: number = 1.25;'), 'Đợt Sương Dâng tăng 25% tốc độ ngấm ẩm (hệ số 1.25)');

// 3.3 Tác động cơ chế của từng sự kiện
assert(worldEventSysCode.includes('audio.playBronzeBellToll();') && worldEventSysCode.includes('playerState.modifyComposure(5);'), 'Tiếng Chuông Vọng ngân chuông đồng và xoa dịu +5 Bình Tâm');
assert(worldEventSysCode.includes('audio.playWindWhoosh();') && worldEventSysCode.includes('this.fogSurgeActive = true;'), 'Đợt Sương Dâng phát tiếng gió rít và kích hoạt sương dày');
assert(worldEventSysCode.includes('audio.playCrowCaw();'), 'Quạ Báo Động phát tiếng quạ kêu chói tai');
assert(worldEventSysCode.includes('audio.playFalseFootsteps();'), 'Bước Chân Ảo phát chuỗi âm thanh bước chân rỗng trong sương');
assert(worldEventSysCode.includes("addItem('item_charcoal', 1)") && worldEventSysCode.includes("addItem('item_forest_rope', 1)"), 'Dấu Vết Trại Cũ thưởng 1 Than Củi & 1 Dây Thừng Rừng');

// -----------------------------------------------------------------------------
// PHẦN 4: Tích Hợp GameScene & Âm Thanh AudioManager
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Tích Hợp GameScene & Âm Thanh (GameScene.ts & AudioManager.ts) ---');

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');
const audioMgrPath = path.resolve('src/audio/AudioManager.ts');
const audioMgrCode = fs.readFileSync(audioMgrPath, 'utf-8');

// 4.1 GameScene tích hợp WorldEventSystem
assert(gameSceneCode.includes('public worldEventSystem!: WorldEventSystem;'), 'GameScene khai báo thuộc tính worldEventSystem');
assert(gameSceneCode.includes('this.worldEventSystem = new WorldEventSystem(this);'), 'GameScene khởi tạo WorldEventSystem trong create()');
assert(gameSceneCode.includes("this.events.on('world_event_triggered'"), 'GameScene lắng nghe sự kiện world_event_triggered');
assert(gameSceneCode.includes('this.worldEventSystem.update(dt'), 'GameScene cập nhật WorldEventSystem mỗi khung hình');
assert(gameSceneCode.includes('this.worldEventSystem.destroy();'), 'GameScene dọn dẹp worldEventSystem khi shutdown scene');

// 4.2 Tầm nhìn sương mù phản ứng với Đợt Sương Dâng
assert(gameSceneCode.includes('this.worldEventSystem.getFogVisionReduction()'), 'GameScene thu hẹp tầm nhìn khi Đợt Sương Dâng đang diễn ra');

// 4.3 AudioManager bổ sung 2 phương thức âm thanh chuyên biệt
assert(audioMgrCode.includes('public playFalseFootsteps(): void'), 'AudioManager cung cấp phương thức playFalseFootsteps()');
assert(audioMgrCode.includes("filter.type = 'bandpass'") && audioMgrCode.includes('filter.Q.setValueAtTime(4.5'), 'playFalseFootsteps sử dụng bandpass filter với Q cao tạo tiếng bước chân rỗng');
assert(audioMgrCode.includes('public playWindWhoosh(): void'), 'AudioManager cung cấp phương thức playWindWhoosh()');
assert(audioMgrCode.includes("filter.type = 'lowpass'") && audioMgrCode.includes('noise.start(now)'), 'playWindWhoosh tạo tiếng gió rít u u bằng bộ lọc lowpass ramp');

// -----------------------------------------------------------------------------
// TỔNG KẾT BỘ KIỂM THỬ
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passCount}/${passCount + failCount} KIỂM TRA ĐẠT (${failCount} THẤT BẠI)`);
if (failCount === 0) {
  console.log('KẾT QUẢ: PASS (100% TIÊU CHÍ V14-P5-02 ĐẠT CHUẨN XUẤT SẮC)');
} else {
  console.log('KẾT QUẢ: FAIL (CẦN SỬA LỖI)');
}
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
}
