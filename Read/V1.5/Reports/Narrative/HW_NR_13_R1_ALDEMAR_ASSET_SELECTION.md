# HW-NR-13-R1 — SIR ALDEMAR EXISTING ASSET SELECTION

- **Mission ID:** `HW-NR-13-R1 — SIR ALDEMAR EXISTING ASSET SELECTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`SUPERSEDES: HW-NR-13` · `DEPENDENCY: HW-NR-12-R3 ASSET INVENTORY` · `MODE: EXISTING ASSET FIRST`)
- **Trạng thái nghiệm thu:** **`CANDIDATES IDENTIFIED / DIRECT DROP-IN BLOCKED — CHỜ OWNER QUYẾT ĐỊNH`**

> [!IMPORTANT]
> **Kết luận trung thực theo quy tắc *“Ưu tiên asset có sẵn, không dùng blockout thô, báo BLOCKED nếu chưa có asset khớp hoàn toàn”*:**  
> Nguyên mẫu hình khối cũ của `HW-NR-13` ([Prototypes/Sir_Aldemar](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Aldemar/aldemar_topdown_prototype_sheet.png)) **chính thức bị loại khỏi đường dẫn production** (chỉ giữ làm tài liệu lịch sử). Tận dụng danh mục đã kiểm kê từ `HW-NR-12-R3`, trong kho hiện có **`3` ứng viên thật khả thi nhất** về thẩm mỹ cổ kính / giáp xám tro – bạc cũ và giấy phép hợp lệ, nhưng **chưa có asset nào thả thẳng được vào game Top-Down 4 hướng mà không bổ sung hướng nhìn hoặc bảng màu**. Do đó trạng thái hiện tại là **`DIRECT DROP-IN BLOCKED — CHỜ OWNER DUYỆT PHƯƠNG ÁN`**.

---

## 1. Xác Minh Danh Sách Asset Ưu Tiên & Loại Trừ (`Art Direction §3–4`)

Theo định hướng mỹ thuật của **`Sir Aldemar — The Ashen Knight`** (*giáp xám tro hoặc bạc cũ, phong cách cổ kính, trang phục có chiều sâu, phân biệt rõ với Roderick/Mordric/Vaelen và đồng chất lượng Meliodas*):

| Gói / Asset Được Yêu Cầu Kiểm Tra | Vị Trí Trên Đĩa & Nguồn | Giấy Phép (`License`) | Kết Quả Thẩm Định Chi Tiết |
|---|---|---|---|
| **`Maxime_Nourry_Knight` (`Knight.zip`)** | `Pixel_Art/Characters/Knights/Maxime_Nourry_Knight/` (`Knight.zip` SHA-256 `c5ff5dce...`) | **VERIFIED OK** (`License.txt`: thương mại/cá nhân & chỉnh sửa OK; cấm repackage; credit tùy chọn `Maxime Nourry`) | **ỨNG VIÊN #1** — Cell `90×90 px`, thân `~44 px` (khớp sát `Meliodas ~45 wpx`). Có `Idle`, `Attack`, `Roll`, **`knight-rest_sheet.png` (ngồi tựa khiên tròn)**, `knight-drink_sheet`, `death1/2`. Sắc xám tro phong hóa + mũ Sallet + khiên tròn rất hợp thần thái cổ kính; tuy nhiên là **Side-View 1 hướng** (hoặc chỉ dùng được làm NPC ngồi tĩnh như `campfire_knight`). |
| **`Lantern_Knight` (`DarkFantasy_FREE_Starter`)** | `14_New_Downloaded_Packs/Dark_Fantasy/DarkFantasy_Starter/.../Lantern_Knight/` | **VERIFIED OK + AI Note** (`LICENSE.txt` Dubular: thương mại & chỉnh sửa/nhuộm màu OK; công bố AI-assisted gốc) | **ỨNG VIÊN #2** — **Top-Down `3/4` thật**, thân `90 px` trong cell `128×128` (`0.50×` = **`45 px`**), giáp cổ điển nhiều lớp (`tabard`, `greaves`, giáp vai phân tầng), có `idle/walk/block/attack/hurt/death`. Điểm trừ: gói Free **chỉ có hướng `down`** (thiếu `up/left/right`), bảng màu áo choàng đang xanh dương (`#3E6A8E`), cần nhuộm lại sang xám tro/lam tro (`#485E60`). |
| **`knight-character-sprites-pixel-art.zip` (`CraftPix Knight_1`)** | `Pixel_Art/Rar/Characters/knight-character-sprites-pixel-art.zip` | **CraftPix Free License** (`License.txt` link `craftpix.net/file-licenses/`: thương mại/cá nhân OK, cấm resale) | **ỨNG VIÊN #3** — `Knight_1` mang giáp bạc sáng + khiên tròn + kiếm (`12` chuỗi `Idle/Walk/Run/Attack 1–3/Defend/Protect/Hurt/Dead`, cell `86 px` / `128×128`, thân `64 px` $\rightarrow$ `~47 px` ở `0.73×`). Không gán chỉ vì màu xám mà nhờ **khiên tròn + Silhouette phân tách rõ** với `Heavy_Knight` (Roderick) & `Vaelen`. Điểm trừ: **Side-View Only**, outline đậm sáng hơn tông trầm Hollow Woods (cần giảm bão hòa + vẽ Top-Down). |
| **`Dark Fantasy Knight` (`BentoPack` / Kiểm tra `Darkplates`)** | `Pixel_Art/Rar/Characters/dark-fantasy-knight-free-knight.zip` (`0` tệp tên `*darkplate*` tồn tại trong kho hay `Rar.rar`) | **VERIFIED OK + AI Note** (`LICENSE.txt` Bento Pack: cho phép render 2D phân phối thương mại) | **CHƯA ĐƯA VÀO TOP 3 TRỰC TIẾP** — Toàn repo không có pack nào tên `Darkplates` (`0` kết quả); bản 3D có sẵn là `BentoPack Dark Fantasy Knight` (`SK_Knight.fbx`). Ngoài việc **chưa cài Blender trên workstation**, silhouette giáp đen nặng của BentoPack quá gần `Meliodas` và `Roderick`, thiếu nét cổ kính riêng cho Aldemar nếu chưa đổi shader bạc cũ/áo choàng. |
| **`Mystic_Autumn_Knights`** | `Pixel_Art/Characters/Knights/Mystic_Autumn_Knights/` (`Mystic Autumn Knights.zip`) | **UNVERIFIED (NO LICENSE IN ZIP)** | **LOẠI HOÀN TOÀN** — Nền caro xám-trắng opaque không có alpha (`640×640`), chữ **`IDLE / RUN / ROLL / HIT / DEATH` dính chết trên sprite**, thiếu file license, chỉ có Side-View. |
| **`HW-NR-13` Prototype Cũ** | `Pixel_Art/Characters/Prototypes/Sir_Aldemar/aldemar_topdown_prototype_sheet.png` | Tài sản nội bộ cũ (`blockout proxy`) | **ĐÃ TỪ CHỐI PRODUCTION — GIỮ LỊCH SỬ** (`0` xóa file cũ; chỉ đặt cạnh để đối chiếu tỷ lệ trong contact sheet). |

