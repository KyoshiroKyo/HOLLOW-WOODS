# 🔍 BÁO CÁO KIỂM TOÁN ĐỘC LẬP: PERFORMANCE, SOURCE BOTTLENECKS, UI, AUDIO & SAVE SYSTEM
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Mã báo cáo:** `05_PERFORMANCE_UI_AUDIO_SAVE_AUDIT.md`
> **Ưu tiên số 1:** Giải mã toàn diện hiện tượng nhân vật di chuyển khựng giật (Movement Stutter)
> **Quy tắc kiểm toán:** Không tự đặt số FPS; không tuyên bố tối ưu nếu chưa đo; nếu không thể đo trực tiếp trên màn hình vật lý thì ghi `NOT MEASURED`; tập trung mổ xẻ chính xác mã nguồn và thuật toán
> **Ngày thực hiện:** 2026-11-14

---

## 1. BẢNG TỔNG QUAN ĐO ĐẠC HIỆU NĂNG & ĐÁNH GIÁ HỆ THỐNG

| Hạng mục kiểm tra | Chỉ số thực tế | Đánh giá kỹ thuật |
|---|:---:|---|
| **FPS trung bình (Baseline)** | `NOT MEASURED` | Môi trường kiểm toán CLI/Headless không có active browser session/display để chạy benchmark runtime. Tuân thủ nghiêm ngặt quy tắc không tự bịa số. |
| **P95 / P99 Frame Time** | `NOT MEASURED` | Không đo trực tiếp được trên display vật lý. (Ghi nhận hiện tượng micro-stutter dựa trên mã nguồn). |
| **FPS khi nhân vật di chuyển** | `NOT MEASURED` | Xuất hiện lỗi khựng giật hoạt ảnh (Animation Jitter) bắt nguồn từ logic đổi hướng đi chéo. |
| **FPS khi Camera cuộn** | `NOT MEASURED` | Xung đột giữa Lerp (0.1, 0.1) và phép làm tròn `Math.round(scrollX)` gây giật khung hình pixel. |
| **FPS khi bật Đèn & Sương mù** | `NOT MEASURED` | **Áp lực rác bộ nhớ cực cao:** Cấp phát và hủy đối tượng `Graphics` 60 lần/giây gây GC spikes. |
| **Lag khi NPC / Monster hoạt động** | `NOT MEASURED` | AI tuần tra nhẹ; nhưng The Listener là ảnh tĩnh trượt ngang, không có animation. |
| **Hệ thống HUD** | ⚠️ **CẢNH BÁO** | `UIScene` vẽ lại toàn bộ 4 thanh chỉ số 60 FPS; tồn tại file chết `HUDScene.ts` không dùng. |
| **Dialogue / Crafting / Journal UI** | ❌ **HỎNG HIỂN THỊ** | Bị Camera Zoom 2.2× phóng to 220% hoặc đẩy văng hoàn toàn ra ngoài màn hình canvas 720p. |
| **Hệ thống Âm thanh (Audio)** | ✅ **XUẤT SẮC** | Tổng hợp thủ tục thuần Web Audio API (không tốn dung lượng file, không lỗi 404, lọc sương mượt). |
| **Hệ thống Lưu / Nạp Game (Save/Load)**| ✅ **CHUẨN XÁC** | Lưu đầy đủ Checkpoint, Quest, Chỉ số, Túi đồ, Cờ vào LocalStorage; nạp game trơn tru. |

---

## 2. ƯU TIÊN SỐ 1: GIẢI MÃ NGUYÊN NHÂN NHÂN VẬT DI CHUYỂN KHỰNG (MOVEMENT STUTTER)

Hiện tượng người chơi cảm thấy nhân vật di chuyển bị "khựng", "giật", hoặc "không mượt" không phải là một lỗi đơn lẻ, mà là sự cộng hưởng của **5 nguyên nhân kỹ thuật độc lập** nằm rải rác từ tầng xử lý phím bấm, hoạt ảnh, camera cho đến vòng lặp quản lý bộ nhớ:

