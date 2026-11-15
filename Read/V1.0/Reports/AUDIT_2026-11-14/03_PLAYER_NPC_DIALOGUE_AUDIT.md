# 🔍 BÁO CÁO KIỂM TOÁN ĐỘC LẬP: PLAYER, NPC & DIALOGUE SYSTEM
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Mã báo cáo:** `03_PLAYER_NPC_DIALOGUE_AUDIT.md`
> **Phạm vi kiểm tra:** Thực nghiệm trực tiếp 3 hệ thống cốt lõi: **(A) Player (Satyr / Dark Rogue)**, **(B) NPC (Garth, Edda, Neris)**, và **(C) Dialogue Pipeline**
> **Ngày thực hiện:** 2026-11-14

---

## 1. BẢNG TỔNG QUAN KẾT QUẢ KIỂM TOÁN 3 HỆ THỐNG

| Hệ thống kiểm tra | Hạng mục chi tiết | Kết quả đối chiếu thực tế | Đánh giá |
|---|---|---|:---:|
| **A. PLAYER** | Tính chuẩn xác của Asset | Asset là **Dark Rogue** (AI), không phải Satyr gốc; tên mã nguồn và lore giữ nguyên "Satyr" | ⚠️ **PARTIAL** |
| | Tỷ lệ & Cắt hình (Crop) | Cắt bằng X-Histogram 22 cột, ô `64×64` px, viền có răng cưa nhẹ do inverse mapping | ⚠️ **PARTIAL** |
| | Hoạt ảnh 4 hướng (Anims) | Đủ 4 hướng (Down, Left, Right, Up). Nhưng Right lệch góc so với Left | ⚠️ **PARTIAL** |
| | Idle, Walk, Run | Idle tốt; **Walk và Run dùng CHUNG 1 dải frame [4..9]**, chứa lẫn tư thế hành động khác | ⚠️ **PARTIAL** |
| | Độ mượt khi di chuyển | **Bị khựng/giật khi đi chéo (Diagonal Stutter)** do thuật toán ưu tiên trục Y khi $\|X\|=\|Y\|$ | ❌ **FAILED** |
| | Collider & Foot Anchor | Foot anchor Y = 58, Collider `14×8` px tại offset `(25, 50)`, khớp chuẩn với gót chân | ✅ **VERIFIED** |
| **B. NPC** | Sprite & Vị trí | Đủ 3 NPC (`Garth` 530,220; `Edda` 790,330; `Neris` 970,130), sprite & portrait 64×64 chuẩn | ✅ **VERIFIED** |
| | Bán kính tương tác | Bán kính 42 px tính theo công thức Euclid `Math.hypot`, hoạt động nhạy và chính xác | ✅ **VERIFIED** |
| | Phản hồi gợi ý [E] | Hiện đồng thời bong bóng `[E] Nói` trên đầu NPC và thanh chỉ dẫn đáy màn hình | ✅ **VERIFIED** |
| | Bắt phím điều khiển | Phím `E` bắt qua `JustDown(keyE)`, phản hồi tức thì, không bị double-trigger | ✅ **VERIFIED** |
| | Cấu hình & Quest Data | `dialogues.json` và `zones.json` đầy đủ cờ, lời thoại, thưởng item và chuyển hồi mạch lạc | ✅ **VERIFIED** |
| **C. DIALOGUE** | Luồng 8 bước tương tác | Bước 1..3 và 5..8 logic chạy tốt. **BƯỚC 4 (HIỂN THỊ TEXT) HỎNG 100% VĂNG NGOÀI MÀN HÌNH** | ❌ **FAILED** |

---

## 2. PHÂN TÍCH CHI TIẾT PHẦN A: PLAYER (SATYR / DARK ROGUE)

