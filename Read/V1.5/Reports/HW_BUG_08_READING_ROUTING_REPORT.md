# BÁO CÁO NGHIỆM THU HOÀN TẤT HW-BUG-#8 — SỬA ĐỌC THƯ, SỔ TAY & ĐIỀU HƯỚNG TƯƠNG TÁC (BUG-038 / BUG-039 / BUG-043)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#8` / `BUG-038` / `BUG-039` / `BUG-043` (Đặc tả `B04-07A` — B04C-G & B04E1)  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (7/7 PASS 100%)**

---

## 1. MỤC TIÊU VÀ NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Nhiệm vụ `HW-BUG-#8` giải quyết triệt để 3 lỗi logic input, modal lifecycle và interaction routing theo đặc tả `B04-07A`:

### 1.1. BUG-038: Phím A / D không chuyển trang khi đọc thư / nhật ký nhiều trang
- **Hiện tượng:** Khi mở tài liệu nhiều trang (ví dụ `Mẩu Nhật Ký Rách: Kẻ Đi Trước` tại Fog Crossing gồm 2 trang), bấm phím A/D hoặc mũi tên Trái/Phải không lật trang; người chơi bị kẹt tại Trang 1 hoặc phải dùng chuột click nút thủ công.
- **Nguyên nhân gốc rễ:** Trong `src/ui/TornPageModal.ts`, code cũ đăng ký lắng nghe sự kiện update qua:
  ```typescript
  this.scene.events.on('update', this.handleUpdateKeys, this);
  ```
  Trong kiến trúc Phaser 3, SceneManager không bao giờ tự động phát sự kiện `'update'` trên `scene.events` (nó chỉ trực tiếp gọi hàm `scene.update(time, delta)` của Scene). Do đó phương thức `handleUpdateKeys()` không bao giờ được gọi sau khi mở modal, khiến toàn bộ logic polling phím A/D/Left/Right/Space/E qua `Phaser.Input.Keyboard.JustDown` bị tê liệt 100%.

### 1.2. BUG-039: Phím E / Space không cất thư/đóng đúng cách; rò rỉ input xuống Gameplay; Pause Menu chồng lặp khi bấm ESC
- **Hiện tượng:**
  1. Khi đọc thư và nhấn phím E hoặc Space để đóng/cất thư, sự kiện phím rò rỉ xuống hệ thống điều khiển nhân vật `BlackKnightPlayer`, làm nhân vật ngay lập tức vung kiếm chém, nhặt lại tài liệu vừa đóng, hoặc kích hoạt lại NPC trong frame kế tiếp.
  2. Khi nhấn ESC để thoát cửa sổ đọc thư, modal vừa đóng thì Pause Menu lập tức bật lên đè lên màn hình ("Pause chồng lặp").
  3. Khi mở lại thư đã cất (`isAlreadyCollected === true`), nhãn nút vẫn hiển thị cất thư và nguy cơ kích hoạt cộng thưởng/nhân đôi mảnh ký ức.
- **Nguyên nhân gốc rễ:**
  1. `BlackKnightPlayer.ts` sử dụng `window.addEventListener('keydown', ..., { capture: true })` để bắt phím vật lý trước toàn bộ game canvas. Khi modal UI mở, listener này không kiểm tra cờ bận của giao diện người dùng (`isUIBusy`), nên các phím A/D/E/Space/Esc vẫn được ghi nhận vào `activePhysicalCodes` và `pendingOneShotActions`. Ngay khi modal đóng, action được xả ngay vào gameplay.
  2. Trong `UIScene.ts` và `GameScene.ts`, listener `keydown-ESC` kiểm tra `isOpen` theo thứ tự tuyến tính: khi `TornPageModal.close()` đặt `isOpen = false`, listener kế tiếp thấy modal đã đóng nên lập tức gọi `togglePause()`.

