# HW-NARRATIVE-00G — MELIODAS BLACKWOOD VISUAL REFERENCE & RECOVERY ALIGNMENT PLAN

- **Mission:** `HW-NARRATIVE-00G — CHARACTER ART, OPENING CUTSCENE & AUDIO PLAN`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `DESIGN PLANNING ONLY` (`0` sửa đổi `BlackKnightPlayer.ts`, `BlackKnightAnimations.ts`, atlases runtime hay `BUG-058/059`)
- **Dependencies:** `HW-CHAR-01-R2` ([HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md)), `HW-NARRATIVE-00B` ([CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)), `HW-NARRATIVE-00F` ([HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md))
- **Master Character Asset Library:** [Meliodas_Blackwood/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/) (`194` tệp đã đối chiếu SHA-256)

---

## 1. Trạng Thái Định Danh & Thẩm Quyền Canon (`CHAR-K01`, `CHAR-K02`)

| Thành phần định danh | Trạng thái | Quyết định & Quy chuẩn bắt buộc |
| :--- | :---: | :--- |
| Tên thật **`Meliodas`** *(thay `Drager` đã `SUPERSEDED`)* | **`CANON-APPROVED`** | Cấm hiển thị `Drager` trong nội dung mới; nhưng **KHÔNG tiết lộ tên `Meliodas` hay chức danh `Chỉ Huy` sớm ở Menu / Act 0** (`CONFLICT C04` / `OQ-20`). |
| Danh hiệu **`Lord Blackwood`** & **`The Wolf Lord` (`Lang Chủ`)** | **`CANON-APPROVED`** | Giữ nguyên theo lựa chọn của Owner; thiết kế dark-fantasy độc lập lấy cảm hứng từ văn học Arthur cổ, không mô phỏng nhân vật hiện đại trùng tên (`Ch. 06`). |
| Danh xưng lúc mất ký ức **`The Mossbound Wayfarer`** & **`Black Knight`** | **`CANON-APPROVED` / BASELINE** | Dùng làm tên kỹ thuật / giai đoạn đầu hành trình trước mốc thức tỉnh ký ức (`OQ-20`). |
| Vai trò **Người Thầy** dìu dắt `Vaelen & Mordric` / đồng tồn tại chức **Chỉ Huy** | **`PROPOSED`** | Chờ Owner chốt `OQ-01`, `OQ-03`, `OQ-05`. |
| Tổ chức **`Order of the Black Wolf`** & khẩu hiệu **`Fides Ultra Tenebras`** | **`PROPOSED`** | Chờ Owner chốt `OQ-K06`; chưa tự in lên UI, huy hiệu hoặc item lore runtime. |

---

## 2. Tiếp Nhận Concept `The Wolf Lord` (`Strict Art Reference Only`)

- **Tư liệu tham chiếu đã kiểm tra:** Tấm minh họa `The Wolf Lord` do Owner cung cấp (`media_1795685432191_f18e33c3.jpg`) mô tả kỵ sĩ giáp sắt đen, mũ trụ có gờ sừng nhọn tối màu, áo choàng đen tơi tả, thanh đại kiếm kẹp dọc hông khi cưỡi trên lưng **đại hắc lang** mắt trắng phát sáng đứng trên vách rêu giữa rừng thông chìm sương xanh xám.
- **Phạm vi sử dụng ĐƯỢC PHÉP (Visual & Tone Reference Only):**
  1. **Ngôn ngữ tạo hình & khí chất:** Tham khảo độ rách tà áo choàng đen trên nền rêu xanh thẫm (`#25392C`) và sương lam xám (`#71817F`) cho Key Art bìa, ảnh minh họa chương Sổ Tay Ký Ức (`JournalModal`), hoặc huy hiệu sói nếu Owner duyệt `Order of the Black Wolf` (`OQ-K06`).
  2. **Biểu tượng danh hiệu `The Wolf Lord`:** Phục vụ minh họa lore / cover art / ending splash sau khi danh tính được mở khóa đúng lộ trình.
- **Giới hạn NGHIÊM CẤM (`P0 Gameplay Scope Lock`):**
  - **KHÔNG** bổ sung cơ chế cưỡi sói (*wolf-mount mechanic*), kỹ năng triệu hồi thú cưỡi hay thay đổi `PLAYER_WALK_SPEED` (`85`) / `PLAYER_SPRINT_SPEED` (`140`).
  - **KHÔNG** sửa hệ thống collider bàn chân (`18×12 px`), `Shadow`, hay cân bằng sinh tồn *Thể Lực / Hộ Tâm `[F]` / Tinh Thần* để nhét trạng thái cưỡi thú vào `BlackKnightPlayer.ts`.
  - **KHÔNG** tái dùng `skull_wolf_sheet` làm thú cưỡi bằng code ghép nối.

---

## 3. Đối Chiếu Kết Quả Khôi Phục Codex Black Knight V2 (`HW-CHAR-01-R2` vs `ART-K08`)

Master Game Bible Unified (`Ch. 05` & `ART-K08`) từng ghi nhận *"chưa tìm được file hoặc commit của Black Knight V2 do Codex vẽ"*. Nhiệm vụ **`HW-CHAR-01-R2` đã khôi phục đầy đủ 100%** từ lịch sử GitHub của dự án (`cb8ba12b..6bb15b80`) và bàn giao đồng bộ sang kho lưu trữ mới:

### 3.1 Tài Nguyên Đã Khôi Phục & Bảo Toàn
1. **Kho lưu trữ xác minh SHA-256:**
   - Gói nén Backup: [BLACK_KNIGHT_V2_RECOVERED_20261126_162326.zip](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Backups/BLACK_KNIGHT_V2_RECOVERED_20261126_162326.zip) (`169` tệp, SHA-256 `8fef3b3b618ccb1db86a5b69eb4eac25dea34911fa1e971df57d341526805553`).
   - Thư viện chuẩn hóa: [Meliodas_Blackwood/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/) (`194` tệp gồm `01_Original_Black_Knight` Fellor V1.0, `02_Codex_Black_Knight_V2` đủ `8` mốc từ `V1.4` → `K1` → `K2v1` → `K2v2` → `K3` → `Conversion34`, `03_Sprites` `32` sheet 4 hướng tách riêng, `04_Animations` `12` GIF, `05_Atlases` `10` cặp Atlas PNG/JSON lossless, `06_Portraits` `black_knight_portrait.png` `64×64`).
2. **Đối chiếu với 4 gói Kỵ sĩ mới (`HW-NARRATIVE-00F`):**
   - Toàn bộ 4 gói mới (`Knight.zip`, `Water Warrior.zip`, `heavy_knight_free.zip`, `Mystic Autumn Knights.zip`) **KHÔNG gói nào thay thế được Codex Black Knight V2** cho vai `Meliodas` (`90×90` / `208×112` / `640×640` side-view hoặc lệch tone/thiếu giấy phép). `Meliodas Blackwood` tiếp tục sử dụng bộ artwork Codex V2 đã kiểm chứng.

### 3.2 Khóa Toàn Bộ Runtime Keys & Hằng Số (`TECH-K14`)
Mọi kế hoạch mở rộng cốt truyện/mỹ thuật sau này **BẮT BUỘC GIỮ NGUYÊN** các khóa và hợp đồng sau:
- **File lõi:** [BlackKnightPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts), [BlackKnightAnimations.ts](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts), [BlackKnightConversion.json](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightConversion.json), [Constants.ts:39-83](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts#L39-L83), [PreloadScene.ts:491-530](file:///G:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts#L491-L530).
- **Texture Keys:** `black_knight_armed_idle`, `black_knight_movement`, `black_knight_core_combat`, `black_knight_defense`, `black_knight_extended_skills`, `black_knight_conversion_actions`, `black_knight_conversion_air`, `black_knight_conversion_combat`, `black_knight_conversion_states`, `black_knight_conversion_motion`, cùng nhóm `wayfarer_*` & cờ `WAYFARER_USE_PURE_ARTIST_SPRITES = true`.
- **Animation Prefix Compatibility:** Giữ đồng thời cả hai tiền tố `wayfarer_*` và `satyr_*` trong [BlackKnightAnimations.ts:130-142](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts#L130-L142).
- **Thông số hình học chuẩn:** `WAYFARER_FRAME_WIDTH = 64`, `WAYFARER_FRAME_HEIGHT = 64`, `WAYFARER_ORIGIN_X = 0.5`, `WAYFARER_ORIGIN_Y = 1.0`, `WAYFARER_BASE_SCALE = 1.50`, foot hitbox `18×12` (`OFFSET_X = 23`, `OFFSET_Y = 46`).

---

## 4. Ranh Giới Xử Lý `BUG-058` / `BUG-059` & Lộ Trình Điều Chỉnh Không Spoil

### 4.1 Dành Riêng `BUG-058` & `BUG-059` Cho Hàng Đợi Codex
Theo [V153_TESTER_BUG_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md#L61-L62) và [HW_H4_09_FINAL_STABILITY_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_H4_09_FINAL_STABILITY_REPORT.md#L35):
- **`BUG-058` (`Scale Pop` khi chuyển sang Atlas Run `84×72` / Unarmed Run dao động scale `1.02` vs `1.17`):** Trạng thái **`DEFERRED — CODEX`**.
- **`BUG-059` (`Chênh lệch độ nét`: Idle/Walk vẽ ở khổ cao `30 px` trong khi Run vẽ ở `41 px`):** Trạng thái **`DEFERRED — CODEX`**.
- **Quy định cho chuỗi Narrative (`00G–00H`):** **TUYỆT ĐỐI KHÔNG** chỉnh scale, thay frame Run/Idle, hay sửa code `BlackKnightPlayer.ts` để tự xử lý `BUG-058`/`BUG-059` trong lúc làm tài liệu hay cắt cảnh. Hai lỗi này chỉ được xử lý ở hàng đợi kỹ thuật riêng của Codex trên bộ atlas trong `05_Atlases/`.

### 4.2 Điểm Kiểm Soát Chống Spoil Danh Tính `Meliodas` (`C04` — Chờ `OQ-20`)
- Trong `MainMenuScene.ts` ([showChronicleAndGuideModal L797](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L797)) và chuỗi `Stage 1–3` của `GameScene.ts:4849` / `PlayerState.ts:764-788`, văn bản hiện tại đang gọi thẳng *"Chỉ huy Hiệp Sĩ Đen"* trước khi người chơi thu thập đủ chứng cứ.
- **Kế hoạch visual UI:** Tên hiển thị trên khung Portrait HUD / Journal ở Giai đoạn 0–2 chỉ giữ *"Lữ Khách"* / *"Kỵ Sĩ Áo Choàng Rêu"* (dùng `black_knight_portrait.png` bình thường); chỉ cập nhật danh hiệu `Meliodas Blackwood — The Wolf Lord` trong Sổ Tay & thẻ nhân vật sau khi Owner chốt mốc mở khóa tại `OQ-20`.
