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
| 03 | `V15-03` | *03_Visual_Scale_And_Sprite_Harmonization.md* — Chuẩn hóa tỷ lệ sprite nhân vật, NPC và công trình | Sắp tới |
| 04 | `V15-04` | *04_Survival_Composure_And_Vision_Tuning.md* — Tinh chỉnh Bình Tâm và tầm nhìn sương mù | Sắp tới |
| 05 | `V15-05` | *05_UI_Deduplication_And_HUD_Polishing.md* — Dọn dẹp trùng lặp và tối ưu hóa UIScene | Sắp tới |

---
*Tài liệu được cập nhật tự động trong suốt quá trình phát triển HOLLOW WOODS V1.5.*
