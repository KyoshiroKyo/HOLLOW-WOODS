# HW-CODEX-MICRO-03-R1 — SaveManager known item keys

**Kết quả** · PASS. Owner đã cho phép sửa phạm vi hẹp. Baseline Codex và origin trên `feat/v1.6-codex-development` cùng là `774ce3da0445a50afa662f8bb48f4aa76d3c9e8f`.

## Nguyên nhân và phạm vi

Đối chiếu từng ID trong `src/data/items.json` với `SaveManager.KNOWN_ITEM_KEYS` cho đúng 13 mục thiếu như báo cáo AG. SaveManager giữ vật phẩm nhưng phát cảnh báo sai khi sanitize inventory. Bản vá chỉ thêm 13 mục vào danh sách đã có, giữ hai ID tương thích `item_runed_iron_part`, `food_root_soup`, alias `quest_corrupted_knight_crest` → `quest_corrupted_crest` và cảnh báo với ID lạ. [Báo cáo AG](https://github.com/KyoshiroKyo/HOLLOW-WOODS/blob/5498bbb7f86c00b84906c7ed0aae22d13841f922/Read/V1.5/Reports/V16/HW_AG_MICRO_03_REPORT.md)

| Nhóm | ID đối chiếu |
| --- | --- |
| Thực phẩm / nguyên liệu | `food_forest_root_soup`, `res_forest_roots`, `res_forest_mushroom`, `res_tough_fiber` |
| Hạt giống | `seed_roots`, `seed_mushroom`, `seed_fiber` |
| Vật liệu | `mat_skull_fang`, `mat_shadow_essence` |
| Nhiệm vụ | `quest_rune_fragment`, `quest_purification_key` |
| Trang bị | `eqp_skull_fang_charm`, `eqp_abyssal_ward_charm` |

Schema 3, sanitizer, hành vi thưởng FIX-23, đường cloud và B07-R1 giữ nguyên. Không có Rune Charm được phục hồi tự động. Legacy Rune Charm Recovery vẫn HOLD.

## Kiểm thử

| Kiểm thử | Kết quả |
| --- | --- |
| Ca MICRO-03-R1 trên baseline | FAIL như dự kiến. 17 ca B07-R1 đạt. Ca mới ghi cảnh báo cho 13 ID hợp lệ và ID lạ. |
| `node --test --test-reporter=tap scripts/verify_b07_edda_save_migration.mjs` sau vá | **18/18 PASS**, gồm 17 ca B07-R1 và ca MICRO-03-R1. Fixture chạy Load → Save → reset → Reload qua SaveManager thật và storage in-memory. Cả 13 ID, số lượng, ID cũ và alias được bảo toàn. ID lạ được giữ và cảnh báo đúng một lần mỗi lần sanitize, tổng ba lần. Hai cờ Edda vẫn có, số bùa vẫn bằng 0. |
| B05 và Schema 3 | **6/6 PASS** và **PASS**, gồm vòng lặp local và cách ly QA namespace. |
| TypeScript và production build | **PASS**. Build cách ly tại `scratch/hw-codex-micro-03-r1/dist`, 104 modules. Cảnh báo startup script và font lúc bundle vẫn xuất hiện. |
| Browser, Portal, SDK cloud thật, save Owner | **NOT RUN**. Kiểm thử cloud trong harness dùng mock. |

Commit chỉ gồm patch danh sách, một ca kiểm thử và báo cáo. ZIP dự thi và các cổng khác giữ nguyên. HARD STOP chờ Owner nghiệm thu.
