# HW-RP-02 — MASTER AUDIT, CHANGELOG & V1.5.4 FINAL REGRESSION REPORT

**Dự án:** HOLLOW WOODS (Tiến tới Release V1.5.4)
**Workdir:** `G:\HOLLOW WOODS`
**Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
**Thời gian lập báo cáo:** 2026-11-22
**Chế độ thực thi:** AUDIT + DOC-ONLY COMMIT (Tuyệt đối không sửa code gameplay, không merge main, không tạo release ZIP)
**Đánh giá độ sẵn sàng V1.5.4:** **CONDITIONAL RELEASE-READY** (Đạt chuẩn mã nguồn & runtime nội bộ, cần Owner playtest xác thực thực tế)

---

## 1. BẢNG TỔNG MỤC CÁC GÓI CÔNG VIỆC (MASTER INVENTORY)

Dưới đây là ma trận tiến độ và kết quả nghiệm thu của toàn bộ chuỗi nhiệm vụ chuẩn bị cho bản phát hành V1.5.4:

| Mã nhiệm vụ | Tên nhiệm vụ | Trạng thái (Status) | Commit SHA | Tệp tin thay đổi | Bằng chứng kiểm thử (Evidence) | Tồn đọng (Pending) | Tác động phát hành (Effect to Release) |
|:---:|:---|:---:|:---:|:---|:---|:---:|:---|
| **HW-FIX-21** | Dọn dẹp Outer Woods, khu vực Sir Vaelen & 4 hotfix audit | **CLOSED-VERIFIED** | `3b1982b` | `WorldBuilder.ts`, `zones.json`, `outer_woods.json`, `GameScene.ts`, `CraftingModal.ts`, `JournalModal.ts`, `PauseModal.ts`, `SettingsUIHelper.ts` | 6 screenshots, Playwright 60Hz noclip traversal PASS 100% | Không | Giải phóng hành lang Outer Woods $\ge 72\text{px}$, vá dứt điểm 4 lỗi lệch UI & respawn |
| **HW-FIX-22** | Vá lỗi Walk/Run Black Knight (Đề xuất cũ) | **NOT EXECUTED** *(Thay thế)* | — | Không sửa | Thay thế và thực hiện trọn vẹn bởi HW-BUG-21B | Không | Không áp dụng (đã có HW-BUG-21B) |
| **HW-FIX-23** | Giảm chói lóa Horror FX, vignette kép, Safe Zone FX | **NOT EXECUTED** | — | Không sửa | Chưa triển khai trong queue hiện tại | Chuyển sang Backlog V1.5.4 Polish | Trải nghiệm hình ảnh hiệu ứng kinh dị cần tinh chỉnh tiếp ở đợt sau |
| **HW-BUG-21A** | Khảo sát chẩn đoán hiện tượng chạy/đi Black Knight | **CLOSED-VERIFIED** | `b21efe9` | `HW_BUG_21A_WALK_RUN_AUDIT.md`, `tests/hw_bug_21a_walk_run_diagnostic.py` | Báo cáo chẩn đoán 3 khả năng: Shift dội phím, IME, frame durations | Không | Làm rõ nguyên nhân gốc kẹt phím Shift và lệch animation |
| **HW-BUG-21B** | Sửa dứt điểm kẹt Shift, đồng bộ Walk/Run và Blur window | **CLOSED-VERIFIED** | `d70108c` | `BlackKnightPlayer.ts`, `BlackKnightAnimations.ts`, `HW_BUG_21B_WALK_RUN_FIX.md`, `tests/hw_bug_21b_walk_run_verification.py` | 5 bài test tự động: Key-repeat, Shift transition, window blur, anim sequence | Không | Nhân vật di chuyển mượt mà, triệt tiêu 100% lỗi tự phát anim Run khi đang đi bộ |
| **HW-BUG-22** | Chuẩn hóa tỉ lệ hình ảnh (Visual Scale) Black Knight | **CLOSED-VERIFIED** | `8dab105` | `Constants.ts`, `BlackKnightPlayer.ts`, `HW_BUG_22_PLAYER_SCALE_REPORT.md`, `tests/hw_bug_22_scale_*.py`, 6 screenshots | Đo đạc tương quan chiều cao pixel: Black Knight ($50\text{px}$) vs Garth ($54\text{px}$) & Sir Vaelen ($48\text{px}$) | Không | Khắc phục ngoại hình tí hon, vóc dáng cân đối uy dũng chuẩn tỷ lệ hiệp sĩ |
| **HW-BUG-23** | Nghiệm thu dọn dẹp 5 prop Outer Woods của HW-FIX-21 | **VERIFIED-BY-PRIOR-COMMIT** | `0a647bc` | `HW_BUG_23_OUTER_WOODS_REMOVAL.md`, `tests/hw_bug_23_prop_removal_verification.py`, 2 screenshots | 7/7 checks runtime pass: 5 sprite vắng bóng, 0 orphan collider, noclip OFF clear | Không | Đảm bảo đúng 4 bụi + 1 cây đã xóa, không dọn nhầm hay dư thừa |
| **HW-BUG-24A** | Khảo sát kiểm toán 5 tuyến đường lưu thông Outer Woods | **VERIFIED-NO-CHANGE** | `a1640d9` | `HW_BUG_24A_OUTER_WOODS_AUDIT.md`, `tests/hw_bug_24a_outer_woods_path_audit.py`, 6 screenshots & Route Map | 5 tuyến đường hai chiều đều PASS 100%, 0 blocker, 4 vật thể lề xác định là KEEP | Không | Xác nhận địa hình Outer Woods sau dọn dẹp đã hoàn toàn thông suốt |
| **HW-BUG-24B** | Xử lý blocker mới nếu có tại Outer Woods | **VERIFIED-NO-CHANGE** | `e0cda83` | `HW_BUG_24B_OUTER_WOODS_FIX.md`, `tests/hw_bug_24b_no_fix_verification.py` | Kích hoạt điều kiện NO FIX REQUIRED do HW-BUG-24A không có blocker | Không | Giữ nguyên trạng mã nguồn gameplay, bảo vệ độ ổn định trước release |
| **HW-BUG-25A** | Kiểm toán xác minh loại bỏ Trụ Đèn Bão tại (1220, 600) | **VERIFIED-BY-PRIOR-COMMIT** | `ebaa74c` | `HW_BUG_25A_STORM_LAMP_AUDIT.md`, `tests/hw_bug_25a_storm_lamp_audit.py`, 3 screenshots | 6/6 checks pass: 0 prompt ma, 0 collider, Biển chỉ dẫn (1220, 640) & Đèn [F] nguyên vẹn | Không | Triệt tiêu hoàn toàn tương tác checkpoint thừa `ow_lantern_checkpoint_1` |
| **HW-BUG-25B** | Xử lý tàn dư Trụ Đèn Bão nếu có | **VERIFIED-NO-CHANGE** | `8e001d5` | `HW_BUG_25B_STORM_LAMP_FIX.md`, `tests/hw_bug_25b_no_fix_verification.py` | Kích hoạt điều kiện NO FIX REQUIRED do HW-BUG-25A đạt Phương án A | Không | Giữ nguyên trạng mã nguồn, không dựng đèn giả hay mượn texture |

