# HW-V16-A03 — DIALOGUE APPROVAL DRAFT (`DLG-006`, `DLG-007` & ACT 0–I RECONSTRUCTION)

- **Task ID:** `HW-V16-A03 — PROLOGUE, ACT 0 & BELLHOLLOW NARRATIVE`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Governing Locks:** `DEC-LOCK-01..07`, `DEC-LOCK-17` (`APPROVED-FOR-PREPARATION`), `DEC-LOCK-18`, `DEC-LOCK-19`
- **Status:** **`DRAFT — PENDING OWNER APPROVAL`** *(Không tự động đưa nguyên văn `DLG-006` / `DLG-007` vào `src/data/dialogues.json` trước khi Owner ký duyệt)*

---

## 1. Hồ Sơ Chuẩn Bị Thoại Đề Xuất (`DLG-006` & `DLG-007`)

### A. `DLG-006` — Edda, những ký ức chưa bị thời gian xóa bỏ

| Thuộc tính | Đặc tả chi tiết |
| :--- | :--- |
| **Dialogue ID** | `DLG-006` *(Draft tích hợp vào phần mở `edda_intro` hoặc node nối tiếp ngay khi Owner duyệt `DEC-LOCK-17`)* |
| **Speaker** | `Edda – Người Giữ Chuông` (`portrait_edda`) |
| **Context** | `Lữ Khách Rêu Phong` thoát khỏi `Fog Crossing` (`Q00_WAKE_UP`), gặp `Garth` tại cổng làng (`Q01_MEET_EDDA`) và bước tới chân Tháp Chuông Bellhollow. Edda cảm nhận sự quen thuộc mơ hồ qua khí chất và `Vòng Sáng Hộ Tâm [F]`, **không** tiết lộ `Meliodas Blackwood / The Wolf Lord / Tổng Chỉ Huy`, **không** khẳng định Edda sống cùng thời đại xưa, và **không** khẳng định màn sương là tác nhân chắc chắn gây mất trí nhớ. |
| **Trigger** | Tương tác `[E]` với `npc_edda` lần đầu (`!hasFlag('talked_to_edda')`) hoặc nhánh mở rộng của `edda_intro`. |
| **Required quest state** | `Q01_MEET_EDDA` (`talked_to_villagers` đã đặt hoặc vào thẳng Tháp Chuông theo kiểm tra của `GameScene.ts:4740`). |
| **Memory Stage** | `0` (khả dụng tại Stage `0–1`, trước Identity Reveal Gate). |
| **Dialogue lines (`PROPOSED` — nguyên văn từ `DIALOGUE_REGISTRY.md` / `Bible Ch. 08`)** | *"Có những chuyện người đời đã quên, nhưng năm tháng chưa từng xóa bỏ. Người đã đi qua làn sương. Nhưng những người ở lại, liệu đã bước qua được ngày ngươi rời đi?"* |
| **Player choices (`DLG-P01` / `DLG-P02` + giữ choice tương thích)** | 1. **`[Hứa giúp làng]`** `"Ta sẽ giúp làng, dù ta chưa nhớ mình là ai."` (`choiceId: dl_p01_promise`, `setFlag: choice_edda_promise_bell`, `trustDelta: +3` once-guarded)<br>2. **`[Hỏi về thời gian]`** `"Bà biết gì về thời gian ta đã mất?"` (`choiceId: dl_p02_time`, `setFlag: lore_curious_bell_secret`, `trustDelta: +1` once-guarded)<br>3. **`[Trầm ngâm]`** `"Trong màn sương ấy... dường như ta không còn nhớ mình là ai nữa."` (`setFlag: wayfarer_lost_identity`, `trustDelta: +2` once-guarded) |
| **NPC response** | - Nếu chọn **1:** *"Đôi khi lựa chọn hôm nay đáng giá hơn tên tuổi ngày xưa."*<br>- Nếu chọn **2:** *"Ta chỉ biết những mùa sương không trôi giống nhau. Hãy tìm những người còn nhớ."*<br>- Nếu chọn **3:** *"Màn sương che khuất nhiều dấu vết, nhưng ta không dám chắc điều gì đã cướp đi ký ức của ngươi... Hãy thận trọng bước tiếp, từng chặng đường phía trước có thể sẽ hé lộ điều ngươi tìm kiếm."* |
| **Điều kiện chuyển tiếp** | Nối tiếp ngay sang `Ba Quy Tắc Bằng Máu` + vai trò `Đại Hồng Chung` & `DLG-007`; hoàn tất node luôn đặt `onCompleteFlag: talked_to_edda`, giữ `opensEastGate: true`, chuyển `nextQuestId: Q02_MEET_NERIS` (không mở đường tắt bỏ qua Neris). |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** (`DEC-LOCK-17`: `APPROVED-FOR-PREPARATION`). |