### 2.1. Satyr có đúng Asset không?
- **Hiện trạng mâu thuẫn danh tính nhân vật:**
  * Trong cốt truyện Canon V3 và thiết kế gốc, nhân vật chính là **Satyr** (một nhân vật mang cặp sừng dê thần thoại lạc vào sương mù).
  * Tuy nhiên, asset thực tế đang được nạp tại `public/assets/characters/satyr/satyr_sheet.png` (kích thước `1408×256` px) là **Dark Rogue** (nhân vật trùm áo choàng bí ẩn cầm dao găm, trích xuất từ `Pixel_Art/Dark Rogue/a_detailed_game_asset_reference_sprite_sheet_in_a.png`).
  * Tất cả các file mã nguồn (`SatyrPlayer.ts`, `satyr_animations.json`, `Constants.ts`) vẫn gọi tên nhân vật là "Satyr", tạo ra sự bất nhất giữa hình ảnh trực quan (Dark Rogue) và tên định danh (Satyr).

### 2.2. Sprite có bị crop hoặc sai tỷ lệ không?
- **Phân tích nhị phân kích thước khung hình:**
  * Bảng sprite gồm 4 hàng × 22 cột = 88 ô kích thước `64×64` px.
  * Kích thước cơ thể nhân vật dao động trong khoảng: Chiều rộng từ **21 px đến 31 px**, Chiều cao từ **39 px đến 53 px**.
  * Trong script `step2_pack_dark_rogue_grid.mjs`, thuật toán histogram projection tự động phân tách dải ảnh thành 22 cột bằng cách tìm các điểm cực tiểu (valleys).
  * Do ảnh nguồn sinh từ AI Midjourney không có lưới pixel chuẩn xác, một số frame bị co giãn không đồng đều và xuất hiện viền răng cưa (fringe artifacts) quanh mép áo choàng.

### 2.3. Bốn hướng Animation có đúng không?
- Cấu hình 4 hàng trong `satyr_sheet.png`:
  * **Hàng 0 (Down - Nhìn xuống):** Frames `0 .. 21`
  * **Hàng 1 (Left - Quay trái):** Frames `22 .. 43`
  * **Hàng 2 (Right - Quay phải):** Frames `44 .. 65`
  * **Hàng 3 (Up - Nhìn lên):** Frames `66 .. 87`
- **Vấn đề phát hiện:** Ban đầu nhóm phát triển dự định dùng lệnh `setFlipX(true)` từ hàng Left để tạo hướng Right. Về sau ở Pass T02 đã tạo riêng hàng Right độc lập (Hàng 2). Tuy nhiên, do bản vẽ nguồn AI không cân đối góc nhìn, dáng chạy của nhân vật khi quay sang phải bị lệch trọng tâm và góc nghiêng so với khi quay sang trái.

### 2.4. Idle, Walk, Run có hoạt động không?
- **Khảo sát cấu hình trong `src/data/satyr_animations.json`:**
  * `satyr_idle_down`: frames `[0, 1, 2, 3]` (frameRate: 4, repeat: -1) -> **Hoạt động tốt**.
  * `satyr_walk_down`: frames `[4, 5, 6, 7, 8, 9]` (frameRate: 8, repeat: -1).
  * `satyr_run_down`: frames `[4, 5, 6, 7, 8, 9]` (frameRate: 12, repeat: -1).
- **Phát hiện bất thường nghiêm trọng:**
  1. **Không có hoạt ảnh chạy riêng biệt:** Hoạt ảnh `walk` và `run` sử dụng **CHÍNH XÁC CÙNG 1 DẢI FRAMES** (`[4, 5, 6, 7, 8, 9]`), chỉ tăng tốc độ phát từ 8 fps lên 12 fps.
  2. **Nhiễm bẩn tư thế (Animation Contamination):** Các frame 4..9 trong ảnh AI Midjourney không phải là một chu kỳ bước chân thuần túy (walk cycle). Trong đó frame 6 và 7 nhân vật hơi khom người và tay cầm vũ khí vung ra, khiến dáng đi của nhân vật có cảm giác cà nhắc và biến dạng động tác.

