# HOLLOW WOODS V1.5 — MỤC LỤC & LỘ TRÌNH NÂNG CẤP TOÀN DIỆN
## (COMPREHENSIVE VISUAL & GAMEPLAY OVERHAUL ROADMAP)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Phiên bản mục tiêu:** V1.5.0 Production Release  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul` (Bảo vệ độc lập tuyệt đối nhánh `feat/v1.4-expansion` và bản phát hành V1.4)  
**Ngày khởi tạo:** 18/11/2026 | **Ngày nghiệm thu khóa sổ:** 19/11/2026  
**Trạng thái toàn bộ lộ trình:** **ĐÃ HOÀN THÀNH 100% (30/30 Bước Đã Nghiệm Thu)**

---

## 1. MỤC TIÊU CỐT LÕI ĐÃ ĐẠT ĐƯỢC Ở PHIÊN BẢN V1.5

1. **Chuẩn hóa Va chạm & Di chuyển (Movement & Corner Sliding):**
   - Xóa bỏ triệt để hiện tượng kẹt góc nhân vật (Corner Snagging) do hơn 430 static colliders hình hộp vuông vức trong `WorldBuilder.ts`.
   - Chuyển đổi hitbox chân nhân vật (`SatyrPlayer.ts` / `WayfarerPlayer.ts`) sang dạng capsule/circle $14 \times 8\text{px}$, trượt êm mượt 45° men theo viền cây, đá và công trình.
   - Triệt tiêu hoàn toàn quán tính trôi trượt (Zero Drift Friction) và xử lý triệt để xung đột bộ gõ tiếng Việt UniKey/EVKey.

2. **Cơ Chế Sinh Tồn & Áp Lực Đêm (Sanity & Night Horror):**
   - Hoàn thiện công thức tính Bình Tâm (Composure) trong `SurvivalSystem.ts`, bổ sung cơ chế rút máu lũy tiến 3 cấp độ (Cấp 1: 0.8 HP/s, Cấp 2: 1.8 HP/s, Cấp 3: 3.5 HP/s kèm nhịp tim đập dồn dập).
   - Tầm nhìn động thu hẹp mượt mà (Dynamic Vignette & Dark Tendril) khi Tinh thần suy kiệt.
   - Nâng cấp trí thông minh nhân tạo và hệ số hung hãn ban đêm (Night Aggression Multiplier $\times 1.4 \to \times 2.0$) cho 5 chủng quái vật (The Listener, Sói Xương, Quạ Bóng Tối, Bóng Mắt, Hiệp Sĩ Tha Hóa).

3. **Chuẩn Hóa Mỹ Thuật Pixel Art & Bố Cục Không Gian (Visual & World Layout):**
   - Quy chuẩn kích thước lưới Pixel Art $16\text{px}$, điểm neo chân thực và bảng màu Medieval Dark Fantasy u ám, sắc nét.
   - Vẽ mới toàn bộ bộ công trình làng Bellhollow (Tòa Thị Chính, Nhà Trưởng Thôn, Quán Trọ Sương Mù, Lò Rèn, Kho Chứa, Nhà Thảo Dược, Cối Xay Gió và Tháp Chuông Cổ).
   - Thiết kế kết cấu mặt đất 3 lớp liền mạch, thảm thực vật phong phú, đạo cụ khu trại chân thực và quy hoạch làng Bellhollow với các trục lộ rộng rãi, thoáng đãng.

