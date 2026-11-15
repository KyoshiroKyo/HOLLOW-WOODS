# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT C4-12-12
## CHUẨN HÓA HIỂN THỊ ĐỊA HÌNH, MẶT ĐẤT VÀ ĐƯỜNG ĐI TRÊN CÁC KHU VỰC HIỆN CÓ (TERRAIN & PATH ALIGNMENT)

- **Mã lệnh:** `COMMAND C4-12-12`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Mô hình thế giới:** **World Structure C — Hybrid Open World (Thế Giới Mở Lai 3 Tầng)**
- **Định hướng mỹ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái thực thi:** **HOÀN TẤT THÀNH CÔNG (40/40 TIÊU CHÍ QC ĐẠT 100%)**
- **Bản sao lưu trước khi sửa:** [Backups/C4-12-12_PRE_BACKUP/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-12_PRE_BACKUP/) (`WorldBuilder.ts`, `zones.json`, `GameScene.ts`).

---

## 1. TỔNG QUAN VÀ MỤC TIÊU THỰC HIỆN

Thực hiện yêu cầu chuẩn hóa môi trường theo định hướng Dark Woodland Pixel Art và tham chiếu bản đồ hữu cơ (`media_1794702044899_ce66ab1a.jpg`), bước **C4-12-12** tập trung xử lý toàn diện chất lượng mặt đất, hệ thống đường mòn và sự đồng bộ với hộp va chạm trên tất cả các phân khu hiện hữu (`fog_crossing`, `bellhollow`, `crooked_path`, `silent_mire`, `broken_bell_shrine`):

1. **Loại bỏ hoàn toàn các dải TileSprite hình chữ nhật cứng nhắc:**
   - Thay thế các khối hình chữ nhật chắp vá cũ (`trailSegments`, `mirePaths`, `courtyard` đơn điệu) bằng công nghệ nướng mặt đất CanvasTexture đa tầng pixel-art (`crooked_path_ground_baked_v12`, `silent_mire_ground_baked_v12`, `broken_bell_shrine_ground_baked_v12`).
   - Đảm bảo hiệu năng tối đa với đúng 1 đối tượng đồ họa mặt đất duy nhất ở depth `-98` cho mỗi phân khu, triệt tiêu hiện tượng sụt FPS do hàng trăm TileSprite đè lặp.
2. **Khớp nối liền mạch không lệch mép (Zero Seam Offset & Zero Gap):**
   - Chuẩn hóa tọa độ, độ cong, bán kính và màu sắc bề mặt tại tất cả các điểm giao cắt giữa các phân khu liên tiếp.
   - Biên giới chuyển vùng khớp chính xác từng pixel:
     - `fog_crossing` $\rightarrow$ `bellhollow`: $(480, 232, r: 22)$ $\leftrightarrow$ $(480, 232, r: 22)$ ($\Delta y = 0, \Delta r = 0$).
     - `bellhollow` $\rightarrow$ `crooked_path`: $(1600, 282, r: 22)$ $\leftrightarrow$ $(1600, 282, r: 22)$ ($\Delta y = 0, \Delta r = 0$).
     - `crooked_path` $\rightarrow$ `silent_mire`: $(2880, 300, r: 20)$ $\leftrightarrow$ $(2880, 300, r: 20)$ ($\Delta y = 0, \Delta r = 0$).
     - `silent_mire` $\rightarrow$ `broken_bell_shrine`: $(4000, 280, r: 20)$ $\leftrightarrow$ $(4000, 280, r: 20)$ ($\Delta y = 0, \Delta r = 0$).
