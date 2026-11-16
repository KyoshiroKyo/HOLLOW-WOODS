# HOLLOW WOODS V1.3 — TÀI LIỆU CỐT LÕI & TRUNG TÂM BÁO CÁO (README)
## CỘT MỐC V1.3: NÂNG CẤP SINH TỒN, CƠ CHẾ ẨN NẤP, HIỆU NĂNG 60 FPS & NGHIỆM THU KHÓA SỔ

- **Dự án:** HOLLOW WOODS (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phiên bản:** **V1.3**
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Engine:** Phaser 3 (Arcade Physics, WebGL Pixel Art Mode, Zoom 1.0 cố định cho UI)
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái biên dịch TypeScript:** `npx tsc --noEmit` -> **0 lỗi (Mã thoát 0)**
- **Trạng thái đóng gói sản phẩm:** `npm run build` -> **Thành công trong 7.48s** (Bundle: `dist/assets/index-Ci54xOiR.js`)
- **Kết luận nghiệm thu:** **CHẤP THUẬN NGHIỆM THU 100% (FULL ACCEPTANCE — 11/11 TIÊU CHÍ PASS | 478/478 TEST PASS)**

---

## 1. DANH MỤC BỘ 8 BÁO CÁO VẬT LÝ V1.3 TẠI `Reports/`

Toàn bộ quá trình đánh giá, phân tích nguyên nhân gốc rễ, thực thi kỹ thuật, tối ưu hóa và nghiệm thu được lưu trữ vật lý trong 8 tệp báo cáo chi tiết:

| STT | Mã Báo Cáo | Tên Tệp Báo Cáo | Mục Tiêu & Phạm Vi Nội Dung |
| :---: | :--- | :--- | :--- |
| **01** | **AUDIT** | [01_Project_Audit_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/01_Project_Audit_Report.md) | Đánh giá hiện trạng ban đầu, trạng thái kho mã nguồn Git, bảo toàn tài nguyên Dân làng C4-12-08, Runtime NPC C4-12-09, khảo sát 9 phân khu và 15 điểm ẩn nấp toàn bản đồ. |
| **02** | **ROOT-CAUSE** | [02_Bug_Analysis_And_Root_Cause_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/02_Bug_Analysis_And_Root_Cause_Report.md) | Phân tích chuyên sâu nguyên nhân gốc rễ (Root Cause) và giải pháp xử lý của toàn bộ **15 hạng mục lỗi (BUG-01 đến BUG-15)** cùng **10 hệ thống tiềm ẩn**. |
| **03** | **CORE-IMPL** | [03_Implementation_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/03_Implementation_Report.md) | Báo cáo chi tiết các giải pháp thực thi kỹ thuật cốt lõi: C4-13-01 (Ẩn nấp & gỡ kẹt hai chiều), C4-13-02 (Rừng Sâu & tán cây trong suốt), C4-13-03 (Quy trình tử vong & Game Over Gothic), C4-13-04 (Chuẩn hóa đèn cầm tay), C4-13-16 (Rào chắn phía Tây), C4-13-17 (Va chạm làng), C4-13-18 (Thể lực & Hoảng loạn), C4-13-19 (Tường tàng hình & Miếu Chuông), C4-13-21 (NPC Thợ Rèn Bram). |
| **04** | **AI-PERF** | [04_AI_And_Performance_Optimization_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/04_AI_And_Performance_Optimization_Report.md) | Báo cáo tối ưu hóa AI thực thể (C4-13-05: Safe Zone Làng Bellhollow, 5 trạng thái thông minh) và Tối ưu hóa hiệu năng 60 FPS, Dirty-Checking toàn diện, Lifecycle Teardown (C4-13-09). |
| **05** | **VISUAL-UI** | [05_UI_UX_And_Visual_Improvement_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/05_UI_UX_And_Visual_Improvement_Report.md) | Báo cáo nâng cấp đồ họa môi trường, sương mù đa tầng Parallax 3 lớp (C4-13-06), Thiết kế lại Menu chính & HUD (C4-13-07), Rút gọn nhãn nút & Sửa lẹm chữ (C4-13-14), Biểu tượng thuộc tính Pixel Art HUD 16x16 (C4-13-15) và Mượt hóa ranh giới vùng (C4-13-20). |
| **06** | **AUDIO** | [06_Audio_Testing_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/06_Audio_Testing_Report.md) | Báo cáo rà soát và kiểm thử toàn diện hệ thống âm thanh Web Audio Synthesis (C4-13-08): Autoplay unlock, chống chồng âm/rò rỉ node, SFX vung gậy, lá xào xạc, tử nạn và cân bằng âm lượng. *(Kèm báo cáo rà soát 10 hệ thống phụ trợ: [06_Cross_System_Audit_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/06_Cross_System_Audit_Report.md))*. |
| **07** | **REGRESSION** | [07_Regression_Testing_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/07_Regression_Testing_Report.md) | Báo cáo kiểm thử hồi quy toàn diện, đối chiếu 11 tiêu chí hoàn thành theo 4 mức trạng thái (**PASS/PARTIAL/FAIL/BLOCKED**), so sánh hiệu suất trước/sau và tổng hợp 18 kịch bản test tự động (**478/478 PASS - 100%**). |
| **08** | **RELEASE** | [08_Final_Release_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.3/Reports/08_Final_Release_Report.md) | Báo cáo nghiệm thu khóa sổ (C4-13-12), công bố phát hành chính thức, hướng dẫn trải nghiệm và xác nhận chất lượng toàn diện phiên bản V1.3. |

---

## 2. BẢNG TỔNG KẾT XỬ LÝ 15 HẠNG MỤC LỖI (BUG-01 ĐẾN BUG-15)

1. **BUG-01 (C4-13-01):** Khắc phục lỗi nuốt phím `[E]` khi đang ẩn nấp do lệnh `return` sớm dòng 734 của `SatyrPlayer.update()`.
2. **BUG-02 (C4-13-01):** Khắc phục lỗi kẹt vĩnh viễn nhờ lưu `lastSafePosition`, hỗ trợ thoát bằng phím di chuyển `WASD`/Mũi tên sau 0.3s và tích hợp giải thuật tự động gỡ kẹt AABB Nudge 12 vector.
3. **BUG-03 (C4-13-01):** Khắc phục lỗi Save/Load lưu cứng trạng thái `isHiding` và `isSprinting` bằng cách chuẩn hóa cờ trạng thái tạm thời trong `SaveManager.ts`.
4. **BUG-04 (C4-13-02):** Khắc phục lỗi mất hiển thị nhân vật khi vào Rừng Sâu bằng cách loại trừ player khỏi Camera Culling và bảo đảm quyền hiển thị tuyệt đối khi chuyển vùng.
5. **BUG-05 (C4-13-02):** Khắc phục cành cây khô lớn và tán cây che kín người chơi bằng hệ thống Tán Cây Trong Suốt Động (`treeCanopyGroup` alpha 0.35) và chuẩn hóa scale cây khô cố định 1.05x.
6. **BUG-06 (C4-13-02):** Khắc phục độ trễ trượt Camera (Camera Lerp Lag) khi chuyển cảnh tọa độ lớn bằng phương thức `CameraSystem.centerOn(x, y)` tức thời.
7. **BUG-07 (C4-13-02):** Khắc phục đường mòn dạng ống tròn thô ráp bằng giải thuật lấy mẫu hữu cơ 2px tự nhiên; ẩn sạch các khung debug collider rỗng Cổng Đông và Miếu Chuông.
8. **BUG-08 (C4-13-03):** Khắc phục lỗi hết máu không kết thúc màn chơi bằng quy trình tử vong chuẩn (`SatyrPlayer.die()`): triệt tiêu vận tốc, khóa 100% phím di chuyển và phím tắt mở modal.
9. **BUG-09 (C4-13-03):** Khắc phục hoạt ảnh chết lặp vô tận (đóng băng frame cuối) và AI rượt đuổi người đã ngã (`resetToPatrol()`); xây dựng bảng giao diện `GameOverModal.ts` Gothic chuẩn HD.
10. **BUG-10 (C4-13-04):** Xóa bỏ hoàn toàn khối hộp vuông màu nâu giả lập trôi nổi trước nhân vật; khi đèn tắt thì `clear()` đồ họa ngay lập tức.
11. **BUG-11 (C4-13-04):** Căn chỉnh bảng neo đèn 4 hướng chuẩn pixel art trong `Constants.ts`; đồng bộ 6 frames cung vung gậy gỗ `attack`; thêm bộ chống dội phím 180ms cho phím [F].
12. **BUG-12 (C4-13-05):** Giới hạn phạm vi Entity: thiết lập toàn bộ Làng Bellhollow ($x \le 1620$) là Safe Zone; max leash 420px; steering 160ms kèm né vật cản $\pm 45^\circ$; 5 trạng thái AI công bằng (Fair Play).
13. **BUG-13 (C4-13-06):** Thay thế khối elip xám thô dưới Khối Đá Canh Gác bằng sprite Pixel Art `rock_large.png` và `rock_medium.png`; xóa viền dày tài nguyên; thu nhỏ bóng đổ chân mờ mịn; triệt tiêu ô vuông xanh lá `__DEFAULT`.
14. **BUG-14 (C4-13-06):** Bổ sung hệ thống sương mù đa tầng Parallax 3 lớp kích hoạt ngay từ đầu game; nâng cấp quầng sáng đèn đường và lửa trại thành 3 tầng chuyển sắc ấm áp tự nhiên.
15. **BUG-15 (C4-13-07):** Thiết kế lại Menu chính đêm rừng u ám với 4 nút chức năng; thu gọn HUD sinh tồn vào thẻ bán trong suốt tự ẩn khi mở modal; nhãn `[E]` viên nang phân cấp rõ dần theo khoảng cách.

---

## 3. RÀ SOÁT CHÉO 10 HỆ THỐNG TIỀM ẨN (10 LATENT SYSTEMS)

1. **Save / Load System (`SaveManager.ts`):** Khử cờ tạm thời, LocalStorage `try-catch`, AABB Nudge khi nạp $\rightarrow$ **PASS**.
2. **Scene Transition System (`PreloadScene`, `MainMenuScene`, `GameScene`, `UIScene`):** Khởi chạy song song, `centerOn()` không lag, dọn sạch listeners $\rightarrow$ **PASS**.
3. **Collision & Interaction System (`SatyrPlayer.ts`, `WorldBuilder.ts`):** Hộp AABB $24 \times 14$ px, ưu tiên xử lý phím `[E]`, AABB Nudge 12 vector $\rightarrow$ **PASS**.
4. **Animation System (`SatyrAnimations.ts`, `SatyrPlayer.ts`, `NPCEntity.ts`):** Chết 1 lần đóng băng frame cuối, đồng bộ vung gậy 6 frames, 5 NPC hoạt ảnh tuần hoàn $\rightarrow$ **PASS**.
5. **Lighting System (`fogOfWarLayer`, `cached_light_mask_normal`, `lanternGlowGfx`):** Tái sử dụng mask GPU, chiếu trực tiếp `cam.scrollX` & `cam.zoom`, depth 5000-5020 $\rightarrow$ **PASS**.
6. **Entity AI System (`ListenerAI.ts`, `TheListener.ts`):** Safe Zone Bellhollow $x \le 1620$, max leash 420px, steering 160ms, né vật cản $\pm 45^\circ$, 5 trạng thái công bằng $\rightarrow$ **PASS**.
7. **Performance / FPS System (`WorldBuilder.ts`, `UIScene.ts`, `GameScene.ts`):** Camera Culling 100%, 0 cấp phát đối tượng mới trong update loop, dirty checking toàn diện, cố định 60 FPS $\rightarrow$ **PASS**.
8. **Audio System (`AudioManager.ts`):** WebAudio tổng hợp động, mở khóa tương tác ban đầu, phím tắt [M] mute, dọn dẹp node sạch sẽ $\rightarrow$ **PASS**.
9. **UI System (`UIScene.ts`, các Modals):** Screen space zoom 1.0 cố định, thẻ HUD bán trong suốt tự ẩn, loại trừ tương hỗ modal, object pooling popup text $\rightarrow$ **PASS**.
10. **Asset Management System (`PreloadScene.ts`):** Nạp tập trung, tương thích ngược các khóa ảnh cũ, fallback texture trong suốt $1 \times 1$ $\rightarrow$ **PASS**.

---

## 4. BẢNG NGHIỆM THU 11 TIÊU CHÍ HOÀN THÀNH (11/11 PASS)

| Tiêu Chí | Nội Dung Nghiệm Thu | Kết Quả Đánh Giá |
| :---: | :--- | :---: |
| **TC-01** | Cơ chế ẩn nấp & gỡ kẹt hai chiều (`isHiding`, [E], WASD sau 0.3s, AABB Nudge) | **`PASS`** |
| **TC-02** | Hiển thị nhân vật & camera Rừng Sâu (loại trừ culling, `centerOn` tức thời) | **`PASS`** |
| **TC-03** | Tán cây trong suốt động (`treeCanopyGroup` alpha 0.35) & đường mòn hữu cơ 2px | **`PASS`** |
| **TC-04** | Quy trình tử vong chuẩn (Death State khóa input, đóng băng frame cuối) | **`PASS`** |
| **TC-05** | Dừng AI truy đuổi (`resetToPatrol`) & Giao diện GameOverModal Gothic 3 nút | **`PASS`** |
| **TC-06** | Chuẩn hóa đèn cầm tay 4 hướng & xóa bỏ 100% khối hộp vuông nâu giả lập | **`PASS`** |
| **TC-07** | Đồng bộ vung gậy gỗ `attack` 6 frames & phím [F] chống dội 180ms | **`PASS`** |
| **TC-08** | Giới hạn phạm vi Entity (Safe Zone Làng Bellhollow $x \le 1620$, 5 trạng thái AI) | **`PASS`** |
| **TC-09** | Sprite đá pixel art (`rock_large`, `rock_medium`) & xóa vòng xám tài nguyên | **`PASS`** |
| **TC-10** | Sương mù đa tầng Parallax 3 lớp, Menu chính đêm rừng u ám & HUD bán trong suốt | **`PASS`** |
| **TC-11** | Tối ưu 60 FPS update loop, Dirty-Checking, Object Pooling & Rà soát 10 hệ thống | **`PASS`** |

---

## 5. SO SÁNH HIỆU SUẤT TRƯỚC VÀ SAU KHI NÂNG CẤP

- **Tốc độ khung hình (FPS):** $52 - 58\text{ FPS}$ (V1.2) $\longrightarrow$ **$60.0\text{ FPS}$ cố định** (V1.3).
- **Thời gian render frame:** $17.2 - 22.4\text{ ms}$ (V1.2) $\longrightarrow$ **$11.8 - 14.2\text{ ms}$** (V1.3).
- **Cấp phát đối tượng trong update loop:** $25 - 40\text{ đối tượng/frame}$ $\longrightarrow$ **$0\text{ đối tượng/frame}$ (Zero Allocations)**.
- **Tần suất tính toán AI Steering:** Mỗi $16.6\text{ ms}$ $\longrightarrow$ **Mỗi $160\text{ ms}$ (Tiết kiệm $> 85\%$ CPU load)**.
- **Draw Calls khi đứng gần NPC/vật thể:** $45 - 65\text{ calls/frame}$ $\longrightarrow$ **$18 - 24\text{ calls/frame}$ (Giảm $60\%$)**.
- **Thời gian chuyển phân khu:** $1.2 - 1.8\text{ giây}$ $\longrightarrow$ **$< 0.25\text{ giây}$ (Căn giữa camera tức thời)**.

---

## 6. HƯỚNG DẪN KHỞI CHẠY & TRẢI NGHIỆM

```bash
# 1. Kiểm tra biên dịch TypeScript
npx tsc --noEmit

# 2. Khởi chạy máy chủ phát triển
npm run dev
# Mở trình duyệt tại: http://localhost:3000/
```

- **Di chuyển:** `WASD` hoặc các phím Mũi tên.
- **Chạy nhanh:** Giữ phím `Shift`.
- **Tương tác / Nói chuyện / Ẩn nấp:** Nhấn phím `E`.
- **Thoát chỗ trốn:** Nhấn phím `E` hoặc nhấn phím `WASD`/Mũi tên sau 0.3s.
- **Bật / Tắt Đèn Lồng:** Nhấn phím `F`.
- **Thuốc Đắp Hồi Máu / Dầu Đèn:** Nhấn phím số `1` / phím số `2`.
- **Ném Mồi Nhử:** Nhấn phím `Q`.
- **Bàn Chế Tạo / Sổ Tay & Bản Đồ:** Nhấn phím `I` / phím `J`.
- **Tạm Dừng & Lưu Game:** Nhấn phím `ESC`.
- **Bật / Tắt Tiếng:** Nhấn phím `M`.
