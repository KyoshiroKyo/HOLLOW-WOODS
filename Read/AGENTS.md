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