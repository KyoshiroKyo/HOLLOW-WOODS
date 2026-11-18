# HOLLOW WOODS V1.5 — MỤC LỤC & LỘ TRÌNH NÂNG CẤP TOÀN DIỆN
## (COMPREHENSIVE VISUAL & GAMEPLAY OVERHAUL ROADMAP)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Phiên bản mục tiêu:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul` (Bảo vệ độc lập tuyệt đối nhánh `feat/v1.4-expansion` và bản phát hành V1.4)  
**Ngày khởi tạo:** 18/11/2026  

---

## 1. MỤC TIÊU CỐT LÕI V1.5

1. **Chuẩn hóa Va chạm & Di chuyển:**
   - Xóa bỏ tình trạng kẹt góc nhân vật (Corner Snagging) do hơn 430 static colliders hình hộp vuông vức trong `WorldBuilder.ts`.
   - Chuyển đổi hitbox chân nhân vật (`SatyrPlayer.ts` / `WayfarerPlayer.ts`) sang dạng capsule/circle mỏng gọn, trượt êm mượt men theo viền cây, đá và công trình.
2. **Chuẩn hóa Tỷ lệ Pixel Art (Asset Scale Harmonization):**
   - Rà soát toàn bộ tỷ lệ scale giữa Nhân vật, NPC, Quái vật, Nhà cửa và Cây cối.
   - Chấm dứt tình trạng lệch tỷ lệ thị giác (NPC cao ngang ngửa hoặc to hơn ngôi nhà/cây đại thụ).
3. **Cân Bằng Sinh Tồn & Tầm Nhìn Sương Mù:**
   - Hoàn thiện công thức tính Bình Tâm (Composure) trong `SurvivalSystem.ts`, chống tụt bất thường hoặc kẹt giá trị.
   - Thống nhất cơ chế bán kính tầm nhìn đèn lồng giữa `VeilSystem.ts`, `GameScene.ts` và `TimeSystem.ts`.
4. **Tối Ưu & Dọn Dẹp Giao Diện UIScene:**
   - Loại bỏ triệt để các phần tử HUD bị render trùng lặp, các nhãn text đè nhau và rò rỉ event listener khi chuyển vùng.

---

## 2. DANH MỤC TÀI LIỆU & BÁO CÁO KỸ THUẬT V1.5

| STT | Mã Báo Cáo | Tên Tài Liệu / Báo Cáo | Trạng Thái |
|:---:|:---|:---|:---:|
| 01 | `V15-01` | [01_System_And_Asset_Audit.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/01_System_And_Asset_Audit.md) — Rà soát toàn diện hệ thống di chuyển, va chạm, tỷ lệ asset và UI | Hoàn tất (Đã nghiệm thu) |
| 02 | `V15-02` | [02_Movement_And_Physics_Fix.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/02_Movement_And_Physics_Fix.md) — Sửa triệt để lỗi điều khiển, chuẩn hóa vận tốc và chống đơ phím nhân vật | Hoàn tất (Đã nghiệm thu) |
| 03 | `V15-03` | [03_Corner_Sliding_And_Map_Colliders.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Corner_Sliding_And_Map_Colliders.md) — Cơ chế trượt góc mượt mà Corner Sliding và tối ưu hóa hộp va chạm bản đồ | Hoàn tất (Đã nghiệm thu) |
| 04 | `V15-04` | [04_F9_Debug_Separation.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_F9_Debug_Separation.md) — Tách bảng kiểm tra kỹ thuật [F9] khỏi giao diện người chơi và tắt mặc định | Hoàn tất (Đã nghiệm thu) |
| 05 | `V15-05` | [03_Sanity_Vision_And_NightAI.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md) — Nâng cấp cơ chế Bình Tâm rút máu lũy tiến và sửa lỗi cảnh báo sai ban ngày | Hoàn tất (Đã nghiệm thu) |
| 06 | `V15-06` | [03_Sanity_Vision_And_NightAI.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md#5-bước-v15-06-thu-hẹp-tầm-nhìn-động--hiệu-ứng-thị-giác-u-ám) — Thu hẹp tầm nhìn động và hiệu ứng thị giác u ám khi Tinh thần xuống thấp | Hoàn tất (Đã nghiệm thu) |
| 07 | `V15-07` | [03_Sanity_Vision_And_NightAI.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md#7-bước-v15-07-hệ-số-hung-hãn-ban-đêm-night-aggression-multiplier) — Nâng cấp độ hung hăng của The Listener và Sói Xương khi màn đêm buông xuống | Hoàn tất (Đã nghiệm thu) |
| 08 | `V15-08` | [03_Sanity_Vision_And_NightAI.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/03_Sanity_Vision_And_NightAI.md#9-bước-v15-08-nâng-cấp-áp-lực-ban-đêm-cho-quạ-bóng-tối-bóng-mắt-và-nhóm-hiệp-sĩ-tà-ác) — Nâng cấp áp lực ban đêm cho Quạ Bóng Tối, Bóng Mắt và Nhóm Hiệp Sĩ Tà Ác | Hoàn tất (Đã nghiệm thu) |
| 09 | `V15-09` | [04_Graphics_And_World_Layout.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Chuẩn hóa quy chuẩn kích thước Pixel Art, điểm neo và bảng màu cho toàn bộ Nhân vật, NPC và Quái vật | Hoàn tất (Đã nghiệm thu) |
| 10 | `V15-10` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-10-thiết-kế--đại-tu-bộ-công-trình-kiến-trúc-làng-bellhollow](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Thiết kế & vẽ mới bộ công trình kiến trúc Làng Bellhollow sắc nét, đúng tỷ lệ Trung cổ u ám | Hoàn tất (Đã nghiệm thu) |
| 11 | `V15-11` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-11-nâng-cấp-đồ-họa-cây-cối-thảm-thực-vật--kết-cấu-mặt-đất-liền-mạch](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Nâng cấp đồ họa Cây cối, Thảm thực vật và Kết cấu mặt đất liền mạch | Hoàn tất (Đã nghiệm thu) |
| 12 | `V15-12` | [04_Graphics_And_World_Layout.md#báo-cáo-kỹ-thuật-v15-12-chuẩn-hóa-đồ-họa-vật-phẩm-trên-mặt-đất-đạo-cụ-khu-trại--nguồn-sáng-môi-trường](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/04_Graphics_And_World_Layout.md) — Chuẩn hóa đồ họa Vật phẩm trên mặt đất, Đạo cụ khu trại và Nguồn sáng môi trường | Hoàn tất (Đã nghiệm thu) |
| 13 | `V15-13` | *05_UI_Deduplication_And_HUD_Polishing.md* — Dọn dẹp trùng lặp và tối ưu hóa UIScene | Sắp tới |

---
*Tài liệu được cập nhật tự động trong suốt quá trình phát triển HOLLOW WOODS V1.5.*