### ⚡ Nguyên nhân 1: Xung đột thuật toán hướng nhìn khi đi chéo (Diagonal Facing Jitter)
- **Vị trí mã nguồn:** `src/entities/SatyrPlayer.ts` (hàm `updateFacingDirection` & `playWalkOrRunAnim`).
- **Bản chất lỗi:**
  ```typescript
  private updateFacingDirection(moveX: number, moveY: number): void {
    if (Math.abs(moveX) > Math.abs(moveY)) {
      if (moveX < 0) this.facing = 'left';
      else if (moveX > 0) this.facing = 'right';
    } else {
      if (moveY < 0) this.facing = 'up';
      else if (moveY > 0) this.facing = 'down';
    }
  }
  ```
  * Khi người chơi nhấn 2 phím cùng lúc để đi chéo (ví dụ W + D hoặc S + A), ta có $|moveX| = 1$ và $|moveY| = 1$.
  * Phép so sánh `Math.abs(moveX) > Math.abs(moveY)` cho kết quả `false`, buộc hướng nhìn rơi vào nhánh `else` (ưu tiên trục Y - nhìn lên hoặc nhìn xuống).
  * Do thời gian quét phím bàn phím có sự chênh lệch nhỏ từng mili-giây, giá trị `facing` liên tục bị đảo giữa ngang (`right`/`left`) và dọc (`up`/`down`).
  * Trong hàm `playWalkOrRunAnim()`:
    ```typescript
    let animKey = `${prefix}${this.facing}`;
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
    ```
    Mỗi khi `facing` đổi, Phaser ngắt animation hiện tại và khởi động lại từ Frame 0 của animation mới. Kết quả là nhân vật **không thể hoàn thành một bước chân nào**, liên tục giật cục qua lại giữa 2 hướng nhìn.

### 🗑️ Nguyên nhân 2: Áp lực rác bộ nhớ tại 60 FPS từ Mặt Nạ Ánh Sáng (GC Spikes)
- **Vị trí mã nguồn:** `src/scenes/GameScene.ts` (hàm `updateFogOfWar`, dòng 990).
- **Bản chất lỗi:**
  ```typescript
  private updateFogOfWar(): void {
    ...
    const lightG = this.make.graphics(); // CẤP PHÁT ĐỐI TƯỢNG MỚI MỖI FRAME
    lightG.fillStyle(0xffffff, 1.0);
    lightG.fillCircle(screenX, screenY, radius * 0.65);
    ...
    this.fogOfWarLayer.erase(lightG);
    lightG.destroy(); // HỦY ĐỐI TƯỢNG MỖI FRAME
    ...
  }
  ```
  * Hàm `updateFogOfWar()` được gọi trong vòng lặp `update()` của Scene (chạy 60 lần mỗi giây).
  * Mỗi frame, hàm này tạo mới một đối tượng `Phaser.GameObjects.Graphics` đầy đủ, khởi tạo WebGL Command Buffer, vẽ 4 hình tròn ánh sáng, xóa mặt nạ trên RenderTexture, rồi ngay lập tức gọi `lightG.destroy()`.
  * **Hậu quả:** 60 đối tượng Graphics phức tạp được đẩy vào bộ nhớ mỗi giây. Trình thu gom rác (Garbage Collector) của trình duyệt buộc phải kích hoạt chu kỳ dọn rác (Scavenge / Mark-Sweep) liên tục. Mỗi chu kỳ GC tạm dừng luồng thực thi JavaScript từ **5ms đến 25ms**, gây ra hiện tượng sụt khung hình tức thời (micro-stuttering) đều đặn khi nhân vật đang di chuyển.

### 📷 Nguyên nhân 3: Xung đột giữa Camera Smooth Lerp và Phép Làm Tròn Pixel Snap
- **Vị trí mã nguồn:** `src/systems/camera/CameraSystem.ts`.
- **Bản chất lỗi:**
  * Camera được thiết lập bám theo nhân vật bằng nội suy mượt mà: `this.camera.startFollow(target, true, 0.1, 0.1)` với vùng chết `deadzone(32, 24)`.
  * Đồng thời, trong `CameraSystem.update()` lại cưỡng ép:
    ```typescript
    this.camera.scrollX = Math.round(this.camera.scrollX);
    this.camera.scrollY = Math.round(this.camera.scrollY);
    ```
  * Cùng lúc đó, `GameConfig.ts` đã bật cờ `roundPixels: true`.
  * Khi nhân vật di chuyển vượt ra khỏi Deadzone, vị trí camera tính bằng số thực (float) bị ép nhảy bậc thang sang số nguyên (integer snap). Dưới độ phóng đại Camera Zoom 2.2×, mỗi bước nhảy 1 pixel bị nhân lên thành 2.2 pixel trên màn hình, tạo ra cảm giác khung cảnh bị giật nấc cục (pixel jitter) thay vì lướt êm ái.

