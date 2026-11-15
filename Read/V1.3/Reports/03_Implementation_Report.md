# HOLLOW WOODS V1.3 — BÁO CÁO THỰC THI & NGHIỆM THU KỸ THUẬT
## TỔNG HỢP NÂNG CẤP HỆ THỐNG V1.3: CHUYỂN CẢNH, HIỂN THỊ, QUY TRÌNH TỬ VONG & GAME OVER

- **Dự án:** HOLLOW WOODS (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phiên bản:** **V1.3**
- **Thư mục dự án:** `G:\HOLLOW WOODS`
- **Engine:** Phaser 3 (Arcade Physics, Pixel Art Mode)
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái kiểm thử:**
  + `scripts/verify_hiding_unstuck_c4_13_01.mjs`: **18/18 PASS (100%)**
  + `scripts/verify_deep_forest_visibility_c4_13_02.mjs`: **18/18 PASS (100%)**
  + `scripts/verify_death_and_game_over_c4_13_03.mjs`: **26/26 PASS (100%)**
- **Trạng thái biên dịch TypeScript:** **0 lỗi (`npx tsc --noEmit` mã thoát 0)**

---

# PHẦN 1: BƯỚC C4-13-02 — ĐỒNG BỘ CHUYỂN CẢNH, HIỂN THỊ NHÂN VẬT & TÁN CÂY TRONG SUỐT RỪNG SÂU

## 1. Mục Tiêu & Bối Cảnh Thực Hiện
Khắc phục triệt để hiện tượng mất dấu nhân vật, tán cây/đường mòn che kín màn hình, camera bị lag khi tiến vào phân khu Rừng Sâu (Deep Forest).

## 2. Phân Tích Nguyên Nhân Gốc Rễ
1. **Rừng Sâu có tọa độ Y âm (`-640..0`):** Điểm spawn `(2080, -80)` nằm ngay phía sau hàng cây viền Nam (`y = -35`), depth `-35 > -80` khiến tán cây che lấp nhân vật.
2. **Lối mòn `drawTrail` vẽ bằng các vòng tròn đặc `ctx.arc()` dập mỗi 4px với bán kính 40-48px màu nâu:** Tạo ra các đường ống gồ ghề trông giống cành cây khổng lồ vắt ngang màn hình.
3. **Camera thiếu phương thức căn giữa tức thời `centerOn()`:** Dẫn đến độ trễ khi chuyển sang vùng có độ dời tọa độ lớn.
4. **Collider rỗng trên barrier hiển thị khung debug:** Đối tượng tạo bằng `colliderGroup.create(..., undefined)` nhận texture mặc định của Phaser nếu chưa gọi `.setVisible(false)`.

## 3. Các Giải Pháp Kỹ Thuật Đã Triển Khai
1. **Tán Cây Trong Suốt Động (Dynamic Canopy Transparency):**
   - Đăng ký mọi cây xanh, cây khô và cây rỗng vào `treeCanopyGroup`.
   - Giảm độ đậm xuống `alpha = 0.35` khi nhân vật đứng bên dưới, khôi phục `alpha = 1.0` khi bước ra.
   - Chuẩn hóa tỷ lệ cây khô `SPRITE_TREE_DEAD` về `1.05x`.
2. **Căn Giữa Camera Tức Thời & Đồng Bộ Bounds:**
   - Thêm `centerOn(x, y)` trong [CameraSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/camera/CameraSystem.ts).
   - Reset Arcade Physics body ngay tại điểm spawn đích và bảo vệ quyền hiển thị tuyệt đối của nhân vật.
3. **Tái Thiết Kế Lối Mòn Rừng Sâu Hữu Cơ:**
   - Dùng giải thuật lấy mẫu 2px với độ lượn sóng tự nhiên, bảng màu đất mùn sẫm màu và bán kính `r = 10..13 px`.
4. **Dọn dẹp collider rỗng:** Gọi `.setVisible(false)` cho barrier Cổng Đông và Đền Chuông Vỡ.

---

# PHẦN 2: BƯỚC C4-13-03 — XÂY DỰNG LẠI QUY TRÌNH XỬ LÝ NHÂN VẬT TỬ VONG & GIAO DIỆN GAME OVER

## 1. Mục Tiêu & Bối Cảnh Thực Hiện
Trước khi thực hiện bước C4-13-03, khi nhân vật bị quái vật tấn công cạn Sinh Lực (Health về 0) hoặc chịu ảnh hưởng của sương mù độc:
- Màn chơi **không hề kết thúc**, không xuất hiện bất kỳ giao diện Game Over nào.
- Nhân vật chỉ nằm xuống nhưng các phím chức năng mở hòm đồ [I], sổ tay [J], tạm dừng [ESC], uống thuốc [1], nạp dầu [2] vẫn nhận tín hiệu và có thể mở đè lên.
- Quái vật The Listener và các thực thể AI xung quanh vẫn tiếp tục tìm đường, lao tới và tấn công/đẩy văng nhân vật đã gục ngã.
- Người chơi không có lựa chọn nào để nạp lại điểm lưu (Load Checkpoint), chơi lại (Restart) hay quay về Menu chính.

## 2. Phân Tích Nguyên Nhân Gốc Rễ (Root Cause Analysis)

| Vấn đề phát hiện | Nguyên nhân kỹ thuật gốc rễ | Tệp liên quan |
| :--- | :--- | :--- |
| **Không có giao diện Game Over** | Toàn bộ dự án chưa từng được xây dựng lớp giao diện `GameOverModal`. Khi `health <= 0`, không có sự kiện điều phối nào hiển thị bảng kết thúc màn chơi. | [UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts)<br>[GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) |
| **Không có bộ lắng nghe tử vong tập trung** | `SurvivalSystem` cập nhật chỉ số nhưng không kiểm tra `health <= 0` để phát tín hiệu tử vong. `GameScene` chỉ gọi `die()` cục bộ trong một nhánh overlap của `listenerMonster`. | [SurvivalSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/SurvivalSystem.ts)<br>[GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) |
| **AI tiếp tục truy đuổi nhân vật đã ngã** | `TheListener` và `ListenerAI` không kiểm tra cờ tử vong của người chơi (`player.isDead()`), tiếp tục chạy logic `CHASE` và áp sát. | [ListenerAI.ts](file:///G:/HOLLOW%20WOODS/src/systems/ListenerAI.ts)<br>[TheListener.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheListener.ts) |
| **Không khóa phím tắt khi đã tử vong** | Các hàm `isPauseRequested()`, `isCraftingRequested()`, `isJournalRequested()`... trong `SatyrPlayer` không kiểm tra `this._isDead`. Khi mở UI thì `playIdle()` bị gọi đè làm mất thế ngã của nhân vật. | [SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts)<br>[UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts) |
| **Hoạt ảnh tử vong thiếu chốt dừng ở frame cuối** | Hoạt ảnh `wayfarer_death` phát xong không có bộ lắng nghe đóng băng frame, có nguy cơ bị các lệnh animation khác ghi đè. | [SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts) |

---

## 3. Các Giải Pháp Kỹ Thuật Đã Triển Khai (C4-13-03)

### 3.1. Xây dựng Giao diện Game Over Gothic Chuẩn HD ([GameOverModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/GameOverModal.ts))
- Tạo mới tệp [GameOverModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/GameOverModal.ts) với phong cách u ám đồng bộ HOLLOW WOODS:
  + Kích thước 520×400 px, hiển thị tại UIScene với depth 9900 (Screen Space, Zoom 1.0).
  + Lớp phủ đen u ám `0x060202` (alpha 0.88), ngăn chặn hoàn toàn click chuột xuyên thấu.
  + Hộp thoại đen ánh sương đỏ `0x0d0708` với viền đỏ thẫm `0x8b0000` và viền trong đồng cổ `0x5a2d22`.
  + Tiêu đề: **GỤC NGÃ TRONG SƯƠNG ĐẶC** đỏ rực kèm dòng nguyên nhân tử vong hiển thị động.
  + Nhận diện trạng thái Save: hiển thị rõ điểm lưu gần nhất có sẵn hay không.
- Tích hợp 3 nút chức năng tương tác đầy đủ:
  1. `[↺ NẠP ĐIỂM LƯU GẦN NHẤT (LOAD CHECKPOINT)]` (`#3498db`): Khôi phục vị trí lưu, hồi sinh lực $\ge 50\%$, mở khóa điều khiển, đưa AI về vị trí tuần tra gốc.
  2. `[🔄 CHƠI LẠI TỪ ĐẦU (RESTART)]` (`#e67e22`): Làm sạch trạng thái PlayerState, dừng toàn bộ âm thanh và khởi động lại game sạch sẽ.
  3. `[🏠 VỀ MÀN HÌNH CHÍNH (MAIN MENU)]` (`#95a5a6`): Dừng âm thanh và chuyển về `MainMenuScene`.

### 3.2. Quản lý Trạng Thái Gục Ngã (Death State) trong [SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts)
- Nâng cấp phương thức `die()`:
  + Gán `this._isDead = true;` và giải phóng toàn bộ cờ hành động khác.
  + Triệt tiêu hoàn toàn vận tốc vật lý `(this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);`.
  + Phát hoạt ảnh gục ngã định hướng (`wayfarer_death_${this.facing}` hoặc `satyr_death_${this.facing}`).
  + Lắng nghe sự kiện `ANIMATION_COMPLETE` để gọi `this.anims.pause()`, giữ cố định nhân vật ở frame ngã cuối cùng, tuyệt đối không lặp lại và không chuyển về Idle.
  + Khóa toàn bộ các thao tác phím tắt: `consumeAction()`, `isPauseRequested()`, `isCraftingRequested()`, `isJournalRequested()`, `isPoulticeRequested()`, `isOilRequested()`, `isLureRequested()`, `isMuteRequested()` đều lập tức trả về `false` khi `this._isDead = true`.
- Bổ sung phương thức `respawn(x, y)`:
  + Giải phóng `this._isDead = false`, khôi phục vận tốc, làm mới vị trí `(x, y)`, đưa nhân vật về `playIdle()` và mở khóa toàn diện.

### 3.3. Dừng AI Truy Đuổi & Đóng Băng Tương Tác ([ListenerAI.ts](file:///G:/HOLLOW%20WOODS/src/systems/ListenerAI.ts) & [TheListener.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheListener.ts))
- Bổ sung phương thức `resetToPatrol(initialX?, initialY?)` trong `ListenerAI` và `TheListener`:
  + Chuyển trạng thái AI về `'PATROL'`.
  + Tắt biểu tượng cảnh báo mắt đỏ/chấm than (`setAlertVisual(false)`).
  + Triệt tiêu hoàn toàn vận tốc rượt đuổi (`setVelocity(0, 0)`).
  + Đưa quái vật về waypoint tuần tra đầu tiên.
- Trong `ListenerAI.update()`: Nhận tham số `isPlayerDead`; nếu người chơi đã tử vong, lập tức dừng rượt đuổi, ngắt truy vết và đứng yên tại chỗ.

### 3.4. Báo Động Sinh Tồn & Cạn Kiệt Sinh Lực ([SurvivalSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/SurvivalSystem.ts))
- Thêm cơ chế cắn rỉa sinh lực khi Bình tâm (Composure) về 0 trong màn sương mù dày đặc không có đèn: `stats.health = Math.max(0, stats.health - 2.5 * dt)`.
- Khi `stats.health <= 0`: Đặt `stats.health = 0` và phát sự kiện toàn cục `this.playerState.emit('player_health_depleted')`.

### 3.5. Điều Phối Chu Trình Game Over trong [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) & [UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts)
- Bổ sung phương thức `triggerPlayerDeath(reason?: string)`:
  + Đặt cờ `isGameOverPending = true`.
  + Gọi `player.die()`, triệt tiêu vận tốc.
  + Đưa `listenerMonster` về `resetToPatrol()` và tắt nhịp tim hồi hộp.
  + Phát hiệu ứng rung màn hình giật mạnh (`shake 350ms, 0.018`), chớp đỏ (`flash 300ms`), âm thanh tổn thương (`audioManager.playHurt()`).
  + Đóng tất cả hộp thoại, modal chế tạo, sổ tay, và xóa bong bóng tương tác.
  + Sau 800ms (khi hoạt ảnh ngã hoàn tất), kích hoạt `uiScene.showGameOverModal(reason)`.
- Bổ sung các phương thức điều phối: `handleLoadCheckpoint()`, `handleRestartGame()`, `handleReturnToMainMenu()`.
- Trong `GameScene.update()`: Đặt chốt an toàn ở đầu hàm, nếu `player.isDead()` hoặc `isGameOverPending` thì khóa toàn bộ cập nhật game; nếu `health <= 0` thì kích hoạt ngay `triggerPlayerDeath()`.
- Trong `UIScene.ts`:
  + Đăng ký `gameOverModal` vào `isAnyModalOpen` để chặn hoàn toàn phím số [1], [2], [Q], [F], [I], [J], [ESC] khi bảng Game Over đang mở.
  + Bổ sung `showGameOverModal()` và `closeGameOverModal()`.

---

## 4. KẾT QUẢ KIỂM ĐỊNH CHẤT LƯỢNG (QA / QC)

### 4.1. Bộ Kiểm Tra Tự Động C4-13-03 (`scripts/verify_death_and_game_over_c4_13_03.mjs`)
```
================================================================
QA / QC VERIFICATION SUITE — COMMAND C4-13-03
QUY TRÌNH NHÂN VẬT GỤC NGÃ, DỪNG AI TRUY ĐUỔI & GIAO DIỆN GAME OVER
================================================================

--- 1. KIỂM TRA GAMEOVERMODAL.TS ---
  [PASS] #1: Tệp GameOverModal.ts tồn tại trong src/ui/
  [PASS] #2: GameOverModal được định nghĩa và export chuẩn xác
  [PASS] #3: GameOverModal định nghĩa đủ 3 callback: onLoadCheckpoint, onRestart, onMainMenu
  [PASS] #4: GameOverModal có tiêu đề phong cách Dark Woodland "GỤC NGÃ TRONG SƯƠNG ĐẶC"
  [PASS] #5: GameOverModal sử dụng bảng màu u ám đồng bộ HOLLOW WOODS (đỏ thẫm 0x8b0000 & nền đen sương 0x0d0708)
  [PASS] #6: GameOverModal có đầy đủ phương thức open(reason) và close()

--- 2. KIỂM TRA SATYRPLAYER.TS ---
  [PASS] #7: die() thiết lập cờ tử vong _isDead = true
  [PASS] #8: die() lắng nghe ANIMATION_COMPLETE và tạm dừng tại frame cuối cùng (không lặp lại)
  [PASS] #9: SatyrPlayer có phương thức respawn(x, y) để hồi sinh
  [PASS] #10: respawn() giải phóng cờ _isDead và đưa nhân vật về trạng thái Idle
  [PASS] #11: Các phương thức phím tắt (isPauseRequested, isCraftingRequested, ...) khóa tuyệt đối khi nhân vật đã tử vong

--- 3. KIỂM TRA SURVIVALSYSTEM.TS ---
  [PASS] #12: SurvivalSystem phát sự kiện player_health_depleted khi health <= 0
  [PASS] #13: SurvivalSystem trừ máu khi bình tâm cạn kiệt trong sương tối

--- 4. KIỂM TRA LISTENERAI.TS & THELISTENER.TS ---
  [PASS] #14: ListenerAI có phương thức resetToPatrol() đưa AI về tuần tra gốc
  [PASS] #15: ListenerAI update() dừng truy đuổi và triệt tiêu vận tốc khi người chơi tử vong
  [PASS] #16: TheListener chuyển tiếp phương thức resetToPatrol()

--- 5. KIỂM TRA UISCENE.TS ---
  [PASS] #17: UIScene có thuộc tính gameOverModal
  [PASS] #18: isAnyModalOpen bao hàm trạng thái mở của gameOverModal
  [PASS] #19: UIScene có phương thức showGameOverModal()
  [PASS] #20: UIScene có phương thức closeGameOverModal()

--- 6. KIỂM TRA GAMESCENE.TS ---
  [PASS] #21: GameScene có phương thức triggerPlayerDeath()
  [PASS] #22: GameScene có phương thức handleLoadCheckpoint()
  [PASS] #23: GameScene có phương thức handleRestartGame()
  [PASS] #24: GameScene có phương thức handleReturnToMainMenu()
  [PASS] #25: GameScene lắng nghe sự kiện cạn kiệt sinh lực player_health_depleted
  [PASS] #26: Va chạm giữa monster và player kích hoạt triggerPlayerDeath khi máu về 0

================================================================
KẾT QUẢ KIỂM TRA C4-13-03: 26/26 TIÊU CHÍ ĐẠT (100%)
STATUS: ALL DEATH & GAME OVER CHECKS PASSED (100% HOÀN TẤT C4-13-03)
================================================================
```

### 4.2. Kiểm Tra Biên Dịch Mã Nguồn
- Lệnh thực thi: `npx tsc --noEmit`
- Kết quả: **Mã thoát 0 (0 lỗi biên dịch, TypeScript hoàn toàn sạch)**.

---

## 5. HẠNG MỤC C4-13-04: SỬA LỖI HIỂN THỊ ĐÈN, TỐI ƯU BẬT/TẮT [F] & ĐỒNG BỘ VUNG GẬY

### 5.1. Bối Cảnh & Nguyên Nhân Gốc (Root Cause)
1. **Khối đèn hình vuông màu nâu trôi nổi phía trước nhân vật:**
   - Trong `SatyrPlayer.ts` (`updateLanternVisual`), khi đèn tắt (`!isLit`), mã nguồn cũ dùng Phaser Graphics vẽ khối hộp giả lập "kính bồ hóng" 5×6 px (`0x352317`, `0x1a1512`, `0x241a14`).
   - Kết hợp với `LANTERN_OFFSET_DOWN` trong `Constants.ts` bị định nghĩa lệch sang `{ x: 13, y: -20 }` (trong khi bàn tay cầm gậy của nhân vật ở bên trái `x = -5`), làm xuất hiện một khối màu nâu tách rời trôi nổi trong không trung cách nhân vật 18 pixel.
2. **Quầng sáng hổ phách bị lệch sang mép trái màn hình trong sương mù:**
   - Trong `GameScene.ts` (`updateFogOfWar`), phép tính tọa độ màn hình cũ sử dụng `(lightWorldX - cam.worldView.x) * cam.zoom`.
   - Thuộc tính `cam.worldView` trong Phaser 3 chỉ được cập nhật trong bước tiền dựng hình (`Camera.preRender()`), dẫn tới việc tọa độ màn hình giữ giá trị cũ (stale) trong quá trình `scene.update()`, đặc biệt khi camera bị giới hạn biên (`useBounds = true`).
3. **Hiện tượng giật nấc / nhấp nháy khi bấm [F] liên tục:**
   - Bán kính ánh sáng chuyển đột ngột giữa 45px và 120px mà không có bộ suy giảm (lerp).
   - Chưa có cơ chế chống dội phím (debounce) khi người chơi bấm phím [F] dồn dập.

### 5.2. Các Giải Pháp Đã Triển Khai
1. **Chuẩn hóa tọa độ gắn đèn trong [Constants.ts](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts):**
   - Trích xuất pixel art trực tiếp từ bộ sprite sheets Wayfarer:
     + `LANTERN_OFFSET_DOWN`: `{ x: -5, y: -16 }`
     + `LANTERN_OFFSET_UP`: `{ x: 13, y: -19 }`
     + `LANTERN_OFFSET_LEFT`: `{ x: -9, y: -16 }`
     + `LANTERN_OFFSET_RIGHT`: `{ x: 9, y: -16 }`
2. **Tối ưu hiển thị đèn lồng trong [SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts):**
   - Khi đèn tắt (`!isLit`): Ngay lập tức gọi `this.lanternOverlayGfx.clear()` và `return;`, loại bỏ 100% việc vẽ khối hộp nâu giả lập.
   - Khi đèn bật (`isLit`): Vẽ quầng sáng hổ phách dịu nhẹ 9px và đốm lửa sống động ngay tại `(lx, ly)`.
   - Sắp xếp độ sâu: `depth - 1` khi nhìn UP (bị thân người che khuất), `depth + 1` khi nhìn DOWN/LEFT/RIGHT.
   - Thêm bộ chống dội phím 180ms trong `toggleLantern()`.
   - Bổ sung bảng tọa độ `ATTACK_LANTERN_OFFSETS` cho 6 frame của hoạt ảnh tấn công vung gậy gỗ ở cả 4 hướng.
3. **Khắc phục lỗi chiếu tọa độ sương mù trong [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts):**
   - Sử dụng công thức chiếu toán học trực tiếp qua `cam.scrollX` và `cam.zoom`:
     `screenX = Math.round(cam.width * 0.5 + (lightWorldX - (cam.scrollX + cam.width * 0.5)) * cam.zoom)`
     `screenY = Math.round(cam.height * 0.5 + (lightWorldY - (cam.scrollY + cam.height * 0.5)) * cam.zoom)`
   - Chuyển đổi bán kính mượt mà bằng `Phaser.Math.Linear(this.currentLanternRadius, targetBaseRadius, 0.18)`.
   - Quầng sáng hổ phách `lanternGlowGfx` được thu gọn tỉ lệ hài hòa (`0.55` và `0.85`), triệt tiêu hoàn toàn hiện tượng quầng sáng cam khổng lồ chèn kín màn hình.

### 5.3. Kết Quả Kiểm Định Chất Lượng C4-13-04 (`scripts/verify_lantern_and_attack_sync_c4_13_04.mjs`)
```
=== VERIFICATION C4-13-04: LANTERN DISPLAY, ATTACK SYNC & [F] OPTIMIZATION ===

1. Checking Constants.ts...
  [PASS] LANTERN_OFFSET_DOWN is aligned with pixel art at { x: -5, y: -16 }
  [PASS] LANTERN_OFFSET_UP is aligned with pixel art at { x: 13, y: -19 }
  [PASS] LANTERN_OFFSET_LEFT is aligned with pixel art at { x: -9, y: -16 }
  [PASS] LANTERN_OFFSET_RIGHT is aligned with pixel art at { x: 9, y: -16 }

2. Checking SatyrPlayer.ts...
  [PASS] Detached brown box (soot glass 0x352317) completely removed from lantern visuals
  [PASS] When lantern is off (!isLit), lanternOverlayGfx immediately clears and returns
  [PASS] Depth sorting properly configured (depth - 1 for UP, depth + 1 for DOWN/LEFT/RIGHT)
  [PASS] ATTACK_LANTERN_OFFSETS table contains 6 exact per-frame trajectory coordinates for all 4 directions
  [PASS] AnimationFrame index converted from Phaser 1-based index to 0-based frameIdx
  [PASS] toggleLantern() includes 180ms debounce preventing rapid keystroke lag and light flicker
  [PASS] getLanternWorldPosition covers all states: attack, walk, run, gather, interact, hurt, death, idle

3. Checking GameScene.ts...
  [PASS] GameScene maintains currentLanternRadius state property
  [PASS] updateFogOfWar performs smooth radius lerp (factor 0.18) between DIM and NORMAL radii
  [PASS] Mathematical projection from world to screen uses cam.scrollX and cam.zoom directly
  [PASS] Single unified light mask cached on GPU reused without reallocating objects
  [PASS] lanternGlowGfx warm ambient glow scaled smoothly with glowFactor and balanced radii

4. Checking VeilSystem.ts & UIScene.ts sync...
  [PASS] VeilSystem adapts fog density smoothly when isLanternOn changes
  [PASS] UIScene HUD displays exact state-synced label and badge for [F] toggle

======================================================
TOTAL TESTS: 18 | PASSED: 18 | FAILED: 0
======================================================
```

---

## 6. KẾT LUẬN & TRẠNG THÁI BÀN GIAO V1.3
Các hạng mục của **`C4-13-01`**, **`C4-13-02`**, **`C4-13-03`** và **`C4-13-04`** đã được triển khai, kiểm thử và nghiệm thu thành công 100%:
1. Cơ chế ẩn nấp và thoát kẹt hai chiều mượt mà, gỡ kẹt AABB tự động.
2. Không còn hiện tượng mất hiển thị nhân vật trong Rừng Sâu; tán cây tự động trong suốt khi đứng dưới bóng.
3. Quy trình gục ngã (Death State) giữ yên frame cuối, dừng AI truy đuổi và kích hoạt giao diện Game Over Dark Woodland mượt mà.
4. Xóa bỏ hoàn toàn khối hộp vuông màu nâu trôi nổi; đèn lồng, quầng sáng và hoạt ảnh vung gậy đồng bộ 100% chuẩn pixel art; phím [F] bật/tắt êm ái không giật lag.
5. Biên dịch `npx tsc --noEmit` đạt mã thoát 0 (0 lỗi); đóng gói Vite `npm run build` xuất bản thành công.
