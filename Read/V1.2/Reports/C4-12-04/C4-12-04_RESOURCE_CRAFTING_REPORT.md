# BÁO CÁO HOÀN THÀNH C4-12-04: ỔN ĐỊNH LUỒNG THU THẬP TÀI NGUYÊN, TÚI ĐỒ, BÀN CHẾ TẠO VÀ THANH DÙNG NHANH

- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Mã lệnh thực thi:** `COMMAND C4-12-04`
- **Thời gian hoàn thành:** 15/11/2026
- **Server kiểm thử trực tiếp:** `http://localhost:3000/` (Vite v5.4.21 đang hoạt động)
- **Bản sao lưu trước khi sửa code:** `Backups/C4-12-04_20261115_0718/` (7 file mã nguồn, đối chiếu byte nguyên vẹn)

---

## 1. TỔNG QUAN NHIỆM VỤ & MỤC TIÊU C4-12-04

Giai đoạn đầu game của HOLLOW WOODS xoay quanh vòng lặp sinh tồn cốt lõi: **Khám phá -> Thu thập nguyên liệu -> Mở bàn chế tạo -> Tạo vật phẩm sinh tồn -> Đặt vào thanh dùng nhanh (Quickbar)**.

Mục tiêu của lệnh C4-12-04 là loại bỏ triệt để các lỗi tiềm ẩn:
1. Người chơi spam phím `[E]` làm nhân đôi số lượng tài nguyên nhặt được.
2. Nhãn gợi ý `[E]` bị kẹt, hiển thị sai hoặc không tự biến mất khi bước ra xa.
3. Chế tạo vật phẩm bị trừ sai số lượng nguyên liệu hoặc không cập nhật túi đồ theo thời gian thực.
4. Bấm phím số `[1]`, `[2]` hoặc click chuột trên Quickbar bị kích hoạt kép, trừ 2 bình vật phẩm hoặc lãng phí đồ khi máu/dầu đã đầy 100%.
5. Dữ liệu tài nguyên cạn kiệt và số lượng vật phẩm bị sai lệch sau khi lưu/tải game.

---

## 2. KIỂM SOÁT THU THẬP & CHỐNG NHÂN ĐÔI TÀI NGUYÊN (4 LỚP BẢO VỆ)

Để đảm bảo mỗi điểm tài nguyên chỉ thu hoạch được đúng 1 lần trong chu kỳ 40 giây:

1. **Lớp 1 (Key Consumption One-Shot):** Trong `SatyrPlayer.ts`, phương thức `isInteractRequested()` tự động tiêu thụ `this.eKeyJustPressed = false` ngay khi được đọc. Một lần nhấn `[E]` vật lý không thể kích hoạt nhiều hành động trong cùng một khung hình.
2. **Lớp 2 (Debounce Thu Hoạch):** Trong `InventorySystem.ts`, biến `lastHarvestTime` thiết lập khoảng trễ tối thiểu 250ms giữa 2 lần thu hoạch liên tiếp, ngăn chặn triệt để hiện tượng keyboard bounce.
3. **Lớp 3 (Khóa Tức Thì Node):** Ngay khi người chơi chạm mốc thu hoạch, `targetNode.available = false` và `targetNode.visual.setVisible(false)` được gán đồng bộ trước khi thực hiện bất kỳ lệnh cộng vật phẩm nào.
4. **Lớp 4 (Thẩm Định Chống Cạn Kiệt Trong Dữ Liệu):** Trong `PlayerState.ts`, phương thức `recordResourceHarvest()` kiểm tra `if (this.isNodeDepleted(nodeId)) return;`. Nếu mỏ tài nguyên đã mang cờ cạn kiệt trong chu kỳ hiện tại, lệnh cộng vật phẩm sẽ bị từ chối tuyệt đối.

---

## 3. ĐỒNG BỘ NHÃN NHẮC TƯƠNG TÁC [E] VÀ TỰ ĐỘNG ẨN

- **Khoảng cách nhận diện chuẩn:** Bán kính tương tác thống nhất `38px` (`InventorySystem.DEFAULT_INTERACTION_RADIUS`).
- **Hiển thị chính xác:** Khi người chơi đứng trong bán kính 38px của mỏ tài nguyên còn sẵn, hiển thị rõ ràng: `[E] Thu thập <Tên Vật Phẩm> (x<Số Lượng>)`.
- **Tự động ẩn ngay lập tức:**
  - Ngay trong khung hình thu hoạch thành công, `GameScene.ts` gọi trực tiếp `this.uiScene.setInteractionPrompt(null)`.
  - Khi người chơi di chuyển bước ra ngoài bán kính 38px, hệ thống tự động xóa nhãn gợi ý về `null`.
  - Khi bất kỳ Modal nào (Đối thoại, Bàn Chế Tạo, Sổ Tay, Menu Tạm Dừng) mở ra, nhãn tương tác bị ẩn triệt để.