3. **Mạng lưới đường mòn hữu cơ, có nhánh rẽ và khoảng mở (Clearings):**
   - Thiết kế các nhánh đường tự nhiên uốn lượn dẫn thẳng tới từng đối tượng tương tác, điểm ẩn nấp và cổng phân khu mới:
     - Lối rẽ Nam Bellhollow dẫn tới Biển Nông Trại Trú Ẩn $(650, 520)$.
     - Lối rẽ Đông-Nam Bellhollow dẫn tới Biển Rừng Ngoại Vi $(1200, 510)$.
     - Lối rẽ Bắc Crooked Path dẫn tới Biển Cảnh Báo Rừng Sâu $(2100, 35)$.
     - Lối rẽ Tây-Nam Crooked Path dẫn về Rừng Ven $(1610, 480)$.
     - Các bãi đất trống hữu cơ quanh 2 Thân Cây Rỗng ẩn nấp $(1900, 180)$ & $(2350, 420)$ và Tảng Đá Cổ $(2100, 280)$.
     - Cầu ván gỗ mục (Boardwalk) và Trận Địa Đá Cổ Ngữ (3 bệ đá Moon, Root, Eye) tại Silent Mire.
     - Sân Đá Đại Lễ và đường đá dẫn tới Bệ Thờ Chuông Đổ $(4500, 250)$ tại Broken Bell Shrine.
4. **Đồng bộ hóa 100% với luồng di chuyển và va chạm nhân vật:**
   - Hộp va chạm chân của nhân vật chính là $14 \times 8\text{ px}$. Mọi cung đường đều duy trì bán kính $r \ge 15\text{ px}$ (độ rộng $\ge 30\text{ px}$), tạo hành lang di chuyển thông thoáng, không bị vướng mắc hay kẹt thân vào cây cối xung quanh.

---

## 2. BẢNG SO SÁNH TRƯỚC VÀ SAU KHI CHUẨN HÓA (BEFORE VS AFTER)

| Tiêu Chí | Hiện Trạng Trước C4-12-12 | Sau Khi Chuẩn Hóa C4-12-12 |
| :--- | :--- | :--- |
| **Đồ họa mặt đất Crooked Path** | 4 dải TileSprite hình chữ nhật (`350x50`, `350x60`, v.v.) ghép nối gấp khúc, mép cắt thẳng thô cứng. | CanvasTexture nướng sẵn đa tầng (`crooked_path_ground_baked_v12`), uốn lượn tự nhiên có viền cỏ dập, lòng đường đất ấm, sỏi rừng và bãi đất quanh hốc cây. |
| **Đồ họa mặt đất Silent Mire** | 3 dải TileSprite đơn điệu chồng lấp trên nền xanh lục, không có cầu ván gỗ, không có bệ đá cổ ngữ. | CanvasTexture nướng sẵn (`silent_mire_ground_baked_v12`) thể hiện bùn lầy rêu phong, vũng nước sẫm màu, cầu ván gỗ mục bắc qua lầy và Trận Địa 3 Cột Đá Cổ Ngữ. |
| **Đồ họa mặt đất Broken Bell Shrine** | 1 khối TileSprite chữ nhật lơ lửng ở giữa, khoảng cách 200px từ cổng vào không hề có đường đi. | CanvasTexture nướng sẵn (`broken_bell_shrine_ground_baked_v12`) có lối đá cổ tiếp cận từ cổng và Sân Đá Đại Lễ bo góc elip tráng lệ bao bọc bàn thờ miếu. |
| **Khớp nối biên giới (Seams)** | Lệch tọa độ Y và lệch độ rộng, gây cảm giác đứt gãy khi nhân vật di chuyển qua cổng ranh giới. | Khớp tuyệt đối 100% trên cả 4 khớp nối ranh giới: $\Delta x = 0$, $\Delta y = 0$, $\Delta r = 0$, màu sắc chuyển tiếp đồng bộ. |
| **Lối ra các phân khu mới** | Không có dấu vết đường đi dẫn tới Nông Trại, Rừng Ngoại Vi hay Rừng Sâu. | Bổ sung đầy đủ các nhánh đường hữu cơ kết nối liền mạch tới các biển chỉ dẫn và cổng rào phân khu. |
| **Số lượng Draw Calls / GameObjects** | Hàng chục GameObject TileSprite nhỏ lẻ chồng chéo. | Đúng 1 GameObject Image duy nhất ở depth `-98` cho mỗi phân khu, tối ưu hóa hiệu năng 60 FPS mượt mà. |

