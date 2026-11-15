# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT C4-12-13
## NÂNG CẤP ĐỘ RÕ NÉT, TÍNH DỄ ĐỌC VÀ SỰ ĐỒNG BỘ CỦA GIAO DIỆN HUD, BẢNG NHIỆM VỤ VÀ CÁC CỬA SỔ TƯƠNG TÁC (HUD, QUEST TRACKER & MODALS POLISH)

- **Mã lệnh:** `COMMAND C4-12-13`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Mô hình thế giới:** **World Structure C — Hybrid Open World (Thế Giới Mở Lai 3 Tầng)**
- **Định hướng mỹ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái thực thi:** **HOÀN TẤT THÀNH CÔNG (49/49 TIÊU CHÍ QC ĐẠT 100%)**
- **Bản sao lưu trước khi sửa:** [Backups/C4-12-13_PRE_BACKUP/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-13_PRE_BACKUP/) (`UIScene.ts`, `GameScene.ts`, `NPCEntity.ts`, `CraftingModal.ts`, `JournalModal.ts`, `PauseModal.ts`).
- **Script kiểm tra tự động:** [scripts/verify_hud_ui_c4_12_13.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_hud_ui_c4_12_13.mjs).

---

## 1. TỔNG QUAN VÀ MỤC TIÊU THỰC HIỆN

Thực hiện yêu cầu chuẩn hóa toàn diện giao diện người dùng (HUD UI), khung theo dõi nhiệm vụ, thanh phím tắt nhanh Quickbar, nhãn nhắc tương tác `[E]`, bảng tên NPC và các cửa sổ tương tác Modal (Bàn Chế Tạo, Sổ Tay, Tạm Dừng) theo định hướng **Dark Woodland Pixel Art** (tham chiếu thiết kế tại `media_1794702088979_f2fe6a63.jpg`), bước **C4-12-13** tập trung giải quyết triệt để 5 vấn đề cốt lõi:

1. **Bổ sung nhãn tên và thông số số lượng rõ ràng cho 4 thanh chỉ số sinh tồn:**
   - Trước đây các thanh chỉ số chỉ là dải màu không có chữ số cụ thể, gây khó khăn cho người chơi trong việc theo dõi chính xác lượng Sinh Lực (Health), Thể Lực (Stamina), Dầu Đèn (Lantern Oil) và Bình Tâm (Composure).
   - Đã bổ sung bộ font HD sắc nét hiển thị đầy đủ:
     - `🌲 The Mossbound Wayfarer` (Huy hiệu tên nhân vật chính ở góc trên trái, tọa độ `x: 16, y: 6`).
     - `Sinh Lực: ${curH}/${maxH}` (Đỏ san hô `#ff7675`, cảnh báo đỏ thẫm `#ff4757` khi dưới 30%).
     - `Thể Lực: ${curS}/${maxS}` (Vàng hổ phách `#feca57`).
     - `Dầu Đèn: ${curO}/${maxO}` (Cam lửa `#ff9f43`, cảnh báo đỏ cam `#e74c3c` khi dưới 20%).
     - `Bình Tâm: ${curC}/${maxC}` (Tím sương mù `#a29bfe`, cảnh báo hồng tím `#fd79a8` khi dưới 30%).
   - Tinh chỉnh chỉ báo đèn lồng thành huy hiệu dạng viên nang (pill badge) có viền đồng và nền tối:
     - Khi BẬT: `🔥 ĐÈN: BẬT [F]` với viền vàng rực `#f1c40f` và nền ấm `0x3d2800`.
     - Khi TẮT: `ĐÈN: TẮT [F]` với viền xám tro `#7f8c8d` và nền đá đen `0x0e1118`.

