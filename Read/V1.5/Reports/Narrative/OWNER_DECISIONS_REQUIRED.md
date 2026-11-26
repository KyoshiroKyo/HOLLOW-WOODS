# HOLLOW WOODS — OWNER DECISIONS REQUIRED (`BY PHASE GATE`)

- **Mission:** `HW-NARRATIVE-00H — MASTER KNOWLEDGE CHECKPOINT & EXECUTION ROADMAP`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Nguyên tắc:** Không tự phê duyệt Canon. Toàn bộ câu hỏi `OQ-01–20` từ [OWNER_LORE_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_LORE_DECISIONS_REQUIRED.md) cùng các cổng tài nguyên (`00F` / `00G`) được **phân nhóm trực tiếp theo mốc thực thi** để Owner mở khóa từng hạng mục mà không gây kẹt chéo.

---

## 1. BẮT BUỘC TRƯỚC KHI SỬA LORE (`P0 — Chặn Queue C: Narrative Reconstruction`)

| ID | Câu hỏi cần Owner chốt nguyên văn | Xung đột bị khóa | Hậu quả nếu sửa khi chưa chốt |
| :--- | :--- | :---: | :--- |
| **`OQ-01`** | NVC (`Meliodas`) là **Người Thầy** đồng thời giữ chức **Chỉ Huy Đoàn Kỵ Sĩ**, hay đổi/bỏ chức danh `Chỉ Huy`? | `C04`, `NAR-002/005` | Tạo ra hàng chục file lore/UI/thoại mâu thuẫn giữa `"Chỉ Huy"` và `"Người Thầy"`. |
| **`OQ-02`** | **Bản chất tiếng gọi / lời cầu cứu từ rừng già:** Do Khu rừng, `The Veil`, `The Listener`, `The Echo`, hay cố ý để bí ẩn suốt game? | **`C05`**, `NAR-001/024` | Xung đột trực diện với Quy tắc 1 của Edda về `The Listener`. |
| **`OQ-03`** | **Nguyên nhân mất ký ức:** Bỏ hoàn toàn twist cũ (*tự phong ấn / `Algiz` / tái sinh*), giữ một phần, hay giữ như lời đồn sai của bia đá/nhân chứng? | **`C01`**, `NAR-003` | Viết đè `lore.json`, `dialogues.json`, `veil_commander_epistle` sai hướng gốc. |
| **`OQ-08`** | **Mốc thời gian & cơ chế xuyên thời gian:** Bao nhiêu thời gian đã trôi qua (có bỏ chữ *"hàng trăm năm"* ở Ending/Edda không)? NVC tới tương lai thế nào? Xác nhận *"Làng Sương Mù"* = `Bellhollow`? | `NAR-004` | Lỗi logic giữa Vaelen/Edda/Bram còn sống với tuổi đời nhân vật & Ending text. |
| **`OQ-09`** | **Thứ tự biến cố quá khứ:** Việc Meliodas đi theo lời cầu cứu xảy ra trước hay sau đêm `7` hồi chuông nứt Đại Hồng Chung? Mối quan hệ với `First Toll`? | `NAR-001/003` | Sai trình tự biên niên sử trong Journal & Opening. |
| **`OQ-K06`** | Có khóa chính thức tên **`Order of the Black Wolf` (`Đoàn Kỵ Sĩ Hắc Lang`)**, huy hiệu sói và khẩu hiệu **`Fides Ultra Tenebras`** làm Canon? | `NAR-K06`, `Ch. 06` | Không thể in lên văn bia 12 kỵ sĩ, Menu hay nhật ký nếu chưa duyệt. |
| **`OQ-20`** *(Mục b)* | **Thời điểm & Điều kiện Reveal tên `Meliodas`:** Tiết lộ ở Stage 3, trước Final Boss, hay First Toll? Danh sách UI/Menu cần che hoàn toàn tên thật & danh hiệu? | **`C04`**, `I-01` | Nguy cơ spoil ngay ở `MainMenuScene` / `UIScene` / `Stage 1` (`GameScene:4849`). |
| **`RES-SATYR-TXT`** *(Từ 00H Audit)* | Xử lý 2 tàn dư tên `Satyr` trong text hiển thị người chơi: **`EndingSystem.ts:1037`** (*"Satyr: Ánh đèn pha ô tô..."*) và **`VeilSystem.ts:44`** (*"Satyr... quay lại đi..."*) — **REMOVE** hay **REWRITE** sang Lữ Khách? | Addendum §1 | Giữ nhầm cốt truyện *isekai/quốc lộ* cũ lệch hẳn Dark Fantasy. |

---

## 2. BẮT BUỘC TRƯỚC KHI SỬA QUEST (`P0/P1 — Chặn Quest & Dialogue Choices`)

