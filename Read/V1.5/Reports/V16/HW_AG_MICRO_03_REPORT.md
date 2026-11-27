# HW-AG-MICRO-03 — Báo Cáo Kiểm Tra Lỗi Cảnh Báo `mat_skull_fang` Trong `SaveManager`

- **Project:** HOLLOW WOODS V1.6.1
- **Branch:** `feat/v1.6-competition-preview`
- **Baseline / Review Milestone:** `bf4b629888750f5dbaee1b7092ef852e673958d8`
- **Status:** **BLOCKED** (cần quyết định của **HW-Code** — không sửa source ngoài phạm vi)
- **Date:** 2026-11-28

---

## 1. Kết Luận Nhanh (Verdict: BLOCKED)

Theo quy tắc nhiệm vụ:
> *"Chỉ sửa registry/catalog mapping đã chứng minh sai; nếu không thể sửa ngoài SaveManager hoặc thay schema, báo BLOCKED để HW-Code quyết định."*

Qua kiểm tra toàn bộ nhánh `feat/v1.6-competition-preview`:
- **Registry, catalog (`items.json`), recipes, reward và UI mapping cho `mat_skull_fang` đều ĐÚNG và ĐẦY ĐỦ.** Không có lỗi sai nào ngoài `SaveManager.ts`.
- **Nguyên nhân duy nhất** gây cảnh báo `[SaveManager Warning] Nhận diện runtimeKey lạ trong túi đồ: "mat_skull_fang"` nằm tại danh sách `SaveManager.KNOWN_ITEM_KEYS` trong `src/systems/SaveManager.ts:75-87`, là phần bị giới hạn không được tự ý sửa khi chưa có quyết định của HW-Code.

---

## 2. Kết Quả Đối Chiếu Chi Tiết Trên Nhánh AG

| Thành phần | Trạng thái | Bằng chứng trong source |
|---|---|---|
| `src/data/items.json` | HỢP LỆ | Dòng 341: `id: "mat_skull_fang"`, `name: "Nanh Xương Cổ"`, `category: "material"`, `stackable: true`, `maxStack: 10` |
| Recipes trong `src/data/items.json` | HỢP LỆ | `craft_skull_fang_spear` (dòng 571) & `craft_skull_fang_charm` (dòng 583) đều dùng `{ "itemId": "mat_skull_fang", "count": 1 }` |
| `src/registry/registryData.ts` | HỢP LỆ | Dòng 385–391: `HW-ITM-MAT-000004`, `slug: 'skull_fang'`, `runtimeKey: 'mat_skull_fang'`, `aliases: ['skull_fang', 'nanh_soi_xuong', 'mat_skull_fang']` |
| `src/data/content_registry.json` | HỢP LỆ | Dòng 374–380: đồng bộ khớp hoàn toàn với `registryData.ts` |
| `src/entities/SkullWolfEntity.ts` | HỢP LỆ (không trùng reward) | Dòng 410 gọi `PlayerState.getInstance().addItem('mat_skull_fang', 1)` đúng 1 lần; event `skull_wolf_defeated` (dòng 413) tại `GameScene.ts:783-787` chỉ gọi `uiScene.showPopupMessage(...)`, **không** gọi `addItem` lần 2 |
| UI & Crafting | HỢP LỆ | `UIScene.ts:2550`, `CraftingModal.ts:243,1260`, `ItemTooltipHelper.ts:66`, `QuickCraftSidebar.ts:767` đều có `mat_skull_fang` |
| `src/systems/SaveManager.ts` | **NGUYÊN NHÂN CẢNH BÁO** | `SaveManager.KNOWN_ITEM_KEYS` (dòng 75–87) là `Set<string>` hardcode các item V1.3/V1.4 cũ, **không** đọc `items.json` / `ContentRegistry` và **thiếu `mat_skull_fang`** (cùng 12 item hợp lệ khác trong `items.json`). Khi load save có `mat_skull_fang`, dòng 232–233 ghi `console.warn` nhưng vẫn bảo toàn item. |

### Danh sách 13 ID hợp lệ trong `src/data/items.json` đang thiếu trong `SaveManager.KNOWN_ITEM_KEYS`:
`food_forest_root_soup`, `res_forest_roots`, `res_forest_mushroom`, `res_tough_fiber`, `seed_roots`, `seed_mushroom`, `seed_fiber`, `mat_skull_fang`, `mat_shadow_essence`, `quest_rune_fragment`, `quest_purification_key`, `eqp_skull_fang_charm`, `eqp_abyssal_ward_charm`.

---

## 3. Đề Xuất Cho HW-Code

1. Cho phép bổ sung `mat_skull_fang` (hoặc đồng bộ từ `items.json` / `ContentRegistry`) vào `SaveManager.KNOWN_ITEM_KEYS` tại `src/systems/SaveManager.ts:75-87` — giữ nguyên cảnh báo với key thật sự lạ.
2. Không cần thay đổi `Save Schema 3`, `ContentRegistry`, `items.json` hay `SkullWolfEntity.ts`.

---

## 4. Bằng Chứng & Trạng Thái Worktree

- Audit JSON: `Read/V1.5/Reports/Evidence/HW-AG-MICRO-03/micro03_audit.json`
- Không sửa bất kỳ file source nào (`git diff` trống).
- Không chạy browser vì Node audit đã chứng minh đầy đủ nguyên nhân gốc.