2. **Làm gọn và sắc nét khung bảng theo dõi mục tiêu nhiệm vụ (Quest Tracker Box):**
   - Chuẩn hóa kích thước khung đạt chuẩn HD 1280×720: rộng `364px`, cao `86px`, đặt tại `x: 896, y: 20` (duy trì khoảng đệm an toàn `20px` với mép phải và mép trên màn hình).
   - Thiết kế viền kép pixel-art (khung ngoài viền đồng cổ `0x8a6d3b`, khung trong viền vàng mộc `0xd4af37`).
   - Phân chia 3 tầng thông tin rõ ràng:
     - Dòng 1: `📜 NHIỆM VỤ HIỆN TẠI [J]:` (Vàng cam `#f39c12`, bold 12px).
     - Dòng 2: Tiêu đề chương/hồi nhiệm vụ `${q.title}` (Hổ phách rực rỡ `#f1c40f`, bold 13px).
     - Dòng 3: Mục tiêu đang làm `☐ ${taskStr}` (Trắng bạc `#ecf0f1`, 12px) hoặc `✔ ${taskStr}` (Xanh lục `#2ecc71` khi hoàn thành).

3. **Nâng cấp thanh phím tắt đáy màn hình (Quickbar) với hiệu ứng chọn và số lượng nổi bật:**
   - Bố cục 7 ô phím tắt cân đối tại `(640, 684)`: `[1] Thuốc Đắp`, `[2] Dầu Đèn`, `[Q] Mồi Ném`, `[F] Đèn Lồng`, `[I] Chế Tạo`, `[J] Sổ Tay`, `[ESC] Tạm Dừng`.
   - Mỗi ô có kích thước `108×34 px`, khoảng cách bước `116px`, tổng chiều rộng `804px`, căn giữa màn hình với lề trái và lề phải đều đặn `238px`.
   - Bổ sung cơ chế chọn ô tích cực (`selectedQuickSlotIndex`):
     - Hiển thị khung viền kép vàng hổ phách nổi bật (`0xf1c40f` 2px) kèm ánh sáng nền mờ `0xf39c12` trên ô đang chọn.
     - Hỗ trợ chọn nhanh qua cả chuột (click vào ô) và bàn phím (`[1]`, `[2]`, `[Q]`, `[F]`, `[I]`, `[J]`, `[ESC]`).
   - Huy hiệu số lượng vật phẩm tiêu hao (Consumable Badges):
     - Hiển thị số lượng rõ nét: khi còn hàng hiển thị `x${count}` màu xanh lá `#2ecc71` (Thuốc Đắp), vàng cam `#f39c12` (Dầu Đèn), cam rực `#e67e22` (Mồi Ném); khi hết hàng chuyển sang màu xám mờ `#7f8c8d` (`x0`).

4. **Định vị nhãn nhắc tương tác `[E]` theo tọa độ đối tượng (Dynamic World Tracking):**
   - Nâng cấp hàm `setInteractionPrompt(prompt: string | null, worldX?: number, worldY?: number)`:
     - Khi đứng gần điểm tài nguyên hoặc vật thể bản đồ: nhãn `[E]` được tính toán tọa độ theo camera GameScene và ghim mượt mà ngay phía trên đỉnh đối tượng (`worldY - 36px`), được kẹp an toàn trong vùng biên màn hình `[160..1120]`, `[50..624] px`.
     - Tuyệt đối không che khuất thân nhân vật chính (do nhân vật đứng bên cạnh đối tượng) và không đè lên bảng tên NPC.
     - Đối với NPC: NPC Entity tự quản lý bong bóng tương tác riêng tại `y = -80` (trên đỉnh nhãn tên `y = -58` và đỉnh đầu `y = -45`), trong khi HUD phía dưới hiển thị dòng nhắc ngữ cảnh `[E] Trò chuyện với <Tên NPC>` tại `(640, 624)` giúp thông tin phân tách trực quan 100%.