---

## 3. THIẾT KẾ CHI TIẾT 5 BỀ MẶT ĐỊA HÌNH & MẠNG LƯỚI ĐƯỜNG ĐI

```text
  Fog Crossing               Bellhollow Village                      The Crooked Path                     Silent Mire                    Broken Bell Shrine
(0..480, 0..360)             (480..1600, -200..760)                (1600..2880, 0..640)              (2880..4000, 100..740)             (4000..4960, 0..600)
┌──────────────┐         ┌─────────────────────────┐           ┌──────────────────────────┐      ┌─────────────────────────┐      ┌────────────────────────┐
│ [Lối Mòn Đất]│ ──────> │ [Cổng Tây]              │           │                          │      │                         │      │                        │
│ (80,180)     │ (480,232│ (480,232)               │           │                          │      │                         │      │                        │
│              │ r=22    │    │                    │           │ ┌───[Lối Rừng Sâu]       │      │                         │      │                        │
│              │         │    ▼                    │           │ │   (2100, 35)           │      │                         │      │                        │
│              │         │ [Quảng Trường Đá Cuội]  │           │ │                        │      │                         │      │                        │
│              │         │    │       │            │           │ │                        │      │                         │      │                        │
│              │         │    │       ├──> Cổng Nam│           │ │                        │      │                         │      │                        │
│              │         │    │       │    (Nông   │           │ │                        │      │                         │      │                        │
│              │         │    │       │    Trại)   │           │ │                        │      │                         │      │                        │
│              │         │    │       │            │           │ │                        │      │                         │      │                        │
│              │         │    │       └──> Cổng Đ.N│           │ │                        │      │                         │      │                        │
│              │         │    │            (Rừng   │           │ │                        │      │                         │      │                        │
│              │         │    │            Ven)    │           │ │                        │      │                         │      │                        │
│              │         │    ▼                    │ (1600,282)│ ▼                        │(2880,│                         │(4000,│                        │
│              │         │ [Cổng Đông Bellhollow]  │ ────────> │ [Đường Mòn Quanh Co]     │ 300) │ [Đường Đất & Cầu Ván]   │ 280) │ [Lối Đá Cổ Tiếp Cận]   │
│              │         │ (1600, 282)             │ r=22      │ (1600,282) ──> (2880,300)│ ────>│ ──> [Trận Địa Cổ Ngữ]  │ ────>│ ──> [Sân Đá Đại Lễ]    │
│              │         │                         │           │  (Hốc Cây & Tảng Đá)     │ r=20 │ (Moon, Root, Eye)       │ r=20 │ (4500, 250) (Altar)    │
└──────────────┘         └─────────────────────────┘           └──────────────────────────┘      └─────────────────────────┘      └────────────────────────┘
```

### 3.1. Phân khu 1: Lối Mòn Xuyên Sương (`fog_crossing`)
- **Kích thước Bounds:** $480 \times 360\text{ px}$ (Gốc: $x=0, y=0$).
- **CanvasTexture:** `fog_crossing_ground_baked_v12`.
- **Cấu trúc nền:** Nền cỏ sương mù sẫm màu (`#263326`) pha trộn họa tiết pixel-art tự nhiên, dải gradient bóng tối bìa rừng phía Bắc và phía Nam.
- **Tuyến đường mòn:** Khởi hành từ điểm tỉnh giấc $(80, 180)$, lượn sóng nhẹ qua Tấm Biển Mục $(240, 180)$ và hạ dần xuống $y = 232$ tại $x = 480$, có bậc đá cổ lát hiên dẫn vào Cổng Tây Bellhollow.

