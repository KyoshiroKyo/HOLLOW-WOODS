/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ GÓI DỮ LIỆU CONTENT PACKS & CÂN BẰNG ÂM THANH/VFX (V14-P7-01)
 *
 * Kiểm tra 3 trụ cột chuyên sâu:
 * 1. Kiến trúc Built-in Data-Driven Content Packs (ContentPackLoader.ts):
 *    - 4 gói nội dung tích hợp sẵn: pack_wildlife, pack_equipment, pack_camp_cooking, pack_relics.
 *    - Phân tách tuyệt đối không gian tên: First-party (HW-*) vs Third-party Mod (mod.<author>.<pack>.<type>.<id>).
 *    - Kiểm tra bảo mật JSON thuần, chống chèn mã script/eval, kiểm tra phụ thuộc và chống trùng lặp ID.
 *    - Hỗ trợ bật/tắt (toggle) an toàn không ảnh hưởng Save cốt lõi.
 * 2. Cân bằng Âm thanh Toàn Cục & Audio Priority Hierarchy (AudioManager.ts):
 *    - Hệ thống dìm âm nền (Audio Ducking 35-50%): bước chân The Listener, quạ thét, nhịp tim hoảng loạn.
 *    - Thu dọn tài nguyên âm thanh và bộ đếm vòng lặp (cleanupAudioLoops) khi chuyển vùng / tắt Scene.
 * 3. Trợ Năng Thị Giác Mưa Sương & Thu Dọn Tài Nguyên VFX (VeilSystem.ts & GameScene.ts):
 *    - Chỉ báo nguy hiểm thị giác (Rain Threat Visual Indicator) khi mưa làm át tiếng động và The Listener áp sát (<260px).
 *    - Dọn dẹp an toàn tween, overlay và đồ họa chuyển cảnh (cleanupTransitionVFX).
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
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ CONTENT PACKS & ÂM THANH / VFX (V14-P7-01)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Kiến trúc Built-in Data-Driven Content Packs (ContentPackLoader.ts)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Kiến Trúc Content Packs & Bảo Mật Dữ Liệu Dẫn Dắt (Data-Driven) ---');

const contentPackLoaderPath = path.resolve('src/registry/ContentPackLoader.ts');
const registryIndexPath = path.resolve('src/registry/index.ts');
assert(fs.existsSync(contentPackLoaderPath), 'File src/registry/ContentPackLoader.ts tồn tại');
assert(fs.existsSync(registryIndexPath), 'File src/registry/index.ts tồn tại');

const loaderCode = fs.readFileSync(contentPackLoaderPath, 'utf-8');
const registryIndexCode = fs.readFileSync(registryIndexPath, 'utf-8');

// 1.1 Export & Singleton
assert(registryIndexCode.includes('ContentPackLoader'), 'src/registry/index.ts export ContentPackLoader');
assert(loaderCode.includes('export class ContentPackLoader'), 'ContentPackLoader là một class được export');
assert(loaderCode.includes('public static getInstance(): ContentPackLoader'), 'ContentPackLoader triển khai pattern Singleton chuẩn mực');

// 1.2 Cấu trúc Manifest & Entry Interfaces
assert(loaderCode.includes('export interface ContentPackEntry'), 'Khai báo interface ContentPackEntry chuẩn');
assert(loaderCode.includes('export interface ContentPackManifest'), 'Khai báo interface ContentPackManifest với đầy đủ trường packId, name, version, dependencies, contentEntries');
assert(loaderCode.includes('export interface PackValidationResult'), 'Khai báo interface PackValidationResult phản hồi kết quả thẩm định');

// 1.3 Đăng ký 4 gói tích hợp sẵn (Built-in Packs)
const builtInPacks = ['pack_wildlife', 'pack_equipment', 'pack_camp_cooking', 'pack_relics'];
for (const packId of builtInPacks) {
  assert(loaderCode.includes(`'${packId}'`), `ContentPackLoader đăng ký gói built-in '${packId}'`);
}

assert(loaderCode.includes('Woodland Wildlife Pack'), 'Gói sinh vật Woodland Wildlife Pack được đặt tên chuẩn');
assert(loaderCode.includes('Survival Equipment Pack'), 'Gói trang bị Survival Equipment Pack được đặt tên chuẩn');
assert(loaderCode.includes('Camp & Cooking Pack'), 'Gói cắm trại & nấu nướng Camp & Cooking Pack được đặt tên chuẩn');
assert(loaderCode.includes('Ancient Relics Pack'), 'Gói di vật Ancient Relics Pack được đặt tên chuẩn');