5. **Đồng bộ hóa thứ tự lớp (Depth Layering) và cơ chế đóng/mở Modal mượt mà:**
   - Toàn bộ 3 Modal (`CraftingModal`, `JournalModal`, `PauseModal`) đều có lớp phủ màn hình mờ 1280×720 ngăn click xuyên thấu (`depth: 9500 - 9800`).
   - Khi bất kỳ Modal hoặc hộp thoại nào mở ra:
     - Tự động ẩn toàn bộ nhãn tương tác `[E]` và thanh phím tắt Quickbar.
     - Tắt bong bóng gợi ý của NPC lân cận.
     - Tắt banner phân khu nếu đang chạy hiệu ứng để chống đè chữ.
   - Khi đóng Modal:
     - Gọi `player.resetAllInputState()` để dọn sạch trạng thái kẹt phím di chuyển.
     - Khôi phục thanh phím tắt Quickbar mượt mà chỉ khi không còn Modal nào khác mở (Mutual Exclusion).

---

## 2. BẢNG SO SÁNH TRƯỚC VÀ SAU KHI THỰC HIỆN

| Thành Phần Giao Diện | Trước C4-12-13 | Sau Khi Nâng Cấp C4-12-13 |
| :--- | :--- | :--- |
| **Thanh chỉ số sinh tồn (Top-Left)** | Chỉ có 4 vệt màu đồ họa, không có nhãn chữ tiếng Việt và không có số lượng cụ thể. | Đầy đủ tên nhân vật `The Mossbound Wayfarer`, 4 icon pixel và 4 nhãn số liệu rõ nét: `Sinh Lực: 100/100`, `Thể Lực: 80/80`, `Dầu Đèn: 60/60`, `Bình Tâm: 40/40`. |
| **Chỉ báo Đèn lồng (Lantern Indicator)** | Dòng chữ đơn điệu lệch dòng, không có khung viền nhận diện trạng thái. | Huy hiệu dạng viên nang (pill badge) đổi màu theo trạng thái: `🔥 ĐÈN: BẬT [F]` (viền vàng hổ phách) hoặc `ĐÈN: TẮT [F]` (viền xám tro). |
| **Khung nhiệm vụ (Quest Tracker)** | Kích thước 360×84, chữ nhiệm vụ dồn chung một khối không phân cấp tiêu đề/mục tiêu. | Kích thước 364×86, viền kép pixel đồng/vàng, phân tầng rõ: Tiêu đề chương (`Hồi...`) và mục tiêu cụ thể kèm biểu tượng `☐` hoặc `✔`. |
| **Thanh phím tắt (Quickbar)** | Các nút phẳng đơn giản, không có hiệu ứng làm nổi bật ô đang chọn, số lượng x0 nhỏ khó thấy. | Khung viền kép vàng hổ phách nổi bật ô đang chọn, hỗ trợ chuyển ô bằng cả chuột và phím số, huy hiệu số lượng to rõ nét theo mã màu. |
| **Nhãn tương tác [E]** | Cố định cứng ngắc tại đáy màn hình `(640, 630)`, có nguy cơ đè vào thân nhân vật khi đi xuống mép dưới. | Tự động bám theo tọa độ thực tế của mỏ tài nguyên/vật thể trong thế giới game, kẹp biên an toàn, không đè thân nhân vật và không đè bảng tên NPC. |
| **Bảng tên NPC (Nameplate)** | Dùng text thông thường có thể bị mờ khi camera GameScene phóng to zoom 2.2. | Áp dụng `HDTextHelper.createText` độ phân giải kép (`resolution = 2, filter = LINEAR`), sắc nét hoàn hảo ở zoom 2.2. |
| **Ẩn/Hiện HUD khi mở Modal** | Một số dòng nhắc vẫn có khả năng hiển thị đè dưới lớp modal. | Cơ chế triệt tiêu 100%: khi mở bất kỳ Modal nào, toàn bộ nhãn tương tác, thanh Quickbar và bong bóng NPC đều tự động ẩn. |

---

## 3. THÔNG SỐ VÙNG AN TOÀN VÀ TỌA ĐỘ CANVAS (1280×720 STANDARD)

Mọi thành phần giao diện đều được tính toán và bố trí nằm gọn trong vùng an toàn (Safe Margin $\ge 16\text{ px}$):