---

## 2. Phân Tích Định Hướng Mỹ Thuật & Khả Năng Chỉnh Bảng Màu (`§4`)

- **Phân biệt nhận diện trong Đoàn Kỵ Sĩ:**
  - `Meliodas` (*Black Knight*): Giáp đen-than, chùm lông tím-đỏ sẫm, đao cong cam vàng.
  - `Sir Vaelen` (*Silent Knight*): Giáp thép + vạt nâu-đỏ, đứng tựa trường kiếm.
  - `Sir Roderick` (*Crimson Knight*): Trọng giáp vai lớn + chùm lông/vạt **đỏ thẫm** (`Heavy_Knight_Free` ref).
  - **`Sir Aldemar` (*Ashen Knight*):** Giáp **xám tro / bạc phong hóa** (`#62686E` / `#969DA2` / `#BDC4C7`) + điểm nhấn **đồng cổ / lam tro trầm** (`#485E60` & `#8C7D54`) + **khiên tròn** hoặc dáng nghỉ cổ kính (*lắng đọng ký ức*).
- **Đề xuất chỉnh sửa bảng màu hợp lệ theo Giấy phép (không vẽ lại toàn bộ nhân vật):**
  - Với **`Lantern_Knight`** (`LICENSE.txt` cho phép *"Edit, recolour, cut up..."*): có thể chỉnh palette phần giáp sáng thêm ánh bạc tro và đổi áo tabard xanh dương hiện tại sang **xám-lam tro cổ `#485E60` + viền đồng rêu `#8C7D54`**, giúp tách biệt hoàn toàn khỏi phương án Đỏ Thẫm của `Sir Roderick`.
  - Với **`Maxime_Nourry_Knight`** (`License.txt` cho phép *"Modify, edit, and adapt"*): giữ nguyên tông xám tro nguyên bản đã rất chuẩn mực, chỉ tinh chỉnh nhẹ độ tương phản viền đồng/khiên khi chuyển sang Top-Down hoặc dùng làm tư thế ngồi tĩnh.

