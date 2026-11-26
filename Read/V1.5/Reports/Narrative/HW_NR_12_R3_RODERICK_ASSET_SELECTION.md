# HW-NR-12-R3 — SIR RODERICK EXISTING ASSET SELECTION

- **Mission ID:** `HW-NR-12-R3 — SIR RODERICK EXISTING ASSET SELECTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` (`SUPERSEDES: NR-12, NR-12-R1, NR-12-R2` · `MODE: EXISTING ASSET FIRST`)
- **Asset Root Audited:** `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\` (và đối chiếu runtime `G:\HOLLOW WOODS\public\assets\characters\`)
- **Trạng thái nghiệm thu:** **`CANDIDATES IDENTIFIED / DIRECT DROP-IN BLOCKED — CHỜ OWNER QUYẾT ĐỊNH`**

> [!IMPORTANT]
> **Kết luận trung thực theo nguyên tắc *“Chất lượng mỹ thuật quan trọng hơn số lượng nhiệm vụ PASS”*:**  
> Toàn bộ `16` gói/nhân vật kỵ sĩ trong `HOLLOW_WOODS_EXPORT` đã được kiểm kê vật lý. **KHÔNG có bất kỳ asset nào sẵn có đáp ứng đồng thời cả `5` điều kiện production** (*Top-Down 4 hướng + Bản quyền sạch + Dark Fantasy Giáp Thép/Áo Choàng Đỏ Thẫm + Đồng bộ tỷ lệ `~45–48 px` với Meliodas/Vaelen + Đủ bộ animation NPC/chiến đấu*). Vì vậy tài liệu giữ nguyên tắc **cấm tự vẽ nhân vật bằng hình khối/polygon, cấm phóng ghép hay thay bằng ảnh placeholder** và trình **`3` ứng viên thực tế nhất** kèm khoảng trống cụ thể để **Project Owner chọn hướng xử lý**.

---

## 1. Xác Nhận Từ Chối Prototype Cũ (`HW-NR-12`) & Bảo Toàn Lịch Sử

- **Từ chối dứt điểm đưa vào production:** Bộ sprite nguyên mẫu hình khối `roderick_topdown_prototype_sheet.png` và `roderick_portrait_64x64.png` tại `HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Roderick/` **không được sử dụng làm ứng viên hay đưa vào game**.
- **Bảo toàn tài liệu lịch sử:** Giữ nguyên hiện trạng các tệp `HW-NR-12` trong thư mục `Prototypes/Sir_Roderick/` và `LAB_02_KNIGHT_VISUAL_SANDBOX` để đối chiếu lịch sử; không xóa archive hay tệp cũ.

---

## 2. Kiểm Kê Toàn Bộ Kho Tài Nguyên Kỵ Sĩ Hiện Có (`HOLLOW_WOODS_EXPORT`)

Bảng kiểm kê thực tế trên đĩa (`Pixel_Art/Characters/`, `Pixel_Art/Rar/Characters/`, `Pixel_Art/14_New_Downloaded_Packs/`):

| # | Asset / Gói Nguồn | Đường Dẫn Chính | Giấy Phép (`License`) | Góc Nhìn & Kích Thước | Đánh Giá Cho `Sir Roderick` |
|---:|---|---|---|---|---|
| 1 | **`Meliodas Blackwood` (`BK V2`)** | `public/assets/characters/black_knight/` + `01_Characters/Player/Meliodas_Blackwood/` | Fellor Commercial OK + Codex V2 | Top-Down `3/4` 4 hướng (`64×64 @ 1.50×`, `~45 wpx`) | **BASELINE HERO — Giữ nguyên, cấm thay thế** |
| 2 | **`Sir Vaelen` (`campfire_knight`)** | `public/assets/characters/npcs/campfire_knight_idle_sheet.png` | Verified runtime | Top-Down NPC (`64×64 @ 1.00×`, `47 px`) | **BASELINE NPC — Chuẩn tỷ lệ kỵ sĩ** |
| 3 | **`Fallen Knight` & `Hooded Knight`** | `public/assets/characters/enemies/`, `bosses/` | Verified runtime | Top-Down (`64×64` `47 px` & `160×160` `71 px`) | **BASELINE ENEMY/BOSS** |
| 4 | **`Heavy_Knight_Free` (`Art by Jahnu`)** | `Pixel_Art/Characters/Knights/Heavy_Knight_Free/` (`heavy_knight_free.zip`) | **VERIFIED OK** (Commercial & Edit OK; cấm resale/NFT/AI) | **Side-View Only** (`208×112`, `vis=45×60 px`, `7` sheet) | **ỨNG VIÊN #1** *(tối ưu tông mỹ thuật & đỏ thẫm, thiếu 4 hướng Top-Down)* |
| 5 | **`Lantern_Knight` (`DarkFantasy_FREE_Starter`)** | `14_New_Downloaded_Packs/Dark_Fantasy/DarkFantasy_Starter/.../Lantern_Knight/` | **VERIFIED OK + AI Note** (Dubular Game Shop; commercial & edit/recolor OK) | **Top-Down `3/4` — CHỈ CÓ HƯỚNG `down`** (`128×128`, `vis=48×90 px`) | **ỨNG VIÊN #2** *(đúng góc nhìn Top-Down Dark Fantasy, thiếu `up/left/right` & cần nhuộm đỏ)* |
| 6 | **`BentoPack Dark Fantasy Knight` (`3D FBX`)** | `Pixel_Art/Rar/Characters/dark-fantasy-knight-free-knight.zip` | **VERIFIED OK + AI Note** (Tripo + Kimodo; commercial & 2D render distribution OK; cấm lộ FBX thô) | **3D Rigged FBX** (`517,488` tris, `70` xương, `4K` PBR, `306 + 7` clip) | **ỨNG VIÊN #3** *(khả thi về license nhưng **BLOCKED máy hiện tại vì chưa cài Blender** + chưa có áo choàng đỏ)* |
| 7 | **`N3XUS Iron Knight` (`Free v1.1`)** | `Pixel_Art/Rar/Characters/N3XUS-Starter-FREE-v1.1.zip` | **VERIFIED OK (Credit Required)** (`"Art by N3XUS - n3xus.dev"`) | **Top-Down 4 hướng** (`32×64`, `46 px`, `idle/walk/talk` + portrait `64×64`) | **LOẠI** — Tỷ lệ chibi đầu to sáng màu (vàng/xanh dương) lệch hoàn toàn tông Dark Fantasy; thiếu combat |
| 8 | **`Maxime_Nourry_Knight` (`Knight.zip`)** | `Pixel_Art/Characters/Knights/Maxime_Nourry_Knight/` | **VERIFIED OK** (Maxime Nourry) | **Side-View Only** (`90×90`, `44 px`, sắc xám tro) | **GIỮ LÀM REF `Sir Aldemar`** (`HW-NR-13`) |
| 9 | **`2D_SL_Knight_v1.0_3`** | `Pixel_Art/Characters/Knights/2D_SL_Knight/` | **VERIFIED OK** (`license.txt` Public domain/commercial) | **Side-View Only** (`128×64`, `47 px`) | **LOẠI** — Đã là gốc của `Sir Vaelen` / `Fallen Knight`, dùng lại sẽ trùng silhouette |
| 10 | **`CraftPix Knight_1 / Knight_2 / Knight_3`** | `Pixel_Art/Rar/Characters/knight-character-sprites-pixel-art.zip` | **CraftPix Free License** | **Side-View Only** (`86 px` / `128×128`, `vis=43×64 px`) | **LOẠI** — Góc nhìn platformer ngang 1 chiều, phong cách outline sáng |
| 11 | **`PeacockKnightPackage` + `Shannon Symonds.pdf`** | `Pixel_Art/Rar/Characters/PeacockKnightPackage.zip`, `...Plan.pdf` | **NO LICENSE (UE4 Compiled Game `.exe`/`.pak` + Student PDF)** | Chỉ có `PeacockKnight2.exe` + `.pak` (`0` file `.fbx`/`.blend` xuất được) | **STRICTLY REFERENCE ONLY** — Không dùng sản xuất |
| 12 | **`EleonoreAndJoanna`** | `Pixel_Art/Characters/Knights/EleonoreAndJoanna/` | **VERIFIED OK** (`Contact.txt`/`License.txt`) | Side/`3/4`, `64×64` Idle-only (`9f` & `6f`) | **LOẠI** — Nhân vật nữ / pháp sư-kiếm sĩ |
| 13 | **`GandalfHardcore FREE Warrior`** | `Pixel_Art/Rar/Characters/GandalfHardcore FREE Warrior.zip` | GandalfHardcore standard terms | Side-View (`800×1088` tổng, `~44 px`) | **LOẠI** — Chiến binh mặc đồ da không giáp trụ, góc ngang |
| 14 | **`Water_Warrior`** | `Pixel_Art/Characters/Knights/Water_Warrior/` | **UNVERIFIED (NO LICENSE)** | Top-Down `3` hướng (`48×48`, `38 px`) | **LOẠI** — Thiếu license & chibi lệch tông |
| 15 | **`Mystic_Autumn_Knights`** | `Pixel_Art/Characters/Knights/Mystic_Autumn_Knights/` | **UNVERIFIED (NO LICENSE)** | Side-View (`640×640` **nền caro đặc + chữ `RUN/IDLE` dính ảnh**) | **LOẠI** — Thiếu license & lỗi alpha/watermark |

---

## 3. Phân Tích Chi Tiết 3 Ứng Viên Hàng Đầu Cho `Sir Roderick — The Crimson Knight`

### 🥇 Ứng viên 1 *(Ưu tiên B — Đồng bộ thẩm mỹ & màu đỏ thẫm cao nhất)*: `Heavy_Knight_Free` (`Art by Jahnu`)
- **Điểm mạnh thực tế:** Bộ giáp sắt tối nặng nề kèm **chùm lông mũ đỏ thẫm (`crimson plume`) và khố/vải giáp viền đỏ**, khí chất kỵ sĩ trang nghiêm trùng khớp nhất với đặc tả `CHAR-004` trên nền Dark Moss `#141712`. Đủ `7` chuỗi animation (`idle 12f`, `walk 8f`, `run 8f`, `jump 7f`, `light_attack`, `hurt`, `death`). Bản quyền thương mại hoàn toàn sạch.
- **Điểm nghẽn / Khoảng trống:** Là spritesheet **Side-View 1 hướng (nhìn phải)** kích thước `208×112` (`vis=45×60 px`). Phải quy chuẩn kích thước xuống `~0.78×` (`~47 px`, khớp `Vaelen`) và **vẽ tay/tác tạo `4` hướng Top-Down `3/4` dựa theo tham chiếu này** (hoặc Owner chỉ định dùng cho cảnh cắt ngang không di chuyển 4 hướng).