```
+------------------------------------------------------------------------------------------------+
| (16, 6) [🌲 The Mossbound Wayfarer]                                    (896, 20)               |
| (16, 25) [❤] [=== Sinh Lực: 100/100 ===]                        +----------------------------+ |
| (16, 44) [⚡] [=== Thể Lực: 80/80  ===]                        | 📜 NHIỆM VỤ HIỆN TẠI [J]   | |
| (16, 62) [🔥] [=== Dầu Đèn: 60/60 ===] [🔥 BẬT [F]]            | Hồi 1: Lời Nguyền Sương Mù | |
| (16, 80) [👁] [=== Bình Tâm: 40/40 ===]                        | ☐ Thu thập 3 Thảo Dược     | |
|                                                                 +----------------------------+ |
|                                                                                      (1260, 106)|
|                                                                                                |
|                                       [E] Thu thập Cành Gỗ                                     |
|                                         (Ghim theo đối tượng)                                  |
|                                                                                                |
|                                                                                                |
|        (238, 667)                                                           (1042, 667)        |
|        +-------+-------+-------+-------+-------+-------+-------+                               |
|        | [1] 🌿| [2] 🪔| [Q] 🪵| [F] 🕯| [I] ⚒ | [J] 📖| [ESC] |                               |
|        |  x3   |  x1   |  x5   |       |       |       |       |                               |
|        +-------+-------+-------+-------+-------+-------+-------+                               |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
```

- **Top-Left HUD (Bars & Labels):** $X \in [16, 406]\text{ px}$, $Y \in [6, 92]\text{ px}$.
- **Top-Right Quest Tracker:** $X \in [896, 1260]\text{ px}$, $Y \in [20, 106]\text{ px}$ (Lề phải an toàn $20\text{ px}$).
- **Bottom-Center Quickbar:** $X \in [238, 1042]\text{ px}$, $Y \in [667, 701]\text{ px}$ (Lề dưới an toàn $19\text{ px}$).
- **Interaction Prompt `[E]`:** Kẹp an toàn trong vùng $X \in [160, 1120]\text{ px}$, $Y \in [50, 624]\text{ px}$.
- **Modals (Bàn Chế Tạo & Sổ Tay):** Căn giữa màn hình $840 \times 520\text{ px}$, $X \in [220, 1060]\text{ px}$, $Y \in [100, 620]\text{ px}$.
- **Pause Modal:** Căn giữa màn hình $480 \times 370\text{ px}$, $X \in [400, 880]\text{ px}$, $Y \in [175, 545]\text{ px}$.

---

## 4. KẾT QUẢ KIỂM THỬ KỸ THUẬT (VERIFICATION RESULTS)

### 4.1. Kiểm thử TypeScript Compiler
```bash
npx tsc --noEmit
# Exit Code: 0 (0 errors, 100% type safety)
```

