# HOLLOW WOODS V1.2 — BÁO CÁO TƯƠNG THÍCH BỘ GÕ TIẾNG VIỆT C4-12-02
## COMMAND C4-12-02 — VIETNAMESE IME COMPATIBILITY (UNIKEY / EVKEY TELEX & VNI)

- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Mã bước:** `C4-12-02`
- **Trạng thái:** **PASS**
- **Thư mục sao lưu an toàn trước khi sửa:** [Backups/C4-12-02_20261115_0640/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-02_20261115_0640)

---

## 1. KHẢO SÁT & BẢN SAO LƯU TRƯỚC KHI SỬA

Trước khi tiến hành sửa code, toàn bộ 6 file liên quan đến luồng điều khiển và giao diện người dùng đã được sao lưu toàn vẹn vào `Backups/C4-12-02_20261115_0640/`:
1. `src/entities/SatyrPlayer.ts`
2. `src/scenes/GameScene.ts`
3. `src/scenes/UIScene.ts`
4. `src/ui/CraftingModal.ts`
5. `src/ui/JournalModal.ts`
6. `src/ui/PauseModal.ts`

---

## 2. NÂNG CẤP HỆ THỐNG PHÍM VẬT LÝ & TƯƠNG THÍCH BỘ GÕ TIẾNG VIỆT

### 2.1. Ưu tiên mã phím vật lý (`KeyboardEvent.code`)
Thay vì chỉ dựa vào `event.key` (vốn bị UniKey/EVKey thay đổi thành các ký tự tiếng Việt có dấu) hoặc `event.keyCode` (bị đổi thành `231` VK_PACKET hoặc `229` IME), hệ thống ưu tiên đọc trực tiếp vị trí phím vật lý:
- **Di chuyển & Tăng tốc:** `KeyW`, `KeyA`, `KeyS`, `KeyD`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `ShiftLeft`, `ShiftRight`.
- **Tương tác & Chiến đấu:** `KeyE` (Tương tác / Trò chuyện / Ẩn nấp / Bàn chế tạo), `KeyF` (Bật/Tắt Đèn Lồng), `Space` (Tấn công / Tiếp tục hội thoại).
- **Thao tác nhanh & Giao diện:** `KeyQ` (Ném Mồi Tiếng Động), `KeyI` / `Tab` (Mở/Đóng Bàn Chế Tạo), `KeyJ` (Mở/Đóng Sổ Tay), `Digit1` (Dùng Thuốc Đắp), `Digit2` (Nạp Bình Dầu Đèn), `Escape` (Tạm Dừng / Đóng Modal), `KeyM` (Bật/Tắt Âm Thanh).

### 2.2. Ánh xạ thông minh cho gói ký tự ảo UniKey / EVKey (Telex & VNI)
Khi UniKey/EVKey phát gói phím ảo `VK_PACKET` (`keyCode = 231`) mà không gửi kèm `event.code`, hệ thống tự động nhận diện và khôi phục về mã phím vật lý tương ứng:
- `w`, `ư`, `ă`, `ơ` → `KeyW`
- `a`, `â`, `ấ`, `ầ`, `ẩ`, `ẫ`, `ậ`, `ắ`, `ằ`, `ẳ`, `ẵ`, `ặ` → `KeyA`
- `s`, `á`, `é`, `í`, `ó`, `ú`, `ý`, `ắ`, `ấ`, `ế`, `ố`, `ứ` → `KeyS`
- `d`, `đ` → `KeyD`
- `e`, `ê`, `ế`, `ề`, `ể`, `ễ`, `ệ` → `KeyE`
- `f`, `à`, `è`, `ì`, `ò`, `ù`, `ỳ`, `ằ`, `ầ`, `ề`, `ồ`, `ừ` → `KeyF`
- `q` → `KeyQ`, `i` → `KeyI`, `j` → `KeyJ`, `m` → `KeyM`
- `1` → `Digit1`, `2` → `Digit2`
- `Escape` / `Esc` → `Escape`, `Enter` → `Enter`, `Tab` → `Tab`

### 2.3. Cách ly hoàn toàn ô văn bản & quá trình ghép chữ IME
- Khi người chơi click hoặc focus vào bất kỳ ô nhập liệu nào (`<input>`, `<textarea>`, `<select>`, `[contenteditable]`), toàn bộ bàn phím Phaser và phím tắt di chuyển được vô hiệu hóa tạm thời (`resetAllInputState()`).
- Bắt sự kiện `compositionstart` và `compositionend`: Nếu đang ghép chữ trong ô văn bản, game hoàn toàn bỏ qua mọi phím tắt để chữ gõ không bị mất hoặc làm nhân vật chạy loạn.

