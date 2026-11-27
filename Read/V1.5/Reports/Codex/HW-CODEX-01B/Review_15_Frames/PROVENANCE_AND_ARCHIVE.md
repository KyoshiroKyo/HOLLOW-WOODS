# Nguồn artwork và archive

North, West và East được dựng bằng OpenAI ImageGen tích hợp theo South R1 đã duyệt và Conversion Run tương ứng. Một lượt cho mỗi hướng, sau đó một chỉnh có mục tiêu cho North và East. Dùng bản chỉnh North/East và bản West đầu để làm output. Không dùng bản lật West làm East.

Quy trình hoàn thiện dò bước và pha lưới của bản chroma, lấy texel ở tâm ô, lọc viền màu, đặt gót ở Y=62 và giữ một pose nền của chính hướng đó. Plume, mép cape hoặc shoulder accents lấy từ ảnh pha tương ứng. Riêng North căn lại cụm plume tối đa bốn texel theo Y để khớp phần gắn mũ của pose nền. Canvas 84×72 giữ lưới vuông. Lượt này giữ nguyên sáu frame South R1 theo RGBA và dùng lại GIF South gốc.

Nguồn gốc Black Knight V1 ghi công Fellor / BitBlast Studio. Black Knight V2 là artwork được phát triển cho HOLLOW WOODS. Giấy phép đi kèm cho phép sửa và dùng trong game, với giới hạn phân phối lại asset rời. Bộ preview dùng cho review nội bộ ở repository private. Raw ImageGen, prompt, ảnh đích, script và tham số được lưu local. Quyền lưu hành riêng nguồn thô ngoài dự án chưa được xác nhận. [Provenance R1](../../HW-CODEX-01A-R1/06_PROVENANCE_AND_ARCHIVE.md)

Thư mục local `G:\HOLLOW_WOODS_CODEX\scratch\hw-codex-01b-review\` giữ các tệp trong bảng dưới cùng `SOURCE_SHA256SUMS.txt`. Các ảnh Conversion Run tham chiếu theo hướng và ảnh South R1 dùng lại từ `scratch/hw-codex-01b/`. SHA-256 của atlas và South R1 có trong [Frame Metrics](FRAME_METRICS.json). [Manifest bộ review](SHA256SUMS.txt)

| Tệp local | SHA-256 |
|---|---|
| up.png | a7ebfcd6520e0ca94ac4c7c1e3838618ad8391ed9f9c656c91002521dfc46609 |
| left.png | 4a7be3cea7e2619a76b3ad4e1aa95bbb63b39183fd74dc6567b745bcc18472d9 |
| right.png | 67e16c428b916f901cc4073f730fb68ca588530b81a22b3c7a905e3aca1960a1 |
| up-refine.png | b319f091fc800e22cdc37c45f8dd1fb7ec98c1bcebef4ecbec1c6b9321567fad |
| right-refine.png | 1a1a832df0adc89598244e277686c7aca3a8bccc787f6babe27ec4fe38a4b0d0 |
| up-edit.png | 14c8e603057b21712441eaf9694c2e3703e79ab826d98fb98cfc916120a2e1df |
| left-edit.png | 8f7c56add8eb6205db65eae578c9c6532931df57969fc3efd77f541f211848f9 |
| right-edit.png | 5b555782fd81046fbc3c8a0f54b641c7549ada43c0603eda61342db44f0770c0 |
| west-scale-reference.png | 60dd6d6117c40a52de049e98f98705704c09f8470148ff221f32343d19fe8748 |
| up-sampling.json | 7405bf5bfc1ae988d1f50376d3462de5b8f46ca5d12a6f2ca83b2c702fc50aa5 |
| left-sampling.json | 6d4266c484955f308b27f8f069f3f95db441b9bb1281ef585e7cfd38f1d460cf |
| right-sampling.json | e0e1b9b42f7cefcd830106566e514297c68bbcf4178a90b4b920c687c22231c8 |
| up-refine-sampling.json | 3b18c0d8d4ff926143b459da840914047c4895239d521865abb178f94f633685 |
| right-refine-sampling.json | 9f35f0bce8c34d6ffcb6f451622e1a9cc04afb4e3d28aefabcc3edfaceeb3a87 |
| phase-settings.json | b8a5dfaa5a47e1b23f30fb0ce4f812b5cbff42877e368277a00b9deeb5511957 |
| extract.cjs | 69f98eba2af6642e6a0ca9dc1b68e7f92b18d065caf312b822563f4a4c4ec293 |
| phase.cjs | f9d20eb70096e684ec987d09bb389f01d58bf1e5f3c4e8ed1f1bec30a7afcba7 |
| package.cjs | 725ae270ee37c08f9a75e95d5a987a31e4e28c8b6d50e77c8b06a187a0c431f7 |
| labels.ps1 | 259bd3b6fc1bb7aff24117e0bc7dc63cc908174580402fda859b358544638dad |
| preview.cjs | e9e5ce0a1d36cb1cc8c437b82ba5d93fda03714202bb2d271b721d5c4382e97f |
| check-gifs.ps1 | 6a203faa69b6dfd4b1809950e04770720d48f8ab855882eb16bb62248dee117f |
| PROMPTS.md | bfd6ad55e606d62c28279782ce5361b5f52b75218900a912d962b400409da6e3 |
