# BÁO CÁO KIỂM ĐỊNH HW-BUG-#19 — MAP PROGRESSION & ROUTE PLAYTEST

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#19 — Kiểm thử Thực tế Tiến trình Bản đồ, Chuỗi Nhiệm vụ & Tính Toàn vẹn Lộ trình Di chuyển (Map Progression & Route Playtest)
- **Phương thức:** Chromium Headless (Playwright Automation, SwiftShader WebGL, Viewport 1280x720, Noclip OFF, Input thật, không cheat mở khóa)
- **Kết luận:** **`VERIFIED-PASS`** (Hoàn thành 4/4 chặng playtest độc lập, toàn bộ chuỗi tiến trình nhiệm vụ, NPC, trạm chế tạo, nông trại, cổng chuyển vùng và World Map hoạt động hoàn hảo 100%, 0 lỗi console, 0 lỗi page, 0 asset 404, commit **DOC-ONLY**).

---

## 1. MA TRẬN TIẾN TRÌNH & LỘ TRÌNH DI CHUYỂN (PROGRESSION & ROUTE MATRIX)

| Stage | Phân khu (Zone) | Lộ trình / Điểm tương tác (Route) | Nhiệm vụ (Quest) | Kỳ vọng (Expected) | Thực tế đo đạc (Actual) | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | `fog_crossing` $\to$ `bellhollow` | Đường mòn sương $(120, 195) \to (490, 195) \to$ Garth $(540, 205)$ | `Q00_WAKE_UP` $\to$ `Q01_MEET_EDDA` | Chuyển vùng mượt; Garth thoại cảnh báo; mở Cổng Đông; nhận Q01 | Vùng `bellhollow`; `talkedToVillagers=true`; `eastGateUnlocked=true`; Quest `Q01_MEET_EDDA` | **PASS** |
| **2** | `bellhollow` | Edda $(1160, 160) \to$ Neris $(570, 460) \to$ Bram $(1333, 477) \to$ Bàn Chế Tạo $(1395, 455)$ | `Q01` $\to$ `Q02` $\to$ `Q03_PREPARE_RESOURCES` | Gặp Edda đổi sang Q02; gặp Neris đổi sang Q03; Bram tương tác thợ rèn; mở Bàn Chế Tạo vị trí mới | `talkedToEdda=true`; `talkedToNeris=true`; Bàn rèn $(1395, 455)$ mở modal thành công 100% | **PASS** |
| **3** | `bellhollow` $\leftrightarrow$ `sanctuary_farm` | Lối Nam $(650, 530) \to (650, 580) \to$ Luống thảo dược $(760, 640) \to$ Về lại $(650, 520)$ | Duy trì tiến trình hiện hành | Vào Nông Trại Trú Ẩn an toàn; phát hiện ô đất trồng [E]; quay về làng không kẹt | `zone=sanctuary_farm`; `isInsideCollider=false`; prompt `[E] Làm Đất Chuẩn Bị Luống Trồng`; về làng an toàn | **PASS** |
| **4** | `outer_woods` $\leftrightarrow$ `sub_bell_workshop` | Cổng Đông/Ngoại vi $(1360, 650) \to$ Vaelen $(1435, 710) \to$ Xưởng Chuông $(1360, 1000) \to$ Quay lại $(1360, 960)$ | `Q03` / SQ Giữ Lửa Trong Sương | Thoại với Kỵ sĩ Sir Vaelen; vào Xưởng Chuông $(1360, 1100)$; về lại Rừng Ven; Map chỉ đường đúng | Thoại Vaelen hoàn tất; portal Xưởng Chuông hai chiều chuẩn; World Map định vị `🎯 MỤC TIÊU HIỆN TẠI` | **PASS** |

---

## 2. CHI TIẾT THỰC THI 4 CHẶNG PLAYTEST ĐỘC LẬP

Dữ liệu viễn trắc hoàn chỉnh được lưu trữ tại [Read/V1.5/Reports/HW_BUG_19_PLAYTEST_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_19_PLAYTEST_DATA.json):