### 1.3. BUG-043: Hai nhãn `[E]` cạnh Finn cạnh tranh tương tác
- **Hiện tượng:** Khi người chơi tiếp cận NPC Finn và đứng gần một vật thể tương tác khác (như Bảng Tin Dị Thường hoặc Thư cảnh báo), màn hình xuất hiện đồng thời hai nhãn `[E]` cạnh tranh, gây xao nhãng và kích hoạt nhầm mục tiêu.
- **Nguyên nhân gốc rễ:**
  1. Trong `src/entities/NPCEntity.ts`, hàm `createNamePlate()` hardcode dòng thứ 2 của bảng tên thành:
     ```typescript
     const titleText = HDTextHelper.createText(scene, 0, 8, `${spec.title} • [E]`, ...);
     ```
     Điều này khiến bất kỳ khi nào người chơi bước vào bán kính $\le 95\text{px}$ của NPC, bảng tên NPC luôn hiển thị `• [E]` (ví dụ `Cậu bé đưa tin • [E]`), bất kể NPC đó có đang được chọn làm mục tiêu tương tác hành động duy nhất hay không.
  2. Thuật toán chọn ứng viên trong `GameScene.handleInteractions()` chỉ sắp xếp theo khoảng cách thuần túy, không phân biệt giữa vật thể mới/chưa đọc với các văn bia/bảng tin đã đọc xong (`isAlreadyRead = true`).

---

## 2. GIẢI PHÁP & CÁC CHỈNH SỬA MÃ NGUỒN CHI TIẾT

### 2.1. Nâng Cấp `src/ui/TornPageModal.ts` (Modal Input Ownership & Capture Phase)
- **Độc quyền Input Listener:** Thay thế hoàn toàn cơ chế update polling bằng `window.addEventListener('keydown', this.onKeyDownCapture, { capture: true })` trong thời gian modal mở.
- **Phím A / D / ArrowLeft / ArrowRight:** Chuyển trang mượt mà giữa các trang, chặn tuyệt đối vượt biên (giữ vững trong phạm vi $0 \le \text{page} < \text{totalPages}$).
- **Chặn Rò Rỉ Input:** Gọi `e.stopPropagation()` và `e.stopImmediatePropagation()` để ngăn toàn bộ phím game (WASD, E, Space, ESC, 1-8, F) rơi xuống gameplay canvas hoặc `BlackKnightPlayer`.
- **Chống Phím Lặp & Mất Focus:** Bỏ qua các sự kiện phím giữ lặp lại (`e.repeat`), đăng ký sự kiện `blur` để tự động dọn sạch input khi chuyển tab (Alt-Tab).
- **Hỗ trợ Re-Reading & Chống Trùng Thưởng:** Khi mở lại tài liệu đã cất (`isAlreadyCollected === true`), nhãn nút hiển thị chuẩn: `"[E / Space] Đã Cất Vào Sổ Tay • Đóng"`, không cấp thêm điểm Bình Tâm hay nhân đôi mục trong Sổ Tay.
- **Reset Trạng Thái Khi Đóng:** Ghi nhận `lastModalCloseTime = Date.now()`, xóa `lastEKeyPressTime = 0`, gọi ngay `player.resetAllInputState()` và `player.forceUnlockActionState()`.

### 2.2. Nâng Cấp `src/entities/BlackKnightPlayer.ts` (Bảo Vệ Khỏi Rò Rỉ Input)
- Tại đầu hàm `handleDOMKeyDown`, bổ sung kiểm tra nghiêm ngặt `isUIBusy`:
  ```typescript
  const uiScene = (this.scene.scene.get('UIScene') as any);
  const isUIBusy = (uiScene && typeof uiScene.isAnyModalOpen === 'boolean' && uiScene.isAnyModalOpen) ||
                   (typeof gameScene.isGameplayInputLocked === 'function' && gameScene.isGameplayInputLocked()) ||
                   (gameScene.dialogueSystem && gameScene.dialogueSystem.isActive);
  if (isUIBusy) {
    return; // Tuyệt đối không nạp mã phím vật lý khi UI đang mở
  }
  ```

### 2.3. Nâng Cấp `src/scenes/UIScene.ts` & `src/scenes/GameScene.ts` (Chống Pause Trùng Lặp)
- Khai báo thuộc tính `public lastModalCloseTime: number = 0;` trong `UIScene` và `GameScene`.
- Cập nhật timestamp trong `handleModalClosed()` mỗi khi có bất kỳ modal nào đóng.
- Trong các listener `keydown-ESC` và phương thức `togglePause()`, thêm điều kiện debounce:
  ```typescript
  if (Date.now() - this.lastModalCloseTime < 300) return;
  ```
  Nhờ đó, phím ESC dùng để đóng modal đọc thư sẽ không bao giờ kích hoạt nhầm Pause Menu trong cùng một thao tác bấm.

