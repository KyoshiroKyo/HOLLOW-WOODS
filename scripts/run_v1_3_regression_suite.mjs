import { spawnSync } from 'child_process';
import path from 'path';

const suites = [
  { id: 'C4-13-01', name: 'Cơ chế ẩn nấp & Gỡ kẹt AABB', script: 'verify_hiding_unstuck_c4_13_01.mjs' },
  { id: 'C4-13-02', name: 'Hiển thị Rừng Sâu & Tán cây trong suốt', script: 'verify_deep_forest_visibility_c4_13_02.mjs' },
  { id: 'C4-13-03', name: 'Quy trình Tử Vong & Game Over Dark Woodland', script: 'verify_death_and_game_over_c4_13_03.mjs' },
  { id: 'C4-13-04', name: 'Đèn lồng 4 hướng, Phím [F] & Vung gậy gỗ', script: 'verify_lantern_and_attack_sync_c4_13_04.mjs' },
  { id: 'C4-13-05', name: 'Entity AI 5 Trạng thái & Vùng an toàn Làng', script: 'verify_ai_and_safe_zone_c4_13_05.mjs' },
  { id: 'C4-13-06', name: 'Sương mù đa tầng & Xóa đối tượng xám', script: 'verify_visual_improvements_c4_13_06.mjs' },
  { id: 'C4-13-07', name: 'Menu chính, HUD, Quickslot & Nhãn tương tác', script: 'verify_ui_ux_redesign_c4_13_07.mjs' },
  { id: 'C4-13-08', name: 'Hệ thống Âm thanh Web Audio, SFX & Cân bằng', script: 'verify_audio_system_c4_13_08.mjs' },
  { id: 'C4-13-09', name: 'Tối ưu 60 FPS, Dirty-Checking & Audit 10 hệ thống', script: 'verify_performance_and_audit_c4_13_09.mjs' },
  { id: 'C4-13-14', name: 'Rút gọn nhãn nút, Hộp thoại & Đồng bộ Tiếng Việt', script: 'verify_dialogue_ui_and_text_c4_13_14.mjs' },
  { id: 'C4-13-15', name: 'Biểu tượng thuộc tính Pixel Art HUD 16x16', script: 'verify_hud_pixel_icons_c4_13_15.mjs' },
  { id: 'C4-13-16', name: 'Rào chắn kể chuyện chặn lối phía Tây đầu game', script: 'verify_west_barrier_narrative_c4_13_16.mjs' },
  { id: 'C4-13-17', name: 'Chuẩn hóa hộp va chạm công trình & Y-sorting Làng', script: 'verify_village_colliders_and_depth_c4_13_17.mjs' },
  { id: 'C4-13-18', name: 'Dọn hạt thu thập, Cạn thể lực & Hoảng loạn', script: 'verify_harvest_stamina_composure_c4_13_18.mjs' },
  { id: 'C4-13-19', name: 'Xóa tường tàng hình, Hysteresis & Miếu Chuông Vỡ', script: 'verify_invisible_walls_and_shrine_c4_13_19.mjs' },
  { id: 'C4-13-20', name: 'Mượt hóa ranh giới vùng & Ngủ đông phân khu xa', script: 'verify_seam_transition_and_hibernation_c4_13_20.mjs' },
  { id: 'C4-13-21', name: 'Đóng gói & Tích hợp NPC Thợ Rèn Bram từ SmithNPC', script: 'verify_blacksmith_integration_c4_13_21.mjs' },
  { id: 'C4-13-11', name: 'Rà soát lỗi tiềm ẩn 10 hệ thống & Tối ưu Edge Cases', script: 'verify_latent_bugs_c4_13_11.mjs' },
  { id: 'C4-13-22', name: 'Chuẩn hóa cấu hình, store assets & gói build P2Game', script: 'verify_p2game_packaging_c4_13_22.mjs' },
  { id: 'C4-12-31', name: 'Luồng chơi cốt lõi xuyên suốt Act 0 - Act 1', script: 'verify_full_game_flow_c4_12_31.mjs' }
];

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.3 — BỘ KIỂM THỬ HỒI QUY TOÀN DIỆN (REGRESSION SUITE)');
console.log('======================================================================\n');

let totalChecks = 0;
let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of suites) {
  const scriptPath = path.resolve('scripts', suite.script);
  process.stdout.write(`Running [${suite.id}] ${suite.name} ... `);
  
  const res = spawnSync(process.execPath, [scriptPath], { encoding: 'utf8' });
  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  const combined = stdout + stderr;

  // Extract pass count
  const passMatches = combined.match(/\[PASS\]/g) || [];
  const failMatches = combined.match(/\[FAIL\]/g) || [];
  
  const passed = passMatches.length;
  const failed = failMatches.length + (res.status !== 0 && failMatches.length === 0 ? 1 : 0);
  const total = passed + failed;

  totalChecks += total;
  totalPassed += passed;
  totalFailed += failed;

  const status = (res.status === 0 && failed === 0) ? 'PASS' : 'FAIL';
  console.log(`${status} (${passed}/${total})`);

  results.push({
    id: suite.id,
    name: suite.name,
    script: suite.script,
    passed,
    failed,
    total,
    status
  });
}

console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${totalPassed}/${totalChecks} KIỂM TRA ĐẠT (${totalFailed} THẤT BẠI)`);
console.log(`TRẠNG THÁI TOÀN BỘ HỆ THỐNG: ${totalFailed === 0 ? 'PASS (100%)' : 'FAIL'}`);
console.log('======================================================================\n');

console.log('| Mã Hạng Mục | Tên Bộ Kiểm Thử | Tệp Kịch Bản | Kết Quả | Trạng Thái |');
console.log('| :--- | :--- | :--- | :---: | :---: |');
for (const r of results) {
  console.log(`| **${r.id}** | ${r.name} | \`${r.script}\` | ${r.passed}/${r.total} PASS | **${r.status}** |`);
}

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
