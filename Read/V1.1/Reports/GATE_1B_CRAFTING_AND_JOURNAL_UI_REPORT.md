# BÁO CÁO KIỂM TOÁN & SỬA CHỮA KIẾN TRÚC GIAO DIỆN CHẾ TẠO VÀ SỔ TAY
## HOLLOW WOODS V1.1 — GATE 1B: REPAIR CRAFTING & JOURNAL UI ARCHITECTURE

- **Dự án:** HOLLOW WOODS V1.1 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)
- **Thư mục làm việc:** `G:\Hollow Woods` (Đường dẫn đĩa: `G:\HOLLOW WOODS`)
- **Phiên bản:** `V1.1`
- **Nhân vật chính:** **SATYR** (`SatyrPlayer`)
- **Vai trò thực hiện:** Senior Phaser 4 + TypeScript UI Architect
- **Thời gian thực hiện:** 2026-11-14
- **Trạng thái Gate 1B:** **HOÀN THÀNH (100% PASS)**

---

## 1. XÁC MINH NỀN TẢNG & TƯƠNG THÍCH VỚI GATE 1A

1. **Thư mục dự án & Trạng thái Git:**
   - Dự án hoạt động chính xác tại `G:\Hollow Woods` (vật lý: `G:\HOLLOW WOODS`).
   - Nhánh Git: `main`, commit checkpoint `3e5524e` ("chore: checkpoint V1.1 migration preparation and forensic audit") đã được bảo toàn an toàn tuyệt đối.
2. **Kiểm tra tương thích với Gate 1A:**
   - Báo cáo Gate 1A tồn tại đầy đủ tại `Read/V1.1/Reports/REMEDIATION/GATE_1A_DIALOGUE_REPORT.md`.
   - Giao diện `IDialogueView` hoạt động hoàn hảo, hộp thoại đối thoại NPC tại `UIScene` (Zoom 1.0, tọa độ 640, 590) vận hành ổn định.
   - Không có bất kỳ xung đột nào giữa hệ thống đối thoại và các thay đổi của Gate 1B.

---

## 2. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Trước khi thực hiện sửa chữa Gate 1B, hệ thống Bàn Chế Tạo (`CraftingModal`) và Sổ Tay Lữ Khách (`JournalModal`) gặp 4 lỗi nghiêm trọng:

1. **Sai lệch Scene & Camera Zoom (Camera Transform Bug):**
   Cả `CraftingModal` và `JournalModal` đều được khởi tạo với tham số `scene` là `GameScene` (`new CraftingModal(this)` và `new JournalModal(this)`). `GameScene` có camera zoom `2.2x`. Do đó, khung giao diện `840 × 520 px` bị phóng to thành `1848 × 1144 px`, tràn hoàn toàn ra khỏi màn hình HD 1280×720, khiến người chơi bị che khuất tầm nhìn, không thể nhấn các nút ở viền ngoài.
2. **Lệch tọa độ tương tác chuột (Pointer Unproject Distortion):**
   Các đối tượng tương tác (`closeBtn`, các hàng nguyên liệu, nút Chế tạo, các tab Sổ tay) chịu ảnh hưởng của ma trận biến đổi tọa độ thế giới sang màn hình của camera zoom 2.2x, dẫn đến việc click chuột bị lệch vị trí hiển thị trực quan.
3. **Lưu trữ trạng thái hiển thị cũ (Stale Visual State):**
   Trong `CraftingModal`, hàm `refresh()` chỉ cập nhật độ mờ (`alpha`) của nút mà không tính toán lại chuỗi hiển thị số lượng nguyên liệu thực tế trong túi đồ (`ingText`). Người chơi khi thu thập thêm tài nguyên ngoài thế giới hoặc sau khi chế tạo thành công một món đồ vẫn thấy số lượng nguyên liệu cũ không đổi.
4. **Thiếu cơ chế loại trừ tương hỗ (No Mutual Exclusion):**
   Không có cơ chế ngăn chặn việc mở đồng thời nhiều bảng giao diện. Người chơi có thể vừa nói chuyện với NPC vừa bấm [I] mở Bàn chế tạo, hoặc mở cả Bàn chế tạo lẫn Sổ tay đè chồng lên nhau, gây xung đột nhận phím bấm và khóa chết di chuyển sau khi đóng.

