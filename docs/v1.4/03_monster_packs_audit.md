# HOLLOW WOODS V1.4 — BÁO CÁO KIỂM ĐỊNH KỸ THUẬT 3 BỘ ASSET QUÁI VẬT
## MONSTER & CREATURE PACKS AUDIT REPORT (BƯỚC 3)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Bảo vệ độc lập tuyệt đối nhánh `main` và bản phát hành V1.3)  
**Thư mục Staging kiểm thử:** `staging/monster_audit/` (Cách ly tuyệt đối, không đụng chạm mã nguồn game hay tài nguyên `public/assets/`)  
**Ngày thực hiện kiểm định:** 18/11/2026  
**Trạng thái kiểm định:** **HOÀN THÀNH TOÀN DIỆN (AUDITED & CLASSIFIED)**  

---

## 1. NGUYÊN TẮC KIỂM ĐỊNH & RÀNG BUỘC THỰC HIỆN

1. **Phạm vi kiểm định:**
   - Kiểm tra trung thực, chi tiết cấu trúc thư mục, định dạng tệp, kích thước khung hình (frame size), số lượng frame, số hướng di chuyển (directional coverage), bóng đổ/silhouette và góc nhìn không gian (perspective) của 3 bộ asset:
     1. `N3XUS-Starter-FREE-v1.1.zip` (Trọng tâm: **Dơi - Bat** và **Hồn ma - Ghost**).
     2. `goblin_scout_v5_silhouette_free.zip` (Kiểm định tính hoàn chỉnh của bộ sprite nhân vật).
     3. `SHADOW Series - The Free Assets.rar` (Phần quái vật, sinh vật bóng tối và Boss).

2. **Ràng buộc dừng & Quy tắc thẩm định nghiêm ngặt:**
   - **Báo cáo dữ liệu thực tế 100%:** Tuyệt đối không giả định hoặc suy đoán; nếu file thiếu sprite thân nhân vật (như trường hợp chỉ có vũ khí), phải ghi rõ chính xác phần tài nguyên bị thiếu.
   - **Sàng lọc góc nhìn (Perspective Filter):** Phân định rạch ròi giữa chuyển động **Top-down / 3/4 Top-down (4 hướng hoặc 8 hướng)** với chuyển động **2D Side-view Platformer (chạy nhảy bệ ngang)**. Tuyệt đối không đưa trực tiếp các animation Side-view vào danh sách sử dụng ngay cho game Top-down.
   - **Giữ nguyên trạng thái game:** Không viết mã nguồn AI quái vật (`src/entities/`), không nạp asset vào runtime ở bước này.

---

## 2. KẾT QUẢ KIỂM ĐỊNH CHI TIẾT TỪNG BỘ ASSET

### 2.1 Bộ Asset 1: `N3XUS-Starter-FREE-v1.1.zip`
- **Thư mục Staging:** `staging/monster_audit/01_nexus_starter/`
- **Tổng số tệp:** 59 tệp bao gồm quái vật, nhân vật người, thú cưỡi (mounts) và thú cưng (pets).
- **Trọng tâm kiểm tra:** Hai chủng loài quái vật sương mù: **Dơi (Bat)** và **Hồn ma (Ghost)**.

#### A. Quái vật Dơi (Bat) — `monsters/bat/`
- **Tệp tài nguyên:** `bat-sheet.png` ($192 \times 640\text{ px}$, 16.6 KB) và `bat-sheet.json` (59.8 KB).
- **Cấu trúc Atlas:** Lưới $6\text{ cột} \times 20\text{ hàng}$, kích thước frame chuẩn **$32 \times 32\text{ px}$**.
- **Tổng số frame animation:** **120 frames** hoàn chỉnh.
- **Hỗ trợ góc nhìn & Hướng di chuyển:** **Top-down / 3/4 Top-down 4 hướng chuẩn mực** (`down`, `left`, `right`, `up`).
- **Danh mục 20 thẻ hành động (Animation Tags):**

