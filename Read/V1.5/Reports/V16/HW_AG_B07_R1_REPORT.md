# HW-AG-B07-R1 — Real Save Migration Verification

**Trạng thái:** BLOCKED / NEEDS OWNER DECISION cho việc phục hồi bùa bị thiếu. Bản vá ngăn cấp tự động và harness đã được kiểm tra.

**Nhánh:** `feat/v1.6-competition-preview`

**Baseline:** `7713be6ebee88059e6706954720872539551d420`, local và origin trùng trước khi sửa.

**Tham chiếu:** [B07 gốc](HW_AG_B07_SAVE_MIGRATION_REPORT.md) · [FIX-23](HW_AG_FIX_23_REPORT.md) · [Kết quả browser FIX-23 tại checkpoint gốc](../Evidence/HW-AG-FIX-23/fix23_results.json).

## Kết luận từ source

- FIX-23 sửa thứ tự thưởng Edda bằng snapshot cờ trước khi áp dụng lựa chọn. Cờ `edda_rune_charm_granted` là cờ lựa chọn, còn `dlg_reward:edda_rune_guide` được ghi kể cả khi nhánh cấp vật phẩm bị bỏ qua. Từng cờ riêng lẻ, cả hai cờ và việc thiếu charm đều thiếu bằng chứng xác định save được tạo từ bản lỗi. Save sau FIX-23 có thể dùng cùng Schema 3 và `version: "1.6.0"`. Timestamp là mốc ghi save, thiếu liên hệ đã xác minh với bản build chạy hội thoại. Cờ `migrated_edda_rune_charm_v161` ghi nhận B07 đã xử lý snapshot, kể cả khi bùa vốn đã có. [DialogueSystem](../../../../src/systems/DialogueSystem.ts#L414) · [SaveManager](../../../../src/systems/SaveManager.ts)
- B07 gốc cấp một bùa khi chỉ có một trong hai cờ và không thấy bùa trong ba vị trí đã chuẩn hóa. Ca thiếu trường sở hữu cũng khớp với điều kiện này. B07 còn đồng bộ cờ Edda và thêm cờ migration cho cả save đã có bùa hợp lệ. Harness tái hiện việc `saveGame()` ghi bùa vào payload dù trạng thái đang chơi vẫn có 0.
- Bùa thuộc nhóm trang bị, không có hiệu ứng tiêu hao. Việc thay hoặc tháo bùa trả món cũ về túi. Cất rương chuyển quyền sở hữu sang rương. Rà các đường `removeItem`, UI túi/rương và công thức trong source hiện tại chưa tìm thấy hành vi gameplay hợp lệ làm mất bùa vĩnh viễn qua bỏ, bán, đổi lấy vật phẩm khác hoặc tiêu hao. `craft_purified_crest_ward` tiêu hao Huy Hiệu Tha Hóa, Nhựa Thông và Thảo Dược, tạo đúng cùng ID bùa và đặt `crafted_craft_purified_crest_ward`. SQ08 cũng có phần thưởng cùng ID. Nguồn sở hữu đa dạng khiến việc thiếu hoặc có bùa tự thân không xác định kết quả hội thoại Edda. [PlayerState](../../../../src/state/PlayerState.ts#L304) · [EquipmentSystem](../../../../src/systems/EquipmentSystem.ts#L181) · [CampSystem](../../../../src/systems/CampSystem.ts#L240) · [Công thức](../../../../src/data/items.json#L607) · [SQ08](../../../../src/data/dialogues.json#L785)
- R1 bỏ đường cấp bùa và tự thêm cờ Edda của B07 khỏi sanitizer. Vật phẩm và cờ đã ghi tiếp tục được nạp theo hợp đồng hiện hành. R1 cũng làm `hasSave()` và `getSaveSummary()` chỉ đọc, kể cả khi chỉ còn khóa legacy. Logic phần thưởng Edda, crafting, Schema 3 và chính sách sở hữu giữ theo source hiện hành.

## Phạm vi call-site

| Call-site | Hành vi và bằng chứng |
| --- | --- |
| `sanitizeAndMigrateSaveData()` | Chạy implementation thật. Kiểm tra thiếu hai cờ, từng cờ ở cả hai set, cả hai cờ kèm trường thiếu, marker ở từng set, túi/trang bị/rương và alias rương. Trả dữ liệu chuẩn hóa, giữ nguyên input. |
| `getSaveSummary()`, `hasSave()` | Đọc khóa hiện tại và khóa legacy. Trước R1, đọc khóa legacy có thể sao chép sang khóa hiện tại. Sau R1, so sánh nguyên trạng cả fake storage và inventory/flags/storyFlags của PlayerState. |
| `loadGame()` → `applySaveToState()` | Chạy parser, backup nội bộ vào Map giả lập, sanitizer và hydrate thật. Fixture B07 đã phục hồi qua load → save → reset → reload giữ đúng một bùa và marker. Giữ quy tắc sao lưu và chuyển khóa local khi thực sự nạp. |
| `loadGameAsync()` → `CloudSaveService.loadGameProgress()` → `applySaveToState()` | Dịch vụ cloud thật với mock `p2.storage`. Đọc `progress`, chạy chuẩn hóa cloud và kiểm tra payload local đồng bộ. Hai fixture 0/1 bùa cho cùng kết quả local/cloud. Cloud reload đọc lại bản vừa lưu sau khi xóa Map local và reset PlayerState. |
| `saveGame()` → `CloudSaveService.saveGameNow()` | Dựng snapshot từ PlayerState thật và kiểm tra payload đã ghi local/cloud. Save 0 bùa với hai cờ giữ 0. Quest task, inventory khác, trang bị, rương, cờ nguyên bản và `legacyExtraData` được kiểm tra qua vòng lặp local/cloud. |
| Lưu nhanh khi rời game, timer lưu cloud và SDK lifecycle | Các đường này có thể gọi `saveGameNow()` trực tiếp. R1 đọc đối chiếu source; runtime Event/SDK chính thức NOT RUN. |

## Fixture và kết quả

[Harness tái hiện được](../../../../scripts/verify_b07_edda_save_migration.mjs) dùng esbuild bundle in-memory và `node:test`. Fixture tổng hợp có Schema 3, version `1.6.0`, nhiệm vụ thật với task hoàn tất, vật phẩm độc lập, trang bị, rương, story flags và dữ liệu mở rộng. Fixture 0 bùa tái tạo triệu chứng của lỗi trước FIX-23. Fixture 1 bùa và marker mô tả save đã phục hồi từ B07. Cả hai dùng timestamp thử nghiệm; R1 không lấy timestamp làm điều kiện. Chỉ Phaser, scene/input presentation, localStorage và SDK storage được thay bằng stub/mock. Logic save, apply, cloud, đối thoại và chế tạo lấy từ source.

| Kiểm tra | Kết quả |
| --- | --- |
| Cùng harness trên baseline B07, trước bản vá | **6 PASS / 11 FAIL**. Các lỗi bao gồm cấp bùa cho fixture thiếu bằng chứng, tự thêm cờ khi đã có bùa, summary ghi khóa legacy, save tự cấp, async/load nhận bùa và save mới sau FIX-23 bị gắn marker. |
| `node --test --test-reporter=tap scripts/verify_b07_edda_save_migration.mjs` sau bản vá | **17 PASS / 0 FAIL** cho các assertion an toàn và bảo toàn dữ liệu, gồm FIX-23 và cloud/local mock integration. |
| Regression FIX-23 bằng implementation thật | Hủy thoại trả 0 và không đặt cờ. Edda hoàn tất lần đầu 0 → 1, nói lại vẫn 1. Save → load → nói lại giữ 1 và hai cờ. Neris cấp thuốc đúng một lần. Test đi từ node thoại tới handler, không diễn tập phím hoặc render. |
| `node scripts/verify_v16_b05_quest_hardening.mjs` | **6/6 PASS**, gồm kiểm tra runtime Node và kiểm tra tĩnh các guard hội thoại. |
| `node scripts/test_v153_save_schema3.mjs` | **PASS**, Schema 3, vòng lặp local và QA namespace. |
| `npx --no-install tsc --noEmit` | **PASS**, exit 0. |
| `npm run build -- --outDir <thư mục tạm>` | **PASS**, 102 modules, 6,43 giây phần Vite. Vite cảnh báo outDir ngoài root, startup script không phải module và hai đường dẫn WOFF được giữ cho runtime. Build xác nhận có `index.html`, thư mục tạm đã dọn. |
| Browser FIX-23 / P2Game SDK thật / save Owner / 5 checkpoint | **NOT RUN**. Báo cáo gốc có bằng chứng browser 5/5, không tính là kết quả của R1. R1 không mở Chrome, Vite dev server hoặc kết nối SDK thật. |

## Gate phục hồi

Ca “bản lưu được xác nhận bị lỗi nhận đúng một bùa mới” vẫn **BLOCKED**. Chưa có dấu phiên bản hoặc lịch sử giao dịch để nhận diện tự động trong dữ liệu đã lưu. Đề xuất Owner/HW-Code duyệt phương án phục hồi theo từng bản lưu có nguồn gốc xác minh độc lập, ví dụ bản sao có lịch sử build và bằng chứng giao dịch Edda thất bại. Trên bản sao cách ly, xác nhận tổng sở hữu bằng 0 ở túi, ô charm và rương, áp dụng đúng một lần, giữ dữ liệu đang có và xác minh load → save → reload giữ đúng một. Với bản lưu còn mơ hồ, giữ nguyên. Cần Owner duyệt bằng chứng và thao tác trước khi triển khai công cụ phục hồi.

**HARD STOP:** Chờ Owner/HW-Code nghiệm thu. **SYNC-03 HOLD.**