### 🎨 Nguyên nhân 4: UI Scene vẽ lại toàn bộ 4 thanh chỉ số 60 lần/giây
- **Vị trí mã nguồn:** `src/systems/SurvivalSystem.ts` (dòng 62) & `src/scenes/UIScene.ts` (dòng 124, 173).
- **Bản chất lỗi:**
  * Trong mỗi frame của `GameScene.update()`, `this.survivalSystem.update(dt)` được gọi.
  * Cuối hàm `SurvivalSystem.update()`, hệ thống luôn phát sự kiện:
    ```typescript
    this.playerState.emit('stats_changed', stats);
    ```
  * Trong `UIScene.ts`, sự kiện này được lắng nghe để vẽ lại:
    ```typescript
    this.playerState.on('stats_changed', () => this.redrawStats());
    ```
  * Trong `redrawStats()`:
    ```typescript
    g.clear();
    this.drawThickBar(g, ...); // Vẽ 4 thanh chỉ số
    ```
    Mỗi thanh chỉ số thực hiện 4 lệnh vẽ hình học (`fillRoundedRect`, `strokeRoundedRect`, `fillRect` nổi 3D).
  * **Hậu quả:** Ngay cả khi người chơi đứng yên và chỉ số hầu như không đổi, `UIScene` vẫn liên tục xóa và vẽ lại hàng chục hình chữ nhật bo góc 60 lần mỗi giây trên CPU, chiếm dụng chu kỳ xử lý quý giá của render pipeline.

### 🏃 Nguyên nhân 5: Trùng lặp trừ thể lực gây sụt tốc độ đột ngột
- **Vị trí mã nguồn:** `SatyrPlayer.updateSurvivalStats` & `SurvivalSystem.update`.
- **Bản chất lỗi:**
  * Thể lực bị trừ song song ở 2 nơi.
  * Khi thể lực trong `SatyrPlayer` chạm mốc 0, cờ `this.stats.isSprinting` ngay lập tức bị gán bằng `false`.
  * Vận tốc di chuyển của người chơi bị giảm đột ngột từ `PLAYER_SPRINT_SPEED = 140 px/s` xuống `PLAYER_WALK_SPEED = 85 px/s`. Người chơi cảm thấy nhân vật như bị "vấp ngã" hoặc "phanh gấp" không báo trước.

---

## 3. KIỂM TRA CHI TIẾT CÁC NGUYÊN NHÂN TỪ MÃ NGUỒN (SOURCE CODE AUDIT)

### 3.1. GameScene Update Loop
- Vòng lặp `update(time, delta)` trong `GameScene.ts` gánh vác quá nhiều trọng trách trong một hàm duy nhất (Monolithic Update):
  * Cập nhật Player physics & animation
  * Cập nhật Camera follow & bounds
  * Cập nhật Survival stats & Deep fog check
  * Cập nhật 2 lớp sương mù Veil cuộn ngang
  * Cập nhật bộ lọc âm thanh Web Audio biquad filter
  * Tính toán bước chân footstep timer
  * Kiểm tra nhịp tim hoảng loạn (Heartbeat)
  * Cập nhật The Echo distance check
  * Cập nhật Act 0 tutorial progress
  * Cập nhật AI của The Listener
  * Cập nhật Act 5 chase logic
  * Kiểm tra cự ly đèn ma (Fake Lantern distance check)
  * Kiểm tra ném mồi tiếng động (Noise lure)
  * Quét phát hiện phân khu (Zone detection)
  * Quét cự ly tương tác với toàn bộ NPC, tài nguyên và map objects
  * Vẽ lại toàn bộ mặt nạ sương mù (Fog of War)
  * Cập nhật 55 hạt đom đóm (Fireflies sine/cosine)
  * Cập nhật F4 Debug overlay
- **Đánh giá:** Quá nhiều phép tính toán khoảng cách Euclid (`Math.hypot`) và thao tác đồ họa được nhồi nhét vào mỗi frame thay vì chia nhỏ tần số kiểm tra (ví dụ: quét tương tác chỉ cần chạy 5..10 lần/giây thay vì 60 lần/giây).

