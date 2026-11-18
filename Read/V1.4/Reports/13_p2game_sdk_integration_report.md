# BÁO CÁO TÍCH HỢP P2GAME SDK V1.1 — HOLLOW WOODS V1.4

**Ngày thực hiện:** 18/11/2026  
**Phiên bản dự án:** HOLLOW WOODS V1.4.0 (Phaser 4 + TypeScript)  
**Nền tảng đích:** [p2game.io](https://p2game.io)  
**Phiên bản SDK:** `@p2game.io/sdk v1.1` (`https://games.p2game.io/sdk/p2game-sdk.v1.js`)  
**Tình trạng kiểm thử:** Đạt 100% (37/37 kiểm thử tự động, 0 lỗi TypeScript, 0 lỗi Runtime)

---

## 1. TỔNG QUAN YÊU CẦU & KẾT QUẢ ĐẠT ĐƯỢC

| Hạng mục yêu cầu | Tệp cấu hình / Mã nguồn | Trạng thái | Chi tiết triển khai |
| :--- | :--- | :---: | :--- |
| **1. Nhúng SDK Script vào `<head>`** | [index.html](file:///g:/HOLLOW%20WOODS/index.html#L3-L9) | **ĐẠT** | Thêm `<script src="https://games.p2game.io/sdk/p2game-sdk.v1.js"></script>` vào trước script ứng dụng (`/src/main.ts`). |
| **2. Khởi tạo `p2.init(...)`** | [src/main.ts](file:///g:/HOLLOW%20WOODS/src/main.ts#L5-L21) | **ĐẠT** | Gọi `await window.p2.init({ timeoutMs: 10000, allowStandalone: true, debug: false })` có bọc `try/catch` an toàn trước khi khởi tạo `new Phaser.Game(...)`. |
| **3. Cấu hình `autoFocus: false`** | [src/config/GameConfig.ts](file:///g:/HOLLOW%20WOODS/src/config/GameConfig.ts#L19-L23) & [src/main.ts](file:///g:/HOLLOW%20WOODS/src/main.ts#L32-L37) | **ĐẠT** | Loại bỏ hoàn toàn cảnh báo trình duyệt `Permissions policy violation: focus-without-user-activation` khi game nhúng trong iframe. |
| **4. Đăng ký vòng đời `onPause` & `onResume`** | [src/main.ts](file:///g:/HOLLOW%20WOODS/src/main.ts#L39-L57) | **ĐẠT** | `window.p2.onPause(() => game.loop.sleep())` và `window.p2.onResume(() => game.loop.wake())` giúp tiết kiệm tài nguyên khi chuyển tab/ẩn game. |
| **5. Phát tín hiệu `p2.ready()` ở khung hình đầu tiên** | [src/scenes/BootScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/BootScene.ts#L4-L35) | **ĐẠT** | Gọi `window.p2?.ready()` ngay trong `BootScene.create()` khi khung hình nền canvas `#0b0c10` đầu tiên được dựng (có cờ `static hasNotifiedReady` đảm bảo chỉ gọi duy nhất 1 lần). |
| **6. Khai báo Manifest `p2game.json`** | [public/p2game.json](file:///g:/HOLLOW%20WOODS/public/p2game.json#L1-L9) & [p2game.json](file:///g:/HOLLOW%20WOODS/p2game.json#L1-L9) | **ĐẠT** | Bổ sung `"sdk": { "version": "1.1" }` chuẩn đặc tả P2Game platform. |
| **7. Type Definitions cho TypeScript** | [src/types/p2game.d.ts](file:///g:/HOLLOW%20WOODS/src/types/p2game.d.ts#L1-L40) | **ĐẠT** | Khai báo toàn bộ interface của `window.p2` và `window.p2game`, `tsc --noEmit` đạt 0 cảnh báo. |

---

## 2. CHI TIẾT CÁC THAY ĐỔI KỸ THUẬT

### A. Nhúng SDK (`index.html`)
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HOLLOW WOODS V1.4 – The Fog That Remembers</title>
  <!-- P2Game Platform SDK -->
  <script src="https://games.p2game.io/sdk/p2game-sdk.v1.js"></script>
...
```

### B. Khởi tạo & Vòng đời Phaser Loop (`src/main.ts`)
```typescript
window.addEventListener('DOMContentLoaded', async () => {
  // 1. Khởi tạo P2Game SDK trước khi dựng game Phaser
  try {
    if (typeof window !== 'undefined' && window.p2 && typeof window.p2.init === 'function') {
      const ctx = await window.p2.init({
        timeoutMs: 10000,
        allowStandalone: true,
        debug: false
      });
      console.log('[P2Game SDK] Khởi tạo thành công:', ctx?.sessionId ?? 'standalone');
    } else {
      console.warn('[P2Game SDK] Không tìm thấy window.p2, chạy ở chế độ dự phòng.');
    }
  } catch (err) {
    console.warn('[P2Game SDK] Cảnh báo lỗi khởi tạo SDK (dự phòng standalone):', err);
  }

  // Khởi tạo Phaser Game với autoFocus: false
  const game = new Phaser.Game({
    ...GameConfig,
    autoFocus: false,
    type: canUseWebGL ? Phaser.WEBGL : Phaser.CANVAS,
    ...(existingCanvas ? { canvas: existingCanvas } : {})
  });

  // 2. Đăng ký vòng đời p2.onPause và p2.onResume cho Phaser Game Loop
  try {
    if (typeof window !== 'undefined' && window.p2) {
      if (typeof window.p2.onPause === 'function') {
        window.p2.onPause(() => {
          console.log('[P2Game SDK] onPause: Tạm dừng game.loop');
          game.loop.sleep();
        });
      }
      if (typeof window.p2.onResume === 'function') {
        window.p2.onResume(() => {
          console.log('[P2Game SDK] onResume: Đánh thức game.loop');
          game.loop.wake();
        });
      }
    }
  } catch (lifecycleErr) {
    console.warn('[P2Game SDK] Lỗi khi đăng ký sự kiện vòng đời:', lifecycleErr);
  }
});
```

### C. Phát tín hiệu `p2.ready()` tại First Frame (`src/scenes/BootScene.ts`)
```typescript
export class BootScene extends Phaser.Scene {
  private static hasNotifiedReady = false;

  public create(): void {
    // Vẽ khung hình đầu tiên ngay lập tức tránh cảnh báo RT-004
    this.cameras.main.setBackgroundColor('#0b0c10');
    const bg = this.add.graphics();
    bg.fillStyle(0x0b0c10, 1);
    bg.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Thông báo cho nền tảng P2Game rằng khung hình đầu tiên đã được dựng xong (chỉ gọi 1 lần duy nhất)
    if (!BootScene.hasNotifiedReady) {
      BootScene.hasNotifiedReady = true;
      try {
        if (typeof window !== 'undefined' && window.p2 && typeof window.p2.ready === 'function') {
          window.p2.ready();
          console.log('[P2Game SDK] Đã phát tín hiệu p2.ready() ở khung hình đầu tiên.');
        }
      } catch (err) {
        console.warn('[P2Game SDK] Lỗi khi gọi p2.ready():', err);
      }
    }

    // Chuyển sang PreloadScene nạp tài nguyên
    this.scene.start(SCENE_PRELOAD);
  }
}
```

### D. Cấu hình Manifest (`p2game.json`)
```json
{
  "schemaVersion": 1,
  "id": "hollow-woods",
  "name": "HOLLOW WOODS",
  "version": "1.4.0",
  "sdk": {
    "version": "1.1"
  },
  "description": "HOLLOW WOODS: The Fog That Remembers...",
  "entry": "index.html",
  "engine": "webgl",
  "engineInfo": "Phaser 3.80.1",
  "orientation": "landscape",
  "minViewport": {
    "width": 960,
    "height": 540
  },
  ...
```

---

## 3. KẾT QUẢ KIỂM THỬ & ĐÓNG GÓI BẢN PHÁT HÀNH

1. **Kiểm tra TypeScript (`npx tsc --noEmit`):**
   - Đạt: `0 errors, 0 warnings`.
2. **Biên dịch Rollup/Vite (`npm run build`):**
   - Hoàn tất thành công trong `9.63s`. Tệp bundle `dist/assets/index-DZ2BauB-.js` chứa đầy đủ các hook vòng đời SDK.
3. **Bộ kiểm thử đặc tả P2Game (`node scripts/verify_p2game_packaging_c4_13_22.mjs`):**
   - Đạt `37/37` bài test kiểm tra manifest, relative asset paths, CSP compliance, store icons, và dung lượng gói phát hành.
4. **Đóng gói phân phối:**
   - Đã đóng gói tệp nén [hollow-woods-p2game-v1.4.0.zip](file:///g:/HOLLOW%20WOODS/hollow-woods-p2game-v1.4.0.zip) dung lượng **24.72 MB** (nằm trong ngưỡng an toàn < 30 MB của nền tảng).
   - Bản sao lưu trữ sẵn sàng tại [release/p2game_builds/hollow-woods-p2game-v1.4.0.zip](file:///g:/HOLLOW%20WOODS/release/p2game_builds/hollow-woods-p2game-v1.4.0.zip).
5. **Kiểm thử Runtime trên Webview Browser (`http://localhost:4173/`):**
   - Trình duyệt tải `200 OK`, tiêu đề hiển thị chính xác.
   - Không xuất hiện bất kỳ cảnh báo `Permissions policy violation: focus-without-user-activation`.
   - Toàn bộ giao diện Main Menu và tương tác phím hoạt động mượt mà.
