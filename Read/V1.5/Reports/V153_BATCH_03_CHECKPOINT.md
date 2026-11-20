# V153-BATCH-03 — Checkpoint R2

**20/11/2026 · Nhánh `work` · HEAD `b5eaa61`**

| Lệnh | Trạng thái | Bằng chứng |
|---|---|---|
| B03-00 / CLOUD-01B | LOCAL PASS | 53 tệp Batch 02 tồn tại, 5 bảng tham chiếu, 34 metadata và 324 PNG nguồn. Hai manifest P2Game đồng nhất. Đã kiểm tra kích thước avatar, cover, sáu ảnh runtime, atlas menu và TypeScript. |
| CLOUD-01C | PARTIAL | Armed Idle có sáu frame mỗi hướng. UP/DOWN đạt kiểm tra hình và cấu trúc ở canvas 144×64. RIGHT tham chiếu Fellor nguyên gốc. LEFT R1 và R2 là ứng viên. R2 đã gần hơn về tỷ lệ và đúng tư thế tay gần, vẫn còn 1–3 pixel viền cyan trong bốn frame và tông giáp sáng hơn nguồn. |
| CLOUD-01D → CLOUD-01W | BLOCKED tại gate CLOUD-01C | Chưa sản xuất các nhóm còn lại. Cần khớp hai profile Armed Idle trước khi chuyển sang các nhóm chuyển động đã định thứ tự. |
| CLOUD-01X | LOCAL PASS | Chân dung Fellor 64×64 tập trung vào mũ trụ. Chromium xác nhận hai khóa hội thoại đều dùng đúng pixel của PNG mới. |
| CLOUD-01Y / CLOUD-01Z | BLOCKED | Atlas sản xuất và tích hợp phụ thuộc coverage bốn hướng. |
| CLOUD-FIX-09 | LOCAL PASS | Save schema 3 giữ metadata, ID, vũ khí, tiến trình và trạng thái nông trại qua Continue và lưu lại. |
| CLOUD-02C | LOCAL PASS · R1 | Chromium xác minh Normal, Shift+D, hụt sức và hồi sức với ngưỡng đang dùng 30. |
| CLOUD-02A-R | LOCAL PASS | Thêm phụ đề Việt, làm mềm mép artwork, xác nhận menu 12 frame và năm nút tại ba viewport. |
| CLOUD-01Y-R | LOCAL PASS | Player, registry và JSON đã chuyển tên Black Knight. Chromium xác nhận alias, 72 cặp animation key, New Game, Continue schema 3 và F9. |
| P0 startup (CLOUD-P2-FIX-01 → 05) | PRODUCTION LOCAL PASS · HOSTED BLOCKED | Tái hiện và sửa SDK chậm hoặc init treo. Chromium production qua root, subpath, iframe với Continue schema 3 và renderer Canvas khi WebGL bị tắt. |

**Bằng chứng CLOUD-01C** [Metadata và provenance](<../../../Pixel_Art/Black Knight/Custom_4Dir/Animation_Frames/armed-idle/metadata.json>) · [Contact sheet](Visuals/V153_BATCH_03/armed-idle-contact.png) · [Preview 1×](Visuals/V153_BATCH_03/armed-idle-native.gif). Đã kiểm tra 6 frame/hướng riêng biệt, alpha 0/255, đáy hình tại y=63 và 70 ms/frame. Dùng các frame ImageGen bổ sung và frame RIGHT trong Source Library.

**Bằng chứng CLOUD-01X** [Ảnh trước và sau](Visuals/V153_BATCH_03/portrait-before-after.png) · [Hội thoại Chromium](Visuals/V153_BATCH_03/portrait-dialogue.png). TypeScript đạt. Kiểm kê loader có 210 đường dẫn hợp lệ và 0 đường dẫn thiếu sau khi dùng chung một URL cho hai texture cũ.

**Bằng chứng CLOUD-01Y-R** [Migration và compatibility](V153_LEGACY_NAMING_MIGRATION.md). TypeScript và Git diff đạt. Test combat 65/66 như baseline vì ảnh preview legacy vắng trong Cloud.

**Bằng chứng CLOUD-02A-R** [UI và Main Menu](V153_UI_UX_REPORT.md). Chromium qua animation, ảnh tĩnh, phím và chuột, Continue và kiểm tra ba viewport.

**Bằng chứng CLOUD-FIX-09** HEAD thay metadata từ 1.5.0 thành 1.5.1 ở commit `cf99614`, còn schema là 3. Lượt trước sửa tái hiện mất metadata schema, vũ khí và dữ liệu trồng trọt. Chromium nạp fixture schema 3 1.5.0 từ khóa legacy, xác nhận task, unlock, vật phẩm, trang bị, vũ khí, cờ, đất và loại cây. Game ghi lại schema 3 1.5.1 với 32 trường payload. Chromium tải lại và kiểm tra lần nữa. Kiểm tra nguồn Save 49/49 sau khi assertion đo đúng schema. Test round trip Node và kiểm tra SDK 31/31 đạt.