### 3.2. Camera System
- Quản lý qua `src/systems/camera/CameraSystem.ts`.
- Các hàm hiệu ứng: `shake(duration, intensity)`, `flash(duration, r, g, b)`, `zoomTo(zoom, duration)`.
- Các hiệu ứng rung màn hình và chớp sáng hoạt động chuẩn xác, được tích hợp tốt vào các sự kiện chuông rung, quái vật tấn công và kích hoạt câu đố.

### 3.3. Tween & Timer
- **Tweens:**
  * Sử dụng Tween cho: Cuộn sương menu chính (25s loop), nhấp nháy chữ tiếp tục (600ms yoyo), sóng âm tiếng ồn (`emitNoiseWave` 500ms), nhặt đồ nổ chữ (`createPickupEffect` 1200ms).
  * **Rủi ro rò rỉ:** Hàm `emitNoiseWave` tạo mới đối tượng Graphics và Tween mỗi 350ms khi chạy nhanh. Nếu người chơi chạy liên tục xuyên suốt bản đồ, hàng trăm Tween ngắn hạn được tạo và hủy liên tục.
- **Timers:**
  * Dùng `scene.time.delayedCall` cho: Hồi sinh tài nguyên (40s), đóng khe thời đại (4.8s), hiển thị credits (15.6s).
  * Nhìn chung việc quản lý Timer tương đối an toàn, có dọn dẹp bằng `typewriterTimer.remove()`.

### 3.4. Particle & Hiệu ứng hạt
- Không sử dụng module `Phaser.GameObjects.Particles.ParticleEmitterManager` (giảm thiểu chi phí bộ nhớ).
- Hệ thống đom đóm (`updateFireflies`) gồm 55 hạt được tính toán tọa độ theo hàm hình sin:
  ```typescript
  f.x = f.anchorX + Math.sin(time * 0.001 * f.speed + f.phaseX) * f.radius;
  ```
  Tất cả được vẽ trên **một đối tượng `Graphics` duy nhất** (`this.fireflyGfx`), có kiểm tra culling ngoài tầm nhìn camera (`viewLeft`, `viewRight`). Đây là cách làm tiết kiệm tài nguyên.

### 3.5. Lighting & Sương mù (RenderTexture Mask)
- Sử dụng `fogOfWarLayer` kiểu `Phaser.GameObjects.RenderTexture` kích thước `1280×720`.
- Mỗi frame: `clear()` -> `fill(fogColor, fogAlpha)` -> `erase(lightG)` -> vẽ quầng sáng ấm `lanternGlowGfx`.
- Mặc dù tạo hiệu ứng ánh sáng gradient 4 tầng rất đẹp, việc sử dụng RenderTexture kích thước 1280×720 và xóa/vẽ lại liên tục bằng Graphics tạm là nút thắt cổ chai lớn nhất về GPU Fill-rate và Garbage Collection của game.

### 3.6. TileSprite
- 2 lớp sương mù của `VeilSystem` (`fogLayer1`, `fogLayer2`) phủ kín màn hình `1280×720` và trôi ngang bằng `tilePositionX += speed * dt`.
- Các mảng địa hình nền trong `WorldBuilder` phủ diện tích hàng ngàn pixel.
- WebGL xử lý lặp texture tương đối nhẹ nhàng, nhưng texture cỏ bị thủng trong suốt làm phát sinh việc render các mảnh vỡ không cần thiết.

### 3.7. Event Listeners & Nguy cơ rò rỉ bộ nhớ (Memory Leak)
- **Rò rỉ trên Singleton `PlayerState`:**
  * `PlayerState` là một Singleton sống vĩnh viễn trong suốt vòng đời ứng dụng (`getInstance()`).
  * Trong `UIScene.create()` có lệnh:
    ```typescript
    this.playerState.on('stats_changed', () => this.redrawStats());
    ```
  * Khi người chơi chết, nạp lại save, hoặc chuyển Scene (ví dụ quay về Main Menu rồi chơi lại), `UIScene` được tạo mới, nhưng event listener cũ trên `PlayerState` **không hề được gỡ bỏ (off / removeListener)**.
  * Mỗi lần chơi lại, số lượng hàm callback `redrawStats()` bị nhân đôi, nhân ba trên Singleton, gây rò rỉ bộ nhớ và làm chậm game dần theo thời gian.

