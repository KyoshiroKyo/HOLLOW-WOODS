# HOLLOW WOODS — Hướng dẫn QA theo checkpoint

## Nhánh QA Batch 03-R2

`qa/v1.5.3-batch03-r2` dùng để kiểm thử checkpoint trước khi nâng cấp Developer Mode. Chạy với Node 24.22.1 và npm 11.9.0, Phaser 4.2.1 theo lockfile. Chọn một checkout riêng và ghi SHA vào báo lỗi.

```sh
git fetch origin qa/v1.5.3-batch03-r2
git switch --track origin/qa/v1.5.3-batch03-r2
git rev-parse HEAD
npm ci
npm run dev -- --host 127.0.0.1
```

Để thử build production cục bộ, dừng dev server rồi chạy các lệnh sau.

```sh
npm run check
npx --no-install vite build --outDir ./dist/qa-batch03-r2
npx --no-install vite preview --outDir ./dist/qa-batch03-r2 --host 127.0.0.1
```

Dùng một profile Chromium mới dành riêng cho QA, mở game qua địa chỉ loopback được in bởi Vite khi máy đã ngắt kết nối Internet. Cài dependency trước khi ngắt. Trang chạy qua localhost và SDK đi theo nhánh standalone. Nếu dùng test runner thay cho máy offline, cấu hình chặn toàn bộ request ngoài loopback trước khi mở game hoặc dùng SDK test do team cấp. Dữ liệu Save của tester chỉ nằm trong profile cách ly. Nhánh checkpoint chứa Dev Mode cũ, cần duy trì cách ly suốt phiên.

- Trong dev server, chơi New Game rồi nhấn F9 để xem năm tab và các lớp inspector. Bản production checkpoint dùng Ctrl+Shift+F9 làm toggle. Ghi rõ loại build.
- Dùng WASD, F và E. Thử Continue với Save của profile QA, Neris, cửa Đông lúc khóa/mở đúng tiến độ, và Esc mở/đóng Pause.
- Khi chẩn đoán vật cản, giữ Noclip tắt và ghi zone, vị trí, kích thước body, bước tiếp cận, hướng di chuyển và ảnh. Một lượt dùng teleport hay fixture cần được ghi riêng.
- Báo lỗi kèm SHA, trình duyệt/OS, viewport, zone, bước tái hiện, kết quả mong đợi/thực tế và log đã lọc. Các điểm đang mở gồm artwork Black Knight bốn hướng, P2Game hosted, tiếng rè/rít và playthrough xuyên suốt.

Thư viện frame tách rời và ứng viên artwork được giữ ở workspace thiết kế. Nhánh GitHub chứa tài nguyên tích hợp trong game và bằng chứng runtime. [Checkpoint gốc](V153_BATCH_03_CHECKPOINT.md) · [QA gốc](V153_FINAL_QA_REPORT.md).