---

## 4. CHUẨN HÓA CÔNG THỨC CHẾ TẠO & CẬP NHẬT GIAO DIỆN

3 công thức cơ bản trong `src/data/items.json` được bảo toàn nguyên tắc cân bằng sinh tồn:

| Mã công thức | Tên công thức | Nguyên liệu yêu cầu | Thành phẩm đầu ra | Ghi chú & Logic tiến trình |
| :--- | :--- | :--- | :--- | :--- |
| `craft_lantern_oil` | **Chế Tạo Dầu Đèn** | 1 Nhựa Cây (`res_tree_resin`) + 1 Gỗ Khô (`res_dry_wood`) | 1 Bình Dầu Đèn (`item_lantern_oil`) | Đạt điều kiện mở Cổng Đông Bellhollow (`craft_lantern_oil_complete`). |
| `craft_poultice` | **Giã Thuốc Đắp** | 2 Thảo Dược Bạc (`res_herbs`) | 1 Thuốc Đắp Thảo Mộc (`item_herbal_poultice`) | Hồi phục +40 Máu & +25 Bình Tâm. |
| `craft_noise_lure` | **Bó Mồi Tiếng Động** | 1 Đá Lửa (`res_flint`) + 1 Gỗ Khô (`res_dry_wood`) | 1 Mồi Tạo Tiếng Động (`item_noise_lure`) | Ném bằng phím `[Q]` để đánh lạc hướng *The Listener*. |

- **Atomic Deduction & Rollback:** Trong `CraftingSystem.ts`, nguyên liệu được thẩm định đủ trước khi trừ. Nếu bất kỳ nguyên liệu nào bị thiếu giữa chừng, toàn bộ các nguyên liệu đã trừ trước đó sẽ được hoàn lại (rollback) nguyên vẹn.
- **Thời gian thực (Real-time UI Refresh):** `CraftingModal.ts` đăng ký lắng nghe sự kiện `inventory_changed`. Bất cứ khi nào nhặt thêm hoặc dùng bớt nguyên liệu, bảng công thức tự động đổi màu xanh/xám và cập nhật số lượng `x/y` tức thì.

---

## 5. THANH DÙNG NHANH QUICKBAR & CHỐNG LÃNG PHÍ

- **Đồng bộ phím tắt & chuột:** Phím số `[1]`, `[2]` và thao tác click chuột trên các ô QuickSlot gọi chung một luồng xử lý qua `tryConsumePoultice()` và `tryConsumeLanternOil()`.
- **Debounce 250ms:** Ngăn ngừa việc bấm chuột hoặc gõ phím quá nhanh làm trừ 2 vật phẩm cùng lúc.
- **Bảo vệ chỉ số tối đa (Anti-Waste Guard):**
  - Nếu người chơi có **Máu = 100** và **Bình Tâm = 100**, bấm dùng Thuốc Đắp sẽ hiện thông báo: *"💚 Máu và Bình Tâm đã đầy (100%), không cần dùng Thuốc Đắp!"* và **giữ nguyên số lượng thuốc trong túi**.
  - Nếu **Dầu Đèn = 100%**, bấm nạp dầu sẽ hiện thông báo: *"🔥 Bình dầu đèn đã đầy (100%), không cần nạp thêm!"* và **giữ nguyên bình dầu trong túi**.
  - Khi chỉ số chưa đầy: trừ đúng 1 vật phẩm, hồi phục đúng chỉ số và cập nhật số lượng `x<N>` trên thanh Quickbar.

---

## 6. BẢO TOÀN TRẠNG THÁI TÚI ĐỒ QUA SAVE/LOAD

- Lưu trữ chuẩn cấu trúc: `inventory: [string, number][]` và `flags: string[]` (chứa các cờ `depleted_node:<nodeId>`).
- Khi nạp game (`SaveManager.loadGame()` hoặc checkpoint reload):
  - Số lượng từng loại vật phẩm được khôi phục chính xác 100%.
  - Phương thức `inventorySystem.syncDepletedState()` quét lại các mỏ: mỏ nào đang trong chu kỳ cạn kiệt sẽ bị ẩn và tiếp tục đếm giờ hồi sinh; mỏ nào chưa nhặt vẫn hiển thị bình thường.
  - Không thay đổi schema giúp tương thích ngược 100% với các file lưu cũ.

---

## 7. KẾT QUẢ KIỂM THỬ KỸ THUẬT

### 7.1. Kiểm tra TypeScript (`npx tsc --noEmit`)
- **Kết quả:** `0 lỗi` (Mã nguồn tuân thủ 100% kiểu dữ liệu Phaser và TypeScript).

