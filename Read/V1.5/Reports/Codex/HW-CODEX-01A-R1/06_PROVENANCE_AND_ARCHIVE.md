# Nguồn artwork và lưu trữ R1

**HW-CODEX-01A-R1 · 27/11/2026 · Kyoshiro Studio**

Pilot 01A trên baseline `fde44d2881510db7332dbb40434e60e2054b919b` là nguồn pose và pixel của R1. Đã kiểm đủ 7/7 checksum 01A. Conversion Run Down là chuẩn cho giáp, màu thép và góc nhìn. Các màu thép dùng để hoàn thiện lấy từ F00, F05 và F09 của atlas Conversion gốc, SHA-256 `3ea692c586431d737bcd93dceb3525a5c02591029b4993a2f63778da402e2da0`. Pilot 01A và Conversion Run được bảo toàn trong Git. [Nguồn và giấy phép 01A](../HW-CODEX-01A/06_PROVENANCE_AND_LICENSE.md) · [Manifest 01A](../HW-CODEX-01A/SHA256SUMS.txt)

## Phương pháp

1. Trích F00 từ 01A và phóng nearest-neighbor 10× làm ảnh đích. Dùng ba frame Run làm bảng tham chiếu. Một lượt OpenAI ImageGen tích hợp chỉnh ảnh F00 trên nền cyan phẳng theo hình giáp vai, ngực và mũ. Nguồn xuất đầy đủ 1.355×1.160 được lưu local.
2. Lấy texel ở tâm ô của ảnh đã chỉnh. Chọn 243 tọa độ trên mũ, vai và ngực ở lưới 84×72. Đặt ba texel viền vai vào alpha 0 và giữ pixel có sẵn ngoài vùng chỉnh. Các vùng sáng màu hồng trong bản nguồn được chuyển sang sắc thép lấy mẫu từ Run. Một lượt chỉnh cục bộ sau khi xem ở tỷ lệ camera 2.2 giữ dải sáng trên mũ và vai đủ đọc trên nền tối. Tham số, tọa độ và giá trị RGBA lưu trong script và `keyframe-patch.json`.
3. Kiểm F00 ở native 1×, nearest 4× và phép chiếu tĩnh 2.2. Sau khi F00 đạt đánh giá nội bộ, áp bản chỉnh sang năm frame với chênh lệch RGB gốc của từng pha thở được giữ tại các texel giáp vai đã chỉnh. Plume, áo choàng, khe chữ T tối, kiếm và chân tiếp tục lấy pixel từ từng frame 01A. [Số đo và mapping](05_FRAME_METRICS.json)

## Phạm vi quyền sử dụng

Fellor / BitBlast Studio là tác giả Black Knight V1. V2 là artwork bốn hướng được phát triển cho HOLLOW WOODS. Giấy phép đi kèm V1 cho phép chỉnh sửa và sử dụng trong dự án game, với giới hạn đối với phân phối lại asset rời và sử dụng trong dự án NFT hoặc huấn luyện bộ dữ liệu AI. Tệp Git của R1 gồm preview nội bộ, tài liệu và số đo, lưu trên repository GitHub **private** của dự án đã xác minh trong phiên. Quyền lưu hành ngoài phạm vi review nội bộ chưa được xác nhận. Raw ImageGen, ảnh tham chiếu, prompt và script có bản sao local để truy vết. [Provenance 01A](../HW-CODEX-01A/06_PROVENANCE_AND_LICENSE.md)

## Archive local