### 2.4. Triệt tiêu hiện tượng kẹt phím (Stuck Movement)
- **Mất tiêu điểm & ẩn tab:** Đặt lại toàn bộ trạng thái phím (`resetAllInputState()`) khi cửa sổ mất tiêu điểm (`window.blur`), khi tab bị ẩn (`document.visibilitychange`) hoặc khi focus lại (`window.focus`).
- **Mở bảng hội thoại / Modal UI:** Khi NPC bắt đầu trò chuyện (`dialogueSystem.onDialogueStart`), hoặc khi mở `craftingModal`, `journalModal`, `pauseModal`, gọi ngay `this.player.resetAllInputState()` để triệt tiêu mọi quán tính di chuyển.
- **Watchdog 550ms:** Đối với các phím ảo do IME phát sinh thiếu `keyup`, cơ chế watchdog tự động giải phóng phím sau 550ms không hoạt động.

### 2.5. Chống trùng lặp sự kiện & Khử rung (Debounce)
- Quản lý listener duy nhất thông qua `activeDOMListenerOwner`, tự động gỡ bỏ sạch sẽ khi scene tắt (`shutdown`) hoặc sprite bị hủy (`destroy`).
- Bổ sung khử rung (debounce 200–250ms) cho các phím bấm `Escape`, `KeyI`, `KeyJ`, `Digit1`, `Digit2`, `KeyM` để ngăn ngừa kích hoạt kép khi cả Phaser event và DOM event cùng phản hồi.

---

## 3. DANH SÁCH FILE ĐÃ SỬA ĐỔI

1. [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts):
   - Mở rộng `OneShotAction` đầy đủ 10 hành động.
   - Thống nhất hàm `resolvePhysicalCode` tĩnh xử lý toàn diện mọi mã phím vật lý và gói UniKey/EVKey.
   - Bổ sung các query method: `isLureRequested()`, `isCraftingRequested()`, `isJournalRequested()`, `isPauseRequested()`, `isPoulticeRequested()`, `isOilRequested()`, `isMuteRequested()`.
2. [src/scenes/GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts):
   - Kết nối xử lý phím vật lý trong `update()` cho Pause, Crafting, Journal, Poultice, Oil, Mute, Lure và Dialogue Advance.
   - Tự động gọi `resetAllInputState()` khi mở/đóng modal và đối thoại.
   - Thêm khử rung debounce và dọn dẹp listener trong `shutdown`.
3. [src/scenes/UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts):
   - Thêm khử rung cho `tryConsumePoultice()` và `tryConsumeLanternOil()`.
4. [src/ui/CraftingModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CraftingModal.ts):
   - Thêm khử rung cho `toggle()`.
5. [src/ui/JournalModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/JournalModal.ts):
   - Thêm khử rung cho `toggle()`.
6. [src/ui/PauseModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/PauseModal.ts):
   - Thêm khử rung cho `toggle()`.

---

## 4. KẾT QUẢ KIỂM TRA (VERIFICATION STATUS)

| Hạng mục kiểm tra | Phương thức | Kết quả | Ghi chú |
| :--- | :--- | :---: | :--- |
| **1. Biên dịch TypeScript (`strict`)** | `npx tsc --noEmit` | **PASS** | `0` lỗi biên dịch trên toàn bộ dự án. |
| **2. Độ phủ phím vật lý chuẩn (13/13 phím)** | Node test [verify_c4_12_02_ime.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_02_ime.mjs) | **PASS** | Nhận diện chính xác `KeyW`, `KeyA`, `KeyS`, `KeyD`, `Arrows`, `KeyE/F/Q/I/J/M`, `Digit1/2`, `Escape`. |
| **3. Độ phủ gói phím Telex/VNI UniKey/EVKey (14/14 ký tự)** | Node test [verify_c4_12_02_ime.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_02_ime.mjs) | **PASS** | Ánh xạ chính xác các ký tự có dấu `ư, ă, ơ, â, á, đ, ê, à` và VK_PACKET về phím gốc. |
| **4. Cách ly ô văn bản (`isEditableElement`) (7/7 trường hợp)** | Node test [verify_c4_12_02_ime.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_02_ime.mjs) | **PASS** | Bảo vệ tuyệt đối `input`, `textarea`, `select`, `contenteditable`. |
| **5. Thử nghiệm trực tiếp UniKey / EVKey trên trình duyệt** | Người chơi trực tiếp trải nghiệm trên browser | **NOT TESTED** | Dành để người chơi bật UniKey/EVKey (Telex & VNI) gõ thử và điều khiển trên trình duyệt. |
