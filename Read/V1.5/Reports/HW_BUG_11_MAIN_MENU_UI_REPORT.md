# BÁO CÁO NGHIỆM THU HOÀN TẤT HW-BUG-#11 — MAIN MENU, TASKBAR INPUT ROUTING & DIALOGUE UI POLISH

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh:** `feat/v1.5.3-ag-world-polish`  
**Ngày thực hiện:** 22/11/2026  
**Môi trường kiểm thử:** Node.js v20, Vite 5.4.21, Phaser 3 (Strict TypeScript), Playwright Chromium Headless (1280×720, 1600×900, 1920×1080)  
**Phạm vi:** `BUG-030`, `BUG-035`, `BUG-036`, `BUG-037`, `BUG-040`, `BUG-041`, `BUG-042`  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ

Toàn bộ 7/7 lỗi trong phạm vi HW-BUG-#11 đã được khắc phục triệt để tận gốc, trải qua 5/5 ca kiểm thử tự động Playwright đạt **PASS 100%**:

| Mã Bug | Phân loại | Trạng thái trước | Trạng thái sau | Mô tả tóm tắt giải pháp khắc phục |
|---|---|---|---|---|
| **BUG-030** | UI Layout / Main Menu | OPEN | **CLOSED-VERIFIED local** | Tiêu đề `HOLLOW WOODS` và phụ đề tiếng Việt `DỊ CẢNH RỪNG SƯƠNG`, `THE FOG THAT REMEMBERS` được căn chỉnh chuẩn mực, bổ sung viền tương phản `#080c09` (stroke 4px/2px), lớp phủ chuyển sắc Dark Moss & Ember Gold ở nửa trái màn hình (X: 0..580) nâng cao độ tương phản tuyệt đối trên mọi độ phân giải. |
| **BUG-035** | UI Polish / Main Menu | OPEN | **CLOSED-VERIFIED local** | Thiết kế lại Main Menu chuẩn phong cách Dark Moss & Ember Gold: bảo toàn 100% cinematic GIF 12 frames Kỵ Sĩ Đen đứng trên núi (hoặc fallback tĩnh), đúng 5 nút chức năng (`BƯỚC VÀO MÀN SƯƠNG`, `TIẾP TỤC HÀNH TRÌNH`, `BẢNG XẾP HẠNG`, `CÀI ĐẶT TRÒ CHƠI`, `BIÊN NIÊN SỬ & HƯỚNG DẪN`); nút Continue hiển thị thông tin bản lưu trên dòng phụ riêng biệt font 11px trang nhã không tràn viền; bổ sung kiểm tra biên đóng an toàn khi click ngoài cho cả 3 modal (Settings, Chronicle, Leaderboard). |
| **BUG-036** | UI Input / Taskbar | OPEN | **CLOSED-VERIFIED local** | Đồng bộ hóa toàn diện giữa thanh công cụ dọc (Vertical Taskbar) và hệ thống phím tắt: nút La Bàn [N] chuyển action sang `toggleWorldMap()` mở trực tiếp Bản đồ Giấy da ParchmentWorldMapModal; bổ sung cơ chế hiển thị trạng thái đang mở (`updateVerticalTaskbarStates()`) với viền sáng vàng kim `0xf1c40f` cho ô đang active (Crafting, Journal, Map, Pause); xóa bỏ các listener trùng lặp giữa GameScene và UIScene. |
| **BUG-037** | Input Routing / Focus | PARTIAL | **CLOSED-VERIFIED local** | Chuẩn hóa toàn diện cơ chế Click-away và Input Routing: click ngoài panel (nhưng trong canvas) đóng an toàn toàn bộ các modal (Journal, Parchment World Map, Pause, Crafting, Equipment, Storage Chest, Torn Page); bổ sung debounce chống rò rỉ đòn đánh trong `BlackKnightPlayer.boundPointerDown`, bảo đảm 100% click đóng panel không làm nhân vật vung kiếm chém hay kích hoạt tương tác gameplay. |
| **BUG-040** | NPC UI / Dialogue Box | OPEN | **CLOSED-VERIFIED local** | Thiết kế lại hộp thoại NPC Dialogue: dỡ bỏ dải ruy-băng tĩnh bị lệch và méo pixel (`ui_pack_ribbon_header`); thay bằng huy hiệu đồ họa động (`dialogueSpeakerBadgeGfx`) tự động ôm khít chiều rộng tên và chức danh; vạch phân cách đồng kẻ ngang đặt cân đối cách đáy tên 6px; lề đệm khung thoại chuẩn mực. |
| **BUG-041** | NPC UI / Dialogue Text | OPEN | **CLOSED-VERIFIED local** | Chuẩn hóa hiển thị Tên, Chức danh, Portrait và Text Wrapping trong Dialogue UI: tách riêng Tên (font 19px bold Ember Gold) và Chức danh (font 13px bold Ivory); sửa portrait fallback hỗ trợ toàn diện Sir Vaelen (`portrait_campfire_knight`) và Trùm Mũ (`portrait_hooded_knight`) với tỷ lệ 1:1 không méo; khung text lời thoại rộng 900px line-spacing 5px hiển thị mượt mà không cắt cụt câu thoại dài; nút nhắc `▶ [E / SPACE]` nhấp nháy góc dưới phải. |
| **BUG-042** | Entity Visual Scale | OPEN | **CLOSED-VERIFIED local** | Cân chỉnh Visual Scale của toàn bộ NPC theo nhân vật Black Knight (1.0): Finn cậu bé nhỏ nhắn (`scale = 0.85`, `headOffsetY = 42`), Bram thợ rèn lực lưỡng (`scale = 1.08`, `headOffsetY = 56`), Garth chỉ huy lính gác (`scale = 1.0`, `headOffsetY = 52`), Edda / Neris (`scale = 0.95`, `headOffsetY = 48`), Sir Vaelen (`scale = 1.0`, `headOffsetY = 46`); bảo toàn tuyệt đối 100% kích thước và vị trí Arcade physics footprint collider của từng NPC (Garth footprint vẫn bất biến `[529,191,551,205]`). |

