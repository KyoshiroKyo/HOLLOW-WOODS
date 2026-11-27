# Provenance, Source Archive và Licensing

Black Knight V1.0 ghi công Fellor / BitBlast Studio. Meliodas Black Knight V2 và các sheet này được phát triển cho dự án HOLLOW WOODS. R1 đã duyệt là nguồn nhận diện, ba clip Conversion Run cung cấp góc, tỷ lệ và che khuất từng hướng. Giấy phép gốc cho phép sửa và dùng trong game, hạn chế phân phối lại asset rời. Checkpoint 01B chỉ dùng cho review nội bộ trong repository GitHub private. Quyền phát hành riêng các sheet chưa được xác nhận. [Provenance R1](../HW-CODEX-01A-R1/06_PROVENANCE_AND_ARCHIVE.md)

Một lượt OpenAI ImageGen tích hợp tạo ba pose định hướng. Sau khi đối chiếu thấy chúng cao hơn R1, ba lượt theo từng hướng tạo bộ ba pha neutral/inhale/settle. Các ảnh chroma chỉ là đầu vào. Quy trình dò bước và pha của lưới pixel, lấy mẫu tại tâm texel, tách nền cyan, đặt hàng chân thấp nhất ở Y=62 và giữ pose trung tính ở phần chân/kiếm. Plume, mép cape và cụm sáng vai được lấy từ các pha thật. Không dùng stretch hoặc sharpening. Bảng so sánh dùng nearest-neighbor và cùng tham số chiếu cho các hướng Idle.

Bản gốc ImageGen, ảnh tham chiếu, prompt, script, tham số lấy mẫu và manifest local lưu tại `G:\HOLLOW_WOODS_CODEX\scratch\hw-codex-01b\`. Bảng dưới kiểm kê nguồn chọn lọc. Sheet review, bảng so sánh và JSON có manifest riêng trong Git.


| Tệp local | SHA-256 |
|---|---|
| neutral.png | f18961cf649fb5624dd09cea0686fc66e24e13262477bef4c630fa7c2b75b440 |
| up.png | 32c178fa3f0a32b5704e38aea0f087535a6e37b1d07f148cb5f8217e247473ee |
| left.png | e12d1c9ad422dee2278a22ca2fa29128b0837e445de68f4599a5c56f6a2475fd |
| right.png | 568a7378678b0e97ef0ec4004a5472221f05ca7ff671d5559628249903ac9f0b |
| south.png | 2ee375677330a83359fafedd5b07a22216f392a87f4a4edf9827c1699552e9fd |
| run-up.png | 874e4f786bef26ca6ce66014ee811c043571cac1e66c409769c20c56c23333de |
| run-left.png | 0f07e5c14e34ddbc6f1c8f1e7dcefb8a45379fc93836cc482e60896dfca1eff9 |
| run-right.png | 441d3e83e1d771b4f3567b7441bbae7702166bb99d1e031ab0bbadbd3b27f6ed |
| extract.cjs | 659b94c7a70c726c4227d581b6913e5ef4095fcf0eea8b11fafdd6b6e635638a |
| stabilize.cjs | 5204a4b55b0ab7231c2d1788970f1d0a2309917cb0dcfa5150453c9cae3a5d19 |
| package.cjs | bb463ee7eef5db8ba29fde39b8edc8c5cb8ecd729f1eefbaabfb0f10363c3e2c |
| labels.ps1 | 881aefbdbea11be736dd4dd834fd313b550d2f5fc99d2d0c1642fda06d6fe476 |
| PROMPTS.md | a73aa420a1026406bd35f3a4712eb361921055a3069cb5fff95ab91b5f9a1f13 |
| up-sampling.json | 57e7f9ef79c03780cc75abc80b5e9e7b5e8574c5454bfdf9b3b5b811c57fd4a4 |
| left-sampling.json | 1c593cd885af6927fc2e047a391b189034ebaa1cb3ad81dda21468d98b24ee86 |
| right-sampling.json | c0314f0c0f525d36d39c29832f41e2f550c5b63a137ad40a2cdb4c2cd93d4922 |
| neutral-sampling.json | 619a3e8dc666adf7eed3256dbb808260deb633c4e35d7c33f1380402038ea37b |