4. **Chiều Sâu Cốt Truyện, Thức Tỉnh Ký Ức & 3 Kết Thúc (Story, Lore & Multiple Endings):**
   - Nâng cấp `DialogueSystem.ts` hỗ trợ lựa chọn phân nhánh, tác động trực tiếp đến Điểm Tin Cậy Dân Làng (Village Trust Score).
   - Mở rộng tuyến cốt truyện cá nhân và nhiệm vụ phụ sâu sắc cho 5 cư dân Bellhollow (Trưởng làng Morwen, Thợ săn Kael, Bà lão Elspeth, Cô bé Lily, Thợ rèn Orin).
   - Mở rộng hồi ức bi kịch Đoàn Kỵ Sĩ Cổ Xưa, Hiệp Sĩ Canh Lửa và hành trình thức tỉnh 4 giai đoạn của Hiệp Sĩ Đen.
   - Bổ sung 10 điểm Kể chuyện Môi trường (Environmental Storytelling) trên khắp bản đồ.
   - Thiết lập hệ thống 3 Kết Thúc Hoàn Chỉnh (Ending 1: Bình Minh Của Tiếng Chuông - True Ending, Ending 2: Người Canh Gác Vĩnh Hằng - Sacrifice Ending, Ending 3: Vòng Lặp Sương Mù - Bad Ending).

5. **Đại Tu Giao Diện Người Dùng Toàn Diện (UI/UX Overhaul):**
   - Màn hình Chờ (Loading Screen) nghệ thuật với đèn lồng đung đưa, tàn lửa bay và trích dẫn truyền thuyết.
   - Màn hình Menu Chính (MainMenuScene) dạng Animated Diorama 3 lớp chiều sâu và cụm thẻ gỗ Trung cổ uy nghiêm.
   - Bảng Cài Đặt đa năng (âm lượng mượt mà, toggles chống rung màn hình, xóa save an toàn 2 lớp) và Bảng Hướng Dẫn Điều Khiển thiết kế dạng thẻ phím 3D Keycaps trực quan.
   - Thanh công cụ đáy màn hình (HUD Toolbar) chuẩn hóa 8 ô cân đối, xóa bỏ nút trùng lặp.
   - Nhãn tên NPC thông minh (Smart NPC Nameplates) tự động hiển thị theo khoảng cách (95px) và khung hội thoại thiết kế parchment cổ điển.
   - Đồng bộ hóa thẩm mỹ Parchment & Tarnished Brass cho toàn bộ 5 Modal trong game kèm hệ thống Hộp Thông Tin Nổi (Item Tooltip Helper) chi tiết.

6. **Tối Ưu Hóa 60 FPS, Chống Rò Rỉ Bộ Nhớ & Tương Thích Save (Performance & QA):**
   - Kỹ thuật Frustum Culling biên an toàn $160\text{px}$ cho toàn bộ thực thể, công trình và hiệu ứng ngoài khung nhìn.
   - Triệt tiêu 100% rò rỉ Event Listener và Timer khi chuyển đổi màn hình hoặc nạp lại cảnh chơi.
   - Kiểm tra tương thích dữ liệu Save Manager đạt 100% qua 3 thế hệ (V1.3, V1.4, V1.5).
   - Đóng gói Production Build sạch sẽ, tối ưu đường dẫn tương đối, sẵn sàng cho web và P2Game.io.

---

## 2. DANH MỤC TÀI LIỆU & BÁO CÁO KỸ THUẬT V1.5