### 🥈 Ứng viên 2 *(Ưu tiên A/B — Đúng góc Top-Down `3/4` duy nhất trong kho sạch bản quyền)*: `Lantern_Knight` (`DarkFantasy_FREE_Starter`)
- **Điểm mạnh thực tế:** Góc nhìn **Top-Down `3/4` chuẩn xác**, tỷ lệ thực tế ở `0.50×` đạt **`45 px`** (khớp thẳng `Meliodas 45 wpx`), đã có sẵn khung `idle`, `walk`, `attack`, `block`, `hurt`, `death` + cấu trúc phân tách `Rig/Parts/`. License cho phép chỉnh sửa, **nhuộm màu (`recolour`)**, cắt ghép và thương mại hóa *(kèm công bố có sử dụng công cụ AI hỗ trợ ở khâu gốc từ tác giả Dubular)*.
- **Điểm nghẽn / Khoảng trống:** Gói `FREE_Starter` **CHỈ cung cấp đúng 1 hướng `down`** — thiếu hoàn toàn `up`, `left`, `right`; đồng thời giáp hiện màu thép xám-lam thuần chưa có áo choàng/điểm nhấn đỏ thẫm (`crimson`). Mật độ pixel gốc `90 px` cao gấp `~2×` `Vaelen` nên cần `resample nearest-neighbor` về `64×64` nếu muốn khớp nét.

