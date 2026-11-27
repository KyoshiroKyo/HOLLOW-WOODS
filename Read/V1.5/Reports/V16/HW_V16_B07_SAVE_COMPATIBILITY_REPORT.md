# HW-V16-B07 — SAVE COMPATIBILITY & NON-DESTRUCTIVE MIGRATION (ENTRY GATE BLOCKED)

- **Project:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH` / Roadmap `3.1`)
- **Task ID:** `HW-V16-B07`
- **Status:** **`BLOCKED`** *(Safe Docs-Only Checkpoint per `HW_GIT_REPORTING_POLICY.md` §2C & `HW-V16-B07` §7)*
- **Branch / Worktree:** `fix/v1.6-b07-save-migration` (`G:\HOLLOW_WOODS_B07`, branched from `B05` checkpoint `73a5d63fc131b5667dad3b75fc21c52a465bf3d`)
- **Primary Worktree (`G:\HOLLOW WOODS`):** Protected untouched (`e4edb07bcbf2865681277a12404624c4c495bb1f`, keeping uncommitted `A07` draft + `Pixel_Art/` staged index entries)
- **Source Code Changes (`src/`):** **`0`** *(Zero `src/` / schema / Owner save edits made; Hard Stop enforced)*

---

## 1. Entry Gate Evaluation (`BLOCKED`)

Nhiệm vụ `HW-V16-B07` khai báo phụ thuộc trực tiếp **`DEPENDENCY: A06-R1, A07, B05`**. Đối chiếu trạng thái Git, worktree và báo cáo nghiệm thu thực tế cho thấy cả 3 điều kiện đầu vào đều chưa hội tụ thành baseline đã nghiệm thu:

| Dependency | Branch / Location | Git Commit / State | Acceptance Status | Tác động trực tiếp lên `B07` |
| :--- | :--- | :--- | :---: | :--- |
| **`HW-V16-A05`** | `feat/v1.5.3-ag-world-polish` | Committed prior to `e4edb07` (`21f2994`) | **PASS** | Đã có `dlg_trust:`, `dlg_reward:`, `dlg_quest:` trong `DialogueSystem.ts:447-488`. |
| **`HW-V16-A06-R1`** | `feat/v1.6-a06-r1-identity-evidence` | Committed & pushed at `fc5bf1d5f849f694a6b92e270ef747b2f2914246`; **chưa merge** vào `feat/v1.5.3-ag-world-polish` hoặc Track B | **UNMERGED / PENDING GPT ACCEPTANCE** | Trên nhánh cơ sở Track B (`73a5d63`) và `G:\HOLLOW WOODS` (`e4edb07`), `IdentityRevealResolver.ts:86` vẫn để `APPROVED_IDENTITY_EVIDENCE_RULES = []` và `SaveManager.ts` chưa có lời gọi `state.reconcileIdentityRevealState({ emitEvent: false })`. |
| **`HW-V16-A07`** | `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish`) | **UNCOMMITTED** (`4` tệp `src/` sửa dở: `GameScene.ts`, `PlayerState.ts`, `BossEncounterSystem.ts`, `WorldGatingSystem.ts`; checkpoint `36f43b6`) | **INTERRUPTED (`1/5` steps) / NOT ACCEPTED** | `A07` sửa trực tiếp `PlayerState.ts`, logic `Q06_RETRIEVE_CLAPPER`, `clapper_collected`, `relic_heart_of_roots` và luồng Ending — cốt lõi mà `B07` phải di trú & kiểm thử (`SQ08 optional`, trước/sau `First Toll`). |
| **`HW-V16-B05`** | `fix/v1.6-b05-quest-reward` | Safe Docs-Only Checkpoint (`73a5d63fc131b5667dad3b75fc21c52a465bf3d`) | **`BLOCKED`** (`0` `src/` edits) | Các bản vá Quest/Reward regression hậu Track A (và hợp đồng `dlg_*` / consumed item sau `A07`) chưa được triển khai nên không thể kiểm chứng đồng bộ trong `B07`. |

---

## 2. Read-Only Code Pre-Audit (`MEM-04` & Legacy Dialogue Markers)

### 2.1. Vị Trí & Hợp Đồng Kỹ Thuật `MEM-04` (Read-Only Verified)

- Trong [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L699-L720): `applySaveToState()` gán trực tiếp `state.memoryAwakeningStage = data.memoryAwakeningStage ?? 0;` (`L699`) rồi gọi `state.restoreUnlockedLore(data.unlockedLoreIds);` (`L719`), bỏ qua quy tắc mở chương hồi ức trong [PlayerState.ts:759-780](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts#L759-L780).
- Kết quả: bản save cũ mang `memoryAwakeningStage = 1..3` nhưng thiếu `lore_memory_chapter_*` trong `unlockedLoreIds` không được bổ sung phi phá hủy khi tải game.
- **Quy chuẩn triển khai chờ mở khóa (không sửa trước khi `A06-R1 + A07 + B05` xong):**
  1. Giữ nguyên `CURRENT_SCHEMA_VERSION = 3` và giữ nguyên `state.memoryAwakeningStage` (không tự tăng stage khi backfill).
  2. Gọi `unlockLore(...)` bổ sung sau `restoreUnlockedLore(...)` mà không xóa lore sẵn có:
     - `Stage >= 1`: `lore_memory_chapter_1`, `lore_memory_chapter_2`, `lore_black_knight_chronicle`
     - `Stage >= 2`: bổ sung `lore_memory_chapter_3`
     - `Stage >= 3`: bổ sung `lore_memory_chapter_4`
  3. **Tuyệt đối không** tự mở `lore_wayfarer_inner_journal` khi chưa thỏa `IdentityRevealResolver.canRevealPlayerIdentity()` (cần bản `A06-R1` đã merge với `APPROVED_IDENTITY_EVIDENCE_RULES`) và chỉ gọi `reconcileIdentityRevealState({ emitEvent: false })` để không phát popup/event lặp khi nạp save.

### 2.2. Phân Tích Legacy Dialogue Markers (`dlg_*`) từ `DialogueSystem.ts` & `dialogues.json`

Kiểm tra `DialogueSystem.ts:438-488` và toàn bộ 43 hội thoại có hiệu ứng trong `src/data/dialogues.json` cho thấy 3 nhóm ngữ cảnh khi migrating save trước A05 (không có `dlg_trust:*`, `dlg_reward:*`, `dlg_quest:*`):

1. **Có thể suy luận xác định (`Provable -> Backfill Safe`)**:
   - **`dlg_quest:<key>`** khi payload có `nextQuestId` đã tồn tại trong `quests[]` hoặc `currentQuestId` tiến xa hơn (ví dụ `garth_warning` -> `Q01_MEET_EDDA`, `edda_intro` -> `Q02_MEET_NERIS`, `neris_intro` -> `Q03_PREPARE_RESOURCES`, `campfire_knight_intro/q1_complete/q2_complete` -> `SQ06..SQ08`, `garth_brother_story` -> `SQ09_BROKEN_LANTERN`).
   - **`dlg_reward:<key>`** khi gắn cờ hoàn tất độc nhất đã có trong `flags` (ví dụ `edda_rune_guide` <-> `edda_rune_charm_granted`, `garth_broken_lantern_complete` <-> `garth_lantern_rewarded`, `neris_root_flower_complete` <-> `neris_flower_rewarded`, `neris_intro` <-> `talked_to_neris`, `campfire_knight_q1_complete` <-> `campfire_knight_q2_accepted`, `campfire_knight_q2_complete` <-> `campfire_knight_q3_accepted`, `campfire_knight_q3_complete` <-> `campfire_knight_q3_completed`, `hooded_knight_encounter_defeat` <-> `boss_hooded_knight_defeated`). Không dựa đơn thuần vào `inventory.getItemCount(...) === 0` vì vật phẩm tiêu hao như `item_herbal_poultice`, `item_lantern_oil`, `food_calming_tea`, `res_tree_resin` có thể đã bị dùng hoặc chế tạo.
   - **`dlg_trust:<key>`** chỉ suy ra chắc chắn ở các node mà toàn bộ choice có `trustDelta` đều có `setFlag` tương ứng đã ghi trong `storyFlags` hoặc gắn `onCompleteFlag` xác thực kết thúc một lần (ví dụ `garth_broken_lantern_complete` <-> `garth_lantern_rewarded`, `hooded_knight_encounter_defeat` <-> `boss_hooded_knight_defeated`, `campfire_knight_q3_complete` <-> `campfire_knight_q3_completed`).
2. **Không thể suy luận chắc chắn (`Ambiguous -> Fail-Closed / Không tự cộng-trừ Trust`)**:
   - Các node nhánh phụ hoặc nhắc lại có choice gán `trustDelta` nhưng `setFlag: null` và không có `onCompleteFlag` (ví dụ `garth_east_gate_open`, `garth_horseman_tactics`, `edda_reminder_open`, `edda_bell_shatter_secret`, `neris_heal_open`, `bram_*`, một số lựa chọn trong `garth_brother_story` / `edda_bell_shatter_secret` có choice thiếu `setFlag`).
   - Tại những node mơ hồ này, tuyệt đối **không** tự phỏng đoán để cộng/trừ `villageTrustScore` hay cấp lại vật phẩm; cần chốt quy tắc an toàn sau khi `A07` và `B05` ổn định.

---

## 3. Migration Matrix & Trạng Thái Kiểm Thử (`BLOCKED / NOT EXECUTED`)

Bộ fixture chuẩn hóa (không chứa save thật của Owner) đã được định nghĩa tại [b07_sanitized_fixtures_blueprint.json](file:///G:/HOLLOW_WOODS_B07/Read/V1.5/Reports/Evidence/HW-V16-B07/b07_sanitized_fixtures_blueprint.json). Do Entry Gate bị chặn, toàn bộ ca thực thi runtime dưới đây giữ nguyên trạng thái `BLOCKED / NOT EXECUTED` (chưa ghi đè bất kỳ code hay chạy fake pass):

| ID | Nhóm Kiểm Thử (`HW-V16-B07 §5-6`) | Trạng Thái | Phụ Thuộc Chặn |
| :--- | :--- | :---: | :--- |
| `B07-M01` | Legacy `v1.3` fixtures -> Schema 3 non-destructive | `NOT EXECUTED (BLOCKED)` | `A06-R1` merge + `A07` + `B05` |
| `B07-M02` | Schema 3 trước A05 (thiếu `dlg_*` markers) | `NOT EXECUTED (BLOCKED)` | `B05` (Quest/Reward/NPC regression) |
| `B07-M03` | Schema 3 sau A05 | `NOT EXECUTED (BLOCKED)` | `A07` + `B05` |
| `B07-M04` | `MEM-04`: Memory Stage `0..3` backfill không xóa lore & không tự nâng Stage | `NOT EXECUTED (BLOCKED)` | `A06-R1` (`IdentityRevealResolver` + `PlayerState`) |
| `B07-M05` | Identity Evidence `Có / Không` (không tự mở `lore_wayfarer_inner_journal`) | `NOT EXECUTED (BLOCKED)` | `A06-R1` merge |
| `B07-M06` | `SQ08` optional (`skipped` vs `completed`) | `NOT EXECUTED (BLOCKED)` | `A07` + `B05` |
| `B07-M07` | Save trước / sau reward (`neris`, `edda`, `garth`, `vaelen`) | `NOT EXECUTED (BLOCKED)` | `B05` |
| `B07-M08` | Save trước / sau First Toll | `NOT EXECUTED (BLOCKED)` | `A07` |
| `B07-M09` | Save thiếu trường & Save malformed | `NOT EXECUTED (BLOCKED)` | Chờ triển khai chung cùng `B07` sau khi mở gate |
| `B07-M10` | Local / Cloud mock (`QA_SAVE_KEY` vs `player.*` envelope) | `NOT EXECUTED (BLOCKED)` | Chờ triển khai `B07` sau khi mở gate |
| `B07-M11` | `Reload` & `Continue` end-to-end | `NOT EXECUTED (BLOCKED)` | `A06-R1` + `A07` + `B05` |
| `B07-M12` | Idempotency `Load -> Save -> Load` (0 duplicate lore, 0 trust drift, 0 duplicate reveal) | `NOT EXECUTED (BLOCKED)` | `A06-R1` + `A07` + `B05` |

---

## 4. Hard Stop & Bước Mở Khóa Tiếp Theo

1. Nghiệm thu GPT cho `HW-V16-A06-R1` (`fc5bf1d5f849f694a6b92e270ef747b2f2914246`).
2. Nối lại & hoàn thành `HW-V16-A07`, chạy kiểm thử, commit & nghiệm thu, sau đó merge đồng bộ cùng `A06-R1`.
3. Chạy lại `HW-V16-B05` trên baseline đã hợp nhất `A06-R1 + A07 + B04`, nghiệm thu `B05`.
4. Triển khai `HW-V16-B07` (`MEM-04` + legacy `dlg_*` migration + 12 fixture suite + before/after diff) trên baseline hợp nhất `A06-R1 + A07 + B05`.

**Evidence & Fixture Specs:**
- [b07_entry_gate_audit.json](file:///G:/HOLLOW_WOODS_B07/Read/V1.5/Reports/Evidence/HW-V16-B07/b07_entry_gate_audit.json)
- [b07_sanitized_fixtures_blueprint.json](file:///G:/HOLLOW_WOODS_B07/Read/V1.5/Reports/Evidence/HW-V16-B07/b07_sanitized_fixtures_blueprint.json)
