# HW-V16-A07-RESUME — QUOTA INTERRUPTION CHECKPOINT REPORT

- **Mission ID:** `HW-V16-A07 — QUEST PROGRESSION & MULTIPLE ENDINGS` (`Recovery: HW-V16-A07-RESUME`)
- **Mode:** `CHECKPOINT RECOVERY` (`PRESERVED — WAITING FOR GPT ACCEPTANCE OF HW-V16-A06-R1`)
- **Branch:** `feat/v1.5.3-ag-world-polish` (`A06-R1 isolated on feat/v1.6-a06-r1-identity-evidence @ fc5bf1d5f849f694a6b92e270ef747b2f2914246`)
- **Origin Before A07 Interruption:** `5fdd4e496150456f06f859d3177d6e34059e2ba5` (`HW-V16-A06`)
- **Pre-existing Index Preserved:** `297` staged `Pixel_Art/` renames (untouched) + `327` pre-existing unstaged `Pixel_Art/` deletions (untouched)

---

## 1. Completed Steps (Local Work Preserved Intact — Do NOT Re-Apply)

Các hạng mục sau đã được thực hiện trước khi gián đoạn và được **giữ nguyên vẹn tại worktree local**:

1. **Sao lưu an toàn (`Backups/steps/backup_hw_v16_a07/`):** Đã sao lưu bản gốc `4` tệp `src/` trước khi chỉnh sửa (`BossEncounterSystem.ts`, `GameScene.ts`, `PlayerState.ts`, `WorldGatingSystem.ts`).
2. **Sửa lỗi tiến trình `A07 §4–§6` trên `4` tệp nguồn (`4 files changed, 47 insertions(+), 42 deletions(-)` trên `src/`):** Hoàn tất các thay đổi hướng tới `relic_heart_of_roots`, `clapper_collected`, cổng `broken_bell_shrine`, định tuyến `npc_finn` (`SQ05_FINN_INTEL`) và điều kiện `SQ08`. *(Chưa chạy compile/test nghiệm thu nên chưa commit `src/`).*
3. **Chuẩn bị bộ kiểm thử đối chiếu V1.6 (`§10`) & dự thảo Ending (`§8`):** Đã tạo cục bộ `scripts/verify_v16_a07_quest_and_endings.mjs` và `Read/V1.5/Reports/V16/HW_V16_A07_ENDING_APPROVAL_DRAFT.md`, cùng script Playwright nháp ngoài repo tại scratch (`test_hw_v16_a07.py`).

---

## 2. Modified & Local A07 Files Inventory (`4` Modified `src/` + `2` Untracked A07 Files)

| # | Tệp | Trạng thái Git | Chi tiết & Mục đích thay đổi đã áp dụng tại local |
| :-: | :--- | :---: | :--- |
| 1 | [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) | `M` (`72` changes, `+20/-20` net diff block) | (a) Gắn `talked_to_finn_rumors` & `SQ05_FINN_INTEL:t1` và hoàn tất nguyên tử `campfire_knight_q3_completed` (`SQ08 t1..t3`, `Stage 3`, popup một lần) vào listener `dialogue_completed`; (b) Sửa `getNPCQuestIndicator` & định tuyến `npc_finn` từ `finn_rumors` sang `finn_chat`; (c) Yêu cầu `boss_hooded_knight_defeated` để trả `SQ08`; (d) Đồng bộ spawn Mire Warden theo `mire_root_seal_broken \|\| shrine_bridge_lowered \|\| mire_pillars_solved`; (e) Bọc guard chống cấp lặp `quest_bronze_clapper` & `relic_heart_of_roots`; bỏ cấp sớm `clapper_collected` trong `finishMireWardenDefeat()` và chỉ chuyển `Q06` sau `mire_pillars_solved` nếu cầu đã mở. |
| 2 | [PlayerState.ts](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts) | `M` (`8` changes) | Sửa `checkQuestProgression('mire_pillars_solved')` chỉ gọi `advanceStoryQuest('Q06_RETRIEVE_CLAPPER')` khi `mire_root_seal_broken \|\| shrine_bridge_lowered`; sửa `getStoryQuestId()` không nhảy sớm sang `Q06` chỉ từ `mire_pillars_solved`. |
| 3 | [BossEncounterSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/BossEncounterSystem.ts) | `M` (`4` changes) | Bọc điều kiện `!state.hasFlag('boss_mire_warden_defeated') && state.getItemCount('relic_heart_of_roots') === 0` trong `completeEncounter()` để triệt tiêu lỗi cấp lặp `relic_heart_of_roots ×2`. |
| 4 | [WorldGatingSystem.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts) | `M` (`5` changes) | Thu hẹp điều kiện `isZoneUnlocked('broken_bell_shrine')` về `mire_root_seal_broken \|\| shrine_bridge_lowered \|\| clapper_collected` (chặn mở sớm Miếu Chuông chỉ bằng `mire_pillars_solved` / `mire_drained` / `Q06`). |
| 5 | [verify_v16_a07_quest_and_endings.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_v16_a07_quest_and_endings.mjs) | `??` *(Mới tạo, chưa chạy)* | Bộ test V1.6 mới đối chiếu 2 assertion Canon đã đổi từ `verify_v15_20_multiple_endings.mjs`, kiểm tra các guard `§4–§6` và `16 + 4` ca biên Ending (`50 / 3 / 65`). |
| 6 | [HW_V16_A07_ENDING_APPROVAL_DRAFT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A07_ENDING_APPROVAL_DRAFT.md) | `??` *(Mới tạo, chưa review/commit)* | 3 kịch bản đề xuất `E01–E03` (*The Unbroken Oath / The Eternal Vigil / The Endless Mist* đánh dấu `DRAFT — PENDING OWNER APPROVAL`), giữ mở số phận `Vaelen / Mordric / Roderick / Aldemar` và loại trừ `CHAR-006`. |

