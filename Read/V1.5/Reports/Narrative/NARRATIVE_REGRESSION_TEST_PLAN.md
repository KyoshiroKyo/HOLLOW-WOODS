# HOLLOW WOODS — NARRATIVE REGRESSION TEST PLAN

- **Mission:** `HW-NARRATIVE-00D — DIALOGUE, QUEST & SOURCE IMPACT AUDIT` (`READ-ONLY`)
- **Phạm vi:** Kế hoạch kiểm thử bắt buộc dành cho các queue tích hợp tương lai (`NA-01..NA-08` / `NR-01..NR-08`) sau khi Owner phê duyệt `OQ-01–20`. Hiện tại trong `00D` **KHÔNG chạy hoặc sửa test gameplay**.

---

## 1. Bộ Kiểm Thử Hiện Có Trong `scripts/` Cần Tái Sử Dụng & Cập Nhật Expected Text

Đã xác minh toàn bộ các script sau **đều tồn tại thật** trong `G:\HOLLOW WOODS\scripts\`:
1. **`npm run check` (`tsc --noEmit`), `npm run verify:data` (`verify_data_integrity.mjs`), `npm run build`:** Gate biên dịch, kiểm dữ liệu JSON (`59` dialogue keys, `29` lore entries, `7` quest stages, `17` zones) và bundle.
2. **`verify_zero_404_assets.mjs`:** Đảm bảo `0` missing textures / `0` broken audio cues sau khi thêm bất kỳ prologue media hay asset mới nào.
3. **`verify_v15_16_story_and_dialogue.mjs`:** Kiểm thử lựa chọn hội thoại, `trustDelta`, `storyFlags` và nhánh hồi đáp NPC.
4. **`verify_v15_25_npc_labels_and_dialogue.mjs` & `verify_v15_17_villager_stories.mjs`:** Kiểm tra nhãn tên NPC (Garth, Edda, Neris, Bram, Finn, Sir Vaelen), chữ tiếng Việt không tràn khung UI.
5. **`test_v15_32_peaceful_dialogue_and_knight_quests.mjs` & `verify_v15_18_knight_awakening.mjs`:** Kiểm thử toàn bộ chuỗi quest `SQ06 → SQ07 → SQ08`, điểm thức tỉnh `stage 0–3`, và lời thoại Vaelen / Hooded Knight *(cần cập nhật expected text sau khi `OQ-03/04/06` được duyệt)*.
6. **`test_v15_60_quest_chain_restructuring.mjs`:** Kiểm tra bảo toàn main route `A → E → B → D → F → E → C → A`.
7. **`test_v15_59_ending_screen_and_branching.mjs` & `verify_v15_20_multiple_endings.mjs`:** Kiểm thử màn hình kết thúc & 3 nhánh `true_ending`, `sacrifice_ending`, `fog_loop_ending`.
8. **`test_v153_save_schema3.mjs` & `verify_v15_27_performance_and_save_compatibility.mjs`:** Kiểm tra tương thích Save Schema `3`, legacy V1.3/V1.4 saves, `legacyExtraData`, và cloud sync.

---

## 2. Ma Trận Test Case Mới Bắt Buộc Sau Khi Áp Dụng Narrative Updates

| Mã Test | Mục tiêu kiểm thử | Kịch bản & Dữ liệu biên | Điều kiện PASS |
| :--- | :--- | :--- | :--- |
| **`NT-01` Anti-Spoiler Gate (`C04`)** | Không lộ danh tính `Meliodas` / `Chỉ Huy` / `tự phong ấn` quá sớm | Mở Main Menu Chronicle modal (`MainMenuScene:797`), chơi hết Act 0, nói chuyện Garth/Edda/Vaelen Q1 (`Stage 0–1`), mở `[J]` Journal & Torn Pages. | Tên `Meliodas` và lời giải chưa mở xuất hiện = **`0` lần** trước mốc reveal được Owner duyệt (`I-01`). |
| **`NT-02` Choice Idempotency & Trust Farm Guard (`I-03`)** | Chặn cộng lặp `villageTrustScore` & nhân đôi reward | Chọn 1 option có `trustDelta > 0`, save & reload, nói chuyện lại NPC (`DialogueSystem:309–310`), lặp lại 3 lần. Thử bàn phím `1–5` & click chuột với `campfire_knight_intro` (`5` choices). | `villageTrustScore` chỉ tăng **đúng 1 lần** cho mỗi `choiceId`; không nhận thưởng trùng; chọn được cả 5 option bằng chuột & phím. |
| **`NT-03` Main Route vs `SQ08` Crest Acquisition** | Không softlock `quest_corrupted_crest` giữa Stage 2 và `SQ08` | (A) Nhặt crest ở `silent_mire` trước rồi nói Vaelen (`GameScene:4826–4836`) -> kiểm vẫn tiếp tục được cả Stage 3 (`item_bell_mold`) lẫn `SQ08`; (B) Hạ `HoodedKnightBoss` trước rồi tới `silent_mire`. | Không mất quest, không nhân đôi item (`rewardCount <= 1`), không đè sai lời thoại `q3_complete` lên `vaelen_mold_reminder`. |
| **`NT-04` Act 0 & Prologue Skip / Continue (`I-04`)** | Prologue `28s` (nếu áp) không hỏng checkpoint & Continue | `New Game` (xem hết vs nhấn `Esc/Enter` skip) -> kiểm vị trí Act 0 (`x≥175`, `x≥280`), Hộ Tâm `[F]`, input không kẹt, timer/audio cleanup; tải `Continue` trên save cũ -> **không phát lại prologue**. | `prologue_seen = true` giữ qua save/load; `Continue` vào thẳng gameplay bình thường. |
| **`NT-05` Ending Threshold Boundaries (`I-06`)** | Giữ nguyên ma trận biên `determineEndingType` | Chạy `12` tổ hợp biên: `composure ∈ {49, 50}` × `stage ∈ {1, 2, 3}` × `trust ∈ {64, 65}`. | Chỉ `(comp≥50, stage≥3, trust≥65)` ra `true_ending`; `(stage≥2)` còn lại ra `sacrifice_ending`; `(stage<2)` ra `fog_loop_ending`. |
| **`NT-06` Save Schema `3` Backward Compatibility (`I-07`)** | Nạp save cũ V1.3 / V1.4 / Schema `3` pre-narrative-patch | Nạp snapshot save đã có `memoryAwakeningStage = 2`, `quest_corrupted_knight_crest`, `unlockedLoreIds`, `legacyExtraData`. | Không mất đồ, không reset `stage` về `0`, không crash các cờ `storyFlags` mới (mặc định `false`), alias crest vẫn map chuẩn sang `quest_corrupted_crest`. |
| **`NT-07` EVKey, Sanity `2.1` & Pixel Integrity Regression** | Bảo vệ các fix đã nghiệm thu (`BUG-058`, `BUG-059`, `H4-12A`, `LAB-01` spec) | Nhập liệu tiếng Việt EVKey quanh UI/Journal/Crafting (`[C]`, `[J]`), giảm Composure `< 38`, di chuyển 4 hướng Black Knight (`1.50` / `1.20`). | `0` tái phát `BUG-023`/`H4-12A`, `0` thay đổi hitbox `18×12` hay scale NVC. |