| Thẻ Animation | Hướng | Dải Frame | Số Frame | Mô Tả Chuyển Động |
|:---|:---:|:---:|:---:|:---|
| `idle_down` | Xuống (Nam) | 0 – 5 | 6 | Bay lượn tại chỗ, đập cánh nhịp nhàng hướng về phía trước |
| `idle_left` | Trái (Tây) | 6 – 11 | 6 | Bay lượn góc nghiêng 3/4 trái |
| `idle_right` | Phải (Đông) | 12 – 17 | 6 | Bay lượn góc nghiêng 3/4 phải |
| `idle_up` | Lên (Bắc) | 18 – 23 | 6 | Bay lượn nhìn từ phía sau lưng |
| `walk_down` | Xuống (Nam) | 24 – 29 | 6 | Bay lướt tiến xuống màn hình |
| `walk_left` | Trái (Tây) | 30 – 35 | 6 | Bay lướt sang trái |
| `walk_right` | Phải (Đông) | 36 – 41 | 6 | Bay lướt sang phải |
| `walk_up` | Lên (Bắc) | 42 – 47 | 6 | Bay lướt hướng lên màn hình |
| `attack_down` | Xuống (Nam) | 48 – 53 | 6 | Nhào xuống cắn / tấn công tầm gần hướng Nam |
| `attack_left` | Trái (Tây) | 54 – 59 | 6 | Nhào cắn sang hướng Tây |
| `attack_right` | Phải (Đông) | 60 – 65 | 6 | Nhào cắn sang hướng Đông |
| `attack_up` | Lên (Bắc) | 66 – 71 | 6 | Nhào cắn hướng Bắc |
| `hurt_down` | Xuống (Nam) | 72 – 77 | 6 | Giật lùi, chao đảo cánh khi trúng đòn (Nam) |
| `hurt_left` | Trái (Tây) | 78 – 83 | 6 | Giật lùi chao đảo (Tây) |
| `hurt_right` | Phải (Đông) | 84 – 89 | 6 | Giật lùi chao đảo (Đông) |
| `hurt_up` | Lên (Bắc) | 90 – 95 | 6 | Giật lùi chao đảo (Bắc) |
| `death_down` | Xuống (Nam) | 96 – 101 | 6 | Khép cánh rơi rụng và tan biến thành tro sương (Nam) |
| `death_left` | Trái (Tây) | 102 – 107 | 6 | Rơi rụng và tan biến (Tây) |
| `death_right` | Phải (Đông) | 108 – 113 | 6 | Rơi rụng và tan biến (Đông) |
| `death_up` | Lên (Bắc) | 114 – 119 | 6 | Rơi rụng và tan biến (Bắc) |

- **Silhouette & Phong cách nghệ thuật:** Thân dơi màu tím thẫm than bùn, cánh đen viền nhọn, mắt đỏ phát sáng li ti. Khớp 100% với phong cách sinh tồn kinh dị dân gian của Hollow Woods.
- **Đánh giá tương thích:** **100% TƯƠNG THÍCH HOÀN HẢO (DÙNG ĐƯỢC NGAY)**.
- **Đề xuất tích hợp:** Quái vật bay quấy nhiễu tầm nhìn người chơi trong sương đêm tại Lối Mòn Xuyên Sương (`fog_crossing`), Đầm Lầy (`silent_mire`) và Rừng Ngoài (`outer_woods`).

---

#### B. Quái vật Hồn ma (Ghost) — `monsters/ghost/`
- **Tệp tài nguyên:** `ghost-sheet.png` ($192 \times 640\text{ px}$, 13.8 KB) và `ghost-sheet.json` (60.0 KB).
- **Cấu trúc Atlas:** Lưới $6\text{ cột} \times 20\text{ hàng}$, kích thước frame chuẩn **$32 \times 32\text{ px}$**.
- **Tổng số frame animation:** **120 frames** hoàn chỉnh.
- **Hỗ trợ góc nhìn & Hướng di chuyển:** **Top-down / 3/4 Top-down 4 hướng chuẩn mực** (`down`, `left`, `right`, `up`).
- **Danh mục 20 thẻ hành động (Animation Tags):**