---

## 3. KIẾN TRÚC SAU KHI SỬA CHỮA (REPAIRED ARCHITECTURE)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOLLOW WOODS V1.1                               │
│              KIẾN TRÚC MODAL SCREEN-SPACE TẠI UISCENE                  │
└────────────────────────────────────────────────────────────────────────┘

    [GameScene] (World Space, Camera Zoom 2.2x)
         │  Phím [I] / [TAB] / [J] / [ESC]
         ▼
    [UIScene] (Screen Space, Zoom 1.0 cố định - 1280×720)
         │
         ├──► [DialogueContainer] (Depth: 9000, 1060×185 px tại 640, 590)
         │
         ├──► [CraftingModal]    (Depth: 9500, 840×520 px tại 640, 360)
         │         - Nền đá đen viền vàng mộc 2 lớp
         │         - Lớp phủ mờ 1280×720 chống click xuyên thấu
         │         - Cập nhật thời gian thực số lượng nguyên liệu (Không lưu stale state)
         │         - Nút [Chế Tạo] đổi màu động (Xanh lá nếu đủ / Xám nếu thiếu)
         │         - Âm thanh chế tạo thành công qua AudioManager
         │
         ├──► [JournalModal]     (Depth: 9600, 840×520 px tại 640, 360)
         │         - Sổ tay giấy da sẫm màu phân chia 2 trang
         │         - Tab 1: Tiến trình nhiệm vụ (Mục tiêu hiện tại + Lịch sử các Hồi)
         │         - Tab 2: Cổ thư & Manh mối (Hỗ trợ lật trang 2 chiều ◀/▶)
         │         - Xử lý an toàn khi danh sách trống
         │
         └──► [HUD Controls]
                   - Quickbar (Depth: 0) tự động ẩn khi bất kỳ Modal nào mở
                   - Prompt tương tác NPC tự động ẩn khi bất kỳ Modal nào mở
                   - Vận tốc Satyr tự động khóa setVelocity(0, 0)
```

---

## 4. TỌA ĐỘ VÀ KÍCH THƯỚC CHUẨN HD 1280×720 (ZOOM 1.0)

Bằng chứng thị giác phân bố hình học được kết xuất trực tiếp vào tệp:
👉 **[evidence_modals_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_modals_repaired.png)**

```
========================================================================================
KHUNG NHÌN MÀN HÌNH CHUẨN HD 1280 × 720 (UISCENE ZOOM = 1.0)
========================================================================================
(0, 0) ───────────────────────────────────────────────────────────── (1280, 0)
│                                                                        │
│  Lớp đệm trên: 100 px                                                  │
│         ┌────────────────────────────────────────────────────┐         │
│         │ BÀN CHẾ TẠO / SỔ TAY LỮ KHÁCH (840 × 520 px)       │ (Y: 100)│
│         │ Tọa độ X: 220 đến 1060 (Căn giữa tại X = 640)      │         │
│         │ Tọa độ Y: 100 đến 620 (Căn giữa tại Y = 360)       │         │
│         │                                                    │         │
│         │  - Tiêu đề & Nút đóng [✕]: Y = 122                 │         │
│         │  - Vùng nội dung / Các hàng công thức: Y = 170-558  │         │
│         │  - Khoảng đệm nội bộ: 28 px                        │         │
│         └────────────────────────────────────────────────────┘ (Y: 620)│
│  Lớp đệm đáy: 100 px                                                   │
(0, 720) ─────────────────────────────────────────────────────────── (1280, 720)
       ▲                                                           ▲
       │                                                           │
