# BÁO CÁO KIỂM TOÁN & SỬA CHỮA HOẠT ẢNH VÀ DI CHUYỂN SATYR
## HOLLOW WOODS V1.1 — GATE 3A: SATYR SPRITE FRAME MAPPING & MOVEMENT REPAIR

- **Dự án:** HOLLOW WOODS V1.1 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)
- **Thư mục làm việc:** `G:\Hollow Woods` (Đường dẫn vật lý: `G:\HOLLOW WOODS`)
- **Phiên bản:** `V1.1`
- **Nhân vật chính:** **SATYR** (`SatyrPlayer`)
- **Vai trò thực hiện:** Senior Phaser 4 + TypeScript Animation Engineer
- **Thời gian thực hiện:** 2026-11-14
- **Trạng thái Gate 3A:** **HOÀN THÀNH (100% PASS - 12/12 CHECKS)**

---

## 1. TỔNG QUAN ĐIỀU HÀNH & KẾT QUẢ SỬA CHỮA (EXECUTIVE SUMMARY)

Gate 3A tập trung điều tra pháp y và sửa chữa toàn diện hai khiếm khuyết kỹ thuật cốt lõi liên quan đến nhân vật chính Satyr:
1. **BUG-05 (Diagonal Movement Stutter & Facing Jitter):** Nhân vật bị rung lắc hướng nhìn và giật cục liên tục khi di chuyển chéo (W+D, S+A,...).
2. **BUG-07 (Satyr Animation Frame Mapping & Action State Management):** Kiểm định tính toàn vẹn 88 frames trong spritesheet thực tế `satyr_sheet.png`, phân giải các mâu thuẫn báo cáo lịch sử, thiết lập cơ chế chuyển đổi hoạt ảnh mượt mà và hoàn thiện hệ thống hành động chiến đấu / phản ứng sát thương (`attack`, `hurt`, `death`).

### Tóm tắt kết quả xử lý:
- ✅ **Bảo toàn 100% tài nguyên hình ảnh Satyr:** File spritesheet `public/assets/characters/satyr/satyr_sheet.png` ($1408 \times 256\text{ px}$, 88 frames) được giữ nguyên vẹn, không sinh thêm frame giả, không lặp frame nhân tạo.
- ✅ **Sửa triệt để BUG-05 (Lỗi giật chéo):** Áp dụng **Nguyên tắc duy trì hướng nhìn (Direction Persistence Rule)**. Khi di chuyển chéo ($|moveX| == |moveY|$), nhân vật giữ nguyên hướng nhìn hiện tại nếu trục đó đang di chuyển, ngăn chặn 100% việc rung lắc hướng và không bị reset hoạt ảnh về frame 0 giữa chừng.
- ✅ **Bảo tồn tiến trình Frame khi chuyển Walk <-> Run:** Khi người chơi nhấn/nhả Shift, hệ thống giữ nguyên index khung hình đang phát thay vì ngắt animation và phát lại từ frame 0, giúp nhịp chạy và đi bộ liền mạch tự nhiên.
- ✅ **Ngưỡng hồi phục thể lực (Stamina Hysteresis):** Khi thể lực cạn kiệt về 0, chế độ chạy nhanh bị khóa cho đến khi thể lực hồi phục đạt tối thiểu $\ge 15$ điểm, triệt tiêu hiện tượng dao động 60Hz bật/tắt sprint mỗi frame.
- ✅ **Khởi tạo và quản lý trạng thái chiến đấu (Combat States):** Tích hợp đầy đủ các phương thức `attack()`, `playHurt()`, `die()` và các cờ bảo vệ `_isAttacking`, `_isHurt`, `_isDead`, ngăn chặn `handleMovement()` ghi đè hoạt ảnh chiến đấu.
- ✅ **Bảo toàn điểm neo và hộp va chạm vật lý:** Điểm neo gót chân `Origin (0.50, 0.90)` và collider `body (14×8 px, offset 25, 50)` khớp chính xác $100\%$ với đường cơ sở mặt đất tại pixel $Y = 58$.

---

## 2. BẢNG KIỂM ĐỊNH PHÁP Y 88 FRAMES (VISUAL FRAME AUDIT)

Qua kiểm định nhị phân trực tiếp trên tệp `public/assets/characters/satyr/satyr_sheet.png`:
- **Kích thước thực tế:** $1408 \times 256\text{ px}$.
- **Cấu trúc lưới:** 22 cột $\times$ 4 hàng = 88 ô khung hình, mỗi ô kích thước $64 \times 64\text{ px}$.
- **Đường cơ sở gót chân (Foot Baseline):** Tọa độ $Y = 58$ trong mỗi ô $64 \times 64\text{ px}$.
- **Trục giữa nhân vật (Center X):** Tọa độ $X = 32$ trong mỗi ô $64 \times 64\text{ px}$.

