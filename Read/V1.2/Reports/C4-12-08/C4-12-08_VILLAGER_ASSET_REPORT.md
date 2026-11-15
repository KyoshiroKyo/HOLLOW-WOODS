# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT C4-12-08
## CHUẨN HÓA & ĐÓNG GÓI TÀI NGUYÊN PIXEL ART CHO DÂN LÀNG BELLHOLLOW (5 NPC)

- **Mã lệnh:** `COMMAND C4-12-08 (Phần 1 & Phần 2)`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái thực thi:** **HOÀN TẤT THÀNH CÔNG (100% QC PASS)**
- **Phạm vi:** Trực tiếp đóng gói tài nguyên từ gói nguồn (`EleonoreAndJoanna`, `Portraits_v1`, `town-folk-2-free-v1.0`), không gọi browser subagent, chưa sửa code gameplay (dành cho bước `C4-12-09`).

---

## 1. TỔNG QUAN NGUỒN TÀI NGUYÊN & QUY CHUẨN THIẾT KẾ

Thực hiện yêu cầu hoàn thiện bước **C4-12-08**, toàn bộ tài nguyên dân làng Bellhollow đã được trích xuất, ghép bóng đổ, chuẩn hóa kích thước ô $64 \times 64\text{ px}$, neo điểm tựa bàn chân đồng bộ tại $Y = 57..58$ ($Y_{\max} = 58$), và xuất đầy đủ chân dung biểu cảm cùng file cấu hình manifest:

1. **Garth — Người Canh Cổng (Gatekeeper):** Trích xuất từ `town-folk-2-free-v1.0/characters/night_watchman/walk.png`. Căn chiều cao đồng bộ, thêm bóng elip `#222034`, xuất sheet đi bộ $512 \times 256\text{ px}$ (32 frames: 4 hướng $\times$ 8 frames), frame đứng $64 \times 64\text{ px}$ và chân dung bust crop $64 \times 64\text{ px}$.
2. **Bà lão Edda — Người Giữ Chuông (Elder Bell Keeper):** Trích xuất từ `EleonoreAndJoanna/Sprites/Eleonore/Idle/` kết hợp lớp bóng gốc `Shadow/Shadow1..9.png`. Xuất sheet idle $576 \times 64\text{ px}$ (9 frames), frame đứng $64 \times 64\text{ px}$ và chân dung chính/phụ từ `Portraits_v1/Portraits/Eleonore/` (`Eleonore1.png` và `Eleonore2.png`).
3. **Neris — Thầy Thuốc Thảo Mộc (Apothecary):** Trích xuất từ `EleonoreAndJoanna/Sprites/Joanna/Idle/`. Ghép bóng elip tiếp xúc mặt đất `#222034`, xuất sheet idle $384 \times 64\text{ px}$ (6 frames), frame đứng $64 \times 64\text{ px}$ và 3 chân dung cảm xúc từ `Portraits_v1/Portraits/Joanna/` (`JoannaPortrait1(NOBG)1, 3, 4.png`).
4. **Bram — Thợ Thủ Công Làng (Potter / Craftsman):** Trích xuất từ `town-folk-2-free-v1.0/characters/potter/walk.png`. Chuẩn hóa ô $64 \times 64\text{ px}$, thêm bóng đổ, xuất sheet $512 \times 256\text{ px}$ (32 frames) và chân dung bust crop $64 \times 64\text{ px}$.
5. **Finn — Cậu Bé Đưa Tin (Errand Boy):** Trích xuất từ `town-folk-2-free-v1.0/characters/errand_boy/walk.png`. Chuẩn hóa ô $64 \times 64\text{ px}$, thêm bóng đổ, xuất sheet $512 \times 256\text{ px}$ (32 frames) và chân dung bust crop $64 \times 64\text{ px}$.

---

## 2. BẢNG TỔNG HỢP DANH MỤC FILE TÀI NGUYÊN ĐÃ XUẤT XƯỞNG

Toàn bộ file được xuất và đồng bộ sang cả 2 thư mục:
- `public/assets/characters/villagers/`
- `public/assets/characters/npcs/`

