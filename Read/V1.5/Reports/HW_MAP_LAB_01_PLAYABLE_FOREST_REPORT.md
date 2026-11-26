# HW-MAP-LAB-01 — RESURRECTED RPG PLAYABLE WORLD PROTOTYPE REPORT

- **Dự án:** `HOLLOW WOODS` (`World Reconstruction 2.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Đặc phái viên:** `AG 4 Hydro High`
- **Nhánh Git:** `feat/v1.5.3-ag-world-polish` (`HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`)
- **Ngày thực hiện:** `2026-11-26`
- **Trạng thái cuối:** **`PASS (12/12 TARGETED TESTS)`**

---

## 1. Xác minh Safety Gate & Thông số Engine thực tế (§3)

Đối chiếu trực tiếp từ mã nguồn sản xuất (không giả định từ báo cáo cũ):
- **Engine thực tế:** `Phaser 4.2.1 ("Giedi")` ([node_modules/phaser/package.json](file:///G:/HOLLOW%20WOODS/node_modules/phaser/package.json#L2-L4)).
- **Độ phân giải & Scale:** `1280×720`, `Phaser.Scale.FIT`, `Phaser.Scale.CENTER_BOTH`, `pixelArt: true`, `antialias: false`, `roundPixels: true` ([GameConfig.ts](file:///G:/HOLLOW%20WOODS/src/config/GameConfig.ts#L19-L33)).
- **Camera Zoom:** `2.2` (`~581.8 × 327.3` đơn vị thế giới hiển thị trên khung hình) ([GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L502)).
- **Nhân vật Black Knight Wayfarer:**
  - Frame nguồn: `64×64` (`idle` / `walk`), `84×72` (`armed_run_sequence`).
  - `origin`: `(0.5, 1.0)`, `WAYFARER_BASE_SCALE`: **`1.50`** (tương đương **`96×96` world px** khi đứng/đi; khi chạy `armed_run_sequence` nhân `0.8` = **`1.20`**) ([Constants.ts](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts#L74-L82), [BlackKnightPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L283-L293)).
  - Foot Hitbox: **`18×12 px`** neo tại bàn chân.
  - Frame rate chuẩn: Idle `160 ms/frame` (`6.25 FPS`), Walk `170 ms/frame`, Run `70 ms/frame` ([BlackKnightAnimations.ts](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts#L18-L72), [BlackKnightConversion.json](file:///G:/HOLLOW%20WOODS/src/animation/BlackKnightConversion.json#L495-L502)).
  - Tốc độ: Đi bộ `85 px/s`, Chạy `Shift` `140 px/s`.

---

## 2. Cấu trúc Prototype Độc Lập & Cách Khởi Chạy (§5 & §14)

- **Thư mục Prototype (cách ly 100% khỏi `src/` & `public/assets/`):**
  [HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/)
  - [index.html](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/index.html)
  - [src/main.js](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/src/main.js)
  - [src/LabForestScene.js](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/src/LabForestScene.js)
  - [src/BlackKnightController.js](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/src/BlackKnightController.js)
  - [vendor/phaser.esm.min.js](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/vendor/phaser.esm.min.js) (`Phaser 4.2.1`)
- **Bản đồ Tiled chỉnh sửa được:**
  - Tiled JSON (runtime): [lab_01_resurrected_forest.tmj](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/maps/lab_01_resurrected_forest.tmj) (`64×44` tiles @ `32×32 px` = `2048×1408 px`)
  - Tiled XML (editor): [lab_01_resurrected_forest.tmx](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_01_RESURRECTED_FOREST/maps/lab_01_resurrected_forest.tmx) kèm 3 tệp `.tsx`.

### Lệnh khởi chạy & Điều khiển
```powershell
cd "G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\World_Labs\LAB_01_RESURRECTED_FOREST"
python -m http.server 4175
```
Mở trình duyệt tại: **`http://127.0.0.1:4175/`**
- `WASD` / Phím mũi tên: Di chuyển 8 hướng trên đường mòn, khoảng đất trống, lối hẹp và sân đá cổ.
- `Shift`: Chạy nhanh (`140 px/s`).
- `F4`: Bật/tắt lớp kiểm tra Collider.
- `F3`: Bật/tắt lớp Ánh sáng dịu & Sương mù trôi nhẹ.
- `H`: Ẩn/hiện HUD thông số.

---

## 3. Tài nguyên Sử dụng & Kiểm tra Giấy phép (§4 & §14)

| Tài nguyên | Nguồn gốc | Vai trò trong LAB-01 | Giấy phép |
| :--- | :--- | :--- | :--- |
| **Resurrected RPG 1.1** (`Grass.png`, `Grass 2 layer.png`, `Plants.png`, `PlantShadow.png`, `Props.png`, `Wall.png`) | **Immunity** (`immunitys.itch.io/resurected-rpg-tile`) | Toàn bộ thảm cỏ, rêu, hoa, 34 cây cổ thụ/cây vừa/bụi rậm/gốc cây, 11 cấu trúc đá cổ (bậc thang, cổng vòm, tường đổ, bàn thờ, tượng hiệp sĩ, lầu bát giác) đóng gói thành `lab01_props_atlas` (`1024×1024`, `58` frame, padding `2px`). | Itch.io Commercial/Game Asset License (đã xác minh; chỉ dùng bản sao cho prototype, không tái phân phối source gốc). |
| **`resurrected_dirt_path.png`** (`128×128`) | Sinh cục bộ theo bảng màu đất/rêu của Resurrected RPG | Autotile 4-bit (16 biến thể) cho đường mòn đất tự nhiên uốn lượn liên tục với viền rêu mịn. | Tài sản phụ trợ tự tạo đồng bộ bảng màu Immunity. |
| **Black Knight Runtime Atlases** (`armed_idle`, `movement`, `conversion_motion`) | **Fellor** (`fellor.itch.io`, tích hợp V1.5.3 từ `public/assets/characters/black_knight/`) | Kiểm tra tỷ lệ hiển thị `1.50` / `1.20`, idle `160ms`, walk `170ms`, run `70ms` và foot hitbox `18×12`. | Commercial License kèm `License.txt` của Fellor (giữ nguyên ghi công). |

---

## 4. Kiến trúc Lớp Bản đồ, Collision & Y-Depth (§7)

Tách hoàn toàn thành các lớp chức năng độc lập trong TMJ/TMX và `LabForestScene.js`:
1. **Lớp nền & trang trí mặt đất (không chặn đường):** `Ground` (`depth -10000`), `Terrain_Variations` (`-9200`), `Paths` (`-9150`), `Buildings_And_Ruins` mặt sàn như `Sanctuary_Plaza` & `Mossy_Stairs` (`-9120`), `Low_Vegetation` hoa/cỏ dại (`-9000`), `Tree_Shadows` (`-8500`).
2. **Lớp tương tác Y-Depth:** `Static_Objects`, `Buildings_And_Ruins` (tượng/bàn thờ/cổng vòm/tường đá), `Tree_Trunks` (`depth = Math.round(y)`).
3. **Lớp tán cây tách riêng (`Tree_Canopies`):** Neo theo thân cây ở `depth = Math.round(y) + 0.5` (riêng viền cây cực Nam map nằm ở `Foreground` `8800`), giúp Black Knight đứng phía trước cây (`player.y > tree.y`) sẽ che cả thân lẫn tán, còn đi vòng ra sau (`player.y < tree.y`) sẽ bị tán lá phủ lên tự nhiên.
4. **Lớp Collision tách biệt (`58` Static Bodies):**
   - `34` Collider **chỉ bọc vùng gốc & thân cây** (`22×12 px` đến `38×14 px`) — **0** collider trên tán cây.
   - `8` Collider chân công trình đá cổ (`Sanctuary_Wall`, `Ancient_Shrine`, `Knight_Statue`, `Northern_Gazebo`, `East_Watchtower_Gate`, `Decorative_Arch`, `Trail_Monolith`).
   - `16` Collider đá rêu, gốc cây mục, bụi lớn.
   - `0` Collider trên hoa, cỏ dại, phiến đá bước chân (`stepping_stones_1`) và bậc thang.
5. **Ánh sáng dịu & Sương mù (`Lighting` / `Fog`):** Gradient tròn mượt (`hw_lab_sunbeam_soft`, `hw_lab_mist_ribbon`) pha trộn nhẹ (`ADD` ở khoảng đất trống, bàn thờ đá & sương mỏng trôi ngang) — không phủ lớp đen toàn màn hình.

---

## 5. Kết quả Kiểm thử Mục tiêu (`L01–L12`: `12/12 PASS`)

Chạy trực tiếp trên **Google Chrome Headless (`--headless=new --enable-webgl --use-gl=angle --use-angle=d3d11`)**, GPU **`NVIDIA GeForce GTX 1070 Ti`**:

| Mã | Hạng mục kiểm thử | Phân loại thao tác | Kết quả đo thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **L01** | Prototype khởi chạy & Phaser version | Runtime Launch | Phaser `4.2.1`, `WebGL`, `camera.zoom = 2.2` | **PASS** |
| **L02** | Nạp đầy đủ Asset & Tilemap | Asset Integrity | `58` bodies (`34` tree), `130` cull targets, `0` lỗi tải | **PASS** |
| **L03** | Idle / Walk / Run hoạt động đúng spec | **REAL-KEYBOARD** | Idle `160ms` (`1.50`), Walk `right` (`1.50`), Run `Shift+D` (`1.20`) | **PASS** |
| **L04** | Đi qua đường mòn chính bằng WASD | **REAL-KEYBOARD** (`W+D+Shift` 2.2s) | Di chuyển liên tục `(326.7, 1152) → (547.8, 958.2)` | **PASS** |
| **L05** | Collider thân cây | **REAL-KEYBOARD** (`W` 0.7s vào thân cây) | `player.body.y` dừng khít tại `720.0` (chạm mép gốc `720`) | **PASS** |
| **L06** | Y-Depth phía trước & sau cây | **REAL-KEYBOARD** vòng sau gốc cây | Trước cây: `depth 756 > 720.5`; Sau cây: `depth 680 < 720` | **PASS** |
| **L07** | Đi sát công trình đá cổ | **REAL-KEYBOARD** (`W` vào `Ancient_Shrine`) | `player.body.y` dừng khít tại `380.0` (chạm chân bệ `380`) | **PASS** |
| **L08** | Camera follow & World bounds | Camera Inspection | Góc trên-trái khóa chặt `worldView = [0, 0]`; theo sát tới `[1099.1, 271.4]` | **PASS** |
| **L09** | Không kẹt phím sau blur/focus | **REAL-KEYBOARD + Window Blur** | Nhả kẹt tức thì (`x1 = x2 = 1407`, chuyển `wayfarer_idle_right`) | **PASS** |
| **L10** | Không console / page / HTTP errors | Browser Listeners | `consoleErrors = 0`, `pageErrors = 0`, `httpErrors = 0` | **PASS** |
| **L11** | Đo hiệu năng GPU 5.0 giây liên tục | Real-GPU D3D11 Benchmark | **`60.05 FPS`** avg, **`59.17 FPS`** 1% Low, **`16.8 ms`** p95, **`8`** Draw Calls | **PASS** |
| **L12** | Bảo toàn 89 Archive & Production Source | SHA-256 + `git diff` + `tsc` | `89/89` SHA-256 khớp 100%, `0` file production bị sửa, `tsc` PASS | **PASS** |

*(Ghi chú phân biệt: `L06` và `L07` dùng `teleportForInspection` chỉ để đưa nhân vật tới đúng khu vực mốc trước khi dùng phím thật `KeyW/A/D` kiểm tra va chạm và vòng sau cây.)*

---

## 6. Báo cáo Hiệu năng GPU Thực tế (§11)

Hồ sơ đầy đủ: [LAB_01_PERFORMANCE.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-MAP-LAB-01/LAB_01_PERFORMANCE.json)

| Chỉ số đo (`5.012s`, `301` frames, `1280×720`) | Giá trị đo được |
| :--- | :--- |
| **GPU / Trình kết xuất** | `ANGLE (NVIDIA GeForce GTX 1070 Ti Direct3D11)` |
| **FPS trung bình (VSync 60 Hz)** | **`60.05 FPS`** |
| **Min FPS / 1% Low FPS** | **`58.82 FPS`** / **`59.17 FPS`** |
| **Frame Time (`p50` / `p95` / `p99`)** | `16.7 ms` / **`16.8 ms`** / `16.9 ms` |
| **WebGL Hardware Draw Calls / Frame** | **`8` calls** (nhờ gộp atlas + Tilemap batching + camera culling) |
| **Tổng Display Objects / Đang hiển thị (Culled)** | `205` tổng / `62 / 130` mục cull đang bật trong viewport |
| **Collision Bodies (Static)** | `58` (`34` thân cây, `8` công trình, `16` đá/bụi/gốc) |
| **JS Heap Used** | **`22.56 MB`** |

---

## 7. Bằng chứng Ảnh Gameplay (§13)

*(Ghi chú: Chưa xuất video 20–30s trong phiên headless này; đã chụp đầy đủ 6 ảnh kiểm định độ phân giải `1280×720`.)*

1. 🖼️ **Toàn cảnh đường mòn & khoảng đất trống:** [LAB_01_PLAYABLE_OVERVIEW.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_PLAYABLE_OVERVIEW.png)
2. 🖼️ **Tỷ lệ Black Knight cạnh đền đá & tượng cổ:** [LAB_01_PLAYER_SCALE.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_PLAYER_SCALE.png)
3. 🖼️ **Y-Depth đứng trước cây:** [LAB_01_TREE_Y_DEPTH_FRONT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_TREE_Y_DEPTH_FRONT.png)
4. 🖼️ **Y-Depth đi ra sau tán cây:** [LAB_01_TREE_Y_DEPTH_BEHIND.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_TREE_Y_DEPTH_BEHIND.png)
5. 🖼️ **Lớp kiểm tra Collider `[F4]`:** [LAB_01_COLLISION_OVERLAY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_COLLISION_OVERLAY.png)
6. 🖼️ **Ánh sáng dịu & Sương mù `[F3]`:** [LAB_01_LIGHTING_FOG.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-MAP-LAB-01/LAB_01_LIGHTING_FOG.png)

---

## 8. Final Status

```text
PROTOTYPE PATH:           G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\World_Labs\LAB_01_RESURRECTED_FOREST
RUN COMMAND:              cd "G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\World_Labs\LAB_01_RESURRECTED_FOREST" && python -m http.server 4175
LOCAL GAME URL:           http://127.0.0.1:4175/
EDITABLE MAP PATH:        G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\World_Labs\LAB_01_RESURRECTED_FOREST\maps\lab_01_resurrected_forest.tmj (và .tmx)
ASSETS USED:              Resurrected RPG 1.1 (Immunity) + resurrected_dirt_path.png + Black Knight Runtime Atlases (Fellor)
LICENSE VERIFIED:         YES (Commercial / Itch.io asset licenses verified; copy-only inside isolated lab)
TARGETED TESTS:           12/12 PASS
COLLISION STATUS:         PASS (58 tight trunk/ruin/prop colliders; 0 canopy/flora colliders; 18x12 foot box)
Y-DEPTH STATUS:           PASS (Split trunk/canopy Y-sorting front & behind verified)
FPS:                      60.05 FPS avg (58.82 min / 59.17 1% Low)
FRAME TIME P95:           16.8 ms
DRAW CALLS:               8 WebGL calls/frame
ARCHIVES PRESERVED:       89/89 (100% SHA-256 MATCH)
FILES DELETED:            0
PRODUCTION SOURCE MODIFIED: NO
PRODUCTION MAP MODIFIED:  NO
FINAL STATUS:             PASS
```
