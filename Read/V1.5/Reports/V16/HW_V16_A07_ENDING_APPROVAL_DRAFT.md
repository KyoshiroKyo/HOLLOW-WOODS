# HW-V16-A07 — ENDING SCRIPTS APPROVAL DRAFT (`E01–E03`)

- **Dự án:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH`)
- **Trạng thái tài liệu:** **`DRAFT — PENDING OWNER APPROVAL`** *(Không tự tích hợp văn bản mới hoặc tên hiển thị chưa duyệt vào `EndingSystem.ts` / `lore.json`; giữ nguyên ngưỡng `50 / 3 / 65` theo `DEC-LOCK-18`)*
- **Các khóa chi phối:** `DEC-LOCK-01..09`, `DEC-LOCK-11`, `DEC-LOCK-13`, `DEC-LOCK-14` *(loại trừ `CHAR-006`)*, `DEC-LOCK-18`

---

## E01 — True Ending (`true_ending`)

- **Tên hiển thị đề xuất (`DRAFT`):** *The Unbroken Oath* *(Lời Thề Không Phai / Bình Minh Của Tiếng Chuông — giữ chờ Owner xác nhận nhãn cuối cùng)*
- **Điều kiện hiện hành (Owner-Locked):** `composure >= 50 && memoryAwakeningStage >= 3 && villageTrustScore >= 65`
- **Tóm tắt Narrative:** Sau khi khôi phục Lưỡi Chuông Đồng từ Miếu Chuông Phế Tích và gióng lên Hồi Chuông Đầu Tiên (*The First Toll*), sự gắn kết bền chặt với Bellhollow cùng ký ức đã thức tỉnh giúp thanh tẩy Mạch Rễ cổ đại. Màn sương *The Veil* rút lui khỏi thung lũng.
- **Lời dẫn đề xuất (`DRAFT` — tương thích Reveal Gate):**
  - *Khi `canRevealPlayerIdentity() === true`:*
    1. `"Hồi chuông thứ bảy ngân vang, chấn động tầng mây lạnh đã bao trùm thung lũng Bellhollow suốt bao mùa sương."`
    2. `"Nhờ ký ức trọn vẹn của Meliodas Blackwood — The Wolf Lord và niềm tin đồng lòng từ dân làng Bellhollow, Mạch Rễ cổ đã được thanh tẩy."`
    3. `"Những tia nắng ban mai đầu tiên xuyên qua tán rừng già; thung lũng mở cổng đón ánh sáng bình minh trở lại."`
    4. `"Người hiệp sĩ đặt kiếm bên ngọn lửa ấm, giữ lại lời thề bảo hộ bình yên cho ngôi làng giữa rừng."`
  - *Khi chưa qua Reveal Gate (`PARTIAL` fail-closed):* Giữ nguyên cấu trúc nhưng thay thế danh xưng riêng bằng `"người lữ khách mang Vòng Sáng Hộ Tâm"`.
- **Hình ảnh đề xuất:** Khung minh họa bình minh vàng cam trên nền tháp chuông Bellhollow đang rung ngân, ánh nắng xuyên qua tán rừng với dân làng đứng hướng về mặt trời (`drawTrueEndingIllustration`). *(Nghệ thuật Key Art nâng cấp thuộc Track `D/G` — chưa sản xuất ở A07).*
- **Vai trò Bellhollow:** Trung tâm hồi sinh; ngôi làng giữ vững lời thề sống sót qua Mùa Sương Lạnh nhờ Garth, Edda, Neris, Bram và Finn đồng hành cùng NVC.
- **Tình trạng ký ức:** `Stage 3 — Memory Awakening`; các chương `lore_memory_chapter_1..4` mở, `lore_wayfarer_inner_journal` chỉ mở nguyên văn khi thỏa Reveal Gate.
- **Câu hỏi Canon còn mở (`DEC-LOCK-02..05, 11, 13`):**
  - Số phận chi tiết của **Sir Vaelen** & **Sir Mordric** sau khi sương tan (`tái ngộ` hay `ở lại biên giới rừng`) — giữ mở theo `DEC-LOCK-11`.
  - Tiểu sử và hậu truyện của **Sir Roderick** & **Sir Aldemar** (`DEC-LOCK-13`).
  - Danh tính kẻ cất tiếng cầu cứu trong rừng xưa (`DEC-LOCK-03` — `UNKNOWN`).
  - *Cam kết loại trừ:* Không đưa **The Headless Warden (`CHAR-006`)** vào Ending.
- **Gameplay Completion & Chuyển trạng thái:** Đặt `bell_rung`, `ending_true_achieved`, hoàn tất `Q06_RETRIEVE_CLAPPER:t2`, lưu `storyFlags`, mở `lore_ending_true`, gửi `p2.gameOver({ ending: 'true_ending' })` (nếu SDK bật), hỗ trợ `Chơi Hành Trình Mới` (`ENTER`) hoặc `Quay Về Menu Chính` (`ESC / SPACE`).

---

## E02 — Bittersweet Ending (`sacrifice_ending`)

- **Tên hiển thị đề xuất (`DRAFT`):** *The Eternal Vigil* *(Người Canh Gác Vĩnh Hằng — `DRAFT`)*
- **Điều kiện hiện hành (Owner-Locked):** Không thỏa điều kiện `true_ending` VÀ `memoryAwakeningStage >= 2` *(bao gồm `stage >= 2` với `trust < 65` hoặc `composure < 50`, và `stage = 3` khi thiếu `trust >= 65` / `composure >= 50`)*
- **Tóm tắt Narrative:** Người lữ khách đã cảm nhận được lời thề cổ xưa (`Stage >= 2`), nhưng vì khoảng cách niềm tin với Bellhollow (`trust < 65`) hoặc tâm trí bị sương bào mòn (`composure < 50`), nghi thức tiếng chuông không thể hóa giải tận gốc *The Veil*. Nhân vật chọn đứng lại giữa tâm điểm Mạch Rễ, dùng Vòng Sáng Hộ Tâm `[F]` tự khóa chặt khe nứt từ bên trong bằng nghi thức kỳ ảo để đổi lấy bình yên cho thung lũng.
- **Lời dẫn đề xuất (`DRAFT` — giữ yếu tố kỳ ảo, tránh mô tả bạo lực):**
  1. `"Dù lời thề năm xưa đã thức dậy trong tim, khoảng cách với dân làng hoặc cơn bào mòn tâm trí khiến tiếng chuông không đủ sức tan sương."`
  2. `"Để che chở cho Bellhollow khỏi cơn thịnh nộ của màn sương, người hiệp sĩ lặng lẽ tiến vào tâm chấn Mạch Rễ cổ."`
  3. `"Cắm thanh đại kiếm xuống nền đá thiêng và phóng thích toàn bộ hào quang Vòng Sáng Hộ Tâm [F], ông hóa thành dấu ấn canh giữ khe nứt The Veil."`
  4. `"Làng Bellhollow đón ngày mới thanh bình... còn tên tuổi của người lặng lẽ gánh lấy bóng tối mãi hòa vào lời thì thầm của rừng sâu."`
- **Hình ảnh đề xuất:** Hình bóng hiệp sĩ quỳ gối cắm thanh gươm làm neo phong ấn tỏa hào quang vàng xanh giữa tâm điểm rễ cổ (`drawSacrificeEndingIllustration`).
- **Vai trò Bellhollow:** Được cứu sống và màn sương tan khỏi cổng làng, nhưng dân làng không biết trọn vẹn chân tướng hay cái giá người lữ khách đã trả.
- **Tình trạng ký ức:** `Stage 2 — Forgotten Oath` (chưa reveal danh tính) hoặc `Stage 3` thiếu hòa giải/bình tâm; tuyệt đối không gọi `"Meliodas Blackwood"` nếu chưa qua Reveal Gate.
- **Câu hỏi Canon còn mở:** Phản ứng của `Sir Vaelen` tại Trạm Lửa khi phong ấn đóng lại; hướng giải quyết tương lai cho `Sir Mordric`, `Sir Roderick`, `Sir Aldemar`. Không đưa `CHAR-006`.
- **Gameplay Completion & Chuyển trạng thái:** Đặt `bell_rung`, `ending_sacrifice_achieved`, hoàn tất `Q06_RETRIEVE_CLAPPER:t2`, lưu `lore_ending_sacrifice`, giữ nguyên `Continue` replay an toàn ở checkpoint kết thúc.

---

## E03 — Fog Loop Ending (`fog_loop_ending`)

- **Tên hiển thị đề xuất (`DRAFT`):** *The Endless Mist* *(Vòng Lặp Của Sương Mù — `DRAFT`)*
- **Điều kiện hiện hành (Owner-Locked):** `memoryAwakeningStage < 2` (`Stage 0` hoặc `Stage 1`)
- **Tóm tắt Narrative:** Khi đánh thức Đại Hồng Chung quá vội vã mà ký ức bản thể và lời thề vẫn mờ mịt (`Stage < 2`), cộng hưởng sai nhịp làm thân chuông rạn nứt sâu hơn. Tầng sương lạnh *The Veil* tràn ngược qua thung lũng Bellhollow, nhấn chìm mọi manh mối trở lại điểm khởi đầu vô định.
- **Lời dẫn đề xuất (`DRAFT`):**
  1. `"Chưa kịp chạm tới ký ức thật sự về lời thề cổ xưa, hồi chuông vội vã đã dội qua thân chuông nứt vỡ giữa màn sương."`
  2. `"Vết nứt cổ đại tách đôi trong tiếng rên vang rợn; luồng sương xám đặc từ rừng sâu tràn ngược qua hàng rào Bellhollow."`
  3. `"Ánh sáng Vòng Sáng Hộ Tâm chập chờn rồi khép lại giữa biển mù trắng xóa, xóa nhòa mọi dấu chân vừa đi qua."`
  4. `"Vòng lặp sương mù khép kín thêm một mùa... chờ kẻ lạc bước một lần nữa tỉnh dậy bên lối mòn xưa."`
- **Hình ảnh đề xuất:** Quả chuông nứt đỏ hung mờ ảo giữa bầu trời tím lạnh và bóng hiệp sĩ kiệt sức giữa màn sương mù (`drawFogLoopEndingIllustration`) kèm tiếng chuông vỡ (`playCrackedBellToll`).
- **Vai trò Bellhollow:** Bị *The Veil* phủ kín trở lại; chuông làng không thể tái lập kết giới hoàn chỉnh.
- **Tình trạng ký ức:** `Stage 0 — Unknown Identity` hoặc `Stage 1 — Memory Echoes`; `0%` reveal danh tính.
- **Câu hỏi Canon còn mở:** Mối liên hệ giữa vòng lặp sương mù với biến cố xuyên thời gian ban đầu (`DEC-LOCK-02/03`); tuyệt đối không khẳng định số năm hay cơ chế tái sinh bị loại bỏ. Không đưa `CHAR-006`.
- **Gameplay Completion & Chuyển trạng thái:** Đặt `bell_rung`, `ending_fog_loop_achieved`, hoàn tất `Q06_RETRIEVE_CLAPPER:t2`, lưu `lore_ending_fog_loop`, cho phép `Chơi Hành Trình Mới` hoặc `Quay Về Menu Chính`.
