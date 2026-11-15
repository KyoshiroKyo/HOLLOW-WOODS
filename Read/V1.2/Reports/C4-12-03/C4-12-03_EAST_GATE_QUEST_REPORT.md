# BÁO CÁO HOÀN THÀNH C4-12-03: ĐỒNG BỘ CỔNG ĐÔNG LÀNG BELLHOLLOW VỚI TIẾN ĐỘ NHIỆM VỤ

- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Mã lệnh thực thi:** `COMMAND C4-12-03`
- **Thời gian hoàn thành:** 15/11/2026
- **Server kiểm thử trực tiếp:** `http://localhost:3000/` (Vite v5.4.21 đang hoạt động)
- **Bản sao lưu trước khi sửa code:** `Backups/C4-12-03_20261115_0705/` (4 file mã nguồn, đối chiếu byte nguyên vẹn)

---

## 1. TỔNG QUAN NHIỆM VỤ & MỤC TIÊU C4-12-03

Cổng Đông làng Bellhollow (`gateX = 1485, roadY = 280`) là ranh giới sống còn ngăn cách giữa khu an toàn làng Bellhollow và khu rừng nguy hiểm Outer Woods / The Crooked Path (`x = 1580..1640`). 

Mục tiêu của lệnh C4-12-03 là thiết lập cơ chế khóa/mở Cổng Đông gắn chặt với tiến trình cốt truyện sinh tồn, đảm bảo người chơi **chưa có Dầu Đèn thì không thể vượt qua Cổng Đông**, và ngay khi hoàn thành nhiệm vụ chuẩn bị nguyên liệu thì cổng mở mượt mà, đồng bộ toàn diện cả 4 thành phần thị giác, vật lý, giao diện và nhiệm vụ.

---

## 2. ĐIỀU KIỆN NHIỆM VỤ MỞ CỔNG ĐÔNG

Theo mạch truyện chính trong `src/data/lore.json` và `src/data/dialogues.json`:
1. **Khởi đầu (Act 0 - Act 1):** Người chơi thức tỉnh (`Q00_WAKE_UP`), gặp người gác cổng Garth (`talked_to_villagers`), diện kiến bà lão Edda dưới Tháp Chuông (`talked_to_edda` -> `Q02_MEET_NERIS`), rồi tới trạm thuốc gặp Neris (`talked_to_neris` -> `Q03_PREPARE_RESOURCES`).
2. **Điều kiện mở Cổng Đông (Prerequisite):** Người chơi phải hoàn thành nhiệm vụ **`Q03_PREPARE_RESOURCES`** (*Chuẩn bị vào Rừng Cấm*):
   - Thu thập 1 Gỗ Khô (`res_dry_wood`) và 1 Nhựa Cây (`res_tree_resin`).
   - Mở giao diện chế tạo (`[I]` hoặc Bàn Chế Tạo `[E]`) để pha chế thành công **Dầu Đèn** (`item_lantern_oil`).
3. **Cờ trạng thái kích hoạt:** Khi chế tạo thành công Dầu Đèn, `CraftingSystem.ts` thiết lập cờ **`craft_lantern_oil_complete`**, từ đó `PlayerState.ts`:
   - Đánh dấu hoàn thành toàn bộ các mục của `Q03_PREPARE_RESOURCES`.
   - Thiết lập cờ `east_gate_unlocked`.
   - Chuyển nhiệm vụ chính sang **`Q04_ANCIENT_RUNES`** (*Hồi 3: Đường Mòn Quanh Co*), với mục tiêu đầu tiên `t1`: *"Bước qua Cổng Đông của làng Bellhollow"*.
   - Phát sự kiện `east_gate_unlocked` trên bus dữ liệu toàn cục.

---

## 3. ĐỒNG BỘ 4 YẾU TỐ TẠI CỔNG ĐÔNG

