# HW-CODEX-SYNC-03 — B07-R1 Safety Patch Integration

**Nghiệm thu kỹ thuật:** PASS trên Codex Local.

**B07-R1 Safety Patch:** APPROVED, đã tích hợp.

**Legacy Rune Charm Recovery:** HOLD.

## Checkpoint và phạm vi

| Mốc | Giá trị |
| --- | --- |
| Worktree / nhánh | `G:\HOLLOW_WOODS_CODEX` · `feat/v1.6-codex-development` |
| PRE_MERGE_SHA | `7327b7d351207db2f833c4c2d9c7cedeca3cf9c8`, đúng local HEAD và remote trước merge |
| AG SHA được duyệt và đã xác minh trên origin | `7246f4b74b51f013395c123edc16f0134196f905` |
| Merge base | `9c940b6d20bfe0b432e51e6ec4597a65cc316ead` (FIX-23) |
| Ref backup local | `refs/backup/hw-codex-sync-03/pre-merge-7327b7d` trỏ PRE_MERGE_SHA, tạo mới |
| Mốc dự thi | `35317c0ef397edb8da3ce7471a18e5b87cada6a9`, đã xác minh là ancestor của PRE_MERGE_SHA |

AG có hai commit trong phạm vi: `7713be6` và `7246f4b`. Merge dùng `--no-ff --no-commit` với SHA đã duyệt, tự động hợp nhất và không có conflict. SHA sau tích hợp là merge commit chứa báo cáo này. Hai parent được xác minh là PRE_MERGE_SHA và AG SHA khi hoàn tất checkpoint.

| Tệp từ AG | Diff ròng từ FIX-23 |
| --- | --- |
| [SaveManager.ts](../../../../src/systems/SaveManager.ts) | +4 / −4. `hasSave()` và `getSaveSummary()` đọc khóa legacy với `promoteLegacy: false`. `loadGame()` vẫn giữ chuyển khóa và sao lưu tương thích. |
| [Harness B07-R1](../../../../scripts/verify_b07_edda_save_migration.mjs) | +332. Bundle và gọi implementation thật. |
| [Báo cáo B07 gốc](HW_AG_B07_SAVE_MIGRATION_REPORT.md) | +88. Hồ sơ lịch sử. Ba dấu ngắt dòng Markdown dùng khoảng trắng cuối dòng được giữ nguyên theo blob AG và kiểm tra riêng. |
| [Báo cáo B07-R1](HW_AG_B07_R1_REPORT.md) | +48. Quyết định kỹ thuật hiện hành. |

Cả bốn tệp khớp byte với tree AG được duyệt. Diff từ PRE_MERGE_SHA ngoài bốn tệp chỉ có báo cáo SYNC-03. Không còn `migrateEddaRuneCharmV161()`, đường tự cấp Bùa Chuông Cổ hoặc đường tự thêm cờ Edda của B07. Schema 3, hành vi FIX-23, item và cờ đã ghi được giữ. Fixture chưa rõ nguyên nhân thiếu bùa giữ số lượng 0. Cơ chế phục hồi có kiểm soát chờ quyết định riêng.

INTRO-01, AUDIO-01A/01B và mẫu review, LORE-SYNC, ANIM-01, WORLD-01 và SYNC-02 được bảo toàn qua đối chiếu tree. Build và validator dùng thư mục cách ly trong `scratch/`. ZIP dự thi, bản offline, save thật, worktree AG và main được giữ nguyên.

## Kiểm thử và bằng chứng

Môi trường Windows, Node v26.7.0, Vite 5.4.21. Browser dùng một phiên Chrome headless, profile tạm, Vite preview trên localhost và chặn truy cập SDK ngoài. Smoke dùng game build thật, khởi tạo từ profile mới. Hội thoại gọi điểm vào của DialogueSystem rồi xử lý qua runtime thật, không diễn tập đường di chuyển tới Edda. Save/Continue dùng chính save vừa tạo trong profile cách ly.

| Lệnh / phép kiểm | Kết quả |
| --- | --- |
| `node --test --test-reporter=tap scripts/verify_b07_edda_save_migration.mjs` | **17/17 PASS**, exit 0. Bao phủ save 0 bùa, ownership túi/trang bị/rương, cờ cũ, summary chỉ đọc, crafting, FIX-23 và local/cloud mock round trip. |
| `node scripts/verify_v16_b05_quest_hardening.mjs` | **6/6 PASS**, exit 0. |
| `node scripts/test_v153_save_schema3.mjs` | **PASS**, exit 0. Schema 3, vòng lặp local và QA namespace. |
| `npx --no-install tsc --noEmit` | **PASS**, exit 0. |
| `npm run build -- --outDir scratch/hw-codex-sync-03/dist` | **PASS**, exit 0, 104 modules. Vite cảnh báo startup script không phải module và hai URL font được phân giải lúc chạy. |
| `scripts/validate_p2game_build.mjs` trên build cách ly | **23/23 PASS**, exit 0, tìm thấy startup script và cả hai font. Sáu media legacy chưa tham chiếu là cảnh báo local. |
| SE-004 | **PASS**, không tìm thấy `navigator.clipboard` hoặc `clipboard-write` trong app chunk `index-CFlog3R7.js`. |
| RT-002 và SDK startup regression | **28/28 PASS** V15-48 và **31/31 PASS** V152-08, đều exit 0. Chromium ghi 0 lần gọi focus canvas trước click và chỉ ghi lần gọi sau khi có user activation. |
| Smoke Chromium / FIX-23 | **6/6 PASS**, exit 0. Main Menu hiển thị và loader ẩn; New Game mở Prologue độc lập; Space chuyển tới Fog Crossing; hủy thoại giữ 0 bùa; Edda cấp 0 → 1 → 1; Neris cấp thuốc 0 → 1 → 1; Save → reload → Continue → nói lại giữ đúng một bùa và hai cờ. Trace ghi 0 lỗi runtime. |
| Portal P2Game thật / cloud SDK thật / EVKey hoặc UniKey vật lý | **NOT RUN**. Validator chỉ xác nhận bản local, cloud được kiểm tra bằng mock và bàn phím dùng input DevTools. |

Evidence local ở `scratch/hw-codex-sync-03/`: `build.log`, `validator.json`, `browser.log`, `browser/fix23_results.json` và năm ảnh Menu, Prologue, trước và sau nhận bùa, sau Continue. Đã xác minh còn **0 tiến trình Chrome/Vite và 0 profile Chrome do task tạo**.

**HARD STOP:** Chờ Owner nghiệm thu checkpoint. BALANCE-01 và BOSS-01-R3 giữ QUEUED. Lore, Audio, Artwork và CHAR-006 giữ các cổng duyệt riêng. Legacy Rune Charm Recovery vẫn HOLD.
