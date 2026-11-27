# HW-AG-FIX-19 — SIR VAELEN MODEL CORRECTION REPORT

**Project:** HOLLOW WOODS V1.6.1  
**Branch:** `feat/v1.6-competition-preview`  
**Status:** VERIFIED & HANDED OFF TO CODEX / ART OWNER (0 Code/Asset Redesign Edits)

---

## 1. Kết quả đối chiếu Model & Asset Mapping

Đã đối chiếu trực tiếp model của **Sir Vaelen** (`npc_campfire_knight`) tại Trạm Lửa Rừng Tĩnh Lặng với thư viện asset trong `public/assets/characters/` và các thực thể hiệp sĩ đối địch trong `src/entities/EvilKnights.ts`, `src/scenes/PreloadScene.ts`, `src/systems/WildlifeSystem.ts`:

| Entity ID / Class | Vai trò | Texture Key | Asset Path | Kết quả đối chiếu |
|---|---|---|---|---|
| `npc_campfire_knight` (`NPCEntity`) | NPC đồng minh — **Sir Vaelen** tại Trạm Lửa `(1435, 710)` | `campfire_knight_pray_sheet`<br>`campfire_knight_idle_sheet`<br>`portrait_campfire_knight` | `assets/characters/npcs/campfire_knight_pray_sheet.png`<br>`assets/characters/npcs/campfire_knight_idle_sheet.png`<br>`assets/characters/npcs/portrait_campfire_knight.png` | **ĐÚNG** artwork NPC chính thức trong `assets/characters/npcs/`. |
| `FallenKnightEntity` | Kẻ địch — Hiệp Sĩ Sa Ngã (`crooked_path`, `deep_forest`, và 2 hộ vệ của Boss) | `fallen_knight_sheet` (`SPRITE_FALLEN_KNIGHT`)<br>`portrait_fallen_knight` | `assets/characters/enemies/fallen_knight_sheet.png`<br>`assets/characters/enemies/portrait_fallen_knight.png` | **TRÙNG NGUYÊN BẢN ARTWORK VỚI SIR VAELEN:** `fallen_knight_sheet.png` (gói *2D SL Knight v1.0*) dùng chung đúng nhân vật hiệp sĩ giáp bạc – áo choàng nâu như `campfire_knight_idle_sheet.png` (hàng 1) và `campfire_knight_pray_sheet.png` (hàng 4). Ban ngày `EvilKnights.ts:191` gọi `clearTint()` và khởi tạo ở tư thế quỳ `fallen_knight_pray` (`EvilKnights.ts:100`), khiến người chơi thấy giống hệt Sir Vaelen xuất hiện nhiều trong rừng và tấn công mình. |
| `DreadHorsemanEntity` | Kẻ địch — Kỵ Binh Hắc Ám | `dread_horseman_sheet` (`SPRITE_DREAD_HORSEMAN`)<br>`portrait_dread_horseman` | `assets/characters/enemies/dread_horseman_sheet.png`<br>`assets/characters/enemies/portrait_dread_horseman.png` | **ĐÚNG & PHÂN BIỆT RÕ** (kỵ binh cưỡi ngựa giáp đồng/nâu). |
| `HoodedKnightBoss` | Boss — Sir Mordric / Kỵ Sĩ Trùm Mũ | `hooded_knight_sheet` (`SPRITE_HOODED_KNIGHT`)<br>`portrait_hooded_knight` | `assets/characters/bosses/hooded_knight_sheet.png`<br>`assets/characters/bosses/portrait_hooded_knight.png` | **ĐÚNG & PHÂN BIỆT RÕ** (sprite 160x160 áo choàng rách + đại kiếm). |

---

## 2. Kết luận nguyên nhân & Lý do không tự sửa asset

1. **Không có lỗi tráo texture key trong `PreloadScene.ts`:** Mỗi entity đều trỏ đúng tới file mang tên của mình (`campfire_knight_*` -> `npcs/`, `fallen_knight_sheet` -> `enemies/`, `dread_horseman_sheet` -> `enemies/`, `hooded_knight_sheet` -> `bosses/`).
2. **Nguyên nhân gốc:** Thư viện `public/assets/characters/enemies/` hiện **không có sprite hiệp sĩ bộ binh riêng biệt nào khác** ngoài `fallen_knight_sheet.png` (vốn là bản gốc *2D SL Knight v1.0* trùng với Sir Vaelen).
3. Theo đúng giới hạn nhiệm vụ (*"Sử dụng đúng asset hiện có, không tự redesign nhân vật. Nếu nguyên nhân thuộc spawn, faction hoặc AI, ghi nhận và bàn giao Codex. Không sửa trùng WORLD-01 và BALANCE-01"*), AG không tự chỉnh màu/vẽ lại sprite hay sửa spawn/faction.

---

## 3. Bảng so sánh Trước / Sau & Bằng chứng hình ảnh

| Hạng mục | Trước kiểm tra | Sau đối chiếu (Hiện trạng xác nhận) |
|---|---|---|
| Sir Vaelen (`npc_campfire_knight`) | Dùng `campfire_knight_pray_sheet` / `campfire_knight_idle_sheet` | **Giữ nguyên** — đúng artwork NPC chính thức (`fix17_after_3_after_exit.png`) |
| `FallenKnightEntity` (`fallen_knight_sheet`) | Dùng `assets/characters/enemies/fallen_knight_sheet.png`, ban ngày không tint (`clearTint()`) | **Xác nhận trùng base art với Sir Vaelen** (`fix18_before_hit.png`: 2 `FallenKnightEntity` đứng hai bên `HoodedKnightBoss`). Cần Art/Codex thay thế hoặc phân biệt màu/spawn. |
| `DreadHorsemanEntity` & `HoodedKnightBoss` | Dùng `dread_horseman_sheet.png` & `hooded_knight_sheet.png` | **Đúng & giữ nguyên** |

---

## 4. Bàn giao cho Codex / Owner

1. **Tạo/thay thế asset riêng cho `fallen_knight_sheet.png` & `portrait_fallen_knight.png`** (hoặc bổ sung tint/shader phân biệt rõ ràng cả ban ngày lẫn ban đêm, tránh dùng tư thế `pray` giống hệt Sir Vaelen).
2. **Kiểm tra lại spawn/faction** tại `WildlifeSystem.ts:84-87` (`FALLEN_KNIGHT_HABITATS`: `crooked_path (2360, 240)`, `deep_forest (2040, -200)`) và 2 hộ vệ `FallenKnightEntity` cạnh `HoodedKnightBoss` (`WildlifeSystem.ts:536-537`).