### 2.4. Nâng Cấp `src/entities/NPCEntity.ts` & `src/scenes/GameScene.ts` (Triệt Tiêu [E] Cạnh Tranh)
- **NPCEntity Nameplate:** Bỏ hardcode `• [E]`. Mặc định dòng 2 hiển thị danh hiệu thuần túy `spec.title` (ví dụ `Cậu bé đưa tin`).
- **Phương thức `setTargeted(targeted: boolean)`:** Cập nhật nội dung tiêu đề có `• [E]` chỉ khi thực thể được chọn làm mục tiêu tương tác duy nhất.
- **Nameplate Suppression:** Khi người chơi tiến vào bán kính tương tác hành động ($\le 52\text{px}$), bảng tên cố định của NPC tự động ẩn đi (`setNamePlateSuppressed(true)`), nhường chỗ trọn vẹn cho khung nhắc trung tâm `[E] Trò chuyện với Finn`, loại bỏ hoàn toàn tình trạng 2 khung chữ chồng đè lên nhau.
- **Ưu tiên Ứng Viên Mới/Chưa Đọc:** Trong `GameScene.handleInteractions()`, khi cả 2 mục tiêu đều nằm trong tầm hành động, mục tiêu mới/chưa đọc (hoặc NPC) được ưu tiên xếp trước mục tiêu đã đọc (`isAlreadyRead = true`).

### 2.5. Nâng Cấp `src/ui/JournalModal.ts` (Lật Trang Sổ Tay Bằng Phím A / D)
- Bổ sung phím `keydown-A` / `keydown-LEFT` và `keydown-D` / `keydown-RIGHT` trong Sổ Tay Lữ Khách [J]:
  - Tại Tab **Cổ Thư & Manh Mối (Lore Tab)**: bấm A/D để lật qua lại giữa các mảnh ký ức (`currentLoreIndex`), có phát âm thanh tương tác sách cổ.
  - Tại Tab **Sinh Vật Rừng (Bestiary Tab)**: bấm A/D để duyệt qua danh sách các loài sinh vật rừng đã quan sát (`selectedBestiarySpecies`).

### 2.6. Đồng Bộ Dữ Liệu `src/data/lore.json` & `PlayerState.ts`
- Đăng ký chính thức mục `lore_fog_journal_1` vào `subAreaLoreEntries` trong `lore.json` tương ứng với mẩu giấy tại Fog Crossing.
- Bổ sung cơ chế `fallbackEntry` trong `PlayerState.unlockLore()`: đảm bảo bất kỳ tài liệu nào có `loreId` khi cất vào sổ tay đều được lưu trữ đầy đủ vào `unlockedLore`, không bao giờ bị thất lạc nội dung kể cả khi chưa có trong danh mục tĩnh.

---

## 3. HÌNH ẢNH NGHIỆM THU THỰC ĐỊA (VERIFICATION SCREENSHOTS)

### 3.1. Đọc Thư Trang 1 — Giao Diện Giấy Da Dê Cổ & Phím Điều Hướng
![Reading Page 1](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug08_reading_page1.png)  
*Mẩu Nhật Ký Rách: Kẻ Đi Trước (Trang 1/2). Hiển thị rõ chỉ báo "Trang 1 / 2", nút hành động "[E / Space] Cất Vào Sổ Tay • Đóng", nhân vật đứng yên tuyệt đối.*

### 3.2. Đọc Thư Trang 2 — Lật Trang Bằng Phím D (Không Vượt Biên)
![Reading Page 2](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug08_reading_page2.png)  
*Sau khi nhấn phím 'D', nội dung lật sang Trang 2/2 mượt mà. Nhấn tiếp 'D' giữ nguyên trang 2/2, nhấn 'A' quay lại trang 1/2 chuẩn xác.*

### 3.3. Tương Tác Sạch Sẽ Với NPC Finn — Duy Nhất Một Nhãn [E]
![Finn Interaction Clean](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/hw_bug08_finn_interaction_clean.png)  
*Người chơi đứng cạnh NPC Finn tại Bellhollow (909, 231). Chỉ duy nhất nhãn "[E] Trò chuyện với Finn" được kích hoạt; bảng tên Finn được tạm ẩn tự động, triệt tiêu hoàn toàn lỗi 2 nhãn [E] cạnh tranh.*

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG PLAYWRIGHT (100% PASS)

Bộ kịch bản kiểm thử tự động hóa chuyên biệt `scripts/test_hw_bug08_reading_routing.py` chạy qua Headless Chromium trên bản build sản phẩm (`dist/`):