### 7.2. Kịch bản kiểm thử tự động Node.js ([verify_c4_12_04_resource_crafting.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_04_resource_crafting.mjs))
- **Tổng số trường hợp kiểm thử:** 50 mục kiểm tra
- **Kết quả:** **50/50 PASS (100%)**, 0 lỗi.
  - [PASS] Danh mục vật phẩm, nguyên liệu và hiệu ứng trong `items.json`.
  - [PASS] Tỷ lệ và số lượng của cả 3 công thức chế tạo.
  - [PASS] Cơ chế debounce và khóa mỏ tài nguyên trong `InventorySystem.ts`.
  - [PASS] Thẩm định cạn kiệt chống nhân đôi tài nguyên trong `PlayerState.ts`.
  - [PASS] Thu hoạch mỏ lần 1 nhận đúng số lượng, spam phím [E] không tăng số lượng.
  - [PASS] Hồi sinh mỏ sau chu kỳ và cho phép thu hoạch lại.
  - [PASS] Trừ đúng nguyên liệu và cộng đúng thành phẩm khi chế tạo.
  - [PASS] Từ chối chế tạo khi thiếu nguyên liệu, không làm mất đồ.
  - [PASS] Dùng Thuốc Đắp tăng đúng 40 Máu, 25 Bình Tâm và trừ đúng 1 bình.
  - [PASS] Dùng Dầu Đèn tăng đúng 50% dầu và trừ đúng 1 bình.
  - [PASS] Chống lãng phí đồ khi chỉ số đã đạt 100%.
  - [PASS] Bảo toàn túi đồ và trạng thái mỏ cạn kiệt qua chu kỳ Save/Load.

### 7.3. Hướng dẫn người chơi trải nghiệm trên trình duyệt (Playtesting Guide)
> [!NOTE]
> Server Vite đang chạy sẵn sàng tại **`http://localhost:3000/`**. Bạn có thể kiểm tra trực tiếp:
> 1. Đi dạo quanh làng Bellhollow tới mỏ cành cây khô (`x: 680, y: 220`) hoặc mỏ nhựa cây (`x: 640, y: 185`).
> 2. Quan sát nhãn nhắc `[E] Thu thập...` hiện lên khi vào gần và tự biến mất khi bước lùi ra xa.
> 3. Đứng sát mỏ và bấm liên tục phím `[E]`: xác nhận chỉ nhặt được đúng 1 đơn vị, mỏ biến mất và nhãn nhắc ẩn ngay lập tức.
> 4. Nhấn phím `[I]` mở Bàn Chế Tạo: bấm chế tạo Dầu Đèn, kiểm tra nguyên liệu bị trừ đúng 1 và thanh Quickbar bên dưới tăng số lượng Dầu Đèn `x1`.
> 5. Bấm phím số `[1]` hoặc click chuột vào ô Quickslot: kiểm tra trừ đúng 1 bình và hồi máu/bình tâm; khi máu đã đầy 100%, bấm phím sẽ hiện thông báo nhắc nhở và không bị mất bình thuốc.
> 6. Nhấn `ESC` lưu game rồi nạp lại để kiểm tra túi đồ và các mỏ đã nhặt không bị hồi sinh sai lệch.

---

## 8. DANH MỤC FILE THAY ĐỔI & BẢN SAO LƯU

- **Bản sao lưu bảo toàn:** `Backups/C4-12-04_20261115_0718/`
  - `CraftingModal.ts` (8,102 bytes)
  - `CraftingSystem.ts` (2,178 bytes)
  - `GameScene.ts` (49,807 bytes)
  - `InventorySystem.ts` (9,483 bytes)
  - `PlayerState.ts` (9,773 bytes)
  - `SatyrPlayer.ts` (33,639 bytes)
  - `UIScene.ts` (27,735 bytes)
- **Mã nguồn cập nhật:**
  - [PlayerState.ts](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts): Thêm cơ chế kiểm tra `isNodeDepleted` trong `recordResourceHarvest()` và kiểm tra điều kiện áp dụng hiệu ứng trong `useItem()`.
  - [InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts): Bổ sung debounce 250ms `lastHarvestTime` và loại trừ các mỏ đã cạn kiệt.
  - [SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts): Tự động tiêu thụ `eKeyJustPressed = false` trong `isInteractRequested()`.
  - [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Xóa ngay nhãn nhắc tương tác ngay khi thu hoạch mỏ thành công.
  - [CraftingModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CraftingModal.ts): Tự động lắng nghe sự kiện `inventory_changed` để làm mới công thức thời gian thực.
  - [UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts): Cảnh báo thân thiện và ngăn chặn dùng lãng phí vật phẩm khi chỉ số đã đạt 100%.
  - [verify_c4_12_04_resource_crafting.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_04_resource_crafting.mjs): Bộ script 50 bài test tự động hóa.