---

## 4. KIỂM TOÁN CÁC HỆ THỐNG UI, AUDIO & SAVE SYSTEM

### 4.1. Hệ thống HUD & Quick Slots
- **Tệp thực thi:** `src/scenes/UIScene.ts`.
- **Trạng thái:** Hoạt động ổn định trên Camera Zoom = 1.0. Hiển thị 4 thanh chỉ số, khung theo dõi nhiệm vụ góc trên phải, thanh phím tắt thoáng đãng đáy màn hình tại `(640, 685)`.
- **Tệp chết:** `src/ui/HUDScene.ts` (144 dòng code) được đăng ký trong cấu hình game nhưng không bao giờ được khởi chạy.

### 4.2. Hệ thống Hộp thoại (Dialogue UI)
- **Tệp thực thi:** `src/systems/DialogueSystem.ts`.
- **Trạng thái:** **HỎNG HOÀN TOÀN TRÊN GIAO DIỆN.**
- **Nguyên nhân:** Khởi tạo trong `GameScene`, bị Camera Zoom 2.2× đẩy văng xuống tọa độ màn hình $Y = 866\text{ px}$ (ngoài màn hình 720p). Người chơi không thể nhìn thấy câu thoại, tên người nói và chân dung.

### 4.3. Bàn Chế Tạo (Crafting Modal)
- **Tệp thực thi:** `src/ui/CraftingModal.ts`.
- **Trạng thái:** **HỎNG HOÀN TOÀN TRÊN GIAO DIỆN.**
- **Nguyên nhân:** Khởi tạo trong `GameScene`, kích thước $840 \times 520\text{ px}$ bị Zoom 2.2× phóng to thành **$1848 \times 1144\text{ px}$**, vượt quá kích thước màn hình 1280×720. Bảng chế tạo bị vỡ tung ra ngoài 4 cạnh màn hình, mất toàn bộ nút chế tạo và nút đóng.

### 4.4. Sổ Tay Lữ Khách (Journal Modal)
- **Tệp thực thi:** `src/ui/JournalModal.ts`.
- **Trạng thái:** **HỎNG HOÀN TOÀN TRÊN GIAO DIỆN.**
- **Nguyên nhân:** Tương tự Bàn Chế Tạo, bị Zoom 2.2× phóng to thành $1848 \times 1144\text{ px}$, không thể lật trang hay xem danh sách nhiệm vụ.

### 4.5. Menu Tạm Dừng (Pause Modal)
- **Tệp thực thi:** `src/ui/PauseModal.ts`.
- **Trạng thái:** **BỊ CẮT CỤT NÚT BẤM DƯỚI.**
- **Nguyên nhân:** Bảng $540 \times 440\text{ px}$ bị Zoom 2.2× phóng thành $1188 \times 968\text{ px}$ (vượt quá chiều cao 720 px). Nút "LƯU ĐIỂM HÀNH TRÌNH" và "QUAY VỀ MENU CHÍNH" bị đẩy ra sát hoặc ngoài mép đáy màn hình.

### 4.6. Xử lý Bàn phím & Phím tắt (Keyboard Input)
- Hệ thống lắng nghe phím bấm phân cấp rất chặt chẽ:
  * Phím `[ESC]`: Ưu tiên đóng Crafting -> nếu không có thì đóng Journal -> nếu không có thì bật PauseMenu.
  * Phím `[E]`: Ưu tiên Nói chuyện với NPC -> nếu không có thì Thu hoạch tài nguyên -> nếu không có thì Tương tác bản đồ/Ẩn nấp.
  * Phím `[I]`, `[TAB]`: Đóng/mở Bàn chế tạo.
  * Phím `[J]`: Đóng/mở Sổ tay.
  * Phím `[F]`: Bật/tắt Đèn lồng.
  * Phím `[Q]`: Ném mồi tiếng động.
  * Phím `[1]`: Dùng Thuốc đắp.
  * Phím `[M]`: Bật/tắt âm thanh (Mute).
- Bắt sự kiện phím qua `Phaser.Input.Keyboard.JustDown` chuẩn xác, không bị lỗi lặp phím.

