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

## 7. BÁO CÁO THỰC THI BƯỚC C4-13-16: BỔ SUNG CẢNH QUAN KỂ CHUYỆN CHẶN LỐI QUAY LẠI Ở RÌA PHÍA TÂY ĐẦU MÀN CHƠI

### 7.1. Bối Cảnh & Vấn Đề Cần Giải Quyết
- **Hiện tượng trước khi sửa:**
  - Tại khu vực khởi đầu game (`fog_crossing` - Lối Mòn Xuyên Sương), người chơi xuất phát tại tọa độ `(80, 180)` và quay mặt về hướng Đông.
  - Tuy nhiên, nếu người chơi rẽ trái đi ngược về hướng Tây (`x: 0..90`), con đường mòn đất bị cắt cụt đột ngột vào khoảng không gian nền đen vô định ở rìa bản đồ.
  - Vị trí này chỉ có một bức tường vô hình đơn điệu (`bound_left` tại `x: 0..20`), hoàn toàn thiếu rào cản cảnh quan tự nhiên và không có bất kỳ phản hồi suy nghĩ kể chuyện nào từ nhân vật để giải thích tại sao không thể quay trở lại con đường cũ.
- **Mục tiêu hoàn thiện:**
  1. Dựng rào chắn môi trường tự nhiên dày đặc tại rìa phía Tây (`x: 0..90`) gồm thân cây cổ thụ đổ chắn ngang đường, hàng rào gỗ gãy nát, bụi rậm ken chặt và các lớp sương mù đa tầng cuộn trào che phủ hoàn toàn mép đen của bản đồ.
  2. Bổ sung hộp va chạm vật lý chặn nhân vật đi ngược kịch về phía Tây kèm thông điệp suy nghĩ kể chuyện có thời gian chờ (cooldown 6 giây): *"Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa."*

### 7.2. Chi Tiết Triển Khai Kỹ Thuật

#### A. Dựng Cụm Cảnh Quan & Xóa Mép Cắt Cụt ([src/world/WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts))
1. **Gradient sương đen sâu thẳm che mép bản đồ (`renderFogCrossingTerrain`):**
   - Phủ một dải gradient chuyển tiếp mượt mà từ `rgba(8, 12, 10, 0.98)` tại `x = 0` sang trong suốt tại `x = 80`.
   - Làm chìm hoàn toàn phần đuôi con đường vào bóng tối huyền bí trước khi chạm mép tọa độ thế giới, triệt tiêu 100% cảm giác đường bị "cắt cụt".
2. **Cụm cảnh quan rào chắn tự nhiên (`createWestBarrierLandscape`):**
   - **Thân cây cổ thụ đổ chắn ngang đường:** Đặt tại `barrierX = 48, roadCenterY = 184`, trải dài từ `y = 138` đến `y = 232` với bóng đổ mềm, rễ cây cổ thụ xoắn xít vươn dài về phía Tây (`0x28180d`), vỏ và lõi gỗ sẫm màu có vết nứt gãy tự nhiên (`0x2d1a0e`, `0x1a0f08`), mảng rêu nhung xanh sẫm (`0x2e6b30`, `0x438a45`, `0x66bb6a`) và các cụm nấm sò rừng màu vàng cam (`0xd35400`, `0xf39c12`).
   - **Hàng rào gỗ gãy nát (Broken Fence):** Bố trí 3 cọc gỗ xiêu vẹo (`0x3a2414`, `0x563b25`), đầu cọc gãy nhọn và các thanh xà ngang gãy chéo đâm xuống đất, mô tả vết tích của ranh giới cũ đã bị thiên nhiên và thời gian phá hủy.
   - **Bụi rậm rậm rạp (Dense bushes):** Cụm 6 bụi rậm Pixel Art sắc nét (`SPRITE_BUSH_DENSE_1` & `SPRITE_BUSH_DENSE_2`) bám chặt quanh thân cây và hàng rào tại các tọa độ `(24, 165)`, `(56, 148)`, `(62, 172)`, `(58, 198)`, `(42, 224)`, `(20, 208)`.
   - **Hai cây khô đại thụ kẹp lối đi:** `createHollowTree(32, 135)` và `createHollowTree(28, 235)` tạo khung vòm tự nhiên uy nghi, u tối.
   - **Sương mù đa tầng cuộn trào:** Tận dụng texture `SPRITE_FOG_SMOOTH` với 3 tầng sương nền (depth `-60`, alpha `0.75..0.82`, tint sẫm `0x2e3d37`) và 2 tầng sương nổi (depth `260`, alpha `0.60..0.65`) lững lờ trôi trước thân cây bằng chuyển động Tween Sine vô tận (`yoyo: true`).
   - **Hộp va chạm Arcade Static Body:** Đăng ký trực tiếp vào `this.colliderGroup` tại `(48, 184)` kích thước `30×120` px, chặn đứng nhân vật tại `x ~ 65..71`.

#### B. Cơ Chế Va Chạm & Suy Nghĩ Kể Chuyện ([src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))
1. **Biến theo dõi thời gian Cooldown:**
   - Khai báo thuộc tính `private lastWestBarrierThoughtTime: number = 0;`.
2. **Kiểm tra va chạm tự động trong vòng lặp `update()`:**
   - Khi `this.currentZoneId === 'fog_crossing'` và nhân vật đi ngược kịch về phía Tây (`foot.x <= 75 && foot.y >= 120 && foot.y <= 248`), hàm tự động kích hoạt `this.triggerWestBarrierThought(false)`.
3. **Tương tác thủ công bằng phím [E] (`executeMapInteraction`):**
   - Đăng ký `actionId === 'inspect_west_barrier'`. Khi người chơi đứng gần rào chắn và nhấn phím [E], game gọi `this.triggerWestBarrierThought(true)`.
4. **Hàm xử lý suy nghĩ kể chuyện (`triggerWestBarrierThought`):**
   - Áp dụng kiểm tra giãn cách 6.000ms (`6 giây`) khi va chạm để tránh hiện tượng chữ nhấp nháy spam liên tục.
   - Hiển thị thông điệp qua `this.uiScene.showPopupMessage`:
     `"Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa."`

#### C. Bổ Sung Dữ Liệu Phân Khu ([src/data/zones.json](file:///G:/HOLLOW%20WOODS/src/data/zones.json))
- Bổ sung định nghĩa collider `fog_west_barrier` (`x: 36, y: 120, width: 28, height: 130, boundary, isSolid: true`).
- Bổ sung vật thể tương tác `fog_west_barrier` (`clue`, prompt: `"Nhấn [E] kiểm tra Lối Mòn Phía Sau"`, action: `"inspect_west_barrier"`).

---

