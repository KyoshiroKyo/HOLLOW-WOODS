# HW-NR-06 — SIR VAELEN NARRATIVE RECONSTRUCTION REPORT (DIALOGUE DIFF & ROUTING AUDIT)

- **Mission ID:** `HW-NR-06 — SIR VAELEN NARRATIVE RECONSTRUCTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Mode:** `DIALOGUE DIFF & ROUTING PLAN` (`0` thay đổi `dialogues.json`, `GameScene.ts`, vị trí trạm lửa `(1435..1470, 710)`, kỹ năng, sprite hay phần thưởng; hiện `DEC-LOCK-01/02/07/09/10/11/17` từ `HW-NR-01` chưa được Owner ký duyệt nên dừng trình bản thảo để duyệt trước khi sửa runtime).
- **Primary Sources Verified:** `src/data/dialogues.json` (`17` keys `campfire_knight_*` & `vaelen_*`, `L615–789`, `L836–884`, `L941–981`), `src/scenes/GameScene.ts` (`L1444–1454`, `L4807–4898`), `src/systems/DialogueSystem.ts` (`L7–14`, `L75–80`, `L304–310`), [HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md).

---

## 1. Kiểm Kê `17` Keys Hội Thoại & Rủi Ro Định Tuyến Hiện Hành Của `Sir Vaelen`

1. **Vị trí & Vai trò bất biến (`KEEP`):** `npc_campfire_knight` đứng cố định tại Trạm Lửa Rừng Tĩnh Lặng `outer_woods (1435..1470, 710)`, kết nối `CampSanctuarySystem`, chuỗi `SQ06_KEEP_FIRE → SQ07_LOST_COMRADES → SQ08_PURIFY_FALLEN`, và chặng Main Route `Stage 2→3→5` (`vaelen_examine_crest_and_seek_mold` → tôi luyện `quest_purification_key`). **CẤM biến thành companion đi theo khắp map.**
2. **`3` Vấn Đề Kỹ Thuật & Xung Đột Đang Tồn Tại Cần Giải Quyết Khi Triển Khai:**
   - **`CONFLICT C02` (`q2_complete vs q3_complete`):** Tại `campfire_knight_q2_complete` (`L734–735`), Vaelen đọc nhật ký và khẳng định *"Chỉ huy đã bị tà khí nuốt chửng linh hồn, trở thành `Hooded Knight Boss`!"*; nhưng tới `q3_complete` (`L766–768`) lại quỳ xuống nhận **NVC** mới là Tổng Chỉ Huy (và kể lời giải *tự phong ấn `Algiz`* đang **`CONFLICT C01`**!).
   - **Xung đột nhánh `hasCrest` vs `SQ08` (`GameScene.ts:4826–4836`):** Nếu người chơi đã nhặt `quest_corrupted_crest` ngoài Đầm Lầy (`Stage 2`) trong lúc làm dở `SQ08`, điều kiện `hasCrest && !vaelen_mold_quest_assigned` (`L4826`) và `hasCrest && !hasMold` (`L4828`) chặn trước nhánh `campfire_knight_q3_complete` (`L4836`), bắt hoàn tất xong Khuôn Đúc mới trả được `SQ08` (và ngược lại nếu chưa có `item_bell_mold` thì có thể bị lệch luồng).
   - **UI `5` Choices & Farm Điểm Tin Cậy (`DialogueSystem.ts:75–80, 309`):** `campfire_knight_intro` có **`5` choices**, nhưng phím tắt bàn phím chỉ hỗ trợ `1–3` và `selectChoice()` chưa có guard *one-time* cho `trustDelta`.

---

## 2. Phân Bổ `17` Keys Của `Sir Vaelen` (`KEEP` vs `REWRITE / EXPAND`)

- **Nhóm `KEEP` nguyên bản (`10` keys):** `campfire_knight_q1_reminder`, `campfire_knight_q1_complete` (`SQ06→SQ07`, `food_calming_tea ×1`), `campfire_knight_q2_reminder`, `campfire_knight_rest_blessing`, `campfire_knight_rest_blessing_stage0_2`, `campfire_knight_rest_blessing_stage3`, `campfire_knight_rest_cooldown`, `vaelen_examine_crest_and_seek_mold` (`Q05_SOLVE_MIRE`), `vaelen_mold_reminder`, `vaelen_forge_purification_key` (`quest_purification_key ×1`), `vaelen_reminder_use_purification_key` *(tổng `11` keys; riêng `vaelen_examine_crest` & `forge` chỉ rà nhẹ không đụng `Chìa Khóa Thanh Tẩy` hay `Phong Ấn Rễ Cổ` vật lý)*.
- **Nhóm `REWRITE / CONFLICT` cần Owner duyệt Diff bên dưới (`6` keys):** `campfire_knight_intro`, `campfire_knight_comrade_bond`, `campfire_knight_q2_complete`, `campfire_knight_q3_reminder`, `campfire_knight_q3_complete`, `campfire_knight_idle_talk`.

---

## 3. Dialogue Diff Trọn Bộ Tuyến `Sir Vaelen` (`Trước` vs `Đề Xuất Sau — Chờ Owner Duyệt`)

### 3.1 Cuộc Gặp Đầu Tiên: `campfire_knight_intro` (`L615`) & `campfire_knight_comrade_bond` (`L656`)
*(Lấy chất liệu lời thề `DLG-009` từ Trailer `V12.2` + lựa chọn `DLG-P03/P04`, KHÔNG spoil `Meliodas`, tôn trọng quyết định `OQ-01/05/11/17`)*:

- **TRƯỚC (`campfire_knight_intro`):**
  - `L1–2`: *"Chào mừng, lữ khách... Khoan đã... Bộ giáp đen đó... và cách ngươi tỏa ra vòng sáng ấm dịu... ta ngỡ người đó đã tan biến trong màn sương từ lâu rồi..."*
  - `C2` (`L633–634`): `"[Hỏi về kỵ sĩ] Bộ giáp đen mà ngươi vừa nhắc tới... có phải thuộc về một vị chỉ huy năm xưa?"` → `"Đúng vậy. Vị Tổng Chỉ Huy huyền thoại..."`
- **ĐỀ XUẤT SAU (`campfire_knight_intro` — Gặp đầu bên bếp lửa):**
  - `L1`: *"Chào mừng, lữ khách. Hãy dừng chân nghỉ ngơi bên đốm lửa này một lát... Không ai phán xét một kẻ lữ hành mệt mỏi cần hơi ấm giữa rừng sương lạnh đâu."*
  - `L2` *(nhấn motif V12.2 **`DLG-009`**, giữ cảm giác quen mơ hồ mà không lộ tên)*:
    > *(Ánh mắt Sir Vaelen dừng lại trên thanh kiếm và vầng sáng Hộ Tâm của ngươi)...* *"Có những lời thề, người lập ra đã chẳng còn nhớ. Nhưng kẻ từng thề nguyện, đến nay vẫn chưa dám quên."*
  - `L3–5`: Giữ giới thiệu Trạm Lửa + nhờ gom `2` Gỗ Khô & `2` Nhựa Cây (`SQ06_KEEP_FIRE`, giữ nguyên `onCompleteFlag` & `nextQuestId`).
  - `Choices` *(Tích hợp `DLG-P03` & `DLG-P04` đồng bộ `C1..C5`, thêm `choiceId` one-time)*:
    - `[1]` *(Giữ `choice_knight_pledge_fire` `+3`)*: `"[Đồng ý giúp] Ta sẽ tìm gỗ khô và nhựa cây tiếp lửa cho ngọn lửa này."`
    - `[2]` **(`DLG-P03` thay cho câu spoil `"chỉ huy"`):** `"[Hỏi] Ta có quen ngươi sao?"` → *"Dáng đứng ấy không thay đổi. Nhưng ta sẽ không bắt ngươi nhớ điều chưa thể nhớ. Hãy nghỉ một lát."* (`lore_curious_black_knight`, `+2`).
    - `[3]` **(`DLG-P04`):** `"[Hỏi về lời thề] Nếu từng hứa với ngươi, ta muốn biết lời thề ấy."` → Trỏ tới `campfire_knight_comrade_bond`.
    - `[4]` *(Giữ `campfire_knight_rest_blessing`)*.
    - `[5]` *(Giữ `wayfarer_silent_fire_watcher`, `+1`)*.

- **TRƯỚC (`campfire_knight_comrade_bond` `L656`):**
  - Kể chuyện *"vị Chỉ Huy Hiệp Sĩ Đen đã đặt bàn tay thép lên vai ta, nghiêm giọng ra lệnh..."*; `C2` đáp *"giống hệt ánh nhìn của vị chỉ huy đêm hôm ấy..."*.
- **ĐỀ XUẤT SAU (`campfire_knight_comrade_bond` — Khớp `DLG-P04` & `Ch. 03` Người Thầy / Bạn cũ):**
  - `L1–4`: *"Bảo vệ những người không thể tự bảo vệ mình. Đó là điều **người thầy của ta** đã dạy trước ngày định mệnh ấy... Ngài ấy tin tưởng giao lại ngọn lửa hậu phương cho ta trông giữ. Ta đã ở lại! Nhưng từng đêm trôi qua trong sương lạnh, không chỉ đồng đội ngã xuống… ngay cả **người bạn thân nhất của ta** cũng rẽ sang con đường bóng tối..."*
  - `C2` đáp: *"Ánh mắt của ngươi… giống hệt ánh nhìn của người năm ấy trước khi bước vào rừng…"* *(không dùng từ `Chỉ Huy` nếu Owner chốt `DEC-LOCK-01 A`)*.

---

### 3.2 Giải Quyết `CONFLICT C02`: `campfire_knight_q2_complete` (`L729`) & `q3_reminder` (`L743`)

- **TRƯỚC (`q2_complete` — Nguyên nhân gây mâu thuẫn):**
  - *"Chỉ huy đã bị tà khí nuốt chửng linh hồn, trở thành **Hooded Knight Boss**... Trời ơi... **Vị chỉ huy đáng kính của chúng ta đã biến thành Hooded Knight Boss** bị sương đen sai khiến!"*
- **ĐỀ XUẤT SAU (`q2_complete` — Theo `DEC-LOCK-09` & `DEC-LOCK-10`, hoàn toàn tự nhất quán với `q3`):**
  - *Phương án A (Nếu `OQ-04`: `Hooded = Mordric` & `OQ-06`: Sửa `q2`):*
    > *"Phôi Sắt Cổ Ngữ này... và trang nhật ký cháy sém! Nét bút này thuộc về toán trinh sát cũ... 'Bóng tối The Veil quá dày đặc... Kỵ Sĩ Bóng Tối — người từng kề vai sát cánh năm xưa — đã để oán hận và sương đen dẫn lối, chiếm giữ cổ tự Rừng Sâu...'. Người bạn cũ của ta (`Sir Mordric` / Kỵ Sĩ Trùm Mũ) đang bị màn sương giam cầm tâm trí rồi! Lữ khách, xin hãy tiến vào Rừng Sâu, giải thoát cho cậu ấy khỏi xiềng xích bóng tối và mang 'Huy Hiệu Hiệp Sĩ Tha Hóa' về đây để ta thanh tẩy bên ngọn lửa!"*
  - `campfire_knight_q3_reminder`: Đổi *"Chỉ Huy Hiệp Sĩ Trùm Mũ"* → *"Kỵ Sĩ Trùm Mũ"* (giữ nguyên mẹo ngắt chiêu combat & nhắc `SQ08`).

---

### 3.3 Khoảnh Khắc Nhận Ra `Meliodas`: `campfire_knight_q3_complete` (`L760`) & `idle_talk` (`L836`)

- **TRƯỚC (`q3_complete` — Dính `C01` + `C02` + `C04`):**
  - *"Đây là Quân Huy **Tổng Chỉ Huy**!... Thần xin kính cẩn bái kiến Ngài, **Chỉ Huy Hiệp Sĩ Đen**! Năm xưa chính ngài đã **tự phong ấn ký ức** để bảo vệ linh hồn khỏi lời nguyền The Veil..."*
- **ĐỀ XUẤT SAU (`q3_complete` — Đúng thời điểm D6 sau khi đủ bằng chứng Huy hiệu + Vòng Sáng + Lời thề; tích hợp `DLG-014` Vaelen & tiết lộ `Meliodas` theo `DEC-LOCK-02/07/11/17`):**
  - `L1–3`: *"Chiếc huy hiệu này... tà khí đen đang tan dần dưới ánh lửa Trạm Lửa Rừng Tĩnh Lặng! (Sir Vaelen sững người nhìn mặt trong tấm huy hiệu, rồi đối chiếu với ánh hào quang Hộ Tâm ấm áp quanh ngươi)..."*
  - `L4` *(lời thoại Trailer `V12.2` **`DLG-014`**)*: *"(Sir Vaelen chậm rãi đặt gươm ngang ngực, cúi đầu trang nghiêm): **'Ngài có thể đã quên… nhưng ta thì chưa.'**"*
  - `L5` *(Tôn vinh đúng danh tính **`CANON-APPROVED`** thay cho câu tự phong ấn cũ)*:
    > *"Dù năm tháng có trôi qua thế nào, dù biến cố trong rừng sâu có lấy đi ký ức của ngài... thì ngọn lửa và lời thề của chúng ta chưa từng tắt. Chào mừng người trở về... **thưa thầy — `Meliodas Blackwood`**."* *(Nếu Owner giữ đồng thời chức Chỉ Huy tại `OQ-01`, thêm danh hiệu `Lord Blackwood` thay vì chỉ ép `Tổng Chỉ Huy`; nếu chốt lộ ở `D7 First Toll`, tạm giữ ở mức *"thưa thầy"* và mở tên `Meliodas` tại `Ending`)*.
  - `L6`: *"Huy hiệu đã được thanh tẩy thành Bùa Hộ Thân Hiệp Sĩ. Xin trao lại bảo vật này cho ngài để soi bước chặng đường cuối!"* *(Giữ nguyên `rewardItem: eqp_bell_ward_charm ×1`, `healPlayer: true`, `campfire_knight_q3_completed`)*.
- **ĐỀ XUẤT SAU (`campfire_knight_idle_talk` `L836`):**
  - *"Ngọn lửa Trạm Lửa Rừng Tĩnh Lặng này sẽ luôn cháy vì lời thề năm xưa, **thưa thầy Meliodas**. Ngài có thể mở Sổ Tay `[J]` xem lại toàn bộ những mảnh ký ức đã thức tỉnh!"* *(Giữ nguyên `healPlayer: true` & nhánh nghỉ ngơi `campfire_knight_rest_blessing`)*.

---

## 4. Rà Soát Code Cần Phối Hợp Khi Triển Khai (`GameScene.ts` & `DialogueSystem.ts`)

1. **`GameScene.ts:4826–4849`:**
   - Gỡ/chỉnh popup spoil `L4849` (`'⚔️ THỨC TỈNH KÝ ỨC: Bạn chính là Chỉ Huy Hiệp Sĩ Đen!'`) sang `'⚔️ THỨC TỈNH KÝ ỨC: Sir Vaelen đã nhận ra ngài — Meliodas Blackwood!'` (tương ứng mốc reveal `DEC-LOCK-07`).
   - Tách rạch ròi `corrupted_crest_obtained` (`Stage 2` nhặt ở Đầm Lầy) với `boss_hooded_knight_defeated` (`SQ08` Boss drop) tại `GameScene:4832–4835` để hoàn thành `SQ08` không bị nhánh Đầm Lầy (`L4826`) chen ngang vô lý (`NT-03`).
2. **`GameScene.ts:4881–4884`:** Không tự mở `lore_black_knight_chronicle` đầy spoil ở `Q1` (`stage = 1`) khi chưa đi Xưởng Chuông hoặc khi chưa viết lại text `lore_black_knight_chronicle`.
3. **`DialogueSystem.ts:75–80, 309`:** Bổ sung phím `4`, `5` cho `campfire_knight_intro` & chặn farm lặp `trustDelta`.
4. **Cam kết bảo vệ:** `npc_campfire_knight` giữ cố định tọa độ `(1435, 710)` (lửa `(1470, 710)`), giữ nguyên `CampSanctuarySystem`, `vaelen_forge_purification_key`, `food_calming_tea`, `res_tree_resin`, `eqp_bell_ward_charm`, không biến Vaelen thành companion, không đụng sprite/kỹ năng.

---

## 5. Khóa Dừng (`HARD STOP`)
- **Chưa sửa mã nguồn hay `dialogues.json`**, chờ **Owner** duyệt: `DEC-LOCK-01` (`OQ-01`), `DEC-LOCK-02` (`OQ-03`), `DEC-LOCK-07` (`OQ-20b`), `DEC-LOCK-09` (`OQ-04`), `DEC-LOCK-10` (`OQ-06`), `DEC-LOCK-11` (`OQ-05/11/14/16`), và `DEC-LOCK-17` (`DLG-009`, `DLG-014`).
- Sau khi duyệt, bộ test bắt buộc (`HW-NR-06 §TESTS`): First encounter (`SQ06`), Repeat (`q1/q2/q3_reminder`), Nhặt `crest` Đầm Lầy vs `SQ08`, Tôi luyện `quest_purification_key`, Save/Load Schema `3` qua các giai đoạn, và `campfire_knight_idle_talk` + `rest_blessing_stage3`.