### Chặng 1: New Game $\to$ Lối Mòn Xuyên Sương $\to$ Làng Bellhollow & Garth
- **Điểm xuất phát:** Wayfarer sinh ra chuẩn xác tại lòng đường thoáng `(120, 195)` của `fog_crossing`.
- **Chuyển vùng liền mạch (Seamless Zone Seam):** Di chuyển về hướng Đông qua ranh giới `x = 480` sang Bellhollow tại `(490, 195)`.
- **Trạng thái phân khu:** `currentZoneId` chuyển sang `'bellhollow'`, `playerState.hasVisitedZone('bellhollow') == true`.
- **Hội thoại với Garth:**
  - Tiếp cận Garth tại `(540, 205)` (khoảng cách 20px).
  - Kích hoạt hội thoại `garth_warning`, hiển thị chân dung Garth (`portrait_garth`).
  - Lựa chọn nhánh hợp tác, hoàn tất chuỗi thoại.
  - Cờ ghi nhận: `talked_to_villagers = true`, `east_gate_unlocked = true` (Cổng Đông mở sẵn sàng cho giai đoạn sau).
  - Nhiệm vụ cập nhật chính xác: `Q01_MEET_EDDA` (Gặp Bà lão Edda tại Tháp Chuông).

### Chặng 2: Làng Bellhollow — Edda, Neris, Bram & Bàn Chế Tạo (1395, 455)
- **Bà Lão Edda tại Tháp Chuông (`1160, 160`):**
  - Tiếp cận trước hiên nhà Edda `(1160, 185)`.
  - Kích hoạt hội thoại `edda_intro`, tìm hiểu về Ba Quy Tắc Bằng Máu.
  - Cờ `talked_to_edda = true`, nhiệm vụ chính tuyến tự động chuyển sang `Q02_MEET_NERIS`.
- **Neris — Thầy Thuốc Thảo Mộc (`570, 460`):**
  - Di chuyển về phía Tây Nam làng gặp Neris `(570, 485)`.
  - Hoàn tất hội thoại `neris_intro`, nhận hướng dẫn về Dược Liệu Hồi Phục.
  - Cờ `talked_to_neris = true`, nhiệm vụ chuyển sang `Q03_PREPARE_RESOURCES`.
- **Bram — Thợ Rèn Làng (`1333, 477`):**
  - Tiếp cận xưởng rèn Bram tại vị trí mới `(1333, 500)`.
  - Hoàn tất hội thoại `bram_chat` trao đổi về đúc và sửa chữa chuông.
- **Bàn Chế Tạo Sinh Tồn (`1395, 455` — Layout mới):**
  - Quét danh sách tương tác: Tìm thấy `village_crafting_bench` chính xác tại tọa độ `(1395, 455)`.
  - Kích hoạt `open_crafting_bench`: Giao diện chế tạo `CraftingModal` mở mượt mà (`modalOpenedSuccessfully = true`).
  - Đóng bảng chế tạo thành công, không làm kẹt phím nhân vật.

### Chặng 3: Bellhollow $\leftrightarrow$ Nông Trại Trú Ẩn (Sanctuary Farm)
- **Lối thông phía Nam:** Di chuyển từ `(650, 530)` vượt qua đường mòn phía Nam làng sang Nông Trại tại `(650, 580)`.
- **An toàn vị trí đứng:** Kiểm tra `SafeSpawnResolver.isPositionBlocked`: **`isInsideCollider = false`** (hoàn toàn thoáng rộng, không spawn kẹt trong hàng rào hay đá).
- **Tương tác Ô đất trồng thảo dược (`plot_1` tại `760, 640`):**
  - Khi tiếp cận cách 20px, hệ thống hiển thị prompt ngữ cảnh rõ ràng: `[E] Làm Đất Chuẩn Bị Luống Trồng`.