---

## 2. KẾT QUẢ KIỂM TRA TOÀN DIỆN 6 TRỤ CỘT KỸ THUẬT (CORE AUDIT)

Bộ kiểm thử tổng thể: `tests/hw_rp02_final_regression_suite.py` (Đạt kết quả PASS 100%).

### 2.1. Nhân vật Người Lữ Khách (Black Knight Player)
- **Tốc độ di chuyển:** Đi bộ đạt $85\text{px/s}$, chạy nước rút đạt $140\text{px/s}$ (`PLAYER_WALK_SPEED` và `PLAYER_SPRINT_SPEED`).
- **Hoạt ảnh (Animations):** Đồng bộ hoàn toàn giữa trạng thái vật lý và frame đồ họa; triệt tiêu hoàn toàn hiện tượng kẹt frame chạy khi thả phím Shift.
- **Tương thích gõ phím & Window Blur:** Khi cửa sổ game mất tiêu điểm (blur), hệ thống tự động giải phóng toàn bộ phím vật lý (`isPhysicalShiftHeld = false`).
- **Tỷ lệ hiển thị (Visual Scale):** Chuẩn hóa tỷ lệ `WAYFARER_BASE_SCALE = 1.50`, chiều cao thực tế 50–51px, cân đối hài hòa bên cạnh NPC Garth (54px) và Sir Vaelen (48px). Hộp va chạm chân giữ nguyên $18\text{px} \times 12\text{px}$.