Thư mục `G:\HOLLOW_WOODS_CODEX\scratch\hw-codex-01a-r1\Source_Archive\` giữ bản sao chọn lọc của 01A và R1. Các bản gốc vẫn ở vị trí cũ trong workspace, Git và thư mục output mặc định của ImageGen. `Source_Archive/SHA256SUMS.txt` xác minh 23 tệp local. Manifest Git đi kèm R1 xác minh bảy deliverable được đưa vào repository. [Manifest R1](SHA256SUMS.txt)

| Tệp tương đối trong archive local | Byte | SHA-256 |
|---|---:|---|
| `01A/candidate-sampling.json` | 8390 | `6d2c43037ea62beced748412fc8141d179a7b2311cddc39eba39da4986e4a967` |
| `01A/cleanup.cjs` | 2806 | `91fb0a6a9a478c048873484587f2f381f4d4e9e25456682d426feca5729f2a1b` |
| `01A/extract.cjs` | 2504 | `0cb21be5ea33ec4f740c6e700c08d641b47bb69b64d71a24cda16cebcf82d7d2` |
| `01A/label.ps1` | 4660 | `8e7cbed7f55baf667373449b31b40777060fb54b5ecea8e31e4207c228eaad89` |
| `01A/measure-grid.cjs` | 1674 | `055ff5bbeb394fc66c6643a0cc2a557f6e53e8837b6c56a10d4d0105a08db2c9` |
| `01A/measure-trial.cjs` | 1668 | `6ee6ac09b2938ee8087de633433fc497e17f5df8c8672f12fcc68ff3037dac68` |
| `01A/package.cjs` | 9940 | `f82821f7483e393312b056fa7e2ee4b00e33357574f20e9660634202ea79f843` |
| `01A/preview-gif.cjs` | 2839 | `da4f58328d047d7dee4f2a75a3a1b9a4cefbb48a8db47689de2b43d27f5fa8ba` |
| `01A/selected-prompt.txt` | 1769 | `ef8e12ff9258a81b90c8223596210aa0d4684b1f0979318ee5084d45005ed2ad` |
| `01A/source-chroma.png` | 1243311 | `e9453324d475dd399871fe3ee36b73dd6a6047e684f21c305cd5291cb9e1a45f` |
| `01A/trial-1-metrics.json` | 9913 | `0f7e9f4492c29bf8735f709c72a61b7aefba3946a1f653d086b1c81cb5c17063` |
| `01A/trial-1-original.png` | 1369353 | `a8e53ec72a39e279e3b1dbd6c1be250dcb021482bad007c48e348f1e8e2ccb4a` |
| `01A/trial-2-metrics.json` | 9910 | `b4517e77d2faacfe2c5707ec1d55b6f726d46f919d01a9bea9f7138ff67c9342` |
| `01A/trial-2-original.png` | 1187122 | `7536afae768d2416f6744fe615b2dce7870be867c472fe5eef6f909882bd4172` |
| `R1/edit-target-f00.png` | 7333 | `8cda266f4ae2ddb688d57c7ce02d8312067d4b24317060365915bb374465bda7` |
| `R1/export-r1.cjs` | 12418 | `720ce646fffcdd3b0228f9d28ef6f86e46dc98b5ed6a85d15d2a71b5725893e6` |
| `R1/keyframe-patch.json` | 34622 | `9e17db4f2c3043fb82d0220b7510487e0bec16bd56ce38fd583202e52b5f94bd` |
| `R1/label-r1.ps1` | 4649 | `eaadd941c16f345af3b8c394c0c99b50fce31ae5e4e533c18c3725cc5a62d258` |
| `R1/preview-r1.cjs` | 2842 | `8535f4c2d9825aeca1712bb43b2b1322fb683e6cdbff5afb094f1634b38625f6` |
| `R1/r1-imagegen-f00-cyan.png` | 1176372 | `52406ac7f37f945fe4b0f40f57e655f777e860005e568839e2c9bba39318ba0a` |
| `R1/r1-imagegen-prompt.txt` | 1652 | `630e6117b637f716c9901606b35bede8854929081fc3452aa3e88761809a34ae` |
| `R1/reference-run.png` | 12122 | `04728b89201bb2029fe1ad7d78c9e9467a3e0b19f9ee7245ae2416f364ba4fe0` |
| `R1/refine-armored-idle.cjs` | 5268 | `f63e0449dde1d1a260c152048fc017ce90a01fb1858902961d23e6b5fce2a6e3` |

Các script R1 dùng workspace root làm thư mục chạy với `pngjs` đã có và cây `scratch/hw-codex-01a-r1/` làm chỗ đặt đầu vào. Bản xuất đi từ `refine-armored-idle.cjs --apply-all` qua `export-r1.cjs`, `preview-r1.cjs`, rồi `label-r1.ps1`. Sau khi dựng lại cần kiểm lại manifest.

<details>
<summary>Prompt ImageGen cho keyframe F00</summary>

Precision edit the FIRST image, a single existing pixel-art frame F00 of Kyoshiro Studio's Meliodas Black Knight V2. The second image is an artwork reference only: Conversion Run Down from the same project. Keep the first image's canvas, placement, planted two boots, leg pixels, right-hand (screen-left) amber sword and grip, both arms below the shoulder plates, entire torn cape, and red plume fixed. Keep the small black T slit recognizable. Edit only the pixels in the small region containing the helmet crown, the two shoulder plates, and the upper chest plate. Use the second image's angular segmented gunmetal shoulder plates. Give them tighter, slightly less rounded contours and short facet highlights, roughly 1 or 2 native pixels thick rather than broad circles. On the upper chest replace the rounded bright collar and ribbed curve with dark angular planes, recessed central breastplate and restrained metal accents. Rework highlights on the existing helmet crown into a small angular overhead-facing plane and a narrow stepped brow. Match the near-neutral cool dark steel of the actual Run sprite. Keep pose and sword placement unchanged. Improve slightly-overhead perspective through the shoulder top planes and overlapping top lip of chest. Work as pixel art only: flat crisp square native texels, grid alignment, restrained shaded areas, no airbrush and no glow. This edit should look like subtle pixel retouching, not a different costume. Keep the solid flat cyan matte of target, without decorative boxes, letters, halos, shadows or environment. Return a single F00 artwork only in the same composition and scale as the first image.

</details>