---

### B. `DLG-007` — Edda, tiếng gọi còn vương lại trong khu rừng

| Thuộc tính | Đặc tả chi tiết |
| :--- | :--- |
| **Dialogue ID** | `DLG-007` *(Draft câu dẫn cuối `edda_intro` hoặc dòng kết của `edda_guide_to_mire` khi mở đường sang rừng)* |
| **Speaker** | `Edda – Người Giữ Chuông` (`portrait_edda`) |
| **Context** | Sau khi truyền lại `Ba Quy Tắc Bằng Máu` và giải thích vai trò `Đại Hồng Chung` cần tìm lại `Lưỡi Chuông Đồng`, Edda gợi ý người chơi lần theo dư âm trong gió — **tuyệt đối không** khẳng định Đại Hồng Chung hoặc `Echo` là nguồn phát lời cầu cứu trong quá khứ (`DEC-LOCK-02/03`), giữ nguyên bản chất bí ẩn để người chơi tự khám phá qua các hồi sau. |
| **Trigger** | Sau khối `Ba Quy Tắc Bằng Máu` trong `edda_intro`, hoặc khi nói chuyện với `npc_edda` ở `edda_guide_to_mire` (`Stage 1`, sau khi `east_gate_unlocked` đã bật). |
| **Required quest state** | `Q01_MEET_EDDA` → chuyển `Q02_MEET_NERIS` (gặp Neris trước khi ra Cổng Đông), hoặc `Q04_ANCIENT_RUNES` khi `talked_to_neris && east_gate_unlocked`. |
| **Memory Stage** | `0–1`. |
| **Dialogue lines (`PROPOSED` — nguyên văn từ `DIALOGUE_REGISTRY.md` / `Bible Ch. 08`)** | *"Hãy lần theo tiếng gọi còn vương lại trong gió… rồi ngươi sẽ hiểu vì sao mình lại trở về nơi này."* *(Đi kèm câu chỉ dẫn thực dụng giữ nguyên luồng quest: "Ta sẽ báo cho Garth mở Cổng Đông. Nếu còn bị thương, hãy ghé chỗ Neris trước khi lên đường!")* |
| **Player choices (nếu đặt sau khi `east_gate_unlocked`)** | 1. **`[Lên đường]`** `"Ta sẽ tiến sâu vào Đầm Lầy tìm lại Lưỡi Chuông Đồng cho làng."` (`trustDelta: +1` once)<br>2. **`[Hỏi về đêm vỡ chuông]`** → chuyển `nextDialogueKey: edda_bell_shatter_secret`<br>3. **`[Hỏi về Cổ Ngữ Runes]`** → chuyển `nextDialogueKey: edda_rune_guide` (`eqp_bell_ward_charm ×1`) |
| **NPC response** | - Nếu chọn **1:** *"Hãy đi đi, và nhớ luôn để Vòng Sáng Hộ Tâm dẫn lối."*<br>- Chọn **2 / 3:** Mở nguyên vẹn `edda_bell_shatter_secret` hoặc `edda_rune_guide` hiện hành. |
| **Điều kiện chuyển tiếp** | Bảo toàn toàn bộ `talked_to_edda`, `Q02_MEET_NERIS` (`WorldGatingSystem` yêu cầu `talked_to_neris` để mở Cổng Đông), và giữ `eqp_bell_ward_charm` chỉ phát 1 lần qua nhánh `edda_rune_guide`. |
| **Trạng thái phê duyệt** | **`DRAFT — PENDING OWNER APPROVAL`** (`DEC-LOCK-17`: `APPROVED-FOR-PREPARATION`). |

---

## 2. Bảng Đối Chiếu `BEFORE / PROPOSED / APPROVED` (Act 0 & Bellhollow)

