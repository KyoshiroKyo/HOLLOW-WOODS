# HOLLOW WOODS V1.3 — MỤC LỤC TỔNG THỂ & HỒ SƠ DỰ ÁN (README INDEX)
## CỘT MỐC V1.3: TRAU CHUỐT TÍNH NĂNG SINH TỒN, CƠ CHẾ ẨN NẤP & NÂNG CAO TRẢI NGHIỆM

- **Dự án:** HOLLOW WOODS (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phiên bản:** **V1.3**
- **Thư mục gốc:** `G:\HOLLOW WOODS`
- **Engine:** Phaser 3 (Arcade Physics, Pixel Art Mode)
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái biên dịch:** `npx tsc --noEmit` -> **0 lỗi (Clean Compilation, Mã thoát 0)**

---

## 1. CẤU TRÚC HỆ THỐNG TÀI LIỆU V1.3

```
G:\HOLLOW WOODS\Read\V1.3\
├── README.md
├── README_INDEX.md
└── Reports/
    ├── 01_Project_Audit_Report.md
    ├── 02_Bug_Analysis_And_Root_Cause_Report.md
    ├── 03_Implementation_Report.md
    ├── 04_AI_And_Performance_Optimization_Report.md
    ├── 05_UI_UX_And_Visual_Improvement_Report.md
    ├── 06_Cross_System_Audit_Report.md
    ├── 07_Regression_Testing_Report.md
    └── 08_Final_Release_Report.md
```

---

## 2. BẢNG THEO DÕI TIẾN ĐỘ CÁC BƯỚC NÂNG CẤP V1.3

| Mã bước | Tên hạng mục thực hiện | Trạng thái | Báo cáo chi tiết |
| :--- | :--- | :--- | :--- |
| **`C4-13-01`** | **Khởi tạo tài liệu V1.3, khắc phục triệt để lỗi kẹt núp bụi rậm/hốc cây & cơ chế gỡ kẹt Save/Load** | **COMPLETED** | [01_Project_Audit_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/01_Project_Audit_Report.md)<br>[02_Bug_Analysis_And_Root_Cause_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/02_Bug_Analysis_And_Root_Cause_Report.md) |
| **`C4-13-02`** | **Khắc phục lỗi mất hiển thị nhân vật khi vào Rừng Sâu, đồng bộ chuyển cảnh & tán cây trong suốt** | **COMPLETED** | [03_Implementation_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/03_Implementation_Report.md) |
| **`C4-13-03`** | **Xây dựng lại quy trình nhân vật gục ngã (Death State), dừng AI truy đuổi & giao diện Game Over Gothic** | **COMPLETED** | [03_Implementation_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/03_Implementation_Report.md) |
| **`C4-13-04`** | **Sửa lỗi hiển thị nhân vật cầm đèn, tối ưu bật/tắt đèn [F] và đồng bộ hoạt ảnh vung gậy** | **COMPLETED** | [03_Implementation_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/03_Implementation_Report.md) |
| **`C4-13-05`** | **Giới hạn phạm vi truy đuổi Entity (Safe Zone Làng Bellhollow) & nâng cấp 5 trạng thái AI thông minh** | **COMPLETED** | [04_AI_And_Performance_Optimization_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/04_AI_And_Performance_Optimization_Report.md) |
| **`C4-13-06`** | **Xử lý triệt để vật thể hình tròn xám, nâng cấp sương mù đa tầng Parallax 3 lớp & đồ họa môi trường** | **COMPLETED** | [05_UI_UX_And_Visual_Improvement_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/05_UI_UX_And_Visual_Improvement_Report.md) |
| **`C4-13-07`** | **Thiết kế lại Menu chính (4 nút, modal cài đặt/thông tin), HUD trong game & nhãn [E] bán trong suốt** | **COMPLETED** | [05_UI_UX_And_Visual_Improvement_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/05_UI_UX_And_Visual_Improvement_Report.md) |
| **`C4-13-09`** | **Tối ưu hóa hiệu suất đồ họa, ánh sáng, AI, bộ nhớ (60 FPS) & rà soát chéo 10 hệ thống tiềm ẩn** | **COMPLETED** | [04_AI_And_Performance_Optimization_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/04_AI_And_Performance_Optimization_Report.md) |
| **`C4-13-10`** | **Rà soát tích hợp và kiểm định chéo toàn diện 10 hệ thống tiềm ẩn (Cross-System Integration Audit)** | **COMPLETED** | [06_Cross_System_Audit_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/06_Cross_System_Audit_Report.md) |
| **`C4-13-12`** | **Kiểm thử hồi quy 11 tiêu chí, so sánh hiệu suất & Nghiệm thu khóa sổ phát hành chính thức V1.3** | **COMPLETED** | [07_Regression_Testing_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/07_Regression_Testing_Report.md)<br>[08_Final_Release_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/08_Final_Release_Report.md) |

---

## 3. TÓM TẮT ĐIỂM NHẤN KỸ THUẬT V1.3

### C4-13-01 — Cơ chế Ẩn Nấp & Thoát Kẹt Hai Chiều (Hiding & Unstuck Stance)
1. **Khắc phục triệt để lỗi nuốt phím [E] khi đang ẩn nấp:**
   - Đưa việc xử lý phím tương tác `[E]` (`consumeOneShotAction('interact')`) lên trước lệnh `return` của `isHiding` trong `SatyrPlayer.update()`.
   - Lưu trữ tọa độ đứng an toàn `lastSafePosition` trước khi ẩn nấp và hoàn trả chính xác khi bước ra.
2. **Cơ chế thoát chỗ trốn linh hoạt:**
   - Cho phép thoát ngay lập tức khi nhấn phím `[E]`.
   - Bổ sung cơ chế thoát tiện lợi: nhấn các phím di chuyển `WASD` hoặc phím Mũi tên (sau 0.3s) để tự động bước ra khỏi chỗ trốn.
3. **Giải thuật tự động gỡ kẹt vật lý (AABB Nudge Algorithm):**
   - Tích hợp `unstuckPlayerFromColliders()` trong `GameScene.ts` với 12 vector dịch chuyển ngắn.
   - Tự động gỡ kẹt cho Save/Load khi nạp game hoặc tải lại checkpoint.
   - `SaveManager.ts` và `PlayerState.ts` luôn bảo đảm giải phóng `isHiding = false` khi lưu và nạp.

### C4-13-02 — Hiển Thị Nhân Vật, Tán Cây Trong Suốt & Đồng Bộ Chuyển Cảnh Rừng Sâu
1. **Hệ thống Tán Cây Trong Suốt Động (Dynamic Canopy Transparency):**
   - Bổ sung `treeCanopyGroup` trong `WorldBuilder.ts` theo dõi mọi cây xanh, cây khô và cây cổ thụ rỗng.
   - Tự động làm trong suốt tán cây xuống `alpha = 0.35` khi nhân vật đi bên dưới để không che khuất người chơi, phục hồi về `alpha = 1.0` khi bước ra.
   - Chuẩn hóa tỷ lệ cây khô `SPRITE_TREE_DEAD` về `1.05x`, loại trừ hoàn toàn các cành cây phình to che kín màn hình.
2. **Căn giữa Camera tức thời & Đồng bộ Bounds chuyển cảnh:**
   - Bổ sung `cameraSystem.centerOn(x, y)` loại bỏ hoàn toàn độ trễ trượt camera khi chuyển sang vùng có tọa độ lớn.
   - Đồng bộ hóa bounds phân khu và reset vật lý tức thời tại điểm spawn `(targetSpawn.x, targetSpawn.y)`.
   - Bảo vệ tuyệt đối quyền hiển thị của player (`visible = true`, `active = true`), loại trừ player khỏi diện bị culling.
3. **Tái thiết kế đường mòn Rừng Sâu (Deep Forest Organic Trail):**
   - Thay thế các nét vẽ hình ống dạng tròn cũ bằng giải thuật lấy mẫu hữu cơ 2px với độ lượn sóng tự nhiên.
   - Tinh chỉnh bán kính đường mòn tự nhiên `r: 10..13 px` và bảng màu đất mùn lá kim rừng sẫm, xóa bỏ hoàn toàn ảo ảnh "cành cây khổng lồ".
4. **Xóa sổ khung debug rỗng:**
   - Thiết lập ẩn (`setVisible(false)`) cho các collider rỗng trên barrier Cổng Đông và Đền Chuông Vỡ.

### C4-13-03 — Quy Trình Nhân Vật Gục Ngã (Death State) & Bảng Game Over Gothic
1. **Xử lý Nhân vật Ngã Xuống (Death State):**
   - Triệt tiêu vận tốc về 0, khóa toàn bộ di chuyển, tương tác và phím tắt mở cửa sổ `[I]`, `[J]`, `[ESC]`, `[1]`, `[2]`, `[Q]`.
   - Phát hoạt ảnh `wayfarer_death` đúng 1 lần duy nhất và tạm dừng cố định tại frame cuối cùng (không lặp lại, không chuyển về Idle).
   - Thêm phương thức `respawn(x, y)` để mở khóa điều khiển và hồi sinh sạch sẽ khi nạp checkpoint.
2. **Dừng Ngay Lập Tức Hành Vi Truy Đuổi của AI:**
   - Bổ sung `resetToPatrol()` trong `ListenerAI` và `TheListener`.
   - Ngắt ngay trạng thái săn mồi `CHASE`, triệt tiêu vận tốc của quái vật và đưa AI về lộ trình tuần tra mặc định khi người chơi gục ngã.
3. **Giao Diện Game Over Gothic Phong Cách HOLLOW WOODS ([GameOverModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/GameOverModal.ts)):**
   - Khung hình 520×400 px, nền đen ánh sương đỏ u ám, viền đỏ thẫm `0x8b0000` và đồng cổ.
   - Hiển thị tiêu đề **GỤC NGÃ TRONG SƯƠNG ĐẶC** và nguyên nhân tử vong động.
   - Tích hợp 3 nút chức năng hoạt động chính xác:
     + `[↺ NẠP ĐIỂM LƯU GẦN NHẤT]`: Khôi phục chỉ số sinh lực $\ge 50\%$, đưa AI về tuần tra gốc, mở khóa điều khiển và tiếp tục hành trình.
     + `[🔄 CHƠI LẠI TỪ ĐẦU]`: Làm sạch PlayerState, dừng âm thanh và khởi động lại game sạch sẽ.
     + `[🏠 VỀ MÀN HÌNH CHÍNH]`: Dừng âm thanh và chuyển về `MainMenuScene`.

### C4-13-04 — Chuẩn Hóa Hiển Thị Đèn Cầm Tay, Tối Ưu Phím [F] & Đồng Bộ Cung Vung Gậy
1. **Khắc phục triệt để khối đèn hình vuông màu nâu trôi nổi:**
   - Xóa bỏ hoàn toàn lớp vẽ hình vuông nâu giả lập (`0x352317`, `0x1a1512`, `0x241a14`) khi đèn TẮT; texture nhân vật gốc đã có sẵn cây gậy gỗ pixel-art tự nhiên.
   - Khi đèn BẬT, quầng sáng hổ phách và tim lửa sống động được chiếu đồng tâm chuẩn xác trên đầu gậy.
2. **Căn chỉnh điểm neo và cung chuyển động đèn 4 hướng:**
   - Khớp tọa độ tương đối với đầu gậy pixel-art trong `Constants.ts`:
     + `DOWN`: `{ x: -5, y: -16 }`
     + `UP`: `{ x: 13, y: -19 }`
     + `LEFT`: `{ x: -9, y: -16 }`
     + `RIGHT`: `{ x: 9, y: -16 }`
   - Bảng chuyển động 6 frame của hoạt ảnh `attack` khớp theo cung vung gậy gỗ thực tế ở cả 4 hướng.
   - Sắp xếp độ sâu: `depth - 1` khi nhìn UP (bị thân người che khuất từ góc sau), `depth + 1` khi nhìn DOWN/LEFT/RIGHT.
3. **Tối ưu hóa hệ thống bật/tắt [F] & sương mù mượt mà:**
   - Tích hợp bộ chống dội phím (180ms debounce) trên `toggleLantern()`.
   - Chuyển đổi bán kính ánh sáng mượt mà (`Phaser.Math.Linear` factor 0.18) giữa DIM (45px) và NORMAL (120px) trong `updateFogOfWar`.
   - Chuẩn hóa công thức chiếu tọa độ từ World sang Screen bằng `cam.scrollX` và `cam.zoom` trực tiếp, triệt tiêu lỗi lệch vùng sáng sang biên màn hình.
   - Quầng sáng hổ phách `lanternGlowGfx` được thu gọn tỉ lệ hài hòa (`0.55` và `0.85`), triệt tiêu quầng sáng cam khổng lồ chèn kín màn hình.

### C4-13-05 — Giới Hạn Lãnh Thổ Entity (Safe Zone Làng Bellhollow) & 5 Trạng Thái AI Thông Minh
1. **Khoanh vùng lãnh thổ rừng & Bảo vệ Làng Bellhollow:**
   - Toàn bộ Làng Bellhollow và khu vực Cổng làng ($x \le 1620$) được thiết lập là Khu Vực An Toàn (Safe Zone).
   - Khi thực thể di chuyển chạm ranh giới $x = 1620$ hoặc vượt quá bán kính rượt đuổi tối đa (Max Leash Distance: 420px), nó lập tức dừng lại, từ bỏ truy đuổi (`DISENGAGE / RETURN`) và quay đầu về rừng sâu, tuyệt đối không đi vào làng.
2. **Tối ưu tần suất Pathfinding & Tự gỡ kẹt vật lý (Anti-Stuck):**
   - Hướng di chuyển chỉ được tính toán lại mỗi 160ms (`PATH_UPDATE_INTERVAL = 160`), tiết kiệm hơn 85% chi phí CPU steering.
   - Khi phát hiện bị kẹt vào thân cây/tảng đá quá 320ms, Entity tự động đổi góc né $\pm 45^\circ$ để trượt mượt mà theo mép collider; kẹt quá 1.2s sẽ tự động giải phóng vị trí. Triệt tiêu hoàn toàn hiện tượng tụt FPS.
3. **5 Trạng thái hành vi công bằng & Huy hiệu trực quan:**
   - **Tuần tra (Patrol):** Tốc độ 42 px/s, dừng ngó nghiêng 1.1s tại mỗi waypoint.
   - **Phát hiện nghi vấn (Alert):** Hiện dấu `[?]` vàng hổ phách, dừng 0.7s lắng nghe rồi tiến tới nguồn phát âm thanh (56 px/s).
   - **Truy đuổi (Chase):** Hiện dấu `[!]` đỏ thẫm, bật nhịp tim căng thẳng, rượt đuổi 105 px/s, né vật cản.
   - **Tìm kiếm công bằng (Search):** Khi người chơi núp bụi/hốc cây, Entity chỉ tìm kiếm tại tọa độ nhìn thấy cuối cùng (`lastKnownPosition`) trong 4.5s với dấu `[?]` vàng, tuyệt đối không đi thẳng vào chỗ nấp.
   - **Từ bỏ & Quay về (Return):** Tắt cảnh báo, tắt nhịp tim, có thời gian nghỉ 2.5s không phát hiện lặp, quay về tuyến tuần tra (48 px/s).

### C4-13-06 — Nâng Cấp Đồ Họa Môi Trường, Xử Lý Vật Thể Xám Bất Thường & Sương Mù Đa Tầng
1. **Chuẩn hóa Pixel Art tảng đá thay thế khối elip xám thô sơ:**
   - Trích xuất và tích hợp 2 sprite tảng đá tự nhiên `rock_large.png` ($64 \times 48$) và `rock_medium.png` ($48 \times 40$) từ bộ tài nguyên gốc.
   - Thay thế toàn bộ lệnh vẽ nguyên thủy `rock.fillStyle(0x424949, 1)` tại "Khối Đá Canh Gác" và các mỏm đá thế giới bằng sprite Pixel Art sắc nét kết hợp bóng đổ mặt đất mềm mịn (`alpha 0.25`).
2. **Xóa vòng tròn xám và viền dày dưới mỏ tài nguyên & chuẩn hóa bóng đổ:**
   - Xóa bỏ `strokeEllipse` quá khổ dưới các điểm tài nguyên củi khô, đá lửa, thảo dược, nhựa cây; thu nhỏ bóng tiếp xúc mặt đất về dạng elip $12 \times 4$ px (`alpha 0.25`).
   - Chuẩn hóa bóng đổ chân của Satyr, NPC và The Listener về dạng elip mờ mịn ôm sát bàn chân, loại trừ hoàn toàn các quầng đen thô cứng.
3. **Triệt tiêu 100% hộp vuông xanh lá fallback (`__DEFAULT` Arcade Body):**
   - Tạo texture trong suốt $1 \times 1$ `dummy_transparent` và ép buộc toàn bộ thực thể trong `colliderGroup` có `setAlpha(0)` và `setVisible(false)`.
4. **Hệ thống sương mù đa tầng Parallax 3 lớp kích hoạt ngay từ đầu game:**
   - **Tầng 1 (Ground Mist, depth -40):** Là là mặt đất trên nền cỏ, trôi dạt $12$ px/s, Parallax $15\%$.
   - **Tầng 2 (Mid-Canopy Mist, depth 450):** Lưng chừng thân cây, dao động hình sin, Parallax $35\%$.
   - **Tầng 3 (Upper Veil, depth 2800):** Tán cây trên cao, mờ ảo thanh thoát, Parallax $55\%$.
   - Kích hoạt độ mờ ngay từ constructor (thấy sương từ frame 0), phân tầng chuyển tiếp mượt mà theo từng vùng không gian và trạng thái đèn lồng.
5. **Nâng cấp quầng sáng ấm áp đèn đường làng và lửa trại:**
   - Chuyển từ viền cắt gắt 1 tầng sang quầng sáng ấm 3 tầng chuyển sắc tự nhiên quanh cột đèn lồng, lửa trại thợ săn và đèn lồng Satyr.

### C4-13-07 — Thiết Kế Lại Menu Chính, HUD Trong Game & Nhãn Tương Tác Bán Trong Suốt
1. **Nhãn tương tác bán trong suốt & Hiệu ứng rõ dần theo khoảng cách (Proximity Opacity):**
   - Loại bỏ hoàn toàn nền đen đặc `backgroundColor: '#0c1017f2'`.
   - Nâng cấp `promptContainer` dạng viên nang bo góc bán trong suốt `0x090e15` (alpha $0.72$), viền mảnh vàng kim `0xd4af37`.
   - Phân cấp khoảng cách 2 tầng: hiển thị gợi ý mờ nhẹ (`alpha = 0.45`) khi ở xa ($38\text{px} < \text{dist} \le 65\text{px}$), hiển thị sắc nét (`alpha = 1.0`) kèm nút `[E]` vàng sáng khi bước vào đúng tầm tương tác ($\text{dist} \le 38\text{px}$).
   - Đồng bộ hóa bong bóng thoại [NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts), mỏ tài nguyên [InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts), luống đất thảo mộc [FarmingSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/FarmingSystem.ts) và vật thể [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts).
2. **Thiết kế lại toàn diện Menu Chính ([MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts)):**
   - Không khí đêm rừng u tịch với 2 tầng sương mù Parallax trôi ngược chiều, quầng sáng ấm áp 3 tầng quanh nhân vật và tiêu đề sắc nét.
   - Bổ sung đủ 4 nút menu tương tác:
     + `[▶ BƯỚC VÀO MÀN SƯƠNG (BẮT ĐẦU MỚI)]`: Bắt đầu màn chơi mới, chuyển cảnh mượt mà.
     + `[▶ TIẾP TỤC HÀNH TRÌNH]`: Tự động kiểm tra file lưu, nổi bật màu xanh ngọc kèm tên checkpoint nếu có save, hiển thị dạng mờ kèm thông báo hướng dẫn nếu chưa có save.
     + `[⚙ CÀI ĐẶT TRÒ CHƠI]`: Mở popup Cài Đặt cho phép Bật/Tắt âm thanh trực tiếp và tra cứu bảng phím tắt điều khiển.
     + `[ℹ THÔNG TIN & CỐT TRUYỆN]`: Mở popup giới thiệu bối cảnh cốt truyện HOLLOW WOODS và thông số công nghệ engine V1.3.
3. **Tinh gọn HUD & Cơ chế tự động ẩn HUD khi mở Modal:**
   - 4 thanh chỉ số sinh tồn (Máu, Thể Lực, Dầu Đèn, Bình Tâm) được gom gọn gàng vào thẻ bán trong suốt `statCardBg` ($308 \times 92$ px), thanh chỉ số thanh mảnh 9-10px, huy hiệu đèn lồng `[F] BẬT / TẮT` tích hợp ngay bên cạnh.
   - Khung bảng nhiệm vụ góc trên phải thu gọn kích thước ($340 \times 78$ px) với nền bán trong suốt và vạch nhấn vàng kim thanh lịch.
   - Cơ chế tự động ẩn HUD: `handleModalOpened()` tự động ẩn toàn bộ HUD (`setHUDVisible(false)`) khi bất kỳ Modal nào (`CraftingModal`, `JournalModal`, `PauseModal`, `GameOverModal`, `Dialogue`) mở ra; tự động phục hồi nguyên vẹn khi tất cả modal đóng lại, triệt tiêu 100% hiện tượng đè chữ.

### C4-13-09 — Tối Ưu Hóa 60 FPS, Dirty-Checking Toàn Diện, Ngăn Chặn Rò Rỉ Bộ Nhớ & Rà Soát 10 Hệ Thống Tiềm Ẩn
1. **Triệt tiêu toàn bộ cấp phát đối tượng động trong vòng lặp 60 FPS (Zero Allocations in Update):**
   - Loại bỏ triệt để các lệnh `new Graphics()`, `new Text()`, `new Array()` hay `new Vector2()` trong vòng lặp cập nhật mỗi frame của mọi hệ thống.
   - Tái sử dụng `cachedFootPos` và `cachedLanternPos` cho nhân vật Satyr.
2. **Cơ chế Dirty-Checking kép trên toàn bộ giao diện:**
   - `UIScene.setInteractionPrompt`: chỉ đo đạc văn bản và vẽ lại đồ họa nền khi chuỗi prompt thay đổi (`lastPromptText`), chỉ cập nhật alpha khi độ dời thay đổi đáng kể (`lastPromptAlpha`). Bỏ qua 100% thao tác vẽ lại vô ích khi đứng yên gần NPC/vật thể.
   - Thanh chỉ số sinh tồn (Máu, Thể Lực, Dầu Đèn, Bình Tâm), nhãn số lượng Quickslot (`lastPoulticeCount`, `lastOilCount`, `lastLureCount`) và bộ theo dõi nhiệm vụ (`lastQuestTitle`, `lastQuestTaskText`) đều áp dụng Dirty-Checking nghiêm ngặt.
3. **Cơ chế Object Pooling cho thông báo Popup (`showPopupMessage`):**
   - Tái sử dụng đối tượng `pooledPopupText` duy nhất, loại bỏ hoàn toàn việc cấp phát `new Text` và `destroy()` liên tục gây áp lực lên Garbage Collector.
4. **Dọn dẹp vòng đời đối tượng dứt điểm khi tắt Scene (Lifecycle Cleanup):**
   - Thêm phương thức `destroy()` đồng bộ cho 4 modal (`CraftingModal`, `JournalModal`, `PauseModal`, `GameOverModal`) và quái vật `TheListener`.
   - `GameScene` và `UIScene` dọn dẹp sạch sẽ toàn bộ mảng NPC, quái vật, nhân vật, graphics, tweens (`tweens.killAll()`), timers (`time.removeAllEvents()`) và bộ lắng nghe bàn phím khi `shutdown`.
5. **Rà soát chéo 10 hệ thống tiềm ẩn (10 Latent Systems Cross-Audit):**
   - Rà soát toàn diện: (1) Save/Load System, (2) Scene Transition, (3) Collision & Interaction, (4) Animation System, (5) Lighting System, (6) Entity AI, (7) Performance/FPS, (8) Audio System, (9) UI System, (10) Asset Management. Đạt 100% tiêu chuẩn chất lượng.

---

## 4. BẢNG KIỂM TRA CHẤT LƯỢNG (QA / QC MATRIX)

| Hạng mục kiểm tra | Bộ kiểm tra tự động | Kết quả | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Cơ chế ẩn nấp & gỡ kẹt (C4-13-01)** | `node scripts/verify_hiding_unstuck_c4_13_01.mjs` | 18/18 PASS | **ĐẠT (100%)** |
| **Hiển thị Rừng Sâu & Tán cây (C4-13-02)** | `node scripts/verify_deep_forest_visibility_c4_13_02.mjs` | 18/18 PASS | **ĐẠT (100%)** |
| **Quy trình Tử Vong & Game Over (C4-13-03)** | `node scripts/verify_death_and_game_over_c4_13_03.mjs` | 26/26 PASS | **ĐẠT (100%)** |
| **Hiển thị Đèn & Vung Gậy (C4-13-04)** | `node scripts/verify_lantern_and_attack_sync_c4_13_04.mjs` | 18/18 PASS | **ĐẠT (100%)** |
| **AI 5 Trạng Thái & Safe Zone (C4-13-05)** | `node scripts/verify_ai_and_safe_zone_c4_13_05.mjs` | 23/23 PASS | **ĐẠT (100%)** |
| **Đồ Họa & Sương Mù Đa Tầng (C4-13-06)** | `node scripts/verify_visual_improvements_c4_13_06.mjs` | 28/28 PASS | **ĐẠT (100%)** |
| **Giao diện Menu, HUD & Nhãn tương tác (C4-13-07)** | `node scripts/verify_ui_ux_redesign_c4_13_07.mjs` | 34/34 PASS | **ĐẠT (100%)** |
| **Thực thể NPC & Hoạt ảnh (C4-12-09)** | `node scripts/verify_npc_runtime_c4_12_09.mjs` | 56/56 PASS | **ĐẠT (100%)** |
| **Tối ưu Hiệu suất & Rà soát 10 hệ thống (C4-13-09)** | `node scripts/verify_performance_and_audit_c4_13_09.mjs` | 32/32 PASS | **ĐẠT (100%)** |
| **Kiểm thử luồng chơi xuyên suốt Act 0 - Act 1** | `node scripts/verify_full_game_flow_c4_12_31.mjs` | 80/80 PASS | **ĐẠT (100%)** |
| **Tổng hợp kiểm thử hồi quy toàn diện V1.3** | [07_Regression_Testing_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/07_Regression_Testing_Report.md) | 333/333 PASS | **ĐẠT (100%)** |
| **Kiểm tra biên dịch TypeScript** | `npx tsc --noEmit` | Mã thoát 0 | **ĐẠT (0 LỖI)** |
| **Đóng gói sản phẩm production** | `npm run build` | Mã thoát 0 | **ĐẠT (6.46s)** |