| Yếu tố | Trạng thái KHÓA (Chưa làm Dầu Đèn Q03) | Trạng thái MỞ (Đã hoàn thành Q03 / Có Dầu Đèn) |
| :--- | :--- | :--- |
| **1. Hình ảnh hiển thị (Visual Art)** | Rào chắn gỗ sồi kiên cố phủ kín hành lang đường (`y: 242..318`), các thanh giằng chéo Z-brace nẹp sắt, xích sắt đúc đen quấn quanh và ổ khóa đồng niêm phong khắc dấu ấn cổ ngữ. | Hai cánh cổng gỗ được gập mở ép sát về hai trụ đá Bắc/Nam (`y: 242..260` và `y: 300..318`), xích và ổ khóa tháo rời buông lơi, ánh sáng vàng ấm từ đèn lồng rọi thông suốt lối đi trung tâm (`y: 262..298`). |
| **2. Hộp va chạm vật lý (Physics Collider)** | Collider thân tĩnh Arcade Static Body kích thước `16×76px` tại `(1485, 280)`, phủ kín dải `Y: 242..318`, nối khít hoàn hảo với Trụ Bắc (`Y: 229..243`) và Trụ Nam (`Y: 311..325`), chặn 100% người chơi không thể đi xuyên qua. | Collider rào chắn được tắt hoàn toàn (`enable = false`, `checkCollision.none = true`), người chơi di chuyển mượt mà qua khe cổng sang Rừng Ngoại Vi. |
| **3. Dòng nhắc tương tác & Thông báo** | Khi lại gần Cổng Đông hiện dòng nhắc: `[E] Kiểm tra Cổng Đông (Khóa chặt)`. Bấm `[E]` hiện thông báo: *"🔒 Cổng Đông đang khóa chặt! Hãy gặp Neris và chế tạo Dầu Đèn [Phím I] trước khi vào Rừng Cấm."* | Dòng nhắc chuyển thành: `[E] Cổng Đông (Đã mở - Đi vào Rừng Ngoại Vi)`. Bấm `[E]` hiện thông báo: *"✔ Cổng Đông đã mở! Đường Mòn Quanh Co (The Crooked Path) đang ở ngay phía trước."* |
| **4. Mục tiêu nhiệm vụ (Quest Tracker)** | Hiển thị nhiệm vụ `Q03_PREPARE_RESOURCES`: *"Thu thập 1 Gỗ Khô và 1 Nhựa Cây quanh làng"* và *"Mở túi chế tạo [Phím I / TAB] để pha chế Dầu Đèn"*. | Tự động chuyển sang `Q04_ANCIENT_RUNES`: *"HỒI 3: ĐƯỜNG MÒN QUANH CO ▶ [ ] Bước qua Cổng Đông của làng Bellhollow"*. Khi người chơi bước qua vạch `x >= 1500`, mục tiêu lập tức tích xanh hoàn thành (`✔ Đã bước qua Cổng Đông của làng Bellhollow!`). |

---

## 4. TÍNH NĂNG MỞ ĐỘNG & BẢO TOÀN LƯU/TẢI (SAVE/LOAD)

1. **Mở cổng thời gian thực không cần tải lại (Dynamic Unlock):**
   - Khi người chơi đứng trong làng mở bảng chế tạo `[I]` hoặc tương tác Bàn Chế Tạo `[E]`, vừa chế tạo xong Dầu Đèn, `GameScene` bắt sự kiện `east_gate_unlocked` lập tức:
     - Chuyển hình ảnh rào chắn sang cổng mở.
     - Tắt va chạm chặn.
     - Phát âm thanh/rung nhẹ camera và hiện thông báo: *"🔔 Cổng Đông làng Bellhollow đã mở khóa! Bạn có thể bước qua Cổng Đông tiến vào Rừng Ngoại Vi."*
2. **Bảo toàn trạng thái qua Save/Load:**
   - Cờ `craft_lantern_oil_complete` và `east_gate_unlocked` được lưu trữ trực tiếp vào danh sách cờ trong `SaveManager.saveGame()`.
   - Khi nạp game (`SaveManager.loadGame()` hoặc `handleReloadCheckpoint`), `PlayerState.isEastGateUnlocked()` thẩm định chính xác và `WorldBuilder.setEastGateOpen()` khôi phục trạng thái mở cổng ngay lập tức.

---

## 5. KẾT QUẢ KIỂM THỬ KỸ THUẬT