*(Ghi chú thêm: Trong repo còn các tệp untracked thuộc đợt trước ngoài A07 gồm `scripts/AUDIO_SOURCES_MANIFEST.*`, `scripts/generate_audio_sources_manifest.mjs`, `scripts/__pycache__/` và các thư mục rỗng chưa chạy Playwright `Read/V1.5/Reports/Evidence/HW-V16-A07/`, `Read/V1.5/Reports/Visuals/HW-V16-A07/` — tất cả được bảo toàn nguyên trạng).*

---

## 3. Dependency & Post-`A06-R1` Gate Status (Updated `2026-11-27`)

- **A03 / A04 / A05:** **`PASS`** (đã commit & push trên `feat/v1.5.3-ag-world-polish`).
- **A06-R1 (`OWNER APPROVED OPTION 1`):** **`PASS — IMPLEMENTED & PUSHED ON ISOLATED BRANCH`**
  - **Branch / Worktree cô lập:** `feat/v1.6-a06-r1-identity-evidence` (`G:/HOLLOW_WOODS_A06_R1`)
  - **Commit SHA = Remote SHA (`origin/feat/v1.6-a06-r1-identity-evidence`):** `fc5bf1d5f849f694a6b92e270ef747b2f2914246`
  - **Nội dung đã nghiệm thu:** Kích hoạt `MAIN_PATH_Q05` + `SIDE_PATH_SQ08` trong `APPROVED_IDENTITY_EVIDENCE_RULES`, `reconcileIdentityRevealState`, Stage 3 tuyến chính tại `vaelen_forge_purification_key` & `unlockBridge()`, `npm run check` (`exit 0`), `verify:data` (`15/15 PASS`), `npm run build` (`exit 0`), `verify_v16_a06_r1_identity_evidence.mjs` (`24/24 PASS`), Playwright E2E thực tế (`0` console/page errors, `6/6` ảnh runtime).
  - **Trạng thái cổng A07:** **CHỜ GPT NGHIỆM THU `HW-V16-A06-R1`** — **KHÔNG** tự tiếp tục `A07`, `A08`, `A09`, hoặc `A10` trước khi có lệnh mở tiếp theo.
- **Hiện trạng bảo toàn 6 tệp `A07` tại `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish`):**
  - Toàn bộ `4` tệp `src/` đã sửa (`GameScene.ts`, `PlayerState.ts`, `BossEncounterSystem.ts`, `WorldGatingSystem.ts`), `2` tệp A07 chưa track (`verify_v16_a07_quest_and_endings.mjs`, `HW_V16_A07_ENDING_APPROVAL_DRAFT.md`), và `297` staged `Pixel_Art/` renames vẫn nguyên vẹn chưa bị commit nhầm.

---

## 4. Tests Already Executed vs Tests Remaining

