# BÁO CÁO KỸ THUẬT BƯỚC V152-08: CHUẨN HÓA VÒNG ĐỜI & 4 LUỒNG TÍCH HỢP P2GAME SDK V1.1

**Dự án:** HOLLOW WOODS v1.5.2 (Phaser 4.2.1, TypeScript Strict, Vite 5.4, p2game SDK v1.1)  
**Mục tiêu thực hiện:** V152-08 (Khởi động & Vòng đời chuẩn SDK, Đăng nhập chuẩn p2.auth, Lưu tiến trình đám mây p2.storage, Bảng xếp hạng survival-score)  
**Thời gian thực hiện:** 2026-11-20  
**Thư mục sao lưu:** `Backups/steps/backup_v152_08/`

---

## 1. TỔNG QUAN 4 LUỒNG TÍCH HỢP P2GAME SDK V1.1

### Luồng 1: Khởi Động & Vòng Đời Chuẩn SDK
- **Tập tin can thiệp:** `src/main.ts`, `src/types/p2game.d.ts`, `src/scenes/BootScene.ts`, `src/scenes/MainMenuScene.ts`, `src/scenes/GameScene.ts`, `src/systems/EndingSystem.ts`
- **Chi tiết giải pháp:**
  - Khởi tạo sớm tại `main.ts` với cấu hình an toàn:
    `await window.p2.init({ timeoutMs: 10_000, allowStandalone: true, debug: false })`.
  - Khắc phục triệt để cảnh báo `SD-004`:
    + Dỡ bỏ toàn bộ việc gọi `p2.ready()` vội vã tại `BootScene.ts` (khi tài nguyên chưa nạp xong).
    + Chuyển lệnh gọi `window.p2.ready()` sang `MainMenuScene.ts` thông qua sự kiện `this.events.once('render', ...)`, đảm bảo 100% khung hình đầu tiên của Menu chính đã vẽ xong trước khi phát tín hiệu sẵn sàng.
  - Gắn đầy đủ 3 sự kiện vòng đời nền tảng tại `main.ts`:
    + `p2.onPause(...)`: Tạm dừng game loop (`game.loop.sleep()`) đồng thời ngắt âm thanh (`game.sound.pauseAll()`).
    + `p2.onResume(...)`: Đánh thức game loop (`game.loop.wake()`) và tiếp tục âm thanh (`game.sound.resumeAll()`).
    + `p2.onBeforeUnload(...)`: Kích hoạt lưu nhanh tiến trình qua `SaveManager.quickSaveOnUnload()`.
  - Gọi `p2.gameOver({ score, level })`:
    + Khi nhân vật tử nạn tại `GameScene.ts`: gửi `{ score: calculatedScore, level: dayCount, day: dayCount, zone: this.currentZoneId, deathReason }`.
    + Khi người chơi hoàn thành 1 trong 3 kết thúc cốt truyện tại `EndingSystem.ts`: gửi `{ score: endingScore, level: dayCount, day: dayCount, ending: endingType }`.

---

### Luồng 2: Đăng Nhập Chuẩn p2.auth (0 Dựng Form Riêng)
- **Tập tin can thiệp:** `src/scenes/MainMenuScene.ts`, `src/services/CloudSaveService.ts`
- **Chi tiết giải pháp:**
  - Tuyệt đối tuân thủ quy định P2Game: KHÔNG tự dựng bất kỳ form HTML/input đăng nhập hoặc mật khẩu riêng nào.
  - Đọc trạng thái người chơi thông qua `await window.p2.auth.getUser()`.
  - Lắng nghe thay đổi phiên đăng nhập theo thời gian thực qua `window.p2.auth.onChange((player) => ...)`.
  - Hiển thị gọn gàng ở góc trên phải Main Menu:
    + Khi đã đăng nhập: Pill gỗ viền đồng với biểu tượng `👤` và `player.displayName` màu vàng kim.
    + Khi chưa đăng nhập (hoặc `anonymous`): Hiển thị `👤 Khách` kèm nút bấm `[🔑 ĐĂNG NHẬP]`. Khi người chơi bấm nút, gọi trực tiếp `await window.p2.auth.requestLogin()` để nền tảng P2Game tự mở giao diện đăng nhập an toàn.

---