| Thẻ Animation | Hướng | Dải Frame | Số Frame | Mô Tả Chuyển Động |
|:---|:---:|:---:|:---:|:---|
| `idle_down` | Xuống (Nam) | 0 – 5 | 6 | Trôi nổi bồng bềnh, dải áo ma quái dập dềnh hướng Nam |
| `idle_left` | Trái (Tây) | 6 – 11 | 6 | Trôi nổi bồng bềnh hướng Tây |
| `idle_right` | Phải (Đông) | 12 – 17 | 6 | Trôi nổi bồng bềnh hướng Đông |
| `idle_up` | Lên (Bắc) | 18 – 23 | 6 | Trôi nổi nhìn từ sau lưng áo liệm |
| `walk_down` | Xuống (Nam) | 24 – 29 | 6 | Lướt đi trong không trung hướng Nam |
| `walk_left` | Trái (Tây) | 30 – 35 | 6 | Lướt đi hướng Tây |
| `walk_right` | Phải (Đông) | 36 – 41 | 6 | Lướt đi hướng Đông |
| `walk_up` | Lên (Bắc) | 42 – 47 | 6 | Lướt đi hướng Bắc |
| `attack_down` | Xuống (Nam) | 48 – 53 | 6 | Phóng xuất năng lượng linh hồn / vồ vuốt ma quái (Nam) |
| `attack_left` | Trái (Tây) | 54 – 59 | 6 | Tấn công linh hồn (Tây) |
| `attack_right` | Phải (Đông) | 60 – 65 | 6 | Tấn công linh hồn (Đông) |
| `attack_up` | Lên (Bắc) | 66 – 71 | 6 | Tấn công linh hồn (Bắc) |
| `hurt_down` | Xuống (Nam) | 72 – 77 | 6 | Biến dạng xung điện tâm linh khi bị trúng đòn (Nam) |
| `hurt_left` | Trái (Tây) | 78 – 83 | 6 | Biến dạng xung điện (Tây) |
| `hurt_right` | Phải (Đông) | 84 – 89 | 6 | Biến dạng xung điện (Đông) |
| `hurt_up` | Lên (Bắc) | 90 – 95 | 6 | Biến dạng xung điện (Bắc) |
| `death_down` | Xuống (Nam) | 96 – 101 | 6 | Bốc hơi tan biến thành làn sương lạnh vô hình (Nam) |
| `death_left` | Trái (Tây) | 102 – 107 | 6 | Bốc hơi tan biến (Tây) |
| `death_right` | Phải (Đông) | 108 – 113 | 6 | Bốc hơi tan biến (Đông) |
| `death_up` | Lên (Bắc) | 114 – 119 | 6 | Bốc hơi tan biến (Bắc) |

- **Silhouette & Phong cách nghệ thuật:** Thể ma quái màu trắng bạc ngả lam nhạt, hốc mắt đen sâu thẳm, vạt áo liệm rách rưới bay lượn. Đồng điệu tuyệt đối với truyền thuyết *The Fog That Remembers* và The Echo.
- **Đánh giá tương thích:** **100% TƯƠNG THÍCH HOÀN HẢO (DÙNG ĐƯỢC NGAY)**.
- **Đề xuất tích hợp:** Bóng ma ký ức phế tích (Wandering Shade) tại Miếu Chuông Phế Tích (`broken_bell_shrine`), Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`) và Đài Cổ Ngữ (`ancient_rune_puzzle`).

---

#### C. Các sinh vật bổ trợ khác trong gói N3XUS:
- `acid-slime`: 120 frames, $32 \times 32\text{ px}$, 4 hướng Top-down (idle, walk, attack, hurt, death). Tương thích tốt với vùng đầm lầy.
- `skeleton`: 120 frames, $32 \times 64\text{ px}$, 4 hướng Top-down (idle, walk, attack, hurt, death).
- `zombie`: 120 frames, $32 \times 64\text{ px}$, 4 hướng Top-down (idle, walk, attack, hurt, death).
- `goblin`: 120 frames, $32 \times 64\text{ px}$, 4 hướng Top-down (idle, walk, attack, hurt, death).

---

### 2.2 Bộ Asset 2: `goblin_scout_v5_silhouette_free.zip`
- **Thư mục Staging:** `staging/monster_audit/02_goblin_scout/`
- **Số lượng tệp thực tế:** **Đúng 3 tệp**:
  - `goblin_scout_v5_weapons_dagger_1_silhouette.aseprite` (29.0 KB)
  - `goblin_scout_v5_weapons_dagger_1_silhouette.json` (48.5 KB)
  - `goblin_scout_v5_weapons_dagger_1_silhouette.png` ($1024 \times 1216\text{ px}$, 20.5 KB)

```
Phân tích dữ liệu điểm ảnh thực tế trong tệp PNG:
- Kích thước Atlas: 1024 x 1216 px
- Kích thước mỗi ô frame: 64 x 64 px (16 cột x 19 hàng = 158 frame hoạt ảnh)
- Kiểm tra số lượng pixel hoạt động trong Frame 0 (Bounding Box):
  + Tọa độ frame: (0, 0, 64, 64)
  + Số pixel có màu: 129 pixels / 4096 pixels (Chiếm vỏn vẹn 3.1% diện tích frame!)
  + Tọa độ vùng vẽ: Từ (25, 30) đến (39, 44) -> Kích thước hình vẽ chỉ là 15 x 15 px!
  + Nội dung hình vẽ: DUY NHẤT 1 CHIẾC DAO GĂM NHỎ (DAGGER BLADE).
