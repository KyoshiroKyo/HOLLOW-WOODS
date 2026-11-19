# BÁO CÁO KỸ THUẬT V15-59: KHẮC PHỤC TRIỆT ĐỂ LỖI MÀN HÌNH ĐEN KHI KẾT THÚC GAME, XÂY DỰNG MÀN HÌNH KẾT THÚC PHÂN NHÁNH TINH THẦN/KÝ ỨC & ĐIỀU HƯỚNG AN TOÀN

**Dự án:** HOLLOW WOODS V1.5  
**Mã phân đoạn:** `V15-59`  
**Ngày thực hiện:** 19/11/2026  
**Trạng thái:** Hoàn tất 100% (Đã nghiệm thu qua kiểm thử tự động & Production Build)  
**Tệp tin tác động:**
- `src/config/Constants.ts`
- `src/config/GameConfig.ts`
- `src/scenes/EndingScene.ts` *(Mới tạo)*
- `src/systems/EndingSystem.ts`
- `src/scenes/GameScene.ts`
- `scripts/test_v15_59_ending_screen_and_branching.mjs` *(Mới tạo)*

---

## 1. MỤC TIÊU & YÊU CẦU KỸ THUẬT

1. **Khắc phục triệt để lỗi kẹt màn hình đen sau khi hạ Boss / Rung Chuông Kết Thúc:**
   - Xóa bỏ hiện tượng camera bị kẹt ở trạng thái đen ngòm sau khi chạy hiệu ứng `fadeOut`.
   - Ngay khi màn hình đen hoàn tất, hệ thống bắt buộc thực hiện `cam.resetFX()` và `cam.fadeIn(600)` đồng thời trên cả camera chính (`GameScene`) và camera giao diện (`UIScene`).
   - Bổ sung cơ chế an toàn **Fail-safe Timer 1.5s (1500ms)**: Nếu hiệu ứng chuyển cảnh bị gián đoạn hoặc mất focus trình duyệt, hệ thống cưỡng bức `fadeIn` và hiển thị giao diện Kết Thúc ngay lập tức.
   - Tạm dừng triệt để mọi hiểm họa: cố định vận tốc nhân vật, quái vật The Listener, giải phóng quái đầm lầy/thú rừng, tắt sương mù `VeilSystem`, tắt bão thời tiết `WeatherSystem`, tắt âm thanh nhịp tim/thở dốc và chuyển sang bản nhạc nền ấm áp `bgm_knights_quiet_fire`.

2. **Thiết kế Màn Hình Kết Thúc (Ending Screen) Giàu Cảm Xúc & Phân Nhánh:**
   - Tiêu đề và cốt truyện phân nhánh chặt chẽ theo Tinh Thần và Mảnh Ký Ức:
     * **Kết Thúc Ánh Sáng:** (Khi Tinh Thần $\ge 50$ và thức tỉnh đủ Mảnh Ký Ức `stage >= 3 & trust >= 65`):  
       `"TIẾNG CHUÔNG THANH TẨY — Lời Nguyền Bellhollow Hóa Giải"`
     * **Kết Thúc U Ám (Hiệp Sĩ Canh Giữ):** (Khi Tinh Thần $< 50$ hoặc `stage >= 2`):  
       `"DƯ ÂM TRONG SƯƠNG — Hiệp Sĩ Ở Lại Canh Giữ Rừng Sâu"`
     * **Kết Thúc U Ám (Vòng Lặp):** (Khi `stage < 2`):  
       `"DƯ ÂM TRONG SƯƠNG — Vòng Lặp Của Sương Mù"`
   - Bảng Thống Kê Hành Trình Sinh Tồn (Survival Chronicle) hiển thị sắc nét:
     * Số ngày sinh tồn kèm chu kỳ ngày/đêm (`Ngày ${day} (${timeCycle})`).
     * Lượng Tinh Thần còn lại (`composure/100`).
     * Số Mảnh Ký Ức đã tìm thấy (`unlockedLoreCount/totalLoreCount Mảnh Lore`).
     * Trạng thái kết thúc rõ ràng (`Ánh Sáng` hoặc `U Ám`).
   - 2 nút bấm điều hướng hoạt động chuẩn xác tại độ cao $Y = 580$:
     * `[⚔ CHƠI HÀNH TRÌNH MỚI]` đặt tại $(470, 580)$: Xóa sạch dữ liệu lưu (`SaveManager.clearSave()`), reset trạng thái nhân vật (`PlayerState.reset()`), restart `GameScene` mới tinh với `{ isContinue: false }`. Phím nóng: `ENTER`.
     * `[▶ QUAY VỀ MENU CHÍNH]` đặt tại $(810, 580)$: Dừng sạch sẽ `GameScene` và `UIScene`, chuyển về `SCENE_MAIN_MENU`. Phím nóng: `ESC` / `SPACE`.

---

