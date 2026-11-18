# HOLLOW WOODS V1.4 — BÁO CÁO KỸ THUẬT: BƯỚC 3
## KHÓA KÍN RANH GIỚI RỪNG SÂU & ĐỒNG NHẤT ĐỒ HỌA SPRITE (Y-SORTING)

**Phiên bản:** HOLLOW WOODS V1.4 (Phaser 4 + TypeScript)  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái kiểm thử:** 100% ĐẠT (PASS) — Đã nghiệm thu in-game qua F9 Debug Overlay & Live Movement Traversal  

---

### 1. TỔNG QUAN NHIỆM VỤ (OBJECTIVES)
Nhiệm vụ Bước 3 tập trung giải quyết triệt để hai nhóm vấn đề cốt lõi được người chơi phản hồi:
1. **Khóa kín ranh giới và vùng lỗi tại Rừng sâu (Deep Forest):**
   - Rà soát chu vi bản đồ Rừng Sâu ($X \in [1600, 2880], Y \in [-640, 0]$), bịt kín các khe hở cho phép người chơi đi xuyên biên hoặc lọt vào các khu vực chưa mở khóa.
   - Bổ sung cấu trúc cổng vòm kiến trúc **Cổng Cổ Ngữ Hư Không (Abyssal Void Gate Archway)** tại cửa ngõ phía Bắc dẫn vào *Abyssal Chasm* kèm kết giới năng lượng tím và Static Collider khóa lối.
   - Bổ sung rào chắn **Bụi Gai U Minh (Deep Forest Mire Barrier)** tại cửa ngõ phía Đông dẫn sang *Đầm Lầy Tĩnh Lặng (Silent Mire)*.
   - Gia cố 4 góc chu vi (NW, NE, SW, SE) bằng vách đá, bụi gai và thân cây đổ tự nhiên.
   - Thu hẹp `triggerRect` và bố trí vùng đệm an toàn (`returnPoint`) cho tất cả các cổng chuyển vùng, loại bỏ tình trạng kẹt hitbox hoặc kích hoạt nhầm từ xa.

2. **Đồng nhất tỷ lệ Sprite & Dynamic Depth Sorting (Y-Sorting):**
   - Chuẩn hóa hệ số phóng đại (`scale: 1.0`) cho toàn bộ thực thể: Nhân vật chính, NPC, quái vật (Bat, Wandering Shade, Goblin Scout, Skull Wolf, Shadow Series, Evil Knights, Boss Kẻ Nuốt Tiếng Chuông) nhằm đảm bảo mật độ điểm ảnh pixel đồng nhất, không vỡ hạt.
   - Thiết lập cơ chế **Dynamic Depth Sorting (`this.setDepth(Math.floor(this.y))`)** theo trục Y chân đứng cho toàn bộ thực thể động trong vòng lặp AI/Physics update, đảm bảo nhân vật bị che khuất chính xác khi đi sau cây/mái nhà và hiển thị đè lên khi đi phía trước.
   - Đảm bảo render pixel sắc nét (`pixelArt: true`, `roundPixels: true`, `antialias: false`).

---

### 2. CHI TIẾT TRIỂN KHAI KỸ THUẬT

#### A. Khóa kín chu vi & Cổng chuyển vùng Rừng Sâu (`src/world/WorldBuilder.ts` & `src/data/zones.json`)
1. **Cổng Cổ Ngữ Hư Không (Abyssal Void Gate) — Cửa ngõ phía Bắc `(2240, -620)`:**
   - Sử dụng asset vòm đá cổ `structure_abyssal_gate_v14.png` kích thước $160 \times 59\text{ px}$, `origin(0.5, 0.85)` tại tọa độ $(2240, -628)$.
   - Hai cột đá cự thạch hộ vệ `prop_ancient_monolith_v14` tại $(2185, -616)$ và $(2295, -616)$ với hộp va chạm chân đế $22 \times 16\text{ px}$.
   - Khối va chạm chặn cổng `abyssalGateColliderBody` ($72 \times 24\text{ px}$) được kích hoạt hoặc mở khóa thông qua `WorldGatingSystem.getInstance().isZoneUnlocked('abyssal_chasm')`.
   - Màn năng lượng tím Hư Không trực quan (Void Barrier Visual) với hiệu ứng tween thở nhịp nhàng khi cổng đang khóa.