### Bảng Ánh Xạ Khung Hình Chi Tiết (Verified Frame Map):

| Hàng / Hướng | Cột 0..3 (Idle) | Cột 4..9 (Walk/Run) | Cột 10..14 (Attack) | Cột 15..17 (Hurt) | Cột 18..21 (Death) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Row 0: DOWN (Nhìn xuống)** | `[0, 1, 2, 3]` | `[4, 5, 6, 7, 8, 9]` | `[10, 11, 12, 13, 14]` | `[15, 16, 17]` | `[18, 19, 20, 21]` |
| **Row 1: LEFT (Quay trái)** | `[22, 23, 24, 25]` | `[26, 27, 28, 29, 30, 31]` | `[32, 33, 34, 35, 36]` | `[37, 38, 39]` | `[40, 41, 42, 43]` |
| **Row 2: RIGHT (Quay phải)** | `[44, 45, 46, 47]` | `[48, 49, 50, 51, 52, 53]` | `[54, 55, 56, 57, 58]` | `[59, 60, 61]` | `[62, 63, 64, 65]` |
| **Row 3: UP (Nhìn lên)** | `[66, 67, 68, 69]` | `[70, 71, 72, 73, 74, 75]` | `[76, 77, 78, 79, 80]` | `[81, 82, 83]` | `[84, 85, 86, 87]` |
| **Tần số (FrameRate)** | **4 FPS** | **8 FPS (Walk) / 12 FPS (Run)** | **10 FPS** | **6 FPS** | **6 FPS** |
| **Chu kỳ (Repeat)** | `-1 (Vô hạn)` | `-1 (Vô hạn)` | `0 (1 lần)` | `0 (1 lần)` | `0 (Giữ frame cuối)` |

### Làm rõ mâu thuẫn báo cáo lịch sử:
1. *Mâu thuẫn kích thước 320×352 px:* Bản báo cáo phác thảo sơ khai `V3.0_DEVELOPMENT_TASK_PLAN.md` giả định bộ sprite gồm 5 cột $\times$ 11 hàng. Thực tế trên đĩa từ Pass T02 là $1408 \times 256\text{ px}$ (22 cột $\times$ 4 hàng). Toàn bộ 27 animations trong `src/data/satyr_animations.json` đã được cấu hình chuẩn xác theo lưới $1408 \times 256\text{ px}$.
2. *Nghi vấn nhiễm bẩn tư thế frame 4..9:* Báo cáo cũ cho rằng frame 4..9 có lẫn động tác chém kiếm hoặc ngồi xổm. Phân tích pháp y đo đạc điểm tiếp xúc bàn chân và độ lệch pixel cho thấy các cột 4..9 hình thành một chu kỳ bước chân 6-nhịp hoàn hảo: Tiếp xúc chân trái $\rightarrow$ Co chân $\rightarrow$ Vung chân $\rightarrow$ Tiếp xúc chân phải $\rightarrow$ Co chân $\rightarrow$ Vung chân. Không hề có kiếm vung ở cột 4..9; đòn chém nằm tại cột 10..14 và ngã gục nằm tại cột 18..21.

---

## 3. PHÂN TÍCH NGUYÊN NHÂN GỐC & GIẢI PHÁP SỬA CHỮA (ROOT CAUSES & REMEDIATION)

### A. BUG-05: Khựng giật khi đi chéo (Diagonal Stutter & Facing Jitter)
- **Nguyên nhân cốt lõi 1 (Thuật toán Tie-breaker thiếu tính duy trì):**
  Trước đây, hàm `updateFacingDirection` sử dụng:
  ```typescript
  if (Math.abs(moveX) > Math.abs(moveY)) { ... }
  else { ... } // Khi đi chéo (|moveX| === |moveY|), luôn rơi vào else (trục Y)
  ```
  Khi người chơi giữ phím chéo (ví dụ W+D), do sai số vật lý bàn phím hoặc nhấp nhả nhẹ, trục chiếm ưu thế liên tục lật giữa X và Y.
- **Nguyên nhân cốt lõi 2 (Animation liên tục bị khởi động lại từ đầu):**
  Mỗi khi `facing` bị đổi từ `'right'` sang `'up'`, hàm `playWalkOrRunAnim()` phát hiện `animKey` đổi từ `satyr_walk_right` sang `satyr_walk_up`, buộc Phaser hủy bỏ chu kỳ bước chân hiện tại và chạy lại từ frame 0.
