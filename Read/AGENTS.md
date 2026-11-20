# QUY TẮC THÉP BẮT BUỘC CHO CODEX — HOLLOW WOODS (G:\HOLLOW WOODS)

Mọi tác vụ chạy trên Codex BẮT BUỘC đọc và tuân thủ 100% hai tệp quy tắc:
- `Read/AI_IRON_RULES.md`
- `docs/FOLDER_STRUCTURE_RULES.md`

Quy định bổ sung bắt buộc cho chuỗi lệnh `V152-DEV-01` → `V152-DEV-04`:
1. Chỉ đọc đoạn code ngắn quanh kết quả tìm kiếm (`<= 100 dòng`), TUYỆT ĐỐI KHÔNG đọc nguyên tệp lớn (`WorldBuilder.ts`, `GameScene.ts`, `UIScene.ts`, `AudioManager.ts`).
2. Luôn tạo sao lưu trước khi sửa vào `Backups/steps/backup_<mã_bước>/`.
3. Mọi tệp dùng `Phaser.*` phải có `import * as Phaser from 'phaser';`.
4. Mọi báo cáo `.md` mới lưu vào `Read/V1.5/Reports/`. Không tạo thêm tệp `.md` hay file rác ở thư mục gốc.
5. Ở các bước `V152-DEV-01..04`, CHỈ chạy `npx tsc --noEmit` (và `npm run build` ở bước `04`); CẤM chạy `release:p2game`, nén ZIP, `p2game-validate`, hoặc `git commit/push`. Xong mỗi bước thì báo cáo ngắn gọn và DỪNG LẠI.

## HOLLOW WOODS V1.5.3

- Áp dụng mục V1.5.3 của [AI_IRON_RULES.md](AI_IRON_RULES.md) cho The Mossbound Wayfarer, đồ họa môi trường, UI, âm thanh và tương thích runtime. Phạm vi do Project Owner giao cho từng nhiệm vụ quyết định phần được triển khai.
- Giữ nguyên nhánh và bảo vệ thay đổi của người dùng. Dùng `rg` để định vị đoạn mã liên quan trước khi mở rộng phạm vi đọc. Cấm viết lại toàn bộ `WorldBuilder.ts`, `GameScene.ts`, `UIScene.ts` hoặc `SatyrPlayer.ts` để sửa một chức năng riêng lẻ. Tệp dùng `Phaser.*` phải có `import * as Phaser from 'phaser';`.
- Báo cáo V153 lưu tại `Read/V1.5/Reports/` theo [quy chuẩn thư mục](../docs/FOLDER_STRUCTURE_RULES.md). Cấm để tệp `.bak`, script tạm hoặc bản sao lưu rời ở root. Cấm commit `Backups/`, `dist/` và `node_modules/`. Tôn trọng giới hạn và từ chối của dịch vụ, cấm retry liên tục hoặc tìm cách vượt giới hạn.
- `V153-F0-0` chỉ cho phép đọc, kiểm kê, khóa kiến trúc và sửa tài liệu quy tắc hoặc báo cáo. Kiểm tra baseline bằng `npx tsc --noEmit` và xác minh phạm vi bằng Git diff. Cấm tạo artwork, spritesheet sản xuất hoặc script kiểm thử mới, sửa mã, sửa hay xóa asset, hoặc chạy build, release, `p2game-validate` và đóng ZIP. Chuẩn bị thay đổi để review PR rồi dừng chờ Project Owner phê duyệt trước CLOUD-01.