### 🥉 Ứng viên 3 *(Ưu tiên C — Render 3D $\rightarrow$ 2D bằng tài nguyên FBX mới tải)*: `BentoPack Dark Fantasy Knight` (`dark-fantasy-knight-free-knight.zip`)
- **Điểm mạnh thực tế:** Có sẵn model `SK_Knight.fbx` (`70` xương Unreal), `SM_Knight_Longsword.fbx`, bộ texture PBR `4096×4096` và **`306` + `7` animation FBX** (gồm `idle_sword`, `km_walk_forward_sword`, `km_attack_slash_sword`, `km_parry_riposte_sword`). `LICENSE.txt` cho phép dùng thương mại và phân phối ảnh sprite 2D đã render tự do *(chỉ cấm phát hành file FBX/texture thô ngoài gói build)*.
- **Điểm nghẽn / Khoảng trống (`BLOCKED` tại workstation hiện tại):**
  1. **Công cụ 3D chưa sẵn sàng:** Đã kiểm tra hệ thống (`which blender`, `Program Files`, `AppData`) — **máy chưa cài đặt Blender** nên chưa thể thiết lập camera orthographic `3/4` 4 hướng hay test render pixelation xuống `64×64`.
  2. **Chất liệu & Silhouette:** Model gốc là giáp đen/xám thuần, **chưa có mesh áo choàng đỏ thẫm (`crimson cloak`)**; render 3D thu nhỏ xuống `~46 px` dễ bị bệt chi tiết giáp `517k` tris nếu không thiết lập shader cel/pixel và hậu xử lý thủ công.

