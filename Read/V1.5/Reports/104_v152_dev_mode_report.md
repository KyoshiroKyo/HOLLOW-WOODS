# V152-DEV-04 — Developer Mode

## Tóm tắt

- `DeveloperModeManager` là nguồn trạng thái bật/tắt và API gameplay. `GameScene` giữ một listener F9 duy nhất, đồng bộ manager, `DevPanelOverlay` và `HitboxDebugInspector`; listener được gỡ khi scene shutdown.
- Dev hoặc URL có `?dev=1`: nhấn `F9`. Production: nhấn `Ctrl+Shift+F9`. Tắt chế độ sẽ ẩn panel, dừng inspector và xóa lớp vẽ debug.
- Overlay có 5 thẻ: Log & Hiệu năng; Di chuyển & Map; Nhân vật & Đồ; Nhiệm vụ & Môi trường; Thực thể & AI. Điều khiển gọi các API thật của manager cho di chuyển/teleport, chỉ số/vật phẩm, cổng/chặng, thời gian/thời tiết/ending và AI.
- Inspector có công tắc riêng cho collider, hitbox, trigger, vùng tương tác, vùng AI và object picker. Vùng AI vẽ tầm nghe The Listener cùng vòng +30% khi đèn đang bật. Object picker hiện tên, texture key, tọa độ và kích thước collider nếu có.

## Sao lưu

Các tệp được sao lưu trước khi sửa tại `Backups/steps/backup_v152_dev_04/`, gồm các tệp debug, `GameScene.ts` và trạng thái `WorldBuilder.ts` trước khi gỡ import không dùng.

## Kiểm tra

- `npx tsc --noEmit`: thành công, 0 lỗi.
- `npm run build`: thành công. Vite còn cảnh báo chunk JavaScript chính lớn hơn 500 kB sau minify.