| Mục / Key | `BEFORE` (Trước A03) | `PROPOSED` (Áp dụng ngay trong A03 vs Draft chờ duyệt) | `APPROVED` Status |
| :--- | :--- | :--- | :---: |
| **`Act 0 Intro & Echo`** (`GameScene:1419, 2731`, `EchoSystem`) | Tiếng chuông mơ hồ từ phía Đông, `Echo` dẫn tới Bellhollow, `Lữ Khách Rêu Phong`, `Vòng Sáng Hộ Tâm [F]`, `Memory Stage` giữ nguyên. | **Giữ nguyên** vì 0% spoil `Meliodas`, không khẳng định Chuông/Echo phát lời cầu cứu trong quá khứ, không đổi `Memory Stage`. | **`ACTIVE (VERIFIED IN A03)`** |
| **`garth_warning` & `garth_reminder_edda`** | Garth chặn hỏi vết sương trắng, dẫn gặp Edda tại Tháp Chuông, mở Cổng Đông theo cổng `WorldGatingSystem`, không spoil danh tính. | **Giữ nguyên** nội dung và payload (`talked_to_villagers`, `Q01_MEET_EDDA`, `opensEastGate`, 3 choices). | **`ACTIVE (VERIFIED IN A03)`** |
| **`edda_intro` L2 (`r1–r2`)** | *"Ngươi là một Lữ Khách bước ra từ sương mù rêu phong sao? Nghe như một **âm vang vọng lại từ bờ bên kia ranh giới**."* | *"Ngươi là Lữ Khách Rêu Phong vừa bước ra từ màn sương sao? **Dáng vẻ ngươi giống như một dư âm còn sót lại giữa ranh giới sương mù.**"* | **`IMPLEMENTED IN A03`** |
| **`edda_intro` L7–L8** | *"Trái tim của ngôi làng là Quả Chuông Cổ... **Nếu ngươi muốn tìm đường trở về thế giới của mình**, hãy tìm lại Lưỡi Chuông Đồng cho ta!"* | *"Trái tim của ngôi làng là **Đại Hồng Chung cổ xưa — tiếng ngân của nó từng đẩy lùi màn sương**, nhưng Lưỡi Chuông Đồng đã thất lạc sâu về phía Miếu Chuông Phế Tích. **Nếu ngươi muốn vén màn sương và tìm câu trả lời cho bước chân mình**, hãy tìm lại Lưỡi Chuông Đồng cho làng!"* | **`IMPLEMENTED IN A03`** |
| **`edda_intro` Choice 3 (`wayfarer_lost_identity`)** | Choice: *"Ranh giới bên kia..."*<br>Response: ***"Màn sương đã tước đoạt ký ức của ngươi..."*** | Choice: *"Trong màn sương ấy..."*<br>Response: ***"Màn sương che khuất nhiều dấu vết, nhưng ta không dám chắc điều gì đã cướp đi ký ức của ngươi..."*** | **`IMPLEMENTED IN A03`** |
| **`edda_bell_shatter_secret` Choice 2** | *"...sau khi **ranh giới giữa hai thế giới bị phá vỡ**."* | *"...sau khi **màn sương The Veil tràn qua ranh giới thung lũng**."* | **`IMPLEMENTED IN A03`** |
| **`edda_reminder` & `neris_intro` & `bram_*` & `finn_*`** | Ba Quy Tắc, chỉ dẫn Neris, hồi phục + `item_herbal_poultice ×1` + hướng dẫn chế `[I]`, nhất quán làng Bellhollow. | **Giữ nguyên** câu chữ & toàn bộ payload (`healPlayer`, `rewardItem`, `nextQuestId`, `trustDelta`). | **`ACTIVE (VERIFIED IN A03)`** |
| **`DLG-006` (`Trailer V12.2`)** | Chưa đưa nguyên văn vào `edda_intro`. | *"Có những chuyện người đời đã quên, nhưng năm tháng chưa từng xóa bỏ..."* + `DLG-P01/P02` once-guard. | **`DRAFT — PENDING OWNER APPROVAL`** |
| **`DLG-007` (`Trailer V12.2`)** | Chưa đưa nguyên văn vào `edda_intro` / `edda_guide_to_mire`. | *"Hãy lần theo tiếng gọi còn vương lại trong gió… rồi ngươi sẽ hiểu vì sao mình lại trở về nơi này."* | **`DRAFT — PENDING OWNER APPROVAL`** |