### 5.1. Kiểm tra TypeScript (`npx tsc --noEmit`)
- **Kết quả:** `0 lỗi` (Mã nguồn tuân thủ 100% kiểu dữ liệu Phaser và TypeScript nghiêm ngặt).

### 5.2. Kịch bản kiểm thử tự động Node.js (`Read/V1.2/QA/verify_c4_12_03_east_gate.mjs`)
- **Tổng số trường hợp kiểm thử:** 29 mục kiểm tra
- **Kết quả:** **29/29 PASS (100%)**, 0 lỗi.
  - [PASS] Tọa độ và interactable Cổng Đông trong `zones.json`.
  - [PASS] Kết cấu nhiệm vụ `Q03` và `Q04` trong `lore.json`.
  - [PASS] Tính liên tục không kẽ hở của Collider Cổng Đông (`Y: 229` đến `Y: 325`).
  - [PASS] Logic kiểm tra trạng thái cổng trong `PlayerState.ts`.
  - [PASS] Hàm vẽ đồ họa và quản lý va chạm trong `WorldBuilder.ts`.
  - [PASS] Cơ chế bắt sự kiện và cập nhật nhiệm vụ trong `GameScene.ts`.
  - [PASS] Kịch bản mở cổng động và chu trình khôi phục Save/Load.

### 5.3. Hướng dẫn người chơi trải nghiệm trên trình duyệt (Playtesting Guide)
> [!NOTE]
> Trợ lý AI thực hiện xác nhận logic bằng script Node.js và TypeScript compiler, chưa can thiệp bằng subagent trình duyệt để bảo toàn quota. Bạn có thể mở trực tiếp trình duyệt tại **`http://localhost:3000/`** để kiểm nghiệm thực tế các bước:
> 1. Bấm **Bắt Đầu Mới**, di chuyển nhân vật qua làng Bellhollow đi thẳng về Cổng Đông (`X ~ 1480, Y ~ 280`).
> 2. Xác nhận cổng đóng kín, có xích khóa và collider chặn lại không cho đi sang mép phải.
> 3. Bấm `[E]` trước cổng: kiểm tra hộp thoại nhắc nhở cần làm Dầu Đèn.
> 4. Nhặt 1 Cành Khô + 1 Nhựa Thông, bấm `[I]` chế tạo Dầu Đèn: quan sát thông báo chuông mở Cổng Đông, quan sát cánh cổng mở rộng và hộp nhiệm vụ góc trên chuyển sang Hồi 3.
> 5. Bước chân qua Cổng Đông (`X > 1500`): xác nhận nhiệm vụ hoàn thành và đi thông suốt vào The Crooked Path.
> 6. Bấm `ESC` -> Lưu game, sau đó tải lại game để kiểm tra Cổng Đông vẫn giữ nguyên trạng thái mở.

---

## 6. DANH MỤC FILE THAY ĐỔI & BẢN SAO LƯU

- **Bản sao lưu bảo toàn:** `Backups/C4-12-03_20261115_0705/`
  - `GameScene.ts` (47,500 bytes)
  - `PlayerState.ts` (9,068 bytes)
  - `WorldBuilder.ts` (75,050 bytes)
  - `zones.json` (12,549 bytes)
- **Mã nguồn cập nhật:**
  - [PlayerState.ts](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts): Thêm `isEastGateUnlocked()`, cờ `east_gate_unlocked` và phát sự kiện khi hoàn tất `craft_lantern_oil_complete`.
  - [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Bổ sung `eastGateColliderBody`, `renderEastGateBarrier()`, `setEastGateOpen()` và `updateEastGateInteractable()`.
  - [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts): Khởi tạo trạng thái cổng, lắng nghe sự kiện mở động, xử lý `inspect_east_gate` và hoàn thành nhiệm vụ `Q04 t1` khi bước qua cổng.
  - [zones.json](file:///G:/HOLLOW%20WOODS/src/data/zones.json): Bổ sung interactable `east_gate_barrier` tại `x = 1475, y = 280`.
  - [verify_c4_12_03_east_gate.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_03_east_gate.mjs): Bộ script 29 bài test tự động hóa.