---

## 3. Bằng Chứng Trực Quan & Đối Chiếu Tỷ Lệ (`Read/V1.5/Reports/Visuals/HW-NR-13-R1/`)

1. **Tổng hợp tối đa `3` ứng viên thật cho Sir Aldemar (kèm bảng swatch & khoảng trống kỹ thuật):**  
   🖼️ [ALDEMAR_REAL_ASSET_CANDIDATES.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13-R1/ALDEMAR_REAL_ASSET_CANDIDATES.png)
2. **So sánh cùng tỷ lệ (`2.5×` Zoom trên ground baseline) với `Meliodas`, `Sir Vaelen`, `Sir Roderick candidates` & `Prototype Aldemar cũ`:**  
   🖼️ [ALDEMAR_KNIGHT_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13-R1/ALDEMAR_KNIGHT_COMPARISON.png)

---

## 4. Phương Án Trình Project Owner Phê Duyệt (`OWNER GATE`)

1. **Phương án A *(Ưu tiên cho NPC Di Tích / Ngồi Tĩnh như Vaelen)*:** Chọn **`Maxime_Nourry_Knight`** (`knight-rest_sheet.png` + `idle`) làm NPC tĩnh giữ di tích trong thời gian đầu — **0 lệch tông mỹ thuật, đúng `44 px`, license sạch**; nếu cần Aldemar đi lại `4` hướng sau này thì đặt vẽ thêm `3` hướng `up/down/left` theo cùng nét.
2. **Phương án B *(Ưu tiên Top-Down `3/4` có sẵn Rig nếu mua pack hoặc bổ sung `U/L/R`)*:** Dùng **`Lantern_Knight` (`down`)** đổi bảng màu sang *Ashen Steel + Slate-Ash* theo license Dubular và bổ sung `3` hướng `up/left/right` (dùng chung nền kỹ thuật với `Sir Roderick` nhưng khác hoàn toàn bảng màu & khí chất — lưu ý vẫn cần tạo sự khác biệt silhouette mũ/khiên nếu cùng dùng chung base).
3. **Phương án C *(Side-View Combat Reference)*:** Dùng **`CraftPix Knight_1`** làm visual reference cho giáp bạc + khiên tròn trước khi dựng bộ Top-Down `4` hướng riêng.
4. **Phương án D *(Giữ trạng thái `BLOCKED`)*:** Tạm dừng triển khai nhân vật `Sir Aldemar` cho đến khi có bộ sprite Top-Down `4` hướng đạt chuẩn mỹ thuật ngang `Meliodas Blackwood`.

---

## 5. Hard Stop Compliance
- `0` tự vẽ sprite khối mới hay tạo animation giả.
- `0` thay đổi Lore, `0` đưa Aldemar vào production (`src/` & `public/assets/` giữ nguyên `0` sửa đổi).
- `0` xóa prototype `HW-NR-13` cũ và `0` xóa các file archive `.zip`/`.png` gốc; `0` commit/push.