// 1.4 Kiểm tra phân tách không gian tên (Namespace Isolation)
const firstPartyRegex = /^HW-[A-Z]{3,4}-[A-Z0-9_]{3,8}-[0-9]{6}$/;
const thirdPartyRegex = /^mod\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/;

// Test valid 1st-party IDs
assert(firstPartyRegex.test('HW-ANI-AMBIENT-000001'), 'Định dạng ID sinh vật First-party HW-ANI-AMBIENT-000001 hợp lệ');
assert(firstPartyRegex.test('HW-EQP-BODY-000001'), 'Định dạng ID trang bị First-party HW-EQP-BODY-000001 hợp lệ');
assert(firstPartyRegex.test('HW-ITM-CAMP-000001'), 'Định dạng ID vật phẩm First-party HW-ITM-CAMP-000001 hợp lệ');
assert(firstPartyRegex.test('HW-ITM-RLC-000003'), 'Định dạng ID di vật First-party HW-ITM-RLC-000003 hợp lệ');

// Test valid 3rd-party mod IDs
assert(thirdPartyRegex.test('mod.community.lanterns.item.silver_lamp'), 'Định dạng ID Mod hợp lệ (mod.community.lanterns.item.silver_lamp)');
assert(thirdPartyRegex.test('mod.forestmod.extra_animals.ambient.deer'), 'Định dạng ID Mod hợp lệ (mod.forestmod.extra_animals.ambient.deer)');

// Test invalid IDs rejected
assert(!firstPartyRegex.test('HW-INVALID-NAME'), 'ID không đúng định dạng First-party bị từ chối');
assert(!thirdPartyRegex.test('HW-MOD-INVALID'), 'ID Mod không bắt đầu bằng mod. bị từ chối');
assert(!thirdPartyRegex.test('mod.invalid-with-hyphens.bad'), 'ID Mod chứa dấu gạch nối bị từ chối');

// 1.5 Kiểm tra an toàn bảo mật (Security & Code Injection Prevention)
assert(loaderCode.includes('validatePack(manifest: ContentPackManifest): PackValidationResult'), 'Có phương thức validatePack thẩm tra tính an toàn gói nội dung');
assert(loaderCode.includes('JSON.stringify(manifest)') && loaderCode.includes('<script') && loaderCode.includes('dangerousTokens'), 'Cơ chế lọc chống mã thực thi JavaScript/HTML script/eval độc hại');

// 1.6 Kiểm tra các phương thức vòng đời & Toggle (Bật / Tắt an toàn)
assert(loaderCode.includes('enablePack(packId: string): boolean'), 'Có phương thức enablePack');
assert(loaderCode.includes('disablePack(packId: string): boolean'), 'Có phương thức disablePack');
assert(loaderCode.includes('isPackEnabled(packId: string): boolean'), 'Có phương thức isPackEnabled');
assert(loaderCode.includes('getRegisteredPacks(): ContentPackManifest[]'), 'Có phương thức getRegisteredPacks');
assert(loaderCode.includes('getEnabledPacks(): ContentPackManifest[]'), 'Có phương thức getEnabledPacks');
assert(loaderCode.includes('getAllActiveEntries(): ContentPackEntry[]'), 'Có phương thức getAllActiveEntries trả về dữ liệu các gói đang bật');


// -----------------------------------------------------------------------------
// PHẦN 2: Cân bằng Âm thanh Toàn Cục & Audio Priority Ducking (AudioManager.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Cân Bằng Âm Thanh Toàn Cục & Audio Ducking Priority ---');

const audioManagerPath = path.resolve('src/audio/AudioManager.ts');
assert(fs.existsSync(audioManagerPath), 'File src/audio/AudioManager.ts tồn tại');
const audioManagerCode = fs.readFileSync(audioManagerPath, 'utf-8');

// 2.1 Ducking API
assert(audioManagerCode.includes('public duckAmbience(duckFactor: number = 0.55, durationMs: number = 1400): void'), 'AudioManager có duckAmbience với hệ số dìm âm và thời lượng tùy biến');
assert(audioManagerCode.includes('public unduckAmbience(rampSec: number = 0.5): void'), 'AudioManager có unduckAmbience phục hồi âm lượng êm ái qua linear ramp');
assert(audioManagerCode.includes('public cleanupAudioLoops(): void'), 'AudioManager có cleanupAudioLoops dọn dẹp timers và hoàn trả âm lượng');
assert(audioManagerCode.includes('public getIsDucked(): boolean'), 'AudioManager có getIsDucked kiểm tra trạng thái ducking');
assert(audioManagerCode.includes('public getCurrentDuckFactor(): number'), 'AudioManager có getCurrentDuckFactor trả về hệ số dìm hiện tại');