## 2. CHI TIẾT TRIỂN KHAI KỸ THUẬT

### 2.1. Chuỗi Chuyển Động Chống Màn Hình Đen & Fail-safe Timer

Tại `EndingSystem.triggerTheFirstTollFinale()`:
```typescript
// GIAI ĐOẠN 2 & 3: V15-59 Khắc phục triệt để lỗi màn hình đen bằng resetFX + fadeIn và Fail-safe Timer
const target = this.getTargetScene();
let presentationStarted = false;

const executePresentation = () => {
  if (presentationStarted) return;
  presentationStarted = true;

  // Reset camera FX và fadeIn đảm bảo màn hình không bao giờ bị đen kẹt lại
  cam.resetFX();
  cam.fadeIn(600, 0, 0, 0);
  if (this.uiScene) {
    this.uiScene.cameras.main.resetFX();
    this.uiScene.cameras.main.fadeIn(600, 0, 0, 0);
  }

  this.playEndingPresentation(endingType);
};

// Camera fadeOut 600ms, khi progress = 1 thì lập tức fadeIn và bật Ending
cam.fadeOut(600, 0, 0, 0, (_c: any, progress: number) => {
  if (progress === 1) {
    executePresentation();
  }
});

// Fail-safe Timer 1500ms: nếu camera fadeOut bị gián đoạn thì cưỡng bức fadeIn và hiện Ending
target.time.delayedCall(1500, () => {
  if (!presentationStarted) {
    executePresentation();
  }
});
```

### 2.2. Đóng Băng Toàn Bộ Thực Thể & Chuyển Sang Nhạc Bình Yên

Khi hồi kết diễn ra, người chơi không còn bị đe dọa bởi bất kỳ cơ chế quái vật hay áp lực tâm lý nào:
```typescript
if (gameScene.player) {
  gameScene.player.setVelocity(0, 0);
  gameScene.player.playIdle();
  if (typeof gameScene.player.resetAllInputState === 'function') {
    gameScene.player.resetAllInputState();
  }
}
if (gameScene.listenerMonster) {
  gameScene.listenerMonster.setVelocity(0, 0);
  if (typeof gameScene.listenerMonster.clearTarget === 'function') {
    gameScene.listenerMonster.clearTarget();
  }
}
if (gameScene.wildlifeSystem && typeof gameScene.wildlifeSystem.clearEntities === 'function') {
  gameScene.wildlifeSystem.clearEntities();
}
if (gameScene.mireWardenBoss) {
  if (typeof gameScene.mireWardenBoss.setVelocity === 'function') gameScene.mireWardenBoss.setVelocity(0, 0);
  if (typeof gameScene.mireWardenBoss.setActive === 'function') gameScene.mireWardenBoss.setActive(false);
}
gameScene.isBossFightActive = false;
gameScene.isAct5ChaseActive = false;

if (gameScene.veilSystem) {
  if (typeof gameScene.veilSystem.setMistActive === 'function') gameScene.veilSystem.setMistActive(false);
  if (typeof gameScene.veilSystem.resetTransitionMist === 'function') gameScene.veilSystem.resetTransitionMist();
}
if (gameScene.weatherSystem && typeof gameScene.weatherSystem.stopWeatherEffects === 'function') {
  gameScene.weatherSystem.stopWeatherEffects();
}

// Dập tắt nhịp tim Web Audio dồn dập & tấu nhạc lửa trại ấm áp
AudioManager.getInstance().setHeartbeatActive(false);
AudioManager.getInstance().setSanityDucking(false);
AudioManager.getInstance().setBossAwakeningState(false);
AudioManager.getInstance().playBGM('bgm_knights_quiet_fire', 1.2, 0.7);
```

### 2.3. Bảng Biên Niên Sử Sinh Tồn (Survival Chronicle) & Bố Cục Thống Kê

Bảng thống kê được vẽ trên nền tối mờ bo góc tại tọa độ $X = 180, Y = 360, W = 920, H = 150$:
- **Cột 1: Sinh Tồn & Trạng Thái:**
  - `⏱️ Thời Gian: Ngày ${day} (${timeCycle})`
  - `❤️ Sinh Lực: ${hp}/${maxHp} HP | 🕯️ Dầu: ${oil}%`
  - `🧠 Tinh Thần Còn Lại: ${comp}/100 [Bình Tâm]`
  - `🌟 Trạng Thái: ${endingStateLabel}`
- **Cột 2: Tiến Trình & Làng:**
  - `🤝 Tin Cậy Dân Làng: ${trustScore}/100 [${trustLabel}]`
  - `⚔️ Thức Tỉnh Ký Ức: Cấp ${stage}/3`
  - `🛡️ Danh Xưng: ${stageTitle}`
  - `🔔 Chuông Đồng Cổ: Đã Ngân Vang`