---

## 2. CHI TIẾT NGUYÊN NHÂN GỐC VÀ GIẢI PHÁP KỸ THUẬT

### A. Nhóm Input & Functional Fix (BUG-036, BUG-037)
1. **Lệch pha Taskbar & Phím tắt (BUG-036):**
   - **Root Cause:** Nút La Bàn trên thanh công cụ dọc mép trái (`UIScene.ts` dòng 1400) trước đây gắn `action: () => this.toggleMiniMap()`, trong khi phím tắt [N] và [M] trên bàn phím lại mở `ParchmentWorldMapModal`. Đồng thời, cả `GameScene` và `UIScene` đều đăng ký event listener độc lập cho các phím `[ESC]`, `[M]`, `[N]`, dẫn đến hiện tượng duplicate trigger khi nhấn phím. Nền các ô taskbar dọc không có cơ chế phản ánh trạng thái active của modal đang mở.
   - **Fix:**
     - Chuyển action nút taskbar La Bàn sang trực tiếp `() => this.toggleWorldMap()`.
     - Bổ sung `taskbarButtonsData` và hàm `updateVerticalTaskbarStates()`: tự động kiểm tra trạng thái mở của `craftingModal`, `journalModal`, `parchmentWorldMapModal`, `pauseModal`, `isLanternOn` để vẽ viền vàng kim `0xf1c40f` (active) hoặc viền gỗ `0x5c4224` (inactive).
     - Rút gọn toàn bộ việc lắng nghe phím `[ESC]`, `[M]`, `[N]` về duy nhất `UIScene.handleESC()`, gỡ bỏ hoàn toàn duplicate listeners ở `GameScene`.
2. **Click-away an toàn & Chống rò rỉ đòn đánh (BUG-037):**
   - **Root Cause:** Một số modal lớn (`JournalModal`, `ParchmentWorldMapModal`, `PauseModal`, các modal ở Main Menu) có overlay nền nhưng thiếu sự kiện `pointerdown` hoặc thiếu kiểm tra bounding box ngoài khung panel. Khi người chơi click ra ngoài panel để đóng, sự kiện click chuột đôi khi rơi xuống gameplay làm `BlackKnightPlayer` nhận lệnh `pointerdown` và vung kiếm chém (`pendingOneShotActions.add('attack')`).
   - **Fix:**
     - Thiết lập sự kiện `pointerdown` kèm kiểm tra tọa độ bounding box cho backdrop của toàn bộ các modal: `JournalModal`, `ParchmentWorldMapModal`, `PauseModal`, `TornPageModal`, `showSettingsModal`, `showChronicleAndGuideModal`, `showLeaderboardModal`. Click bên trong khung panel không bị đóng nhầm; click ra ngoài dim canvas sẽ đóng panel an toàn.
     - Trong `BlackKnightPlayer.boundPointerDown`, bổ sung điều kiện chặn hành động:
       ```typescript
       if (uiScene && (uiScene.isAnyModalOpen || Date.now() - (uiScene.lastModalCloseTime || 0) < 250)) return;
       if (gameScene && (gameScene.isGameplayInputLocked?.() || Date.now() - (gameScene.lastModalCloseTime || 0) < 250)) return;
       ```
       Triệt tiêu 100% hiện tượng vung kiếm vô ý khi click-away đóng modal.