### 7.3. Kết Quả Kiểm Định Chất Lượng C4-13-16 ([scripts/verify_west_barrier_narrative_c4_13_16.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_west_barrier_narrative_c4_13_16.mjs))
```text
=== BẮT ĐẦU KIỂM TOÁN TỰ ĐỘNG BƯỚC C4-13-16: RÀO CHẮN KỂ CHUYỆN RÌA PHÍA TÂY ===

[PASS] Tập tin src/data/zones.json tồn tại trên đĩa
[PASS] Phân khu fog_crossing (Lối Mòn Xuyên Sương) tồn tại trong zones.json
[PASS] fog_crossing có collider rào chắn phía Tây fog_west_barrier (x: 36, y: 120, width: 28, height: 130, boundary, solid)
[PASS] fog_crossing có tương tác rào chắn inspect_west_barrier với gợi ý [E] kiểm tra
[PASS] Tập tin src/world/WorldBuilder.ts tồn tại trên đĩa
[PASS] WorldBuilder.ts có phương thức createWestBarrierLandscape() dựng cảnh quan rào chắn
[PASS] renderDecorations gọi createWestBarrierLandscape() khi vẽ phân khu fog_crossing
[PASS] Cụm cảnh quan rào chắn có thân cây cổ thụ đổ chắn ngang đường với rễ xoắn, rêu xanh và nấm rừng
[PASS] Cụm cảnh quan rào chắn có hàng rào gỗ gãy với cọc xiêu vẹo và thanh ngang gãy vỡ
[PASS] Cụm cảnh quan có các bụi rậm dày đặc (dense bushes) che kín ranh giới
[PASS] Cụm cảnh quan có các lớp sương mù đa tầng cuộn trào che kín mép đen của bản đồ
[PASS] renderFogCrossingTerrain phủ gradient sương đen sâu thẳm che lấp mép cắt cụt ở rìa Tây
[PASS] Tập tin src/scenes/GameScene.ts tồn tại trên đĩa
[PASS] GameScene.ts có biến lastWestBarrierThoughtTime quản lý thời gian cooldown
[PASS] GameScene.ts có phương thức triggerWestBarrierThought() xử lý thông điệp suy nghĩ kể chuyện
[PASS] Nội dung câu suy nghĩ chuẩn xác: "Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa."
[PASS] executeMapInteraction xử lý hành động inspect_west_barrier khi người chơi nhấn [E]
[PASS] update() kiểm tra va chạm nhân vật đi ngược kịch về rào chắn phía Tây (x <= 75, y: 120..248)
[PASS] Lần đầu chạm rào chắn: Kích hoạt hiển thị suy nghĩ thành công
[PASS] Sau 2 giây chạm tiếp: Cooldown 6s chặn thành công (không spam lặp lại)
[PASS] Sau khi hết cooldown 6 giây: Kích hoạt hiển thị suy nghĩ lần 2 thành công
[PASS] Nhấn phím [E] thủ công: Cho phép phản hồi kể chuyện cho người chơi

======================================================
KẾT QUẢ KIỂM TOÁN C4-13-16: 22/22 TIÊU CHÍ ĐẠT (100%)
>>> TẤT CẢ TIÊU CHÍ RÀO CHẮN KỂ CHUYỆN PHÍA TÂY ĐỀU ĐẠT CHUẨN 100%! <<<
```

---

## 8. BÁO CÁO THỰC THI BƯỚC C4-13-17: CHUẨN HÓA TOÀN BỘ HỘP VA CHẠM CÔNG TRÌNH, ĐẠO CỤ VÀ THỨ TỰ LỚP HIỂN THỊ Y-SORTING TRONG LÀNG BELLHOLLOW

### 8.1. Bối Cảnh & Vấn Đề Cần Giải Quyết
- **Hiện tượng trước khi sửa:**
  - Hộp va chạm tĩnh (Static Collider) của các công trình kiến trúc trong làng Bellhollow (nhà Edda, nhà Neris, nhà dân Tây-Nam, Tháp Chuông, Xưởng Chế Tạo & Lò Rèn) chỉ được đặt nông ở đáy (cao ~20..24 px), để hở toàn bộ phần mái nhà và thân tường phía trên.
  - Người chơi khi di chuyển từ phía Bắc hoặc hai bên sườn có thể đi xuyên qua mái nhà hoặc đi lọt vào bên trong ruột công trình.
  - Các đạo cụ quan trọng trong làng (biển chỉ đường `signpost`, 2 kệ bàn thảo dược của Neris `apothecary_tables`, cụm thùng gỗ/củi `village_prop_cluster`, cột đèn lồng `village_lantern_post`) hoàn toàn thiếu hộp va chạm chân, khiến nhân vật đi xuyên qua như bóng ma.
  - Các NPC trong làng (Garth, Edda, Neris, Bram, Finn) chưa có hộp va chạm vật lý, người chơi có thể đi chồng khít lên thân NPC.
- **Mục tiêu hoàn thiện:**
  1. Chuẩn hóa hộp va chạm bao phủ trọn vẹn thân tường và chân công trình cho toàn bộ nhà dân, Tháp Chuông, Xưởng Chế Tạo; bổ sung va chạm chân cho biển chỉ đường, giếng làng, kệ bàn thuốc Neris, cụm thùng gỗ và cột đèn.
  2. Chuẩn hóa độ sâu hiển thị (Y-Sorting / Depth) theo tọa độ chân tiếp đất thực tế (`ground base Y`) thay vì tâm ảnh, đảm bảo khi nhân vật đứng trước công trình thì hiện đằng trước, còn khi đi vòng ra phía sau thì bị mái nhà che khuất tự nhiên.
  3. Bổ sung hộp va chạm chân nhỏ gọn (`22x14` px, `immovable`) cho cả 5 NPC, đồng bộ theo lộ trình tuần tra và thiết lập `this.physics.add.collider(this.player, this.npcs)` trong `GameScene.ts`.

### 8.2. Chi Tiết Triển Khai Kỹ Thuật

#### A. Chuẩn Hóa Va Chạm & Độ Sâu Công Trình Làng ([src/world/WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts))
1. **Các ngôi nhà dân (`createBuilding` - Nhà Edda & Nhà Neris):**
   - Hộp va chạm mở rộng bao phủ toàn bộ thân tường: `colW = w - 6` (106 px), `colH = Math.max(h - 6, 42)` (42 px), đặt tại `(x + w / 2, y + h - colH / 2)`.
   - Giữ nguyên độ sâu Y-sorting tại chân móng `y + h`. Nhân vật đi vòng phía sau (`y < y + h - colH`) được mái nhà che tự nhiên nhưng không thể đi lọt vào trong tường.
2. **Tháp Chuông (`createBellTower`):**
   - Hộp va chạm bệ đá và thân tháp mở rộng: `colW = w - 8` (72 px), `colH = Math.max(h - 4, 54)` (54 px).
   - Ngăn chặn hoàn toàn việc đi xuyên vào chân tháp hoặc trục tháp từ phía sau. Độ sâu chuẩn hóa: `y + h` (310).
3. **Xưởng Chế Tạo & Kho Củi (`createCraftingWorkshopPavilion` & `createCraftingBench`):**
   - Xưởng rèn & kho củi: Hộp va chạm `88x40` px bao trùm toàn bộ mái ngói và vách hậu chứa củi (`y: 318..358`), ngăn chặn việc đi xuyên lên mái từ phía Bắc. Độ sâu chuẩn hóa: `y + 42` (360).
   - Bàn Chế Tạo: Hộp va chạm chân bàn `52x16` px đặt tại `(978, 370)` khép kín với xưởng rèn. Độ sâu chuẩn hóa: `y + 18` (378). Người chơi tiếp cận thoải mái từ phía Nam (`y ~ 380..395`) để nhấn [E] chế tạo.
4. **Nhà Tây-Nam (`createSouthWestCottage`) & Trạm Gác (`createWestWatchpost`):**
   - Nhà Tây-Nam: Hộp va chạm `96x46` px bao trùm thân tường và mái. Độ sâu chuẩn hóa: `y + 48` (424).
   - Trạm gác Cổng Tây: Hộp va chạm `58x42` px bao trùm mái và thân chòi gác. Độ sâu chuẩn hóa: `y + 46` (182).
5. **Giếng Làng (`createVillageWell`):**
   - Neo gốc chân sprite `origin(0.5, 0.88)`, depth `y`. Hộp va chạm thành giếng đá `32x22` px ôm sát chân tiếp đất.
6. **Bổ sung va chạm các đạo cụ làng:**
   - **Biển chỉ đường (`createStoneSign`):** Neo gốc chân `origin(0.5, 0.90)`, depth `y`. Bổ sung va chạm chân cột `14x10` px.
   - **Kệ bàn thảo dược Neris (`createApothecaryTables`):** Bổ sung 2 hộp va chạm độc lập cho bàn trái `(892, 112)` và bàn phải `(1044, 112)` kích thước `26x14` px. Độ sâu chuẩn hóa: `leftY + 8` (118).
   - **Cụm thùng gỗ & đống củi (`createVillagePropCluster`):** Bổ sung va chạm `22x12` px, depth `y + 6`.
   - **Cột đèn lồng (`createVillageLanternPost`):** Bổ sung va chạm chân cột `8x8` px, depth `y + 2`.

#### B. Va Chạm Chân NPC & Đồng Bộ Lộ Trình ([src/entities/NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts), [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))
1. **Gắn Arcade Body cho Container NPC ([src/entities/NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts)):**
   - Trong `constructor`: Gọi `scene.physics.add.existing(this)` với kích thước chân nhỏ gọn `body.setSize(22, 14)`, `body.setOffset(-11, -7)`, `body.setImmovable(true)`.
   - Trong `update(delta)`: Gọi `(this.body as Phaser.Physics.Arcade.Body).reset(this.x, this.y)` để hộp va chạm luôn đi theo tọa độ thực tế của NPC khi đi tuần tra (Garth, Finn).
