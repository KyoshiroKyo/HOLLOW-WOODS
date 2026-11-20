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

## 5. Khóa định danh và phạm vi V1.5.3

- Nhân vật chính là **Black Knight — The Mossbound Wayfarer**. `satyh`, `SatyrPlayer.ts`, `SatyrAnimations.ts` và `satyr_animations.json` là tên kỹ thuật kế thừa. Bảo toàn thiết kế Black Knight của Fellor.
- Khóa **di chuyển bốn hướng, chiến đấu bốn hướng và mở rộng đầy đủ hoạt ảnh Black Knight**. Chuẩn bị theo `DOWN / UP / LEFT / RIGHT` cho Armed/Unarmed Idle, Walk và Run, Light/Heavy Attack, combo và recovery, Weapon Art, Parry, hai Roll, rút và tra kiếm, hai Buff, Hurt và Death. Đối chiếu Armed/Unarmed với nguồn, gồm chuỗi Hurt riêng theo trạng thái và Death chung để đánh giá artwork bổ sung.
- Kiểm kê mọi chuỗi nguồn theo ảnh master, viền, tài liệu và toàn bộ frame GIF. Thrust, Ground Slam, Flame Stream, Fire Wave, Aerial Somersault và Fire Nova là nhãn nghiên cứu của dự án. Xác minh đoạn nào thuộc combo, Weapon Art hoặc Parry. Dùng chuỗi Heavy Attack riêng và giữ trọn chuẩn bị, giơ kiếm, vung/chạm và thu đòn. Đối chiếu lướt, xoay và bổ kiếm của Aerial Somersault cũng như tích tụ, bùng nổ và tan hiệu ứng của Fire Nova.
- Phạm vi artwork tách khỏi việc mở kỹ năng trong gameplay. Bảo quản Jump, Mid air, Fall, Land và chuyển động side-scroller ở kho nguồn. Cấm thêm nhảy, thay vật lý, sát thương, cooldown hoặc skill tree chỉ để sử dụng hoạt ảnh đã chuẩn bị.

## 6. Nguồn artwork và chất lượng sprite

- Bảo toàn mũ trụ sắt tối với khe nhìn chữ T tối, chùm lông đỏ sẫm hoặc tím nâu, giáp vai nhiều lớp, giáp sắt xám tối, áo choàng đen rách, tỷ lệ và silhouette pixel art của Fellor. Giữ lưỡi đao cong cam vàng và chuôi hoặc vũ khí đeo lưng khi tra kiếm. Giữ chùm lông ở các frame nhìn được mũ. Đánh giá flash, che khuất, fade và tan biến theo ảnh gốc. Cấm thêm mắt sáng, phụ kiện, trang phục hoặc đổi tỷ lệ theo trạng thái.
- Nguồn họa sĩ nằm tại `Pixel_Art/Black Knight/`. Dùng `WEB_Images/Cover_GIF/Black_Knight_Art.gif` làm tham chiếu hình tượng chính và `WEB_Images/knight_no_text.png` để đối chiếu mũ, giáp và vũ khí. Giữ nền sprite trong suốt. `Custom_4Dir/` là artwork bổ sung cần xác minh nguồn gốc, giấy phép, hướng, tay cầm kiếm, tỷ lệ, áo choàng, chùm lông và VFX trước khi sử dụng.
- Ưu tiên frame Fellor cho hai hướng ngang. Kiểm tra bản lật ngang về tay cầm, lưng và tư thế bất đối xứng. Dùng artwork top-down tương ứng cho UP và DOWN. Nếu thiếu công cụ hoặc nguồn artwork, ghi nhận phần thiếu và chờ Project Owner cung cấp. Giữ bản gốc, ghi công theo điều kiện giấy phép và ghi rõ xuất xứ artwork bổ sung, kể cả artwork AI.
- Cấm vẽ nhân vật bằng `Phaser.Graphics` hoặc sinh hình thế chỗ bằng code, gồm hình hộp, robot chữ T, áo choàng hình thang, cung lửa tĩnh, xoay sprite ngang để giả hướng đứng và recolor để bù artwork. Chỉ báo cáo asset hoàn chỉnh sau khi qua kiểm tra artwork. Script xử lý ảnh được phép đọc, kiểm tra alpha, trích xuất, căn neo, chuẩn hóa, lập contact sheet, đóng atlas và xuất metadata ở bước được giao.
- Sprite runtime dùng PNG RGBA trong suốt, nearest-neighbor khi chuẩn hóa và biên pixel sắc nét. Giữ đủ lông mũ, áo choàng, vũ khí và hiệu ứng. Kiểm tra từng frame để loại ô rỗng, ô dự phòng và frame thuộc chuỗi khác. Giữ flash và hiệu ứng gốc theo vai trò của chúng. Bảng tham chiếu bổ sung ưu tiên tỷ lệ 16:9, bốn hàng có nhãn hướng, nhóm động tác và khoảng đệm rõ. Kiểm tra và chuyển đổi sang atlas sản xuất sau khi duyệt, bảo toàn hình và ghi công. Cấm cắt tự động 18% chiều rộng.