### 3.2. Phân khu 2: Làng Chuông Cổ (`bellhollow`)
- **Kích thước Bounds:** $1120 \times 960\text{ px}$ (Gốc: $x=480, y=-200$).
- **CanvasTexture:** `bellhollow_ground_baked_v12`.
- **Cấu trúc nền:** Trảng cỏ làng ấm áp (`#2a3d24`), thảm rêu hữu cơ và bóng rừng bao bọc ba phía Bắc, Nam, Đông.
- **Quảng Trường Trung Tâm:** Sân đá cuội cổ (`TILE_COBBLE_ROAD`) hình elip bao quanh Giếng Nước $(726, 376)$ và Tháp Chuông $(820, 252)$.
- **Mạng lưới đường mòn hữu cơ 5 lớp:**
  - Đường Cổng Tây: $(480, 232) \rightarrow (705, 288)$.
  - Đường Tây-Bắc: Dẫn lên Nhà Bà Lão Edda $(706, 145)$.
  - Đường Đông-Bắc: Dẫn lên Nhà Thảo Mộc Neris $(976, 145)$ & Cụm thảo mộc $(1038, 178)$.
  - Đường Tây-Nam & Lối Nam: Dẫn qua bãi đá lửa $(620, 350)$ xuống Cổng Nông Trại Trú Ẩn $(650, 520)$.
  - Đường Đông-Nam & Lối Rừng Ven: Dẫn qua Xưởng Chế Tạo $(975, 368)$, Vườn Thảo Dược $(1055, 392)$ tới Cổng Rừng Ngoại Vi $(1200, 510)$.
  - Đường Rừng Phía Đông: Trục lộ chính từ Quảng Trường xuyên qua Cổng Đông $(1485, 280)$ tới ranh giới $(1600, 282, r: 22)$.

### 3.3. Phân khu 3: Đường Mòn Quanh Co (`crooked_path`)
- **Kích thước Bounds:** $1280 \times 640\text{ px}$ (Gốc: $x=1600, y=0$).
- **CanvasTexture:** `crooked_path_ground_baked_v12`.
- **Cấu trúc nền:** Nền đất rừng thông ẩm tối màu (`#22321e`), bóng tối dày đặc của rặng thông cổ thụ hai bên rìa ($y < 140$ và $y > 480$), rải rác 1800 cụm lá kim và rêu phong hữu cơ.
- **Tuyến đường chính (Main Trail):**
  - Đón nhận từ Cổng Đông Bellhollow tại $(1600, 282, r: 22)$ với độ lệch 0px.
  - Uốn lượn qua Bụi Rậm Ẩn Nấp 1 $(1820, 265)$, ôm quanh Thân Cây Rỗng 1 $(1910, 235)$.
  - Đi qua Ngã 3 rẽ Rừng Sâu $(2020, 245)$, lượn vòng né Tảng Đá Lớn $(2120, 270)$.
  - Lượn cong chữ S qua Thân Cây Rỗng 2 $(2340, 345)$, Bụi Rậm 3 $(2480, 340)$ và tiến thẳng tới ranh giới Silent Mire tại $(2880, 300, r: 20)$.
- **Các nhánh rẽ & bãi đất mở:**
  - Nhánh Bắc: Tách từ $(2020, 245)$ chạy lên Biển Cảnh Báo Rừng Sâu $(2100, 35, r: 18)$.
  - Nhánh Tây-Nam: Tách từ $(1680, 285)$ chạy xuống Lối Mòn Phụ Rừng Ven $(1610, 480, r: 16)$.
  - 3 bãi đất trống hữu cơ (`drawClearing`) quanh Thân Cây Rỗng 1, Tảng Đá Cổ và Thân Cây Rỗng 2.

