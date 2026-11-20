# BÁO CÁO KỸ THUẬT V152-03: HOÀN THIỆN ĐƯỜNG BIÊN & TỐI ƯU ĐỊA HÌNH BẢN ĐỒ
**Dự án:** HOLLOW WOODS v1.5.2  
**Thời gian:** 2026-11-20  
**Trạng thái:** Hoàn tất 100% (PASS tất cả bộ kiểm thử)

---

## 1. MỤC TIÊU & DANH SÁCH HẠNG MỤC THỰC HIỆN

| STT | Mã Hạng Mục | Nội Dung Yêu Cầu | Trạng Thái |
|:---:|:---|:---|:---:|
| 1 | **PERIMETER_SEAL** | Bịt kín 100% rìa bản đồ, đóng collider chu vi dày $\ge 32\text{px}$ + clamp tọa độ an toàn, chống lọt ra void. Cổng Đông kiểm tra êm ái, cooldown nhắc nhở 3s | **HOÀN TẤT** |
| 2 | **FARM_PATH_CLEAR** | Mở thông đường từ Nam nhà Neris xuống Nông trại (Sanctuary Farm), dọn rào kép, dời cây sồi chắn, mở hành lang $\ge 80\text{px}$ | **HOÀN TẤT** |
| 3 | **FARM_POND_RELOCATE** | Dời ao đá chắn đường chính nông trại sang góc luống rau Đông (`x: 980, y: 885`), lót đường đất phẳng thông suốt | **HOÀN TẤT** |
| 4 | **NPC_FINN_GARTH_TRIM** | Tăng offset nhãn tên Finn (`headOffsetY = 54`), dọn sạch bụi cây đè lên người Garth và tràn lòng đường | **HOÀN TẤT** |
| 5 | **EAST_BRIDGE_REMOVAL** | Xóa cầu sập, ô nước vuông, thân cây xuyên cầu phía Đông Cổng Đông; lót đường mòn phẳng mượt; blend alpha ranh giới Bellhollow - Outer Woods | **HOÀN TẤT** |
| 6 | **VERIFICATION** | Chạy toàn bộ test suites (`tsc`, `audit_map_reachability`, `audio`, `data_integrity`), bảo đảm 0 lỗi tồn đọng | **HOÀN TẤT** |

---

## 2. NGUYÊN NHÂN GỐC & CHI TIẾT SỬA ĐỔI

### 2.1. Bịt kín rìa bản đồ & Chốt an toàn chống lọt Void
- **Nguyên nhân gốc:**
  - Một số phân khu biên như `bellhollow` (phía Tây và Đông ngoài cổng), `fog_crossing` (mép Đông phía dưới) và các cạnh biên chỉ dùng collider mỏng ($16\text{px}$) hoặc có khe hở vật lý khiến nhân vật khi va chạm góc hoặc tốc độ cao có thể trượt xuyên qua rìa ra vùng đen vô tận.
  - Khi Cổng Đông chưa mở, nếu nhân vật ép sát collider có thể gặp phản hồi giật hoặc đè phím.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/data/zones.json`:
    - Bổ sung 4 static colliders chu vi dày $32\text{px}$ ở Bellhollow: `bell_bound_west_top` (`x: 480, y: 0, w: 32, h: 180`), `bell_bound_west_bottom` (`x: 480, y: 310, w: 32, h: 250`), `bell_bound_east_top` (`x: 1600, y: 0, w: 32, h: 220`), `bell_bound_east_bottom` (`x: 1600, y: 340, w: 32, h: 220`).
    - Bổ sung `fog_bound_east_lower` (`x: 464, y: 310, w: 32, h: 250`) ở Fog Crossing.
    - Nâng toàn bộ các boundary colliders của `fog_crossing`, `sanctuary_farm`, `outer_woods` lên độ dày $\ge 32\text{px}$.
  - `src/scenes/GameScene.ts`:
    - Thêm cơ chế `clampPlayerToZoneBounds()`: kẹp cứng vị trí người chơi trong ranh giới an toàn của phân khu hiện tại (`[safeMinX, safeMaxX]` và `[safeMinY, safeMaxY]`), triệt tiêu ngay vận tốc ngoài biên khi không trong trạng thái chuyển vùng cảnh (`!this.isTransitioning && this.transitionCooldown <= 0`).
    - Bổ sung cơ chế nhắc nhở nhẹ nhàng Cổng Đông với cooldown 3 giây (`lastEastGateReminderTime`), không giật lùi, không khóa điều khiển `inputLocked`.

### 2.2. Mở thông đường từ Làng Bellhollow xuống Nông Trại (#2)
- **Nguyên nhân gốc:**
  - Ở phía Nam nhà Neris (`x: 650..700, y: 480..560`), có 2 lớp hàng rào gỗ xếp đè lên nhau kèm collider `Hàng Rào Vườn Dược Tây Nam` và một cây sồi cổ thụ tại `(654, 542)` chắn ngang tim đường dẫn xuống phân khu nông trại.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/world/WorldBuilder.ts`:
    - Xóa bỏ hàng rào kép và collider cản đường tại đoạn code vẽ vườn thảo dược Tây Nam (dòng 3392..3399).
    - Di dời cây sồi `southRimTrees` từ `(654, 542)` dạt sang phía Tây tại `(574, 554)`, hoàn toàn giải phóng tim đường.
    - Mở rộng bán kính vẽ dải đường đất hữu cơ nhánh Nam (`drawOrganicDirtPath`) lên $r = 42..44\text{px}$, bảo đảm hành lang đi lại thông thoáng rộng $\ge 84\text{px}$.