## 7. Kiến trúc hiển thị và hợp đồng gameplay

- Giữ chuỗi tích hợp loader → animation registry → player. Bảo toàn Content ID, texture key, animation key và aliases `satyr_*`. ID kiểm kê dùng trong tài liệu. Kiểm tra từng tổ hợp hướng, trạng thái vũ khí và giai đoạn. Chuyển hình vũ khí theo đúng chuỗi rút hoặc tra. Parry, Roll, Buff và phản ứng sát thương phải đọc đúng trạng thái. Dùng chuỗi Roll riêng cho Armed và Unarmed.
- Chuẩn đang dùng là `64×64 px` và origin `(0.5, 1.0)`. Kiểm tra điểm đặt chân, collider, scale và Y-sorting qua các tư thế trước khi tích hợp. Với VFX lớn, dùng atlas phù hợp hoặc lớp VFX có neo riêng để giữ đủ hình. Chỉ chia sẻ VFX đối xứng khi hướng của nhân vật vẫn chính xác. Đồng bộ VFX theo giai đoạn hoạt ảnh.
- Cờ `WAYFARER_USE_PURE_ARTIST_SPRITES` có trong baseline. Đặt `true` ở bước tích hợp artwork đã được xác minh và xác nhận đường nạp sprite thực tế tuân thủ chế độ này. Cấm dùng cờ để thay cho kiểm tra file ảnh.
- Bảo toàn Vòng Sáng `[F]`, Tinh Thần, Hương Trầm Tinh Thần, Developer Mode `[F9]`, NPC, vùng, nhiệm vụ, Save/Load và P2Game SDK v1.1. Tách artwork Buff đỏ sẫm khỏi cơ chế Vòng Sáng. Giữ lựa chọn renderer tường minh. Cấm thêm mini-map.
- Môi trường dùng pixel art có giấy phép, `pixelArt` và Y-sorting theo chân vật thể. Cấm dựng cây, bụi, nhà, hàng rào và đạo cụ bằng `Phaser.Graphics`. Dùng Graphics cho ánh sáng, bóng, sương, hiệu ứng, hitbox debug và lớp phủ UI tối giản.

## 8. UI, âm thanh và hiệu năng

- Ưu tiên UI Pack có nguồn được xác minh. Khóa bảng màu **Dark Moss & Ember Gold** gồm `#141712`, `#1F241B`, `#C8963E`, `#E09F3E`, `#E8DFC8` và `#C8CFC2`. HUD đồng bộ Armed/Unarmed, Vòng Sáng, chiến đấu và Thể Lực. Giữ thoáng tầm nhìn trung tâm.
- Running UI biểu thị `normal` (Bình thường), `sprinting` (Đang chạy), `low_stamina` (Sắp hụt sức) và `exhausted` (Hồi sức). Mốc thiết kế là cảnh báo từ 25% trở xuống, kiệt sức ở 0 và cho phép chạy lại từ 25%. Đối chiếu với mốc runtime trước triển khai và giữ hành vi gameplay hiện hành khi công việc chỉ liên quan hiển thị.
- Ưu tiên âm thanh thật trong `public/assets/audio/`. Trước khi đề xuất xóa asset, kiểm tra `ASSETS_MANIFEST.json`, loader, runtime key, tham chiếu động, JSON và đường dẫn gián tiếp.
- Quản lý vòng đời WebAudio nodes, timers, intervals, event listeners và tweens khi Scene shutdown hoặc destroy. Hạn chế cấp phát trong `update()`, redraw và cập nhật text theo thay đổi dữ liệu. Xác nhận mục tiêu 60 FPS bằng phép đo runtime.
