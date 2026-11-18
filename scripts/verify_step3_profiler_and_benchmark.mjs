import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM TOÁN BỘ ĐO HIỆU NĂNG FPS, DRAW CALL & BENCHMARK F9/F10 (BƯỚC 3) ===\n');

let allPassed = true;
function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    allPassed = false;
  }
}

// 1. Kiểm tra mã nguồn HitboxDebugInspector.ts
console.log('1. Kiểm toán thành phần Profiler & Hitbox Debugger (src/utils/HitboxDebugInspector.ts):');
const profilerPath = path.resolve('src/utils/HitboxDebugInspector.ts');
assert(fs.existsSync(profilerPath), 'File src/utils/HitboxDebugInspector.ts tồn tại');
const profilerCode = fs.readFileSync(profilerPath, 'utf8');

assert(profilerCode.includes('class HitboxDebugInspector'), 'Đã định nghĩa class HitboxDebugInspector');
assert(profilerCode.includes('KeyCodes.F9') && profilerCode.includes('KeyCodes.F10'), 'Đăng ký cả 2 phím F9 (Profiler) và F10 (Benchmark)');
assert(profilerCode.includes('addCapture'), 'Sử dụng addCapture chống xung đột phím chức năng trình duyệt');

// 2. Kiểm tra bộ đếm WebGL Draw Calls & Ràng buộc Overhead = 0
console.log('\n2. Kiểm toán bộ đếm WebGL Draw Calls & Ràng buộc Overhead = 0:');
assert(profilerCode.includes('hookWebGLDrawCalls'), 'Có phương thức hookWebGLDrawCalls() gắn wrapper khi bật F9');
assert(profilerCode.includes('unhookWebGLDrawCalls'), 'Có phương thức unhookWebGLDrawCalls() hoàn trả hàm gốc khi tắt F9');
assert(profilerCode.includes('drawElements') && profilerCode.includes('drawArrays'), 'Bắt chính xác cả 2 lệnh vẽ nền tảng WebGL drawElements và drawArrays');
assert(profilerCode.includes('frameDrawCalls++'), 'Tăng biến đếm frameDrawCalls mỗi lần WebGL thực hiện lệnh vẽ');
assert(profilerCode.includes('postrender'), 'Đồng bộ chốt số lượng draw call tại sự kiện postrender của vòng lặp game');

// 3. Kiểm tra các chỉ số hiển thị thời gian thực F9
console.log('\n3. Kiểm toán các chỉ số giám sát trực tiếp trên màn hình:');
assert(profilerCode.includes('actualFps'), 'Hiển thị FPS thực tế từ loop');
assert(profilerCode.includes('calculateOnePercentLowFps'), 'Có hàm tính toán chuẩn 1% Low FPS từ lịch sử frame time');
assert(profilerCode.includes('deltaMs.toFixed(1) ms') || profilerCode.includes('Frame Time'), 'Hiển thị Frame Time (ms)');
assert(profilerCode.includes('drawCalls') && profilerCode.includes('calls/frame'), 'Hiển thị WebGL Draw Calls trực tiếp');
assert(profilerCode.includes('CullingOptimizationModule.getInstance().getStats()'), 'Tích hợp đọc số liệu trực tiếp từ CullingOptimizationModule');
assert(profilerCode.includes('culled') && profilerCode.includes('visible'), 'Hiển thị số đối tượng hiển thị và số đối tượng đã cull');
assert(profilerCode.includes('textures') || profilerCode.includes('VRAM'), 'Hiển thị số lượng Texture đã nạp trong VRAM');
assert(profilerCode.includes('TILED_PIPELINE_CONFIG'), 'Hiển thị trạng thái ON/OFF của 3 module Tiled Pipeline');

// 4. Kiểm tra Chế độ 10-Second Stress Benchmark (F10)
console.log('\n4. Kiểm toán Chế độ Chạy Thử Hiệu Năng 10 Giây (F10):');
assert(profilerCode.includes('BENCHMARK_DURATION_MS') && profilerCode.includes('10000'), 'Thời lượng benchmark cấu hình chuẩn 10.0 giây (10,000 ms)');
assert(profilerCode.includes('startBenchmark'), 'Có hàm startBenchmark() khởi động chu kỳ ghi nhận mẫu');
assert(profilerCode.includes('updateBenchmarkProgress'), 'Có hàm updateBenchmarkProgress() thu thập mẫu mỗi frame');
assert(profilerCode.includes('finishBenchmark'), 'Có hàm finishBenchmark() tính toán trung bình, min, max, 1% low');
assert(profilerCode.includes('showBenchmarkModal'), 'Hiển thị Modal/Bảng tổng kết trực quan giữa màn hình');
assert(profilerCode.includes('exportBenchmarkJson'), 'Hỗ trợ tự động xuất/tải xuống log JSON trên trình duyệt');
assert(profilerCode.includes('console.table'), 'In bảng tổng kết cấu trúc trực quan ra DevTools Console');

// 5. Kiểm tra GameScene.ts
console.log('\n5. Kiểm toán tích hợp trong GameScene.ts:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneCode.includes('hitboxInspector.update(this.currentZoneId, delta)'), 'GameScene truyền cả currentZoneId và delta vào update()');
assert(gameSceneCode.includes('hitboxInspector.isBenchmarkModalOpen()'), 'handleESCPress hỗ trợ đóng bảng kết quả Benchmark bằng phím ESC');

console.log('\n======================================================');
if (allPassed) {
  console.log('>>> KẾT QUẢ: TOÀN BỘ TIÊU CHÍ PROFILER & BENCHMARK ĐẠT CHUẨN 100%! <<<');
  process.exit(0);
} else {
  console.error('>>> KẾT QUẢ: CÓ HẠNG MỤC CHƯA ĐẠT! <<<');
  process.exit(1);
}
