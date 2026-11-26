# HOLLOW WOODS — QUEST, ENDING & SAVE COMPATIBILITY REGISTRY

- **Mission:** `HW-NARRATIVE-00D — DIALOGUE, QUEST & SOURCE IMPACT AUDIT` (`READ-ONLY`)
- **Primary Sources Verified:**
  - `src/data/quests.json` (`214` lines), `src/systems/QuestSystem.ts` (`303` lines)
  - `src/world/WorldGatingSystem.ts` (`479` lines), `src/world/ZoneConnectionRegistry.ts` (`941` lines)
  - `src/scenes/GameScene.ts` (`7,404` lines), `src/entities/EvilKnights.ts` (`1,048` lines)
  - `src/systems/EndingSystem.ts` (`1,096` lines), `src/systems/SaveManager.ts` (`789` lines), `src/services/CloudSaveService.ts` (`680` lines)

---

## 1. Kiểm Chứng Tuyến Main Route (`A → E → B → D → F → E → C → A`)

`src/data/quests.json` định nghĩa chính xác `mainRoute: "A -> E -> B -> D -> F -> E -> C"` (với hồi kết quay về Bellhollow `A` tại Stage 7 task `t3`), `zoneCodeMap` (`A–F`), và `7` stages:

| Stage | `questId` (`legacyQuestId`) | Tuyến & Zone | Vật phẩm yêu cầu / Phần thưởng & Cờ | Điều kiện cổng (`WorldGatingSystem.ts`) | Trạng thái an toàn |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `Q_STAGE_1_A_TO_E` (`Q04_ANCIENT_RUNES`) | `A → E` (`bellhollow → silent_mire`) | `requiredItem: null`; mở Cổng Đông từ `garth_warning` / `edda_intro` / `neris_intro` (`east_gate_unlocked`, `talked_to_neris`, `Q04_ANCIENT_RUNES:t1`) | `crooked_path` cần `east_gate_unlocked`; `silent_mire` cần `Q04:t1` | **PASS** — Không bị kẹt vật phẩm sau cổng. |
| **2** | `Q_STAGE_2_E_TO_B` (`Q05_SOLVE_MIRE`) | `E → B` (`silent_mire → outer_woods`) | **`requiredItem: quest_corrupted_crest`** — Nhặt trực tiếp tại Phong Ấn Rễ Cổ ở Đầm Lầy (`GameScene.ts:6164–6169`, đặt `corrupted_crest_obtained`, `mire_root_seal_inspected`) | `silent_mire ↔ crooked_path ↔ outer_woods` (hoặc shortcut cây đổ) đều mở | **PASS** — **LƯU Ý QUAN TRỌNG:** `quest_corrupted_crest` có 2 nguồn (Stage 2 Đầm Lầy & `SQ08` Boss). **Cấm dời `crest` main route ra sau cổng nó cần mở!** |
| **3** | `Q_STAGE_3_B_TO_D` (`SQ01_RUNED_IRON`) | `B → D` (`outer_woods → sub_bell_workshop`) | **`requiredItem: item_bell_mold`** — `vaelen_examine_crest_and_seek_mold` đặt `vaelen_mold_quest_assigned` & `Q05_SOLVE_MIRE`; nhặt `item_bell_mold` tại bàn thợ (`GameScene.ts:5932`) | `sub_bell_workshop` là Layer 1 (`always_unlocked`) | **PASS** |
| **4** | `Q_STAGE_4_D_TO_F` (`Q04_ANCIENT_RUNES`) | `D → F` (`sub_bell_workshop → deep_forest`) | **`requiredItem: quest_rune_fragment`** — Nhặt tại Bệ Thờ Cổ Ngữ (`GameScene.ts:6192`) hoặc Bia Đá Cổ Thư (`GameScene.ts:6215`, đặt `has_rune_fragment`) | `deep_forest` cần `east_gate_unlocked` + `Q04` (hoặc `deep_forest_unlocked`) | **PASS** — Tồn tại 2 điểm nhặt an toàn ở cụm cổ ngữ. |
| **5** | `Q_STAGE_5_F_TO_B` (`SQ06_KEEP_FIRE`) | `F → B/A` (`deep_forest → outer_woods / bellhollow`) | **`requiredItem: quest_purification_key`** — Vaelen (`GameScene.ts:4818`) hoặc Bram (`bram_help_forge_purification_key`) ghép `item_bell_mold` + `quest_rune_fragment` (`QuestSystem.ts:220–229`) | Layer 1 (`always_unlocked`) | **PASS** — Có đường dự phòng qua Bram tại làng `A`. |
| **6** | `Q_STAGE_6_BACK_TO_E` (`Q05_SOLVE_MIRE`) | `E → Mở C` (`outer_woods → silent_mire`) | Dùng `quest_purification_key` tại Phong Ấn Rễ Cổ (`GameScene.ts:6155`), hạ cây làm cầu, mở `mire_root_seal_broken` | `broken_bell_shrine` cần `mire_root_seal_broken` + `Q05_SOLVE_MIRE` (`WorldGatingSystem.ts:141–145`) | **PASS** |
| **7** | `Q_STAGE_7_AT_C` (`Q06_RETRIEVE_CLAPPER`) | `Tại C → A` (`broken_bell_shrine → bellhollow`) | **`requiredItem: quest_bronze_clapper`** — Phá 3 trụ, hạ `BossMireWarden` (`GameScene.ts:6773, 7339`), nhặt Lưỡi Chuông (`clapper_collected`), quay về Bellhollow rung `The First Toll` (`GameScene.ts:6294`) | Cổng `to_shrine` mở sau Stage 6 | **PASS** — Tuyến chính giữ nguyên vẹn. |