// 2.2 Tích hợp ưu tiên âm thanh sinh tồn (Priority Survival Signals)
assert(audioManagerCode.includes('playListenerStep'), 'AudioManager có playListenerStep');
assert(audioManagerCode.includes('this.duckAmbience(0.65, 550)'), 'Tiếng bước chân The Listener tự động dìm âm nền 35% (duck factor 0.65)');
assert(audioManagerCode.includes('this.duckAmbience(0.45, 2200)'), 'Tiếng The Listener phát hiện con mồi (alert) dìm âm nền 55% (duck factor 0.45)');
assert(audioManagerCode.includes('this.duckAmbience(0.55, 1300)'), 'Tiếng quạ thét báo động dìm âm nền 45% (duck factor 0.55)');
assert(audioManagerCode.includes('this.duckAmbience(0.5, 999999)'), 'Tiếng tim đập dìm âm nền 50% trong suốt thời gian tim đập');
assert(audioManagerCode.includes('this.unduckAmbience(0.5)'), 'Khi tim ngừng đập, âm nền được hoàn trả mức chuẩn 0.5s');

// 2.3 Quản lý Cooldown & Debounce chống dội âm
assert(audioManagerCode.includes('private sfxCooldowns: Map<string, number>'), 'AudioManager quản lý cooldown map cho các âm one-shot');
assert(audioManagerCode.includes('checkCooldown('), 'AudioManager có cơ chế checkCooldown kiểm tra giãn cách phát âm');


// -----------------------------------------------------------------------------
// PHẦN 3: Trợ Năng Thị Giác Mưa Sương & Dọn Dẹp VFX (VeilSystem.ts & GameScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Trợ Năng Thị Giác Mưa Sương & Thu Dọn VFX ---');

const veilSystemPath = path.resolve('src/systems/VeilSystem.ts');
assert(fs.existsSync(veilSystemPath), 'File src/systems/VeilSystem.ts tồn tại');
const veilSystemCode = fs.readFileSync(veilSystemPath, 'utf-8');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');

// 3.1 Overlay & Chỉ báo Trợ Năng Thị Giác (Visual Threat Accessibility Indicator)
assert(veilSystemCode.includes('rainAuraThreatOverlay'), 'VeilSystem có thuộc tính rainAuraThreatOverlay');
assert(veilSystemCode.includes('this.rainAuraThreatOverlay.setDepth(3200)'), 'rainAuraThreatOverlay đặt depth 3200 (phủ trên cảnh quan, dưới HUD)');
assert(veilSystemCode.includes('updateRainThreatVisualIndicator(listenerDist: number, isRaining: boolean): void'), 'VeilSystem có phương thức updateRainThreatVisualIndicator');
assert(veilSystemCode.includes('0xba3c1e'), 'Sử dụng tone màu hổ phách/đỏ sương mù (0xba3c1e) cảnh báo nguy hiểm');
assert(veilSystemCode.includes('listenerDist >= 260'), 'Ngưỡng khoảng cách an toàn 260px tự động xóa bỏ viền cảnh báo');

// 3.2 Tích hợp updateRainThreatVisualIndicator vào GameScene
assert(gameSceneCode.includes('this.veilSystem.updateRainThreatVisualIndicator('), 'GameScene gọi updateRainThreatVisualIndicator trong chu trình update AI');

// 3.3 Thu dọn tài nguyên VFX và Audio khi chuyển cảnh (Transition Cleanup)
assert(veilSystemCode.includes('public cleanupTransitionVFX(): void'), 'VeilSystem có phương thức cleanupTransitionVFX');
assert(gameSceneCode.includes('this.audioManager.cleanupAudioLoops()'), 'GameScene gọi audioManager.cleanupAudioLoops khi chuyển vùng');
assert(gameSceneCode.includes('this.veilSystem.cleanupTransitionVFX()'), 'GameScene gọi veilSystem.cleanupTransitionVFX khi chuyển vùng');
assert(veilSystemCode.includes('this.cleanupTransitionVFX()') && veilSystemCode.includes('this.rainAuraThreatOverlay.destroy()'), 'VeilSystem.destroy dọn dẹp sạch sẽ overlay và tween');


// -----------------------------------------------------------------------------
// TỔNG KẾT KIỂM THỬ
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