2. **Rào Chắn Bụi Gai U Minh — Cửa ngõ phía Đông `(2844, -260)`:**
   - Cụm bụi gai đen tuyền phủ rêu và gai nhọn đan chéo dọc ranh giới $Y \in [-310, -210]$.
   - Khối va chạm `deepForestMireColliderBody` ($22 \times 106\text{ px}$) khóa kín ranh giới Đầm Lầy khi chưa hoàn thành Hồi 2, tự động vô hiệu hóa (`checkCollision.none = true`) khi mở khóa sang Hồi 3.

3. **Gia cố 4 góc chu vi (Perimeter Corner Fortifications):**
   - **Góc Tây-Bắc (NW):** Khối đá $54 \times 34\text{ px}$ $(1620, -615)$ + Bụi rậm rậm rạp $(1635, -600)$ + Thân cây đổ $(1640, -585)$.
   - **Góc Đông-Bắc (NE):** Khối đá $(2860, -615)$ + Bụi rậm $(2845, -600)$ + Bụi rậm $(2850, -580)$.
   - **Góc Tây-Nam (SW):** Thân cây đổ $(1630, -35)$ + Bụi rậm $(1635, -25)$ + $(1650, -20)$.
   - **Góc Đông-Nam (SE):** Khối đá $(2860, -35)$ + Bụi rậm $(2845, -30)$ + $(2840, -20)$.

4. **Tối ưu hóa hành lang cửa rừng Nam `(2080, -80)`:**
   - Dời `df_entry_sign` về sát vách Tây $(2010, -70)$ và cột đèn `createVillageLanternPost` về sát vách Đông $(2150, -70)$.
   - Mở rộng khoảng trống thông suốt tim đường $X \in [2030, 2130]$ ($>100\text{ px}$), triệt tiêu hoàn toàn góc kẹt hitbox khi nhân vật di chuyển từ Crooked Path vào Rừng Sâu.

#### B. Chuẩn hóa tỷ lệ Sprite & Dynamic Depth Sorting
1. **Chuẩn hóa Scale về 1.0 (Pixel-Perfect 1:1):**
   - Dơi Rừng Sâu (Bat) & Hồn Ma (Wandering Shade): Đưa scale từ $1.2 \rightarrow 1.0$, giữ nguyên pixel density chuẩn Dark Woodland.
   - Quạ Bóng Đêm (Shadow Crow), Mắt Đêm (Shadow Eyes), Thể Bóng Tối (Shadow Behemoth): Chuẩn hóa scale $1.0$, anchor origin $(0.5, 0.90 \sim 0.92)$.
   - Goblin Scout, Sói Xương (Skull Wolf), Phe Hiệp Sĩ (Fallen Knight, Dread Horseman, Hooded Knight Boss): Chuẩn hóa scale $1.0$, chân đế va chạm khép kín $25\% \sim 35\%$.

2. **Cơ chế Dynamic Depth Sorting theo trục Y chân đứng:**
   - Thay thế toàn bộ depth tĩnh cố định (như 620, 3400, 4500) bằng công thức động:
     $$\text{Depth} = \lfloor \text{Entity.y} \rfloor$$
   - Cập nhật trong `updateAI(delta)` cho tất cả thực thể di động:
     - `SkullWolfEntity.ts`: `this.setDepth(Math.floor(this.y))` + bóng đổ chân `setDepth(this.depth - 1)`.
     - `AmbushMonsters.ts`: Cập nhật depth động theo Y cho Dơi, Hồn ma và Goblin Scout; khi Dơi bay lên rút lui thì cộng offset `depth + 80`.
     - `ShadowMonsters.ts`: Cập nhật depth động cho toàn bộ quái vật bóng tối.
     - `EvilKnights.ts`: Cập nhật depth động cho Hiệp sĩ Sa ngã, Kỵ sĩ Hắc mã và Boss Hiệp sĩ Trùm đầu.
     - `MireWardenBoss.ts`: Cập nhật depth `Math.floor(this.y + 20)`.