---

## 2. Xung Đột Logic Tuyến Phụ (`SQ06–SQ08`) & `Vaelen` Routing Edge Case

Kiểm tra trực tiếp `GameScene.ts:4808–4898` và `EvilKnights.ts:998–1012` phát hiện **2 điểm rủi ro cần giữ nguyên hiện trạng cho tới khi Owner duyệt sửa chung**:
1. **Hai nguồn cấp `quest_corrupted_crest`:**
   - Main Route Stage 2 (`GameScene.ts:6168`) cấp `quest_corrupted_crest` tại Đầm Lầy Tĩnh Lặng.
   - Side Quest `SQ08_PURIFY_FALLEN` (`EvilKnights.ts:998–999` + `dialogues.json:833`) **cũng** thưởng `quest_corrupted_crest` (có bảo vệ `getItemCount('quest_corrupted_crest') <= 0` ở cả `EvilKnights.ts:998` và `DialogueSystem.ts:352` để không nhân đôi).
   - *Rủi ro thứ tự:* Tại `GameScene.ts:4826–4836`, nếu người chơi đã nhặt `crest` từ Đầm Lầy (`hasCrest = true`) và đang làm dở `SQ08` (`campfire_knight_q3_accepted`), nhánh `hasCrest && !vaelen_mold_quest_assigned` (`L4826`) và `hasCrest && !hasMold` (`L4828`) sẽ **chặn trước** nhánh `campfire_knight_q3_complete` (`L4836`) cho tới khi người chơi hoàn thành xong khuôn đúc; ngược lại, khi đã có khuôn đúc hoặc xong Stage 3, `hasCorruptedCrest` (`L4833`) chấp nhận `getItemCount('quest_corrupted_crest') > 0` ngay cả khi chưa hạ `HoodedKnightBoss`.
2. **Thứ tự Trailer vs Game (`NAR-019` / `OQ-15`):**
   - Trong `WorldGatingSystem.ts:190–196`, `veil_origin_cavern` đang khóa bằng `flag_required: 'knight_commander_defeated'`. Nếu dời Dark Knight encounter xuống `veil_origin_cavern` sau Mire Warden theo nhịp trailer mà chưa audit flag mở hang, có thể khóa đường vào chính boss đó.

---