2. **Thiết lập Collider trong GameScene ([src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts)):**
   - Khai báo biến `private npcCollider?: Phaser.Physics.Arcade.Collider;`.
   - Trong `spawnNPCs()`: Kích hoạt `this.npcCollider = this.physics.add.collider(this.player, this.npcs);`.
   - Nhân vật chính dừng lại êm ái khi chạm chân NPC (cách tâm 15..18px), thoải mái đứng gần trò chuyện [E] trong bán kính tương tác 40px mà không bị xuyên thấu.

---

### 8.3. Kết Quả Kiểm Định Chất Lượng C4-13-17 ([scripts/verify_village_colliders_and_depth_c4_13_17.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_village_colliders_and_depth_c4_13_17.mjs))
```text
=== BẮT ĐẦU KIỂM TOÁN TỰ ĐỘNG BƯỚC C4-13-17: CHUẨN HÓA VA CHẠM KIẾN TRÚC, ĐẠO CỤ & Y-SORTING LÀNG BELLHOLLOW ===

[PASS] Tập tin src/world/WorldBuilder.ts tồn tại trên đĩa
[PASS] createBuilding: Hộp va chạm nhà Edda & Neris bao phủ trọn vẹn thân tường (colH >= 42px, colW = w - 6)
[PASS] createSouthWestCottage: Hộp va chạm nhà Tây-Nam bao phủ toàn bộ thân tường và mái (96x46 px)
[PASS] createBellTower: Hộp va chạm Tháp Chuông bao phủ bệ đá và thân tháp (colH >= 54px, colW = w - 8)
[PASS] createCraftingWorkshopPavilion: Hộp va chạm xưởng rèn & kho củi bao trọn mái và vách hậu (88x40 px)
[PASS] createCraftingBench: Hộp va chạm chân bàn chế tạo chuẩn xác khép kín với xưởng (52x16 px)
[PASS] createVillageWell: Hộp va chạm giếng làng bao phủ thành giếng đá (32x22 px)
[PASS] createWestWatchpost: Hộp va chạm trạm gác Cổng Tây bao phủ mái và chòi gác (58x42 px)
[PASS] createStoneSign: Đã bổ sung hộp va chạm chân biển chỉ đường chuẩn xác (14x10 px)
[PASS] createApothecaryTables: Đã bổ sung hộp va chạm cho cả 2 kệ bàn thảo dược cạnh nhà Neris (26x14 px)
[PASS] createVillagePropCluster: Đã bổ sung hộp va chạm chân cụm thùng gỗ & đống củi làng (22x12 px)
[PASS] createVillageLanternPost: Đã bổ sung hộp va chạm chân cột đèn lồng làng (8x8 px)
[PASS] Y-Sorting nhà Edda & Neris đặt tại đường chân móng y + h
[PASS] Y-Sorting Tháp Chuông đặt tại đường chân tháp y + h (310)
[PASS] Y-Sorting xưởng rèn & kho củi đặt tại chân móng y + 42 (360)
[PASS] Y-Sorting Bàn Chế Tạo đặt tại chân bàn y + 18 (378)
[PASS] Y-Sorting Giếng Làng neo gốc chân 0.88 và depth y
[PASS] Y-Sorting Biển Chỉ Đường neo gốc chân 0.90 và depth y
[PASS] Tập tin src/entities/NPCEntity.ts tồn tại trên đĩa
[PASS] NPCEntity: Đã bổ sung hộp va chạm chân nhỏ gọn (22x14 px, immovable) chống đi xuyên người NPC
[PASS] NPCEntity.update: Tự động đồng bộ tọa độ hộp va chạm theo lộ trình tuần tra của NPC
[PASS] Tập tin src/scenes/GameScene.ts tồn tại trên đĩa
[PASS] GameScene.ts: Khai báo thuộc tính npcCollider quản lý va chạm NPC
[PASS] GameScene.ts: Thiết lập va chạm vật lý giữa SatyrPlayer và toàn bộ 5 NPC làng Bellhollow
[PASS] GameScene.ts: Dọn dẹp an toàn npcCollider khi chuyển cảnh hoặc tái tạo NPC

======================================================
KẾT QUẢ KIỂM TOÁN C4-13-17: 25/25 TIÊU CHÍ ĐẠT (100%)
>>> TẤT CẢ TIÊU CHÍ CHUẨN HÓA VA CHẠM & Y-SORTING LÀNG BELLHOLLOW ĐỀU ĐẠT CHUẨN 100%! <<<
```

---

## 9. C4-13-18: DỌN DẸP HẠT THU THẬP, SỬA LỖI CHẠY NHANH CẠN THỂ LỰC VÀ BỔ SUNG PHẢN HỒI KHI CẠN BÌNH TÂM

### 9.1. Bối Cảnh & Nguyên Nhân Gốc Rễ (Root Cause)
1. **Lỗi Thể Lực không bao giờ về 0 khi giữ [Shift]:**
   - Trong `SatyrPlayer.ts`, điều kiện chạy nhanh kiểm tra `this.stats.stamina > 5`. Khi thể lực giảm tới mức 5, cờ chạy `isSprinting` lập tức bị tắt.
   - Vòng lặp `SurvivalSystem.ts` thấy `isSprinting = false` nên ngay lập tức hồi phục thể lực trở lại 5.1+, khiến điều kiện `> 5` lại thỏa mãn.
   - Trạng thái kiệt sức (`_isStaminaExhausted`) chỉ được kích hoạt khi `stamina <= 0`, nhưng stamina bị chặn ở mức 5 nên trạng thái kiệt sức không bao giờ kích hoạt, người chơi có thể stutter-sprint liên tục mà không bao giờ bị dừng lại.
2. **Thiếu phản hồi và hiệu ứng bất lợi khi cạn kiệt Bình Tâm (0/100):**
   - Khi Bình Tâm về 0, người chơi không nhận được phản hồi trực quan nào trên màn hình, dẫn đến cảm giác bối rối ("Thanh bình tâm nó hết, mà em ko bik mik bị gì"). Tốc độ di chuyển không bị ảnh hưởng và lượng máu bị rút quá nhanh (-2.5 HP/s).
3. **Hạt thu thập đọng lại & vòng tròn xanh dương debug:**
   - Cần bổ sung hiệu ứng hạt lấp lánh (burst) khi nhặt thảo dược/tài nguyên và bảo đảm gọi `destroy()` 100% sau tween.
   - Sóng âm phát ra từ `emitNoiseWave` (vòng tròn xanh 0x3498db) phát lặp dưới chân nhân vật ngay trong làng an toàn khi người chơi chạy gần NPC.
4. **Họa tiết Miếu Chuông Phế Tích bị lỗi màu & lệch trục:**
   - `broken_shrine.png` chứa các pixel màu xanh dương cartoon (`#4a6ab8`, `#2a4688`, `#7a98d8`) trông như lỗi texture ("Em ko rõ họa tiết có bị lỗi ko").
   - Sprite miếu bị đặt lệch 48px sang trái so với bệ thờ trung tâm và vết nứt chuông.
5. **Ranh giới "hai thế cực" giữa Crooked Path và Silent Mire tại x = 2880:**
   - Hai canvas mặt đất cắt nhau sắc lẹm theo phương thẳng đứng mà không có dải hòa sắc gradient.

### 9.2. Giải Pháp Triển Khai Kỹ Thuật
1. **Sửa vòng lặp Thể Lực & Trạng thái Kiệt Sức (`SatyrPlayer.ts`, `SurvivalSystem.ts`):**
   - Đổi điều kiện chạy thành `this.stats.stamina > 0`, cho phép thể lực rút mượt mà về đúng 0/100.
   - Bổ sung `sprintCooldownTimer = 1.0s` trong `SurvivalSystem.ts`: tạm dừng hoàn toàn hồi phục thể lực tự nhiên trong khi đang chạy và trong vòng 1.0 giây sau khi buông phím [Shift].
   - Khi thể lực chạm đáy 0/100: kích hoạt `_isStaminaExhausted = true`, cưỡng chế tốc độ đi bộ, hiển thị popup *"Kiệt sức! Cần nghỉ lấy hơi..."*.
   - Chỉ cho phép chạy nhanh trở lại khi thể lực đã hồi phục đạt tối thiểu `25/100`.