### 4.2. Kiểm thử tự động bằng Script chuyên dụng (`scripts/verify_hud_ui_c4_12_13.mjs`)
```
================================================================
  C4-12-13: HUD UI, QUEST TRACKER & MODALS VERIFICATION
================================================================

  [PASS] src/scenes/UIScene.ts exists
  [PASS] UIScene defines QuickSlotRef interface
  [PASS] UIScene displays player title badge (The Mossbound Wayfarer)
  [PASS] UIScene contains healthValText
  [PASS] UIScene contains staminaValText
  [PASS] UIScene contains oilValText
  [PASS] UIScene contains composureValText
  [PASS] UIScene formats Vietnamese label for Health
  [PASS] UIScene formats Vietnamese label for Stamina
  [PASS] UIScene formats Vietnamese label for Oil
  [PASS] UIScene formats Vietnamese label for Composure
  [PASS] UIScene contains lanternStatusBg pill graphics
  [PASS] UIScene toggles ON/OFF lantern pill status with [F]
  [PASS] UIScene features clear quest header
  [PASS] UIScene contains questTitleText for chapter title
  [PASS] UIScene contains questTrackerText for active task
  [PASS] Quest box dimensions standard (364x86)
  [PASS] UIScene contains quickSlotContainer
  [PASS] UIScene supports selectQuickSlot(index)
  [PASS] UIScene implements redrawQuickSlotHighlights()
  [PASS] UIScene contains slotHighlightGraphics
  [PASS] Consumable count badges exist
  [PASS] UIScene tracks promptWorldTarget for world space follow
  [PASS] UIScene implements updatePromptPosition()
  [PASS] setInteractionPrompt supports optional world coordinates
  [PASS] UIScene contains update() hook for smooth prompt tracking
  [PASS] UIScene exposes isAnyModalOpen getter
  [PASS] UIScene implements setDialogueActive for suppressing background HUD
  [PASS] UIScene implements setHUDVisible for ending/cutscene cleanup
  [PASS] src/scenes/GameScene.ts exists
  [PASS] GameScene passes resource node world coords to setInteractionPrompt
  [PASS] GameScene passes interactable world coords to setInteractionPrompt
  [PASS] GameScene syncs quickslot 3 on lantern toggle
  [PASS] GameScene syncs quickslot 2 on lure throw
  [PASS] GameScene locks interactions when modals or dialogues are active
  [PASS] src/entities/NPCEntity.ts exists
  [PASS] NPCEntity uses HDTextHelper for sharp HD typography
  [PASS] NPC nameplate positioned at y = -58 (above head)
  [PASS] NPC prompt bubble positioned at y = -80 (above nameplate)
  [PASS] NPC prompt bubble toggles visibility dynamically
  [PASS] src/ui/CraftingModal.ts exists
  [PASS] CraftingModal dimensions standard 840x520 at 1280x720 canvas
  [PASS] CraftingModal provides 1280x720 click-blocking overlay
  [PASS] src/ui/JournalModal.ts exists
  [PASS] JournalModal dimensions standard 840x520 at 1280x720 canvas
  [PASS] JournalModal provides 1280x720 click-blocking overlay
  [PASS] src/ui/PauseModal.ts exists
  [PASS] PauseModal dimensions standard 480x370 at 1280x720 canvas
  [PASS] PauseModal provides 1280x720 click-blocking overlay

================================================================
  SUMMARY: 49 PASSED, 0 FAILED (100% SUCCESS)
================================================================
```

---

## 5. DANH SÁCH TẬP TIN THAY ĐỔI VÀ TẠO MỚI

1. [src/scenes/UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts):
   - Bổ sung `QuickSlotRef` interface.
   - Thêm nhãn tên nhân vật và 4 nhãn thông số số lượng rõ ràng (`healthValText`, `staminaValText`, `oilValText`, `composureValText`).
   - Cải tiến chỉ báo đèn lồng thành huy hiệu dạng viên nang (`lanternStatusBg`, `lanternStatusText`).
   - Tinh chỉnh khung theo dõi nhiệm vụ chuẩn kích thước 364×86 với 3 tầng thông tin.
   - Bổ sung cơ chế chọn ô tích cực trên Quickbar (`selectQuickSlot`, `redrawQuickSlotHighlights`).
   - Nâng cấp `setInteractionPrompt` và `update()` để ghim nhãn `[E]` theo tọa độ đối tượng trong thế giới.
2. [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts):
   - Truyền tọa độ thế giới thực tế của điểm tài nguyên và vật thể tương tác vào `setInteractionPrompt`.
   - Đồng bộ hóa ô phím tắt Quickbar khi bật/tắt đèn lồng (`selectQuickSlot(3)`) và ném mồi (`selectQuickSlot(2)`).
3. [src/entities/NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts):
   - Áp dụng `HDTextHelper.createText` cho bảng tên và bong bóng gợi ý `[E] Trò chuyện` của 3 NPC Garth, Edda, Neris.
4. [scripts/verify_hud_ui_c4_12_13.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_hud_ui_c4_12_13.mjs):
   - Script tự động kiểm tra 49 tiêu chuẩn kỹ thuật về HUD, Quest Box, Quickbar, Prompt và Modals.
5. [Backups/C4-12-13_PRE_BACKUP/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-13_PRE_BACKUP/):
   - Toàn bộ bản sao lưu an toàn trước khi chỉnh sửa.