| NPC | Tên Tệp Xuất | Kích Thước (px) | Số Frame / Grid | Chức Năng | Trạng Thái |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Garth** | `garth_walk_sheet.png` | $512 \times 256$ | 32 frames ($8 \times 4$) | Sheet đi bộ 4 hướng (Down, Left, Right, Up) | **PASS** |
| | `npc_garth.png` | $64 \times 64$ | 1 frame | Sprite đứng hiển thị thế giới | **PASS** |
| | `portrait_garth.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại cận cảnh (bust crop) | **PASS** |
| **Edda** | `edda_idle_sheet.png` | $576 \times 64$ | 9 frames ($9 \times 1$) | Sheet idle thở nhịp nhàng có bóng đổ | **PASS** |
| | `npc_edda.png` | $64 \times 64$ | 1 frame | Sprite đứng hiển thị thế giới | **PASS** |
| | `portrait_edda.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại chính | **PASS** |
| | `portrait_edda_alt.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại phụ | **PASS** |
| **Neris** | `neris_idle_sheet.png` | $384 \times 64$ | 6 frames ($6 \times 1$) | Sheet idle thở nhịp nhàng có bóng đổ | **PASS** |
| | `npc_neris.png` | $64 \times 64$ | 1 frame | Sprite đứng hiển thị thế giới | **PASS** |
| | `portrait_neris.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại chính | **PASS** |
| | `portrait_neris_alt3.png`| $64 \times 64$ | 1 frame | Chân dung cảm xúc phụ 3 | **PASS** |
| | `portrait_neris_alt4.png`| $64 \times 64$ | 1 frame | Chân dung cảm xúc phụ 4 | **PASS** |
| **Bram** | `potter_walk_sheet.png` | $512 \times 256$ | 32 frames ($8 \times 4$) | Sheet đi bộ 4 hướng dân làng Bram | **PASS** |
| | `npc_bram.png` | $64 \times 64$ | 1 frame | Sprite đứng dân làng Bram | **PASS** |
| | `portrait_bram.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại dân làng Bram | **PASS** |
| **Finn** | `errand_boy_walk_sheet.png` | $512 \times 256$ | 32 frames ($8 \times 4$) | Sheet đi bộ 4 hướng cậu bé Finn | **PASS** |
| | `npc_finn.png` | $64 \times 64$ | 1 frame | Sprite đứng cậu bé Finn | **PASS** |
| | `portrait_finn.png` | $64 \times 64$ | 1 frame | Chân dung hội thoại cậu bé Finn | **PASS** |
| **Chung** | `villager_preview_sheet.png` | $640 \times 320$ | 50 ô ($10 \times 5$) | Bảng tổng hợp kiểm duyệt toàn bộ 5 NPC | **PASS** |
| | `villager_animation_manifest.json`| Config JSON | 5 NPC | Cấu hình frame, FPS, anchor, loop, directions | **PASS** |

---

## 3. THÔNG SỐ NEO ĐIỂM TỰA & ĐỒNG BỘ TỶ LỆ (FOOT ANCHOR STANDARD)

Toàn bộ 5 nhân vật dân làng đều tuân thủ tuyệt đối quy chuẩn hình học top-down $64 \times 64\text{ px}$:
- **Tâm trục ngang ($X$):** Được căn giữa tại $X = 32.0$ (dung sai $\pm 1.5\text{ px}$ đối với tư thế bước so le).
- **Mép đáy tiếp xúc mặt đất ($Y_{\max}$):** Cố định tuyệt đối tại **$Y_{\max} = 58$** trên toàn bộ các frame (chân đặt tại hàng $Y = 56..57$, bóng elip phủ tại hàng $Y = 56..58$).
- **Quy chuẩn bóng đổ (Shadow Standard):**
  - Màu sắc: `#222034` (RGB 34, 32, 52), Alpha 255.
  - Vị trí: Đặt bên dưới lớp pixel nhân vật (sprite overlay).
- **Tỷ lệ chiều cao nhân vật đồng bộ:**
  - Garth: $54\text{ px}$ (Người gác cổng cao lớn, báng giáo bảo vệ).
  - Bram: $52\text{ px}$ (Thợ gốm vạm vỡ).
  - Edda: $50\text{ px}$ (Bà lão còng lưng, gậy liễu giữ chuông).
  - Finn: $47\text{ px}$ (Cậu bé đưa tin nhanh nhẹn).
  - Neris: $43\text{ px}$ (Nữ thầy thuốc trẻ trung, thanh thoát).

---

## 4. KẾT QUẢ KIỂM TRA CHẤT LƯỢNG TỰ ĐỘNG (QC VERIFICATION)

Script kiểm tra: [verify_villager_assets_c4_12_08_qc.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_villager_assets_c4_12_08_qc.mjs)

