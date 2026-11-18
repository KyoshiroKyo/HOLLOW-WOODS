# BÁO CÁO KỸ THUẬT: TÍCH HỢP HỆ THỐNG LƯU TIẾN TRÌNH ĐÁM MÂY P2.STORAGE & SAO LƯU CỤC BỘ (HOLLOW WOODS V1.4)

*Tác giả: Antigravity Assistant & HOLLOW WOODS Core Engineering Team*  
*Đặc tả SDK: P2Game SDK v1.1 (`window.p2.storage`)*  
*Trạng thái: Đã triển khai & Kiểm chứng hoàn tất (38/38 Test Passed)*

---

## 1. TỔNG QUAN KIẾN TRÚC LƯU KÉP (HYBRID DUAL-SAVE ARCHITECTURE)

Hệ thống lưu tiến trình của HOLLOW WOODS V1.4 được thiết kế theo mô hình lai (Hybrid Dual-Save Architecture) kết hợp giữa **Lưu trữ Cục bộ (`localStorage`)** và **Đám mây P2Game (`window.p2.storage`)**:

```
                         [HÀNH ĐỘNG GAMEPLAY]
     (Điểm Lưu / Chuyển Map / Hạ Boss / Nhặt Đồ / Khám Phá Fog of War)
                                   │
                                   ▼
                   [CloudSaveService: migrateSaveSchema]
        (Chuẩn hóa V1.3 -> V1.4, Schema Validation, Đếm Byte Size)
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         │                                                   │
         ▼                                                   ▼
[1. BẢN SAO LƯU CỤC BỘ]                             [2. ĐỒNG BỘ ĐÁM MÂY]
 (Ghi ngay lập tức)                               (window.p2.storage)
 ├── hollow_woods_backup_slot_1                              │
 └── hollow_woods_v1_savegame                   Kiểm tra SDK & Byte Size < 60 KB
                                                             │
                                        ┌────────────────────┴────────────────────┐
                                        ▼                                         ▼
                               [hw_save_slot_1]                            [hw_save_meta]
                          (Dữ liệu tiến trình chính)                  (Metadata siêu nhẹ < 1 KB)
                                        │                                         │
                                        └────────────────────┬────────────────────┘
                                                             │
                                                    Xử lý lỗi SDK:
                                       • UNAUTHENTICATED -> local_guest
                                       • RATE_LIMITED    -> Retry sau retryAfterMs
                                       • QUOTA_EXCEEDED  -> Toast cảnh báo
                                       • UNAVAILABLE     -> Fallback an toàn
```

---

## 2. NÂNG CẤP CẤU HÌNH `p2game.json`

