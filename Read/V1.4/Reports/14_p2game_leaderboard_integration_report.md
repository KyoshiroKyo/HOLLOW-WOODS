# BÁO CÁO TÍCH HỢP BẢNG XẾP HẠNG SINH TỒN P2.LEADERBOARD — HOLLOW WOODS V1.4

**Ngày thực hiện:** 18/11/2026  
**Phiên bản dự án:** HOLLOW WOODS V1.4.0 (Phaser 4 + TypeScript)  
**Nền tảng đích:** [p2game.io](https://p2game.io)  
**Đặc tả Bảng Xếp Hạng:** `"id": "survival-score"`, `"sort": "DESC"`, `"maxScore": 1000000`, `"minSessionSeconds": 30`  
**Tình trạng kiểm thử:** ĐẠT 100% (Unit tests PASS, 37/37 P2Game Packaging tests PASS, 0 lỗi TypeScript, 0 lỗi Runtime)

---

## 1. TỔNG QUAN HẠNG MỤC TRIỂN KHAI

| Hạng mục | Tệp tin cấu hình / Mã nguồn | Trạng thái | Nội dung kỹ thuật triển khai |
| :--- | :--- | :---: | :--- |
| **1. Cấu hình Manifest** | [public/p2game.json](file:///g:/HOLLOW%20WOODS/public/p2game.json#L9-L18) & [p2game.json](file:///g:/HOLLOW%20WOODS/p2game.json#L9-L18) | **ĐẠT** | Khai báo bảng xếp hạng `"survival-score"`, sắp xếp giảm dần `DESC`, trần điểm `1,000,000`, thời lượng phiên tối thiểu `30s`. |
| **2. Dịch vụ LeaderboardService** | [src/services/LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts) & [src/services/LeaderboardService.js](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.js) | **ĐẠT** | Cung cấp thuật toán tính điểm sinh tồn, xác thực qua `p2.auth`, gửi điểm qua `p2.leaderboard.submit`, truy vấn `top(10)` và `aroundMe(3)`. |
| **3. Xác thực & Đăng nhập chuẩn** | [src/services/LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts#L67-L94) | **ĐẠT** | Kiểm tra `p2.auth.getUser()`, chỉ gọi `p2.auth.requestLogin()` qua popup hệ thống khi người chơi chưa đăng nhập; tuyệt đối không tạo form riêng. |
| **4. Xử lý lỗi & Toast phản hồi** | [src/services/LeaderboardService.ts](file:///g:/HOLLOW%20WOODS/src/services/LeaderboardService.ts#L137-L158) | **ĐẠT** | Bắt và phân loại chính xác các mã lỗi `UNAUTHENTICATED`, `SCORE_REJECTED`, `RATE_LIMITED` kèm thông báo `p2.ui.toast()`. |
| **5. Luồng Game Over & p2.gameOver()** | [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L830-L880) | **ĐẠT** | Tự động tính điểm, gọi `window.p2.gameOver()` và gửi điểm ngầm khi nhân vật gục ngã trước Kẻ Lắng Nghe hoặc quái vật. |
| **6. Giao diện Tổng kết Game Over** | [src/ui/GameOverModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/GameOverModal.ts#L40-L400) | **ĐẠT** | Đại tu bảng Game Over thành bố cục 2 cột HD (760×470 px): Cột trái hiển thị nguyên nhân + điểm sinh tồn; Cột phải hiển thị Bảng xếp hạng Top 5 và thứ hạng cá nhân thời gian thực. |
| **7. Ràng buộc Standalone & Save/Load** | Toàn hệ thống | **ĐẠT** | Bảo toàn 100% logic Save/Load nội bộ, game hoạt động mượt mà không crash hay treo khi chạy standalone hoặc người chơi hủy đăng nhập. |

---

## 2. CHI TIẾT THUẬT TOÁN TÍNH ĐIỂM SINH TỒN (SURVIVAL SCORE)

Điểm sinh tồn được tính toán dựa trên các chỉ số sinh tồn thực tế của người chơi:

$$\text{Total Score} = \text{DayPoints} + \text{ComposurePoints} + \text{LorePoints} + \text{ZonePoints} + \text{QuestPoints} + \text{RelicPoints}$$

- **Số ngày sống sót ($\text{DayPoints}$):** $1,000 \times \text{dayCount}$ (Mỗi ngày sống sót qua màn sương đêm thưởng 1,000 điểm).
- **Bình tâm còn lại ($\text{ComposurePoints}$):** $10 \times \text{composure}$ (Tối đa 1,000 điểm khi giữ vững tinh thần 100%).
- **Ký ức & Bí mật khám phá ($\text{LorePoints}$):** $250 \times \text{unlockedLoreCount}$ (Mỗi mảnh nhật ký / ký ức ghi lại thưởng 250 điểm).
- **Phân khu đã thám hiểm ($\text{ZonePoints}$):** $150 \times \text{visitedZonesCount}$ (Khám phá bản đồ mới thưởng 150 điểm/khu).
- **Nhiệm vụ hoàn thành ($\text{QuestPoints}$):** $500 \times \text{completedQuestsCount}$ (Mỗi nhiệm vụ hoàn tất thưởng 500 điểm).
- **Cổ vật quý hiếm ($\text{RelicPoints}$):** $1,000 \times \text{relicsCount}$ (Mỗi cổ vật như Trái Tim Rễ Cây, Mảnh Sắt Cổ Ngữ, Quả Lắc Đồng thưởng 1,000 điểm).
- **Trần giới hạn điểm số:** Được kẹp trong khoảng $[10, 1\,000\,000]$ điểm tuân thủ `maxScore` trong `p2game.json`.

---

## 3. METADATA VÀ BẢO ĐẢM KÍCH THƯỚC < 1 KB

Metadata đính kèm mỗi lượt gửi điểm luôn được kiểm soát chặt chẽ:
```json
{
  "day": 5,
  "zone": "outer_woods",
  "deathReason": "Bị Kẻ Lắng Nghe bắt kịp và tấn công hạ gục...",
  "composure": 45,
  "secrets": 4,
  "version": "1.4.0",
  "at": "2026-11-18T06:34:52.899Z"
}
```
- **Kích thước thực tế:** `187 bytes` (hoàn toàn nằm dưới ngưỡng trần `1,024 bytes` quy định của nền tảng).

---

## 4. XỬ LÝ LỖI & PHẢN HỒI GIAO DIỆN (ERROR CODES)

| Mã lỗi P2Game SDK | Hành vi hệ thống | Thông báo Toast người chơi |
| :--- | :--- | :--- |
| `UNAUTHENTICATED` | Bắt lỗi an toàn, không ném exception; ghi log cảnh báo. | `warning`: "Vui lòng đăng nhập p2game để lưu điểm sinh tồn lên bảng xếp hạng." |
| `SCORE_REJECTED` | Ghi nhận phản hồi từ chối từ máy chủ (điểm vượt trần hoặc phiên chơi dưới 30s). | `warning`: "Điểm số không hợp lệ hoặc phiên chơi chưa đủ 30 giây." |
| `RATE_LIMITED` | Đọc `err.retryAfterMs` để tính toán thời gian chờ cần thiết. | `warning`: "Gửi điểm quá nhanh, vui lòng đợi {X} giây." |
| `result.improved === true` | Người chơi phá kỷ lục cá nhân. | `success`: "🎉 Kỷ lục mới! Điểm sinh tồn: {Score} (Hạng #{Rank})" |
| `result.accepted === true` | Điểm được lưu nhưng chưa vượt kỷ lục cũ. | `info`: "Đã ghi nhận điểm sinh tồn: {Score} (Kỷ lục: {PB})" |

---

## 5. THIẾT KẾ GIAO DIỆN GAME OVER MỚI (760×470 PX)

Giao diện `GameOverModal` được nâng cấp từ kích thước cũ (520×400 px) lên chuẩn bố cục 2 cột HD (760×470 px):
1. **Cột Trái (380 px):**
   - Tiêu đề `GỤC NGÃ TRONG SƯƠNG ĐẶC` đỏ thẫm.
   - Nguyên nhân tử vong chi tiết.
   - **Huy hiệu Điểm Sinh Tồn:** Hiển thị điểm số nổi bật màu vàng hổ phách kèm phân rã chỉ số (Số ngày • Bình tâm • Bí mật).
   - Tình trạng file Save/Checkpoint.
   - 3 Nút tương tác: Nạp điểm lưu, Chơi lại từ đầu, Về màn hình chính.
2. **Cột Phải (340 px):**
   - Khung Bảng Xếp Hạng: `🏆 BẢNG XẾP HẠNG SINH TỒN (P2.LEADERBOARD)`.
   - Danh sách Top 5 lữ khách điểm cao nhất với huy hiệu Rank (#1 Vàng, #2 Bạc, #3 Đồng).
   - Dòng làm nổi bật vị trí hiện tại của người chơi (`isMe`).
   - Nút `⚡ LÀM MỚI BẢNG XẾP HẠNG`.

---

## 6. KẾT QUẢ KIỂM THỬ TỔNG HỢP

- **Unit Test Node.js:** 100% các ca kiểm thử tính điểm, kiểm tra metadata, giả lập auth, submit, top, aroundMe và các mã lỗi ngoại lệ đều vượt qua thành công.
- **Biên dịch Rollup/Vite:** Hoàn tất thành công trong `9.03s`, 0 lỗi TypeScript, 0 lỗi cú pháp.
- **Kiểm định đóng gói (`verify_p2game_packaging_c4_13_22.mjs`):** 37/37 kiểm thử ĐẠT.
- **Tệp phát hành nén:** [hollow-woods-p2game-v1.4.0.zip](file:///g:/HOLLOW%20WOODS/hollow-woods-p2game-v1.4.0.zip) dung lượng **24.73 MB** (đã bao gồm cấu hình `leaderboards` và bundle mới).