| ID | Câu hỏi cần Owner chốt | Liên quan | Tác động thực thi |
| :--- | :--- | :---: | :--- |
| **`OQ-06`** | Giải quyết mâu thuẫn thoại **`Vaelen q2 vs q3`** (`SQ07 → SQ08`): sửa nhật ký/thoại `q2` (không tin Hooded là Chỉ Huy) hay giữ thành hiểu lầm có chủ ý? | **`C02`**, `I-02` | Sửa `dialogues.json` (`campfire_knight_q2_complete`) & điều kiện rẽ nhánh `GameScene:4826–4865`. |
| **`OQ-11`** | Thời điểm Vaelen nhận ra NVC (gặp lần đầu tại lửa trại, khi xem huy hiệu ở `Q05`, hay cảnh hang)? Có cho phép quỳ gọi `"ngài"` ngay lần đầu không? | `NAR-009/010` | Quyết định cờ kích hoạt `memoryAwakeningStage` & nhánh thoại `SQ06–SQ08`. |
| **`OQ-14`** | **Số phận cuối cùng** của `Sir Mordric / Hooded` và `Sir Vaelen` sau encounter (hòa giải, rời đi, hy sinh, giữ nguyên vị trí trạm lửa)? | `NAR-016/021` | Khóa trạng thái NPC/Boss sau `SQ08` & đoạn văn bản Ending. |
| **`OQ-15`** | Có áp thứ tự Trailer `Mire → Satyr → Dark Knight` (hay dời encounter Dark xuống `veil_origin_cavern`)? Encounter này là **Optional (`SQ08`) hay Mandatory**? | `NAR-019`, `I-05` | Liên quan trực tiếp `WorldGatingSystem.ts:193` & bảo vệ Main Route `A→E→B→D→F→E→C→A`. |
| **`OQ-16`** | **Vai trò `Sir Vaelen` ở hang:** Chỉ xuất hiện trong ký ức/cutscene hay hỗ trợ combat? Giữ nguyên vị trí NPC trạm lửa `(1435..1470, 710)` cho quest chính? | `NAR-017` | Tránh phá hỏng `CampSanctuarySystem` và softlock `Q05` rèn chìa khóa. |
| **`OQ-17`** | Duyệt **từng ID thoại cụ thể** từ `DLG-006–015`, `DLG-019`, `DLG-031–034` và danh hiệu Menu (`"Khu rừng đang dõi theo"` vs `"The Fog That Remembers"`)? | `DLG-K07`, `NAR-020` | Cho phép biên tập `dialogues.json`, `PreloadScene`, `MainMenuScene`, `index.html`. |
| **`OQ-18`** | Mức độ tác động của nhánh lựa chọn mới (`DLG-P01–P06`): chỉ tăng `trustDelta` một lần (có idempotency guard) hay đổi rẽ nhánh quest / 3 ngưỡng Ending (`comp>=50, stage>=3, trust>=65`)? | `NAR-021/022`, `I-03/06` | Cho phép nâng cấp `DialogueChoice` + sửa text `ENDING_CONFIGS`. |

---

## 3. BẮT BUỘC TRƯỚC KHI TẠO NHÂN VẬT (`P1 — Chặn Queue B: Character Production`)

| ID | Câu hỏi cần Owner chốt | Liên quan | Tác động |
| :--- | :--- | :---: | :--- |
| **`OQ-05`** | Mức độ tiểu sử & tình bạn chính thức giữa **`Sir Mordric`** và **`Sir Vaelen`**; giữ danh xưng `Sir Mordric` / `Dark Knight` hay đổi tên/họ? | `CHAR-003`, `NAR-006` | Khóa thiết kế sprite, portrait & dialogue voice cho Vaelen/Mordric. |
| **`OQ-07`** | Danh tính hai thuộc hạ **`Knight_2 / Knight_3`** trong trailer: giữ vai trò thuộc hạ vô danh, gán `Fallen Knight`, hay liên hệ nhân vật khác? *(Không tự gán = Roderick/Aldemar/Elian).* | `NAR-018`, `CHAR-014` | Quyết định có sản xuất `knight_2/3` riêng hay dùng `fallen_knight`. |
| **`OQ-K04` *(Nhóm Kỵ Sĩ Mới)*** | Tiểu sử chi tiết & diện mạo chốt cho **`Sir Roderick` (`Crimson Knight`)** và **`Sir Aldemar` (`Ashen Knight`)**: có phải học trò Meliodas không? Có cho họa sĩ vẽ top-down 4 hướng từ ref `heavy_knight_free` / `Knight.zip` (`00F`)? | `CHAR-004/005`, `00F` | Chặn việc tạo nhân vật mới & gán `Assets` sai phong cách. |
| **`00F-LIC-WW`** | Có truy tìm nguồn/giấy phép cho **`Water Warrior.zip`** hay loại hẳn khỏi kho sản xuất? *(Gợi ý `00F`: loại khỏi Knight Order).* | `00F` | Tránh rủi ro bản quyền nếu có người dùng nhầm. |

---

## 4. BẮT BUỘC TRƯỚC KHI TẠO BOSS (`P1 — Chặn Boss R&D`)