- **Lộ trình quay trở lại:** Di chuyển ngược về phía Bắc `(650, 520)`, hệ thống chuyển phân khu mượt mà về `bellhollow` mà không xảy ra hiện tượng kẹt biên dao động (oscillation).

### Chặng 4: Rừng Ngoại Vi $\leftrightarrow$ Sir Vaelen & Xưởng Chuông (Sub Bell Workshop)
- **Rừng Ngoại Vi (`outer_woods` tại `1360, 650`):**
  - Khung nhìn camera và môi trường rừng lá thông ven rìa làng nạp đầy đủ.
- **Kỵ Sĩ Trầm Mặc Sir Vaelen (`1435, 710`):**
  - Tiếp cận đốm lửa trại của Sir Vaelen `(1435, 735)`.
  - Kích hoạt hội thoại `campfire_knight_intro`, người bạn đồng hành gửi gắm niềm tin và gợi mở bí mật phế tích.
- **Lối vào Xưởng Chuông Bỏ Hoang (`sub_bell_workshop` tại `1360, 1000`):**
  - Bước vào portal chuyển cảnh: Nhân vật xuất hiện chuẩn xác tại tọa độ xuất phát `(1360, 1100)` bên trong xưởng chuông (Bounds: `1120, 1040, 480, 400`).
  - Không phát sinh lỗi đồ họa, không mất camera bounds.
- **Lộ trình quay về:** Bước ra cửa thoát tại `(1360, 1080)`, nhân vật trở về điểm hẹn an toàn `(1360, 960)` tại Rừng Ngoại Vi.
- **Đồng bộ World Map:**
  - Mở Bản đồ Giấy Da `ParchmentWorldMapModal`: Con trỏ vị trí hiện tại chỉ đúng `outer_woods`.
  - Thanh tiêu đề chặng hiển thị chi tiết: `🎯 NHIỆM VỤ TIẾN TRÌNH: GIỮ LỬA TRONG SƯƠNG • Rừng Ngoại Vi`.
  - Huy hiệu `🎯 MỤC TIÊU HIỆN TẠI` đánh dấu rõ ràng, không đè lên địa danh hay biểu tượng phong ấn.

---

## 3. DANH SÁCH LỖI MỚI PHÁT HIỆN (NEW DEFECTS LOG)

- **Số lỗi phát hiện:** **`0 LỖI`**.
- Toàn bộ chuỗi tiến trình cốt truyện chính (Hồi 1), chuỗi hội thoại NPC có lựa chọn, trạm bàn rèn mới, nông trại canh tác, các cổng chuyển tiếp hai chiều và cơ chế chỉ đường World Map đều vận hành ổn định và đồng bộ hoàn hảo.

---

## 4. MINH CHỨNG TRỰC QUAN PLAYTEST (VISUAL ARTIFACTS)

| Chặng | Tên tệp ảnh | Nội dung kiểm chứng |
| :---: | :--- | :--- |
| **Stage 1** | `hw_bug19_stage1_garth.png` | Garth tại Cổng Tây làng Bellhollow, hội thoại mở Cổng Đông |
| **Stage 2** | `hw_bug19_stage2_bram_crafting.png` | Xưởng rèn Bram và Bàn chế tạo sinh tồn tại layout mới `(1395, 455)` |
| **Stage 3** | `hw_bug19_stage3_farm.png` | Nông Trại Trú Ẩn, luống trồng thảo dược và lối thông Nam |
| **Stage 4** | `hw_bug19_stage4_outer_woods.png` | Rừng Ngoại Vi, Sir Vaelen và lối vào Xưởng Chuông Bỏ Hoang |

---

## 5. TỔNG KẾT & TIÊU CHUẨN KỸ THUẬT

- `git diff --check`: PASS (0 lỗi khoảng trắng).
- `npx tsc --noEmit`: PASS (0 lỗi TypeScript).
- `npm run build`: PASS (Bundle production hoàn tất 100%).
- 3 tệp âm thanh ngoại lệ được bảo toàn `untracked`.
- Hình thức commit: **DOC-ONLY**.