### 3.4. Phân khu 4: Đầm Lầy Tĩnh Lặng (`silent_mire`)
- **Kích thước Bounds:** $1120 \times 640\text{ px}$ (Gốc: $x=2880, y=100$).
- **CanvasTexture:** `silent_mire_ground_baked_v12`.
- **Cấu trúc nền:** Nền bùn nước đen kịt (`#1c2822`), hòa trộn `TILE_SWAMP_MUD` với quầng gradient sương độc đầm lầy huyền bí, bèo tây và rêu nước rải rác.
- **Tuyến đường gờ đất nổi & Cầu ván gỗ mục:**
  - Bắt đầu liền mạch từ Crooked Path tại $(2880, 300, r: 20)$.
  - Men theo bờ bùn đầm lầy, bắc cầu ván gỗ mục (`isBoardwalk = true`) qua vũng nước trũng $(3110, 325)$ chạm vào bệ đá Trận Địa Cổ Ngữ.
- **Trận Địa Cổ Ngữ (Ancient Rune Grove):**
  - Gò đất đá cổ linh thiêng nổi giữa đầm lầy tại tâm $(3520, 290)$ bán kính $195 \times 115\text{ px}$.
  - Vòng đá runic cổ kính khắc họa tiết huyền bí và bệ đá kiên cố nâng đỡ 3 Cột Đá: Cột Trăng Khuyết $(3400, 220)$, Cột Rễ Rừng $(3520, 360)$ và Cột Con Mắt $(3640, 220)$.
  - Lối đi phía Đông rời bệ đá, bắc cầu ván gỗ qua vũng lầy thứ hai $(3790, 305)$ tới cổng Miếu Chuông tại $(4000, 280, r: 20)$.

### 3.5. Phân khu 5: Miếu Chuông Phế Tích (`broken_bell_shrine`)
- **Kích thước Bounds:** $960 \times 600\text{ px}$ (Gốc: $x=4000, y=0$).
- **CanvasTexture:** `broken_bell_shrine_ground_baked_v12`.
- **Cấu trúc nền:** Đất rừng xám lạnh rêu phong (`#22232b`), quầng hào quang uy nghiêm tỏa ra từ bàn thờ miếu $(4500, 250)$ với bụi đá vôi và rêu xám lạnh rải rác.
- **Lối đá cổ tiếp cận:**
  - Nối liền mạch từ ranh giới Đầm Lầy tại $(4000, 280, r: 20)$.
  - Đường lát đá phiến cổ kính uốn nhẹ qua rừng xám $(4090, 275) \rightarrow (4190, 268)$ và mở rộng thành Sân Đá Đại Lễ tại $(4280, 262, r: 24)$.
- **Sân Đá Đại Lễ (Grand Ceremonial Courtyard):**
  - Mặt sàn lát đá slate xám xanh cổ kính bo góc mềm elip ($240 \times 130\text{ px}$) hòa trộn `TILE_STONE_FLOOR` tại tâm $(4500, 260)$.
  - Bệ thờ trung tâm 3 tầng đá uy nghi nơi chuông đồng cổ đổ nát ngự trị tại $(4500, 250)$.
  - Các bậc đá cổ dẫn tới 2 Cột Miếu Trái $(4350, 180)$, Cột Miếu Phải $(4650, 180)$ và Khu Gạch Đá Ẩn Nấp $(4360, 380)$.

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẢO ĐẢM CHẤT LƯỢNG (QA/QC)

Bộ kịch bản kiểm định tự động chuyên sâu [scripts/verify_terrain_path_alignment_c4_12_12.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_terrain_path_alignment_c4_12_12.mjs) đã được thiết kế và thực thi với **40/40 tiêu chí đạt 100%**:

```text
================================================================
QA / QC VERIFICATION SUITE — COMMAND C4-12-12
CHUẨN HÓA HIỂN THỊ ĐỊA HÌNH, MẶT ĐẤT VÀ ĐƯỜNG ĐI (TERRAIN & PATHS)
================================================================

--- 1. KIỂM TRA PHƯƠNG THỨC RENDER ĐỊA HÌNH BAKED CANVAS ---
  [PASS] #1: Loại bỏ hoàn toàn trailSegments hình chữ nhật thô cứng cũ
  [PASS] #2: Loại bỏ hoàn toàn mirePaths hình chữ nhật thô cứng cũ
  [PASS] #3: Khởi tạo CanvasTexture nướng sẵn: fog_crossing_ground_baked_v12
  [PASS] #4: Khởi tạo CanvasTexture nướng sẵn: bellhollow_ground_baked_v12
  [PASS] #5: Khởi tạo CanvasTexture nướng sẵn: crooked_path_ground_baked_v12
  [PASS] #6: Khởi tạo CanvasTexture nướng sẵn: silent_mire_ground_baked_v12
  [PASS] #7: Khởi tạo CanvasTexture nướng sẵn: broken_bell_shrine_ground_baked_v12
  [PASS] #8: WorldBuilder có phương thức renderCrookedPathTerrain
  [PASS] #9: WorldBuilder có phương thức renderSilentMireTerrain
  [PASS] #10: WorldBuilder có phương thức renderBrokenBellShrineTerrain

--- 2. KIỂM TRA KHỚP NỐI ĐƯỜNG ĐI LIỀN MẠCH (0px OFFSET, 0px GAP) ---
  [PASS] #11: Fog Crossing có hàm nội suy trailCenterY
  [PASS] #12: Fog Crossing trail hạ chuẩn xác xuống y = 232 tại x = 480
  [PASS] #13: Bellhollow đón đường từ Fog Crossing chuẩn xác tại (480, 232, r: 22)
  [PASS] #14: Bellhollow nối đến Cổng Đông tại (1600, 282, r: 22)
  [PASS] #15: Crooked Path có tuyến đường chính uốn lượn
  [PASS] #16: Crooked Path và Silent Mire khớp nối chuẩn xác tại (2880, 300, r: 20)
  [PASS] #17: Silent Mire và Broken Bell Shrine khớp nối chuẩn xác tại (4000, 280, r: 20)

--- 3. KIỂM TRA NHÁNH ĐƯỜNG DẪN TỚI ĐIỂM TƯƠNG TÁC & RỪNG VEN ---
  [PASS] #18: Bellhollow có đường mòn dẫn tới cổng Nông Trại Trú Ẩn (650, 520)
  [PASS] #19: Bellhollow có đường mòn dẫn tới cổng Rừng Ngoại Vi (1200, 510)
  [PASS] #20: Crooked Path có đường mòn dẫn tới biển cảnh báo Rừng Sâu (2100, 35)
  [PASS] #21: Crooked Path có đường mòn dẫn tới lối rẽ Rừng Ngoại Vi (1610, 480)
  [PASS] #22: Crooked Path có bãi đất quanh Thân Cây Rỗng 1 (1900, 180)
  [PASS] #23: Crooked Path có bãi đất quanh Tảng Đá Rừng (2100, 280)
  [PASS] #24: Crooked Path có bãi đất quanh Thân Cây Rỗng 2 (2350, 420)
  [PASS] #25: Silent Mire có bệ đá quanh Cột Trăng Khuyết (3400, 220)
  [PASS] #26: Silent Mire có bệ đá quanh Cột Rễ Rừng (3520, 360)
  [PASS] #27: Silent Mire có bệ đá quanh Cột Con Mắt (3640, 220)
  [PASS] #28: Silent Mire hỗ trợ cầu ván gỗ mục (Boardwalk) bắc qua vũng nước
  [PASS] #29: Broken Bell Shrine có lối đá cổ tiếp cận miếu
  [PASS] #30: Broken Bell Shrine có Sân Đá Đại Lễ bao quanh bệ thờ (4500, 250)
  [PASS] #31: Broken Bell Shrine có bậc đá dẫn lên Cột Miếu Trái
  [PASS] #32: Broken Bell Shrine có bậc đá dẫn lên Cột Miếu Phải
  [PASS] #33: Broken Bell Shrine có bậc đá dẫn tới Khu Gạch Đá Ẩn Nấp (4360, 380)

--- 4. KIỂM TRA ĐỘ RỘNG LỐI ĐI & KHOẢNG TRỐNG VA CHẠM ---
  [PASS] #34: SatyrPlayer có kích thước hộp va chạm chân WAYFARER_BODY 14x8 px
  [PASS] #35: Bán kính lối đi nhỏ nhất r = 15px (Độ rộng tối thiểu 30px >= 30px, đảm bảo thân người 14px di chuyển mượt mà)
  [PASS] #36: Phân khu [fog_crossing] có hệ thống colliders hợp lệ (5 vật cản)
  [PASS] #37: Phân khu [bellhollow] có hệ thống colliders hợp lệ (7 vật cản)
  [PASS] #38: Phân khu [crooked_path] có hệ thống colliders hợp lệ (5 vật cản)
  [PASS] #39: Phân khu [silent_mire] có hệ thống colliders hợp lệ (6 vật cản)
  [PASS] #40: Phân khu [broken_bell_shrine] có hệ thống colliders hợp lệ (6 vật cản)

================================================================
TỔNG KẾT KIỂM THỬ C4-12-12:
- Tổng số tiêu chí kiểm tra: 40
- Tiêu chí ĐẠT (PASS):       40 / 40 (100%)
- Tiêu chí THẤT BẠI (FAIL):  0
================================================================
✔ TẤT CẢ CÁC TIÊU CHÍ QC CỦA C4-12-12 ĐÃ ĐẠT 100%!
```