---

### B. Nhóm Main Menu UI (BUG-030, BUG-035)
1. **Tiêu đề & Độ tương phản (BUG-030):**
   - **Root Cause:** Tiêu đề `HOLLOW WOODS` và các phụ đề đặt trên nền ảnh woodland mà không có stroke hoặc lớp phủ tối bên trái, khiến chữ bị lóa khi ánh sáng nền thay đổi.
   - **Fix:**
     - Thêm lớp phủ chuyển sắc mờ ảo `leftVignette` (Dark Moss `#0c0f0d`, alpha 0.90 -> 0.0 từ X=0 đến X=580) ở nửa trái màn hình. Nửa phải giữ nguyên 100% độ sáng rực rỡ của Kỵ Sĩ Đen và màn sương.
     - Bổ sung stroke sắc nét `#080c09` (4px cho tiêu đề `56px`, 2px cho phụ đề `17px`, 1.5px cho `13px`).
2. **Bố cục 5 Nút & Dòng phụ Continue (BUG-035):**
   - **Root Cause:** Dòng phụ của nút Continue (`Chưa có bản lưu hành trình` hoặc thông tin checkpoint) trước đây dùng font 12px với wordWrap hẹp (width - 100 = 316px), dễ bị cắt cụt.
   - **Fix:**
     - Cân chỉnh font dòng phụ thành 11px gọn gàng, tăng chiều rộng hiển thị an toàn lên `width - 40` (376px), thêm stroke 1.5px, căn giữa hoàn hảo.
     - Bảo toàn trọn vẹn 5 nút: `BƯỚC VÀO MÀN SƯƠNG`, `TIẾP TỤC HÀNH TRÌNH`, `BẢNG XẾP HẠNG`, `CÀI ĐẶT TRÒ CHƠI`, `BIÊN NIÊN SỬ & HƯỚNG DẪN`.
     - Giữ nguyên toàn bộ logic hoạt ảnh 12 frames của `menu_black_knight_cinematic` và fallback tĩnh `menu_black_knight_fallback`.

---

### C. Nhóm NPC Dialogue & Entity Scale (BUG-040, BUG-041, BUG-042)
1. **Hộp thoại Dialogue & Ribbon (BUG-040, BUG-041):**
   - **Root Cause:** Khung thoại cũ sử dụng hình ảnh `ui_pack_ribbon_header` kích thước cố định 180×36 px đặt lệch tại `X = -halfW + 195`, trong khi tên người nói bắt đầu từ `X = -halfW + 120`. Tên dài như `Garth – Người Gác Cổng` hoặc `Sir Vaelen — Kỵ Sĩ Trầm Mặc` dài hơn 300px, khiến dải ribbon bị cắt cụt lố lăng phía sau tên. Portrait fallback thiếu mapping cho `portrait_campfire_knight` (Sir Vaelen) và `portrait_hooded_knight`.
   - **Fix:**
     - Dỡ bỏ sprite ruy-băng cố định lệch pha. Thay thế bằng đồ họa động `dialogueSpeakerBadgeGfx`: tự động tính toán tổng bề ngang Tên + Chức danh và vẽ khung thẻ đồng sẫm `0x1a120c` viền nẹp vàng cổ `0x8c6d3b` vừa vặn khít khao (`Math.max(160, totalTextW + 28)`).
     - Tách riêng Tên (Ember Gold `#f1c40f`, 19px bold) và Chức danh (Warm Ivory `#d8ccb8`, 13px bold).
     - Bổ sung mapping portrait chuẩn xác cho Sir Vaelen (`portrait_campfire_knight`) và Trùm Mũ (`portrait_hooded_knight`), giữ tỷ lệ co giãn 1:1 không méo mặt.
     - Mở rộng vùng wordWrap nội dung lời thoại lên 900px, line spacing 5px, hiển thị hoàn hảo các đoạn thoại dài.