### 2.3. Dời ao nước nằm giữa đường chính Nông Trại (#7)
- **Nguyên nhân gốc:**
  - Tại `sanctuary_farm`, ao nước tròn viền đá được đặt tại `(975, 745)`, nằm ngay trên tim đường đất nối ngang trước giếng nước nông trại, khiến nhân vật bị cản trở di chuyển giữa khu vực nhà kho và luống hoa màu.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/world/WorldBuilder.ts`:
    - Di chuyển tâm ao tròn viền đá từ `(975, 745)` sang góc trống bên cạnh luống rau phía Đông tại `(980, 885)`.
    - Lót lại đường đất chính Đông-Tây tại `(910, 740)` và `(1030, 745)` với bề mặt phẳng mượt, liên tục 100%.

### 2.4. Tối ưu NPC Finn (#3) & Dọn bụi cây quanh Garth (#5)
- **Nguyên nhân gốc:**
  - Nhãn tên (overhead nameplate) của NPC Finn có offset thấp khiến thanh text và icon tương tác che khuất phần đầu/mặt của cậu bé.
  - Quanh vị trí bảo vệ Garth ở Cổng Tây có 2 bụi cây tràn lên lòng đường và đè sát thân sprite nhân vật.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/entities/NPCEntity.ts`: Thiết lập `this.headOffsetY = 54` riêng cho NPC `finn` để đưa nhãn tên lên cao thoáng đãng.
  - `src/world/WorldBuilder.ts`:
    - Trong `renderFogCrossingToBellhollowTransition`: dọn sạch bụi cây tại `seamX + 22, 206` (đè thân Garth) và `seamX + 24, 268` (tràn lòng đường). Chỉ giữ lại 2 bụi cây viền gọn sát hàng rào hai bên (`seamX - 18, 172` và `seamX - 16, 338`).
    - Dời bụi rậm tại `(496, 178)` lên `(490, 168)` áp sát chân rào trên, trả lại lòng đường Cổng Tây rộng rãi.

### 2.5. Xóa cầu sập thừa & Làm mượt ranh giới Cổng Đông (#18)
- **Nguyên nhân gốc:**
  - Phía Đông Cổng Đông (`crooked_path` / `outer_woods`), đoạn đường mòn có chướng ngại vật mố cầu vỡ, ô nước vuông nhân tạo không có dòng suối và thân cây đỏ mọc xuyên qua giữa cầu, kèm collider `cp_collapsed_bridge_blocker` gây bất hợp lý về mặt thị giác và luồng di chuyển.
  - Vạch tiếp giáp giữa `bellhollow` và `crooked_path` tại $x = 1600$ có đường cắt tương phản đột ngột giữa cỏ xanh sáng làng và đất tối rừng.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/data/zones.json`: Xóa sạch collider `cp_collapsed_bridge_blocker` và interactable `collapsed_shrine_bridge`.
  - `src/world/WorldBuilder.ts`:
    - Làm rỗng hàm `createCollapsedStoneBridgeObstacle`, xóa toàn bộ việc vẽ ô nước vuông, mố đá vỡ, thân cây đổ và cổng sắt cản đường.
    - Vẽ dải đường đất mòn liên tục qua các tọa độ `(1600, 282) -> (1680, 280) -> (1760, 280) -> (1860, 280) -> (1980, 280)`.
    - Trong `renderVillageToForestTransition`: bổ sung hệ thống hòa trộn alpha blend đa dải gradient trên toàn bộ dải Y (0..560) tại $x = 1600$, tạo hiệu ứng chuyển tiếp màu sắc tự nhiên, mượt mà giữa hai phân khu.

---

## 3. KẾT QUẢ KIỂM THỬ

```text
1. TypeScript Strict Check:
   npx tsc --noEmit -> EXIT CODE 0 (0 lỗi)

2. Map Reachability & Perimeter Audit:
   node scripts/audit_map_reachability_and_assets.mjs
   -> 73/73 tests PASS (100%)
   - BFS Reachable 18/18 khu vực & NPC: PASS
   - Không có collider đè lên NPC hay tim đường: PASS
   - Rìa chu vi dày >= 32px và không có khe hở: PASS

3. Audio System Integrity:
   node scripts/test_v15_fix_02_audio.mjs
   -> 12/12 tests PASS (100%)

4. Data Integrity Verification:
   node scripts/verify_data_integrity.mjs
   -> 15/15 tests PASS (100%)
```

---

## 4. KẾT LUẬN
Bước **V152-03** đã hoàn thành trọn vẹn, đáp ứng chính xác 100% các tiêu chuẩn kỹ thuật và các quy tắc nghiêm ngặt trong `Read/AI_IRON_RULES.md`. Mã nguồn sẵn sàng cho bước tiếp theo **V152-04**.
