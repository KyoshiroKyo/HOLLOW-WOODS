# HW-V16-A06-R1 — APPROVED IDENTITY EVIDENCE IMPLEMENTATION REPORT

- **PROJECT:** HOLLOW WOODS
- **STUDIO:** KYOSHIRO STUDIO
- **TARGET:** `V1.6.0 — THE UNBROKEN OATH` (`ROADMAP: 3.1`)
- **TASK ID:** `HW-V16-A06-R1`
- **STATUS:** **`PASS — OWNER APPROVED OPTION 1 IMPLEMENTED & VERIFIED`**
- **OWNER APPROVAL DATE:** `2026-11-27` (`A06 Evidence Option 1`)
- **ISOLATED WORKTREE / BRANCH:** `G:\HOLLOW_WOODS_A06_R1` on branch **`feat/v1.6-a06-r1-identity-evidence`**
- **BASE COMMIT SHA:** `53eabbe29e6b3ca0775c707d34a07a3ec8e5b0a5` *(descendant of A06 `5fdd4e496150456f06f859d3177d6e34059e2ba5`, zero A07 source mixed)*
- **PRIMARY WORKTREE PROTECTED:** `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish` at `53eabbe`, `4` modified A07 `src/` files + `2` untracked A07 files + `297` staged `Pixel_Art/` entries untouched)

---

## 1. Worktree Protection & Safe Synchronization Plan (`§2`, `§12`)

1. Tại `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish`), `4` tệp `src/` thuộc `HW-V16-A07` bị ngắt quota ở bước 1/5 (`GameScene.ts`, `PlayerState.ts`, `BossEncounterSystem.ts`, `WorldGatingSystem.ts`), `2` tệp A07 chưa track (`scripts/verify_v16_a07_quest_and_endings.mjs`, `Read/V1.5/Reports/V16/HW_V16_A07_ENDING_APPROVAL_DRAFT.md`), cùng `297` staged `Pixel_Art/` renames đã được bảo toàn tuyệt đối — **không reset, restore, clean, stash, rebase hay trộn code A07 vào commit A06-R1**.
2. Toàn bộ triển khai `HW-V16-A06-R1` được cô lập trên worktree `G:\HOLLOW_WOODS_A06_R1` và nhánh **`feat/v1.6-a06-r1-identity-evidence`** tạo từ `53eabbe29e6b3ca0775c707d34a07a3ec8e5b0a5`.
3. **Phương án đồng bộ an toàn khi tiếp tục `HW-V16-A07`:**
   - Sau khi nghiệm thu `HW-V16-A07` tại `G:\HOLLOW WOODS` (hoặc lưu commit A07 xong), chạy `git merge --no-ff origin/feat/v1.6-a06-r1-identity-evidence` (nếu có khác biệt tại `GameScene.ts` / `PlayerState.ts`, giữ trọn logic `promoteToMemoryStage3`, `reconcileIdentityRevealState`, và `APPROVED_IDENTITY_EVIDENCE_RULES` của `A06-R1` cùng phần fix tiến trình `A07`).

---

## 2. Production Implementation Summary (`§4–§8`)