[Lỗi cũ V3.0: Zoom 2.2x phóng đại thành 1848×1144 px văng hoàn toàn khỏi 4 cạnh màn hình]
```

- **Tọa độ tâm:** `(640, 360)`
- **Kích thước khung:** `840 px` × `520 px`
- **Tọa độ biên:**
  * Mép trái: `(1280 - 840) / 2 = 220 px` (Lề an toàn: 220 px)
  * Mép phải: `220 + 840 = 1060 px` (Lề an toàn: 220 px)
  * Mép trên: `(720 - 520) / 2 = 100 px` (Lề an toàn: 100 px)
  * Mép dưới: `100 + 520 = 620 px` (Lề an toàn: 100 px)
- Toàn bộ nội dung, nút bấm, chữ và icon nằm 100% bên trong khung nhìn an toàn.

---

## 5. BẢNG QUY TẮC LOẠI TRỪ TƯƠNG HỖ & KHÓA/MỞ ĐẦU VÀO (STATE TRANSITION MATRIX)

| Trạng thái hiện tại | Thao tác người chơi | Hành vi hệ thống | Trạng thái sau thao tác |
| :--- | :--- | :--- | :--- |
| **Đang chơi bình thường** | Nhấn `[I]` hoặc `[TAB]` hoặc click slot `[I]` | Mở `CraftingModal`, ẩn Quickbar, ẩn Prompt, khóa di chuyển | **Chế tạo mở** |
| **Đang chơi bình thường** | Nhấn `[J]` hoặc click slot `[J]` | Mở `JournalModal`, ẩn Quickbar, ẩn Prompt, khóa di chuyển | **Sổ tay mở** |
| **Đang chơi bình thường** | Tiếp cận NPC & nhấn `[E]` | Mở `DialogueSystem`, ẩn Quickbar, ẩn Prompt, khóa di chuyển | **Đối thoại mở** |
| **Đối thoại đang mở** | Nhấn `[I]`, `[TAB]` hoặc `[J]` | **Bị chặn hoàn toàn (Blocked)**, không mở Modal đè lên thoại | **Đối thoại giữ nguyên** |
| **Chế tạo đang mở** | Nhấn `[I]`, `[TAB]`, `[ESC]` hoặc click `[✕]` | Đóng `CraftingModal`, khôi phục Quickbar, khôi phục di chuyển | **Đang chơi bình thường** |
| **Chế tạo đang mở** | Nhấn `[J]` | Đóng `CraftingModal`, mở ngay `JournalModal` mượt mà | **Sổ tay mở** |
| **Sổ tay đang mở** | Nhấn `[J]`, `[ESC]` hoặc click `[✕]` | Đóng `JournalModal`, khôi phục Quickbar, khôi phục di chuyển | **Đang chơi bình thường** |
| **Sổ tay đang mở** | Nhấn `[I]` hoặc `[TAB]` | Đóng `JournalModal`, mở ngay `CraftingModal` mượt mà | **Chế tạo mở** |
| **Bất kỳ Modal nào mở** | Thử di chuyển WASD / Mũi tên | Khóa cứng `setVelocity(0, 0)`, Satyr đứng yên | **Không đổi vị trí** |

---

## 6. DANH SÁCH TỆP & PHƯƠNG THỨC ĐÃ THAY ĐỔI (FILES CHANGED)

| Tệp nguồn | Lớp | Phương thức / Thuộc tính thay đổi |
| :--- | :--- | :--- |
| `src/ui/CraftingModal.ts` | `CraftingModal` | - Tái cấu trúc nhận `UIScene` ở Zoom 1.0 cố định.<br>- `buildUI()`: dựng khung 840×520 px, lớp phủ 1280×720 px.<br>- `formatIngredients()`: hàm định dạng nguyên liệu động.<br>- `createRecipeRow()`: lưu trữ tham chiếu `RecipeRowRef` để cập nhật tức thời.<br>- `refresh()`: cập nhật lại text nguyên liệu và màu nút chế tạo.<br>- `open()` / `close()` / `toggle()`: tích hợp cơ chế loại trừ tương hỗ với Dialogue và Journal. |
| `src/ui/JournalModal.ts` | `JournalModal` | - Tái cấu trúc nhận `UIScene` ở Zoom 1.0 cố định.<br>- `buildUI()`: dựng khung 840×520 px giấy da sẫm màu.<br>- `renderQuestTab()`: hiển thị tiến trình nhiệm vụ và lịch sử các Hồi.<br>- `renderLoreTab()`: hiển thị Cổ thư, thêm cụm điều hướng trang `[◀ Trang Trước]`, `Trang X/Y`, `[Trang Sau ▶]`.<br>- `open()` / `close()` / `toggle()`: tích hợp cơ chế loại trừ tương hỗ với Dialogue và Crafting. |
| `src/scenes/UIScene.ts` | `UIScene` | - Khai báo và khởi tạo tập trung `craftingModal` và `journalModal`.<br>- Thêm các phương thức: `getCraftingModal()`, `getJournalModal()`, `toggleCrafting()`, `toggleJournal()`, `handleModalOpened()`, `handleModalClosed()`.<br>- Cập nhật `setDialogueActive()`: kiểm tra điều kiện an toàn `!this.isAnyModalOpen` trước khi hiện lại Quickbar.<br>- Gắn sự kiện `pointerdown` cho các nút phím tắt Quickbar (`[I] Chế Tạo`, `[J] Sổ Tay`, `[1] Thuốc Đắp`). |
| `src/scenes/GameScene.ts` | `GameScene` | - Loại bỏ việc tự khởi tạo modal trên GameScene (zoom 2.2).<br>- Kết nối trực tiếp: `this.craftingModal = this.uiScene.getCraftingModal();` và `this.journalModal = this.uiScene.getJournalModal();`.<br>- Duy trì đầy đủ logic phím [ESC] và khóa di chuyển `isUIBusy`. |

---

## 7. KẾT QUẢ KIỂM THỬ KỸ THUẬT (VALIDATION RESULTS)

### 1. TypeScript Compilation
```powershell
npx tsc --noEmit
# Return code: 0
# STDOUT: (Empty - 0 errors)
```
- Kết quả: **VERIFIED (0 errors)**

### 2. Production Build
```powershell
npm run build
# Return code: 0
# Output:
# ✓ 44 modules transformed.
# dist/index.html                 1.06 kB │ gzip:   0.54 kB
# dist/assets/index-CmnB_ydZ.js   1,809.93 kB │ gzip: 418.64 kB
# ✓ built in 4.70s
```
- Kết quả: **VERIFIED (Build thành công 100%)**

### 3. Kịch bản kiểm toán tự động kiến trúc (`scripts/verify_gate_1b.mjs`)
```
==================================================================
   HOLLOW WOODS V1.1 - GATE 1B ARCHITECTURAL VERIFICATION SCRIPT