### 2.2. Địa hình & Lưu thông Rừng Ngoại Vi (Outer Woods)
- **Dọn dẹp prop:** Đúng 4 bụi rậm tại (1350, 780), (1420, 745), (1180, 760), (1260, 800) và 1 cây cản đường (1486, 734) dưới bếp Sir Vaelen đã bị loại bỏ triệt để.
- **Collider & Lòng đường:** Không tồn tại collider mồ côi. Cả 5 tuyến đường lưu thông huyết mạch đều cho phép nhân vật di chuyển liên tục hai chiều trơn tru với **Noclip OFF**.
- **Tính năng Stealth & Landmark:** Điểm ẩn nấp bụi rậm chữ S (1180, 650), Cây rỗng Bắc (1360, 620) và Cây rỗng Bãi Liễu (1305, 885) nguyên vẹn. NPC Sir Vaelen (1435, 710) và Bếp Lửa Hồng (1470, 710) bảo toàn 100%.

### 2.3. Tương tác Trụ Đèn Bão (Storm Lamp Checkpoint)
- Đối tượng `ow_lantern_checkpoint_1` và hành động `ignite_lantern_checkpoint` đã bị xóa sạch khỏi source, bản đồ và dữ liệu vùng.
- Vùng tọa độ `(1220, 600)` hoàn toàn thông thoáng, không có nhãn `[E]` ma hay collider ngầm.
- Biển Chỉ Dẫn `ow_signpost` tại `(1220, 640)` hoạt động độc lập bình thường.

### 2.4. Các bản vá bổ trợ từ HW-FIX-21
- **Xưởng Bram cũ:** Sân đá chuyển sang `(1348, 447)` và tàn lửa lò rèn chuyển sang `(1318, 408)`.
- **Giao diện Chế Tạo (CraftingModal):** Nền nút `[Thiếu Đồ / Chế Tạo]` căn chỉnh hoàn hảo tại $Y = 136$ (tâm $Y = 152$), khớp 100% với vùng nhấp chuột và chữ hiển thị.
- **Hồi sinh Boss:** Điểm hồi sinh an toàn sau khi tử trận tại khu di tích được chuyển về đúng Trạm Lửa Sir Vaelen trong Outer Woods `(1420, 710)`.
- **Giao diện Nhật Ký & Dọn dẹp bộ nhớ:** Sửa văn bản cũ, tính động số vùng khám phá, dọn dẹp các event listener tránh rò rỉ bộ nhớ khi tắt modal.

### 2.5. Tình trạng nhiệm vụ HW-FIX-23 (Horror FX & Ánh sáng)
- **Trạng thái:** **NOT EXECUTED**.
- **Ghi chú trung thực:** Nhiệm vụ này chưa được triển khai trong queue hiện tại; hệ thống kinh dị (vignette, ánh sáng ban ngày, sanity FX) giữ nguyên trạng của bản V1.5.3, không tự nhận đạt chuẩn khi chưa kiểm thử.

### 2.6. Sức khỏe mã nguồn & Build hệ thống
- `npx tsc --noEmit`: **PASS (0 lỗi biên dịch)**.
- `npm run build`: **PASS (100 modules transformed, hoàn tất trong 12.97s)**.
- `Console / Page Errors`: **0 lỗi runtime, 0 lỗi 404 tài nguyên đồ họa/âm thanh**.

---

## 3. NGUYÊN TẮC CHỐNG NGHIỆM THU GIẢ (TRANSPARENCY & LIMITATIONS)

Để đảm bảo tính trung thực tuyệt đối trước khi phát hành phiên bản V1.5.4, đội ngũ kiểm toán ghi nhận rõ các giới hạn thử nghiệm chưa được bao phủ bởi môi trường tự động:

1. **Phương pháp kiểm thử di chuyển:** Các script kiểm thử di chuyển sử dụng mô phỏng vật lý liên tục theo thời gian thực 60Hz với Noclip OFF. Phương thức `setPosition()` chỉ được sử dụng cho mục đích `SETUP` ban đầu, tuyệt đối không dùng làm bằng chứng chứng minh lối đi thông thoáng.
2. **Môi trường ngoài phạm vi headless browser:**
   - *Bộ gõ Tiếng Việt OS (UniKey / EVKey trên Windows):* Đã được kiểm tra qua cơ chế xử lý physical keycode và blur event trong code, nhưng cần Owner kiểm tra trực tiếp trên trình duyệt máy thật khi đang bật EVKey.
   - *Lưu trữ đám mây & Web Storage P2Game:* Chưa thể test trên host production thực tế của nền tảng phát hành.
   - *Kiểm âm trực thính (Human Audio Listening):* Cần tai nghe của con người thẩm âm thực tế để cảm nhận độ mượt của chuyển đoạn nhạc nền và tiếng bước chân.
   - *Benchmark hiệu năng GPU thấp:* Môi trường SwiftShader headless chỉ kiểm tra logic đồ họa, chưa phản ánh FPS thực tế trên các dòng máy card yếu.
   - *Full Playthrough (Chơi từ đầu tới cuối):* Cần một lượt chơi hoàn chỉnh từ Fog Crossing qua Bellhollow, Farm, Outer Woods tới Đầm Lầy để cảm nhận trọn vẹn nhịp độ game.

---

## 4. BẰNG CHỨNG HÌNH ẢNH MINH HỌA (F9 DEBUG OVERLAY OFF)

````carousel
![Master Visual Scale Comparison](file:///C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_rp02_master_player_scale.png)
<!-- slide -->
![Outer Woods S-Curve Corridor](file:///C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_rp02_outer_woods_corridor.png)
<!-- slide -->
![Sir Vaelen Camp & Bonfire 360 Loop](file:///C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_rp02_sir_vaelen_camp.png)
````

---

## 5. TOP 5 ƯU TIÊN HÀNG ĐẦU TIẾP THEO (NEXT 5 PRIORITIES)

1. **Triển khai HW-FIX-23 (Horror FX & Visual Comfort):** Tinh chỉnh giảm cường độ nhấp nháy (hard strobe), khử vignette trùng lặp, tối ưu Safe Zone / Reduced Motion toggle cho người nhạy cảm ánh sáng.
2. **Owner Manual Playtest:** Chơi thử 15–20 phút trên trình duyệt thật (Chrome/Edge) với bộ gõ tiếng Việt EVKey/UniKey bật chế độ gõ Telex để xác nhận cảm giác điều khiển nhân vật.
3. **Thẩm âm thực tế (Audio Balance Playtest):** Đi qua các ranh giới vùng chuyển tiếp (Zone Boundaries) để kiểm tra âm thanh chuyển cảnh mượt mà, không bị hụt tiếng hay đè lớp BGM.
4. **Kiểm tra Save/Load trên trình duyệt thật:** Thử nghiệm tạo Save mới, tải lại game, tiếp tục chơi (Continue) từ màn hình chính để xác thực đồng bộ LocalStorage.
5. **Đóng gói chính thức V1.5.4:** Sau khi Owner hoàn tất playtest thủ công đạt yêu cầu, tiến hành bump version `package.json` lên 1.5.4, tạo git tag `v1.5.4` và xuất file phát hành chính thức.

---

## 6. KẾT LUẬN ĐỘ SẴN SÀNG PHÁT HÀNH (V1.5.4 READINESS)

### ĐÁNH GIÁ: **CONDITIONAL RELEASE-READY**

**Lý do:**
- Toàn bộ các lỗi nghiêm trọng về di chuyển (Walk/Run desync, kẹt Shift), tỷ lệ hình ảnh nhân vật (Visual Scale), dọn dẹp chướng ngại vật Outer Woods và triệt tiêu prompt ma đã được giải quyết triệt để 100% trong mã nguồn và vượt qua tất cả các bài kiểm tra tự động.
- Trạng thái mã nguồn trên nhánh `feat/v1.5.3-ag-world-polish` đạt độ tin cậy và ổn định cao nhất từ trước đến nay.
- Điều kiện duy nhất còn lại là Owner cần thực hiện một lượt chơi thử nghiệm thủ công trên máy thật (Manual Sanity Playtest) trước khi chính thức gắn tag và xuất xưởng bản V1.5.4.