- **Cột 3: Khám Phá & Bản Đồ:**
  - `📜 Ký Ức Đã Mở: ${unlockedLoreCount}/${totalLoreCount} Mảnh Lore`
  - `🐾 Bestiary Ghi Nhận: ${bestiaryCount} Sinh Vật`
  - `🗺️ Bản Đồ Khám Phá: ${visitedCount}/9 Phân Khu`
  - `🌿 Lời Nguyền: ${config.type === 'true_ending' ? 'Đã Thanh Tẩy' : 'Tạm Khóa'}`

### 2.4. Hai Nút Bấm Điều Hướng & Đa Kênh Phím Nóng

Hai nút bấm điều hướng được bố trí cân xứng tại độ cao $Y = 580$:
- **Nút 1: `[⚔ CHƠI HÀNH TRÌNH MỚI]` tại $(470, 580)$:**
  - Màu xanh lục `#2ecc71`, viền mạ ngọc, hover `#27ae60`.
  - Phím nóng: `ENTER`.
  - Thực thi: `SaveManager.clearSave()` -> `PlayerState.getInstance().reset()` -> Dừng các Scene cũ -> Bắt đầu lại `GameScene` mới tinh `{ isContinue: false }`.
- **Nút 2: `[▶ QUAY VỀ MENU CHÍNH]` tại $(810, 580)$:**
  - Màu vàng cam/tím theo phân nhánh kết thúc, hover `#d35400`.
  - Phím nóng: `ESC` hoặc `SPACE`.
  - Thực thi: Dừng các Scene cũ -> Khởi chạy `SCENE_MAIN_MENU`.
- **Dòng nhắc phím nóng tại $(640, 626)$:**
  `[Nhấn ENTER: Chơi Hành Trình Mới  |  Nhấn ESC / SPACE: Về Menu Chính  |  Hỗ trợ nhấp chuột]`

### 2.5. Tạo Mới `EndingScene.ts` Toàn Màn Hình

Đã tạo mới `src/scenes/EndingScene.ts` độc lập kế thừa `Phaser.Scene`, đăng ký vào `Constants.ts` và `GameConfig.ts` nhằm dự phòng cho các chế độ chuyển cảnh cấp thấp.

---

## 3. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

### 3.1. Kết Quả Kiểm Thử Bước V15-59 (`test_v15_59_ending_screen_and_branching.mjs`)
- **Tổng số hạng mục kiểm tra:** 22/22 hạng mục.
- **Kết quả:** **22 PASSED | 0 FAILED (100% SUCCESS)**.
- Đã xác thực:
  * Export `SCENE_ENDING` và đăng ký trong `GameConfig.ts`.
  * `EndingScene` đảm bảo Zoom 1.0, `resetFX` và `fadeIn`.
  * 3 Tiêu đề kết thúc phân nhánh chuẩn xác theo đặc tả.
  * Phân nhánh dựa trên chỉ số `composure >= 50` kết hợp `memoryAwakeningStage >= 3` và `villageTrustScore >= 65`.
  * Trình tự Camera `fadeOut` -> `resetFX` + `fadeIn` kèm bộ đếm an toàn 1.5s chống kẹt màn hình đen.
  * Tạm dừng quái vật, dọn sạch thú hoảng loạn, tắt sương mù và nhịp tim Web Audio.
  * Dữ liệu Biên Niên Sử Sinh Tồn đầy đủ 4 trường cốt lõi.
  * 2 Nút bấm đối xứng tại $Y = 580$ và hỗ trợ phím nóng `ENTER`, `ESC`, `SPACE`.

### 3.2. Kiểm Thử Hồi Quy (Zero Regression)
- `scripts/verify_gate_3c.mjs`: **12/12 CHECKS PASSED (100%)**.
- `scripts/verify_v15_20_multiple_endings.mjs`: **46/46 CHECKS PASSED (100%)**.
- `scripts/test_v15_58a_hallucinations_and_apparitions.mjs`: **4/4 PASSED (100%)**.
- `scripts/test_v15_58b_whisper_trap_and_light_dilemma.mjs`: **4/4 PASSED (100%)**.
- `scripts/test_v15_58c_heartbeat_vignette_panic.mjs`: **4/4 PASSED (100%)**.

### 3.3. Kiểm Tra Biên Dịch & Production Build
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: Hoàn thành xuất sắc trong **11.08 giây**, tệp gói phát hành `dist/assets/index-CSp2h6k2.js` sẵn sàng triển khai.

---

## 4. KẾT LUẬN

Bước **V15-59** đã được thực hiện hoàn chỉnh 100%, khắc phục triệt để lỗi kẹt màn hình đen ở hồi kết game, mang lại trải nghiệm mãn nhãn, giàu cảm xúc, phân nhánh thông minh theo Tinh Thần và Ký Ức, cùng hệ thống điều hướng 2 nút trực quan và tiện lợi cho người chơi.