## 3. Cổng Chuyển Vùng Tier 2 & Tier 3 (`WorldGatingSystem.ts`)

- **Tầng 1 (Tự do):** `fog_crossing`, `bellhollow`, `sanctuary_farm`, `outer_woods`, `sub_bell_workshop`, `sub_root_cellar` (`always_unlocked`).
- **Tầng 2:** `crooked_path` (`east_gate_unlocked`), `sub_whispering_clearing` (`Q03_PREPARE_RESOURCES`), `deep_forest` (`east_gate_unlocked` + `deep_forest_unlocked` hoặc `Q04/Q05/Q06`).
- **Tầng 3:** `silent_mire` (`east_gate_unlocked` + `Q04:t1`), `ancient_rune_puzzle` (`Q04`), `broken_bell_shrine` (`mire_root_seal_broken`), `abyssal_chasm` (`abyssal_gate_unlocked`), `drowned_mire_depths` (`mire_drained`), `whispering_grove_sanctum` (`Q04`), `sunken_crypt_ruins` (`clapper_collected`), `veil_origin_cavern` (`knight_commander_defeated`).

---

## 4. Logic 3 Kết Thúc (`EndingSystem.ts`) & Tương Thích Save (`SaveManager.ts`)

### 4.1 Ba Kết Thúc Hiện Hành (`EndingSystem.ts:205–222` — Giữ Nguyên Ngưỡng & ID)
- **`true_ending` (`ending_true_achieved`, `lore_ending_true`):** `comp >= 50 && stage >= 3 && trust >= 65`. *(Ghi chú văn bản: dòng L78 ghi "giam cầm thung lũng suốt hàng trăm năm" và L79 ghi "Chỉ Huy Hiệp Sĩ Đen" — chờ `OQ-08` & `OQ-18`).*
- **`sacrifice_ending` (`ending_sacrifice_achieved`, `lore_ending_sacrifice`):** Nếu không đạt `true_ending` và `stage >= 2`. *(L97 ghi "Chỉ Huy Hiệp Sĩ Đen").*
- **`fog_loop_ending` (`ending_fog_loop_achieved`, `lore_ending_fog_loop`):** `stage < 2`. *(L117 ghi "Chỉ Huy Hiệp Sĩ Đen").*

### 4.2 Tương Thích Save Schema `3` (`SaveManager.ts` + `CloudSaveService.ts`)
- **`SaveManager.CURRENT_SCHEMA_VERSION = 3`** (`L68`): Bảo toàn `memoryAwakeningStage` (`0–3`), `villageTrustScore` (`mặc định 50`), `storyFlags` (`string[]`), `flags`, `currentQuestId`, `quests`, `unlockedLoreIds`, `inventory`, `legacyExtraData` (`L410–415`), và ánh xạ bí danh `quest_corrupted_knight_crest → quest_corrupted_crest` (`SaveManager.ts:225/354`, `CloudSaveService.ts:175–257`).
- **Rủi ro tương thích khi cập nhật Narrative về sau:**
  1. Nếu thêm cờ `storyFlags` mới (như `prologue_seen`, `once`-choice guard), **PHẢI** mặc định `false` cho save cũ mà không tăng schema hay reset `flags`/`storyFlags`/`memoryAwakeningStage`.
  2. Không đổi ID bất kỳ quest (`Q00..Q06`, `Q_STAGE_1..7`, `SQ01..09`), lore (`lore_*`), hoặc item (`quest_corrupted_crest`, `item_bell_mold`, `quest_rune_fragment`, `quest_purification_key`, `lore_satyr_journal`).
  3. Chú ý `DialogueSystem.ts:304–310` hiện gọi `state.setStoryFlag(choice.setFlag)` và `state.addVillageTrust(choice.trustDelta)` mỗi lần chọn — chưa có cơ chế chặn farm `villageTrustScore` nếu người chơi mở lại thoại lặp lại nhiều lần (ảnh hưởng trực tiếp ngưỡng `trust >= 65` của `true_ending`).