### 2.5. Nhân vật có bị khựng khi di chuyển không? (LỖI DIAGONAL STUTTER)
- **Kiểm tra mã nguồn `SatyrPlayer.ts` (hàm `updateFacingDirection`):**
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
- **Cơ chế gây lỗi khựng giật:**
  * Khi người chơi nhấn tổ hợp 2 phím để đi chéo (ví dụ `W + D` hoặc `S + A`), ta có $|moveX| = 1$ và $|moveY| = 1$.
  * Phép so sánh `Math.abs(moveX) > Math.abs(moveY)` cho kết quả `false`, buộc hệ thống nhảy vào nhánh `else` (ưu tiên trục dọc Y).
  * Trong quá trình điều khiển thực tế, khi người chơi nhấn nhả phím với sai lệch vài mili-giây, giá trị `facing` liên tục nhảy qua lại giữa trục ngang và trục dọc.
  * Mỗi lần đổi `facing`, hàm `playWalkOrRunAnim()` ngắt animation hiện tại và khởi động lại từ frame đầu tiên của hướng mới, tạo ra hiện tượng **nhân vật bị khựng giật, rung lắc hướng nhìn liên tục khi di chuyển chéo**.

### 2.6. Collider và Foot Anchor có chính xác không?
- **Thông số kỹ thuật trong `src/config/Constants.ts`:**
  * Kích thước khung hình: `64×64` px.
  * Điểm neo gốc (Anchor): `SATYR_ORIGIN_X = 0.50`, `SATYR_ORIGIN_Y = 0.90` (tọa độ pixel trong ô là: $X = 32$, $Y = 57.6 \approx 58$).
  * Kích thước hộp va chạm vật lý chân: `SATYR_BODY_WIDTH = 14`, `SATYR_BODY_HEIGHT = 8`.
  * Offset vật lý: `SATYR_BODY_OFFSET_X = 25`, `SATYR_BODY_OFFSET_Y = 50`.
- **Đánh giá kiểm toán:**
  * Đáy của hộp va chạm chân nằm tại $Y = 50 + 8 = 58\text{ px}$.
  * Trục ngang của hộp va chạm nằm từ $X = 25$ đến $X = 39$ (tâm tại $X = 32$).
  * **Kết luận:** Điểm neo bàn chân và hộp va chạm vật lý Arcade Physics được căn chỉnh **hoàn toàn chính xác**, gót chân bám sát mặt đất và hỗ trợ cơ chế Y-sorting chuẩn xác khi đứng sau cây cối hay công trình.