2. **Phản hồi hình ảnh & Hiệu ứng bất lợi khi cạn kiệt Bình Tâm (`SurvivalSystem.ts`, `UIScene.ts`, `SatyrPlayer.ts`):**
   - Trong `SurvivalSystem.ts`: khi Bình Tâm cạn kiệt (0/100) trong bóng tối, rút máu nhẹ nhàng theo đúng chuẩn thiết kế: `-1 HP` mỗi 2.5 giây (`-0.4 HP/s`).
   - Trong `SatyrPlayer.ts`: khi `stats.composure <= 0`, áp dụng debuff hoảng loạn giảm 15% tốc độ di chuyển (`speedMultiplier *= 0.85`).
   - Trong `UIScene.ts`: bổ sung `panicVignetteGraphics` (depth 900) với hiệu ứng viền tối nhấp nháy nhịp thở khi Bình Tâm < 20 và viền đỏ thẫm/tím đập dồn dập khi Bình Tâm = 0/100.
   - Hiển thị thông báo HUD định kỳ mỗi 8s: *"⚠️ Hoảng loạn (Bình Tâm 0/100)! Hãy bật Đèn Lồng [F] hoặc tìm ánh lửa!"* và đổi màu số liệu sang đỏ tươi `#ff3838`.
3. **Dọn dẹp hạt tài nguyên & Ẩn vòng tròn xanh dương debug (`InventorySystem.ts`, `GameScene.ts`):**
   - `InventorySystem.ts`: tạo 5 hạt nhỏ màu xanh lá `0x2ecc71` bay tỏa lên trên trong 550ms–700ms và 100% đối tượng được gọi `destroy()` khi tween kết thúc.
   - `GameScene.ts`: vô hiệu hóa `emitNoiseWave` tại khu vực an toàn (`bellhollow`, `sanctuary_farm`), xóa bỏ hoàn toàn vòng tròn xanh dương dưới chân nhân vật khi đứng gần NPC.
4. **Chuẩn hóa đồ họa Miếu Chuông & Làm mềm ranh giới vùng (`WorldBuilder.ts`):**
   - Chuyển đổi toàn bộ 986 pixel màu xanh dương cartoon trong `broken_shrine.png` sang màu đá phiến cổ kính (`#3d4852`, `#252e36`, `#556370`).
   - Căn giữa chuẩn xác sprite miếu tại `x + w/2, y + 16` với origin `(0.5, 0.75)` đối xứng sau bệ thờ trung tâm và quả chuông vỡ tại trục x = 4500.
   - Bổ sung dải hòa sắc gradient mềm mại giữa `crooked_path` và `silent_mire` tại x = 2720..2980, xóa bỏ triệt để hiện tượng vệt cắt dọc "hai thế cực".

### 9.3. Kết Quả Kiểm Thử Tự Động (C4-13-18)
```
=== [HOLLOW WOODS V1.3] AUTOMATED VERIFICATION: C4-13-18 ===

[PASS] SurvivalSystem: Khởi tạo sprintCooldownTimer và hoãn hồi phục 1.0s sau khi dừng chạy nhanh
[PASS] SurvivalSystem: Thể lực tụt mượt mà về 0/100 và phát sự kiện stamina_exhausted
[PASS] SurvivalSystem: Tạm dừng hồi phục thể lực trong khi chạy và trong 1.0s cooldown
[PASS] SurvivalSystem: Khi Bình Tâm cạn kiệt (0/100), rút dần Sinh Lực chuẩn -1 HP mỗi 2.5s (-0.4 HP/s)
[PASS] SatyrPlayer: Kích hoạt trạng thái Kiệt Sức và thông báo khi thể lực chạm đáy 0/100
[PASS] SatyrPlayer: Yêu cầu hồi phục thể lực tối thiểu 25/100 mới xóa kiệt sức và cho phép chạy lại
[PASS] SatyrPlayer: Cho phép thể lực tụt đều đến 0 thay vì bị chặn đứng ở mức 5
[PASS] SatyrPlayer: Giảm 15% tốc độ di chuyển khi Bình Tâm cạn kiệt (0/100)
[PASS] UIScene: Đã tích hợp panicVignetteGraphics và hàm updatePanicVignette
[PASS] UIScene: Tự động ẩn viền hoảng loạn khi Bình Tâm hồi phục trên 20/100
[PASS] UIScene: Hiển thị cảnh báo HUD hoảng loạn định kỳ khi Bình Tâm chạm 0/100
[PASS] UIScene: Đổi màu chữ chỉ số Bình Tâm sang đỏ thẫm khi cạn kiệt về 0
[PASS] InventorySystem: Tung hạt hiệu ứng thu thập (550-700ms) và gọi destroy() 100% khi kết thúc tween
[PASS] GameScene: Chặn phát sóng âm xanh dương debug dưới chân nhân vật tại làng Bellhollow & Nông Trại
[PASS] WorldBuilder: Tích hợp dải hòa sắc gradient mềm mại giữa Crooked Path và Silent Mire tại x = 2880
[PASS] WorldBuilder: Miếu Chuông Phế Tích được căn giữa hoàn hảo đối xứng sau Bệ Thờ Trung Tâm
[PASS] broken_shrine.png: Đã loại bỏ hoàn toàn các pixel màu xanh dương cartoon (0x4a6ab8) sang đá phiến cổ kính

========================================
KẾT QUẢ KIỂM THỬ: 17/17 TIÊU CHÍ ĐẠT (100%)
========================================
```

---

## 10. TRIỂN KHAI BƯỚC C4-13-19: XÓA TƯỜNG TÀNG HÌNH, CHỐNG NHÁY BANNER PHÂN KHU & CHUẨN HÓA HỌA TIẾT MIẾU CHUÔNG VỠ

### 10.1. Mục tiêu và bối cảnh phát hiện lỗi
Qua phản hồi kiểm thử thực địa và hình ảnh/video clip người chơi cung cấp tại khu vực Trận Địa Cột Đá Cổ Ngữ (Ancient Rune Puzzle) và Miếu Chuông Phế Tích (Broken Bell Shrine):
1. **Lỗi tường tàng hình (Invisible Walls):**
   - Khoảng sân gạch tròn của Câu Đố Cổ Ngữ bị chặn bởi các hộp va chạm vô hình (`rune_arena_bound_top`, `rune_arena_bound_bottom`, `rune_central_altar_col` trong `zones.json`) và hộp va chạm quá khổ của `shrine_main_altar` (96×64 px) tại Miếu Chuông.
   - Tại Đầm Lầy Tĩnh Lặng, `mire_water_pool` (180×90 px) chặn ngang qua cầu ván gỗ (boardwalk), khiến người chơi không thể đi thẳng qua đầm lầy.
   - Hộp va chạm chân bệ thờ và 3 cột đá cổ ngữ trong code quá lớn khiến lối đi bị chật hẹp, dễ gây kẹt nhân vật.
2. **Lỗi nhấp nháy bảng thông báo phân khu (Zone Banner Flickering):**
   - Khi di chuyển qua lại giữa Đầm Lầy Tĩnh Lặng và Câu Đố Cổ Ngữ, do phân khu `ancient_rune_puzzle` nằm lọt hoàn toàn bên trong `silent_mire` và không có vùng đệm trễ vị trí (hysteresis), việc bước qua mép ranh giới kích hoạt liên tục hàm `showZoneBanner`, rung lắc camera (`shake`) và ghi save game checkpoint hàng chục lần.