**B03-RESUME-00 · LOCAL PASS.** Đã đối chiếu cây làm việc nhánh `work`, cả 53 tệp Batch 02 và artifact từ R1. Có sáu tệp Batch 02 được chỉnh trong phạm vi menu, portrait hoặc HUD của R1. SHA-256 kho Fellor và Source Library khớp. TypeScript, kiểm thử schema 3 và `git diff --check` đạt. CLOUD-FIX-07 chỉ ở bước đọc dữ liệu, chưa sửa AI. [Bốn trạng thái chạy](Visuals/V153_BATCH_03/running-hud.png).

**CLOUD-FIX-04A / CLOUD-FIX-02A / CLOUD-FIX-01A · PARTIAL.** Đã sửa footprint tĩnh 32×32 và camera nhìn ra ngoài nền. Đã đi qua Fog Crossing → Bellhollow, kiểm tra nhà Neris, Cổng Đông, Crooked Path, Outer Woods và hai chiều Sanctuary Farm. Còn tuyến đi đầy đủ. [Báo cáo địa hình](V153_WORLD_REPAIR_REPORT.md).

| Nhóm còn lại | Trạng thái tại checkpoint |
|---|---|
| CLOUD-02E-R / CLOUD-FIX-06 | LOCAL PASS các ca hội thoại Neris, Garth, Edda. Còn tiến trình toàn tuyến quest và NPC khác. |
| CLOUD-02G-R / CLOUD-02G | PARTIAL. Badge, bố cục quest dài và thu gọn, HUD lúc thoại đã kiểm tra. Hosted và responsive toàn game còn thiếu. |
| CLOUD-02 / CLOUD-02D / CLOUD-02F | PARTIAL. Có UI Pack từ Batch 02. Chromium kiểm tra J, I, B, N và Esc mở/đóng Tạm dừng. Còn phần nghiệm thu riêng từng panel. |
| CLOUD-FIX-01 → 04 | PARTIAL qua fixture Bellhollow, Cổng Đông khóa/mở, tuyến Crooked Path quay về và Outer Woods. Còn nhà/cây/đường tại các vùng khác. |
| CLOUD-FIX-05 / 07 / 08 / 10 | PARTIAL. Data, Vòng Sáng và các ca runtime trong QA đạt. Còn chơi craft/resource, AI sinh vật, fog ở vùng sâu và kiểm tra dài phiên. |
| CLOUD-CLEAN-03 / 05 | PARTIAL. Audio unlock, tệp ambience và mẫu Web Audio đã đo, rè/rít chưa tái hiện. Chưa có benchmark 60 FPS. |
| CLOUD-P2-01 / 02 / 03 | LOCAL PASS cho hai manifest và media Batch 02. Hosted BLOCKED. Gallery mới chờ CLOUD-01Z. |
| B03-P0-RECHECK / CLOUD-QA-01 → 03 | PARTIAL. Đã kiểm tra production và các tuyến fixture. Lượt từ New Game xuyên nhiệm vụ vẫn thiếu. |
| CLOUD-REPORT-01 / CLOUD-RELEASE-01 | Đã lưu báo cáo kỹ thuật tại checkpoint. RELEASE BLOCKED. |

**Tệp R2 thay đổi** `index.html`, `public/startup-status.js`, `src/main.ts`, `src/scenes/GameScene.ts`, `src/scenes/UIScene.ts`, `src/entities/NPCEntity.ts`, `src/systems/DialogueSystem.ts` và `src/world/WorldBuilder.ts`, cùng báo cáo và ảnh QA tại `Read/V1.5/Reports/`. Save và migration R1 được kiểm thử lại trên worktree chứa các thay đổi R2.

**Lệnh kế tiếp** CLOUD-01C duyệt LEFT đạt silhouette, tay cầm và alpha cùng UP/DOWN/RIGHT, sau đó tiếp tục CLOUD-01D → 01W, atlas và tích hợp. Các việc độc lập là hoàn tất B03-P0-RECHECK từ New Game, tương tác crafting/canh tác và các vùng sâu, đo audio/hiệu năng, nghiệm thu UI và sửa lỗi xác minh tiếp theo. Để xác định lỗi hosted cần link preview được cấp quyền và bản build có lỗi hoặc log Console/Network.

[Ma trận](V153_CHARACTER_ANIMATION_MATRIX.md) · [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md) · [UI](V153_UI_UX_REPORT.md) · [QA](V153_FINAL_QA_REPORT.md).
