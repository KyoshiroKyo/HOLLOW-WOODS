# HW-CODEX-ANIM-01 — Ổn định animation Meliodas

- **Trạng thái** · Sẵn sàng để Owner nghiệm thu
- **Baseline Codex** · `ddd18dc938d94d680eead9f1889ed4fa170753e2`
- **Baseline Competition Preview** · `35317c0ef397edb8da3ce7471a18e5b87cada6a9`

## Nguyên nhân và bản sửa

Khi Meliodas đổi hướng hoặc đổi giữa Walk và Run, `BlackKnightPlayer.playWalkOrRunAnim()` chỉ chuyển vị trí của frame cũ theo tỷ lệ số frame. `Phaser.AnimationState.play()` đặt lại đồng hồ frame về 0, khiến bước chân lùi về đầu frame đích dù frame cũ đã phát gần xong. Walk có 6 × 170 ms, Run có 12 × 70 ms. Hai clip có độ dài khác nhau nên việc lấy chỉ số frame còn có thể chọn sai pose ở thời điểm chuyển.

Bản sửa chuyển toàn bộ pha thời gian của chu kỳ, gồm thời gian của các frame trước và thời gian đã phát trong frame hiện tại. Controller chọn frame đích theo thời lượng của chính clip đích và tiếp tục phát từ phần thời gian tương ứng. Clip đang phát cùng hướng và cùng gait được giữ lại. Hướng, ưu tiên action lock, thao tác chuyển tư thế, input watchdog và chính sách khi dừng vẫn đi qua luồng hiện hành.

## Kết quả runtime

Hai build production được chạy trên Chrome headless với WebGL phần cứng GTX 1070 Ti, viewport 1280 × 720. Bài test gửi phím qua Chrome DevTools, vào New Game bằng menu và lấy mẫu tại sự kiện `postrender`. Một fixture tạm ngưng tự rút/tra kiếm để kiểm tra hai tư thế trên cùng địa hình, rồi khôi phục và quan sát chế độ tự động. SDK P2Game được chặn để chạy bài test cục bộ.

| Hạng mục | Baseline | Bản sửa |
| --- | ---: | ---: |
| Clip Walk/Run đã kích hoạt | 16/16 | 16/16 |
| Chuyển giữa các clip locomotion được đo | 24 | 26 |
| Sai lệch pha lớn nhất | 11,14% chu kỳ | ≈ 0% chu kỳ |
| Tốc độ đặt cho Walk/Run trên đường thoáng | 85 / 140 px/s | 85 / 140 px/s |
| Thay đổi tọa độ sprite tức thời khi đổi clip | 0 px | 0 px |
| Tần số render trung bình | 59,95 FPS | 59,97 FPS |
| Khoảng cách giữa hai lần render, p95 | 17,4 ms | 19,1 ms |

Ở cả hai tư thế, Walk hoàn thành một chu kỳ 6 pose khi giữ hướng mà không phát lại clip. Bài test cũng xác nhận Walk → Run → Walk ở mọi hướng, đổi hướng trong lúc Walk và khi giữ Shift, nhả Shift về Walk, và blur về Idle với vận tốc 0. Hai bản ghi có số lần chuyển khác nhau vì thời điểm Shift được xử lý theo nhịp trình duyệt. Sai lệch pha được đo ngay trước và sau từng lần chuyển. Số đo render mô tả một lượt chạy trên máy thử.

## Điểm neo, camera và BUG-059

Collider giữ 18 × 12 px ở mọi mẫu Walk/Run. Độ lệch lớn nhất so với offset chân cấu hình (-9, -18) ở mẫu postrender là 2 px theo Y trên cả hai build, tại khu vực có va chạm. Camera vẫn render ở zoom 2,2, bật round pixels và dùng cùng quy tắc follow. Trace không ghi nhận bước nhảy tọa độ khi đổi clip.

Quét alpha của 144 frame đang dùng xác nhận Walk vẫn dùng canvas 64 × 64 và neo (32, 64), scale 1,50. Conversion Run dùng 84 × 72 và neo (42, 63), scale Armed 1,14 và Unarmed 0,99/1,11 theo hai pass của BUG-058. Biên alpha thay đổi theo pose, đặc biệt ở các frame nhấc chân của Run. Các khác biệt về silhouette, mật độ chi tiết và độ cao vùng alpha thuộc phạm vi artwork BUG-059. Bản sửa giữ nguyên asset đang phát và checkpoint review HW-CODEX-01B.

## Bằng chứng và tái hiện

- [Video baseline](02_BEFORE_GAMEPLAY.webm) và [video bản sửa](03_AFTER_GAMEPLAY.webm) ghi trực tiếp canvas gameplay Armed bằng cùng chuỗi phím. HUD trong clip hiển thị trạng thái của phiên thử sau tình huống blur.
- [Số đo runtime và alpha bounds](04_RUNTIME_METRICS.json) gồm từng lần chuyển clip, thời lượng frame, thông tin render, kết quả kiểm thử và checksum video. Chrome đã giải mã và kiểm tra hình ảnh ở hai thời điểm của mỗi clip.
- `npx tsc --noEmit`, `npm run build` và 11 kiểm tra browser trên bản sửa đều đạt. Vite vẫn cảnh báo `startup-status.js` và hai đường dẫn font ở cả hai build. Browser ghi nhận một cảnh báo khi SDK bị chặn, không có exception hoặc lỗi tải tài nguyên localhost.

Chạy lại sau `npm run build` từ thư mục gốc repo. `HW_CHROME` có thể trỏ tới Chrome ở vị trí khác. Đầu ra thô nằm trong `scratch/hw-codex-anim-01/`.

```powershell
$env:HW_ANIM_MEDIA = '1'
node tests/hw_codex_anim_01_runtime.mjs after
```

Để tái hiện baseline, chạy cùng script với đối số `before` trên build từ SHA baseline. Bài test dùng sự kiện phím tổng hợp và Chrome ở khoảng 60 Hz. Phím vật lý qua EVKey/UniKey, màn hình tần số quét cao và P2Game Portal nằm ngoài lượt kiểm này.