3. **Lỗi vỡ và chồng đè họa tiết tại Miếu Chuông Vỡ:**
   - Tại tâm khoảng sân đá tròn Miếu Chuông: tồn tại một khối chữ nhật màu xám vẽ lót (`ctx.fillRect`) dưới nền gạch canvas bị lệch tâm thô sơ.
   - Một tảng đá lớn (`SPRITE_STONE_ALTAR`) được sinh đè lên cùng tọa độ phía trước che khuất hoàn toàn lối vào và tâm kiến trúc `broken_shrine.png`.
   - Một khối hình quả chuông tách rời (`createCrackedBellRuins`) vẽ bằng Graphics đặt tại (4500, 205) lơ lửng trên không trung phía trên nóc miếu.
   - Họa tiết `broken_shrine.png` và `stone_altar.png` có viền cắt cụt hoặc dính lẹm viền pixel biên.

---

### 10.2. Giải pháp kỹ thuật đã triển khai

#### 1. Dọn dẹp triệt để tường tàng hình và giải phóng không gian di chuyển (`src/data/zones.json`, `src/world/WorldBuilder.ts`)
- **Trong `src/data/zones.json`:**
  - Xóa bỏ toàn bộ các collider vô hình chặn sân đấu trong `ancient_rune_puzzle` (`colliders: []`).
  - Xóa bỏ collider tĩnh quá khổ `shrine_main_altar` (96×64 px) trong `broken_bell_shrine`.
  - Tách và đẩy lùi vùng nước sâu trong `silent_mire` thành 2 cụm độc lập phía Bắc (`mire_water_north_deep`, y: 160..255) và phía Nam (`mire_water_south_deep`, y: 335..430), giải phóng hoàn toàn hành lang cầu ván gỗ mục (boardwalk, y: 285..325) thông suốt từ Tây sang Đông.
  - Xóa bỏ các collider chân cột đá trùng lặp (`pillar_1`, `pillar_2`, `pillar_3`) trong `silent_mire`.
- **Trong `src/world/WorldBuilder.ts`:**
  - `createRunestonePillar`: Thu gọn hộp va chạm chân cột đá về đúng 18×14 px (offset -9, -7), giải phóng không gian xung quanh 3 cột đá cổ ngữ.
  - `createStoneAltar`: Thu gọn hộp va chạm bệ thờ trung tâm về đúng 28×14 px (offset -14, -7).
  - `createShrineAltar`: Đặt hộp va chạm chân tường miếu nhỏ gọn 48×16 px (offset -24, -8) áp sát vách sau, giải phóng toàn bộ khoảng sân trước cho người chơi tiếp cận bệ đá thoải mái.

#### 2. Cơ chế vùng đệm trễ vị trí (Hysteresis) và thời gian chờ (Cooldown) chống nháy banner (`WorldBuilder.ts`, `GameScene.ts`, `UIScene.ts`)
- **Khoảng đệm trễ vị trí (Hysteresis Margin 80px) trong `WorldBuilder.ts:detectCurrentZone`:**
  - Khi người chơi đang ở trong phân khu `ancient_rune_puzzle`, hệ thống mở rộng vùng nhận diện ra thêm 80px theo cả 4 hướng (`bounds.x - 80` đến `bounds.x + bounds.width + 80`).
  - Người chơi chỉ chuyển về `silent_mire` khi đã hoàn toàn rời khỏi khoảng sân đá ra ngoài hơn 80px.
- **Khống chế thời gian chờ (Cooldown 4 giây) và chống lặp zone trong `GameScene.ts`:**
  - Bổ sung biến trạng thái `lastZoneBannerTime: number = 0` và `lastBannerZoneId: string = ''`.
  - Trong `handleZoneLogic()`, chỉ hiển thị banner và rung nhẹ camera khi thỏa mãn cả 2 điều kiện:
    `now - this.lastZoneBannerTime >= 4000` VÀ `this.currentZoneId !== this.lastBannerZoneId`.
- **Bộ đệm thời gian trong `UIScene.ts:showZoneBanner`:**
  - Thêm `lastBannerShownTime` và `lastBannerZoneTitle`. Chặn mọi lệnh gọi lặp lại cho cùng một phân khu trong vòng 4000ms.

#### 3. Tái thiết kế họa tiết và xóa bỏ chồng đè tại Miếu Chuông Vỡ (`WorldBuilder.ts`, `broken_shrine.png`, `stone_altar.png`)
- **Xóa bỏ các đối tượng thừa và sai lệch trong `WorldBuilder.ts`:**
  - Xóa khối chữ nhật màu xám vẽ lót (`ctx.fillRect`) trong `renderBrokenBellShrineTerrain`.
  - Gỡ bỏ hoàn toàn đối tượng đồ họa tảng đá đè phía trước (`SPRITE_STONE_ALTAR`) trong `createShrineAltar`.
  - Gỡ bỏ lệnh gọi và phương thức vẽ quả chuông lơ lửng tách rời `createCrackedBellRuins(4500, 205)`.
- **Tạo mới Texture Pixel Art chuẩn mực:**
  - `broken_shrine.png` (96×80 px): Dựng kiến trúc Miếu Chuông đá phiến cổ Gothic với bậc tam cấp, hai cột đá chạm khắc hoa văn phế tích, mái ngói xám đen rêu phong, và tích hợp quả chuông đồng cổ vỡ trực tiếp bên trong vòm tháp chuông (belfry arch) với ánh sáng le lói. Toàn bộ 4 cạnh có 0 pixel chạm viền.
  - `stone_altar.png` (60×42 px): Thu gọn và căn chỉnh tảng đá bệ thờ đồng tâm, viền chuyển tiếp mượt mà, 0 pixel chạm viền.

---

### 10.3. Kết quả kiểm thử tự động bước C4-13-19 (`verify_invisible_walls_and_shrine_c4_13_19.mjs`)
- **Tập lệnh kiểm thử:** `node scripts/verify_invisible_walls_and_shrine_c4_13_19.mjs`
- **Kết quả:** **22/22 tiêu chí ĐẠT (100%)**
  + 0 blocking colliders trong `ancient_rune_puzzle`.
  + Gỡ bỏ `shrine_main_altar` 96×64 px khỏi `broken_bell_shrine`.
  + Hành lang cầu ván gỗ boardwalk thông suốt (gỡ `mire_water_pool`, chia nước sâu Bắc/Nam).
  + Xóa bỏ khối xám vẽ lót 120×60 px trên nền đất Miếu Chuông.
  + Gỡ bỏ tảng đá đè `SPRITE_STONE_ALTAR` và quả chuông lơ lửng `createCrackedBellRuins`.
  + Hộp va chạm chân miếu (48×16 px), bệ đá (28×14 px) và cột đá (18×14 px) gọn gàng, thông thoáng.
  + Cơ chế Hysteresis 80px trong `detectCurrentZone` hoạt động chuẩn xác.
  + Cooldown 4 giây và chống lặp zone trong `GameScene.ts` và `UIScene.ts` hoạt động 100%.
  + `broken_shrine.png` (96×80) và `stone_altar.png` (60×42) đạt chuẩn 0 pixel chạm biên.
- **Biên dịch TypeScript:** `npx tsc --noEmit` đạt 0 lỗi biên dịch.

```
=== VERIFYING C4-13-19: INVISIBLE WALLS, BANNER HYSTERESIS & SHRINE TEXTURES ===

[PASS] ancient_rune_puzzle exists in zones.json
[PASS] ancient_rune_puzzle has 0 blocking invisible colliders
[PASS] broken_bell_shrine exists in zones.json
[PASS] shrine_main_altar 96x64 box removed from broken_bell_shrine in zones.json
[PASS] silent_mire exists in zones.json
[PASS] mire_water_pool removed so boardwalk (y: 285..325) is not blocked
[PASS] Duplicate pillar_1 collider removed from silent_mire
[PASS] Misaligned 120x60 grey background rectangle removed from Broken Bell Shrine terrain
[PASS] Floating mid-air bell call removed from renderBrokenBellShrineDecorations
[PASS] Overlapping boulder (SPRITE_STONE_ALTAR) covering the shrine removed from createShrineAltar
[PASS] Compact 48x16 collider placed at shrine rear wall (freeing front courtyard)
[PASS] Compact 18x14 collider placed at runestone pillar foot
[PASS] Compact 28x14 collider placed at stone altar foot
[PASS] detectCurrentZone implements 80px hysteresis margin for ancient_rune_puzzle
[PASS] GameScene has lastZoneBannerTime and lastBannerZoneId state variables
[PASS] GameScene throttles zone banner and screen shake behind 4s cooldown and zone inequality
[PASS] UIScene has lastBannerShownTime and lastBannerZoneTitle state variables
[PASS] UIScene guards showZoneBanner against re-triggering within 4 seconds for same title
[PASS] broken_shrine.png is 96x80 (actual: 96x80)
[PASS] broken_shrine.png has 0 pixels touching borders (actual: 0)
[PASS] stone_altar.png is 60x42 (actual: 60x42)
[PASS] stone_altar.png has 0 pixels touching borders (actual: 0)

==========================================
TOTAL CHECKS: 22 | PASSED: 22 | FAILED: 0
==========================================
ALL C4-13-19 VERIFICATIONS PASSED SUCCESSFULLY!
```