### Luồng 3: Lưu Tiến Trình Đám Mây p2.storage
- **Tập tin can thiệp:** `src/services/CloudSaveService.ts`, `src/systems/SaveManager.ts`
- **Chi tiết giải pháp:**
  - Chuẩn hóa khóa lưu trữ chính thức: `SAVE_KEY_PROGRESS = "progress"`.
  - Đồng bộ lưu qua `p2.storage.set("progress", payload)` (kèm fallback ghi slot cũ để tương thích ngược).
  - Tải tiến trình ưu tiên đọc từ `p2.storage.get("progress")`.
  - Kiểm soát nghiêm ngặt dung lượng payload:
    + Byte size <= 64 KB (65,536 bytes).
    + Số lượng khóa trong payload <= 32 khóa.
  - Cơ chế giả lập `localStorage` tự động mượt mà khi người chơi chạy chế độ độc lập (standalone / offline local).
  - Bổ sung phương thức `SaveManager.quickSaveOnUnload()` tự động trích xuất trạng thái GameScene đang chạy và lưu tức thời.

---

### Luồng 4: Bảng Xếp Hạng survival-score (p2.leaderboard)
- **Tập tin can thiệp:** `src/services/LeaderboardService.ts`, `src/scenes/MainMenuScene.ts`, `src/types/p2game.d.ts`
- **Chi tiết giải pháp:**
  - Gửi điểm sinh tồn qua `await p2.leaderboard.submit("survival-score", score, metadata)`.
  - Kiểm soát metadata dưới 1 KB (thực tế ~180-250 bytes).
  - Tự động hiển thị toast chúc mừng nếu `result.improved === true`.
  - Hỗ trợ lấy Top bảng xếp hạng theo khung tuần `p2.leaderboard.top("survival-score", { limit: 10, window: "WEEKLY" })` và lấy thứ hạng xung quanh bạn `p2.leaderboard.aroundMe("survival-score", { range: 3 })`.
  - Bổ sung nút bấm `🏆 BẢNG XẾP HẠNG` trên Main Menu mở `showLeaderboardModal()` được ốp khung giấy da UI Pack (`ui_pack_panel_modal`).
  - Bọc khối `try/catch` chuẩn hóa bắt và xử lý rõ 3 mã lỗi của `P2GameError`:
    + `UNAUTHENTICATED`: Nhắc nhở người chơi đăng nhập.
    + `SCORE_REJECTED`: Thông báo phiên chơi không đủ điều kiện hoặc điểm số không hợp lệ.
    + `RATE_LIMITED`: Thông báo thời gian chờ retry và thử lại an toàn.

---

## 2. KẾT QUẢ KIỂM THỬ VÀ ĐỐI CHIẾU

| Bộ Kiểm Thử | Tệp Kiểm Tra | Kết Quả | Ghi Chú |
|---|---|---|---|
| **TypeScript Compilation** | `npx tsc --noEmit` | **0 errors (PASS)** | Tuân thủ TypeScript Strict |
| **V152-08 P2Game SDK Test Suite** | `scripts/test_v152_08_p2game_sdk.mjs` | **29/29 PASS** | Đạt 100% 4 luồng SDK |
| **V152-07 Lighting & Dark Shadow** | `scripts/test_v152_07_lighting_dark_shadow.mjs` | **15/15 PASS** | Hào quang dịu mắt, Dark Shadow chuẩn |
| **V152-06B UI Pack Assets** | `scripts/test_v152_06b_ui_pack.mjs` | **25/25 PASS** | Toàn bộ 28 UI Pack assets hoạt động tốt |
| **Hồi quy Hào Quang & Tinh Thần** | `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs` | **23/23 PASS** | Toàn bộ kiểm toán V15-54 giữ nguyên vẹn |

---

## 3. THÔNG SỐ VÒNG ĐỜI & SDK CONFIG ĐÃ ĐỒNG BỘ

```json
{
  "sdk": {
    "version": "1.1",
    "init": {
      "timeoutMs": 10000,
      "allowStandalone": true,
      "debug": false
    },
    "readyEvent": "MainMenuScene.render (Avoid SD-004)",
    "lifecycle": ["onPause", "onResume", "onBeforeUnload"],
    "gameOverPayload": {
      "score": "number",
      "level": "number (dayCount)"
    }
  },
  "auth": {
    "provider": "window.p2.auth",
    "methods": ["getUser", "onChange", "requestLogin"],
    "customForm": false
  },
  "storage": {
    "key": "progress",
    "maxByteSize": 65536,
    "maxKeyCount": 32,
    "localStorageFallback": true
  },
  "leaderboard": {
    "id": "survival-score",
    "window": "WEEKLY",
    "metaMaxBytes": 1024,
    "handledErrors": ["UNAUTHENTICATED", "SCORE_REJECTED", "RATE_LIMITED"]
  }
}
```
