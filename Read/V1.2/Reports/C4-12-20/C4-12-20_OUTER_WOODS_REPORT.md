# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-20
## XÂY DỰNG BẢN ĐỒ MÔI TRƯỜNG CHO VÙNG RỪNG NGOÀI — OUTER WOODS MAP EXPANSION

- **Mã hiệu:** `COMMAND C4-12-20`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Vùng Rừng Ngoài (`outer_woods`, Layer 1 — Core World) & Cổng Đông Nam kết nối Làng Bellhollow (`bellhollow`).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 1 — Core World).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 59/59 TESTS, 0 ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-20

Tiếp nối khung mặt bằng Vùng Lõi (Core World Blockout từ C4-12-17) và bản đồ Nông trại Sanctuary Farm (C4-12-19), bước **C4-12-20** triển khai hoàn chỉnh thế giới môi trường cho **Rừng Ngoài (Outer Woods)** — vành đai rừng ven bao bọc phía Đông Nam làng Bellhollow với các yêu cầu kỹ thuật và trải nghiệm sau:

1. **Không gian khám phá mở đa hướng (Open Woodland Exploration):** Xóa bỏ cảm giác hành lang đơn điệu bằng việc thiết lập 4 khoảng rừng thưa tự nhiên (clearings), liên kết bởi hệ thống đường mòn đất nén uốn lượn và các lối rẽ phụ chứa tài nguyên khám phá.
2. **Khai thác tài nguyên đầu game (Early-Game Gathering):** Bố trí 9 điểm thu thập nguyên liệu phong phú thuộc 4 nhóm cơ bản (*Gỗ Khô*, *Đá Lửa*, *Nhựa Cây*, *Thảo Dược Bạc*) ở các vị trí tiếp cận được, hỗ trợ người chơi chế tạo thuốc đắp, dầu đèn và mồi nhử trước khi mở Cổng Đông bước vào vùng nguy hiểm.
3. **Đạo cụ môi trường & Kể chuyện không gian (Environmental Storytelling):**
   - **Bãi Trại Thợ Săn (Hunter's Camp):** Bếp lửa trại với tro than và viền đá lửa, lều bạt dã ngoại nghiêng lợp vải thô, giá phơi da thú và thảo mộc, cụm thùng gỗ và củi khô.
   - **Thân cây cổ thụ đổ (Fallen Logs):** Thân cây sồi già phủ rêu nhung xanh mướt, điểm xuyết các cụm nấm mộc nhĩ vàng cam và vết nứt rỉ nhựa cây.
   - **Bãi Liễu Cổ Thụ Bí Ẩn:** Gốc liễu đại ngàn phía Nam buông rủ cành lá, bao bọc thảm hoa cỏ rừng tự nhiên.
   - **Lạch nước rừng ven:** Con suối nhỏ phía Đông với bờ đá cuội và hàng đá bước qua suối (stepping stones).
4. **Sương mù ranh giới nhẹ nhàng (Atmospheric Boundary Fog):** Màn sương đêm phảng phất mỏng nhẹ dọc chân rặng núi đá phía Nam và viền rừng rậm phía Đông, tạo chiều sâu thị giác mà tuyệt đối không che khuất các mốc định hướng quan trọng hay các điểm tương tác.
5. **Kết nối mượt mà với Làng Bellhollow & Nông Trại:** Khớp nối hoàn hảo điểm đi và điểm quay về giữa Cổng Đông Nam làng Bellhollow $(1210, 560)$ và Nông Trại Trú Ẩn $(1120, 740)$; chuẩn hóa hướng nhìn nhân vật (Facing Direction) khi chuyển vùng.

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & TÍCH HỢP HỆ THỐNG

### 2.1. Địa Hình & 4 Khoảng Rừng Thưa (`outer_woods_ground_baked_v12`)
Toàn bộ bề mặt địa hình Outer Woods ($480 \times 480\text{ px}$, $x = 1120..1600, y = 560..1040$) được nướng vào 1 `CanvasTexture` tối ưu duy nhất tại `depth = -98`:
- **Nền thảm lá kim & rêu rừng:** Màu xanh rêu sẫm (`#202f1d`) phối cùng `TILE_FOREST_GRASS` (alpha 0.25) và hơn 900 đốm rêu đa sắc độ.
- **4 Khoảng Rừng Thưa (Clearings):**
  1. *Bãi Cửa Rừng Phía Bắc:* Quanh $(1210, 620)$, thảm cỏ rậm chuyển tiếp đón người chơi từ Bellhollow bước xuống.
  2. *Bãi Trại Thợ Săn (Hunter's Camp Clearing):* Quanh $(1330, 730)$, nền đất nện sẫm màu (`#423220`), vòng đá lửa trại và than hồng âm ỉ.
  3. *Bãi Suối Rừng Phía Đông (East Brook Clearing):* Quanh $(1460, 810)$, nền đá cuội ẩm ướt rải rác bên lạch nước rừng.
  4. *Bãi Liễu Cổ Thụ Bí Ẩn Phía Nam (South Willow Clearing):* Quanh $(1260, 920)$, đồi đất rêu màu mỡ (`#2a3d22`), điểm xuyết 35 đốm hoa dại tím và vàng.
- **Mạng lưới Đường Mòn Đất Nén (Organic Trails):**
  - **Tuyến đường chính:** $(1210, 560) \rightarrow (1235, 620) \rightarrow (1255, 680) \rightarrow (1270, 740) \rightarrow (1330, 730) \rightarrow (1390, 760) \rightarrow (1460, 810)$.
  - **Nhánh rẽ sang Nông Trại Trú Ẩn:** Nối từ $(1120, 740)$ qua $(1200, 745)$ hòa vào ngã ba trung tâm $(1270, 740)$.
  - **Nhánh rẽ phụ xuống Bãi Liễu Cổ Thụ:** Uốn lượn từ $(1270, 740) \rightarrow (1265, 820) \rightarrow (1260, 910)$.
  - **Nhánh rẽ tiếp nối sang Đường Mòn Quanh Co:** Dẫn từ $(1460, 810) \rightarrow (1510, 795) \rightarrow (1555, 780)$.
- **Lạch Nước Rừng & Đá Bước Qua Suối:** Đoạn suối uốn lượn từ $(1460, 780)$ đến $(1475, 960)$ với 3 tầng sắc độ nước (`#15222c`, `#203442`, `#2d4a5d`) và 3 tảng đá dẹt bước chân qua suối an toàn.

### 2.2. Phân Bổ 9 Điểm Thu Thập Tài Nguyên Đầu Game (`src/systems/InventorySystem.ts`)
Bổ sung 9 điểm khai thác tài nguyên tự do rải rác tại các khoảng rừng thưa và lối rẽ:

| Mã Node | Loại Tài Nguyên | Tọa độ Thế Giới $(x, y)$ | Số lượng | Vị trí Cảnh Quan |
| :--- | :---: | :---: | :---: | :--- |
| `node_wood_ow_1` | Gỗ Khô (`res_dry_wood`) | $(1190, 650)$ | 1 | Thân cành gãy gần bãi cửa rừng phía Bắc |
| `node_resin_ow_1` | Nhựa Cây (`res_tree_resin`) | $(1360, 620)$ | 1 | Cây sồi rỗng ruột rỉ nhựa tự nhiên |
| `node_flint_ow_1` | Đá Lửa (`res_flint`) | $(1300, 755)$ | 1 | Ven vòng đá bếp lửa trại thợ săn |
| `node_wood_ow_2` | Gỗ Khô (`res_dry_wood`) | $(1380, 720)$ | 1 | Đống củi xẻ của lều trại thợ săn |
| `node_herb_ow_1` | Thảo Dược Bạc (`res_herbs`) | $(1440, 770)$ | 2 | Khóm thảo dược ven bờ suối rừng phía Đông |
| `node_flint_ow_2` | Đá Lửa (`res_flint`) | $(1485, 830)$ | 1 | Bãi đá sỏi cuội lòng suối |
| `node_wood_ow_3` | Gỗ Khô (`res_dry_wood`) | $(1230, 940)$ | 1 | Thân cây đổ phủ rêu phía Nam |
| `node_resin_ow_2` | Nhựa Cây (`res_tree_resin`) | $(1320, 910)$ | 1 | Cây sồi cổ thụ bên Bãi Liễu |
| `node_herb_ow_2` | Thảo Dược Bạc (`res_herbs`) | $(1280, 950)$ | 1 | Dưới bóng râm cây liễu đại ngàn |

### 2.3. Đạo Cụ Pixel Art Mới (`src/world/WorldBuilder.ts`)
- `createHunterLeanToShelter(1350, 690)`: Lều bạt dã ngoại thợ săn bằng cọc gỗ sồi vát chéo, bạt phủ màu xám lục sẫm, đệm rơm lót sàn và nếp gấp dây chằng.
- `createHunterPeltRack(1285, 730)`: Giá gỗ chữ A căng da thú phơi khô và treo bó cỏ thơm.
- `createFallenLog(x, y, length, angle)`: Thân cây sồi gãy đổ, lưng phủ rêu nhung và sườn mọc nấm sò vàng cam tại 3 vị trí: $(1190, 670)$, $(1475, 795)$, $(1220, 955)$.
- `createOuterWoodsBoundaryFog()`: Tái sử dụng texture `SPRITE_FOG_SMOOTH` với tween trôi êm ái ($7500..8200\text{ ms}$, alpha $0.18..0.28$) dọc ranh giới phía Đông và phía Nam mà không phủ mờ tâm các khoảng rừng thưa.
- `createVillageLanternPost`: 4 cột đèn lồng ấm áp dẫn đường tại Cửa Rừng $(1210, 600)$, Bãi Trại $(1310, 700)$, Ngã Rẽ Suối $(1390, 755)$ và Lối Rẽ Bãi Liễu $(1270, 825)$.

### 2.4. Đối Tượng Tương Tác & Lời Thoại Môi Trường (`zones.json` & `GameScene.ts`)
Bổ sung 4 tương tác môi trường phím `[E]`:
1. `ow_signpost` $(1220, 640)$: *"📜 Biển Chỉ Dẫn: 'HƯỚNG ĐÔNG NAM — Rừng Ngoại Vi. Thu thập củi khô & thảo mộc rừng.'"*
2. `ow_hunter_camp` $(1320, 720)$: *"🏕️ Bếp Lửa Thợ Săn: Tàn tro than đã nguội lạnh. Rải rác xung quanh là đá lửa và cành củi khô."*
3. `ow_fallen_tree` $(1480, 800)$: *"🪵 Thân Cây Cổ Thụ Đổ: Một cây sồi đại ngàn bị quật ngã, rêu ẩm phủ đầy thân cây và nhựa rỉ ra từ kẽ nứt."*
4. `ow_ancient_willow` $(1260, 910)$: *"🌿 Cây Liễu Cổ Thụ: Tán lá rủ dài chạm đất che chắn cho bãi đất thưa yên bình, rải rác khóm Thảo Dược Bạc hoang dã."*

### 2.5. Chuẩn Hóa Hướng Nhìn Nhân Vật Khi Spawn (`SatyrPlayer.ts`)
Bổ sung phương thức `setFacing(direction: FacingDirection)` trong [SatyrPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts#L883-L900) giúp đồng bộ ngay hướng nhìn và hoạt ảnh idle khi nhân vật bước qua ranh giới giữa Làng Bellhollow và Rừng Ngoài (xuống phía Nam: `down`, quay về Làng: `up`).

---

## 3. KẾT QUẢ KIỂM THỬ VÀ XÁC NHẬN CHẤT LƯỢNG

Hệ thống đã trải qua kiểm thử tự động toàn diện qua script `scripts/verify_outer_woods_c4_12_20.mjs` và các bộ test hồi quy:

### 3.1. Kết quả kiểm tra C4-12-20 (`verify_outer_woods_c4_12_20.mjs`)
- **Nhóm 1 — Toàn vẹn Bản Lưu Dự Phòng (Pre-Backup):** 6/6 PASS (`Backups/C4-12-20_PRE_BACKUP/`).
- **Nhóm 2 — Sổ Đăng Ký Vùng & Căn Chỉnh Chuyển Vùng:** 7/7 PASS (Đầy đủ điểm nối, spawn `(1210, 580)` quay mặt xuống, return `(1210, 510)` quay mặt lên, có hàm `setFacing`).
- **Nhóm 3 — Địa Hình & 4 Khoảng Rừng Thưa:** 10/10 PASS (Đủ 4 bãi thưa, tuyến chính, 3 nhánh rẽ phụ và đá bước qua suối).
- **Nhóm 4 — Đạo Cụ & Nghệ Thuật Rừng Ven:** 12/12 PASS (Lều thợ săn, giá phơi da thú, 3 thân cây đổ có nấm, cây liễu cổ thụ, sương mù ranh giới).
- **Nhóm 5 — 9 Điểm Thu Thập Tài Nguyên:** 9/9 PASS (Đủ 4 nhóm tài nguyên `res_dry_wood`, `res_flint`, `res_tree_resin`, `res_herbs`).
- **Nhóm 6 — Đối Tượng Tương Tác & Phản Hồi:** 11/11 PASS (Đủ 4 interactables và các câu thoại thông điệp).
- **Nhóm 7 — Luồng Di Chuyển & Va Chạm:** 4/4 PASS (Zero collider overlap trên toàn bộ 9 điểm tài nguyên; lối vào Bellhollow $120\text{ px}$ và Sanctuary Farm $140\text{ px}$ thông thoáng tuyệt đối).
- **TỔNG KẾT:** **59 / 59 BÀI TEST ĐẠT (100% PASS)**.

### 3.2. Kiểm tra Hồi Quy (Regression Tests)
- `verify_sanctuary_farm_c4_12_19.mjs`: **44 / 44 PASS (100%)**.
- `verify_farming_c4_12_16.mjs`: **33 / 33 PASS (100%)**.
- `verify_core_world_blockout_c4_12_17.mjs`: **49 / 49 PASS (100%)**.
- `npx tsc --noEmit`: **0 ERRORS** (Biên dịch TypeScript sạch sẽ 100%).
- **Hiệu năng & Trình duyệt:** Server Vite `http://localhost:3000/` tải trang tức thì, chuyển cảnh mượt mà không khựng giật, duy trì tốc độ khung hình chuẩn $60\text{ FPS}$.

---

## 4. KẾT LUẬN VÀ BƯỚC TIẾP THEO

Bước **`C4-12-20`** đã hoàn tất việc xây dựng toàn diện thế giới cảnh quan Rừng Ngoài (Outer Woods), hoàn tất trọn vẹn toàn bộ 3 phân khu thuộc **Tầng 1 — Core World** (*Làng Bellhollow*, *Nông Trại Trú Ẩn*, *Rừng Ngoài*).

Dự án sẵn sàng tiến vào Tầng 2 (Frontier):
👉 **COMMAND C4-12-21: Xây Dựng Bản Đồ Khu Vực Đường Mòn Quanh Co (The Crooked Path Map Expansion).**