---

## 11. BÁO CÁO KỸ THUẬT BƯỚC C4-13-20: MƯỢT HÓA RANH GIỚI VÙNG & TỐI ƯU HÓA PHÂN KHU XA

### 11.1. Bối cảnh & Mục tiêu
- **Phản hồi người chơi:** Xuất hiện đường ranh giới cắt dọc thẳng tắp giữa hai vùng đất (Crooked Path và Silent Mire) trông giống "hai thế cực" đối lập đột ngột, con đường đất bị đứt gãy sang mặt sàn gỗ và màu nền chia đôi màn hình thiếu tự nhiên.
- **Mục tiêu:**
  1. Xây dựng dải chuyển tiếp địa hình tự nhiên rộng 200px (x: 2780..2980) với các mảng cỏ sẫm, bùn đất chuyển sắc, đá cuội, bụi rậm và lớp sương mù đan xen.
  2. Nối liền mạch con đường mòn xuyên qua ranh giới với bán kính đồng nhất và lớp nền chuyển tiếp êm ái.
  3. Thêm hiệu ứng màn sương chuyển vùng nhẹ (0.35s Fade) và cơ chế ngủ đông đối tượng phân khu xa (Zone-level Hibernation & Frustum Sync).

### 11.2. Giải pháp thực thi & Kết quả kiểm thử
- **Dải chuyển tiếp địa hình 200px đa tầng (`WorldBuilder.ts`):** Hòa sắc từ cỏ xanh sang bùn lầy xám đen, nối mặt đường đất liên tục và lùi sàn gỗ sang x = 2940.
- **Hiệu ứng sương mù chuyển vùng (`VeilSystem.ts`):** Tween mờ dần màn sương trong 350ms khi bước qua ranh giới.
- **Ngủ đông đối tượng phân khu xa (`WorldBuilder.ts`):** `hibernateDistantZoneObjects` và đồng bộ `setActive(isInside)` theo tầm nhìn camera, tiết kiệm tối đa tài nguyên dựng hình.
- **Kiểm thử tự động:** `node scripts/verify_seam_transition_and_hibernation_c4_13_20.mjs` đạt **19/19 PASS (100%)**.

---

## 12. BÁO CÁO KỸ THUẬT BƯỚC C4-13-21: TÍCH HỢP NPC THỢ RÈN BRAM TỪ GÓI TÀI NGUYÊN SMITH MỚI

### 12.1. Bối cảnh & Yêu cầu nghiệp vụ
- **Yêu cầu:** Đóng gói và tích hợp NPC Thợ Rèn Bram từ gói tài nguyên pixel art mới (`Pixel_Art/SmithNPC.zip`) vào khu vực lò rèn của Làng Bellhollow.
- **Nhiệm vụ cụ thể:**
  1. Trích xuất tài nguyên gốc (`SpriteSheet.png`, `Smith.aseprite`, `ReadMe.txt`).
  2. Viết script Node.js với `pngjs` để chuẩn hóa hoạt ảnh về ô frame đồng nhất (64×64 px), căn đáy chân tựa mặt đất, giữ độ sắc nét Nearest-Neighbor, nền trong suốt RGBA và bổ sung bóng đổ elip đen mờ (alpha 0.25) dưới chân thợ rèn và đe rèn.
  3. Cắt cúp chân dung bán thân (bust crop 32×32 phóng đại 2x thành 64×64 px) làm Avatar hội thoại.
  4. Nạp spritesheet, chân dung và hoạt ảnh đập đe rèn sắt liên tục (`anim_blacksmith_work` / `npc_bram_work` / `npc_bram_idle`) vào `PreloadScene.ts` và `NPCEntity.ts`.
  5. Đặt NPC Bram tại tọa độ thông thoáng `x: 1045, y: 365` cạnh Xưởng Chế Tạo & Lò Rèn, cấu hình hộp va chạm chân 22×14 px immovable, depth sorting theo Y chân và icon chức danh búa 🔨.
  6. Soạn thảo lời thoại tiếng Việt tự nhiên cho Thợ Rèn Bram trong `dialogues.json`, chia sẻ về ngọn lửa lò rèn chống sương lạnh và hướng dẫn người chơi dùng Bàn Chế Tạo.

### 12.2. Chi tiết triển khai kỹ thuật

#### 1. Chuẩn hóa đồ họa bằng `pngjs` (`scripts/prepare_blacksmith_assets_c4_13_21.mjs`)
- Trích xuất 6 frame (mỗi frame 64×65 px gốc) từ `Pixel_Art/SmithNPC/SpriteSheet.png`, dịch chuyển y-1 để căn chuẩn lưới 64×64 px.
- Bổ sung 2 bóng đổ elip đen mờ mịn (`alpha = 64 / 255` ~ 0.25):
  + Dưới chân Thợ Rèn: tâm `(x: 35, y: 62)`, bán kính `(rx: 10, ry: 3)`.
  + Dưới chân Đe Rèn: tâm `(x: 15, y: 48)`, bán kính `(rx: 7, ry: 2.5)`.
- Tạo thành công 3 tệp tài nguyên chuẩn:
  + `public/assets/characters/villagers/blacksmith_sheet.png` (384×64 px, 6 frames).
  + `public/assets/characters/villagers/npc_blacksmith.png` (64×64 px, frame 0).
  + `public/assets/characters/villagers/portrait_blacksmith.png` (64×64 px, chân dung bán thân 2x Nearest-Neighbor).
  + Đồng bộ các tệp đối ứng sang thư mục `public/assets/characters/npcs/`.

#### 2. Cấu hình Nạp tài nguyên & Đăng ký hoạt ảnh (`PreloadScene.ts`, `Constants.ts`, `NPCEntity.ts`)
- Khai báo các khóa tài nguyên mới: `SPRITE_BLACKSMITH_SHEET`, `SPRITE_NPC_BLACKSMITH`, `PORTRAIT_BLACKSMITH` (đồng thời giữ tương thích ngược `PORTRAIT_BRAM` và `SPRITE_NPC_BRAM`).
- Trong `PreloadScene.ts`: Nạp spritesheet 64×64 px, hình ảnh NPC và chân dung đối thoại.
- Trong `NPCEntity.ts`:
  + Gán `initialSheet = 'blacksmith_sheet'` khi `baseId === 'bram'`.
  + Đăng ký hoạt ảnh rèn sắt lặp vô hạn `anim_blacksmith_work` (frameRate 6, repeat: -1) cùng các bí danh `npc_bram_work`, `npc_bram_idle` và 4 hướng (`npc_bram_idle_down/up/left/right`).
  + Cập nhật icon đại diện chức danh từ 🏺 (thợ gốm) thành 🔨 (thợ rèn).