- **Bằng chứng thị giác đã lập:** File [evidence_satyr_frames.png](file:///G:/HOLLOW%20WOODS%20V3/Read/V3.0/Reports/AUDIT_2026-11-14/evidence_satyr_frames.png) hiển thị chi tiết 10 frame đầu tiên kèm đường cơ sở gót chân màu đỏ và hộp collider màu xanh lá.

---

## 3. PHÂN TÍCH CHI TIẾT PHẦN B: HỆ THỐNG NPC

### 3.1. Danh sách Sprite và Vị trí của 3 NPC
- **Garth (Dân làng cảnh giác):**
  * Sprite: `public/assets/characters/npcs/npc_garth.png` (64×64 px, nhân vật mặc áo nâu sẫm, trùm mũ vải).
  * Chân dung: `public/assets/characters/npcs/portrait_garth.png` (64×64 px, khuôn mặt góc cạnh khắc khổ).
  * Vị trí trong game: Tọa độ **(X: 530, Y: 220)**, đứng gác tại ranh giới Cổng Tây dẫn vào làng Bellhollow.
- **Edda (Bà lão giữ chuông):**
  * Sprite: `public/assets/characters/npcs/npc_edda.png` (64×64 px, áo choàng màu xám tro, quàng khăn xám).
  * Chân dung: `public/assets/characters/npcs/portrait_edda.png` (64×64 px, nét mặt già nua bí ẩn).
  * Vị trí trong game: Tọa độ **(X: 790, Y: 330)**, đứng trước thềm Tháp Chuông làng Bellhollow.
- **Neris (Thảo dược sĩ):**
  * Sprite: `public/assets/characters/npcs/npc_neris.png` (64×64 px, áo choàng màu xanh rêu thảo mộc).
  * Chân dung: `public/assets/characters/npcs/portrait_neris.png` (64×64 px, ánh mắt sắc sảo).
  * Vị trí trong game: Tọa độ **(X: 970, Y: 130)**, đứng trước cửa ngôi nhà thảo dược phía Bắc làng.
- **Đánh giá:** Toàn bộ 6 file hình ảnh của 3 NPC đều tồn tại thực tế trên đĩa, pixel art sạch sẽ, tách biệt độc bản. Bằng chứng thị giác tổng hợp tại [evidence_npcs_composite.png](file:///G:/HOLLOW%20WOODS%20V3/Read/V3.0/Reports/AUDIT_2026-11-14/evidence_npcs_composite.png).

### 3.2. Bán kính tương tác (Interaction Range)
- Trong `src/scenes/GameScene.ts` (hàm `handleInteractions`):
  $$\text{dist} = \sqrt{(P_x - N_x)^2 + (P_y - N_y)^2} \le 42\text{ px}$$
- Bán kính **42 pixel** tương đương khoảng 1.5 lần chiều rộng nhân vật, đủ nhạy để người chơi không phải đứng dẫm lên chân NPC, đồng thời không bị kích hoạt ngoài ý muốn khi đi ngang qua.

### 3.3. Phản hồi hiển thị Prompt [E]
- Khi khoảng cách $\le 42$ px, hệ thống phát 2 tín hiệu trực quan đồng thời:
  1. Trên đỉnh đầu NPC xuất hiện bong bóng `[E] Nói` (`promptBubble` đặt tại tọa độ offset `0, -56`).
  2. Dưới đáy màn hình trên lớp `UIScene` xuất hiện dòng chữ hướng dẫn: `[E] Trò chuyện với <Tên NPC>`.
- Cơ chế kép này hoạt động nhạy bén và rõ ràng.

### 3.4. Bắt tín hiệu bàn phím (Keyboard Input)
- Phím `E` được theo dõi bằng `Phaser.Input.Keyboard.JustDown(this.keyE)`.
- Hàm `isInteractRequested()` chỉ trả về `true` đúng trong 1 frame duy nhất khi phím vừa được nhấn xuống, ngăn chặn hoàn toàn lỗi nhảy cóc hội thoại do giữ phím (Key Repeat).

### 3.5. Dữ liệu cấu hình & Luồng nhiệm vụ (Quest Flow)
- Cấu hình trong `src/data/dialogues.json` được kết nối hoàn chỉnh:
  * Nói chuyện với **Garth** -> Đánh dấu cờ `talked_to_villagers` -> Kích hoạt Quest `Q01_MEET_EDDA`.
  * Nói chuyện với **Edda** -> Lắng nghe Ba Quy Tắc Bằng Máu -> Đánh dấu cờ `talked_to_edda` -> Kích hoạt Quest `Q02_MEET_NERIS`. Lần sau tương tác sẽ phát hội thoại nhắc nhở `edda_reminder`.
  * Nói chuyện với **Neris** -> Đánh dấu cờ `talked_to_neris` -> Nhận thưởng 1 Thuốc Đắp (`item_herbal_poultice`), hồi đầy Máu và Bình tâm -> Kích hoạt Quest `Q03_PREPARE_RESOURCES`.

---

## 4. PHÂN TÍCH CHI TIẾT PHẦN C: DIALOGUE PIPELINE AUDIT

### 4.1. Bảng đối chiếu 8 bước trong toàn bộ quy trình hội thoại:

| Bước thực thi | Thao tác / Sự kiện hệ thống | Kết quả kiểm toán | Chi tiết kỹ thuật |
|:---:|---|:---:|---|
| **1** | Người chơi tiếp cận NPC trong bán kính 42 px | ✅ **PASS** | Tọa độ Euclid kích hoạt `isNear = true`, hiện prompt `[E]` |
| **2** | Người chơi nhấn phím `[E]` | ✅ **PASS** | `isInteractRequested()` kích hoạt, xác định đúng `dialogueKey` |
| **3** | `DialogueSystem.startDialogue(key)` | ✅ **PASS** | Nạp dữ liệu JSON, gán cờ `isActive = true`, gọi `onDialogueStart` khóa di chuyển |
| **4** | **HIỂN THỊ TEXT & KHUNG THOẠI TRÊN MÀN HÌNH** | ❌ **FAIL** | **LỖI TỬ HUYỆT: Khung thoại bị Camera Zoom 2.2× đẩy văng xuống Y = 866 px (ngoài màn hình 720p). Người chơi không nhìn thấy gì!** |
| **5** | Người chơi nhấn `[E]`, `[SPACE]` hoặc `[ENTER]` | ✅ **PASS** | `handleAdvance()` hoàn tất gõ chữ hoặc chuyển sang câu kế tiếp ở tầng logic ngầm |
| **6** | Duyệt hết toàn bộ các câu thoại | ✅ **PASS** | `currentLineIndex >= lines.length` chuyển sang `endDialogue()` |
| **7** | `endDialogue()` cập nhật trạng thái game | ✅ **PASS** | Đánh dấu cờ cốt truyện, trao thưởng vật phẩm, hồi máu thành công |
| **8** | Đóng giao diện hội thoại | ✅ **PASS** | `isActive = false`, gọi `onDialogueEnd` mở lại điều khiển nhân vật |

---

### 4.2. Khám nghiệm tử huyệt Bước 4: Tại sao người chơi không nhìn thấy hộp thoại?

- **Vị trí thiết lập ban đầu trong `src/systems/DialogueSystem.ts`:**
  ```typescript
  this.container = scene.add.container(640, 590);
  this.container.setScrollFactor(0);
  ```
  Nhóm phát triển đã căn chỉnh tọa độ hộp thoại tại tâm ngang $X = 640$ và cách đáy màn hình chuẩn 130 px ($Y = 590$).
- **Lỗi vị trí khởi tạo thực thể (Wrong Parent Scene):**
  Trong `src/scenes/GameScene.ts` (dòng 155):
  ```typescript
  this.dialogueSystem = new DialogueSystem(this); // 'this' ở đây là GameScene!
  ```
- **Toán học biến đổi Camera Transform của Phaser 3:**
  Trong `GameScene.ts`, Camera chính được thiết lập:
  * Kích thước Viewport: `1280 × 720`
  * Hệ số phóng to: `Zoom = 2.2`
  * Tâm phóng to: $(\text{Center X}, \text{Center Y}) = (640, 360)$

  Mặc dù container có `setScrollFactor(0)` (không trôi theo tọa độ thế giới khi nhân vật di chuyển), **Camera Zoom vẫn áp dụng phép co giãn tỉ lệ quanh tâm màn hình lên toàn bộ Display List của Scene đó**:

  $$\text{Screen Y} = \text{Center Y} + (Y_{\text{container}} - \text{Center Y}) \times \text{Zoom}$$
  $$\text{Screen Y} = 360 + (590 - 360) \times 2.2 = 360 + 230 \times 2.2 = 360 + 506 = \mathbf{866\text{ px}}$$

- **Hậu quả thị giác thực tế:**
  * Màn hình canvas game có chiều cao tối đa là **720 px**.
  * Tâm của hộp thoại bị đẩy xuống tọa độ **$Y = 866\text{ px}$** (cách mép đáy màn hình tới **146 px** về phía dưới!).
  * Vị trí câu thoại (`contentText`): Nằm tại tọa độ màn hình thực tế **$Y = 794.5\text{ px}$** (hoàn toàn ngoài màn hình).
  * Vị trí ảnh chân dung (`portraitSprite`): Nằm tại tọa độ màn hình thực tế **$Y = 866\text{ px}$** (hoàn toàn ngoài màn hình).
  * Vị trí nút gợi ý `[E / SPACE]`: Nằm tại tọa độ màn hình thực tế **$Y = 1014.5\text{ px}$** (ngoài màn hình gần 300 px!).

- **Hiện tượng người chơi gặp phải trong game:**
  * Người chơi tiến đến gần Garth, nhìn thấy chữ `[E] Trò chuyện với Garth`, hào hứng nhấn phím `E`.
  * Ngay lập tức, thanh phím tắt dưới đáy màn hình biến mất, nhân vật Satyr bị đông cứng không thể di chuyển (do hệ thống hội thoại đã chiếm quyền điều khiển).
  * Tuy nhiên, trên màn hình **KHÔNG CÓ BẤT KỲ HỘP THOẠI NÀO XUẤT HIỆN**.
  * Người chơi lầm tưởng rằng game đã bị crash hoặc treo đơ (Freeze / Soft-lock). Chỉ khi người chơi nhấn liên tục phím Space hoặc E khoảng 3-4 lần một cách mù quáng, hội thoại ngầm chạy hết, nhân vật mới di chuyển trở lại được.

- **Bằng chứng thị giác minh họa:** File [evidence_dialogue_viewport.png](file:///G:/HOLLOW%20WOODS%20V3/Read/V3.0/Reports/AUDIT_2026-11-14/evidence_dialogue_viewport.png) mô phỏng chính xác khung nhìn Canvas 1280×720 (viền xanh lá) và vị trí hộp thoại màu đỏ bị rơi ra ngoài màn hình ở đáy.

---

## 5. TỔNG KẾT VÀ KHUYẾN NGHỊ KHẮC PHỤC

1. **Về Player (Satyr):**
   - Cần thống nhất danh tính hình ảnh: Nếu giữ tên Satyr theo cốt truyện, cần sử dụng sprite có cặp sừng dê đặc trưng hoặc đổi tên nhân vật trong toàn bộ văn bản lore thành Dark Rogue.
   - Sửa thuật toán `updateFacingDirection` trong `SatyrPlayer.ts`: Khi $|moveX| == |moveY|$, giữ nguyên hướng nhìn hiện tại (`facing`) thay vì ép sang trục Y, triệt tiêu 100% hiện tượng rung lắc/khựng giật khi đi chéo.
   - Bổ sung bộ frame chạy riêng biệt hoặc tinh chỉnh dải frame walk [4..9] để loại bỏ các tư thế vung kiếm không tự nhiên khi đi bộ.

2. **Về Dialogue System & Các Modal UI (SỬA LỖI TỬ HUYỆT CẤP BÁCH):**
   - **Giải pháp dứt điểm:** Di chuyển toàn bộ việc khởi tạo của `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay` sang **`UIScene`** (nơi Camera luôn giữ `zoom = 1.0` cố định).
   - Trong `GameScene.ts`, thay vì `new DialogueSystem(this)`, sẽ gọi qua instance của `uiScene`:
     ```typescript
     // Ví dụ kiến trúc chuẩn:
     this.uiScene.openDialogue(dialogueKey);
     ```
   - Điều này sẽ ngay lập tức đưa Hộp thoại, Bàn Chế Tạo, Sổ Tay, Menu Tạm Dừng và F4 Debug Overlay trở về đúng vị trí trung tâm màn hình HD 1280×720 sắc nét, chấm dứt hoàn toàn hiện tượng văng khỏi màn hình.

---
*Báo cáo kiểm toán độc lập được thực hiện bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
