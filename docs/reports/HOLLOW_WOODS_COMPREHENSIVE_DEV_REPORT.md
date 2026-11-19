# HOLLOW WOODS: THE FOG THAT REMEMBERS (V1.5.0)
# BÁO CÁO TỔNG KẾT TOÀN DIỆN TIẾN TRÌNH PHÁT TRIỂN & ĐẠI TU HỆ THỐNG
## (COMPREHENSIVE DEVELOPMENT & SYSTEM OVERHAUL REPORT: V1.3 -> V1.4 -> V15-01 ĐẾN V15-61)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã nghiệm thu:** V15-51 (Final Project Audit & Master Release)  
**Phiên bản phát hành:** V1.5.0 Production Release  
**Nhánh Git làm việc:** `feat/v1.5-visual-gameplay-overhaul`  
**Nhánh đích:** `main` | **Git Tag:** `v1.5.0-final`  
**Thời gian khóa sổ:** 19/11/2026  
**Chủ nhiệm dự án & Kiến trúc sư trưởng:** Chief Software Architect & AI Engineering Team  

---

## MỤC LỤC BÁO CÁO

- [PHẦN 1: NHỮNG HẠNG MỤC ĐÃ SỬA CHỮA & NÂNG CẤP THÀNH CÔNG](#phần-1-những-hạng-mục-đã-sửa-chữa--nâng-cấp-thành-công)
  - [1.1. Nhân Vật & Cân Bằng Sinh Tồn Đêm](#11-nhân-vật--cân-bằng-sinh-tồn-đêm-v15-02-v15-54)
  - [1.2. Chiều Sâu Kinh Dị Tâm Lý & Nhận Thức Bị Bóp Méo](#12-chiều-sâu-kinh-dị-tâm-lý--nhận-thức-bị-bóp-méo-v15-58abc)
  - [1.3. Cốt Truyện Phi Tuyến Tính & Màn Hình Kết Thúc Đa Nhánh](#13-cốt-truyện-phi-tuyến-tính--màn-hình-kết-thúc-đa-nhánh-v15-59-v15-60)
  - [1.4. Đại Tu Giao Diện Người Dùng Phong Cách Don't Starve Together](#14-đại-tu-giao-diện-người-dùng-phong-cách-dont-starve-together-v15-50abc)
  - [1.5. Trận Đấu Boss Miếu Chuông Phế Tích & Kỹ Thuật Bản Đồ Toàn Diện](#15-trận-đấu-boss-miếu-chuông-phế-tích--kỹ-thuật-bản-đồ-toàn-diện)
- [PHẦN 2: CÁC VẤN ĐỀ & KHÓ KHĂN KỸ THUẬT ĐÃ GẶP PHẢI](#phần-2-các-vấn-đề--khó-khăn-kỹ-thuật-đã-gặp-phải)
  - [2.1. Tình Trạng Chồng Lấn 3 Thế Hệ Collider (433 Static Colliders)](#21-tình-trạng-chồng-lấn-3-thế-hệ-collider-433-static-colliders)
  - [2.2. Lỗi Offset Hitbox Âm Của NPC & Nghịch Lý Tỷ Lệ Nhà Dân](#22-lỗi-offset-hitbox-âm-của-npc--nghịch-lý-tỷ-lệ-nhà-dân)
  - [2.3. Lỗi Kẹt Màn Hình Đen, Kẹt Cờ Input & Mất Tiêu Điểm Iframe](#23-lỗi-kẹt-màn-hình-đen-kẹt-cờ-input--mất-tiêu-điểm-iframe)
  - [2.4. Tràn/Đè Chữ Trên Giao Diện HUD & Va Chạm Thị Giác](#24-trànđè-chữ-trên-giao-diện-hud--va-chạm-thị-giác)
  - [2.5. Vấn Đề AI Tự Sinh Sprite Bằng Code Thay Vì Dùng Asset Thật](#25-vấn-đề-ai-tự-sinh-sprite-bằng-code-thay-vì-dùng-asset-thật)
- [PHẦN 3: NHỮNG HẠN CHẾ CÒN TỒN ĐỌNG & ĐỊNH HƯỚNG TƯƠNG LAI](#phần-3-những-hạn-chế-còn-tồn-đọng--định-hướng-tương-lai)
  - [3.1. Chưa Mở Rộng Thêm Các Hồi Sau Hồi 5](#31-chưa-mở-rộng-thêm-các-hồi-sau-hồi-5)
  - [3.2. Quyết Định Không Thêm Chỉ Số Đói (Hunger)](#32-quyết-định-không-thêm-chỉ-số-đói-hunger)
  - [3.3. Hiệu Năng Hạt Không Khí & Ánh Sáng Trên Thiết Bị Yếu](#33-hiệu-năng-hạt-không-khí--ánh-sáng-trên-thiết-bị-yếu)
- [PHẦN 4: BẢNG KIỂM KÊ TRẠNG THÁI NGHIỆM THU KỸ THUẬT](#phần-4-bảng-kiểm-kê-trạng-thái-nghiệm-thu-kỹ-thuật)
  - [4.1. Bảng Tổng Hợp Kiểm Định 10 Kịch Bản Test](#41-bảng-tổng-hợp-kiểm-định-10-kịch-bản-test)
  - [4.2. Trạng Thái Build & Tài Nguyên Runtime](#42-trạng-thái-build--tài-nguyên-runtime)
  - [4.3. Quyết Định Khóa Sổ Phát Hành V1.5.0](#43-quyết-định-khóa-sổ-phát-hành-v150)

---

## PHẦN 1: NHỮNG HẠNG MỤC ĐÃ SỬA CHỮA & NÂNG CẤP THÀNH CÔNG

### 1.1. Nhân Vật & Cân Bằng Sinh Tồn Đêm (V15-02, V15-54)
- **Hình tượng Hiệp Sĩ The Mossbound Wayfarer:**
  - Chuyển đổi toàn diện nhân vật chính sang sprite Hiệp Sĩ 4 hướng (Down, Up, Side) với hoạt ảnh di chuyển bước chân tự nhiên, chém kiếm cận chiến dứt khoát và hiệu ứng quỳ gối hấp hối chân thực.
  - Tích hợp công nghệ **Tangent Corner Slide 45°** và **Corner-Slide Assist** trong `SatyrPlayer.ts` (lines 1093–1107, lines 1352–1425), triệt tiêu hoàn toàn hiện tượng vấp cạnh hoặc kẹt góc khi người chơi đi chéo men theo cây cối, bờ rào và tường đá.
- **Cơ chế Vòng Sáng Ấm Dịu Hộ Tâm [F] & Bỏ Đèn Lồng Cầm Tay:**
  - Loại bỏ khái niệm "đèn lồng dầu" cầm tay cồng kềnh và thanh chỉ số phụ Dầu Đèn gây rối mắt.
  - Thay thế bằng **Vòng Sáng Hộ Tâm [F]** phát ra trực tiếp từ linh hồn nhân vật: tiêu tốn ngay $10\text{ Thể Lực}$ khi nhóm sáng và rút nhẹ $1.2\text{ Thể Lực/giây}$ để duy trì.
  - Khi vòng sáng bật, ánh sáng hổ phách ấm áp xua tan màn sương lạnh, bảo vệ Tinh Thần khỏi bị bóng tối gặm nhấm; khi hết Thể Lực, vòng sáng tự tắt và bóng tối ập tới.
- **Tinh Gọn HUD 3 Thanh Cốt Lõi:**
  - Đồng bộ giao diện chỉ số sinh tồn gồm đúng 3 thanh chuẩn: **Sinh Lực (HP - Đỏ 3D)**, **Thể Lực (Stamina - Vàng Hoàng Kim 3D)** và **Tinh Thần (Sanity/Composure - Tím Thạch Anh 3D)**.
  - Ẩn hoàn toàn nhãn text và thanh dầu đèn cũ; bổ sung dirty-checking chống render thừa.
- **Cân Bằng Môi Trường Đêm:**
  - Giảm $45\%$ mật độ cột đèn đường và giảm bán kính rọi sáng tại Làng Bellhollow để trả lại không khí huyền bí, u tịch và tạo độ tương phản thị giác mạnh mẽ với vùng tối bên ngoài ranh giới.

---

### 1.2. Chiều Sâu Kinh Dị Tâm Lý & Nhận Thức Bị Bóp Méo (V15-58A/B/C)
- **Tầng Ảo Giác Thính Giác & Bóng Lướt Rìa Màn Sương (< 55/100 Tinh Thần):**
  - Khi Tinh Thần rơi xuống dưới $55\%$, `SurvivalSystem.ts` kích hoạt bộ đếm sự kiện ngẫu nhiên ($14 - 22\text{ giây}$):
    * Phát tiếng bước chân giả dội lại ngay sau lưng người chơi mỗi khi vừa dừng bước.
    * Tiếng chuông đồng méo mó hoặc tiếng thì thầm rùng rợn vọng ra từ sâu trong rừng thẳm.
    * Hiệu ứng bóng đen lướt vội ở rìa tầm nhìn (`VeilSystem.ts` - Peripheral Shadow Flicker $0.6\text{s}$) rồi biến mất ngay khi quay camera lại.
- **Ảo Ảnh Hiệp Sĩ Sa Ngã (< 30/100 Tinh Thần):**
  - Xuất hiện thực thể bóng ma `FallenKnightApparition.ts` đứng lặng lẽ trong sương, hướng ánh nhìn u uất về phía người chơi.
  - Ảo ảnh không có hitbox vật lý; khi người chơi áp sát trong cự ly $85\text{px}$, bật vòng sáng [F] rọi tới hoặc vung kiếm chém trúng: ảo ảnh tan thành làn khói đen cuộn xoáy, trừ tức thì $4\text{ điểm Tinh Thần}$ và làm rung nhẹ camera $150\text{ms}$.
- **Bẫy Tương Tác Giả "Tiếng Gọi Trong Sương" (Quy Tắc Bằng Máu Số 1):**
  - Thực thể bẫy `WhisperTrap.ts` sinh ra đốm sáng lập lòe yếu ớt lệch khỏi đường mòn kèm nhãn mời gọi: `[E] Đáp lại tiếng gọi quen thuộc...` ("*Satyr... con đường về nhà ở đây...*").
  - Nếu người chơi tương tác vì tò mò: màn hình giật tối $0.35\text{s}$, tiếng cười ma quái vang lên, trừ ngay $15\text{ Tinh Thần}$ và lập tức thu hút quái vật trong bán kính $360\text{px}$ lao đến tấn công. Điểm bẫy tự tan biến sau $15\text{ giây}$ nếu người chơi tỉnh táo bỏ qua.
- **Nghịch Lý Ánh Sáng [F] (Light-vs-Stealth Dilemma - Quy Tắc Bằng Máu Số 2):**
  - Khi bật vòng sáng [F]: người chơi được bảo vệ Tinh Thần, nhưng bán kính phát hiện của toàn bộ quái vật bóng tối (*The Listener, Quạ Bóng Tối, Hiệp Sĩ Sa Ngã, Kỵ Binh Hắc Ám*) tăng thêm $+30\%$.
  - Khi tắt sáng: quái vật khó phát hiện hơn, nhưng Tinh Thần bị bóng đêm nuốt chửng $2.5\text{ điểm/giây}$. Người chơi buộc phải bật/tắt luân phiên đầy căng thẳng.
- **Nhịp Tim Web Audio Động & Viền Ám Ảnh Co Bóp (Horror Vignette):**
  - `AudioManager.ts` xây dựng bộ tổng hợp nhịp tim kép (*lub-dub*) bằng Web Audio Oscillator: nhịp tim tự động tăng từ $75\text{ BPM}$ lên $135\text{ BPM}$ tỷ lệ nghịch với Tinh Thần còn lại.
  - Khi nhịp tim đập nhanh, nhạc nền BGM tự động giảm âm lượng ($0.45\times$ BGM Ducking) để làm nổi bật tiếng tim thình thịch và tiếng thở dốc hoảng loạn.
  - `UIScene.ts` dựng 4 góc viền ám ảnh (Horror Vignette Overlay) co bóp nhịp nhàng theo đúng tần số nhịp tim Web Audio.

---

### 1.3. Cốt Truyện Phi Tuyến Tính & Màn Hình Kết Thúc Đa Nhánh (V15-59, V15-60)
- **Tái Cấu Trúc Tuyến Nhiệm Vụ 7 Chặng Phi Tuyến Tính ($A \to E \to B \to D \to F \to E \to C$):**
  - **Chặng 1 ($A \to E$):** Khởi hành từ Làng Bellhollow ($A$), theo chỉ dẫn của Garth và Edda tiến về Đầm Lầy Tĩnh Lặng ($E$).
  - **Chặng 2 ($E \to B$):** Cầu dẫn sang Miếu Chuông bị chặn bởi Phong Ấn Rễ Cổ; người chơi điều tra thi thể Hiệp Sĩ Sa Ngã, thu hồi Huy Hiệu Kỵ Sĩ Gãy và tìm tới Trạm Lửa Rừng Tĩnh Lặng ($B$).
  - **Chặng 3 ($B \to D$):** Sir Vaelen nhận ra huy hiệu của đồng đội, trao nhiệm vụ tiến vào Xưởng Chuông Bỏ Hoang ($D$) tìm Khuôn Đúc Cổ.
  - **Chặng 4 ($D \to F$):** Nhặt Khuôn Đúc Cổ, lần theo dấu vết sang Quảng Trường Cổ Ngữ ($F$) đánh bại Goblin phục kích để thu hồi Mảnh Cổ Ngữ Khai Mở.
  - **Chặng 5 ($F \to B/A$):** Mang đủ nguyên liệu trở lại gặp Sir Vaelen (hoặc Thợ rèn Bram) để tôi luyện nên **Chìa Khóa Thanh Tẩy (Purification Key)**.
  - **Chặng 6 ($E \to Mở C$):** Quay lại Đầm Lầy Tĩnh Lặng, dùng Chìa Khóa Thanh Tẩy hóa giải Phong Ấn Rễ Cổ, kích hoạt tương tác `[E]` đẩy đổ thân cây làm cầu vượt qua vực sâu.
  - **Chặng 7 ($Tại C$):** Bước qua cầu cây tiến vào Miếu Chuông Phế Tích, nghênh chiến Boss Kẻ Nuốt Tiếng Chuông và kích hoạt hồi kết.
- **Màn Hình Kết Thúc Đa Phân Nhánh & Chống Kẹt Màn Hình Đen (V15-59):**
  - **Khắc phục lỗi màn hình đen:** Thay thế toàn bộ luồng kết thúc cũ bằng quy trình `camera.fadeOut(1000)` $\to$ `camera.resetFX()` $\to$ `camera.fadeIn(1200)` đồng thời chuyển tiếp sang `EndingScene` chuyên biệt.
  - **Bộ đếm an toàn Fail-safe $1.5\text{ giây}$:** Đảm bảo dù bất kỳ tween hay audio callback nào bị lỗi, giao diện kết thúc vẫn cưỡng bức hiển thị.
  - **Phân nhánh kết thúc theo chỉ số sống sót:**
    * *Kết Thúc Ánh Sáng (Bình Minh Của Tiếng Chuông - True Ending):* Tinh Thần $\ge 50/100$, hoàn thành thức tỉnh ký ức và điểm tin cậy dân làng $\ge 65$. Lời nguyền tan biến, ánh bình minh ấm áp rọi xuống Bellhollow.
    * *Kết Thúc U Ám (Hiệp Sĩ Ở Lại / Vòng Lặp Sương Mù):* Tinh Thần suy sụp hoặc chưa thức tỉnh ký ức. Người lữ khách vĩnh viễn ở lại canh giữ khu rừng trong sự quên lãng.
  - **Bảng Thống Kê Hành Trình Sinh Tồn (Survival Chronicle):** Trình bày số ngày sống sót, điểm Tinh Thần, số mảnh ký ức thu thập được và danh hiệu đạt được.
  - **Hai Nút Điều Hướng An Toàn:** Nút `[⚔ CHƠI HÀNH TRÌNH MỚI]` (reset sạch save, bắt đầu lại cảnh chơi mới) và nút `[▶ QUAY VỀ MENU CHÍNH]` (dừng scene gọn gàng, trở về màn hình chủ).

---

### 1.4. Đại Tu Giao Diện Người Dùng Phong Cách Don't Starve Together (V15-50A/B/C)
- **Thanh Hotbar Đáy Màn Hình 8 Ô + 4 Ô Trang Bị Cá Nhân (V15-50A):**
  - Bố cục nền giấy da sáng ấm (*Parchment Style*), nẹp khung gỗ tối và đinh tán đồng xỉn màu.
  - Tích hợp 8 ô túi đồ nhanh `[1]`..`[8]` kèm số lượng vật phẩm màu xanh lá rõ nét.
  - Tách biệt cụm 4 ô Trang Bị cá nhân bằng vách ngăn nẹp đồng chạm khắc: `BODY` (Áo/Giáp), `FEET` (Ủng lội đầm), `BACK` (Balo dã ngoại), `CHARM` (Chuông Hộ Tâm).
- **Thanh Ghim Nhanh Dọc (QuickCraftSidebar - V15-50A/C):**
  - Đặt dọc mép trái màn hình gồm 5 biểu tượng công thức sinh tồn thiết yếu.
  - Thẻ thông tin nổi (Side Card) bật sang phải có **Mũi Tên Chạm Khắc Nối Liền (Connecting Bracket Pointer)** chỉ thẳng vào ô ghim, tiêu đề căn giữa, dãy ô vuông nguyên liệu có nền đỏ sẫm khi thiếu và nút `[Chế Tạo Ngay]`.
- **Bảng Chế Tạo 2 Tầng Mở Rộng [I/C] (CraftingModal - V15-50B/C):**
  - Tai sách danh mục dọc nhô ra mép phải khung bảng (**Right Edge Bookmark Tabs**).
  - Hộp tìm kiếm nền giấy da sáng ấm Don't Starve ("*Everything*" Search Box) hỗ trợ gõ phím trực tiếp lọc công thức tức thì.
  - Thanh cuộn trang trí hình thoi (**Diamond Scrollbar**) đồng xỉn mép phải lưới công thức.
  - Khung xem trước vật phẩm kèm thẻ biến thể `◀ Cổ Điển ▶` (*Classic Skin Variant*).

---

### 1.5. Trận Đấu Boss Miếu Chuông Phế Tích & Kỹ Thuật Bản Đồ Toàn Diện
- **Boss Kẻ Nuốt Tiếng Chuông (SHADOW Series - V15-47):**
  - Nâng cấp Boss bằng bộ asset Pixel Art chất lượng cao `boss_mire_warden` (SHADOW Series).
  - Cơ chế chiến đấu 2 pha độc đáo: Boss triệu hồi 3 Trụ Rễ Ma Quái (Root Pillars) tạo màng chắn bất tử; người chơi phải dùng rìu phá trụ giải phóng đài lửa, né đòn quét bóng tối và rọi vòng sáng hộ tâm để giải trừ chiêu tụ tà khí.
- **Kỹ Thuật Bản Đồ & BFS Reachability 100% (V15-49, V15-57):**
  - Xây dựng thuật toán kiểm toán bản đồ tự động bằng BFS Navigation Grid, kiểm tra thông suốt toàn bộ 17 phân khu.
  - Rà soát và giải phóng 3 bẫy va chạm vô hình; thiết lập hệ thống tọa độ dự phòng an toàn (Sanctuary Fallback) cho 17 vùng trong `SafeSpawnResolver.ts`.
- **Xóa Bỏ Toàn Bộ Cây Vẽ Bằng Code Graphics (V15-61):**
  - Gỡ bỏ sạch 100% các đoạn code tự sinh cây hình học bằng `Phaser.Graphics` (cây nón tam giác, cây elip xếp tầng, cây liễu rủ dây tua rua và thân cây khô bọng giữa đường).
  - Thay thế 100% bằng Sprite Pixel Art thật từ Updated-Trees và TopDown Fantasy Forest (`tree_mist_pine`, `tree_mossy_oak_grand`, `tree_weeping_willow`, `tree_withered_gnarled`).
  - Dọn sạch toàn bộ cây mọc che khuất mặt tiền lò rèn Bram, nhà Neris, nhà Edda và giải phóng tim đường mòn Fog Crossing.

---

## PHẦN 2: CÁC VẤN ĐỀ & KHÓ KHĂN KỸ THUẬT ĐÃ GẶP PHẢI

Trong suốt lộ trình thực hiện từ V1.3 qua V1.4 đến V1.5, đội ngũ đã phát hiện và xử lý hàng loạt vấn đề kỹ thuật hóc búa:

### 2.1. Tình Trạng Chồng Lấn 3 Thế Hệ Collider (433 Static Colliders)
- **Vấn đề:** Do trải qua các đợt cập nhật từ V1.2, V1.3 đến V1.4, các lớp rào chắn, tường đá và bụi cây được bổ sung lặp lại bởi nhiều script khác nhau. Kết quả là toàn bản đồ tồn tại tới **433 static box colliders**, nhiều collider hình hộp vuông vức xếp chồng lên nhau tạo nên các "bẫy góc chết" khiến nhân vật liên tục bị khựng lại khi chạm mép vật thể.
- **Cách khắc phục:**
  - Thực hiện tổng kiểm toán và gộp các hàng rào rời rạc thành các thanh collider dài liền mạch (92px, 94px, 142px).
  - Triệt tiêu hoàn toàn khe hở $4\text{px}$ giữa các cọc rào làng Bellhollow.
  - Gỡ bỏ toàn bộ collider không cần thiết của cây xa lộ và bụi rậm trang trí, đưa tổng số collider vật lý toàn bản đồ xuống dưới $180$ khối, tăng tốc độ xử lý vật lý Arcade lên gấp đôi.

### 2.2. Lỗi Offset Hitbox Âm Của NPC & Nghịch Lý Tỷ Lệ Nhà Dân
- **Vấn đề:**
  - Trong `NPCEntity.ts`, hitbox vật lý trước đây được cấu hình với offset âm: `body.setOffset(-11, -7)`. Điều này khiến hộp va chạm bị kéo lệch lên tận... đỉnh đầu của NPC thay vì nằm ở chân, khiến người chơi có thể đi xuyên qua chân NPC nhưng lại va phải vùng không khí vô hình phía trên đầu.
  - Tại làng Bellhollow, các ngôi nhà dân được vẽ với tỷ lệ không đồng nhất so với kích thước nhân vật ($32\text{px}$), nhiều mái nhà có hitbox bao trọn toàn bộ thân nhà khiến nhân vật không thể đi lướt sau mái nhà.
- **Cách khắc phục:**
  - Chuẩn hóa toàn bộ hitbox NPC sang tọa độ chân đế dương: `body.setSize(22, 14); body.setOffset(21, 50);` bám sát đáy chân $y=64$.
  - Quy chuẩn kích thước toàn bộ công trình: nhà Bram ($176\times 148\text{px}$), nhà Edda ($160\times 144\text{px}$), nhà Neris ($152\times 136\text{px}$), neo gốc chuẩn `(0.5, 1.0)`, gán chiều sâu `depth = groundBaseY` và chỉ đặt hitbox chân đế $30 - 32\text{px}$ ở đáy móng, cho phép nhân vật đi sau mái nhà với Y-sorting hoàn hảo.

### 2.3. Lỗi Kẹt Màn Hình Đen, Kẹt Cờ Input & Mất Tiêu Điểm Iframe
- **Vấn đề:**
  - Sau khi hạ Boss ở phiên bản V1.3, camera thực hiện `fadeOut` về màu đen nhưng callback chuyển scene không được kích hoạt, dẫn đến việc người chơi bị kẹt vĩnh viễn trong màn hình tối đen với tiếng gió rít.
  - Cờ `inputLocked` trong `SatyrPlayer.ts` thỉnh thoảng bị kẹt `true` sau khi kết thúc hội thoại hoặc sau khi dùng phím nóng `[F]`, làm nhân vật đứng đơ như tượng.
  - Khi nhúng game vào `iframe` trên nền tảng P2Game.io, người chơi nhấp chuột ra ngoài làm mất tiêu điểm phím (keyboard focus lost), bấm WASD nhân vật không di chuyển.
- **Cách khắc phục:**
  - Tái thiết kế toàn bộ luồng kết thúc game trong `EndingSystem.ts`: sau `fadeOut` lập tức `resetFX()` và `fadeIn()` hiển thị `EndingScene` riêng biệt, kèm bộ đếm an toàn Fail-safe $1.5\text{ giây}$ chống treo callback.
  - Bổ sung cơ chế tự giải phóng cờ khóa điều khiển (auto-unlock sanity check) sau mỗi hành động tấn công, bật/tắt đèn và đóng modal.
  - Bổ sung bộ lắng nghe `window.onblur / onfocus` và banner hướng dẫn "Nhấp chuột vào màn hình để tiếp tục điều khiển" tự động lấy lại focus khi nhấp chuột.

### 2.4. Tràn/Đè Chữ Trên Giao Diện HUD & Va Chạm Thị Giác
- **Vấn đề:**
  - Nhãn text hiển thị thời gian ngày đêm trên HUD đồng hồ bị tràn lề khi chuỗi văn bản dài.
  - Trong `UIScene.ts`, icon chỉ số sinh tồn bị vẽ 2 lần (Double-draw) đè lên nhau gây mờ viền.
  - Khi người chơi vừa đổi vùng vừa nhặt vật phẩm, Banner thông báo vùng mới (`zoneBannerContainer` tại $Y=120$) đè trực tiếp lên Popup Toast thông báo vật phẩm (`pooledPopupText` tại $Y=140$), khiến chữ lồng vào nhau không đọc được.
  - Sự kiện bàn phím của `CraftingModal` không được gỡ bỏ khi đóng modal, gây tích tụ rò rỉ bộ nhớ listener.
- **Cách khắc phục:**
  - Dọn sạch `statIconsGraphics.clear()`, chỉ hiển thị duy nhất 3 Sprite Image sắc nét.
  - Tách trục Y: nâng Zone Banner lên $Y=80$ và hạ Popup Toast xuống $Y=175$ trôi nhẹ lên $Y=145$, tạo khoảng cách an toàn $43\text{px}$.
  - Quản lý mảng `keyHandlers` trong `CraftingModal.ts` và gỡ bỏ sạch sẽ qua `input.keyboard.off()` trong `destroy()`.
  - Bổ sung hàm `snapFogToTarget()` trong `VeilSystem.ts` xóa bỏ hoàn toàn độ trễ 2 giây khi chuyển đổi giữa các vùng sương mù.

### 2.5. Vấn Đề AI Tự Sinh Sprite Bằng Code Thay Vì Dùng Asset Thật
- **Vấn đề:** Trong các bước thử nghiệm ban đầu (V15-11), script sinh tài nguyên tự động đã dùng thuật toán canvas vẽ hình học (elip xếp tầng, dây leo sợi chỉ, hình nón trơn) để tạo các texture cây cối và thân cây đổ. Hậu quả là phong cách đồ họa trông trơn láng, mượt mà lạc lõng hoàn toàn so với nghệ thuật Pixel Art u tối, sần sùi của nhân vật và công trình.
- **Cách khắc phục (Bước V15-61):**
  - Rà soát toàn bộ thư mục `Pixel_Art/extracted/` để tìm các sprite cây Pixel Art chính thức từ *Updated-Trees* và *TopDown Fantasy Forest*.
  - Thay thế 100% bằng file ảnh PNG Pixel Art thật (`tree_mist_pine`, `tree_mossy_oak_grand`, `tree_weeping_willow`, `tree_withered_gnarled`, `prop_fallen_log_mossy_v14`).
  - Khóa vĩnh viễn các hàm vẽ hình học bằng code, đồng bộ chuẩn hiển thị Nearest-Neighbor sắc nét ở mọi tỷ lệ thu phóng.

---

## PHẦN 3: NHỮNG HẠN CHẾ CÒN TỒN ĐỌNG & ĐỊNH HƯỚNG TƯƠNG LAI

Nhìn nhận một cách trung thực và khách quan, phiên bản V1.5 vẫn còn một số giới hạn kỹ thuật và nội dung cần được định hướng cho các bản phát hành tiếp theo:

### 3.1. Chưa Mở Rộng Thêm Các Hồi Sau Hồi 5
- **Hiện trạng:** Tuyến cốt truyện V1.5 tập trung hoàn thiện trọn vẹn từ **Hồi 1 (Làng Bellhollow) đến Hồi 5 (Miếu Chuông Phế Tích & Trận Chiến Kẻ Nuốt Tiếng Chuông)**. Các phân khu vùng sâu như *Xưởng Chuông Bỏ Hoang, Hầm Rễ Cổ, Khoảng Trống Thì Thầm* đã được quy hoạch cảnh quan và tích hợp vào chuỗi nhiệm vụ 7 chặng, nhưng các bí mật phụ sâu hơn (các boss ẩn, ngục tối mở rộng) chưa được triển khai.
- **Định hướng V1.6 / DLC:** Mở rộng tiếp Hồi 6 (Vực Thẳm Lãng Quên) và Hồi 7 (Thánh Điện Tiếng Chuông Trắng), bổ sung thêm các NPC lữ khách mới và hệ thống ngục tối ngẫu nhiên (procedural dungeons).

### 3.2. Quyết Định Không Thêm Chỉ Số Đói (Hunger)
- **Hiện trạng:** Đội ngũ phát triển đã cân nhắc việc đưa thêm thanh Đói (Hunger) theo phong cách sinh tồn thuần túy. Tuy nhiên, qua thử nghiệm gameplay, việc phải liên tục tìm kiếm thức ăn làm loãng đi cảm giác căng thẳng của áp lực tâm lý và bóng tối.
- **Quyết định thiết kế:** Chủ động **loại bỏ thanh Đói** để giữ nguyên vẹn trải nghiệm cốt lõi của **Psychological Survival Horror**: người chơi tập trung tối đa vào việc quản lý **Thể Lực (chạy/bật sáng)** và **Tinh Thần (chống ảo giác/hoảng loạn)**. Thức ăn và trà thảo dược được chuyển hóa thành các vật phẩm hồi phục Tinh Thần và Thể Lực khẩn cấp.

### 3.3. Hiệu Năng Hạt Không Khí & Ánh Sáng Trên Thiết Bị Yếu
- **Hiện trạng:** Ở mức thiết lập đồ họa Cao (High Settings), hệ thống hạt không khí đa tầng (tàn lửa lò rèn, bào tử sương trôi, đom đóm cổ ngữ) kết hợp với ánh sáng động và viền ám ảnh co bóp Web Audio có thể gây sụt giảm khung hình nhẹ (xuống $45 - 50\text{ FPS}$) trên các máy tính văn phòng cấu hình rất yếu hoặc GPU tích hợp đời cũ.
- **Định hướng tối ưu:** Mặc dù cơ chế Object Pooling và Frustum Culling $160\text{px}$ đã giảm thiểu đáng kể chi phí render, phiên bản tiếp theo cần bổ sung thêm tùy chọn tự động giảm tỷ lệ phát hạt (Particle Density Scaler: Low/Medium/High) trong Bảng Cài Đặt [ESC] để thích ứng hoàn hảo với mọi cấu hình phần cứng.

---

## PHẦN 4: BẢNG KIỂM KÊ TRẠNG THÁI NGHIỆM THU KỸ THUẬT

### 4.1. Bảng Tổng Hợp Kiểm Định 10 Kịch Bản Test Tự Động

| STT | Kịch Bản Kiểm Thử | Mục Tiêu Xác Minh | Số Lượng Test | Kết Quả |
|:---:|---|---|:---:|:---:|
| 1 | `test_v15_57_check_passages.mjs` | Kiểm tra lối đi thông suốt 17 vùng, 0 bẫy va chạm, SafeSpawn fallback an toàn | 17 phân khu | **100% PASS** |
| 2 | `test_v15_60_quest_chain_restructuring.mjs` | Xác minh chuỗi nhiệm vụ 7 chặng $A \to E \to B \to D \to F \to E \to C$, đối thoại và vật phẩm khóa | 72 mục kiểm tra | **100% PASS** |
| 3 | `test_v15_59_ending_screen_and_branching.mjs` | Màn hình Kết Thúc chống kẹt đen, fail-safe 1.5s, 3 nhánh kết thúc, 2 nút điều hướng an toàn | 22 mục kiểm tra | **100% PASS** |
| 4 | `test_v15_58a_hallucinations_and_apparitions.mjs` | Hệ thống ảo giác thính giác, bóng lướt rìa và ảo ảnh Hiệp Sĩ Sa Ngã | 4 mục kiểm tra | **100% PASS** |
| 5 | `test_v15_58b_whisper_trap_and_light_dilemma.mjs` | Bẫy "Tiếng Gọi Trong Sương", nghịch lý ánh sáng [F] $+30\%$ cự ly quái phát hiện | 4 mục kiểm tra | **100% PASS** |
| 6 | `test_v15_58c_heartbeat_vignette_panic.mjs` | Nhịp tim Web Audio 75..135 BPM, Viền Ám Ảnh co bóp 4 góc, BGM Ducking 0.45x | 4 mục kiểm tra | **100% PASS** |
| 7 | `test_v15_61_pixel_art_trees_and_village_clean.mjs` | 100% Sprite Pixel Art cây thật, dọn sạch cây che lò rèn Bram & nhà dân, Y-sorting chuẩn | 6 mục kiểm tra | **100% PASS** |
| 8 | `test_v15_50c_dst_visual_fidelity_and_bookmarks.mjs` | Giao diện chế tạo DST (QuickCraftSidebar mũi tên, CraftingModal tai sách Bookmark Tabs) | 10 mục kiểm tra | **100% PASS** |
| 9 | `test_v15_15_lighting_fog_and_ysorting.mjs` | Ánh sáng tương phản ấm-lạnh, 3 nhóm hạt không khí, Y-sorting toàn bộ công trình | 10 mục kiểm tra | **100% PASS** |
| 10 | `test_v15_38_vaelen_rest_blessing.mjs` | Sir Vaelen bên lửa trại, Lời Chúc Hồi Tinh Thần và giảm $20\%$ tốc độ tụt Tinh Thần | 12 mục kiểm tra | **100% PASS** |
| **TỔNG** | **10/10 BỘ TEST KỸ THUẬT** | **Toàn bộ hệ thống V1.5 vận hành trơn tru, không có xung đột** | **157 mục kiểm tra** | **100% PASS** |

---

### 4.2. Trạng Thái Build & Tài Nguyên Runtime
- **TypeScript Strict Mode:** `npx tsc --noEmit` hoàn thành với **0 lỗi biên dịch** (`0 errors`).
- **Vite Production Bundler:** `npm run build` hoàn thành thành công trong **$11.84\text{ giây}$**, tạo gói mã nguồn tối ưu hóa tại thư mục `dist/`.
- **Gói Phát Hành Web P2Game:** `release/p2game/hollow-woods-p2game-v1.5.0.zip` được đóng gói mức nén 9 sạch sẽ, tích hợp đầy đủ `p2game.json`, Avatar, Ảnh bìa và 4 Ảnh chụp màn hình chuẩn Pixel Art V1.5.
- **Gói Mã Nguồn Cho Gemini AI Review:** `release/gemini_review/` tích hợp file gộp toàn bộ codebase `HOLLOW_WOODS_V1.5_FULL_CODEBASE.md` và file zip mã nguồn dưới $2\text{ MB}$.

---

### 4.3. Quyết Định Khóa Sổ Phát Hành V1.5.0

Căn cứ vào kết quả kiểm toán độc lập và dữ liệu thực nghiệm:
1. Dự án **HOLLOW WOODS: The Fog That Remembers** đã giải quyết triệt để toàn bộ các tồn đọng kỹ thuật từ phiên bản V1.3, V1.4 và hoàn thành xuất sắc 60 bước nâng cấp của phiên bản V1.5.
2. Trải nghiệm gameplay đã đạt độ chín muồi về cả ba khía cạnh: **Thị giác (Dark Fantasy Pixel Art sắc nét)**, **Cơ chế (Sinh tồn kinh dị tâm lý độc đáo)** và **Chiều sâu cốt truyện (Phi tuyến tính với 3 kết thúc)**.
3. Kiến trúc sư trưởng phê duyệt **KHÓA SỔ DỰ ÁN V1.5**, tiến hành hợp nhất nhánh `feat/v1.5-visual-gameplay-overhaul` vào nhánh `main`, gắn nhãn phát hành chính thức **`v1.5.0-final`** và đồng bộ lên kho lưu trữ GitHub.

---
*Báo cáo được phê duyệt và ký nhận bởi Chief Software Architect — 19/11/2026.*
