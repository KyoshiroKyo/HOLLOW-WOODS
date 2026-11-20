# 04C-K2 · Bằng chứng Black Knight trong game

[Sáu trạng thái RIGHT trước/sau, cùng zoom 2,20×](six-states-right-before-after.webp) · [24 trạng thái/hướng sau sửa](six-states-four-directions.webp) · [Texture, animation, frame, kích thước và actor của 48 mẫu](six-states-metadata.json).

Mã trước sửa là `4f6eb7e`. Mã sau sửa là `5feed14`. Các GIF ghép crop những khung Canvas đã vẽ thật theo đúng thứ tự frame và timing đăng ký. Contact sheet giữ cả sáu frame của mỗi hướng. Ground, đèn, bóng và lớp UI trong ảnh lấy từ game.

| Nhóm | Bốn hướng | Frame đã hiển thị | Ảnh nguyên khung |
|---|---|---|---|
| Armed Walk | [GIF](armed_walk-gameplay.gif) | [Contact sheet](armed_walk-contact.webp) | [LEFT](runtime-armed_walk-left.webp) |
| Armed Run | [GIF](armed_run-gameplay.gif) | [Contact sheet](armed_run-contact.webp) | [RIGHT](runtime-armed_run-right.webp) |
| Unarmed Idle | [GIF](unarmed_idle-gameplay.gif) | [Contact sheet](unarmed_idle-contact.webp) | [UP](runtime-unarmed_idle-up.webp) |
| Unarmed Walk | [GIF](unarmed_walk-gameplay.gif) | [Contact sheet](unarmed_walk-contact.webp) | [LEFT](runtime-unarmed_walk-left.webp) |
| Unarmed Run | [GIF](unarmed_run-gameplay.gif) | [Contact sheet](unarmed_run-contact.webp) | [RIGHT](runtime-unarmed_run-right.webp) |

- [144 frame của sáu nhóm trong Canvas](canvas.json) · [144 frame của sáu nhóm trong WebGL](webgl.json) · [F9 WebGL](webgl-f9.webp)
- [Phím X hai chiều, xoay hướng, hai chuyển vùng, Restart và Continue](lifecycle.json) · [Ảnh một actor sau Restart](single-actor-restart.webp) · [Ảnh sau Continue](runtime-continue.webp)
- [Lỗi vẽ Text khi restart trên 04B2, trước sửa P0 và sau sửa P0](restart-compare.json) · [Fixture thiếu frame và lựa chọn fallback](fallback.json)
- [Contact Arcade K2](colliders.json) · [Contact Arcade 04B2](colliders-04b2.json) · [Lệnh kiểm tra](checks.txt)
