# QUY TẮC THÉP & LUẬT KẾ THỪA DỰ ÁN — HOLLOW WOODS v1.5.2 (G:\HOLLOW WOODS)

Áp dụng cho toàn bộ chuỗi lệnh V152-02 -> V152-10:

## 1. Luật Tiết Kiệm Token
- Chạy trực tiếp trên luồng chính, KHÔNG gọi subagent trình duyệt (chỉ chạy script Chrome Headless ở V152-10).
- KHÔNG đọc toàn bộ các file lớn (`WorldBuilder.ts`, `GameScene.ts`, `UIScene.ts`, `AudioManager.ts`); luôn dùng grep định vị dòng và chỉ đọc <= 100 dòng quanh vị trí cần sửa.
- Ở các bước trung gian (`V152-02` đến `V152-09`) CHỈ chạy `npx tsc --noEmit` và script test liên quan; CẤM chạy `release:p2game`, nén ZIP, `pack_source_for_gemini`, `p2game-validate` hay `git push` cho tới bước `V152-10`.

## 2. Luật Sao Lưu & Thư Mục Sạch
- Trước khi sửa luôn backup file gốc vào `Backups/steps/backup_<mã_bước>/`.
- Mọi báo cáo `.md` mới lưu vào `Read/V1.5/Reports/`.
- Không để file `.bak`/rác ở thư mục gốc.

## 3. Luật An Toàn Thiết Kế V1.5.2
- 100% dùng Sprite Pixel Art thật (CẤM vẽ cây/nhà bằng `Phaser.Graphics`).
- Không làm hỏng nét họa sĩ gốc của `Black Knight` và `UI Pack`.
- Giữ cơ chế Vòng Sáng `[F]` (tốn Thể Lực), chỉ số "Tinh Thần", Hương Trầm Tinh Thần (không khôi phục Đèn Lồng/Dầu Đèn cũ).
- KHÔNG hiển thị ô vuông Mini-map góc màn hình và KHÔNG hiện thông báo "Đã tắt mini-map".
- Mọi ảnh nạp mới không trùng key với `hollow_props_atlas`.
- Mọi file dùng `Phaser.*` phải có `import * as Phaser from 'phaser';`.

## 4. Luật Kiểm Tra Lại & Dừng
- Sau mỗi bước, tự đối chiếu lại đúng lỗi đã giao (check kỹ code thực tế không đoán mò), chạy `npx tsc --noEmit` + test liên quan.
- Báo cáo ngắn gọn (Nguyên nhân gốc, File/dòng đã sửa, Kết quả check lại) rồi DỪNG LẠI chờ xác nhận.