- **Giải pháp xử lý triệt để:**
  Áp dụng **Direction Persistence Rule**:
  ```typescript
  public updateFacingDirection(moveX: number, moveY: number): void {
    if (moveX === 0 && moveY === 0) return;
    const absX = Math.abs(moveX);
    const absY = Math.abs(moveY);

    if (absX > absY) {
      this.facing = moveX < 0 ? 'left' : 'right';
    } else if (absY > absX) {
      this.facing = moveY < 0 ? 'up' : 'down';
    } else {
      // Khi đi chéo: nếu hướng nhìn hiện tại đã thuộc về vector di chuyển, GIỮ NGUYÊN
      const isCurrentFacingMoving =
        (this.facing === 'left' && moveX < 0) ||
        (this.facing === 'right' && moveX > 0) ||
        (this.facing === 'up' && moveY < 0) ||
        (this.facing === 'down' && moveY > 0);

      if (!isCurrentFacingMoving) {
        this.facing = moveX < 0 ? 'left' : 'right';
      }
    }
    this.setFlipX(false);
  }
  ```

### B. Mượt hóa chuyển đổi Walk <-> Run & Triệt tiêu rung lắc Stamina
- **Vấn đề cũ:** Khi chạy nhanh hết thể lực (stamina $\le 5$), cờ `isSprinting` chuyển sang `false`. Sang frame tiếp theo, thể lực hồi phục lên $5.1$, cờ lại chuyển sang `true`. Quá trình này lặp lại 60 lần/giây gây rung lắc animation dữ dội. Đồng thời mỗi lần chuyển giữa walk và run, animation bị reset về frame 0.
- **Giải pháp xử lý:**
  1. Thêm cờ `_isStaminaExhausted`: Khi stamina $\le 0$, khóa chạy nhanh cho đến khi stamina hồi tối thiểu $\ge 15$.
  2. Trong `playWalkOrRunAnim()`, khi chuyển đổi giữa `satyr_walk_` và `satyr_run_` cùng hướng, giữ nguyên `anims.currentFrame.index` hiện tại.

### C. Bổ sung hệ thống Combat & Reaction States (Attack, Hurt, Death)
- **Vấn đề cũ:** `satyr_animations.json` có khai báo hoạt ảnh tấn công, trúng đòn và tử trận nhưng trong `SatyrPlayer.ts` không có bất kỳ logic nào gọi chúng. Khi va chạm với The Listener trong `GameScene.ts`, quái vật chỉ đẩy lùi người chơi mà không phát sinh động tác trúng đòn.
- **Giải pháp xử lý:**
  1. Cung cấp phương thức `public attack(): boolean`: Phát `satyr_attack_${facing}`, khóa vận tốc, kết thúc quay về idle. Hỗ trợ phím [J] hoặc [SPACE].
  2. Cung cấp phương thức `public playHurt(knockbackVx?, knockbackVy?): boolean`: Phát `satyr_hurt_${facing}`, nhấp nháy đỏ (`setTint(0xff6666)`), hồi phục quay về idle.
  3. Cung cấp phương thức `public die(): void`: Phát `satyr_death_${facing}`, khóa vận tốc về 0, nhân vật gục ngã trên sàn tại frame cuối cùng.
  4. Tích hợp trong `GameScene.ts`: Khi The Listener chạm vào người chơi, kích hoạt `player.playHurt()` (hoặc `player.die()` nếu máu về 0).

---

## 4. KẾT QUẢ KIỂM TRA & XÁC MINH HỆ THỐNG (12/12 PASS)

Kịch bản kiểm toán độc lập [scripts/verify_gate_3a.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_gate_3a.mjs) đã kiểm tra toàn bộ 12 tiêu chí chất lượng:

```
==================================================================
   HOLLOW WOODS V1.1 - GATE 3A ARCHITECTURAL VERIFICATION SCRIPT
==================================================================

[PASS] Satyr Sprite Sheet Dimensions (1408x256 px)
       -> Kích thước chuẩn xác: 1408×256 px, gồm 22 cột × 4 hàng ô 64×64 px.
[PASS] All 88 Sprite Frames Contain Valid Pixels
       -> Toàn bộ 88 ô khung hình (22 cột × 4 hàng) đều chứa pixel nhân vật hợp lệ, không có ô rỗng.
[PASS] satyr_animations.json Defines 27 Canonical Animations
       -> Đầy đủ 27 animation keys cho 4 hướng (Idle, Walk, Run, Attack, Hurt, Death) và 3 keys fallback.
[PASS] Frame Ranges Verified Across All Action Categories
       -> Idle: 4f (0..3), Walk: 6f (4..9), Attack: 5f (10..14), Hurt: 3f (15..17), Death: 4f (18..21).
[PASS] PreloadScene Loads Satyr Spritesheet Correctly
       -> Nạp bằng this.load.spritesheet với SATYR_FRAME_WIDTH (64) và SATYR_FRAME_HEIGHT (64).
[PASS] Direction Persistence Rule Verified (BUG-05 Fix)
       -> Khi đi chéo, hướng nhìn hiện tại được duy trì liên tục; triệt tiêu hoàn toàn hiện tượng rung lắc.
[PASS] Walk <-> Run Switching Preserves Frame Progress
       -> Chuyển đổi giữa bước đi và chạy nhanh giữ nguyên frame index đang phát, không giật cục về frame 0.
[PASS] Stamina Recovery Hysteresis Implemented
       -> Khi kiệt thể lực (stamina <= 0), khóa sprint cho đến khi hồi phục >= 15 stamina, ngăn rung lắc 60Hz.
[PASS] Combat & Reaction State Management Implemented
       -> Đầy đủ attack(), playHurt() (kèm tint đỏ), die() (khóa frame bất động trên sàn), và các getter kiểm tra trạng thái.
[PASS] Collider and Foot Anchor Settings Match Mathematical Ground Baseline
       -> Origin (0.50, 0.90) = pixel (32, 58). Body 14x8 offset (25, 50) có đáy Y = 50 + 8 = 58 px.
[PASS] Gate 3A Visual Evidence Files Exist and Valid
       -> satyr_contact_sheet_88_frames.png (237462 bytes) & evidence_satyr_movement_repaired.png (145238 bytes).
[PASS] Production Build & TypeScript Check Clean (0 Errors)
       -> dist/index.html tồn tại và bản build Vite + TypeScript biên dịch thành công hoàn hảo.

==================================================================
VERIFICATION RESULT: 12/12 CHECKS PASSED
==================================================================

>>> ALL GATE 3A ARCHITECTURAL & ANIMATION CHECKS COMPLETED WITH 100% SUCCESS <<<
```

- **TypeScript Typecheck:** `npx tsc --noEmit` $\rightarrow$ **0 Errors**.
- **Production Build:** `npm run build` $\rightarrow$ **Thành công** (`dist/` biên dịch hoàn tất trong 5.15s).

---

## 5. DANH MỤC TỆP NGUỒN SỬA ĐỔI & BẰNG CHỨNG HÌNH ẢNH

### Các tệp nguồn được sửa đổi:
1. [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts): Tích hợp thuật toán Direction Persistence, cơ chế Walk/Run frame preservation, Stamina hysteresis (0..15), và các phương thức chiến đấu `attack()`, `playHurt()`, `die()`.
2. [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Tích hợp gọi `player.playHurt()` và `player.die()` khi va chạm với The Listener, gọi `player.playIdle()` khi mở modal UI hoặc tạm dừng trò chơi.

### Bằng chứng hình ảnh đã phát hành:
1. **Contact Sheet 88 Frame Đánh Số:** [satyr_contact_sheet_88_frames.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/satyr_contact_sheet_88_frames.png) ($1456 \times 280\text{ px}$) và bản phóng to [satyr_contact_sheet_88_frames_2x.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/satyr_contact_sheet_88_frames_2x.png) ($2912 \times 560\text{ px}$).
2. **Hình ảnh bằng chứng chuyển động & ma trận di chuyển chéo:** [evidence_satyr_movement_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_satyr_movement_repaired.png) ($960 \times 600\text{ px}$).

---

## 6. KHUYẾT TẬT CÒN LẠI CHO CÁC GATE TIẾP THEO (REMAINING DEFECTS)

- **BUG-06 (Lighting GC Spikes):** Cấp phát và hủy đối tượng Graphics 60 lần/giây trong `updateFogOfWar()` gây áp lực lên V8 Garbage Collector $\rightarrow$ Sẽ tối ưu hóa trong Gate tiếp theo bằng cách tái sử dụng Graphics cố định.
- **BUG-09 (Survival System Redundancy & Dead Code):** Đồng bộ hóa chỉ số giữa `SatyrPlayer` và `PlayerState`, loại bỏ mã nguồn không sử dụng `src/ui/HUDScene.ts`.

---

## 7. BẢO TOÀN NGUYÊN TẮC CANON & DỪNG AN TOÀN

- Nhân vật chính **Satyr** (`SatyrPlayer`) và các định danh asset được bảo toàn nguyên vẹn 100%.
- Không chỉnh sửa tài nguyên NPC, quái vật hay địa hình.
- Không tự ý commit hoặc push Git lên remote.
- **DỪNG LẠI HOÀN TOÀN SAU GATE 3A. TUYỆT ĐỐI CHƯA BẮT ĐẦU GATE 3B.**

