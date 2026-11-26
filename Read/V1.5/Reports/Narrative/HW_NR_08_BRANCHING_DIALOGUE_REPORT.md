# HW-NR-08 — BRANCHING DIALOGUE & NPC RESPONSE REPORT

- **Mission ID:** `HW-NR-08 — BRANCHING DIALOGUE & NPC RESPONSE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Dependencies:** `HW-NR-05`, `HW-NR-06`, `HW-NR-07`
- **Status:** **`PARTIAL / NARRATIVE INTEGRATION BLOCKED`** *(Đã hoàn tất kiểm toán `DialogueSystem` hiện hành & chạy kiểm thử runtime bằng Playwright/Chromium không giao diện trên toàn bộ hệ thống phân nhánh sẵn có; **tạm khóa việc đưa lựa chọn mới `DLG-P01–P06` và lời thoại `Edda / Vaelen / Mordric` từ `HW-NR-05..07` vào runtime** vì [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) chưa được Owner ký duyệt, giữ `0` thay đổi mã nguồn/input đã nghiệm thu ngoài phạm vi).*
- **Primary Sources Verified:** `src/systems/DialogueSystem.ts` (`432` dòng), `src/scenes/UIScene.ts` (`L896–898`, `L3130–3137`, `L3661–3938`), `src/scenes/GameScene.ts` (`L514–535`, `L1182`, `L2020–2024`, `L4695–4901`), `src/state/PlayerState.ts` (`L78`, `L405–449`), `src/data/dialogues.json` (`59` keys, trong đó **`29` keys có `choices`**, tổng **`62` lựa chọn**).

---

## 1. Kiểm Toán `DialogueSystem` Hiện Hành & Đánh Giá Tận Dụng

Hệ thống hội thoại phân nhánh (`V15-16` & `V15-25`) đã tồn tại sẵn trong `DialogueSystem.ts` và `UIScene.ts`, hoàn toàn có thể **tận dụng trực tiếp** thay vì viết lại hoặc tạo hệ thống trust mới:

| Thành phần | Trạng thái hiện hành trong Source | Đánh giá đáp ứng `HW-NR-08` |
| :--- | :--- | :--- |
| **`DialogueChoice` & Payload** (`DialogueSystem.ts:7–27`) | Hỗ trợ `text`, `nextDialogueKey`, `setFlag`, `trustDelta`, `responseLine`, `actionId` *(chỉ khai báo interface)*; payload giữ `onCompleteFlag`, `opensEastGate`, `nextQuestId`, `rewardItem`, `healPlayer`. | **Đủ nền cho `DLG-P01–P06`**, nhưng **chưa có trường knowledge gate** (`requiredFlags`, `excludedFlags`, `minMemoryStage`) cho lựa chọn điều kiện cao cấp. |
| **Bàn phím & Chuột** (`DialogueSystem.ts:70–82`, `UIScene.ts:3661–3673, 3862–3924`) | Chuột: click hộp thoại (`dialogueAdvanceHandler`) & hover/click trực tiếp mọi nút choice `920×36`. Bàn phím: `SPACE/E/ENTER` tua/chuyển câu (`debounce 260ms`), phím số **`1–3`** (`ONE/TWO/THREE` + `NUMPAD_ONE..THREE`). | **Chuột hỗ trợ 100%;** tuy nhiên `campfire_knight_intro` hiện có **`5` choices**, nên phím số **`4` & `5` chưa hoạt động trên bàn phím**. |
| **Đóng/Mở & `ESC`** (`UIScene.ts:896–898, 3130–3137`, `GameScene.ts:514–535, 1182`) | Khi mở: khóa input di chuyển/tấn công, tự đóng Crafting/Journal/Pause modal đang mở (`DialogueSystem:137–142`). Nhấn `ESC`: gọi `cancelDialogue()`, dọn timer/choices, trả trạng thái player, chặn pause đè trong `250ms`, **không kích hoạt `onCompleteFlag`/`rewardItem`/`opensEastGate`**. | **Hoạt động sạch và an toàn** (`0` rò rỉ flag hay kẹt khóa điều khiển). |
| **Bảo toàn Main Quest** (`DialogueSystem.ts:331–357`) | Mọi node chính tuyến (`garth_warning`, `edda_intro`, `neris_intro`, `campfire_knight_*`) đều gắn `nextQuestId`, `opensEastGate` và `onCompleteFlag` ở cấp **payload sau khi kết thúc thoại**, không phụ thuộc vào nhánh lựa chọn nào được chọn. | **Không có nhánh lựa chọn nào làm mất Main Quest** (`Q01→Q02→Q03→east_gate_unlocked`). |
| **Chống lặp `trustDelta` & Thưởng** (`DialogueSystem.ts:304–311, 351–357`) | `selectChoice()` cộng `state.addVillageTrust(choice.trustDelta)` mỗi lần chọn mà không kiểm tra `setFlag` đã tồn tại hay chưa; `endDialogue()` chỉ chống trùng cho item bắt đầu bằng `'quest_'`. | **Lỗ hổng đã xác nhận thực nghiệm:** cho phép farm vô hạn `villageTrustScore` và nhận trùng `eqp_bell_ward_charm` qua `edda_rune_guide`. |

---

## 2. Kết Quả Kiểm Thử Thực Tế (`Script Dự Án` & `Chromium Runtime`)

### 2.1 Bộ Script Kiểm Toán Có Sẵn Trong Repo
- **`node scripts/verify_v15_16_story_and_dialogue.mjs`:** **`90 PASS / 0 FAIL`** (xác minh cấu trúc choices cho `6` NPC lõi, range `trustDelta <= 5`, `DialogueSystem`/`UIScene`/`SaveManager` bảo toàn `villageTrustScore` & `storyFlags`).
- **`node scripts/verify_v15_25_npc_labels_and_dialogue.mjs`:** **`21 PASS / 4 FAIL`** *(4 điểm FAIL do regex script cũ kiểm tra hằng số tọa độ/font đời V15-25 là `(640, 595)`, `boxHeight = 180`, `20px`, `left: 8`, trong khi `UIScene.ts` hiện dùng `DIALOGUE_BOTTOM`, `19px`, `left: 6`)*.
- **`node scripts/test_v15_32_peaceful_dialogue_and_knight_quests.mjs`:** **`24 PASS / 1 FAIL`** *(1 điểm FAIL do item cũ `quest_corrupted_knight_crest` đã gộp về `quest_corrupted_crest`)*.
- **`npm run check` (`tsc --noEmit`) & `npm run verify:data`:** Đều đạt (`tsc` exit `0`, `15/15` checks dữ liệu PASS).

### 2.2 Kiểm Thử Live Runtime Trên Chromium Không Giao Diện (`Vite Dev Server`, `0` Lỗi Console)
Chạy kịch bản Playwright trực tiếp trên `GameScene` / `UIScene` thật (`console_errors = []`):

| Hạng mục test (`HW-NR-08 §TESTS`) | Kịch bản thực thi live | Kết quả quan sát thực tế | Đánh giá |
| :--- | :--- | :--- | :---: |
| **1. `ESC` hủy ngang giữa choices** | Mở `garth_warning` tới màn choices, bấm `Escape`. | `dialogueActive = false`, `uiDialogueActive = false`, `pauseOpen = false`, `talked_to_villagers = false`, `east_gate_unlocked = false`, `trust = 50` *(giữ nguyên)*. | **PASS** |
| **2. Repeated `[E]/[SPACE]` input** | Bấm `[E]` & `[SPACE]` liên tiếp khi choices đang mở (`still_in_choices`), và bấm `[E]` đúp `<260ms` trong lúc hiện `responseLine`. | `isShowingChoices` giữ `true` không bị đóng ép; debounce `260ms` chặn nhảy cóc `responseLine`. | **PASS** |
| **3. Bàn phím `[1]–[3]` & Main Quest** | Chọn phím `[1]` ở `garth_warning`, đọc hết `responseLine`. | `resp_shown = true`, `talked_to_villagers = true`, `choice_garth_cooperative = true`, `east_gate_unlocked = true`, `currentQuestId = Q01_MEET_EDDA`, `trust: 50 → 52`. | **PASS** |
| **4. Chuột click nút Choice & Hộp thoại** | Click chuột vào nút choice `[1]` (`(640, 323)`) ở `edda_intro`, rồi click hộp thoại `(640, 610)` để đi tiếp. | `after_edda_click_resp.resp = true`; kết thúc set `talked_to_edda = true`, `choice_edda_promise_bell = true`, `Q02_MEET_NERIS`, `trust: 52 → 55`. | **PASS** |
| **5. Node `5` choices (`campfire_knight_intro`)** | Bấm phím `4` rồi phím `5`, sau đó click chuột vào lựa chọn thứ `5`. | Phím `4` & `5`: **`vaelen_choices_still_open = true` (không chọn được)**; click chuột nút `5`: chọn thành công (`wayfarer_silent_fire_watcher = true`, `trust: 55 → 56`). | **PARTIAL** *(thiếu phím `4–5`)* |
| **6. Hội thoại lặp lại & Reward Uniqueness** | Chạy `edda_rune_guide` (choice `[1]`, có `rewardItem: eqp_bell_ward_charm`) **2 lần**; chạy `vaelen_forge_purification_key` (`quest_purification_key`) **2 lần**. | `quest_purification_key` giữ đúng **`1`** (`PASS`). Tuy nhiên `edda_rune_guide ×2` làm `trust` tăng **`56 → 62` (`+6`)** và `eqp_bell_ward_charm` tăng **`0 → 2` cái**! | **FAIL (Lỗ hổng lặp)** |
| **7. Save/Load tương thích Schema `3`** | Gọi `SaveManager.saveGame()` rồi `SaveManager.loadGame()`. | Bảo toàn `trust = 62`, `storyFlags.length = 4` (`choice_garth_cooperative = true`, `choice_edda_promise_bell = true`). | **PASS** |

---

## 3. Hạng Mục Bị Khóa Theo Cổng Phê Duyệt (`HW-NR-05..07`) & Danh Sách Mở Khóa

1. **Nội dung hội thoại & lựa chọn mới chưa được phép tích hợp (`BLOCKED`):**
   - `Edda` (`DLG-P01`, `DLG-P02`, `DLG-006/007` — phụ thuộc `HW-NR-05` & `DEC-LOCK-17/18`).
   - `Sir Vaelen` (`DLG-P03`, `DLG-P04`, `DLG-009/014/015` — phụ thuộc `HW-NR-06` & `DEC-LOCK-01/10/11/17`).
   - `Sir Mordric` (`DLG-P05`, `DLG-P06`, `DLG-012/013` — phụ thuộc `HW-NR-07` & `DEC-LOCK-09/11/16/17`).
2. **Bốn điểm sửa kỹ thuật gọn cần áp dụng ngay cùng đợt mở khóa `HW-NR-05..08` *(khi Owner ký Matrix)*:**
   - Mở rộng phím tắt `FOUR`, `FIVE` (`NUMPAD_FOUR/FIVE`) trong `DialogueSystem.ts:75–81` cho node `5` choices.
   - Bổ sung one-time guard cho `trustDelta` (dùng `choiceId` / `setFlag` trong `storyFlags` hoặc cờ riêng `trust_choice_<dialogueKey>_<idx>`) để không phá cân bằng ngưỡng Ending `trust >= 65`.
   - Mở rộng kiểm tra unique item trong `DialogueSystem.ts:351–357` cho `eqp_bell_ward_charm` (`edda_rune_guide` với flag `edda_rune_charm_granted`) mà không đổi công thức hay ngưỡng Ending.
   - Bổ sung trường điều kiện tùy chọn `requiredFlags` / `excludedFlags` trên `DialogueChoice` cho knowledge gates và sửa nhánh lặp `npc_finn` (`GameScene.ts:4800–4806`) để `finn_chat` mở lại bình thường sau lần đầu nghe `finn_rumors`.

---

## 4. Hard Stop
- **Không** sửa `DialogueSystem.ts`, `UIScene.ts`, `GameScene.ts` hay `dialogues.json` khi các lựa chọn của `HW-NR-05–07` chưa được Owner duyệt.
- **Không** tạo hệ thống trust mới, **không** đổi ngưỡng Ending (`comp>=50, stage>=3, trust>=65`), **không** sửa hệ thống input đã nghiệm thu, **không** xóa tài nguyên, **không** commit/push.