#### 3. Bố trí vị trí, va chạm & Hội thoại Lore (`GameScene.ts`, `zones.json`, `dialogues.json`, `UIScene.ts`)
- Tọa độ NPC Bram: `x: 1045, y: 365` trên nền đất mở bên cạnh Xưởng Chế Tạo (`wx <= 1022`) và Bàn Chế Tạo (`x: 952..1004`), tuyệt đối không va chạm hoặc kẹt vào công trình.
- Hộp va chạm chân: `body.setSize(22, 14)` immovable, depth sorting theo `y = 365`, Nameplate gắn cờ bán trong suốt nổi bật trên đầu.
- Hội thoại tiếng Việt `bram_chat`:
  > *"Keng! Keng!... Chào người lữ khách! Ta là Bram, thợ rèn của ngôi làng Bellhollow này."*  
  > *"Màn sương lạnh ngoài Hollow Woods luôn chực chờ dập tắt mọi hơi ấm, nên ta phải giữ cho ngọn lửa lò rèn luôn rực cháy cả ngày lẫn đêm."*  
  > *"Bàn Chế Tạo ngay bên cạnh luôn sẵn sàng: chỉ cần gom đủ Gỗ Khô, Đá Lửa và Nhựa Cây, ngươi có thể tự rèn Bó Đuốc và châm thêm Dầu Đèn để sống sót giữa đêm sương!"*  
  > *"Hãy luôn giữ ngọn lửa trong tim và kiểm tra bình dầu đèn trước khi bước qua Cổng Đông nhé!"*

### 12.3. Kết quả kiểm thử tự động bước C4-13-21 (`verify_blacksmith_integration_c4_13_21.mjs`)
- **Tập lệnh kiểm thử:** `node scripts/verify_blacksmith_integration_c4_13_21.mjs`
- **Kết quả:** **44/44 tiêu chí ĐẠT (100%)**
  + 6/6 file PNG tài nguyên tồn tại trên đĩa với kích thước chính xác (384×64 sheet, 64×64 sprite, 64×64 portrait).
  + Nền RGBA trong suốt hoàn hảo, nội dung pixel đặc sắc nét.
  + `Constants.ts` định nghĩa và xuất khẩu đầy đủ 3 hằng số texture mới.
  + `PreloadScene.ts` nạp đầy đủ spritesheet, avatar portrait và static sprite.
  + `NPCEntity.ts` liên kết Bram với `blacksmith_sheet`, đăng ký `anim_blacksmith_work`, `npc_bram_work`, `npc_bram_idle` và gán icon búa 🔨.
  + `GameScene.ts` và `zones.json` định vị Bram tại tọa độ chuẩn `(1045, 365)` với chức danh `"Thợ rèn làng"`.
  + `dialogues.json` cập nhật `bram_chat` đầy đủ cốt truyện lò rèn, ngọn lửa chống sương và hướng dẫn bàn chế tạo.
  + `UIScene.ts` và `DialogueSystem.ts` hỗ trợ tự động hiển thị `portrait_blacksmith`.
- **Biên dịch TypeScript:** `npx tsc --noEmit` đạt 0 lỗi biên dịch.

```
=== VERIFYING STEP C4-13-21: BLACKSMITH NPC INTEGRATION ===

[PASS] File exists: public/assets/characters/villagers/blacksmith_sheet.png
[PASS] Dimensions match 384x64 for public/assets/characters/villagers/blacksmith_sheet.png
[PASS] File has transparent background and solid content: public/assets/characters/villagers/blacksmith_sheet.png
[PASS] File exists: public/assets/characters/villagers/npc_blacksmith.png
[PASS] Dimensions match 64x64 for public/assets/characters/villagers/npc_blacksmith.png
[PASS] File has transparent background and solid content: public/assets/characters/villagers/npc_blacksmith.png
[PASS] File exists: public/assets/characters/villagers/portrait_blacksmith.png
[PASS] Dimensions match 64x64 for public/assets/characters/villagers/portrait_blacksmith.png
[PASS] File has transparent background and solid content: public/assets/characters/villagers/portrait_blacksmith.png
[PASS] File exists: public/assets/characters/npcs/blacksmith_sheet.png
[PASS] Dimensions match 384x64 for public/assets/characters/npcs/blacksmith_sheet.png
[PASS] File has transparent background and solid content: public/assets/characters/npcs/blacksmith_sheet.png
[PASS] File exists: public/assets/characters/npcs/npc_blacksmith.png
[PASS] Dimensions match 64x64 for public/assets/characters/npcs/npc_blacksmith.png
[PASS] File has transparent background and solid content: public/assets/characters/npcs/npc_blacksmith.png
[PASS] File exists: public/assets/characters/npcs/portrait_blacksmith.png
[PASS] Dimensions match 64x64 for public/assets/characters/npcs/portrait_blacksmith.png
[PASS] File has transparent background and solid content: public/assets/characters/npcs/portrait_blacksmith.png
[PASS] Constants.ts defines SPRITE_BLACKSMITH_SHEET
[PASS] Constants.ts defines SPRITE_NPC_BLACKSMITH
[PASS] Constants.ts defines PORTRAIT_BLACKSMITH
[PASS] PreloadScene imports PORTRAIT_BLACKSMITH
[PASS] PreloadScene imports SPRITE_BLACKSMITH_SHEET
[PASS] PreloadScene loads blacksmith_sheet.png
[PASS] PreloadScene loads portrait_blacksmith.png
[PASS] PreloadScene loads npc_blacksmith.png
[PASS] NPCEntity maps Bram to blacksmith_sheet
[PASS] NPCEntity registers anim_blacksmith_work
[PASS] NPCEntity registers npc_bram_work
[PASS] NPCEntity registers npc_bram_idle
[PASS] NPCEntity assigns hammer icon to Bram
[PASS] GameScene defines Bram as Thợ rèn làng
[PASS] GameScene positions Bram at (1045, 365)
[PASS] zones.json contains bellhollow zone
[PASS] zones.json contains npc_bram in bellhollow npcs
[PASS] zones.json sets Bram title to 'Thợ rèn làng'
[PASS] zones.json positions Bram at x: 1045, y: 365
[PASS] dialogues.json contains bram_chat
[PASS] dialogues.json speaker mentions Thợ Rèn
[PASS] dialogues.json portrait is portrait_blacksmith
[PASS] dialogues.json lines mention forge (lò rèn)
[PASS] dialogues.json lines guide Crafting Bench
[PASS] UIScene supports portrait_blacksmith
[PASS] DialogueSystem supports portrait_blacksmith

=== RESULT: 44 PASSED, 0 FAILED ===
ALL VERIFICATION CHECKS PASSED PERFECTLY!
```

---

## 13. BÁO CÁO KỸ THUẬT BƯỚC C4-13-11: RÀ SOÁT & KHẮC PHỤC TRIỆT ĐỂ LỖI TIỀM ẨN TRÊN 10 HỆ THỐNG & EDGE CASES

### 13.1. Bối cảnh & Yêu cầu kỹ thuật
Quét toàn diện mã nguồn trò chơi trên 10 phân hệ để phát hiện và triệt tiêu các lỗi logic ngầm, lỗi xung đột tài nguyên, lỗi thứ tự ưu tiên tương tác và lỗi rò rỉ trạng thái vòng đời màn chơi khi người chơi thao tác nhanh hoặc chơi thực tế.

### 13.2. Chi tiết triển khai & Giải pháp kỹ thuật

1. **Hệ thống Sinh tồn & Chỉ số (`SurvivalSystem.ts`, `SatyrPlayer.ts`):**
   - Loại bỏ việc gán đè `this.stats.stamina = 0;` trong `SatyrPlayer.updateMovementInput()`.
   - Quy toàn bộ việc kiểm soát, hao hụt và hồi phục 4 chỉ số (Sinh Lực, Thể Lực, Dầu Đèn, Bình Tâm) về duy nhất `SurvivalSystem`, đảm bảo một nguồn sự thật duy nhất (*Single Authority*).

2. **Hệ thống Cửa sổ Modal & Bàn phím (`UIScene.ts`, `DialogueSystem.ts`, `CraftingModal.ts`, `JournalModal.ts`, `PauseModal.ts`):**
   - Đảm bảo cơ chế *Modal Mutual Exclusion*: mở một modal hoặc hội thoại thì các cửa sổ giao diện khác tự động đóng ngay lập tức (`this.hideDialogue()`, `craftingModal.close()`, `journalModal.close()`, `pauseModal.close()`).
   - Khi đóng modal, `UIScene` gọi `gameScene.player.resetAllInputState()` để dọn sạch phím kẹt, người chơi có thể di chuyển mượt mà ngay lập tức.
   - Thêm getter `isAnyModalOpen` trên `UIScene` để bảo vệ chặn phím `[E]` và các thao tác gameplay nền.

