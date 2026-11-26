# HW-NARRATIVE-00G — HEADLESS WARDEN ASSET SPECIFICATION (`ART-K01`)

- **Mission:** `HW-NARRATIVE-00G — CHARACTER ART, OPENING CUTSCENE & AUDIO PLAN`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `DESIGN PLANNING ONLY` (`0` tạo sprite hoàn chỉnh, `0` tạo boss runtime, `0` sửa `src/` hay `public/assets/`)
- **Dependencies:** `HW-NARRATIVE-00B` ([CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)), `HW-NARRATIVE-00E` ([HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md)), `HW-NARRATIVE-00F` ([HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md))
- **Primary Visual Reference:** [Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png](file:///G:/HOLLOW%20WOODS/HW/Trailer/B%E1%BA%A3ng%20thi%E1%BA%BFt%20k%E1%BA%BF%20Hi%E1%BB%87p%20s%C4%A9%20V%C3%B4%20di%E1%BB%87n%20Hollow%20Woods.png) (`1448×1086`, khớp bản upload `6ea29331.jpg`)

---

## 1. Phân Định Trạng Thái: Đã Duyệt vs Đề Xuất vs Chờ Owner Chốt

| Hạng mục | Trạng thái | Chi tiết & Ràng buộc |
| :--- | :---: | :--- |
| **Hướng bổ sung Boss cưỡi ngựa không đầu** | **ĐÃ CHẤP NHẬN HƯỚNG PHÁT TRIỂN** | Owner chấp nhận bổ sung một boss kỵ sĩ cưỡi ngựa không đầu mới vào kế hoạch phát triển (`CHAR-006` / `CHAR-K04`). |
| **Danh tính, tên chính thức (`The Headless Warden`), lore, kỹ năng, quest & vị trí bản đồ** | **`PROPOSED`** | Ý tưởng người gác di tích giữ lời thề chỉ là hướng gợi ý; **chưa chốt Canon**, chưa có texture key hay entity runtime. |
| **Tách biệt khỏi thực thể hiện hành** | **BẮT BUỘC** | **KHÔNG** tự đồng nhất với `DreadHorsemanEntity` ([EvilKnights.ts:383](file:///G:/HOLLOW%20WOODS/src/entities/EvilKnights.ts#L383-L414), dùng `dread_horseman_sheet` `448×384` / cell `64×64`, rơi `res_flint`) và **KHÔNG** gán là `Elian` (`CHAR-012`) hay thành viên Đoàn Hắc Lang khi Owner chưa quyết. |
| **Nguồn tài sản thương mại `Mattz Art` (`ASSET-K11`)** | **`FORBIDDEN / REJECTED`** | **TUYỆT ĐỐI CẤM** mua vượt ngân sách, xóa watermark, cắt ảnh preview (`80×80`, `29` frames) hay *pixel-trace* từ bộ trả phí của Mattz Art. Phải vẽ nguyên bản 100%. |

---

## 2. Đặc Tả Mỹ Thuật Nguyên Bản (`ART-K01` — Top-Down Atmospheric Dark Fantasy)

Dựa trên concept sheet [Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png](file:///G:/HOLLOW%20WOODS/HW/Trailer/B%E1%BA%A3ng%20thi%E1%BA%BFt%20k%E1%BA%BF%20Hi%E1%BB%87p%20s%C4%A9%20V%C3%B4%20di%E1%BB%87n%20Hollow%20Woods.png) (`Ch. 11 ART-K01`) chuyển thể từ góc minh họa sang **Pixel Art Top-Down `3/4` đồng bộ với `HOLLOW WOODS`**:

### 2.1 Bốn Trụ Cột Silhouette & Bảng Màu Chuẩn
| Thành phần tạo hình | Mô tả đặc tả mỹ thuật (Bắt buộc nguyên bản) | Nhóm màu mục tiêu (Atmospheric Dark Fantasy) | Lưu ý chống sai phong cách |
| :--- | :--- | :--- | :--- |
| **1. Giáp tối màu (`Rider & Mount Plate`)** | Bộ giáp tấm nặng bằng thép đen ám rêu/tro than; cầu vai nhiều lớp gắn đinh tán; trên giáp ngực khắc **hoa văn nhánh cây trụi / rễ cổ bằng đồng mờ**. Cổ giáp khép kín (không cổ hở thịt). | Thép tối `#1B1D21` – `#2B3038`, viền bắt sáng lạnh `#525B66`; hoa văn & khóa gài đồng cổ `#8A7348` / `#C8963E`. | Không dùng màu đen đặc `#000000` mất khối trên nền sương; không gắn mắt phát sáng ở mũ vì nhân vật không có đầu. |
| **2. Áo choàng đỏ rượu (`Crimson Mantle`)** | **Áo choàng hai tà rách sờn** buông rộng từ cầu vai trái/phải qua lưng ngựa, giữ nếp gợn dày; trên tấm giáp/khăn hông ngựa cũng phủ viền đỏ rượu thêu chỉ đồng cổ + bùa cổ ngữ treo bên hông. | Đỏ rượu sẫm bóng `#3B1219`, thân chính `#6B1D29`, nếp gập sáng `#8F2D3B`. | Tách rõ độ bão hòa với cam/đỏ neon; khi đi vào vùng sương `Ambient 0.22–0.35`, sắc đỏ rượu vẫn nhận diện được silhouette. |
| **3. Chiến mã ma thuật (`Armored Warhorse`)** | Ngựa chiến khổ lớn, đầu giáp *chanfron* sẫm viền đồng, ức bọc giáp nối xích, chân guốc ẩn nhẹ trong hơi sương; **không có mắt người hay mắt đỏ quái dị**, chỉ điểm hốc mắt le lói linh hỏa. | Lông tối `#121418` – `#1E2329`, da yên `#2E221D`, giáp đồng ngựa `#78613C`. | Phải khác rõ tỷ lệ, trang bị & dáng vóc với `dread_horseman_sheet` (`64×64` side-trot thô hiện hành). |
| **4. Linh hỏa xanh bạc (`Silvery-Cyan Spectral Flame`)** | Luồng linh hỏa **bạc pha xanh ngọc nhạt** bốc lên xoắn nhẹ từ hốc cổ giáp, làm bờm/đuôi/chân guốc ngựa và bọc lấy nửa ngoài lưỡi đại kiếm. | Tâm trắng bạc `#E5F5EB` → thân ngọc nhạt `#8FD0AC` → rìa khói xanh lục xám `#3E6E5D`. | Tách thành lớp overlay trong suốt riêng để ánh sáng linh hỏa không bết bùn vào pixel giáp khi thu nhỏ. |

### 2.2 Quy Chuẩn Góc Nhìn & Chống Méo Top-Down
- **Góc chiếu chuẩn:** Top-down `3/4` (`~45°–55°`) nhất quán với **Meliodas Blackwood** (`BlackKnightPlayer`), **Sir Vaelen**, **Hooded Knight** (`160×160`) và **Mire Warden** (`247×87`).
- **Quy tắc bất đối xứng hướng ngang:** Không lật đối xứng mù quáng (`flipX`) giữa `LEFT` và `RIGHT` nếu hoa văn rễ ngực, tà áo choàng lệch vai hoặc tay cầm đại kiếm bị đảo trái/phải bất hợp lý; họa sĩ kiểm tra pixel từng hướng trong `LEFT` và `RIGHT`.
- **Biên pixel:** 100% *nearest-neighbor*, nền RGBA trong suốt (`alpha = 0`), không chống răng cưa *anti-alias* làm nhòe rìa pixel, không chừa viền đen quá dày.

---

## 3. Đặc Tả Kỹ Thuật Sprite, Kích Thước Frame, Phân Lớp & Animation

### 3.1 Thông Số Canvas & Tương Quan Tỷ Lệ Runtime
| Thực thể đối chiếu runtime (`ĐÃ KIỂM CHỨNG`) | Canvas Cell | `body_h` đo thực tế (`00F`) | Render Scale | Chiều cao hiển thị |
| :--- | :---: | :---: | :---: | :---: |
| `Meliodas Blackwood` (`black_knight_armed_idle.png`) | `64×64` | `30 px` | `1.50` (`WAYFARER_BASE_SCALE`) | `~45.0 wpx` |
| `Sir Vaelen` (`campfire_knight_idle_sheet.png`) | `64×64` | `47 px` | `1.00` | `~47.0 wpx` |
| `Dread Horseman` (`dread_horseman_sheet.png`) | `64×64` | `~48 px` | `1.00` | `~48.0 wpx` |
| `Hooded Knight Boss` (`hooded_knight_sheet.png`) | `160×160` | `71 px` | `1.00` | `~71.0 wpx` |
| **`The Headless Warden` (`ĐỀ XUẤT MỚI`)** | **`128×128`** *(lớp cơ bản)* / **`160×160`** *(nếu VFX đại kiếm vung rộng)* | **Mục tiêu `72–82 px`** *(tính từ móng ngựa tới đỉnh vai giáp, chưa tính ngọn lửa bốc)* | **`1.00`** *(khớp 1:1 pixel grid)* | **`72–82 wpx`** (`~1.6–1.8×` Meliodas) |

- **Anchor (`Origin`):** Cố định **`(0.5, 1.0)`** (hoặc chân móng trung tâm trọng lượng ngựa đặt cách đáy canvas đúng `6 px` đồng bộ trong mọi frame, `y-sort` theo tọa độ `floor(y)`).
- **Khuyến nghị khởi đầu thử nghiệm:** Dựng mẫu thử trên **`128×128 px` (4 hướng)** cho nhóm `idle / walk / run / hurt` và kiểm tra vung đại kiếm; chỉ nâng toàn bộ atlas lên **`160×160 px`** nếu tầm vung đại kiếm + vệt linh hỏa ở hướng `DOWN`/`UP` hoặc `LEFT`/`RIGHT` vượt biên `128×128`. Không trộn 2 kích thước cell khác nhau làm lệch `origin` (`bài học BUG-058`).

### 3.2 Kiến Trúc `4` Lớp Tách Rời (`Layer Architecture`)
Để hỗ trợ tối ưu GPU/Shadow Cache (`HW-H4-06`) và chế độ `Graphics Quality / Reduced Motion` khi bước vào giai đoạn sản xuất sau này, đặc tả chia tệp làm việc (`.aseprite` / `.png` tách lớp) thành `4` lớp:
1. **`L0_Shadow` (Runtime cached oval):** Bóng đổ bầu dục mềm (`~64×20 px`, `alpha 0.34`), đặt ngay dưới 4 vó ngựa (`depth = entity.depth - 1`), không vẽ dính chết vào pixel giáp.
2. **`L1_Mount_Base`:** Thân ngựa chiến, giáp đầu, giáp ức đồng cổ và vải trùm hông rách đỏ rượu (toàn bộ pixel đặc `alpha = 255`).
3. **`L2_Rider_Armor`:** Kỵ sĩ không đầu, giáp ngực hoa văn rễ đồng, áo choàng 2 tà đỏ rượu và lưỡi đại kiếm thép tối.
4. **`L3_Spectral_Flame_FX` (Overlay trong suốt riêng):** Ngọn linh hỏa ở hốc cổ, bờm/đuôi/móng phát hỏa và vệt chém linh hỏa xanh bạc (`alpha` bán trong suốt có thể tiết chế khi bật `Reduced Motion` hoặc hiệu ứng `Disappear` mà không làm hỏng silhouette giáp).

### 3.3 Danh Sách `7` Bộ Animation Cần Sản Xuất (`4 Hướng`: `down`, `up`, `left`, `right`)
*(Thứ tự hàng atlas cố định: Row `0 = down`, Row `1 = up`, Row `2 = left`, Row `3 = right` — không phụ thuộc thứ tự hay số frame của pack thương mại nào).*

| ID Hành Động | Số Frame Mục Tiêu | Nhịp Frame (`ms` / FPS) | Loop | Mô tả chuyển động cốt lõi theo từng pha |
| :--- | :---: | :---: | :---: | :--- |
| `warden_idle` | `6–8 frames` | `150 ms` (`~6.7 FPS`) | Yes | Ngựa dậm nhẹ móng trước, giáp kỵ sĩ nhấp nhô chậm, áo choàng đung đưa khẽ; lớp `L3` linh hỏa cổ & đuôi gợn sóng liên tục. |
| `warden_walk` | `6–8 frames` | `125 ms` (`8 FPS`) | Yes | Dáng kiệu tuần tra nặng nề, nhịp chân chéo rõ ràng ở cả `down` / `up` / ngang, kiếm chúc xuống theo dáng giữ cương. |
| `warden_run` | `8 frames` | `85 ms` (`~11.8 FPS`) | Yes | Phi nước đại tăng tốc; đầu ngựa chúi về trước, hai tà áo choàng đỏ rượu tung dài về sau, tia linh hỏa kéo vệt mảnh. |
| `warden_powerup` | `10–12 frames` | `95 ms` (`~10.5 FPS`) | No | Ngựa chồm nhẹ hai chân trước, kỵ sĩ giơ đại kiếm ngang ngực/lên cao; lớp `L3` linh hỏa bùng xoáy từ cổ áo giáp và dọc thân kiếm báo hiệu pha *Telegraph*. |
| `warden_attack` | `8–12 frames` | `75–85 ms` (`12–13 FPS`) | No | Chia rõ 3 pha: **Windup (`3f`)** giơ kiếm → **Active Slash/Thrust (`3–4f`)** chém vòng cung rộng kèm vệt xanh bạc → **Recovery (`3–4f`)** thu kiếm giữ thế. *(Gắn metadata `impactFrame` để đồng bộ hitbox sau này).* |
| `warden_hurt` | `4–6 frames` | `70 ms` (`~14 FPS`) | No | Giáp giật lùi ngắn, vó trước khuỵu nhẹ, lớp `L3` linh hỏa tóe hạt tắt nhanh rồi bùng lại, *zero foot drift*. |
| `warden_disappear` | `10–12 frames` | `100 ms` (`10 FPS`) | No | Tư thế lấy cảm hứng từ Death trên concept sheet: ngựa chồm tán biến dần thành màn khói linh hỏa xanh bạc, đại kiếm cắm xuống nền đất rồi tan nốt về `alpha = 0`. |

*(Cần kèm 1 ảnh chân dung hội thoại/Bestiary `warden_portrait.png` khổ `64×64` cận phần giáp vai hoa văn rễ + cổ áo giáp bốc linh hỏa xanh bạc).*

---

## 4. Cổng Nghiệm Thu QA Asset & Các Quyết Định Chờ Owner

### 4.1 Cổng Nghiệm Thu Cho Giai Đoạn Sản Xuất Sau (`NR-K02`)
1. `RGBA8888` PNG trong suốt 100%, không nền caro/nền đặc (`bài học Mystic_Autumn_Knights`), đóng atlas JSON `trimmed: false`.
2. Đủ `4` hướng (`down / up / left / right`) trên toàn bộ `7` animation; kiểm pixel thủ công không bị `flipX` lỗi.
3. `origin (0.5, 1.0)` & `foot point` cố định ở tất cả mọi frame (`0 px` nhảy tỷ lệ giữa `idle` → `run` → `attack`).
4. Đối chiếu đặt cạnh `Meliodas BK V2` (`~45 wpx`), `Hooded Knight` (`71px`) và `Mire Warden` trên nền Dark Moss `#141712` và bản đồ `Resurrected RPG`.

### 4.2 Các Hạng Mục Cần Owner Quyết Định Trước Khi Tạo Entity Runtime (`OQ-K04`, `OQ-07`, `OQ-15`)
- **Danh tính & Quan hệ Lore:** Có giữ tên chính thức là **`The Headless Warden`**? Nhân vật có thuộc Đoàn Hắc Lang / liên quan kỵ sĩ mất tích hay là cổ vật/vệ thần độc lập tại di tích?
- **Vị trí Zone & Vai trò Quest:** Đặt tại phân khu nào (`sunken_crypt_ruins`, `veil_origin_cavern`, `drowned_mire_depths` hay khu vực riêng)? Là **Boss phụ tùy chọn (Optional Boss)** hay **Boss cốt truyện mở rộng**? (Không làm gãy main route `A→E→B→D→F→E→C→A`).
- **Bộ kỹ năng & Phần thưởng Gameplay:** Số phase chiến đấu, đòn đánh (chém vòng cung / lao ngựa / triệu hồi linh hỏa) và vật phẩm/lore rơi ra khi bị đánh bại.