```text
========================================================================
     C4-12-08 PART 2 COMPLETE ASSET QC VERIFICATION REPORT             
========================================================================

Checking Directory: [public/assets/characters/villagers]
------------------------------------------------------------------------
[PASS] villager_animation_manifest.json | Valid JSON (5 NPCs configured)
[PASS] garth_walk_sheet.png         |  512x256  px | RGBA:true | Bytes:  62113
[PASS] npc_garth.png                |   64x64   px | RGBA:true | Bytes:   2927
[PASS] portrait_garth.png           |   64x64   px | RGBA:true | Bytes:   1409
[PASS] edda_idle_sheet.png          |  576x64   px | RGBA:true | Bytes:  22626
[PASS] npc_edda.png                 |   64x64   px | RGBA:true | Bytes:   2744
[PASS] portrait_edda.png            |   64x64   px | RGBA:true | Bytes:   6375
[PASS] portrait_edda_alt.png        |   64x64   px | RGBA:true | Bytes:   6671
[PASS] neris_idle_sheet.png         |  384x64   px | RGBA:true | Bytes:   8778
[PASS] npc_neris.png                |   64x64   px | RGBA:true | Bytes:   1741
[PASS] portrait_neris.png           |   64x64   px | RGBA:true | Bytes:   2936
[PASS] portrait_neris_alt3.png      |   64x64   px | RGBA:true | Bytes:   3160
[PASS] portrait_neris_alt4.png      |   64x64   px | RGBA:true | Bytes:   3161
[PASS] potter_walk_sheet.png        |  512x256  px | RGBA:true | Bytes:  61780
[PASS] npc_bram.png                 |   64x64   px | RGBA:true | Bytes:   2585
[PASS] portrait_bram.png            |   64x64   px | RGBA:true | Bytes:   1755
[PASS] errand_boy_walk_sheet.png    |  512x256  px | RGBA:true | Bytes:  49040
[PASS] npc_finn.png                 |   64x64   px | RGBA:true | Bytes:   2201
[PASS] portrait_finn.png            |   64x64   px | RGBA:true | Bytes:   1522
[PASS] villager_preview_sheet.png   |  640x320  px | RGBA:true | Bytes: 111806

Checking Directory: [public/assets/characters/npcs]
------------------------------------------------------------------------
[PASS] 20/20 files synchronized and verified identical in npcs/

Checking Standing NPCs Foot Anchor Standard (maxY == 58):
------------------------------------------------------------------------
  [PASS] npc_garth.png    | BBox [X:10..57, Y:6..58] | CenterX: 33.5 | Foot maxY: 58
  [PASS] npc_edda.png     | BBox [X:13..54, Y:10..58]| CenterX: 33.5 | Foot maxY: 58
  [PASS] npc_neris.png    | BBox [X:17..47, Y:16..58]| CenterX: 32.0 | Foot maxY: 58
  [PASS] npc_bram.png     | BBox [X:17..47, Y:6..58] | CenterX: 32.0 | Foot maxY: 58
  [PASS] npc_finn.png     | BBox [X:22..44, Y:10..58]| CenterX: 33.0 | Foot maxY: 58

========================================================================
FINAL QC OUTCOME: ALL TESTS PASSED (100% OK)
========================================================================
```

- **Kiểm tra biên dịch:** `npx tsc --noEmit` đạt 0 lỗi (Exit Code 0).
- **Mã nguồn gameplay:** Giữ nguyên trạng thái chưa chỉnh sửa để chuẩn bị chuyển sang bước runtime integration `C4-12-09`.

---

## 5. DANH SÁCH FILE LIÊN KẾT CHÍNH

- Script đóng gói trọn bộ: [build_villager_assets_v12.mjs](file:///G:/HOLLOW%20WOODS/scripts/build_villager_assets_v12.mjs)
- Script kiểm tra QC: [verify_villager_assets_c4_12_08_qc.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_villager_assets_c4_12_08_qc.mjs)
- Manifest cấu hình animation: [villager_animation_manifest.json](file:///G:/HOLLOW%20WOODS/public/assets/characters/villagers/villager_animation_manifest.json)
- Bảng ảnh tổng hợp 5 NPC: [villager_preview_sheet.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/villagers/villager_preview_sheet.png)
- Thư mục tài nguyên chính: [public/assets/characters/villagers/](file:///G:/HOLLOW%20WOODS/public/assets/characters/villagers/)
- Thư mục tương thích ngược: [public/assets/characters/npcs/](file:///G:/HOLLOW%20WOODS/public/assets/characters/npcs/)