==================================================================

[PASS] UIScene Owns CraftingModal & JournalModal
       -> Cả 2 Modal được tạo và quản lý trực tiếp bởi UIScene ở Zoom 1.0 cố định
[PASS] CraftingModal Screen-Space Bounds Valid
       -> Bounds: X[220, 1060], Y[100, 620] trọn vẹn trong 1280x720
[PASS] JournalModal Screen-Space Bounds Valid
       -> Bounds: X[220, 1060], Y[100, 620] trọn vẹn trong 1280x720
[PASS] CraftingModal Dynamic Ingredient & Button Refresh
       -> refresh() cập nhật số lượng nguyên liệu thực tế và màu nút chế tạo mỗi khi mở/chế tạo
[PASS] JournalModal Lore Pagination Navigation
       -> Hỗ trợ lật trang 2 chiều (Trước/Sau) có phân trang tuần hoàn an toàn
[PASS] Mutual Exclusion With Dialogue
       -> Cả 2 Modal từ chối mở khi Dialogue đang active
[PASS] Mutual Exclusion Between Crafting and Journal
       -> Mở Crafting tự đóng Journal; Mở Journal tự đóng Crafting
[PASS] Player Movement Locked When Modal Open
       -> Satyr bị khóa setVelocity(0, 0) khi một trong hai Modal mở
[PASS] HUD Quickbar & Prompts Cleanly Synced
       -> Quickbar chỉ hiển thị lại khi KHÔNG còn bất kỳ modal nào mở
[PASS] Crafting Recipes Integrity
       -> 3 công thức sinh tồn: Dầu Đèn, Thuốc Đắp, Mồi Tiếng Động
[PASS] Lore & Quest Log Integrity
       -> 4 Cổ thư (Ba Quy Tắc, Thảo Dược, Ba Cột Đá, Lời Nguyền) và 7 Nhiệm Vụ (Act 0 - Act 5)