3. **Hệ thống Tương tác & Chọn Ứng Viên Gần Nhất (`GameScene.ts`, `WorldBuilder.ts`, `InventorySystem.ts`):**
   - Chặn tương tác khi đang mở Modal hoặc khóa điều khiển: `if (this.dialogueSystem.isActive || ... || (this.uiScene && this.uiScene.isAnyModalOpen) || this.isGameplayInputLocked())`.
   - Xây dựng mảng `InteractionCandidate[]` thu thập tất cả các ứng viên trong bán kính 65px (NPC, Mỏ tài nguyên, Đất trồng thảo dược, Bàn chế tạo, Biển báo, Cổng làng).
   - Sắp xếp tăng dần theo khoảng cách Euclid (`candidates.sort((a, b) => a.dist - b.dist)`) và chọn duy nhất ứng viên gần nhất (`candidates[0]`).
   - Đảm bảo hiển thị đúng 1 nhãn gợi ý `[E]` và chỉ kích hoạt chính xác 1 hành động khi người chơi bấm `[E]`.

4. **Hệ thống Lưu trữ, Vòng đời & Tải Lưu (`GameScene.ts`, `SaveManager.ts`):**
   - `GameScene.init()` thiết lập lại toàn bộ các biến trạng thái vòng đời màn chơi (`isGameOverPending`, `isAct5ChaseActive`, `transitionCooldown`, `cullingTimer`, `lastWestBarrierThoughtTime`, `lastZoneBannerTime`, `npcs`, `fireflies`, `footstepTimer`, `stepNoiseTimer`), ngăn chặn hoàn toàn việc rò rỉ dữ liệu khi người chơi Restart / Reload.
   - Trong `GameScene.create()` khi nạp dữ liệu Continue (`isContinueMode && continueSaveData`): gọi `worldBuilder.detectCurrentZone({ x: spawnX, y: spawnY })` để xác định ngay phân khu thực tế từ tọa độ lưu, gán ngay lập tức cho `currentZoneId`, áp dụng Camera Bounds và đồng bộ trạng thái mở khóa thế giới (`syncAllWorldGates`), triệt tiêu triệt để lỗi camera bị kẹp ở Fog Crossing.

5. **An toàn Tài nguyên & Đồng bộ Ngôn ngữ Tiếng Việt:**
   - `PreloadScene.preload()` tạo sẵn texture `dummy_transparent` 1x1 RGBA.
   - `WorldBuilder.ts` triển khai `safeAddImage` bọc toàn bộ các hàm dựng công trình và cây cối, tự động fallback an toàn nếu thiếu asset.
   - Đồng bộ hóa các cụm từ tiếng Anh đơn độc thành danh xưng Tiếng Việt tự nhiên và nhất quán: `"Khu Rừng Rỗng (The Hollow Woods)"`.

### 13.3. Kết quả kiểm thử tự động bước C4-13-11 (`verify_latent_bugs_c4_13_11.mjs`)
- **Tập lệnh kiểm thử:** `node scripts/verify_latent_bugs_c4_13_11.mjs`
- **Kết quả:** **15/15 tiêu chí ĐẠT (100%)**
- **Toàn bộ bộ kiểm thử hồi quy 19 suite:** `node scripts/run_v1_3_regression_suite.mjs` đạt **493/493 PASS (100%)**.
- **Biên dịch TypeScript & Build:** `npx tsc --noEmit` và `npm run build` đạt 0 lỗi biên dịch.

---

## 14. KẾT LUẬN & TRẠNG THÁI BÀN GIAO V1.3
Toàn bộ các hạng mục nâng cấp hệ thống, cảnh quan, va chạm, thể lực, hiệu ứng hoảng loạn, Y-sorting, giải phóng lối đi, chuyển vùng mượt mà, tích hợp NPC Thợ Rèn Bram và rà soát lỗi tiềm ẩn 10 hệ thống từ **`C4-13-01`** đến **`C4-13-21`** và **`C4-13-11`** đã được triển khai, kiểm thử và nghiệm thu thành công 100%:
1. Cơ chế ẩn nấp và thoát kẹt hai chiều mượt mà, gỡ kẹt AABB tự động.
2. Không còn hiện tượng mất hiển thị nhân vật trong Rừng Sâu; tán cây tự động trong suốt khi đứng dưới bóng.
3. Quy trình gục ngã (Death State) giữ yên frame cuối, dừng AI truy đuổi và kích hoạt giao diện Game Over Dark Woodland mượt mà.
4. Xóa bỏ hoàn toàn khối hộp vuông màu nâu trôi nổi; đèn lồng, quầng sáng và hoạt ảnh vung gậy đồng bộ 100% chuẩn pixel art; phím [F] bật/tắt êm ái không giật lag.
5. Cụm cảnh quan rào chắn tự nhiên phía Tây đầu game xóa bỏ hoàn toàn hiện tượng đường mòn bị cắt cụt; kết hợp thân cây đổ, hàng rào gãy, bụi rậm, sương mù đa tầng và dòng suy nghĩ kể chuyện êm dịu, mượt mà (cooldown 6s).
6. Toàn bộ các công trình kiến trúc, Xưởng Chế Tạo, Tháp Chuông, giếng làng, biển báo, kệ bàn thuốc và 5 NPC trong làng Bellhollow đều sở hữu hộp va chạm vật lý chuẩn xác và độ sâu Y-sorting theo ground base Y mượt mà, không còn bất kỳ lỗi đi xuyên tường hay đè mái nhà.
7. Thể lực cạn kiệt mượt mà về đúng 0/100, có cơ chế kiệt sức buộc nghỉ lấy hơi tới 25/100 mới chạy lại được, hoãn hồi phục 1.0s sau khi dừng chạy.
8. Trạng thái hoảng loạn khi Bình Tâm cạn kiệt (0/100) có đầy đủ phản hồi viền tối/đỏ nhấp nháy góc màn hình, cảnh báo HUD rõ ràng, giảm 15% tốc độ di chuyển và rút máu từ từ (-1 HP mỗi 2.5s).
9. Hạt thu thập tài nguyên tự động destroy 100% sau 550-700ms; vòng tròn sóng âm xanh dương được ẩn hoàn toàn trong làng an toàn khi đứng gần NPC; họa tiết Miếu Chuông Phế Tích được đổi sang đá phiến cổ kính đồng bộ nghệ thuật và căn giữa đối xứng; đường chuyển vùng giữa Crooked Path và Silent Mire được hòa sắc mềm mại xóa bỏ hiện tượng "hai thế cực".
10. Toàn bộ tường tàng hình tại Câu Đố Cổ Ngữ, Miếu Chuông và cầu ván gỗ boardwalk đã được dỡ bỏ 100%; cơ chế Hysteresis 80px cùng Cooldown 4s loại bỏ hoàn toàn hiện tượng nhấp nháy bảng tên phân khu; Miếu Chuông Phế Tích và Bệ Thờ sở hữu Texture Pixel Art sắc nét, không còn hiện tượng tảng đá che miếu hay chuông lơ lửng trên nóc.
11. Ranh giới vùng sở hữu dải tiếp giáp 200px tự nhiên, con đường mòn liên tục không bị đứt đoạn, hiệu ứng sương mù chuyển vùng 350ms êm dịu và cơ chế ngủ đông đối tượng phân khu xa giảm tải bộ nhớ tối ưu.
12. NPC Thợ Rèn Bram được tích hợp sống động với hoạt ảnh đập đe rèn sắt liên tục, chân dung hội thoại sắc nét, bóng đổ mềm mại, tọa độ mở thông thoáng cạnh bàn chế tạo, hộp va chạm chân chuẩn xác và hội thoại lore lôi cuốn.
13. Rà soát và giải quyết dứt điểm các lỗi logic ngầm trên 10 hệ thống: phân quyền chỉ số sinh tồn về SurvivalSystem, bảo đảm độc quyền mở Modal, giải phóng phím kẹt, chọn ứng viên tương tác gần nhất không xung đột, dọn sạch trạng thái vòng đời GameScene và đồng bộ Camera Bounds tức thì khi nạp save Continue.
14. Biên dịch `npx tsc --noEmit` đạt mã thoát 0 (0 lỗi); toàn bộ hệ thống kiểm thử tự động đạt 100% (PASS).