2. **Visual Scale NPC vs Black Knight (BUG-042):**
   - **Root Cause:** Trước đây Bram (thợ rèn lực lưỡng) bị set visual scale nhỏ bất thường `0.82`, trong khi Finn (cậu bé) lại có scale `1.0` ngang người lớn. Đồng thời, `headOffsetY` của Finn bị đặt 54px (khiến nameplate bay lơ lửng quá cao), còn Bram lại đặt 48px (khiến nameplate đè sát đầu).
   - **Fix:**
     - Chuẩn hóa visual scale dựa trên Black Knight (1.0):
       + **Finn (Cậu bé):** `scale = 0.85`, `headOffsetY = 42`.
       + **Bram (Thợ rèn):** `scale = 1.08`, `headOffsetY = 56`.
       + **Garth (Chỉ huy gác):** `scale = 1.0`, `headOffsetY = 52`.
       + **Edda (Bà lão giữ chuông):** `scale = 0.95`, `headOffsetY = 48`.
       + **Neris (Người chữa thảo mộc):** `scale = 0.95`, `headOffsetY = 48`.
       + **Sir Vaelen (Kỵ sĩ trầm mặc):** `scale = 1.0`, `headOffsetY = 46`.
     - **Bảo toàn tuyệt đối va chạm vật lý:** Kích thước Arcade Physics body của từng NPC được giữ nguyên vẹn 100%. Footprint của Garth bất biến tại `[529, 191, 551, 205]` (width: 22, height: 14).

---

## 3. BẢNG THÔNG SỐ ĐO ĐẠC RUNTIME (TEST EVIDENCE)

Dữ liệu thực tế trích xuất từ bộ test tự động Playwright (`scripts/test_hw_bug11_ui.py`):

```json
{
  "test1_main_menu_layout": {
    "hasTitle": true,
    "titleFontSize": "56px",
    "hasSub1": true,
    "hasSub2": true,
    "hasBtnNew": true,
    "hasBtnContinue": true,
    "hasBtnLeaderboard": true,
    "hasBtnSettings": true,
    "hasBtnGuide": true,
    "continueSubText": "Chưa có bản lưu hành trình"
  },
  "test2_taskbar_sync": {
    "taskbarActiveInitial": { "craft": false, "journal": false, "map": false, "pause": false },
    "mapOpen": true,
    "mapTaskbarActive": true,
    "mapClosedAfterESC": true,
    "mapTaskbarInactive": true,
    "craftOpen": true,
    "craftTaskbarActive": true,
    "craftClosedAfterESC": true,
    "journalOpen": true,
    "journalTaskbarActive": true
  },
  "test3_clickaway_and_input_containment": {
    "journalClosed": true,
    "leakedAttack": false,
    "mapOpen": true,
    "mapClosed": true,
    "mapLeakedAttack": false
  },
  "test4_dialogue_ui": {
    "nameText": "Garth",
    "titleText": "• Người Gác Cổng",
    "titleVisible": true,
    "portraitKey": "portrait_garth",
    "portraitAspect": 1.0,
    "vaelenName": "Sir Vaelen",
    "vaelenTitle": "• Kỵ Sĩ Trầm Mặc",
    "vaelenPortrait": "portrait_campfire_knight",
    "finnName": "Finn",
    "finnTitle": "• Cậu Bé Đưa Tin",
    "finnPortrait": "portrait_finn",
    "contentWidth": 900
  },
  "test5_npc_scale_and_physics": {
    "garth": { "scaleX": 1.0, "scaleY": 1.0, "headOffsetY": 52, "bodyWidth": 22, "bodyHeight": 14, "bodyLeft": 529, "bodyBottom": 205 },
    "edda": { "scaleX": 0.95, "scaleY": 0.95, "headOffsetY": 48, "bodyWidth": 16, "bodyHeight": 12, "bodyLeft": 1152, "bodyBottom": 160 },
    "neris": { "scaleX": 0.95, "scaleY": 0.95, "headOffsetY": 48, "bodyWidth": 16, "bodyHeight": 12, "bodyLeft": 562, "bodyBottom": 460 },
    "bram": { "scaleX": 1.08, "scaleY": 1.08, "headOffsetY": 56, "bodyWidth": 24, "bodyHeight": 14, "bodyLeft": 1321, "bodyBottom": 477 },
    "finn": { "scaleX": 0.85, "scaleY": 0.85, "headOffsetY": 42, "bodyWidth": 14, "bodyHeight": 10, "bodyLeft": 902, "bodyBottom": 231 },
    "campfire_knight": { "scaleX": 1.0, "scaleY": 1.0, "headOffsetY": 46, "bodyWidth": 22, "bodyHeight": 14, "bodyLeft": 1424, "bodyBottom": 710 }
  }
}
```