| STT | Mã Báo Cáo | Tên Tài Liệu / Báo Cáo Kỹ Thuật | Trạng Thái |
|:---:|:---|:---|:---:|
| 01 | `V15-01` | [01_System_And_Asset_Audit.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/01_System_And_Asset_Audit.md) — Rà soát toàn diện hệ thống di chuyển, va chạm, tỷ lệ asset và UI | Hoàn tất (Đã nghiệm thu) |
| 02 | `V15-02` | [02_Movement_And_Physics_Fix.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/02_Movement_And_Physics_Fix.md) — Sửa triệt để lỗi điều khiển, chuẩn hóa vận tốc và chống đơ phím nhân vật | Hoàn tất (Đã nghiệm thu) |
| 03 | `V15-03` | [03_Pixel_Scale_And_Village_Overhaul.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Pixel_Scale_And_Village_Overhaul.md) — Chuẩn hóa tỷ lệ Pixel Art, kiến trúc làng Bellhollow, sửa lỗi offset hitbox NPC & tinh gọn collider kèm Corner Sliding | Hoàn tất (Đã nghiệm thu) |
| 04 | `V15-04` | [04_F9_Debug_Separation.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_F9_Debug_Separation.md) — Tách bảng kiểm tra kỹ thuật [F9] khỏi giao diện người chơi và tắt mặc định | Hoàn tất (Đã nghiệm thu) |
| 05 | `V15-05` | [03_Sanity_Vision_And_NightAI.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md) — Nâng cấp cơ chế Bình Tâm rút máu lũy tiến và sửa lỗi cảnh báo sai ban ngày | Hoàn tất (Đã nghiệm thu) |
| 06 | `V15-06` | [03_Sanity_Vision_And_NightAI.md#5-bước-v15-06-thu-hẹp-tầm-nhìn-động--hiệu-ứng-thị-giác-u-ám](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md) — Thu hẹp tầm nhìn động và hiệu ứng thị giác u ám khi Tinh thần xuống thấp | Hoàn tất (Đã nghiệm thu) |
| 07 | `V15-07` | [03_Sanity_Vision_And_NightAI.md#7-bước-v15-07-hệ-số-hung-hãn-ban-đêm-night-aggression-multiplier](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md) — Nâng cấp độ hung hăng của The Listener và Sói Xương khi màn đêm buông xuống | Hoàn tất (Đã nghiệm thu) |
| 08 | `V15-08` | [03_Sanity_Vision_And_NightAI.md#9-bước-v15-08-nâng-cấp-áp-lực-ban-đêm-cho-quạ-bóng-tối-bóng-mắt-và-nhóm-hiệp-sĩ-tà-ác](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md) — Nâng cấp áp lực ban đêm cho Quạ Bóng Tối, Bóng Mắt và Nhóm Hiệp Sĩ Tà Ác | Hoàn tất (Đã nghiệm thu) |
| 09 | `V15-09` | [04_Graphics_And_World_Layout.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Chuẩn hóa quy chuẩn kích thước Pixel Art, điểm neo và bảng màu cho toàn bộ Nhân vật, NPC và Quái vật | Hoàn tất (Đã nghiệm thu) |
| 10 | `V15-10` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-10-thiết-kế--đại-tu-bộ-công-trình-kiến-trúc-làng-bellhollow](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Thiết kế & vẽ mới bộ công trình kiến trúc Làng Bellhollow sắc nét, đúng tỷ lệ Trung cổ u ám | Hoàn tất (Đã nghiệm thu) |
| 11 | `V15-11` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-11-nâng-cấp-đồ-họa-cây-cối-thảm-thực-vật--kết-cấu-mặt-đất-liền-mạch](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Nâng cấp đồ họa Cây cối, Thảm thực vật và Kết cấu mặt đất liền mạch | Hoàn tất (Đã nghiệm thu) |
| 12 | `V15-12` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-12-chuẩn-hóa-đồ-họa-vật-phẩm-trên-mặt-đất-đạo-cụ-khu-trại--nguồn-sáng-môi-trường](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Chuẩn hóa đồ họa Vật phẩm trên mặt đất, Đạo cụ khu trại và Nguồn sáng môi trường | Hoàn tất (Đã nghiệm thu) |
| 13 | `V15-13` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-13-quy-hoạch-lại-bố-cục-không-gian-làng-chuông-bellhollow-thoáng-đãng-hài-hòa--có-thẩm-mỹ](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Quy hoạch lại bố cục không gian Làng Chuông Bellhollow thoáng đãng, hài hòa & có thẩm mỹ | Hoàn tất (Đã nghiệm thu) |
| 14 | `V15-16` | [05_Story_Expansion_Report.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/05_Story_Expansion_Report.md) — Kiểm toán tính nhất quán cốt truyện hiện tại và nâng cấp DialogueSystem hỗ trợ Lựa chọn Hội thoại tương tác | Hoàn tất (Đã nghiệm thu) |
| 15 | `V15-17` | [05_Story_Expansion_Report.md#6-mở-rộng-tuyến-cốt-truyện-cá-nhân--nhiệm-vụ-phụ-5-dân-làng-bước-v15-17](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/05_Story_Expansion_Report.md) — Mở rộng tuyến cốt truyện cá nhân và nhiệm vụ phụ sâu sắc cho 5 dân làng Bellhollow | Hoàn tất (Đã nghiệm thu) |
| 16 | `V15-18` | [05_Story_Expansion_Report.md#9-bước-v15-18-bi-kịch-đoàn-kỵ-sĩ-cổ-xưa--lời-thề-hiệp-sĩ-canh-lửa](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/05_Story_Expansion_Report.md) — Mở rộng chiều sâu bi kịch Đoàn Kỵ Sĩ Cổ Xưa, Hiệp Sĩ Canh Lửa và quá trình thức tỉnh của Hiệp Sĩ Đen | Hoàn tất (Đã nghiệm thu) |
| 17 | `V15-19` | [05_Story_Expansion_Report.md#13-bước-v15-19-hệ-thống-kể-chuyện-môi-trường-environmental-storytelling](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/05_Story_Expansion_Report.md) — Bổ sung hệ thống Kể chuyện Môi trường (Environmental Storytelling) trên khắp các phân khu | Hoàn tất (Đã nghiệm thu) |
| 18 | `V15-20` | [05_Story_Expansion_Report.md#17-bước-v15-20-hệ-thống-3-kết-thúc-cốt-truyện-phân-nhánh-multiple-branching-endings](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/05_Story_Expansion_Report.md) — Thiết lập hệ thống 3 Kết Thúc Cốt Truyện (Multiple Endings) dựa trên hành trình của người chơi | Hoàn tất (Đã nghiệm thu) |
| 19 | `V15-21` | [06_Menu_And_HUD_UIUX.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Thiết kế mới toàn diện Màn hình Chờ / Loading Screen nghệ thuật trong PreloadScene | Hoàn tất (Đã nghiệm thu) |
| 20 | `V15-22` | [06_Menu_And_HUD_UIUX.md#báo-cáo-kỹ-thuật-v15-22-đại-tu-giao-diện-màn-hình-menu-chính-mainmenuscene](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Đại tu giao diện Màn hình Menu Chính (MainMenuScene.ts) với Animated Diorama và Thẻ Gỗ | Hoàn tất (Đã nghiệm thu) |
| 21 | `V15-23` | [06_Menu_And_HUD_UIUX.md#báo-cáo-kỹ-thuật-v15-23-nâng-cấp-giao-diện-các-bảng-cài-đặt-biên-niên-sử--hướng-dẫn-điều-khiển-trên-menu-chính-và-màn-hình-tạm-dừng-pause-modal](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Nâng cấp giao diện các bảng Cài Đặt, Biên Niên Sử & Hướng Dẫn Điều Khiển trên Menu Chính và Màn hình Tạm Dừng | Hoàn tất (Đã nghiệm thu) |
| 22 | `V15-24` | [06_Menu_And_HUD_UIUX.md#báo-cáo-kỹ-thuật-v15-24-làm-sạch-thanh-công-cụ-đáy-màn-hình-bị-lặp-nút-và-thiết-kế-lại-toàn-bộ-hud-chính-trong-uiscenets](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Làm sạch thanh công cụ đáy màn hình bị lặp nút và thiết kế lại toàn bộ HUD chính trong UIScene.ts | Hoàn tất (Đã nghiệm thu) |
| 23 | `V15-25` | [06_Menu_And_HUD_UIUX.md#báo-cáo-kỹ-thuật-v15-25-tối-ưu-hóa-nhãn-tên-npc-thông-minh-theo-khoảng-cách-và-nâng-cấp-khung-hội-thoại-trong-gamescenets-npcentityts-dialoguesystemts](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Tối ưu hóa Nhãn tên NPC thông minh theo khoảng cách và nâng cấp Khung Hội thoại | Hoàn tất (Đã nghiệm thu) |
| 24 | `V15-26` | [06_Menu_And_HUD_UIUX.md#báo-cáo-kỹ-thuật-v15-26-đồng-bộ-hóa-thẩm-mỹ-cho-bảng-hành-trang--trang-bị-bàn-chế-tạo-rương-gỗ-và-sổ-tay-nhật-ký](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/06_Menu_And_HUD_UIUX.md) — Đồng bộ hóa thẩm mỹ cho Bảng Hành Trang & Trang Bị, Bàn Chế Tạo, Rương Gỗ và Sổ Tay Nhật Ký | Hoàn tất (Đã nghiệm thu) |
| 25 | `V15-27` | [07_Performance_And_QA_Verification.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/07_Performance_And_QA_Verification.md) — Tối ưu hóa tốc độ khung hình 60 FPS, culling 160px, rà soát rò rỉ bộ nhớ và kiểm tra tương thích Save | Hoàn tất (Đã nghiệm thu) |
| 26 | `V15-28` | [08_V15_Total_Overhaul_Final_Report.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/08_V15_Total_Overhaul_Final_Report.md) — Khóa sổ bản dựng phát hành Production Build và Báo Cáo Tổng Kết Nâng Cấp Toàn Diện HOLLOW WOODS V1.5 | Hoàn tất (Đã nghiệm thu) |
| 27 | `V15-29` | [09_Admin_Debug_F9_And_Interaction_Outline.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/09_Admin_Debug_F9_And_Interaction_Outline.md) — Giữ lại khung chữ nhật trắng 4 góc cho chế độ Debug Admin [F9] và chuẩn hóa hiệu ứng Viền Sáng Tương Tác cho người chơi thường | Hoàn tất (Đã nghiệm thu) |
| 28 | `V15-30` | [10_Torn_Page_Modal_And_World_Parchment.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/10_Torn_Page_Modal_And_World_Parchment.md) — Thay thế thông báo nổi bằng Giao diện Trang Giấy Cổ Tương Tác (Torn Page Modal), lật trang, âm thanh sột soạt, tự đóng băng quái vật và đổi trạng thái prompt trên tường | Hoàn tất (Đã nghiệm thu) |
| 29 | `V15-31` | [11_Sir_Vaelen_And_Bonfire_Outpost.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/11_Sir_Vaelen_And_Bonfire_Outpost.md) — Sửa lỗi nhầm asset Garth, gắn đúng sprite 2D_SL_Knight cho Sir Vaelen — Kỵ Sĩ Trầm Mặc và di dời ra Trạm Lửa Rừng Tĩnh Lặng ngoài Bellhollow | Hoàn tất (Đã nghiệm thu) |
| 30 | `V15-32` | [12_Peaceful_Dialogue_And_Black_Knight_Signoff.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/12_Peaceful_Dialogue_And_Black_Knight_Signoff.md) — Lời thoại bình yên bên đốm lửa của Sir Vaelen, đồng bộ 3 nhiệm vụ tiến trình, đại thức tỉnh Hiệp Sĩ Đen và khóa sổ hoàn tất V1.5 | Hoàn tất (Đã nghiệm thu) |
| 31 | `V15-33` | [13_Paper_Note_Modal_And_Signpost_Overhaul.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/13_Paper_Note_Modal_And_Signpost_Overhaul.md) — Chuyển đổi toàn bộ thông báo chữ xanh sang mở Mẩu Giấy Cổ tương tác giữa màn hình (4 Theme: Signpost, Notice, Stele, Parchment) | Hoàn tất (Đã nghiệm thu) |
| 32 | `V15-34` | [14_Safe_Spawn_And_Unstuck_Resolver.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/14_Safe_Spawn_And_Unstuck_Resolver.md) — Hệ thống an toàn vị trí nạp Save (SafeSpawnResolver), khắc phục triệt để lỗi kẹt cổng sắt/vật cản lớn, reset sạch cờ ẩn nấp và nút Gỡ Kẹt khẩn cấp [F8] | Hoàn tất (Đã nghiệm thu) |
| 33 | `V15-35` | [docs/FOLDER_STRUCTURE_RULES.md](file:///g:/HOLLOW%20WOODS/docs/FOLDER_STRUCTURE_RULES.md) — Quy hoạch, dọn dẹp và sắp xếp lại toàn bộ cây thư mục gốc theo chuẩn hóa (di chuyển toàn bộ file .md, .rar, .zip và thư mục backup vào docs/, release/, Backups/, cập nhật .gitignore) | Hoàn tất (Đã nghiệm thu) |
| 34 | `V15-36` | [15_Final_V15_Release_Report.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/15_Final_V15_Release_Report.md) / [FINAL_V1.5_RELEASE_REPORT.md](file:///g:/HOLLOW%20WOODS/docs/reports/FINAL_V1.5_RELEASE_REPORT.md) — Đóng gói mã nguồn tinh gọn chuẩn AI-Readable cho Gemini (< 2 MB) và xuất bản bản chạy P2Game V1.5.0 chính thức | Hoàn tất (Đã nghiệm thu) |
| 35 | `V15-49` | [49_Map_Reachability_BFS_And_Asset_Audit.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/49_Map_Reachability_BFS_And_Asset_Audit.md) — Kiểm toán tự động khả năng di chuyển toàn bộ bản đồ bằng thuật toán BFS Navigation Grid, tối ưu hóa Static Colliders và rà soát 100% asset thực thể | Hoàn tất (Đã nghiệm thu) |
| 36 | `V15-50` | [50_Bottom_Bar_And_Vertical_Taskbar_Redesign.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/50_Bottom_Bar_And_Vertical_Taskbar_Redesign.md) — Tái thiết kế toàn bộ thanh Túi Đồ & Trang Bị đáy và Taskbar biểu tượng dọc theo phong cách Don't Starve | Hoàn tất (Đã nghiệm thu) |
| 37 | `V15-50A` | [50A_Parchment_Hotbar_And_Quick_Craft_Sidebar.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/50A_Parchment_Hotbar_And_Quick_Craft_Sidebar.md) — Thanh Túi Đồ 8 ô nền giấy da sáng ấm + 4 ô Trang Bị và Thanh Ghim Nhanh Dọc theo phong cách Don't Starve Together | Hoàn tất (Đã nghiệm thu) |

---

## 3. CÁCH KHỞI CHẠY BẢN PHÁT HÀNH V1.5 PRODUCTION BUILD

### 3.1. Chạy trên môi trường phát triển (Dev Mode):
```bash
npm run dev
# Mở trình duyệt tại http://localhost:8080/
```

### 3.2. Chạy thử nghiệm bản dựng phát hành (Production Preview):
```bash
npm run preview
# Phục vụ thư mục dist/ đã đóng gói sạch sẽ
```

### 3.3. Kiểm thử tự động tính tương thích & Logic:
```bash
node scripts/verify_v15_27_performance_and_save_compatibility.mjs
# Xác nhận 49/49 bài kiểm tra kỹ thuật đạt PASS

node scripts/verify_v15_29_debug_boxes_and_outline.mjs
# Xác nhận 22/22 bài kiểm tra kỹ thuật đạt PASS

node scripts/test_v15_34_safe_spawn_and_unstuck.mjs
# Xác nhận 5/5 bài kiểm tra kỹ thuật SafeSpawn và Unstuck đạt PASS 100%
```

---
*Tài liệu được cập nhật tự động và đóng dấu hoàn thành trọn vẹn tại bước V15-36 — 19/11/2026.*
