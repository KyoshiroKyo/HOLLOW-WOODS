# BÁO CÁO RÀ SOÁT & PHÂN TÍCH LỖI COLLISION BẢN ĐỒ TILED MAP JSON

> **Phiên bản dự án:** HOLLOW WOODS V1.4 (Phaser 4 + TypeScript)  
> **Mã nhiệm vụ:** BƯỚC 1 — QUÉT & PHÂN TÍCH LỖI COLLISION TRỰC TIẾP TRÊN FILE TILED MAP JSON  
> **Ngày thực hiện:** 18/11/2026  
> **Trạng thái:** Hoàn tất quét tĩnh (Static Analysis Complete — 100% Read-only)

---

## 1. DANH SÁCH FILE BẢN ĐỒ TILED, TILESETS & MODULE PHASER LIÊN QUAN

Qua rà soát toàn bộ cấu trúc dự án, hệ thống dữ liệu bản đồ và module điều khiển va chạm của HOLLOW WOODS bao gồm:

| Phân loại | Đường dẫn file | Vai trò & Đặc điểm kỹ thuật |
| :--- | :--- | :--- |
| **Spatial Manifest JSON** | [src/data/zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json) | File dữ liệu bản đồ trung tâm của game (17 phân khu), định nghĩa tọa độ `bounds`, danh sách `colliders` (tường, rào, biên giới), `transitions` (cổng chuyển vùng), và `interactables`. |
| **Tiled Reference Map** | [Beginning Fields.tmx](file:///g:/HOLLOW%20WOODS/staging/env_audit/05_the_fantasy_tileset/The%20Fan-tasy%20Tileset%20(Free)/Tiled/Tilemaps/Beginning%20Fields.tmx) | Bản đồ chuẩn Tiled (40×40 tiles, lưới 16×16 px), chứa 7 tilelayer (`Ground`, `Flowers`, `Road`, `RockSlopes`, `Water`...) và 1 objectgroup (`Object Layer 1`) chứa các Tile Objects công trình nhà cửa. |
| **Tiled Tilesets XML** | [staging/.../Tilesets/*.tsx](file:///g:/HOLLOW%20WOODS/staging/env_audit/05_the_fantasy_tileset/The%20Fan-tasy%20Tileset%20(Free)/Tiled/Tilesets) | Gồm 18 file tileset TSX/TSJ: `Objects_Buildings.tsx`, `Atlas_Buildings.tsx`, `Objects_Props.tsx`, `Objects_Rocks.tsx`, `Objects_Trees.tsx`, `Tileset_Ground.tsx`, v.v. chứa cấu trúc `objectgroup` va chạm gán trong từng tile. |
| **Core World Builder** | [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts) | Module Phaser chịu trách nhiệm nạp `zones.json`, tạo Tilemap/Texture, khởi tạo các thực thể nhà cửa, cây cối, đá tảng và đăng ký `Arcade.StaticGroup` collider (`setupZoneColliders`, `createStaticBoxCollider`). |
| **Gameplay Scene** | [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) | Thiết lập va chạm vật lý giữa `SatyrPlayer` và `worldBuilder.colliderGroup`, kiểm tra phạm vi tương tác và chuyển vùng. |
| **Debug Overlay** | [src/utils/HitboxDebugInspector.ts](file:///g:/HOLLOW%20WOODS/src/utils/HitboxDebugInspector.ts) | Công cụ bật/tắt bằng phím `F9` để vẽ viền hitbox thực tế thời gian thực. |

---

## 2. PHÂN TÍCH 5 LỖI KỸ THUẬT ĐẶC TRƯNG CỦA TILED JSON + PHASER

### 2.1. Lỗi lệch gốc tọa độ Tiled (Tiled Origin Mismatch: Bottom-Left vs. Top-Left)

#### A. Nguyên lý hình học & Sự xung đột giữa Tiled và Arcade Physics
- **Trong Tiled Map Editor:**
  - Đối với **Tile Object** (object có `gid`, ví dụ nhà cửa, cây lớn, tảng đá chèn từ tileset): Gốc tọa độ $(x, y)$ được định nghĩa tại góc **Dưới-Trái (Bottom-Left)** của hình ảnh.
  - Đối với **Rectangle Object** (hình chữ nhật vẽ tự do): Gốc tọa độ $(x, y)$ lại nằm ở góc **Trên-Trái (Top-Left)**.
- **Trong Phaser 4 / Arcade Physics:**
  - Mọi `Sprite`, `Image` và `Arcade.Body` đều tính toán vị trí góc trên-trái trong thế giới dựa trên:
    $$\text{Top-Left } X = \text{Sprite.x} - \text{DisplayOriginX}$$
    $$\text{Top-Left } Y = \text{Sprite.y} - \text{DisplayOriginY}$$
  - Khi một công trình được xuất từ Tiled Tile Object với tọa độ $(x, y)$ và chiều cao $h$, nếu nạp trực tiếp vào Phaser mà **không trừ đi $h$**, toàn bộ hình ảnh và khung va chạm sẽ bị **trôi tụt xuống dưới một khoảng đúng bằng $h$**. Ngược lại, nếu áp dụng công thức chuyển đổi ngược không đồng bộ, đối tượng sẽ bị **giật ngược lên trên**.

#### B. Dữ liệu đối chiếu cụ thể tại [Beginning Fields.tmx](file:///g:/HOLLOW%20WOODS/staging/env_audit/05_the_fantasy_tileset/The%20Fan-tasy%20Tileset%20(Free)/Tiled/Tilemaps/Beginning%20Fields.tmx)
Trong `Object Layer 1`, các công trình nhà cửa được lưu dưới dạng Tile Object:
- **Object ID 1 (House Hay 3):** `x=56, y=330, width=128, height=128, gid=480`
  - Tọa độ Top-Left chuẩn trong thế giới: $(56, 330 - 128) = (56, 202)$.
  - Nếu đọc nhầm là Top-Left: Công trình bị vẽ tại $Y = 330$ (lệch sâu $128\text{ px}$ xuống dưới).
- **Object ID 2 (House Hay 4):** `x=245, y=154, width=175, height=128, gid=479`
  - Tọa độ Top-Left chuẩn: $(245, 154 - 128) = (245, 26)$.
- **Object ID 3 (House Hay 2):** `x=342, y=426, width=157, height=112, gid=478`
  - Tọa độ Top-Left chuẩn: $(342, 426 - 112) = (342, 314)$.
- **Object ID 4 (House Hay 1):** `x=510, y=201, width=89, height=91, gid=477`
  - Tọa độ Top-Left chuẩn: $(510, 201 - 91) = (510, 110)$.

#### C. Đối chiếu giữa [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json) và [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts)
Tại phân khu Làng Bellhollow (`bellhollow`):

| ID Đối tượng | Tọa độ khai báo trong `zones.json` | Kích thước Sprite hiển thị | Tọa độ vẽ Sprite thực tế (`WorldBuilder.ts`) | Đáy Collider JSON | Đáy Sprite hiển thị | Độ lệch chân công trình |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| `house_edda` | `(648, 50, w=112, h=48)` | $112 \times 80\text{ px}$ | `(648, 50 - 24)` = $Y \in [26 .. 106]$ | $Y = 98$ | $Y = 106$ | **+8 px hở** |
| `house_neris` | `(914, 44, w=112, h=48)` | $112 \times 80\text{ px}$ | `(914, 44 - 24)` = $Y \in [20 .. 100]$ | $Y = 92$ | $Y = 100$ | **+8 px hở** |
| `bell_tower` | `(820, 252, w=80, h=58)` | $80 \times 112\text{ px}$ | `(820, 252 - 52)` = $Y \in [200 .. 312]$ | $Y = 310$ | $Y = 312$ | **+2 px hở** |

> [!WARNING]
> **Hậu quả trực tiếp gây lỗi đi xuyên nhà:**  
> Trong `zones.json`, chiều cao collider được gán là $h = 48\text{ px}$, nhưng sprite nhà thực tế cao tới $80\text{ px}$ và đáy tường kết thúc tại $Y = 106$. Collider cũ chỉ bao phủ đến $Y = 98$, để hở **8px đến 24px vùng chân tường**. Người chơi đi từ phía nam lên sẽ bước xuyên qua cửa và đứng lọt vào lòng nhà!

---

### 2.2. Vật cản tàng hình (Orphan / Phantom Colliders)

Qua quét toàn bộ layer va chạm tĩnh trong `zones.json` và mã nguồn `WorldBuilder.ts`, phát hiện 3 nhóm vật cản tàng hình:

1. **Lỗi lệch bù Dummy Sprite Offset (-16px) tại Nhà Edda & Nhà Neris:**
   - **File:** `src/world/WorldBuilder.ts` (mã nguồn cũ trước khi chuẩn hóa)
   - **Tọa độ phát sinh:**
     - Bên trái Nhà Edda: $X \in [632 .. 648], Y \in [50 .. 98]$ (rộng 16 px).
     - Bên trái Nhà Neris: $X \in [898 .. 914], Y \in [44 .. 92]$ (rộng 16 px).
   - **Nguyên nhân kỹ thuật:** Khi gọi `colliderGroup.create(cx, cy, undefined)` với `setOffset(-w/2, -h/2)`, texture mặc định 32×32 pixel của Phaser khiến điểm neo bị dịch sang trái 16px và lên trên 16px. Khoảng sân hiên hoàn toàn trống trải bên trái ngôi nhà bị collider vô hình chiếm giữ, tạo cảm giác đụng phải "bức tường tàng hình".
2. **Chướng ngại vật Cầu Đá Sập chặn lối thẳng (`cp_collapsed_bridge_blocker`):**
   - **File:** `src/data/zones.json` (Zone: `crooked_path`)
   - **ID Collider:** `cp_collapsed_bridge_blocker`
   - **Tọa độ:** $X = 1775, Y = 240, \text{Width} = 36, \text{Height} = 84$
   - **Đặc điểm:** Collider dạng `boundary` nằm chắn ngang lối mòn lát đá. Nếu không có hình vẽ khúc gỗ/đá đổ vỡ rõ ràng bên dưới, người chơi sẽ cảm nhận đây là một khối cản vô hình giữa đường.

---

### 2.3. Lỗi cờ lật GID (Tiled Flip Flags)

- **Cơ chế kỹ thuật:**  
  Trong định dạng Tiled Map XML/JSON, 4 bit cao nhất của số nguyên 32-bit không dấu được dùng để lưu trữ trạng thái lật/xoay của tile:
  - Bit 31 (`0x80000000`): Lật ngang (Horizontal Flip).
  - Bit 30 (`0x40000000`): Lật dọc (Vertical Flip).
  - Bit 29 (`0x20000000`): Lật chéo (Diagonal Flip).
  - Bit 28 (`0x10000000`): Xoay lục giác (Hexagonal Rotation).
  - Mặt nạ lọc ID gạch gốc: $\text{CLEAR\_FLAGS\_MASK} = \text{0x1FFFFFFF}$.
- **Kết quả quét dữ liệu:**
  - Đã quét toàn bộ 7 layer tile trong `Beginning Fields.tmx` (tổng cộng $7 \times 1600 = 11,200\text{ tiles}$).
  - Ghi nhận: Toàn bộ GID trong file mẫu đều nằm trong dải $[1 .. 5850]$, **0 tile** chứa bit lật $> \text{0x1FFFFFFF}$.
- **Cảnh báo tích hợp Phaser:**  
  Khi nhà thiết kế sử dụng phím tắt lật tile (`X` hoặc `Y`) trong Tiled Editor, GID sẽ lập tức nhảy lên giá trị $> 2,000,000,000$. Nếu Phaser dùng hàm `setCollision(tileId)` mà không áp dụng mặt nạ `tile.index & 0x1FFFFFFF`, các tile bị lật sẽ bị **bỏ qua va chạm hoàn toàn**, khiến nhân vật đi xuyên qua vách đá lật.

---

### 2.4. Sai lệch Scale & Kích thước lưới (Scale & Grid Size Inconsistency)

1. **Lệnh `setScale()` không đồng bộ `refreshBody()`:**
   - **Vị trí phát hiện:** `src/world/WorldBuilder.ts:3281` (`markerSouth.setScale(0.55)`).
   - **Nguyên nhân:** Trong Phaser Arcade Physics, đối với `StaticBody`, khi thay đổi kích thước hiển thị bằng `setScale()` nhưng không gọi `refreshBody()`, khung va chạm vật lý sẽ giữ nguyên kích thước cũ, gây hiện tượng hình ảnh co nhỏ nhưng hitbox vẫn to đùng cản trở đường đi.
2. **Xung đột kích thước lưới gạch:**
   - Bộ tileset gốc của Tiled được thiết kế theo chuẩn lưới **16×16 px** (`tilewidth="16" tileheight="16"`).
   - Trong khi đó, các texture HD V1.4 của game đang sử dụng các kích thước phân giải hỗn hợp:
     - Gạch lát sàn đá V1.4: `tile_stone_floor_v14.png` ($32 \times 32\text{ px}$).
     - Tảng đá lớn: `rock_large.png` ($32 \times 30\text{ px}$).
     - Công trình nhà: $112 \times 80\text{ px}$ (không chia hết cho 16px).
   - Việc ghép nối giữa lưới 16px và texture 32px đòi hỏi phải tính toán tọa độ neo bằng pixel thực thay vì chia ô lưới (TileX/TileY), nếu không sẽ gây sai số tích lũy từ 8px đến 16px trên chiều dài bản đồ.

---

### 2.5. Danh sách các vị trí hở biên tại Rừng Sâu (Deep Forest Perimeter Gaps)

Phân khu Rừng Sâu (`deep_forest`) có phạm vi không gian:
$$\text{Bounds: } X \in [1600 .. 2880], \quad Y \in [-640 .. 0] \quad (\text{Rộng } 1280\text{ px}, \text{ Cao } 640\text{ px})$$

Qua đối chiếu hình học giữa mảng `colliders` (tường biên) và `transitions` (cửa chuyển vùng) trong `zones.json`, phát hiện **8 khe hở biên giới vật lý** và **2 khe hở rào cây** cho phép nhân vật lọt ra ngoài bản đồ:

| STT | Vị trí ranh giới | Tọa độ X | Tọa độ Y | Bề rộng hở | Nguyên nhân kỹ thuật phát hiện được |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | **Biên Bắc (Khe Tây)** | $[2200 .. 2210]$ | $[-640 .. -610]$ | **10 px** | Khoảng hở giữa mép phải `df_bound_top_left` ($X=2200$) và mép trái cổng `to_abyssal_chasm` ($X=2210$). |
| **2** | **Biên Bắc (Khe Đông)** | $[2270 .. 2280]$ | $[-640 .. -610]$ | **10 px** | Khoảng hở giữa mép phải cổng `to_abyssal_chasm` ($X=2270$) và mép trái `df_bound_top_right` ($X=2280$). |
| **3** | **Biên Đông (Khe Bắc)** | $[2850 .. 2880]$ | $[-320 .. -310]$ | **10 px (cao)** | Khoảng hở giữa mép dưới `df_bound_right_top` ($Y=-320$) và mép trên cổng `to_silent_mire_from_df` ($Y=-310$). |
| **4** | **Biên Đông (Khe Nam)** | $[2850 .. 2880]$ | $[-210 .. -200]$ | **10 px (cao)** | Khoảng hở giữa mép dưới cổng `to_silent_mire_from_df` ($Y=-210$) và mép trên `df_bound_right_bottom` ($Y=-200$). |
| **5** | **Biên Nam (Khe 1)** | $[1800 .. 1810]$ | $[-25 .. 0]$ | **10 px** | Khoảng hở giữa mép phải `df_bound_bottom_left_1` ($X=1800$) và mép trái `to_whispering_clearing` ($X=1810$). |
| **6** | **Biên Nam (Khe 2)** | $[1870 .. 1880]$ | $[-25 .. 0]$ | **10 px** | Khoảng hở giữa mép phải cổng `to_whispering_clearing` ($X=1870$) và mép trái `df_bound_bottom_left_2` ($X=1880$). |
| **7** | **Biên Nam (Khe 3)** | $[2000 .. 2010]$ | $[-25 .. 0]$ | **10 px** | Khoảng hở giữa mép phải `df_bound_bottom_left_2` ($X=2000$) và mép trái `to_crooked_path_from_df` ($X=2010$). |
| **8** | **Biên Nam (Khe 4)** | $[2150 .. 2160]$ | $[-25 .. 0]$ | **10 px** | Khoảng hở giữa mép phải cổng `to_crooked_path_from_df` ($X=2150$) và mép trái `df_bound_bottom_right` ($X=2160$). |
| **9** | **Dãy cây viền Bắc** | $[1640 .. 2840]$ | $[-590 .. -572]$ | **85 px giữa các cây** | Trong `renderDeepForestTerrain`, dàn cây cổ thụ rải với bước nhảy $\Delta X = 105\text{ px}$ (thân cây rộng $20\text{ px}$). Khoảng trống 85px cho phép người chơi lách vào vùng đệm rộng $50\text{ px}$ ($Y \in [-640 .. -590]$) sau lưng hàng cây. |
| **10** | **Dãy cây viền Tây** | $[1640 .. 1660]$ | $[-600 .. -40]$ | **83 px giữa các cây** | Dàn cây phía Tây rải bước nhảy $\Delta Y = 95\text{ px}$ (thân cây cao $12\text{ px}$), tạo khe hở 83px cho phép người chơi lọt vào hành lang trống rộng $40\text{ px}$ ($X \in [1600 .. 1640]$). |

---

## 3. TỔNG KẾT & KIẾN NGHỊ HƯỚNG SỬA CHO BƯỚC TIẾP THEO

1. **Chuẩn hóa công thức nạp tọa độ công trình:**  
   Bắt buộc áp dụng công thức:
   $$X_{\text{Arcade}} = X_{\text{Tiled}}, \quad Y_{\text{Arcade}} = Y_{\text{Tiled}} - \text{Height}$$
   đối với toàn bộ Tile Object khi chuyển đổi sang Phaser Arcade Physics.
2. **Sử dụng Foot-level Hitbox (Hitbox chân đế):**  
   Chỉ bao phủ $25\% - 35\%$ phần đáy công trình ($colH \approx 26\text{ px}$ tại $Y_{\text{bottom}}$), triệt tiêu hoàn toàn khoảng hở 8px..24px ở cửa vào.
3. **Triệt tiêu sai số Dummy Sprite:**  
   Khởi tạo collider bằng hàm `createStaticBoxCollider(minX, minY, w, h)` với `setOrigin(0, 0)` và `body.reset(minX, minY)`, không sử dụng `setOffset(-w/2, -h/2)` trên sprite mặc định.
4. **Bịt kín 10 khe hở biên tại Rừng Sâu:**  
   Mở rộng các collider biên chạy tràn thêm 10px để giáp mí khít khao với mép cổng chuyển vùng, đồng thời bổ sung rào chắn tự nhiên (bụi rậm dày, vách đá) trám kín khoảng hở 85px giữa các thân cây viền bản đồ.

---
*Báo cáo được khởi tạo tự động bằng công cụ kiểm tra tĩnh `scripts/audit_tiled_json_collision.mjs`. Tuân thủ 100% ràng buộc không can thiệp sửa đổi file dữ liệu hoặc mã nguồn.*
