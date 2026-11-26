# HW-NR-14-R1 — HEADLESS WARDEN ASSET-BASED QUALITY REVIEW

- **Mission ID:** `HW-NR-14-R1 — HEADLESS WARDEN ASSET-BASED QUALITY REVIEW`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`SUPERSEDES: HW-NR-14` · `MODE: ASSET RESEARCH & VISUAL QUALITY REVIEW`)
- **Primary Design Reference:** [Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png](file:///G:/HOLLOW%20WOODS/HW/Trailer/B%E1%BA%A3ng%20thi%E1%BA%BFt%20k%E1%BA%BF%20Hi%E1%BB%87p%20s%C4%A9%20V%C3%B4%20di%E1%BB%87n%20Hollow%20Woods.png) (`1448×1086`)
- **Trạng thái nghiệm thu:** **`BLOCKED — KHÔNG CÓ ASSET ĐẠT CHUẨN & KHÔNG KHẢ THI GHÉP TỪ KHO HIỆN CÓ`**

> [!CAUTION]
> **Kết luận thẳng thắn theo Chỉ thị Owner (`§1` & `§5`):**  
> 1. **Từ chối hoàn toàn đưa vào sử dụng bộ prototype tự vẽ bằng code của `HW-NR-14`** (`HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/` & `LAB_03_HEADLESS_WARDEN_SANDBOX`): khi đặt cạnh [concept chuẩn của Owner](file:///G:/HOLLOW%20WOODS/HW/Trailer/B%E1%BA%A3ng%20thi%E1%BA%BFt%20k%E1%BA%BF%20Hi%E1%BB%87p%20s%C4%A9%20V%C3%B4%20di%E1%BB%87n%20Hollow%20Woods.png), bản prototype hình khối chữ nhật quá thô sơ, không thể hiện được kết cấu giáp tối khắc rễ đồng, áo choàng rách hai tà đỏ rượu, dáng chiến mã và uy lực linh hỏa xanh bạc. *(Vẫn giữ nguyên thư mục prototype làm tài liệu lịch sử, tuyệt đối không xóa).*  
> 2. **Cả `3` phương án A, B, C dùng asset sẵn có đều `KHÔNG KHẢ THI` (`BLOCKED`)** vì kho hiện tại **thiếu hoàn toàn** bộ sprite chiến mã Dark Fantasy Top-Down, kỵ sĩ cưỡi ngựa vô diện và FX linh hỏa xanh bạc. Đề xuất **giao họa sĩ Pixel Art thực hiện nguyên bản** hoặc **bổ sung tài nguyên thương mại hợp pháp mới** trước khi tiếp tục sản xuất boss này.

---

## 1. Đánh Giá Chất Lượng Prototype Cũ (`HW-NR-14`) So Với Concept Owner

Đối chiếu trực quan tại [HEADLESS_WARDEN_CONCEPT_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14-R1/HEADLESS_WARDEN_CONCEPT_COMPARISON.png):
- **Concept Owner (`1448×1086`)** đòi hỏi độ tinh xảo **Atmospheric Dark Fantasy** rất cao: giáp thép obsidian nứt rạn gắn hoa văn rễ cây bằng đồng cổ, áo choàng đỏ rượu rách tả tơi phất rộng sau chiến mã phủ giáp đồng *chanfron*, linh hỏa xanh bạc (`#E5F5EB` / `#8FD0AC`) uốn lượn tự nhiên ở hốc cổ, bờm, đuôi, móng ngựa và lưỡi đại kiếm qua `Idle`, `Run`, `Attack`, `Hurt`, `Death`.
- **Prototype `HW-NR-14` (`headless_warden_master_sheet.png`)** dù đúng kỹ thuật (`128×128`, `88` frames, tách `L1/L2/L3`, `origin 0.5, 1.0`), nhưng về **năng lực mỹ thuật thực tế (`pixel-level craftsmanship`) hoàn toàn không đạt chuẩn sản phẩm** so với `Meliodas Blackwood`, `Hooded Knight` và chính bản concept của Owner.

---

## 2. Kết Quả Rà Soát Kho Tài Nguyên & Bảo Vệ `Dread Horseman`

Chi tiết kiểm kê đầy đủ từng tệp được ghi trong [HEADLESS_WARDEN_MOUNT_AND_FX_INVENTORY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_MOUNT_AND_FX_INVENTORY.md) và ảnh [HEADLESS_WARDEN_EXISTING_ASSET_CANDIDATES.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14-R1/HEADLESS_WARDEN_EXISTING_ASSET_CANDIDATES.png):

- **Bảo vệ tuyệt đối `Dread Horseman` (`§4`):** Đã kiểm tra `public/assets/characters/enemies/dread_horseman_sheet.png` (`448×384`, ô `64×64`, `vis_h = 41–56 px`). Phát hiện asset runtime này chính là bộ `PixelHorse_V1.0` (`HorseRider_I` / `II`, Side-View, không có `LICENSE.txt` đi kèm trong `.rar`). **Không thay đổi, không đổi tên, không tái sử dụng cho `The Headless Warden`** để tránh trùng silhouette kẻ địch và giữ an toàn runtime hiện tại.

---

## 3. Thẩm Định Tính Khả Thi Của `3` Phương Án (`Feasibility §5`)

| Phương Án | Điều Kiện Cần | Thực Trạng Trong `HOLLOW_WOODS_EXPORT` | Kết Luận |
|---|---|---|:---:|
| **A. Dùng asset 2D hoàn chỉnh (kỵ sĩ + chiến mã)** | Sprite nguyên bộ kỵ sĩ không đầu cưỡi ngựa giáp tối/choàng đỏ, Top-Down `3/4`, sạch bản quyền | Trong kho chỉ có `Dread Horseman` / `PixelHorse_V1.0` (`64×64` side-view đang dùng, thiếu license offline) và `N3XUS Black Panther` (báo chibi). Gói `Mattz Art` bị cấm theo `ART-K01`. **Có `0` bộ phù hợp.** | **KHÔNG KHẢ THI (`BLOCKED`)** |
| **B. Kết hợp Knight + Mount + FX sẵn có (tương thích license)** | Ghép được phần kỵ sĩ cưỡi, thân chiến mã Top-Down và FX linh hỏa xanh bạc đồng điệu mỹ thuật | - **Knight:** Các pack sạch (`Heavy_Knight_Free`, `Lantern_Knight`, `Maxime_Nourry`) chỉ có **tư thế đứng đất**, góc side-view hoặc chỉ 1 hướng `down`, không ghép lên yên ngựa được.<br>- **Mount:** Không có ngựa chiến Top-Down `128×128` hợp lệ bản quyền.<br>- **FX:** `GandalfHardcore FX` quá nhỏ/chibi; `Hooded Knight FX` thiếu license; `Meliodas fire` màu cam vàng. | **KHÔNG KHẢ THI (`BLOCKED`)** |
| **C. Render mô hình 3D có rig thành sprite 2D** | Có file nguồn 3D (`.fbx`/`.blend`) của **cả kỵ sĩ lẫn chiến mã**, phần mềm Blender & shader đồng bộ | `BentoPack Dark Fantasy Knight` (`SK_Knight.fbx`) **chỉ có model người đi bộ**, **KHÔNG có model 3D chiến mã**, không có áo choàng hai tà hay shader linh hỏa, đồng thời **workstation chưa cài Blender**. (`PeacockKnightPackage` chỉ là UE4 `.exe/.pak`). | **KHÔNG KHẢ THI (`BLOCKED`)** |

---

## 4. Đề Xuất Hành Động Trình Project Owner (`OWNER DECISION REQUIRED`)

Vì **cả 3 phương án A, B, C đều không khả thi** với tài nguyên đang có, theo đúng chỉ thị `§1 & §5` (*không tự tạo sprite chất lượng thấp để lấp khoảng trống*), đề xuất Owner chọn 1 trong 2 hướng sau:

1. **Giao họa sĩ Pixel Art chuyên nghiệp vẽ tay nguyên bản theo đúng Concept Sheet + Spec `ART-K01`:**
   - Xuất bộ sheet Top-Down `3/4` `4` hướng (`128×128` hoặc `160×160`), tách lớp `L1_Mount`, `L2_Rider`, `L3_Spectral_FX`, `L0_Shadow` dựa trên bảng màu & tỉ lệ `~72–100 px` đã khóa cạnh `Meliodas (45 wpx)` và `Hooded Knight (71 px)`.
2. **Tìm & cấp phép bổ sung gói tài nguyên Pixel Art / 3D mới đạt chuẩn:**
   - Thu thập bộ *Undead Cavalry / Dark Mounted Knight + Warhorse* có license thương mại hợp pháp (khác `Mattz Art` nếu giữ lệnh cấm `ART-K01`), kèm cài đặt **Blender** nếu Owner muốn đi theo quy trình render 3D $\rightarrow$ 2D cho các boss phức tạp.

*(Trong thời gian chờ Owner duyệt phương án tài nguyên mới, giữ trạng thái **`The Headless Warden: ART BLOCKED`**, không gắn boss AI hay gameplay mới vào production).*

---

## 5. Tài Liệu & Bằng Chứng Trực Quan Đính Kèm (`Visuals/HW-NR-14-R1/`)

- 📄 [HEADLESS_WARDEN_MOUNT_AND_FX_INVENTORY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_MOUNT_AND_FX_INVENTORY.md) — Bảng kiểm kê chi tiết Mount, Rider, Undead, FX, 3D và phần đã có / còn thiếu.
- 📄 [HW_NR_14_R1_HEADLESS_WARDEN_REVIEW.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_14_R1_HEADLESS_WARDEN_REVIEW.md) — Báo cáo đánh giá chất lượng & khả thi chính thức.
- 🖼️ [HEADLESS_WARDEN_EXISTING_ASSET_CANDIDATES.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14-R1/HEADLESS_WARDEN_EXISTING_ASSET_CANDIDATES.png) — Tổng hợp toàn bộ mount, knight, undead & FX hiện có cùng kết quả thẩm định.
- 🖼️ [HEADLESS_WARDEN_CONCEPT_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14-R1/HEADLESS_WARDEN_CONCEPT_COMPARISON.png) — Đối chiếu trực diện Concept chuẩn của Owner với prototype `HW-NR-14` bị từ chối, `Dread Horseman`, `Meliodas` và `Hooded Knight`.

---

## 6. Hard Stop Compliance
- `0` tự thiết kế lại sprite hay thêm placeholder cho `The Headless Warden`.
- `0` tạo boss AI hay gameplay mới; `0` sao chép sprite trái giấy phép; `0` chỉnh sửa/đổi tên `Dread Horseman`.
- `0` xóa prototype `HW-NR-14` cũ hoặc backup; `0` chỉnh sửa `src/` hay `public/assets/`; `0` commit/push.