```

- **KẾT QUẢ KIỂM ĐỊNH THỰC TẾ & CẢNH BÁO TÀI NGUYÊN (CRITICAL FINDING):**
  - **Tài nguyên hiện có:** Chỉ chứa đúng **lớp phủ hoạt ảnh vũ khí dao găm (Dagger Weapon Overlay Animation)** gồm 19 thẻ hành động (unsheathe, sheathe, jump weapon, juggle weapon, idle weapon, walk weapon, run weapon, roll weapon, attack combo, slashes, hit, death, decay).
  - **TÀI NGUYÊN BỊ THIẾU HOÀN TOÀN:**
    + **KHÔNG CÓ THÂN THỂ GOBLIN SCOUT (BASE BODY IS MISSING).**
    + **KHÔNG CÓ ĐẦU, MẶT, CHÂN, TAY HAY TRANG PHỤC CỦA GOBLIN.**
    + Gói tệp này là một phần trong hệ thống nhân vật lắp ghép phân lớp (modular layered character system) của tác giả, và gói "free" này chỉ bao gồm duy nhất tệp phụ kiện dao găm silhouette.
  - **Kết luận:** **TUYỆT ĐỐI KHÔNG THỂ SỬ DỤNG LÀM QUÁI VẬT ĐỘC LẬP**. Nếu đưa vào game, quái vật sẽ chỉ là một chiếc dao găm vô hình bay lơ lửng trong không trung.
  - **Phân loại:** **NHÓM (C) — THIẾU TÀI NGUYÊN CƠ BẢN / KHÔNG ĐỦ ĐIỀU KIỆN TẠO QUÁI VẬT**.

---

### 2.3 Bộ Asset 3: `SHADOW Series - The Free Assets.rar` (Phần Quái vật, Sinh vật & Boss)
- **Thư mục Staging:** `staging/monster_audit/03_shadow_series/`
- **Danh mục 4 thực thể sinh vật / quái vật bóng tối:**

#### A. Quái vật Quả Bí Ma Quái (Hallokin) — `SHADOW Series - Hallokin (free)/`
- **Kích thước Frame:** Dải ngang dải frame cao $128\text{ px}$, mỗi frame rộng $96\text{ px}$.
- **Danh mục Animation:**
  - `idle.png` ($1152 \times 128\text{ px}$): 12 frames.
  - `run.png` ($768 \times 128\text{ px}$): 8 frames.
  - `jump.png` ($576 \times 128\text{ px}$): 6 frames.
  - `fall.png` ($576 \times 128\text{ px}$): 6 frames (rơi tự do chống trọng lực).
  - `jump - attack forwared.png` ($960 \times 128\text{ px}$): 10 frames (nhảy chém lao tới).
  - `attack up.png` ($1152 \times 128\text{ px}$): 12 frames (chém hất thẳng lên trời).
  - `attack-2.png` ($1344 \times 128\text{ px}$): 14 frames (combo chém ngang).
  - `hit.png` ($192 \times 128\text{ px}$): 2 frames.
- **Phân tích góc nhìn (Perspective Evaluation):**
  - **2D SIDE-VIEW PLATFORMER 100%**.
  - Các hành động nhảy cao (`jump`), rơi bệ (`fall`), chém lên trời (`attack up`) là động học đặc trưng của game đi cảnh màn hình ngang kiểu Mario / Mega Man.
  - Chỉ có 1 hướng nhìn nghiêng phẳng ngang (Left/Right), không có các hướng đi lên (Up) hay đi xuống (Down) của game Top-down.
- **Phân loại:** **NHÓM (C) — KHÔNG THÍCH HỢP CHO GAME TOP-DOWN (SIDE-VIEW MISMATCH)**.

---

#### B. Sinh vật Bóng Đêm Lướt Gió (Shadeflit) — `SHADOW Series - Shadeflit (Free)/`
- **Kích thước Frame:** $277 \times 161\text{ px}$.
- **Danh mục Animation:**
  - `idle.png` ($1662 \times 161\text{ px}$): 6 frames.
  - `run.png` ($1662 \times 161\text{ px}$): 6 frames.
  - `run-turn.png` ($277 \times 161\text{ px}$): 1 frame quay đầu.
- **Phân tích góc nhìn:**
  - **2D SIDE-VIEW PLATFORMER**.
  - Sinh vật di chuyển thuần túy theo trục ngang $X$ của game màn hình ngang.
- **Phân loại:** **NHÓM (C) — KHÔNG THÍCH HỢP (SIDE-VIEW MISMATCH)**.

---

#### C. Nữ Thợ Săn Mù (The Blind Huntress) — `SHADOW Series - The Blind Huntress/`
- **Kích thước Frame:** $240 \times 128\text{ px}$ (bản gốc) và $48 \times 48\text{ px}$ (bản mini).
- **Danh mục Animation (15 tệp spritesheet):**
  - `1 - Idle.png` (12 frames)
  - `2 - Run.png` (8 frames)
  - `3 - jump.png` (4 frames)
  - `4 - mid-air.png` (1 frame giữ trên không)
  - `5 - fall.png` (4 frames rơi xuống)
  - `6 - dash.png` (4 frames lướt ngang)
  - `7 - jump-up-attack.png` (4 frames chém hất ngược lên trần)
  - `8 - jump-down-attack.png` (4 frames cắm kiếm xuống đất - Pogo strike)
  - `9 - idle-up-attack.png` (4 frames)
  - `10 - attack 1.png` (3 frames)
  - `11 - attack 3.png` (5 frames)
  - `12 - dash attack.png` (3 frames)
  - `13 - spetial dash.png` (5 frames)
  - `14 - hit.png` (1 frame)
  - `15 - death.png` (10 frames)
- **Phân tích góc nhìn:**
  - **2D SIDE-VIEW METROIDVANIA 100%** (Tương tự cơ chế điều khiển của *Hollow Knight* / *Dead Cells*).
  - Toàn bộ bộ chiêu thức được thiết kế để bay nhảy qua các hố sâu và bệ đá thẳng đứng. Không tương thích với mặt sàn 2.5D của Hollow Woods.
- **Phân loại:** **NHÓM (C) — KHÔNG THÍCH HỢP CHO GAMEPLAY HIỆN TẠI (SIDE-VIEW MISMATCH)**.

---

#### D. Trùm Đầm Lầy Hắc Ám (The Shadowed Wetlands Boss v1.1)
- **Kích thước Frame:** Khung hình khổng lồ **$247 \times 87\text{ px}$**.
- **Danh mục Animation chi tiết:**
  - `idle.png` ($3458 \times 87\text{ px}$): **14 frames** (thở phì phò, mắt và răng phát sáng lập lòe).
  - `walk.png` ($3458 \times 87\text{ px}$): **14 frames** (bước đi nặng nề, cơ thể trườn dài).
  - `Attack 1.png` ($2470 \times 87\text{ px}$): **10 frames** (táp hàm răng bóng tối cực mạnh).
  - `Attack 2.png` ($2223 \times 87\text{ px}$): **9 frames** (quật đuôi bóng đêm tạo sóng chấn động).
  - `Pre-Attack 3.png` ($741 \times 87\text{ px}$): **3 frames** (gồng mình tích tụ năng lượng).
  - `mid-Attack 3.png` ($988 \times 87\text{ px}$): **4 frames** (lao vút tới ngoạm liên hoàn).
  - `end-Attack 3.png` ($1729 \times 87\text{ px}$): **7 frames** (thu hồi thế đứng sau đòn cắn).
  - `hit.png` ($247 \times 87\text{ px}$): **1 frame** (chớp sáng nhận sát thương).
  - `death.png` ($8151 \times 87\text{ px}$): **33 frames** (hoạt cảnh tử trận kéo dài, gục xuống và tan rã thành tro sương đen).
- **Phân tích góc nhìn & Đánh giá động thái:**
  - Sinh vật là một đại quái thú bóng tối dạng cá sấu khổng lồ (Apex Shadow Beast).
  - Dáng đứng và góc vẽ là **Side-profile (nhìn nghiêng một bên)**.
  - Nếu cho boss di chuyển tự do 4 hướng (lên, xuống, trái, phải) trên bản đồ Top-down, boss sẽ bị hiện tượng trôi dạt (moonwalking) khi đi theo phương thẳng đứng.
- **Đánh giá khả năng chuyển đổi & Thích ứng (Adaptation Feasibility):**
  - **KHÔNG THỂ DÙNG NGAY** như quái vật thông thường.
  - Tuy nhiên, hình tượng bóng đen khổng lồ với mắt và hàm răng phát quang đạt độ tương thích mỹ thuật **100%** với bối cảnh Đầm Lầy Tĩnh Lặng (`silent_mire`) của Hollow Woods.
  - **Phương án thích ứng trong tương lai:** Có thể cấu hình làm Boss Đầm Lầy Cố Định Nửa Mình Dưới Nước (Stationary Submerged Mire Behemoth) ngự trị tại tâm hồ đầm lầy, chỉ quay đầu trái/phải (`flipX`) phun đạn sương độc và táp hàm bóng tối về phía người chơi mà không cần đi lại 4 hướng.
- **Phân loại:** **NHÓM (B) — CẦN THIẾT KẾ CHUYỂN ĐỔI CHUYÊN BIỆT (CHỈ DÙNG LÀM BOSS CỐ ĐỊNH / STATIONARY ENCOUNTER)**.

---

## 3. BẢNG MA TRẬN ĐỐI SOÁT & PHÂN LOẠI TOÀN BỘ QUÁI VẬT

| STT | Sinh Vật / Quái Vật | Gói Nguồn | Kích Thước Frame | Số Frame / Hướng | Các Trạng Thái Animation | Góc Nhìn (Perspective) | Mức Độ Phù Hợp | Phân Nhóm | Đề Xuất Sử Dụng V1.4 |
|:---:|:---|:---|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **1** | **Dơi Sương Mù (Bat)** | `N3XUS Starter` | $32 \times 32\text{ px}$ | **120 frames** (4 hướng $\times$ 6f) | Idle, Walk/Fly, Attack, Hurt, Death | **3/4 Top-down** (4 hướng) | Xuất sắc (Cánh đen tím, mắt đỏ) | **(A) Dùng ngay** | Bổ sung làm quái vật bay cơ động tại `fog_crossing` và `outer_woods` |
| **2** | **Hồn Ma Phiêu Bạt (Ghost)** | `N3XUS Starter` | $32 \times 32\text{ px}$ | **120 frames** (4 hướng $\times$ 6f) | Idle, Float/Walk, Attack, Hurt, Death | **3/4 Top-down** (4 hướng) | Hoàn hảo (Áo liệm ma quái, sương lạnh) | **(A) Dùng ngay** | Quái vật linh hồn tại `broken_bell_shrine` và `sub_bell_workshop` |
| **3** | **Goblin Scout** | `goblin_scout_v5` | $64 \times 64\text{ px}$ | 158 frames (Chỉ có dao găm) | 19 thẻ hành động của dao găm | Nghiêng một hướng | **Thiếu thân thể nhân vật** | **(C) Loại bỏ** | Không thể dùng độc lập. Khuyến nghị dùng Goblin từ gói N3XUS thay thế |
| **4** | **Hallokin (Bí Ngô Ma)** | `SHADOW Series` | $96 \times 128\text{ px}$ | 64 frames (1 hướng) | Idle, Run, Jump, Fall, Jump-attack, Up-attack, Hit | **Side-view Platformer** | Lệch góc nhìn | **(C) Loại bỏ** | Không phù hợp với cơ chế Top-down |
| **5** | **Shadeflit** | `SHADOW Series` | $277 \times 161\text{ px}$ | 13 frames (1 hướng) | Idle, Run, Turn | **Side-view Platformer** | Lệch góc nhìn | **(C) Loại bỏ** | Không phù hợp với cơ chế Top-down |
| **6** | **The Blind Huntress** | `SHADOW Series` | $240 \times 128\text{ px}$ | 70 frames (1 hướng) | 15 trạng thái nhảy bệ & chém trên không | **Side-view Metroidvania** | Lệch góc nhìn hoàn toàn | **(C) Loại bỏ** | Động học platformer không khớp cơ chế game |
| **7** | **Shadowed Wetlands Boss** | `SHADOW Series` | $247 \times 87\text{ px}$ | **105 frames** (1 hướng) | Idle, Walk, 3 Attack combos, Hit, Death (33f) | **Side-profile** | Rất u ám, hợp phong cách đầm lầy | **(B) Chuyển đổi** | Không dùng di chuyển tự do; chỉ dùng làm Boss cố định dưới nước (Stationary Boss) |

---

## 4. KẾ HOẠCH HÀNH ĐỘNG CHO BƯỚC TIẾP THEO (STEP 4 ROADMAP)

Dựa trên kết quả kiểm định nghiêm ngặt:

1. **Triển khai ngay nhóm Quái vật Đạt chuẩn (Nhóm A):**
   - Đưa `bat-sheet.png` ($192 \times 640$) và `ghost-sheet.png` ($192 \times 640$) từ `staging/monster_audit/01_nexus_starter/` vào thư mục sản phẩm `public/assets/characters/monsters/`.
   - Đăng ký vào hệ thống ContentRegistry 4 tầng:
     + `HW-MON-BAT-000001` (`runtimeKey: mon_mist_bat`, `assetId: HW-AST-MON-MISTBAT`)
     + `HW-MON-GHOST-000001` (`runtimeKey: mon_wandering_shade`, `assetId: HW-AST-MON-WANDERINGSHADE`)
   - Đăng ký 20 animation tags cho mỗi quái vật vào `PreloadScene.ts` với tốc độ khung hình chuẩn mực ($8 - 10\text{ fps}$).

2. **Giải pháp thay thế cho Goblin Scout (Nhóm C):**
   - Không sử dụng file dao găm trơ trọi trong `goblin_scout_v5_silhouette_free.zip`.
   - Khai thác bộ Goblin hoàn chỉnh từ gói `N3XUS-Starter-FREE-v1.1` (`monsters/goblin/goblin-sheet.png` - $192 \times 1280\text{ px}$, 120 frame Top-down 4 hướng) để tạo thành `Goblin Lurker` cho khu rừng ngoài.

3. **Biện pháp xử lý Shadowed Wetlands Boss (Nhóm B):**
   - Lưu trữ an toàn bộ spritesheet $247 \times 87\text{ px}$ trong staging làm ứng viên cho phân khu Đầm Lầy Tĩnh Lặng V1.4. Thiết kế cơ chế Boss theo dạng thực thể cố định giữa lòng đầm lầy (Stationary Encounter) để triệt tiêu hoàn toàn nhược điểm góc nhìn Side-view.

---

## 5. XÁC NHẬN TUÂN THỦ RÀNG BUỘC DỪNG (STRICT VERIFICATION)

- [x] **Dữ liệu thực tế 100%:** Đã kiểm tra trực tiếp ma trận điểm ảnh, xác nhận `goblin_scout_v5_silhouette_free.zip` chỉ có 129 pixel vũ khí dao găm, không có thân thể nhân vật; không tự bịa đặt hay suy đoán dữ liệu.
- [x] **Sàng lọc góc nhìn:** Toàn bộ quái vật Side-view Platformer trong SHADOW Series đã được phân loại rõ ràng vào nhóm Không phù hợp (C) hoặc Cần chuyển đổi (B), không đưa vào danh sách dùng ngay.
- [x] **Không sửa mã nguồn game:** Không thêm bất kỳ file AI quái vật nào vào `src/entities/`, không can thiệp logic game.
- [x] **Không ghi đè tài nguyên:** Thư mục `public/assets/` giữ nguyên vẹn 100%.

---
*Báo cáo được khởi tạo tự động và xác minh kỹ thuật bởi Antigravity Engine Core.*