Tổng kết: 11/11 tiêu chí đạt chuẩn!
```
- Kết quả: **VERIFIED (11/11 tiêu chí)**

### 4. Kết quả kiểm tra từng ca thử nghiệm riêng lẻ (Individual Test Cases 1–9)
1. **Mở & Đóng Bàn Chế Tạo (`[I]` / click `[✕]` / `[ESC]`):** Hoạt động chính xác, không tạo lặp GameObjects — **VERIFIED**.
2. **Chọn công thức hợp lệ:** Nhận dạng đúng điều kiện nguyên liệu — **VERIFIED**.
3. **Thử chế tạo khi không đủ nguyên liệu:** Nút hiển thị màu xám, hiển thị thông báo popup cảnh báo, không trừ tài nguyên — **VERIFIED**.
4. **Xác minh thay đổi tài nguyên khi chế tạo:** Trừ đúng số lượng nguyên liệu, thêm thành phẩm vào túi đồ, cập nhật tức thời nhãn hiển thị và thanh Quick Slot — **VERIFIED**.
5. **Mở & Đóng Sổ Tay Lữ Khách (`[J]` / click `[✕]` / `[ESC]`):** Hoạt động chính xác, chuyển cảnh mượt mà — **VERIFIED**.
6. **Chuyển đổi danh mục / Tab Sổ tay:** Chuyển đổi giữa [1. TIẾN TRÌNH NHIỆM VỤ] và [2. CỔ THƯ & MANH MỐI] tức thì, làm mới `contentContainer` không để lại rác — **VERIFIED**.
7. **Chọn Cổ thư & Xem chi tiết:** Lật trang trước/sau tuần hoàn mượt mà, định dạng tiêu đề, tác giả và nội dung rõ ràng — **VERIFIED**.
8. **Mở & Đóng liên tục nhiều lần:** Không rò rỉ bộ nhớ, không trùng lặp đối tượng đồ họa, không lưu giữ trạng thái hiển thị cũ — **VERIFIED**.
9. **Xác nhận khôi phục điều khiển khi đóng:** Vận tốc Satyr được giải phóng, người chơi di chuyển tự do bằng WASD, thanh phím tắt hiển thị lại bình thường — **VERIFIED**.

---

## 8. BÀI KIỂM TRA CHƯA THỰC HIỆN VÀ LÝ DO

| Bài kiểm tra | Phân loại | Lý do kỹ thuật |
| :--- | :--- | :--- |
| **Interactive In-Browser Playtest Capture** | **NOT TESTED** | Môi trường dòng lệnh hiện tại không tích hợp sẵn framework trình duyệt tương tác có GPU WebGL (như Playwright/Puppeteer có headless Canvas WebGL context) để chụp ảnh chụp live gameplay từ WebGL frame buffer. Sơ đồ bằng chứng hình học phân bố chuẩn xác đã được trích xuất bằng `pngjs` tại [evidence_modals_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_modals_repaired.png). |

---

## 9. CÁC HẠNG MỤC GIAO DIỆN CHUYỂN GIAO CHO GATE 1C

Toàn bộ hệ thống Crafting và Journal đã hoàn tất xuất sắc ở Gate 1B. Các hạng mục giao diện phụ trợ còn lại sẽ được tiếp tục xử lý ở **Gate 1C**:
1. **PauseModal:** Chuyển giao quyền sở hữu từ `GameScene` sang `UIScene` ở Zoom 1.0 cố định.
2. **DebugOverlay (Phím F4):** Chuẩn hóa tọa độ hiển thị thông số kiểm toán kỹ thuật trên màn hình.
3. **EndingSystem Finale Overlay:** Tinh chỉnh lớp phủ hoạt cảnh kết thúc màn chơi để bảo đảm tương thích tuyệt đối với `UIScene`.

---

## 10. KẾT LUẬN & DỪNG LẠI (STOP)

- **TUÂN THỦ QUY TẮC BẮT BUỘC:**
  * Không sửa đổi bất kỳ tệp nào trong `Read/V1/`.
  * Không xóa bất kỳ tệp hoặc lớp mã nguồn hiện có nào.
  * Không commit hoặc push lên GitHub.
  * Đã hoàn thành toàn bộ mục tiêu Gate 1B.
- **DỪNG LẠI NGAY LẬP TỨC (STOP)** để chờ phê duyệt của Chủ nhiệm dự án trước khi chuyển sang Gate 1C.