> **Xác minh thêm về `Peacock Knight` (`PeacockKnightPackage.zip` + `Shannon Symonds ...pdf`):**  
> `PeacockKnightPackage.zip` chỉ là bản dựng demo Windows đã đóng gói của Unreal Engine 4 (`PeacockKnight2.exe` + `PeacockKnight2-WindowsNoEditor.pak` `166.9 MB`) kèm bài luận tốt nghiệp *Search for a Star* của Shannon Symonds (thiết kế hiệp sĩ kiếm hai tay *Band of the Peacock*). **Không chứa file nguồn 3D/texture mở được và không có giấy phép sử dụng thương mại.** Tuân thủ đúng lệnh: chỉ giữ ở vai trò **Reference-Only**.

---

## 4. Bảng So Sánh Trực Quan (`Nearest-Neighbor`, Nền `#141712`)

1. **Tổng kiểm kê toàn bộ `16` gói/baseline kỵ sĩ:**  
   🖼️ [ALL_KNIGHT_ASSETS_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-12-R3/ALL_KNIGHT_ASSETS_CONTACT_SHEET.png)
2. **Đối chiếu trực diện `3` ứng viên thực tế với `Meliodas BK V2` (`45 wpx`) & `Sir Vaelen` (`47 px`) trên cùng ground baseline:**  
   🖼️ [RODERICK_REAL_ASSET_CANDIDATES.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-12-R3/RODERICK_REAL_ASSET_CANDIDATES.png)

---

## 5. Đề Xuất Quyết Định Cho Project Owner (`OWNER GATE`)

Vì mọi ứng viên sẵn có đều thiếu ít nhất 1 mảnh ghép bắt buộc (góc Top-Down `U/L/R` hoặc màu đỏ thẫm hoặc phần mềm Blender), đề xuất Owner chọn **1 trong 4 hướng** trước khi sang bước thực thi:

1. **Hướng A *(Khuyến nghị nhất nếu đặt hàng họa sĩ / pack trả phí)*:** Mua bản đầy đủ **`Dark Fantasy Knight` (Dubular)** hoặc thuê họa sĩ vẽ bộ Top-Down 4 hướng `64×64` dựa trên visual ref **`Heavy_Knight_Free` (Jahnu)**.
2. **Hướng B *(Tối ưu công sức nếu dùng pack sẵn có)*:** Dùng **`Lantern_Knight` (`down`)** đã kiểm chứng làm nền tỷ lệ Top-Down `3/4`, nhuộm giáp/choàng đỏ thẫm theo `LICENSE.txt` và bổ sung `3` hướng còn lại (`up/left/right`) khớp pixel `64×64`.
3. **Hướng C *(Pipeline 3D $\rightarrow$ 2D)*:** Cài **Blender** trên workstation, gắn shader/tấm choàng đỏ cho **`BentoPack SK_Knight.fbx`**, render orthographic 4 hướng về `64×64` rồi kiểm tra lại nét pixel so với `Meliodas`.
4. **Hướng D *(Giữ trạng thái `BLOCKED` cho Sir Roderick)*:** Tạm hoãn triển khai hình ảnh `Sir Roderick` để bảo vệ chuẩn thẩm mỹ chung, ưu tiên hoàn thiện tuyến kỵ sĩ đã đủ asset trước.

---

## 6. Hard Stop Compliance
- `0` chỉnh sửa mã nguồn trong `src/` và `0` chỉnh sửa `public/assets/`.
- `0` tự vẽ sprite khối hình học/AI thay thế; `0` xóa/di chuyển các file archive `.zip`/`.rar`/prototype lịch sử; `0` commit/push.