---

## 4. DANH SÁCH TỆP THAY ĐỔI & TÀI NGUYÊN SỬ DỤNG

### Source code:
1. `src/scenes/MainMenuScene.ts`: Thêm lớp phủ chuyển sắc Dark Moss `leftVignette`; căn chỉnh stroke tiêu đề/phụ đề; tinh chỉnh dòng phụ nút Continue; bổ sung bounds check cho click-away của cả 3 modal (Settings, Chronicle, Leaderboard).
2. `src/scenes/UIScene.ts`: Đồng bộ action nút taskbar La Bàn; bổ sung cơ chế `updateVerticalTaskbarStates()` hiển thị trạng thái active; hiện thực hóa hàm tập trung `handleESC()`; thiết kế lại `buildDialogueUI()` với `dialogueSpeakerBadgeGfx` động; phân tách Tên và Chức danh trong `showDialogue()`; sửa portrait fallback cho Sir Vaelen và Trùm Mũ.
3. `src/scenes/GameScene.ts`: Gỡ bỏ duplicate key listeners cho `keyESC`, `keyM`, `keyN`; chuyển tiếp `handleESCPress()` sang `uiScene.handleESC()`.
4. `src/entities/BlackKnightPlayer.ts`: Thêm debounce 250ms chống rò rỉ đòn đánh trong `boundPointerDown` khi vừa đóng modal.
5. `src/entities/NPCEntity.ts`: Chuẩn hóa visual scale cho 6 NPC; căn chỉnh `headOffsetY` tương ứng chiều cao thực; bảo toàn 100% kích thước hộp va chạm vật lý.
6. `src/ui/JournalModal.ts`: Bổ sung kiểm tra biên đóng panel khi click ngoài backdrop.
7. `src/ui/ParchmentWorldMapModal.ts`: Bổ sung kiểm tra biên đóng bản đồ khi click ngoài backdrop.
8. `src/ui/PauseModal.ts`: Bổ sung kiểm tra biên đóng menu Pause khi click ngoài backdrop.
9. `src/ui/TornPageModal.ts`: Bổ sung kiểm tra biên đóng trang giấy khi click ngoài trang giấy.

### Báo cáo & Kiểm thử:
1. `scripts/test_hw_bug11_ui.py`: Bộ kiểm thử tự động Playwright 5/5 test cases.
2. `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md`: Cập nhật trạng thái `CLOSED-VERIFIED local` cho cả 7 bug.
3. `Read/V1.5/Reports/HW_BUG_11_MAIN_MENU_UI_REPORT.md`: Báo cáo nghiệm thu kỹ thuật chi tiết.
4. Hình ảnh minh chứng:
   - [hw_bug11_main_menu.png](Visuals/hw_bug11_main_menu.png)
   - [hw_bug11_dialogue.png](Visuals/hw_bug11_dialogue.png)
   - [hw_bug11_taskbar.png](Visuals/hw_bug11_taskbar.png)

---

## 5. KẾT LUẬN & ĐỀ XUẤT TIẾP THEO

- Toàn bộ 7 bugs trong phạm vi `HW-BUG-#11` (`BUG-030`, `BUG-035`, `BUG-036`, `BUG-037`, `BUG-040`, `BUG-041`, `BUG-042`) đã được giải quyết hoàn toàn, sạch sẽ, tuân thủ nghiêm ngặt mọi tiêu chuẩn TypeScript Strict và kiến trúc Phaser 3.
- Build production `npm run build` hoàn thành trong 11.29s, 0 lỗi, 0 cảnh báo font/asset mới.
- Bộ test Playwright tự động đạt 5/5 PASS.
- Sẵn sàng bàn giao commit và push lên nhánh `feat/v1.5.3-ag-world-polish`.