| Component | Changes Applied in `HW-V16-A06-R1` | File |
| :--- | :--- | :--- |
| **Approved Rules** | Kích hoạt 2 rule chính thức trong `APPROVED_IDENTITY_EVIDENCE_RULES`: `MAIN_PATH_Q05` (`vaelen_mold_quest_assigned && (purification_key_crafted \|\| mire_root_seal_broken) && (inspected_knights_memorial_stele \|\| collected_note_inspect_knights_memorial_stele \|\| collected_note_read_black_knight_stele)`) và `SIDE_PATH_SQ08` (`campfire_knight_q3_completed && boss_hooded_knight_defeated`); thêm `getMatchedEvidenceRuleIds()`. Gate tổng giữ nguyên `Stage >= 3 && (MAIN_PATH_Q05 \|\| SIDE_PATH_SQ08)`. | [IdentityRevealResolver.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/systems/IdentityRevealResolver.ts#L71-L165) |
| **Late Evidence Sync & Single Reveal Guard** | Bổ sung `PlayerState.reconcileIdentityRevealState({ emitEvent })` gọi từ `setFlag()`, `setMemoryAwakeningStage(3)` và `SaveManager.applySaveToState({ emitEvent: false })`: chỉ mở `lore_wayfarer_inner_journal` khi `canRevealPlayerIdentity() === true`, đánh dấu cờ nội bộ `identity_revealed_notified` trong `flags` (không đụng `storyFlags`, không tăng stage, không cộng Trust/reward), và phát event `identity_revealed` đúng 1 lần. | [PlayerState.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/state/PlayerState.ts#L401-L802) |
| **Main-Path Stage 3 Triggers** | `GameScene.promoteToMemoryStage3()` nâng Stage 3 qua `setMemoryAwakeningStage(3)` tại `vaelen_forge_purification_key` (`Sir Vaelen`) và đồng bộ event khi `QuestSystem.unlockBridge()` phá Phong Ấn Rễ Cổ (`mire_root_seal_broken`), bảo toàn nhánh `SQ08` hiện hành và chống phát popup trùng lặp. | [GameScene.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/scenes/GameScene.ts#L4816-L4855), [QuestSystem.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/systems/QuestSystem.ts#L200-L215) |
| **HUD / Torn Page / Save Sync** | `UIScene` lắng nghe `identity_revealed` để cập nhật ngay HUD badge `⚔️ Meliodas Blackwood`, refresh `JournalModal` nếu đang mở và hiển thị thông báo khôi phục danh tính không bị thông báo cất trang giấy ghi đè. `SaveManager.applySaveToState` gọi `reconcileIdentityRevealState({ emitEvent: false })` hỗ trợ `Case D` không cần đổi Save Schema `3`. | [UIScene.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/scenes/UIScene.ts#L705-L735), [SaveManager.ts](file:///G:/HOLLOW_WOODS_A06_R1/src/systems/SaveManager.ts#L720-L728) |

- **Verified Boundaries (`HARD STOP` respected):** `EndingSystem.determineEndingType()` giữ nguyên `50 / 3 / 65` (`8 fog_loop_ending / 7 sacrifice_ending / 1 true_ending`), `CURRENT_SCHEMA_VERSION = 3` giữ nguyên, `CHAR-006 / Headless Warden` không triển khai, `storyFlags` không bị chèn cờ nội bộ.

---

## 3. Acceptance & Regression Verification (`§9`, `R1-T01`..`R1-T16`)

### 3.1. Static, Build & Node Suites (`0` failures)

| Check / Script | Scope | Result |
| :--- | :--- | :---: |
| `npm run check` (`tsc --noEmit`) | TypeScript compile toàn repo | **PASS (`exit 0`)** |
| `npm run verify:data` | Integrity items/recipes/dialogues/quests/registry/lore | **PASS (`15/15`)** |
| `npm run build` (`tsc && vite build`) | Production bundle `dist/` | **PASS (`exit 0`)** |
| `node scripts/verify_v16_a06_r1_identity_evidence.mjs` | `R1-T01..R1-T14` (`MAIN_PATH_Q05`, `SIDE_PATH_SQ08`, Case A–D, Save/Load, 16 Ending boundary `8/7/1`, 7-stage Q05→Q06) | **PASS (`24/24`)** |
| `node scripts/test_v153_save_schema3.mjs` | Save Schema 3 & CloudSave QA isolation | **PASS** |
| `node scripts/verify_v15_16_story_and_dialogue.mjs` | Dialogue choices & story compatibility (`A05` regression) | **PASS (`90/90`)** |
| `node scripts/test_v15_60_quest_chain_restructuring.mjs` | 7-stage Main Quest chain & zone gating | **PASS (`72/72`)** |
| `node scripts/test_v15_59_ending_screen_and_branching.mjs` | 3 Endings branching & Chronicle integrity | **PASS (`22/22`)** |
| `node scripts/verify_v15_27_performance_and_save_compatibility.mjs` | Performance culling & V1.3/V1.4/V1.5 Save migration | **PASS (`49/49`)** |
| `node scripts/test_v15_38_vaelen_rest_blessing.mjs` | Sir Vaelen bonfire rest & blessing regression | **PASS (`12/12`)** |

### 3.2. Real Gameplay Playwright E2E Verification (`dist/` + Chromium)

Nguồn log đầy đủ: [hw_v16_a06_r1_playwright_results.json](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Evidence/HW-V16-A06-R1/hw_v16_a06_r1_playwright_results.json) (`Console errors: 0`, `Page errors: 0`).
Source diff đối chiếu: [a06_r1_source.diff](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Evidence/HW-V16-A06-R1/a06_r1_source.diff).

| Screenshot | Stage | Key Flags | Quest | Resolver Output | Visual Proof |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `01_STAGE2_UNREVEALED.png` | `2` | `east_gate_unlocked`, `vaelen_mold_quest_assigned`, `inspected_knights_memorial_stele` | `Q01_MEET_EDDA` | `identityRevealed=false`, `hudBadge="🌲 Lữ Khách Rêu Phong"` | [01_STAGE2_UNREVEALED.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/01_STAGE2_UNREVEALED.png) |
| `02_STAGE3_NO_EVIDENCE.png` | `3` | `vaelen_mold_quest_assigned`, `has_purification_key`, `purification_key_crafted`, `purification_key_received` | `Q03_PREPARE_RESOURCES` | `hasEvidence=false`, `identityRevealed=false`, `hasInnerJournal=false`, HUD trung tính | [02_STAGE3_NO_EVIDENCE.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/02_STAGE3_NO_EVIDENCE.png) |
| `03_MAIN_PATH_Q05_REVEAL.png` | `3` | `vaelen_mold_quest_assigned`, `purification_key_crafted`, `collected_note_read_black_knight_stele`, `identity_revealed_notified` | `Q03_PREPARE_RESOURCES` | `identityRevealed=true`, `matched=["MAIN_PATH_Q05"]`, `sq08Completed=false`, HUD `"⚔️ Meliodas Blackwood"`, `inner_journal` unlocked | [03_MAIN_PATH_Q05_REVEAL.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/03_MAIN_PATH_Q05_REVEAL.png) |
| `04_SIDE_PATH_SQ08_REVEAL.png` | `3` | `east_gate_unlocked`, `campfire_knight_q3_accepted`, `boss_hooded_knight_defeated`, `campfire_knight_q3_completed`, `identity_revealed_notified` | `Q01_MEET_EDDA` | `identityRevealed=true`, `matched=["SIDE_PATH_SQ08"]`, `sq08Completed=true`, HUD `"⚔️ Meliodas Blackwood"` | [04_SIDE_PATH_SQ08_REVEAL.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/04_SIDE_PATH_SQ08_REVEAL.png) |
| `05_JOURNAL_IDENTITY_REVEALED.png` | `3` | `MAIN_PATH_Q05` active + `collected_note_read_black_knight_stele` | `Q03_PREPARE_RESOURCES` | `selectedLoreId="lore_wayfarer_inner_journal"`, badge `[REVEALED]`, nội dung Meliodas Blackwood mở trọn vẹn | [05_JOURNAL_IDENTITY_REVEALED.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/05_JOURNAL_IDENTITY_REVEALED.png) |
| `06_CONTINUE_AFTER_REVEAL.png` | `3` | Loaded from `SaveManager` Schema 3 after main reveal | `Q03_PREPARE_RESOURCES` | `identityRevealed=true`, HUD `"⚔️ Meliodas Blackwood"`, `garth_black_knight_reverence` active, `true_ending` Chronicle `"Meliodas Blackwood"` | [06_CONTINUE_AFTER_REVEAL.png](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Visuals/HW-V16-A06-R1/06_CONTINUE_AFTER_REVEAL.png) |

*(Ghi chú kỹ thuật quan sát được ngoài phạm vi sửa đổi A06-R1: trong `GameScene.ts:4825`, nhánh kiểm tra `hasCrest && !vaelen_mold_quest_assigned` đứng trước nhánh trả `campfire_knight_q3_accepted`; phần điều phối nhánh giao/nhận quest tại `GameScene.ts` sẽ tiếp tục được đồng bộ trong phạm vi `HW-V16-A07` đã bảo toàn tại `G:\HOLLOW WOODS`.)*

---

## 4. Updated Documents & Artifacts

- [HW_V16_A06_EVIDENCE_DECISION_MATRIX.md](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/V16/HW_V16_A06_EVIDENCE_DECISION_MATRIX.md) (`OWNER APPROVED — 2026-11-27`)
- [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW_WOODS_A06_R1/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md) (`CHAR-K01`, `CHAR-K02`, `NAR-002` synced to `GAME-IMPLEMENTED`)
- [verify_v16_a06_r1_identity_evidence.mjs](file:///G:/HOLLOW_WOODS_A06_R1/scripts/verify_v16_a06_r1_identity_evidence.mjs) (`24/24 PASS`)

**NEXT TASK (QUEUED):** `HW-V16-A07 — RESUME FROM PRESERVED CHECKPOINT AFTER A06-R1 ACCEPTANCE.`
