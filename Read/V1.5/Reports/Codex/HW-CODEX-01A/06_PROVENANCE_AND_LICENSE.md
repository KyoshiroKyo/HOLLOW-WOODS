# Nguồn artwork và quyền sử dụng

**HW-CODEX-01A · Kyoshiro Studio · 27/11/2026**

| Vai trò | Nguồn |
|---|---|
| Nhân vật, palette, thiết kế giáp, kiếm và mật độ pixel mục tiêu | Black Knight V2 Conversion 34-Seq, commit `6bb15b80479f1206e2eaba878cd5903434f63ea4`, 12 frame `armed_run_sequence_down_0..11`. Kho tham chiếu `01_LATEST_ARTWORK/Atlases_Latest/Conversion_34Seq_6bb15b80` khớp PNG runtime, SHA-256 `3ea692c586431d737bcd93dceb3525a5c02591029b4993a2f63778da402e2da0`. |
| Tư thế chân trụ, nhịp Idle và nhóm đối chiếu A | K1 Armed Idle Down `armed_idle_down_0..5`, commit nguồn `0b16b7d4e531607de8bc98053f07a995367b3666`, SHA-256 PNG runtime `ff47e472f4c50bae5970fd6022633a2037f53bc04e8b3e4876c7d5bcd6ec092c`. |
| Artwork pilot | Artwork mới dành cho HOLLOW WOODS, dựng bằng OpenAI ImageGen tích hợp từ hai bảng tham chiếu V2 và hoàn thiện ở lưới pixel native. Sheet trung gian được chọn có SHA-256 `e9453324d475dd399871fe3ee36b73dd6a6047e684f21c305cd5291cb9e1a45f`. |

Black Knight V1.0 do **Fellor / BitBlast Studio** sáng tạo. Black Knight V2 là bản tái dựng bốn hướng của Kyoshiro Studio/Codex cho HOLLOW WOODS. Giấy phép đi kèm V1.0 cho phép chỉnh sửa và sử dụng trong game, đồng thời giới hạn phân phối lại asset rời, kể cả bản đã sửa, và cấm sử dụng trong dự án NFT hoặc huấn luyện bộ dữ liệu AI. Hồ sơ này dùng V2 do studio cung cấp để tham chiếu khi tạo ảnh và ghi công Fellor cho thiết kế gốc. Phạm vi phân phối của gói preview là review nội bộ trong repository HOLLOW-WOODS, có visibility **private** khi kiểm bằng GitHub. [Hồ sơ phục hồi V2](../../HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md) · [Source Parity](../../V153_BLACK_KNIGHT_SOURCE_PARITY_REPORT.md)

## Quy trình hoàn thiện

1. Hai lượt ImageGen nền trong suốt cho ra quầng sáng và mép alpha mềm. Cả hai bị loại, với số đo alpha và SHA-256 lưu trong [Frame Metrics](05_FRAME_METRICS.json).
2. Lượt thứ ba dựng lại sáu pose mới trên nền chroma cyan phẳng. Mỗi frame được lấy mẫu tại tâm ô pixel của lưới thể hiện trong ảnh nguồn. Tách nền và loại viền cyan trước khi đặt các cụm ảnh trong canvas RGBA 84×72. Các RGB còn lại lấy trực tiếp từ artwork mới. Hai atlas V2 đi vào bảng đối chiếu và tham chiếu hình dáng, tư thế.
3. Giữ cùng pixel cho thân dưới, chân, kiếm và tay cầm. Lấy các cụm pixel do ImageGen vẽ cho đỉnh plume, mép áo choàng và vùng sáng nhỏ trên giáp vai để tạo nhịp thở. Các pha được sắp lại để đưa plume về gần pose trung tính trước điểm lặp. Bảng 4× và GIF 3× dùng nearest-neighbor để review. GIF dùng bảng màu 256 mục cho preview và PNG RGBA giữ màu gốc.

Sheet chroma, script trích lưới, script hoàn thiện và công cụ dựng preview nằm trong `scratch/hw-codex-01a/` tại workspace Codex. Mapping ô nguồn, lưới lấy mẫu, bounds, hash RGBA từng frame và SHA-256 của bộ hồ sơ có trong [Frame Metrics](05_FRAME_METRICS.json) và [Manifest](SHA256SUMS.txt).

<details>
<summary>Prompt ImageGen của sheet được chọn</summary>

Create one production pixel-art intermediate for a six-frame 2D game sprite animation. This intermediate intentionally uses a solid, perfectly flat chroma-key background #00FFFF across the whole canvas so the sprite matte can be keyed into an RGBA PNG after inspection. No transparent input or output background needed for this intermediate. No shadow or gradients anywhere in the background, no colors from the sprite bleeding into the cyan, no checkerboard, no dividers, no text. SIX drawn sprites only, row-major 3 columns by 2 rows, identical cell size and all exactly aligned to same local heel line, ample cyan margins. This is a new South-facing armed idle by Kyoshiro Studio based on the studio's artwork in the two attachments: Conversion Run Down (first) defines the top-down game camera, silhouette, helmet crown, red plume, dark steel armor, charcoal torn cape, and yellow curved sword swinging toward viewer's left; K1 Idle Down (second) defines both feet planted and weapon held low. Draw the actual game view from above, the torso and legs are visibly foreshortened, keep proportions and plate geometry of the first attachment. Reuse its small cluster sizes and very low contrast palette. Nothing emits an aura, gradient, halo or any color beyond its own silhouette. Armor and helmet use simple hard-edged rectangular pixel clusters. Plume is dark red, sword is tiny pale yellow and amber solid pixels. Stable boots and sword through all six frames. Show tiny breathing and flutter in shoulder, plume tail or ragged cape-edge. Same pose and color structure throughout. Hard stepped silhouette built from uniformly sized square pixels. The ideal logical cell is 84x72 and the character is approximately 42 logical pixels tall. No extra details or props.

</details>