| STT | Mã Kiểm Thử | Mục Tiêu Kiểm Tra | Kết Quả |
| :---: | :--- | :--- | :---: |
| 1 | `BUG_038_PAGE_NAVIGATION` | Mở thư 2 trang: phím D sang trang 2, phím D giữ trang 2 (không vượt biên), phím A về trang 1, phím A giữ trang 1; ArrowLeft / ArrowRight hoạt động tương đương. | **PASS** |
| 2 | `BUG_039_STOW_AND_CLOSE` | Phím Space/E kích hoạt cất thư: ghi nhận cờ `collected_note_...`, mở khóa Lore trong Sổ Tay, cộng điểm Bình Tâm, đóng modal sạch sẽ. | **PASS** |
| 3 | `BUG_039_ESC_NO_DOUBLE_PAUSE` | Nhấn ESC đóng modal đọc thư: modal đóng ngay lập tức, `pauseModal.isOpen` giữ nguyên `false` (loại trừ 100% lỗi Pause Menu chồng lặp). | **PASS** |
| 4 | `BUG_039_NO_DOUBLE_REWARD` | Đọc lại thư đã cất: nhãn nút chuyển sang `[E / Space] Đã Cất Vào Sổ Tay • Đóng`, điểm Bình Tâm không tăng lần 2 (+0), danh sách Lore không bị trùng lặp. | **PASS** |
| 5 | `BUG_043_FINN_INTERACTION` | Tương tác Finn tại Bellhollow: trong tầm $\le 52\text{px}$ hiện duy nhất `[E] Trò chuyện với Finn` (Nameplate tạm ẩn); ngoài tầm $75\text{px}$ bảng tên chỉ hiện `Cậu bé đưa tin` không có hardcode `• [E]`. | **PASS** |
| 6 | `INPUT_ISOLATION_STAND_STILL` | Trong lúc modal mở: nhấn giữ phím W/A/S/D nhân vật đứng yên tuyệt đối (vận tốc $v_x=0, v_y=0$). Sau khi modal đóng: phím D di chuyển mượt mà ngay lập tức. | **PASS** |
| 7 | `JOURNAL_A_D_NAVIGATION` | Điều hướng trong Sổ Tay Lữ Khách [J]: phím A/D chuyển đổi qua lại giữa các mảnh ký ức (Lore) và các loài sinh vật rừng (Bestiary). | **PASS** |

**Tổng kết:** **7 / 7 ca kiểm thử ĐẠT (100% PASS)**. 0 lỗi console, 0 asset 404.

---

## 5. DANH SÁCH TẬP TIN THAY ĐỔI (DIFF SUMMARY)

- [`src/ui/TornPageModal.ts`](file:///G:/HOLLOW%20WOODS/src/ui/TornPageModal.ts): Chuyển sang Window Capture Keydown listener, xử lý A/D/Left/Right/Space/E/Esc, chống key repeat, xử lý blur, getter thuộc tính hỗ trợ kiểm thử.
- [`src/entities/BlackKnightPlayer.ts`](file:///G:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts): Thêm kiểm tra `isUIBusy` trong `handleDOMKeyDown` ngăn rò rỉ input vật lý.
- [`src/scenes/UIScene.ts`](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts): Thêm `lastModalCloseTime`, debounce ESC $\ge 300\text{ms}$ trong listener và `togglePause()`.
- [`src/scenes/GameScene.ts`](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Khai báo `lastModalCloseTime`, bổ sung `isAlreadyRead` cho candidate, sắp xếp ưu tiên mục tiêu mới, đồng bộ gọi `setTargeted()`.
- [`src/entities/NPCEntity.ts`](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts): Xóa hardcode `• [E]` ở nameplate, bổ sung phương thức `setTargeted(targeted: boolean)`.
- [`src/ui/JournalModal.ts`](file:///G:/HOLLOW%20WOODS/src/ui/JournalModal.ts): Bổ sung phương thức và key listener A/D/Left/Right duyệt Lore và Bestiary.
- [`src/state/PlayerState.ts`](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts): Hỗ trợ `fallbackEntry` trong `unlockLore()` chống mất dữ liệu khi cất thư.
- [`src/data/lore.json`](file:///G:/HOLLOW%20WOODS/src/data/lore.json): Đăng ký chính thức `lore_fog_journal_1`.
- [`scripts/test_hw_bug08_reading_routing.py`](file:///G:/HOLLOW%20WOODS/scripts/test_hw_bug08_reading_routing.py): Kịch bản kiểm thử tự động hóa Playwright 7 ca kiểm thử.
- [`Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md): Cập nhật trạng thái `CLOSED-VERIFIED local` cho BUG-038, BUG-039, BUG-043.