| ID | Câu hỏi cần Owner chốt | Liên quan | Tác động |
| :--- | :--- | :---: | :--- |
| **`OQ-04`** | **`Sir Mordric` (`Dark Knight`)** có chính là **`HoodedKnightBoss`** trong runtime hiện hành, hay là boss riêng biệt hoàn toàn? | **`C03`**, `CHAR-003/013` | Quyết định giữ/tách `EvilKnights.ts` (`boss_hooded_knight`) vs boss mới. |
| **`OQ-12`** | Dấu hiệu giúp Dark Knight nhận ra thầy (`Hộ Tâm`, thế kiếm, giáp hay huy hiệu)? | `NAR-015` | Viết intro encounter & animation trigger khi đụng độ. |
| **`OQ-13`** | **`Satyr`** trong trailer: đưa vào game làm mini-boss/quái vật thực thụ, giữ làm ảo giác tâm lý, hay bỏ hoàn toàn? *(Cấm dùng key `lore_satyr_journal` làm ID).* | `CHAR-019`, `NAR-013` | Thiết kế entity/AI mới hoặc giữ nguyên `TRAILER-ONLY`. |
| **`OQ-HW-BOSS`** *(Headless Warden)* | Duyệt chính thức: tên **`The Headless Warden`**, lore (vệ thần cổ vật hay kỵ sĩ), vị trí xuất hiện (trong 5 zone mở rộng nào?), độ khó/phase chiến đấu, và ngân sách/nhân sự vẽ sprite `128×128` 4 hướng nguyên bản theo [HEADLESS_WARDEN_ASSET_SPECIFICATION.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_ASSET_SPECIFICATION.md)? | `CHAR-006`, `00G` | Mở khóa Queue `B2` vẽ sprite & prototype sandbox `Headless Warden`. |

---

## 5. BẮT BUỘC TRƯỚC KHI ĐỔI BẢN ĐỒ (`P1/P2 — World Reconstruction`)

- **Tin tốt (`READY`):** Các phân khu **`outer_woods`, `fog_crossing`, `bellhollow`, `sanctuary_farm`, `crooked_path`, `deep_forest`, `sub_whispering_clearing`, `whispering_grove_sanctum`, `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`, `sub_root_cellar`, `sub_bell_workshop`** có thể bắt đầu dọn bug va chạm/tường vô hình (`W20-BUG-001..010`) và nâng cấp tileset **`Resurrected RPG 1.1` / `Serene Village` theo kế hoạch `LAB-01`** NGAY KHI Owner mở lệnh `HW-WORLD-20B..20D`, mà **CHƯA BỊ CHẶN** bởi lore (chỉ cần giữ nguyên tọa độ NPC/quest interactables và biển tên trung lập).
- **Mục CẦN CHỐT TRƯỚC KHI ĐỔI MAP LIÊN QUAN:**
  1. **`OQ-15` + `OQ-HW-BOSS`:** Trước khi đặt bệ boss hoặc thay đổi cổng mở khóa tại **`veil_origin_cavern`** (`currently knight_commander_defeated`) và **`sunken_crypt_ruins`** / **`abyssal_chasm`**, phải chốt Dark Knight / Headless Warden có đặt tại đó hay không.
  2. **`OQ-08`:** Có giữ nhãn text *"Hầm Mộ Cổ Ngữ"* / tên Việt trên World Map `[M]` (`ParchmentWorldMapModal.ts`) hoặc chỉnh địa danh theo cụm *"Làng Sương Mù"* không.

---

## 6. CÓ THỂ QUYẾT ĐỊNH SAU (`Deferred / Không Chặn Giai Đoạn Đầu`)

| ID | Nội dung có thể quyết định ở giai đoạn kế tiếp | Lý do an toàn |
| :--- | :--- | :--- |
| **`OQ-10`** | Mức độ Edda nhận ra NVC từ trước & lý do bà giữ kín câu chuyện. | Lời thoại baseline & 2 thẻ `DLG-006/007` đủ vận hành Hồi I mà không lộ danh tính. |
| **`OQ-19`** | Chọn phương án dựng Prologue `28s` (**C: Hybrid** vs **A: In-Engine** vs **B: Video 1080p**), bật/tắt Gallery xem lại. | Hoàn toàn độc lập phía trước `startAct0Intro()`, không chạm save schema hay main route. |
| **`OQ-20` *(Mục a)*** & **`AUDIO-LIC`** | Giao file **DAW Audio Stems `V12.2`** (`D–F–E–A` tách lớp Piano/Cello/Strings), file `V12.2 Ultra Master` (nếu có), log `V1–V6`, và xác minh license **`wantosure` (`Mystic_Autumn_Knights` — `27` WAV SFX)** / **`32x32` & `64x64Materials.png`**. | Runtime audio baseline (`65` files) đã ổn định 100%; có thể tích hợp nâng cấp ở Queue `E` riêng sau khi xong Map/Narrative. |
| **`DEV-BUG-058/059`** | Chốt lịch chuyển giao cho **Codex** xử lý dứt điểm `BUG-058` (Scale Pop atlas `84×72`) & `BUG-059` (30px vs 41px HD Consistency) trên `BlackKnightPlayer.ts`. | Độc lập hoàn toàn với Narrative; AG không tự ý can thiệp mã Codex. |