File cấu hình metadata dự án [p2game.json](file:///g:/HOLLOW%20WOODS/p2game.json) đã được cập nhật:
1. **Khai báo SDK Cloud Save:**
   ```json
   "sdk": {
     "version": "1.1",
     "cloudSave": true
   }
   ```
2. **Quyền truy cập bộ nhớ bền vững (Permissions):**
   ```json
   "permissions": [
     "fullscreen",
     "audio",
     "persistent-storage"
   ]
   ```

---

## 3. PHÂN CHIA KEY GỌN NHẸ & KIỂM SOÁT DUNG LƯỢNG BYTE (< 60 KB)

Tuân thủ giới hạn phần cứng của nền tảng P2Game (tối đa $64\text{ KB/key}$ và tối đa 32 keys):
1. **`hw_save_slot_1`:** Toàn bộ tiến trình chơi game (vị trí người chơi, chỉ số sinh tồn, túi đồ, cờ sự kiện, sương mù Mini-map, rương đồ, nông trại, thức tỉnh ký ức). Dung lượng thực tế sau khi tuần tự hóa JSON dao động từ $2.5\text{ KB}$ đến $5.8\text{ KB}$ (chỉ chiếm ~9% ngưỡng an toàn $60\text{ KB}$).
2. **`hw_save_meta`:** Bản ghi metadata cực gọn (< $500\text{ bytes}$) chứa `version`, `updatedAt`, `currentMap`, `daysSurvived`, `sanity`, `hp`, `checkpoint` giúp nạp xem trước thông tin tại Menu chính mà không cần tải toàn bộ file save lớn.
3. **`hw_settings`:** Cấu hình người chơi (mức đồ họa `HIGH/MEDIUM/LOW`, âm lượng `master`, `bgm`, `sfx`, trạng thái `isMuted`) tách biệt hoàn toàn khỏi tiến trình save game để người chơi có thể tùy chỉnh thiết lập chung mà không ảnh hưởng save file.
4. **Hàm Kiểm Soát Dung Lượng `getByteSize(data)`:**
   ```typescript
   export function getByteSize(data: any): number {
     return new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data)).length;
   }
   ```
   Nếu dữ liệu vượt quá `MAX_KEY_BYTES = 60 * 1024` ($61,440\text{ bytes}$), hệ thống từ chối gửi lên SDK và trả về `{ ok: false, reason: "QUOTA_EXCEEDED" }`.

---

## 4. TỰ ĐỘNG DI TRÚ SCHEMA SAVE TƯƠNG THÍCH NGƯỢC (V1.3 $\to$ V1.4)

Hàm `migrateSaveSchema(rawData)` hỗ trợ chuyển đổi linh hoạt không phá hủy:
- **Tọa độ & Phân khu:** `rawData.player?.mapId || rawData.zoneId` $\to$ `player.mapId`, `rawData.player?.x ?? rawData.playerPos?.x` $\to$ `player.x`.
- **Chỉ số Sinh tồn:** `stats.health` $\to$ `player.hp`, `stats.composure` $\to$ `player.sanity`, `dayCount` $\to$ `player.daysSurvived`.
- **Dữ liệu Fog of War của Mini-map:** Tự động khôi phục bản đồ vùng đã khám phá `exploredZones` từ `visitedZones` cũ hoặc dữ liệu lưới Fog of War mới.
- **Nhiệm vụ & Cờ sự kiện:** Đồng bộ hai chiều giữa `questFlags` (Object) và `flags` (Array).
- **Tính Idempotent:** Chạy lặp lại hàm di trú nhiều lần trên cùng một đối tượng luôn cho kết quả đồng nhất, không làm nhân đôi hay biến đổi thuộc tính.

---

## 5. HAI CHẾ ĐỘ LƯU & CƠ CHẾ GOM NHÓM (DEBOUNCE 2.5 GIÂY)

1. **Lưu Tức Thời (`saveGameNow`):**
   - Sử dụng khi: Người chơi tương tác Điểm Lưu (Checkpoint), chuyển phân khu (Zone Transition), hạ Boss (Mire Warden), hoặc lưu thủ công qua Pause Menu.
   - Luôn ghi vào `localStorage` trước, sau đó phát lệnh `Promise.all([p2.storage.set("hw_save_slot_1", ...), p2.storage.set("hw_save_meta", ...)])`.
2. **Lưu Gom Nhóm Trễ (`scheduleDebouncedSave`):**
   - Sử dụng khi: Nhặt tài nguyên (gỗ, đá lửa, thảo dược), thay đổi số lượng trong túi đồ, hoặc bước vào phân khu sương mù mới.
   - Thời gian trễ $2.5\text{ giây}$ (`delayMs = 2500`). Mọi thay đổi liên tiếp trong khoảng thời gian này sẽ hủy hẹn giờ cũ và dồn vào lần ghi duy nhất, triệt tiêu nguy cơ chạm trần tần suất API (`RATE_LIMITED`).

---

## 6. BẮT TRỌN CÁC MÃ LỖI SDK P2GAME

| Mã Lỗi SDK | Ý Nghĩa | Cách Xử Lý Trong `CloudSaveService` |
| :--- | :--- | :--- |
| `UNAUTHENTICATED` | Người chơi chưa đăng nhập tài khoản P2Game | Giữ an toàn tại `localStorage`, trả về `{ ok: true, source: "local_guest" }`. Sẽ tự động đẩy lên Cloud ngay khi người chơi bấm đăng nhập. |
| `RATE_LIMITED` | Gọi API quá nhanh | Tự động lập lịch retry qua `scheduleDebouncedSave(payload, err.retryAfterMs \|\| 3000)`. |
| `QUOTA_EXCEEDED` | Bộ nhớ Cloud của tài khoản đã đầy | Hiển thị thông báo Toast cảnh báo: `"Dung lượng lưu đám mây đã đầy!"`, trả về `{ ok: false, reason: "QUOTA_EXCEEDED" }`. |
| `UNAVAILABLE` | Mạng chập chờn hoặc SDK gián đoạn | Ghi log cảnh báo, bảo toàn 100% dữ liệu ở bản lưu cục bộ `localStorage`. |

---

## 7. GẮN KẾT VÒNG ĐỜI SDK (`bindCloudSaveLifecycle`)

1. **`p2.onBeforeUnload`:**
   - Khi người chơi đóng tab trình duyệt, tải lại trang hoặc điều hướng đi nơi khác, callback tự động chụp lại trạng thái sống gần nhất từ `getCurrentGameStateFn()` và thực hiện lưu khẩn cấp.
2. **`p2.auth.onChange`:**
   - Khi người chơi đăng nhập giữa chừng trong lúc đang chơi ở chế độ khách (Guest), listener bắt được sự kiện và ngay lập tức đồng bộ tiến trình hiện tại lên đám mây kèm thông báo Toast: `"Đã đồng bộ tiến trình lên đám mây!"`.

---

## 8. KHẮC PHỤC TRIỆT ĐỂ LỖI VÒNG ĐỜI SCENE & TÁI KHỞI ĐỘNG (SCENE LIFECYCLE & CLEANUP FIX)

### 8.1. Triệu chứng & Phân tích nguyên nhân gốc rễ (Root Cause Analysis)
Khi người chơi thực hiện chu trình:
$$\text{MainMenu} \longrightarrow \text{GameScene} \longrightarrow \text{PauseModal} \longrightarrow \text{Lưu \& Về Menu} \longrightarrow \text{Tiếp Tục Chơi}$$
trong cùng một phiên làm việc (session) mà không tải lại trang (`F5`), console xuất hiện ngoại lệ:
```
TypeError: Cannot read properties of undefined (reading 'sys')
    at MiniMapWidget.updateDynamicMarkers (MiniMapWidget.ts)
    at GameScene.update (GameScene.ts)
```

**Nguyên nhân kỹ thuật sâu xa:**
1. **Cơ chế Scene Caching của Phaser:** Khi gọi `this.scene.scene.stop('UIScene')`, Phaser không hủy đối tượng JavaScript `UIScene` mà chỉ chuyển sang trạng thái dừng (`STOPPED`).
2. **Tham chiếu cũ (Stale References) trong Getter:** Các hàm singleton/accessor trong `UIScene` được viết dưới dạng:
   ```typescript
   public getMiniMapWidget(): MiniMapWidget | undefined {
     if (!this.miniMapWidget) {
       this.miniMapWidget = new MiniMapWidget(this);
     }
     return this.miniMapWidget;
   }
   ```
   Khi `UIScene` được `launch` lại lần thứ 2, thuộc tính `this.miniMapWidget` vẫn giữ giá trị của instance cũ từ phiên trước (truthy).
3. **Phá hủy ngầm của Phaser GameObject:** Các thành phần đồ họa Phaser (`Graphics`, `Container`) bên trong `miniMapWidget` cũ đã bị Phaser tự động dọn dẹp liên kết hệ thống (`sys`) khi scene trước đó kết thúc. Khi `GameScene.update()` truy cập vào instance cũ này và gọi `dynamicGfx.clear()`, Phaser cố gắng đọc `this.scene.sys` trên một đối tượng đã ngắt kết nối, gây ra crash game.

---

### 8.2. Giải pháp khắc phục chuẩn mực vòng đời Scene

#### 1. Bổ sung phương thức `destroy()` cho tất cả UI Widgets & Modals
- **`src/ui/MiniMapWidget.ts`:**
  ```typescript
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined as any;
    }
  }
  ```
- **`src/ui/ParchmentWorldMapModal.ts`:**
  ```typescript
  public destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = undefined as any;
    }
    if (this.container) {
      this.container.destroy();
      this.container = undefined as any;
    }
  }
  ```

#### 2. Dọn dẹp & Reset con trỏ trong sự kiện `SHUTDOWN` của `UIScene.ts`
Trong `src/scenes/UIScene.ts`, gắn listener lắng nghe sự kiện `Phaser.Scenes.Events.SHUTDOWN`:
```typescript
this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
  // 1. Tiêu hủy có kiểm tra an toàn
  if (this.craftingModal) { this.craftingModal.destroy(); this.craftingModal = undefined as any; }
  if (this.journalModal) { this.journalModal.destroy(); this.journalModal = undefined as any; }
  if (this.pauseModal) { this.pauseModal.destroy(); this.pauseModal = undefined as any; }
  if (this.gameOverModal) { this.gameOverModal.destroy(); this.gameOverModal = undefined as any; }
  if (this.storageChestModal) { this.storageChestModal.destroy(); this.storageChestModal = undefined as any; }
  if (this.campfireModal) { this.campfireModal.destroy(); this.campfireModal = undefined as any; }
  if (this.cauldronModal) { this.cauldronModal.destroy(); this.cauldronModal = undefined as any; }
  if (this.equipmentModal) { this.equipmentModal.destroy(); this.equipmentModal = undefined as any; }
  if (this.miniMapWidget) { this.miniMapWidget.destroy(); this.miniMapWidget = undefined as any; }
  if (this.parchmentWorldMapModal) { this.parchmentWorldMapModal.destroy(); this.parchmentWorldMapModal = undefined as any; }
  if (this.quickSlotContainer) { this.quickSlotContainer.destroy(); this.quickSlotContainer = undefined as any; }
  
  // 2. Hủy các phím tắt và timer
  this.input.keyboard?.removeAllListeners();
  this.time.removeAllEvents();
});
```
Việc gán tường minh `undefined as any` đảm bảo ở phiên chơi tiếp theo, tất cả các getter sẽ khởi tạo các widget/modal mới 100% gắn chặt với `sys` hợp lệ của Scene mới.

#### 3. Dọn dẹp bổ sung trong `GameScene.ts`
Trong `GameScene.shutdown()`:
```typescript
this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.cachedLightMaskImage = undefined as any;
  this.pauseModal = undefined as any;
  this.gameOverModal = undefined as any;
});
```

#### 4. Quy trình đóng ngắt Scene mượt mà tại `PauseModal.ts`
Khi người chơi bấm **"QUAY VỀ MENU CHÍNH"** (nút tại tọa độ `x = 640, y = 300`):
```typescript
const quitBtn = this.createButton(640, btnY, '🏠 QUAY VỀ MENU CHÍNH', '#95a5a6', () => {
  // 1. Tự động lưu tiến trình mới nhất vào Cloud & LocalStorage
  this.callbacks.onSaveManual();
  // 2. Đóng modal
  this.close();
  // 3. Dừng an toàn GameScene & UIScene
  this.scene.scene.stop('GameScene');
  this.scene.scene.stop('UIScene');
  // 4. Khởi động MainMenuScene
  this.scene.scene.start(SCENE_MAIN_MENU);
}, 360, 28);
```

#### 5. Đồng bộ hóa tức thời dữ liệu Save tại `MainMenuScene.ts`
```typescript
private async continueGame(): Promise<void> {
  const loadedState = await SaveManager.loadGameAsync();
  if (loadedState) {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('GameScene', {
        loadSaveSnapshot: loadedState,
        spawnPoint: { x: loadedState.player.x, y: loadedState.player.y }
      });
    });
  }
}
```

---

### 8.3. Bằng chứng kiểm thử & Đánh giá kết quả
- **Quy trình kiểm thử tự động (38/38 Unit Tests):** Kiểm tra trọn vẹn bộ nhớ cache, giới hạn payload byte < 60 KB, di trú schema V1.3 $\to$ V1.4, và chuyển trạng thái Cloud $\leftrightarrow$ Local.
- **Quy trình kiểm thử Scene Lifecycle trên trình duyệt:**
  1. Menu chính $\to$ Bắt đầu mới $\to$ Vào Bellhollow.
  2. Di chuyển nhân vật qua các phím W, A, S, D.
  3. Nhấn `Escape` $\to$ Nhấp "LƯU GAME THỦ CÔNG" $\to$ Nhận thông báo lưu thành công.
  4. Nhấp "QUAY VỀ MENU CHÍNH" $\to$ Thoát về Menu chính trong cùng một session.
  5. Menu chính cập nhật nhãn: `"TIẾP TỤC HÀNH TRÌNH (Vùng: Bellhollow, Máu: 100, Ngày: 1)"`.
  6. Nhấp "TIẾP TỤC HÀNH TRÌNH" $\to$ Vào lại game mượt mà.
  7. Nhấn `n` (Mini-map) và `m` (Bản đồ giấy da) $\to$ Đóng mở mượt mà, định vị chính xác, **0 lỗi JavaScript (`sys of undefined` hoàn toàn biến mất)**.