### Tests Already Executed in `HW-V16-A07`
- **Trước chỉnh sửa A07:** Chạy đọc xác minh `node scripts/verify_v15_20_multiple_endings.mjs` cho kết quả baseline `44 PASS, 2 FAIL` (đúng 2 assertion văn bản cũ V1.5 `"Chỉ Huy Hiệp Sĩ Đen"` và `"ngọn đèn"` đã được Canon A02/A06 thay thế).
- **Sau khi sửa 4 tệp `src/` A07:** **`0` lệnh kiểm thử hoặc build đã chạy** (ngừng ngay khi tới bước 2/5).

### Tests Remaining (Cần chạy tại bước Resume)
1. **Static & Node Suites:**
   - `npm run check` (`tsc --noEmit`)
   - `npm run verify:data`
   - `npm run build` (`vite build` trên mã nguồn A07 mới)
   - `node scripts/test_v15_60_quest_chain_restructuring.mjs`
   - `node scripts/test_v153_save_schema3.mjs`
   - `node scripts/verify_v15_16_story_and_dialogue.mjs`
   - `node scripts/test_v15_59_ending_screen_and_branching.mjs`
   - `node scripts/test_v15_38_vaelen_rest_blessing.mjs`
   - `node scripts/verify_v16_a07_quest_and_endings.mjs`
   - Xác nhận giữ nguyên trạng `verify_v15_20_multiple_endings.mjs` (`44/46` legacy diff documented)
2. **Runtime Playwright & Screenshots (`A07-T01`..`A07-T14` + `16` Ending boundary cases + `4` extreme cases):**
   - Chạy `scratch/test_hw_v16_a07.py` trên bản dựng `dist/` mới, xuất JSON kết quả + `a07_source.diff` vào `Read/V1.5/Reports/Evidence/HW-V16-A07/` và `3`+ ảnh runtime Ending/Quest vào `Read/V1.5/Reports/Visuals/HW-V16-A07/`.

---

## 5. Remaining Steps & Safe Resume Point

### Remaining Steps (`Steps 2–5` of `HW-V16-A07`)
1. **[Step 2 — Verify & Build]:** Chạy toàn bộ static check + Node regression suites + `npm run build` (không viết lại các edit `src/` đã hoàn tất trừ khi phát hiện lỗi biên dịch/logic mới khi test).
2. **[Step 3 — Runtime E2E]:** Chạy script Playwright `test_hw_v16_a07.py`, kiểm tra trực quan screenshot và lưu diff/evidence.
3. **[Step 4 — Reports & Registries]:** Viết `Read/V1.5/Reports/V16/HW_V16_A07_QUEST_ENDINGS_REPORT.md` và cập nhật `QUEST_IMPACT_REGISTRY.md` / `CANON_DECISION_REGISTRY.md` phản ánh đúng trạng thái `§4` đã sửa và giữ nguyên `A06` Option 1 ở trạng thái chờ duyệt.
4. **[Step 5 — Final Checkpoint Commit]:** Chỉ sau khi mọi kiểm thử bước 2–3 PASS, cô lập commit đúng phạm vi A07 với message `feat(narrative): stabilize quest progression and ending compatibility [HW-V16-A07]`, push và xác minh Remote SHA.

### Safe Resume Point (After GPT Acceptance of `HW-V16-A06-R1`)
- **Bước đồng bộ trước khi chạy bước 2/5 của `HW-V16-A07`:** Merge/đồng bộ `origin/feat/v1.6-a06-r1-identity-evidence` (`fc5bf1d5f849f694a6b92e270ef747b2f2914246`) vào nhánh `A07` sao cho giữ nguyên cả `4` tệp `src/` A07 (`BossEncounterSystem.ts`, `WorldGatingSystem.ts`, `PlayerState.ts`, `GameScene.ts`) lẫn logic `A06-R1` (`IdentityRevealResolver.ts`, `QuestSystem.ts`, `SaveManager.ts`, `UIScene.ts`, `reconcileIdentityRevealState`, `promoteToMemoryStage3`).
- Tiếp tục **tại bước 2/5** của `HW-V16-A07`: chạy `npm run check`, `verify:data`, `test_v15_60`, `test_v153_save_schema3`, `verify_v15_16`, `test_v15_59`, `test_v15_38`, `verify_v16_a06_r1_identity_evidence.mjs`, `verify_v16_a07_quest_and_endings.mjs`, `npm run build`, sau đó chạy Playwright `test_hw_v16_a07.py`.
- **Không** chạy lại backup A07, **không** revert `src/scenes/GameScene.ts`, `src/state/PlayerState.ts`, `src/systems/BossEncounterSystem.ts`, `src/world/WorldGatingSystem.ts`.