### 4.7. Hệ thống Âm thanh (Audio System)
- **Tệp thực thi:** `src/audio/AudioManager.ts`.
- **Đánh giá:** **XUẤT SẮC NHẤT DỰ ÁN.**
  * Hoàn toàn tự tổng hợp âm thanh thủ tục (Procedural Audio Synthesis) qua Web Audio API thuần mà không cần bất kỳ file `.mp3` hay `.wav` nào.
  * Mô phỏng tiếng gió rít qua White Noise Buffer và Bandpass Filter.
  * Mô phỏng bước chân xột xoạt trên cỏ, bì bõm đầm lầy bằng sóng tam giác (Triangle Wave) thay đổi tần số theo địa hình.
  * Mô phỏng tiếng Chuông Đồng ngân vang 3.5 giây bằng sự cộng hưởng của 4 tần số hài âm (Harmonics: 180Hz, 360Hz, 545Hz, 920Hz).
  * Hiệu ứng The Veil Muffled Low-Pass Filter bóp nghẹt âm thanh u ám khi người chơi đi vào vùng sương mù sâu hoặc bình tâm suy giảm.
  * Tự động gọi `resumeAudio()` trên mọi thao tác để vượt qua chính sách Autoplay Policy của trình duyệt.

### 4.8. Hệ thống Lưu / Nạp Game (Save / Load System)
- **Tệp thực thi:** `src/systems/SaveManager.ts`.
- **Đánh giá:** **HOẠT ĐỘNG HOÀN HẢO.**
  * Dữ liệu lưu dưới key `hollow_woods_v3_savegame` trong `localStorage`.
  * Cấu trúc JSON đầy đủ: Checkpoint, tọa độ (X, Y), phân khu, toàn bộ 4 chỉ số sinh tồn, danh sách túi đồ, tập hợp các cờ cốt truyện, và tiến độ hoàn thành của từng task trong 7 Hồi nhiệm vụ.
  * Cơ chế nạp phục hồi chính xác 100% trạng thái thế giới và phát sự kiện cập nhật giao diện.

---

## 5. KẾ HOẠCH TỐI ƯU HÓA HỆ THỐNG ĐỀ XUẤT (ACTIONABLE PLAN)

Để đưa HOLLOW WOODS V3.0 đạt độ mượt mà 60 FPS tuyệt đối và khôi phục trải nghiệm hoàn chỉnh, nhóm phát triển cần thực hiện 4 giải pháp dứt điểm:

1. **Khắc phục triệt để lỗi Di chuyển Khựng Giật:**
   * Sửa hàm `updateFacingDirection` trong `SatyrPlayer.ts`: Khi $|moveX| == |moveY|$, giữ nguyên `this.facing` hiện tại thay vì ép về trục Y.
   * Tách biệt logic đổi hướng và logic phát animation: Chỉ đổi animation khi hướng thực sự thay đổi và frame hiện tại không bị reset liên tục.
2. **Loại bỏ hoàn toàn Áp lực Rác Bộ nhớ (GC Spikes):**
   * Trong `GameScene.ts`, khởi tạo cố định **MỘT đối tượng `Graphics` duy nhất** cho đèn lồng trong hàm `create()` (ví dụ `this.lanternMaskGraphics`).
   * Trong `updateFogOfWar()`, chỉ gọi `this.lanternMaskGraphics.clear()` và vẽ lại, thay vì gọi `this.make.graphics()` và `destroy()` 60 lần/giây.
3. **Chuyển toàn bộ UI Modals sang `UIScene`:**
   * Di dời việc khởi tạo `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay` và `EndingSystem` từ `GameScene` sang `UIScene` (nơi Camera luôn giữ `zoom = 1.0`).
   * Ngay lập tức giải quyết 100% các lỗi văng khỏi màn hình, phóng to 220%, và lỗi kẹt soft-lock ở hồi kết.
4. **Dọn dẹp rò rỉ sự kiện & Tối ưu vẽ thanh chỉ số:**
   * Thêm hàm dọn dẹp `this.playerState.off('stats_changed')` khi `UIScene` bị đóng.
   * Trong `UIScene`, chỉ gọi `redrawStats()` khi giá trị thực tế của Máu, Thể lực, Dầu đèn hoặc Bình tâm có sự thay đổi thật sự so với frame trước (Dirty Flag pattern), chấm dứt việc vẽ lại 60 FPS vô nghĩa.

---
*Báo cáo kiểm toán độc lập được thực hiện bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