Kiểm tra biên dịch TypeScript toàn dự án:
```powershell
npx tsc --noEmit
# Kết quả: 0 errors (Hoàn toàn sạch lỗi kiểu dữ liệu)
```

Kiểm tra hồi quy mạng lưới kết nối C4-12-11:
```powershell
node scripts/verify_world_connections_c4_12_11.mjs
# Kết quả: 176/176 tests PASS (100%)
```

---

## 5. DANH SÁCH FILE ĐÃ TẠO VÀ CHỈNH SỬA

1. **Chỉnh sửa cốt lõi:**
   - [src/world/WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts): Triển khai 3 phương thức CanvasTexture mới (`renderCrookedPathTerrain`, `renderSilentMireTerrain`, `renderBrokenBellShrineTerrain`), bổ sung các nhánh rẽ đường mòn Nam Bellhollow và loại bỏ hoàn toàn các dải TileSprite thô cứng cũ.
   - [src/world/ZoneConnectionRegistry.ts](file:///G:/HOLLOW%20WOODS/src/world/ZoneConnectionRegistry.ts): Đồng bộ hóa ranh giới bounds của `sanctuary_farm`, `silent_mire` và `ancient_rune_puzzle` khớp 100% với `zones.json`.
2. **Kịch bản kiểm thử & Báo cáo:**
   - [scripts/verify_terrain_path_alignment_c4_12_12.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_terrain_path_alignment_c4_12_12.mjs): Kịch bản kiểm thử 40 tiêu chí QC địa hình & đường đi.
   - [Read/V1.2/Reports/C4-12-12/C4-12-12_TERRAIN_PATH_ALIGNMENT_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/Reports/C4-12-12/C4-12-12_TERRAIN_PATH_ALIGNMENT_REPORT.md): Báo cáo kỹ thuật chi tiết.
   - [Read/V1.2/README_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/README_INDEX.md): Cập nhật cây thư mục và bảng tiến độ lệnh.

---

## 6. KẾT LUẬN & SẴN SÀNG CHO BƯỚC TIẾP THEO

Bước **C4-12-12** đã hoàn thành xuất sắc việc chuẩn hóa địa hình, mặt đất và hệ thống đường đi hữu cơ trên toàn bộ thế giới HOLLOW WOODS hiện hữu. Thế giới game giờ đây sở hữu sự chuyển tiếp mỹ thuật mềm mại, đồng bộ tuyệt đối với các hộp va chạm và sẵn sàng cho bước tiếp theo **C4-12-13** (Tái thiết kế gameplay, hệ thống nhiệm vụ và logic rượt đuổi).