#### C. Hotfix bổ sung từ phản hồi In-Game Tester
- **Sửa lỗi Crash khi nhấn `NẠP ĐIỂM LƯU GẦN NHẤT (LOAD)` tại màn hình Game Over:**
  - Thay vì cố gắng khôi phục và đột biến thực thể in-place trong khi scene đang bị lỗi vẽ (gây ra ngoại lệ `Uncaught TypeError: Cannot read properties of null (reading 'drawImage')`), `handleLoadCheckpoint()` được tái cấu trúc để gọi `this.scene.restart({ isContinue: true, saveData: data })` đồng bộ với luồng `continueGame()` của Main Menu.
  - Đảm bảo dọn dẹp sạch sẽ toàn bộ canvas, audio bus, particle systems và khôi phục trạng thái chơi mượt mà $100\%$.

---

### 3. KẾT QUẢ KIỂM THỬ IN-GAME (ACCEPTANCE TEST REPORT)

| Hạng Mục Kiểm Tra | Tọa Độ Thực Nghiệm | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **Cổng Cổ Ngữ Hư Không (North Gate)** | $X = 2238, Y = -597$ | Vòm đá `structure_abyssal_gate_v14`, 2 cự thạch Cổ Ngữ, màn tím Hư Không hiển thị sắc nét. Collider đỏ chặn đứng người chơi tại $Y = -597$. | **PASS** |
| **Khóa kín 4 góc Rừng Sâu** | NW, NE, SW, SE | 4 cụm chướng ngại vật tự nhiên (đá lớn, bụi gai, cây đổ) ngăn không cho nhân vật đi xuyên ra ngoài thế giới. | **PASS** |
| **Hành lang cửa rừng Nam** | $X \in [2010, 2150], Y = -80$ | Biển chỉ dẫn dời sang mép Tây $(2010)$, đèn lồng mép Đông $(2150)$, tim đường $140\text{ px}$ hoàn toàn thông thoáng, không còn kẹt góc. | **PASS** |
| **Rào chắn Đầm Lầy (East Mire)** | $X = 2844, Y = -260$ | Khi chưa mở khóa: Bụi gai & collider chặn kín. Khi mở khóa Hồi 3: Cổng mở thông suốt, kích hoạt chuyển vùng sang `silent_mire` mượt mà. | **PASS** |
| **Dynamic Y-Sorting (Phía sau cây)** | $X = 2283, Y = -580$ (North of tree) | Nhân vật nằm sau tán cây cổ thụ: Sprite nhân vật bị che khuất tự nhiên, chỉ viền debug F9 hiển thị mờ sau tán lá. | **PASS** |
| **Dynamic Y-Sorting (Phía trước cây)** | $X = 2282, Y = -539$ (South of tree) | Nhân vật nằm trước gốc cây: Sprite nhân vật hiển thị đè lên toàn bộ gốc cây và tán lá phía sau. | **PASS** |
| **Hiệu năng & Build Production** | Toàn bộ map | Đạt 56 – 60 FPS ổn định; TypeScript `check` 0 lỗi; Vite production build sạch $100\%$. | **PASS** |

---

### 4. HÌNH ẢNH MINH CHỨNG THỰC NGHIỆM
- **Cổng Cổ Ngữ Hư Không (F9 Debug):** `abyssal_void_gate_f9_debug.png`  
- **Chuyển vùng Đầm Lầy Tĩnh Lặng:** `east_mire_transition_f9_debug.png`  
- **Kiểm thử Y-Sorting sau cây:** `y_sorting_behind_tree.png`  
- **Kiểm thử Y-Sorting trước cây:** `y_sorting_in_front_tree.png`  

---

### 5. KẾT LUẬN & BÀN GIAO
Bước 3 đã hoàn tất xuất sắc toàn bộ các chỉ tiêu kỹ thuật: Khóa kín toàn diện chu vi và các lối chuyển cảnh của Rừng Sâu, chuẩn hóa tỷ lệ đồ họa Sprite về $1.0$, thiết lập Dynamic Depth Sorting hoàn hảo cho toàn bộ thực thể, và xử lý dứt điểm các lỗi phát sinh trong quá trình kiểm thử gameplay. Dự án sẵn sàng cho các phân đoạn phát triển tiếp theo.
