# HW-NR-05 — BELLHOLLOW NPC DIALOGUE RECONSTRUCTION (DIALOGUE DIFF & AUDIT)

- **Mission ID:** `HW-NR-05 — BELLHOLLOW NPC DIALOGUE RECONSTRUCTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Mode:** `DIALOGUE DIFF FOR OWNER APPROVAL` (`0` thay đổi `src/data/dialogues.json`, `GameScene.ts`, vị trí NPC, quest route hoặc phần thưởng; tuân thủ cổng **`Trình Dialogue Diff để Owner duyệt trước khi tích hợp`** do `HW-NR-01` & `HW-NR-04` đang chờ Owner chốt).
- **Primary Sources Verified:** `src/data/dialogues.json` (`39` keys dân làng Bellhollow), `src/scenes/GameScene.ts` (`L4698–4806`, `L4780–4806`), [HW_LEGACY_DIALOGUE_INVENTORY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_LEGACY_DIALOGUE_INVENTORY.json), [DIALOGUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/DIALOGUE_REGISTRY.md).

---

## 1. Phạm Vi NPC & Phát Hiện Định Tuyến Thực Tế Tại `Bellhollow`

| NPC (`ID` trong `GameScene.ts:1439`) | Vị trí & Vai trò (`KEEP`) | Số keys trong `dialogues.json` | Phát hiện lỗi định tuyến / mâu thuẫn (`READ-ONLY AUDIT`) |
| :--- | :--- | :---: | :--- |
| **`npc_garth`** (*Garth – Người Gác Cổng*) | Cổng Đông; mở `east_gate_unlocked`, giao `Q01`, `SQ04` (`eqp_trail_boots`), `SQ09` (`Elian` — `item_lantern_oil ×2`) | `10` keys | `garth_black_knight_reverence` gọi sớm *"Chỉ Huy Hiệp Sĩ Đen"*; cần giữ rạch ròi `Elian ≠ Mordric`. |
| **`npc_edda`** (*Bà Edda – Người Giữ Chuông*) | Chân Tháp Chuông; giữ `3` Quy Tắc Bằng Máu, giao `Q02`, `edda_rune_guide` (`eqp_bell_ward_charm`), `edda_quest_bell_memory` | `9` keys | **(1)** `edda_intro` L8 còn câu Isekai cũ **`"trở về thế giới của mình"`**! **(2)** `edda_bell_shatter_secret` (`7` hồi chuông bởi Giữ Chuông tiền nhiệm) lệch nhẹ với `edda_quest_bell_memory` (*"một lữ khách năm xưa cố rung chuông hoảng loạn"*). **(3)** `edda_black_knight_reverence` kích hoạt khi chưa lấy Lưỡi Chuông nhưng lại khen *"đã mang lưỡi chuông đồng trở về"* + chữ *"trăm năm"*. |
| **`npc_neris`** (*Neris – Người Chữa Thảo Mộc*) | Tiệm thuốc Tây Nam; chữa thương + cứu trợ hạt giống, giao `Q03` (`item_herbal_poultice`), `SQ03`, `item_root_flower` (`food_calming_tea ×2`) | `9` keys | Cơ chế y học dân gian *Hội Chứng Trắng Não* tốt (`KEEP`); chỉ cần đồng bộ `neris_black_knight_reverence` & đảm bảo không khẳng định chứng bệnh đó giải thích toàn bộ mất ký ức của NVC. |
| **`npc_bram`** (*Bram – Thợ Rèn Làng*) | Lò Rèn làng; crafting, giao `SQ01_RUNED_IRON`, thợ dự phòng ghép `quest_purification_key` (`GameScene:4785`) | `6` keys | **`GameScene.ts:4795`:** Hiện check `memoryAwakeningStage >= 3` không kèm điều kiện hoàn tất chính tuyến hay kiểm `east_gate`; `bram_black_knight_reverence` gọi *"thưa Chỉ Huy"*. |
| **`npc_finn`** (*Finn – Cậu Bé Đưa Tin*) | Quảng trường/Giếng; truyền tin đồn (`SQ05`), bí mật `sub_bell_workshop` & `sub_root_cellar` | `5` keys | **PHÁT HIỆN LỖI ĐỊNH TUYẾN (`GameScene.ts:4800–4806`):** Luôn trỏ thẳng `dKey = 'finn_rumors'` khi `stage < 3` (bất kể đã đặt `talked_to_finn_rumors` hay chưa), khiến **`finn_chat` (`3` choices), `finn_whispers_well` và `finn_secret_caches` bị bỏ qua ở luồng lặp lại**! |

*(Ghi chú bảo vệ kỹ thuật: Giữ nguyên `100%` tọa độ NPC, `opensEastGate`, `healPlayer`, toàn bộ `rewardItem` & `nextQuestId` ở cả `39` keys).*

---

## 2. Dialogue Diff Trình Owner Duyệt (`Trước` vs `Đề Xuất Sau`)

### 2.1 `Edda — Người Giữ Chuông` (`edda_intro`, `edda_quest_bell_memory`, `edda_black_knight_reverence`)

#### A. `edda_intro` (`L142`) — Tích hợp `DLG-006/007` (`TRAILER-ONLY`), Gỡ câu Isekai cũ & Chèn `DLG-P01/P02`
- **TRƯỚC (`Runtime Hiện Hành`):**
  - `L1–2`: *"Khuôn mặt này... ánh nhìn này... Đã bao nhiêu mùa trôi qua kể từ khi có một kẻ sống sót bước ra từ Màn Sương Rừng Sâu? Chiếc áo choàng vương rêu xanh... Ngươi là một Lữ Khách bước ra từ sương mù rêu phong sao? Nghe như một âm vang vọng lại từ bờ bên kia ranh giới."*
  - `L3–6`: *(Giữ nguyên **Ba Quy Tắc Bằng Máu** — `KEEP`).*
  - `L7–9`: *"Trái tim của ngôi làng là Quả Chuông Cổ, nhưng Lưỡi Chuông Đồng đã bị đánh cắp mang sâu vào Miếu Chuông Phế Tích. **Nếu ngươi muốn tìm đường trở về thế giới của mình, hãy tìm lại Lưỡi Chuông Đồng cho ta!** Ta sẽ báo cho Garth mở Cổng Đông..."*
- **ĐỀ XUẤT SAU (`PROPOSED DIFF` — Không spoil `Meliodas`, không ép sống cùng thời):**
  - `L1–2` *(dùng nguyên văn `DLG-006` + `DLG-007` nếu Owner duyệt `OQ-17`, kết nối tự nhiên với câu mở)*:
    > *"Có những chuyện người đời đã quên, nhưng năm tháng chưa từng xóa bỏ. Người đã đi qua làn sương. Nhưng những người ở lại, liệu đã bước qua được ngày ngươi rời đi?"* *(hoặc giữ dẫn nhập Lữ Khách nếu Owner chưa mở `DLG-006`: `L1–2` cũ nhưng bỏ `"bờ bên kia ranh giới"`)*
  - `L3–6` (**`KEEP` Tuyệt Đối Ba Quy Tắc Bằng Máu**):
    > `QUY TẮC 1` (The Listener), `QUY TẮC 2` (Chiếc đèn thứ 2), `QUY TẮC 3` (Không rung chuông khi sương tràn hàng rào).
  - `L7–9` *(Gỡ hoàn toàn `"trở về thế giới của mình"`)*:
    > *"Trái tim của ngôi làng là Đại Hồng Chung, nhưng Lưỡi Chuông Đồng đã rơi xuống vùng đất phía Đông từ đêm chuông vỡ. Hãy lần theo tiếng gọi còn vương lại trong gió… rồi ngươi sẽ hiểu vì sao mình lại trở về nơi này (`DLG-007`). Ta sẽ báo cho Garth mở Cổng Đông. Nếu còn bị thương, hãy ghé chỗ Neris trước khi lên đường!"*
  - `Choices` (**`DLG-P01` & `DLG-P02` `PROPOSED` + anti-farm `choiceId`**, giữ nguyên `C3` & flags):
    - `[1]` *"Ta sẽ giúp làng, dù ta chưa nhớ mình là ai."* → `"Đôi khi lựa chọn hôm nay đáng giá hơn tên tuổi ngày xưa."` (`choice_edda_promise_bell`, `+3` once).
    - `[2]` *"Bà biết gì về thời gian ta đã mất?"* → `"Ta chỉ biết những mùa sương không trôi giống nhau. Hãy tìm những người còn nhớ."` (`lore_curious_bell_secret`, `+1` once).
    - `[3]` *(Giữ nguyên `wayfarer_lost_identity`, `+2` once)*.

#### B. `edda_bell_shatter_secret` (`L212`) vs `edda_quest_bell_memory` (`L570`)
- **TRƯỚC:** `edda_bell_shatter_secret` nói **vị Giữ Chuông tiền nhiệm gióng 7 hồi** khiến chuông nứt; `edda_quest_bell_memory` nói **một lữ khách hoảng loạn cố rung chuông** làm chuông rạn nứt.
- **ĐỀ XUẤT SAU (`edda_quest_bell_memory`):** Giữ nhất quán `1` câu chuyện chuẩn là đêm biến cố `7` hồi chuông & khuôn đúc lưu tần số cộng hưởng của thợ chuông, bỏ cụm *"một lữ khách năm xưa cố rung chuông trong hoảng loạn"* (hoặc nhờ Owner xác nhận nếu muốn giữ cả 2 như 2 tin đồn khác nhau).

#### C. `edda_black_knight_reverence` (`L893`)
- **TRƯỚC:** *"Ta đã cảm nhận được điều này ngay từ khi **ngài mang chiếc lưỡi chuông đồng trở về**... Hỡi vị Hiệp Sĩ Đen của Bellhollow, **lời nguyền trăm năm** đang dần tan biến..."*
- **ĐỀ XUẤT SAU:** Chỉnh điều kiện kích hoạt & câu chữ để: (1) không nhắc nhầm việc đã mang Clapper nếu `clapper_collected === false`, (2) bỏ `"trăm năm"` theo `DEC-LOCK-04`, (3) dùng tên **`Meliodas Blackwood`** nếu đạt đúng mốc reveal `DEC-LOCK-07`:
  > *"Ánh lửa Hộ Tâm ấy… quả thực không thể nhầm lẫn. Lời thề năm xưa đã thức tỉnh, và ngọn gió Bellhollow lại một lần nữa gọi tên vị hộ vệ của nó."*

---

### 2.2 `Garth — Người Gác Cổng` (`garth_warning`, `garth_brother_story`, `garth_black_knight_reverence`)

| Key | Nội dung TRƯỚC | Bản Thảo ĐỀ XUẤT SAU (`PROPOSED`) | Bảo toàn Gameplay |
| :--- | :--- | :--- | :--- |
| **`garth_warning`** (`L3`) | Rất khớp vai trò bảo vệ cổng làng (`KEEP` toàn bộ khung); chỉ lưu ý `C2` đáp *"Cả đoàn kỵ sĩ canh lửa, thợ rừng..."*. | **Khuyến nghị `KEEP` chính**, bổ sung dòng đồng bộ sau khi mở cổng (hoặc giữ nguyên vì `0` spoiler `Meliodas/Chỉ Huy`). | Giữ `talked_to_villagers`, `Q01_MEET_EDDA`, `opensEastGate: true`. |
| **`garth_brother_story` & `complete`** | Kể chuyện em trai **Elian** theo đoàn kỵ sĩ mất tích ngoài Rừng Ngoài (`SQ09`). | **`KEEP` 100%** — Tuyệt đối bảo toàn nhánh `Elian` độc lập khỏi `Mordric / Dark Knight`. | Giữ `SQ09_BROKEN_LANTERN`, `item_lantern_oil ×2`. |
| **`garth_black_knight_reverence`** (`L885`) | *"lại chính là vị **Chỉ Huy Hiệp Sĩ Đen** huyền thoại năm xưa sao?!"* | Nếu lộ danh tính (`stage >= 3` theo `DEC-LOCK-07` & `DEC-LOCK-01`): *"Người lữ hành mà tôi từng chặn ở Cổng Tây… hóa ra lại chính là **`Meliodas Blackwood`**, bậc thầy mà cả đoàn kỵ sĩ từng kính trọng sao?! Xin thứ lỗi cho sự thất lễ trước đây của tôi!"* | Giữ `GameScene:4718` (`isEastGateUnlocked()`), không spoiler trước mốc. |

---

### 2.3 `Neris`, `Bram` & `Finn` (`*_black_knight_reverence` + Ràng buộc Chức Năng)

| NPC & Key | Nội dung TRƯỚC | Bản Thảo ĐỀ XUẤT SAU (`PROPOSED`) | Lưu ý Bảo Toàn Tiến Trình & Fix Lặp |
| :--- | :--- | :--- | :--- |
| **`neris_intro`..`heal` (`8` keys)** | Chữa trị, dạy chế `[I]`, `Hội Chứng Trắng Não`, `Hoa Mạch Rễ`, `SQ03`. | **`KEEP`** toàn bộ cơ chế & câu chuyện y sư. | Giữ `healPlayer`, `item_herbal_poultice`, `food_calming_tea ×2`. |
| **`neris_black_knight_reverence`** (`L901`) | *"Chúng nói rằng vị Hộ Vệ Vĩ Đại trong bộ giáp đen đã thức tỉnh. Thưa Hiệp Sĩ Đen..."* | Đồng bộ danh hiệu sau mốc reveal: *"Gió rừng và mạch rễ cổ đang thì thầm... Chúng gọi tên vị hộ vệ đã trở về. Thưa **ngài Blackwood**, thảo dược của tôi luôn sẵn sàng trợ lực cho ngài."* | Không tự giải thích thay biến cố xuyên thời gian (`OQ-03`). |
| **`bram_chat`, `bram_guilt_story`, `bram_knight_weakness_guide`, `SQ01`, `help_forge`** | Thợ rèn tự trách vì đúc kiếm cho *Đội Hiệp Sĩ Canh Lửa*, chỉ cách phá trụ `Fallen Knight` & rèn phụ `quest_purification_key`. | **`KEEP`** 5 keys nền (`0` nhắc tên `Meliodas` trực tiếp để không vi phạm quy tắc cấm tự bịa việc Bram từng rèn vũ khí cho Meliodas!). | Giữ `SQ01_RUNED_IRON`, `quest_purification_key ×1`. |
| **`bram_black_knight_reverence`** (`L909`) | *"như vị Hiệp Sĩ Đen năm xưa... phục vụ cho ngài, thưa **Chỉ Huy**!"* | Gỡ `"thưa Chỉ Huy"` nếu chốt `DEC-LOCK-01 A` → đổi sang *"thưa ngài Blackwood / bậc thầy"* + nên chỉ mở ở `stage >= 3 && isEastGateUnlocked()`. | Không tự sửa `quest_purification_key`. |
| **`finn_chat`, `whispers_well`, `caches`, `rumors`** | Tin đồn đáy giếng & kho bí mật; **`finn_whispers_well` L4** nói *"Em nghĩ quả chuông thiêng đang gọi người đến cứu nó"* (giữ như suy đoán ngây thơ của trẻ con!). | **`KEEP`** nội dung lời thoại; **Đề xuất fix routing `GameScene:4800–4806`**: lần đầu gặp chạy `finn_rumors` (`complete SQ05`), các lần gặp lại mở **`finn_chat`** để người chơi chọn hỏi `finn_whispers_well` & `finn_secret_caches` bình thường! | Giữ nguyên thưởng & `SQ05_FINN_INTEL`. |
| **`finn_black_knight_reverence`** (`L917`) | *"Oa! Anh Wayfarer... không phải, ngài chính là Ngài Hiệp Sĩ Đen trong truyền thuyết..."* | Đồng bộ sau mốc reveal: *"Chú Wayfarer… không, chú chính là **Lang Chủ Meliodas** trong những câu chuyện bên bếp lửa sao?! Sau này lớn lên, em cũng muốn bảo vệ Bellhollow như chú!"* | Giữ an toàn vai trò NPC. |

---

## 3. Kế Hoạch Kiểm Thử Sau Khi Owner Duyệt Diff (`HW-NR-05 §TESTS`)
1. Test đủ `5` NPC Bellhollow: lần gặp đầu (*first meeting*), nói chuyện lặp lại (*repeat dialogue — đặc biệt xác minh `finn_chat` mở lại được `whispers_well` & `caches`!*).
2. Test `Q01 → Q02 → Q03` mở Cổng Đông, `SQ01`, `SQ02`, `SQ03`, `SQ04`, `SQ05`, `SQ09`, Crafting/Heal & `bram_help_forge_purification_key`.
3. Test `reward uniqueness` (không nhận trùng `item_lantern_oil`, `eqp_trail_boots`, `item_herbal_poultice`, `food_calming_tea`, `eqp_bell_ward_charm`).
4. Test `Anti-Spoiler D1–D2`: **`0`** từ khóa `Meliodas / Blackwood / Chỉ Huy` trước mốc reveal được Owner duyệt, Save/Load Schema `3`.

---

## 4. Khóa Dừng (`HARD STOP`)
- Chưa chỉnh sửa `dialogues.json`, `GameScene.ts`, tọa độ NPC hay quest/reward.
- Trình toàn bộ Dialogue Diff trên để **Owner** duyệt từng mục (`DEC-LOCK-01/04/07/17/18` + xử lý nhất quán `edda_quest_bell_memory` & routing lặp `npc_finn`) trước khi tích hợp.
