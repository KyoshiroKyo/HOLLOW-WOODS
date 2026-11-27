# HW-AG-CONTENT-01 — Báo Cáo Kiểm Kê Toàn Bộ Quái, Mod, Asset & 17 Phân Khu (DOC ONLY)

- **Project:** HOLLOW WOODS V1.6.1
- **Worktree / Branch:** `G:\HOLLOW_WOODS_C02` / `feat/v1.6-competition-preview`
- **Commit SHA:** `dcbe3ea0622103e35e73fe94480c4d160b1dc2ba` (sau mốc review AG `bf4b629888750f5dbaee1b7092ef852e673958d8`)
- **Mode:** **DOC ONLY** (static inventory đầy đủ; runtime sampling 17 zone là `NOT RUN` theo giới hạn quota)
- **Date:** 2026-11-28

---

## 1. Tệp Xuất Kèm Theo

1. [ENEMY_REGISTRY.csv](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/V16/ENEMY_REGISTRY.csv) — Kiểm kê toàn bộ entity (NPC, Boss, Enemy, Apparition, Ambush, Ambient Wildlife, Player Avatar).
2. [ZONE_MATRIX.csv](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/V16/ZONE_MATRIX.csv) — Ma trận 17 phân khu từ `src/data/zones.json`, `WorldBuilder.ts`, `WorldGatingSystem.ts`, `SafeSpawnResolver.ts`.
3. [ASSET_GAPS.md](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/V16/ASSET_GAPS.md) — Tổng hợp các entity chưa đăng ký, asset chưa dùng, sai lệch đường dẫn và 5 zone chưa hoàn thiện.

---

## 2. Kiểm Kê 4 Gói Mod (`HW-MOD-PACK-000001` .. `000004`)

Nguồn: `src/registry/registryData.ts:838-841`, `src/registry/ContentPackLoader.ts:56-59`, `src/systems/ContentPackValidator.ts:12-15,83-321`.

| Pack ID | Alias | Tên VN / EN | Trạng thái Registry | Nội dung chính |
|---|---|---|---|---|
| `HW-MOD-PACK-000001` | `pack_wildlife` | Gói Sinh Thái Rừng / Woodland Wildlife Pack | `PROPOSED_V1_4` | `WildlifeEntity` (`ani_crow`, `ani_lantern_moth`) |
| `HW-MOD-PACK-000002` | `pack_equipment` | Gói Trang Bị Sinh Tồn / Survival Equipment Pack | `PROPOSED_V1_4` | 4 ô trang bị cá nhân (`body`, `feet`, `back`, `charm`) |
| `HW-MOD-PACK-000003` | `pack_camp_cooking` | Gói Khu Trại & Ẩm Thực / Camp & Cooking Pack | `PROPOSED_V1_4` | Lửa trại 3 cấp, rương 12 ô, nồi thảo dược, lều |
| `HW-MOD-PACK-000004` | `pack_relics` | Gói Cổ Vật & Đấu Trùm / Ancient Relics & Boss Pack | `PROPOSED_V1_4` | 3 sub-zones (`sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`), Cổ Ngữ & Boss Mire Warden |

---

## 3. Phân Biệt Các Thực Thể Dễ Nhầm (Sir Vaelen / FallenKnight / Sir Mordric)

1. **Sir Vaelen (`npc_campfire_knight` / `HW-NPC-ALLY-000001`)**:
   - **Loại:** Friendly NPC tại `outer_woods` `(1435, 710)` (`src/data/zones.json`).
   - **Texture:** `campfire_knight_pray_sheet.png`, `campfire_knight_idle_sheet.png` (nguồn `2D SL Knight v1.0 Friendly NPC`).
2. **FallenKnightEntity (`mon_fallen_knight` / `HW-MON-KNIGHT-000001`)**:
   - **Loại:** Enemy (`4/4` HP, drop `res_dry_wood x1`), spawn tại `crooked_path` `(2360, 240)` và `deep_forest` `(2040, -200)` + **2 cận vệ** cạnh `HoodedKnightBoss` (`WildlifeSystem.ts:536-537`).
   - **Texture:** `fallen_knight_sheet.png` (cùng gói gốc `2D SL Knight v1.0` với Sir Vaelen, khác key texture).
3. **FallenKnightApparition (`src/entities/FallenKnightApparition.ts`)**:
   - **Loại:** Ảo ảnh Sanity 2.1 (non-combat), dùng chung `SPRITE_FALLEN_KNIGHT`.
4. **HoodedKnightBoss (`boss_hooded_knight` / `HW-MON-BOSS-000002` — Sir Mordric / Kỵ Sĩ Bóng Tối / Kỵ Sĩ Trùm Mũ)**:
   - **Loại:** Boss tại `deep_forest` `(2340, -190)` (`EvilKnights.ts:668`, `maxHp = 10` trên nhánh AG; Codex có task cân bằng 300 HP riêng), drop `quest_corrupted_crest x1`.
   - **Texture:** `hooded_knight_sheet.png`.
5. **Tên gốc chưa đủ tham chiếu:** `SatyrPlayer.ts` / `satyr_portrait.png` — đánh dấu **NEED REFERENCE** (không dùng `"Satyr/Satyh"`, `"Marden"` làm canonical ID khi chưa có frame/timecode trailer gốc).

---

## 4. Phân Tích Chồng Lấn 17 Phân Khu & Đề Xuất Hệ Sinh Thái

1. **Chồng lấn không gian (Spatial Overlap):**
   - `sub_whispering_clearing` `(1600, -360, 370x360)` nằm **hoàn toàn bên trong** `deep_forest` `(1600, -640, 1280x640)`. `GameScene.ts:4184` clamp camera về `deep_forest` và dùng transition tường minh (`GameScene.ts:4291-4294`) để phân biệt ưu tiên chuyển vùng.
   - `ancient_rune_puzzle` `(3310, 150, 390x280)` nằm **hoàn toàn bên trong** `silent_mire` `(2880, 100, 1120x640)`; `GameScene.ts:4183` clamp camera về `silent_mire`.
2. **Phân loại trạng thái 17 phân khu:**
   - **Playable (12 vùng):** `fog_crossing`, `bellhollow` (Safe), `sanctuary_farm` (Safe), `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`, `sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`.
   - **Unfinished / Placeholder (5 vùng mở rộng):** `abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern` (chỉ có tileSprite fallback, thiếu custom renderer, thiếu trong `ContentRegistry` và `pendingDeferredZones`).
3. **Đề xuất hệ sinh thái (ưu tiên asset đã duyệt, không thêm asset thiếu provenance):**
   - Giữ an toàn tuyệt đối (không quái) cho `bellhollow` và `sanctuary_farm`.
   - Khi hoàn thiện 5 vùng mở rộng, ưu tiên tái sử dụng các entity đã có trong `ContentRegistry` (`ShadowEyesEntity`, `SkullWolfEntity`, `ShadowCrowEntity`, `FallenKnightEntity`, và đưa `ShadowBehemothBoss` đã nạp sẵn vào `abyssal_chasm` hoặc `veil_origin_cavern`) thay vì dùng các ambush mob chưa rõ provenance (`MistBat`, `WanderingShade`, `GoblinScout`) khi chưa được Owner duyệt.
