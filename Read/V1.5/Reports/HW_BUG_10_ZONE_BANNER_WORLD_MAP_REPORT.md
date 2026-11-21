# BÁO CÁO NGHIỆM THU HOÀN TẤT HW-BUG-#10 — SỬA ZONE BANNER & WORLD MAP UI (BUG-028 / BUG-033)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#10` / `BUG-028` / `BUG-033` (Đặc tả `B04-13A-R6` & `B04-13D` — B04E1 UI/UX Menu & Map)  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (6/6 Test Cases PASS 100%)**  
**Bộ test tự động:** Playwright / Chromium SwiftShader (`scripts/test_hw_bug10_ui.py`)  
**Ảnh nghiệm thu:**
* Bảng Zone Banner Trước/Sau: [before_zone_banner_hud_overlap.png](Visuals/before_zone_banner_hud_overlap.png) · [after_zone_banner_hud_clean.png](Visuals/after_zone_banner_hud_clean.png)
* Bản đồ World Map Trước/Sau: [before_world_map_ui.png](Visuals/before_world_map_ui.png) · [after_world_map_ui_clean.png](Visuals/after_world_map_ui_clean.png)

---

## 1. MỤC TIÊU VÀ NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Nhiệm vụ `HW-BUG-#10` giải quyết 2 lỗi nghiêm trọng về bố cục giao diện người dùng theo đặc tả `B04-13A-R6` và `B04-13D`:

### 1.1. BUG-028: Zone Banner che HUD Đồng Hồ & Xung Đột Toast
- **Hiện tượng:**
  1. Khi người chơi bước qua phân khu mới (như `LÀNG BELLHOLLOW`, `NÔNG TRẠI TRÚ ẨN`, `LỐI MÒN XUYÊN SƯƠNG`), bảng Zone Banner xuất hiện ở đỉnh màn hình và đè trực tiếp lên Khung Đồng Hồ thời gian (`Ngày 1 — Mùa Sương Lạnh`, `☀️ BAN NGÀY`, `0:00 / 3:00`).
  2. Khi người chơi di chuyển qua ranh giới làng và nhận thông báo safe-zone, cả Zone Banner lẫn Toast Popup cùng xuất hiện đè lên nhau.
  3. Khi đứng sát ranh giới giữa 2 zone và lắc lư nhẹ, 2 banner liên tục chớp tắt đè nhau.
- **Nguyên nhân gốc rễ:**
  1. Trong `src/scenes/UIScene.ts`, `zoneBannerContainer` được đặt tại tọa độ cố định `(640, 80)`. Với chiều cao $H=58\text{px}$, banner trải dài từ $Y=51$ đến $Y=109$, và chiều rộng $W=420\text{px} \rightarrow 600\text{px}$ trải dài sang mép phải $X=850 \rightarrow 940$. Trong khi đó, Khung Đồng Hồ (TimeBox) được đặt tại $X \in [668, 912]$ và $Y \in [16, 94]$. Vùng giao thoa $X \in [668, 850], Y \in [51, 94]$ khiến banner đè trực tiếp lên hơn một nửa khung đồng hồ!
  2. Popup Toast (`showPopupMessage`) được đặt tại $Y=175$ trôi lên $165 \rightarrow 145$, nằm sát đáy banner $Y=109$, gây cảm giác chữ chen chúc rối mắt.
  3. Hàm `showZoneBanner()` chỉ kiểm tra cooldown khi tiêu đề zone trùng nhau:
     ```typescript
     if (!force && now - this.lastBannerShownTime < 4000 && this.lastBannerZoneTitle === atmosphere.titleVietnamese)
     ```
     Khi người chơi đứng ở ranh giới 2 zone khác nhau (ví dụ Bellhollow vs Farm), điều kiện so sánh tiêu đề bị sai, dẫn tới việc cooldown bị vô hiệu hóa, banner mới bắn ra lập tức cắt ngang banner cũ.

### 1.2. BUG-033: World Map UI Bị Tràn Khung, Chồng Nhãn & Cắt Lề Trái
- **Hiện tượng:**
  1. Mép bên trái bản đồ bị cắt cụt: node `Vực Thẳm Hư Không` (`abyssal_chasm`) bị tràn hẳn ra ngoài lề trái của tấm giấy da (Parchment Board).
  2. Huy hiệu con trỏ `📍 BẠN ĐANG Ở ĐÂY` bị vẽ đè trực tiếp lên dòng chữ `Làng Bellhollow` và phụ đề bên trong node Bellhollow.
  3. Khung Phong Ấn Cầu Cây (`🔒 PHONG ẤN RỄ CỔ`) bị vẽ đè lên mép phải của node `Đầm Lầy Sương Mù` (`silent_mire`).
- **Nguyên nhân gốc rễ:**
  1. Khung giấy da cổ (`parchmentBg`) có kích thước $980 \times 600$, đặt tại $px=150, py=60$, mép trái là $X=150$. Trong khi node `abyssal_chasm` được cấu hình tại $canvasX = 90$! $X=90 < 150$ khiến node bị lọt ra ngoài nền giấy da tới $60\text{px}$.
  2. Con trỏ định vị người chơi được tính từ tâm node ($pt.x, pt.y$) rồi vẽ tại $pt.y - 28 = node.canvasY + 45 - 28 = node.canvasY + 17$, trùng khớp với cao độ của tên phân khu ($Y+8$) và phụ đề ($Y+25$), khiến chữ đè chữ.
  3. Node `silent_mire` nằm từ $X=685 \rightarrow 815$. Node `broken_bell_shrine` nằm tại $X=860$. Khoảng trống giữa 2 node chỉ có $45\text{px}$, trong khi khung phong ấn cầu cây cũ có kích thước $W=120\text{px}$, đặt tại $X=790$, đè trực tiếp lên $X \in [730, 820]$ của `silent_mire`!

---

## 2. GIẢI PHÁP KỸ THUẬT VÀ HIỆN THỰC

### 2.1. Tái Cấu Trúc Bố Cục Zone Banner & Toast (`src/scenes/UIScene.ts`) — Khắc Phục BUG-028
1. **Dời tọa độ `zoneBannerContainer` xuống $Y = 138$:**
   * Chiều cao banner $H = 54\text{px}$, vùng bao phủ trục Y: $Y \in [111, 165]$.
   * Khung Đồng Hồ kết thúc tại $Y = 94$. Khoảng cách an toàn giữa đáy Đồng Hồ và đỉnh Zone Banner là **$17\text{px}$** ($111 - 94 = 17\text{px} > 0$).
   * Mép phải Quest Tracker bắt đầu từ $X = 920$, hoàn toàn tách biệt khỏi banner ($X \in [430, 850]$).
   * Quickbar dưới đáy màn hình đặt tại $Y = 688$, cách xa banner hơn $520\text{px}$.
2. **Dời tọa độ Toast `showPopupMessage` xuống $Y = 205$ trôi nhẹ lên $Y = 195 \rightarrow 185$:**
   * Vùng bao phủ của Toast: $Y \in [185, 215]$.
   * Khoảng cách giữa đáy Zone Banner ($Y=165$) và đỉnh Toast ($Y=185$) đạt **$20\text{px} \rightarrow 40\text{px}$**.
   * Khi cả Zone Banner và Popup Toast xuất hiện cùng lúc, cả hai đều hiển thị rõ ràng, trang trọng, không hề đè nhau và không che HUD đồng hồ!
3. **Cơ chế Global Cooldown & Queue chống nhấp nháy banner khi đứng sát ranh giới:**
   * Áp dụng Global Cooldown $3500\text{ms}$ giữa 2 lần hiển thị banner bất kỳ.
   * Nếu người chơi đổi zone liên tục tại ranh giới trong khoảng thời gian $< 3500\text{ms}$, hệ thống kích hoạt `pendingBannerTimer`, hoãn hiển thị cho đến khi người chơi dừng ổn định ở phân khu mới, loại bỏ 100% hiện tượng chớp tắt lặp lại.
4. **Dọn dẹp Tween an toàn (`shutdown`):**
   * Lưu tham chiếu `zoneBannerTween` và `pendingBannerTimer`. Trong `UIScene.shutdown()`, gọi `stop()` và `remove()` tường minh, ngăn chặn rò rỉ bộ nhớ hoặc lỗi gọi tween trên container đã bị hủy.

### 2.2. Tái Thiết Kế Sơ Đồ World Map [N] (`src/ui/ParchmentWorldMapModal.ts`) — Khắc Phục BUG-033
1. **Khắc phục triệt để tràn/cắt lề trái:**
   * Dời node `abyssal_chasm` từ $canvasX = 90$ sang $canvasX = 185$ ($canvasY = 285, W=120, H=75$).
   * Tọa độ $X=185 > 150$ giúp node nằm hoàn toàn bên trong tấm giấy da, cách lề trái an toàn $35\text{px}$.
2. **Chuẩn hóa tọa độ toàn bộ 10 nodes theo topology thật:**
   * Cả 10 node nằm trọn vẹn trong vùng $X \in [185, 1065]$ và $Y \in [165, 495]$, cách lề panel giấy da ($980 \times 600$) tối thiểu $35\text{px}$.
   * Kết nối mạng lưới dựa trên `ZoneConnectionRegistry.getRuntimeExits()`, không có node nào bị lệch hay đứt gãy.
3. **Tách biệt hoàn toàn Chốt Chặn Phong Ấn Cầu Cây:**
   * Đặt tâm chốt chặn tại $bridgeX = 875, bridgeY = 405$, kích thước khung $W=96\text{px}, H=32\text{px}$.
   * Nằm trọn vẹn trong khoảng trống $120\text{px}$ giữa mép phải `silent_mire` ($X=815$) và mép trái `broken_bell_shrine` ($X=935$).
   * Khoảng cách an toàn tới `silent_mire` là **$12\text{px}$** ($827 - 815 = 12$) và tới `broken_bell_shrine` là **$12\text{px}$** ($935 - 923 = 12$). Tuyệt đối không đè lên node!
4. **Tách biệt Con trỏ vị trí ("📍 BẠN ĐANG Ở ĐÂY") và Mục tiêu ("🎯 MỤC TIÊU"):**
   * **Vị trí người chơi:** Đặt tại **ĐỈNH PHÍA TRÊN** của node hiện tại: $X = node.canvasX + node.width / 2, Y = node.canvasY - 14$ (origin 0.5, 0.5), kèm điểm ghim ngọc vàng $\varnothing=4.5\text{px}$ có viền trắng ghim vào mép đỉnh node.
   * **Mục tiêu nhiệm vụ:** Đặt tại **ĐÁY PHÍA DƯỚI** của node mục tiêu: $X = node.canvasX + node.width / 2, Y = node.canvasY + node.height + 13$ (origin 0.5, 0.5).
   * **Nội dung node:** Tên vùng ($Y+8$), phụ đề ($Y+25$), địa danh landmarks ($Y+41$) nằm trọn vẹn ở giữa, **100% không bị bất cứ thứ gì đè lên**.
5. **Bảo toàn cơ chế game:**
   * Giữ số lượng khai mở đếm theo `PlayerState.getVisitedZones()` (đếm thật $4/10$, không hardcode).
   * Vùng chưa khám phá giữ hoa văn sương mực và icon `🌫️ Chưa Khám Phá`, không làm lộ tên vùng bí mật `abyssal_chasm`.
   * Tuyệt đối không thêm mini-map, không cho phép map teleport.

---

## 3. BẢNG ĐO ĐẠC HÌNH HỌC VÀ KHOẢNG CÁCH KHÔNG GIAN (GEOMETRIC NON-OVERLAP METRICS)

| Thành phần UI | Tọa độ cũ (Lỗi Overlap) | Tọa độ mới (Chuẩn hóa) | Bounding Box mới | Khoảng cách an toàn tới thành phần lân cận | Kết quả nghiệm thu |
|---|---|---|---|---|---|
| **Zone Banner** | Tâm `(640, 80)`, $Y \in [51, 109]$ | **Tâm `(640, 138)`**, $Y \in [111, 165]$ | $X \in [430, 850], Y \in [111, 165]$ | **$+17\text{px}$** so với đáy Đồng Hồ ($Y=94$); **$+40\text{px}$** so với Toast | ✅ **KHÔNG ĐÈ ĐỒNG HỒ, KHÔNG ĐÈ QUEST** |
| **Popup Toast** | Xuất phát $Y=175 \rightarrow 145$ | **Xuất phát $Y=205 \rightarrow 185$** | $X \in [470, 810], Y \in [185, 215]$ | **$+20\text{px}$** so với đáy Zone Banner | ✅ **KHÔNG ĐÈ ZONE BANNER** |
| **Node Abyssal Chasm** | $canvasX = 90$ (ngoài panel $150$) | **$canvasX = 185$** | $X \in [185, 300], Y \in [285, 360]$ | **$+35\text{px}$** so với lề trái panel ($X=150$) | ✅ **NẰM TRỌN TRONG PANEL, KHÔNG CẮT LỀ** |
| **Nhãn "BẠN ĐANG Ở ĐÂY"** | $Y = 297$ (đè giữa Bellhollow) | **Đỉnh trên $Y = 266$** | $X \in [502, 622], Y \in [259, 273]$ | **$+15\text{px}$** so với đỉnh tên Bellhollow ($Y=288$) | ✅ **KHÔNG ĐÈ CHỮ BELLHOLLOW** |
| **Phong Ấn Cầu Cây** | Tâm $X=790$ (đè lên Đầm Lầy) | **Tâm $X=875, Y=405$** | $X \in [827, 923], Y \in [389, 421]$ | **$+12\text{px}$** tới Đầm Lầy; **$+12\text{px}$** tới Miếu Chuông | ✅ **NẰM CHÍNH GIỮA, KHÔNG ĐÈ NODE** |

---

## 4. KẾT QUẢ BỘ KIỂM THỬ PLAYWRIGHT (6/6 PASS 100%)

Tệp test: [scripts/test_hw_bug10_ui.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug10_ui.py)  
Lệnh thực thi: `python scripts/test_hw_bug10_ui.py`

```
[Server] Serving dist at http://127.0.0.1:5260
[Playwright] Navigating to game...
[Playwright] Starting new game...
[Test Suite] Running HW-BUG-10 Zone Banner & World Map Verification...
[Test 1 Banner Layout] result: {"bannerY": 138, "bannerTop": 111, "bannerBottom": 165, "clockBottom": 94, "toastY": 205, "gapClockToBanner": 17, "gapBannerToToast": 40, "overlapsClock": false, "overlapsToast": false}
Captured after_zone_banner_hud_clean.png
[Test 2 Banner Debounce] result: {"hasPendingTimer": true, "activeTitle": "LÀNG BELLHOLLOW"}
[Test 3 Map Nodes] allInPanel: True
[Test 4 Beacon Non-Overlap] result: {"bellCanvasY": 280, "beaconLabelY": 266, "beaconLabelBottom": 273, "bellTitleY": 288, "gap": 15, "overlaps": false}
[Test 5 Bridge Non-Overlap] result: {"mireRight": 815, "shrineLeft": 935, "bridgeLeft": 827, "bridgeRight": 923, "gapToMire": 12, "gapToShrine": 12, "overlapsMire": false, "overlapsShrine": false}
Captured after_world_map_ui_clean.png
[Test 6 Responsive] 1280x720 passed [N] open and [ESC] close!
[Test 6 Responsive] 1600x900 passed [N] open and [ESC] close!
[Test 6 Responsive] 1920x1080 passed [N] open and [ESC] close!

[ALL TESTS PASSED] HW-BUG-10 verification completed successfully!
```

---

## 5. HƯỚNG DẪN NGHIỆM THU DÀNH CHO TESTER

1. **Kiểm tra Zone Banner & Toast (BUG-028):**
   * Di chuyển giữa Làng Bellhollow và Nông Trại Trú Ẩn hoặc Lối Mòn Xuyên Sương.
   * Quan sát banner phân khu: hiển thị ở vị trí $Y=138$, Khung Đồng Hồ phía trên góc phải ($X:668 \rightarrow 912, Y:16 \rightarrow 94$) hoàn toàn sáng rõ, không bị che khuất.
   * Quan sát thông báo Toast (ví dụ khi ăn nấm hoặc nhận cảnh báo): xuất hiện ở $Y=205 \rightarrow 185$, cách đáy banner $20\text{px} \rightarrow 40\text{px}$, không bị đè chữ.
   * Đi qua đi lại mép ranh giới liên tục: banner không bị nhấp nháy chớp tắt hay đè chồng lên nhau.
2. **Kiểm tra World Map UI (BUG-033):**
   * Bấm phím **[N]** để mở Bản Đồ Giấy Da:
     - Node `Vực Thẳm Hư Không` ở cực Tây nằm trọn vẹn trong nền giấy da, không bị cắt lề trái.
     - Node `Làng Bellhollow` ở giữa: nhãn `📍 BẠN ĐANG Ở ĐÂY` nằm ở đỉnh trên, tên làng và danh sách địa danh hiển thị rõ ràng 100%, không bị đè.
     - Khung `🔒 PHONG ẤN RỄ` nằm chính giữa cầu nối Đầm Lầy và Miếu Chuông, không đè lên bất kỳ node nào.
   * Thử mở/đóng bằng phím **[N]**, phím **[ESC]**, hoặc click nút **[✖ ESC]** ở góc trên bên phải.
   * Thử nghiệm trên các độ phân giải khác nhau ($1280 \times 720$, $1600 \times 900$, $1920 \times 1080$).

---

## 6. DANH MỤC TỆP ĐÃ SỬA ĐỔI

1. [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts) — Dời Zone Banner xuống $Y=138$, Toast xuống $Y=205$, bổ sung Global Cooldown 3.5s và queue chống nháy, dọn dẹp tween trong shutdown.
2. [ParchmentWorldMapModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/ParchmentWorldMapModal.ts) — Tái thiết kế tọa độ 10 node, đưa `abyssal_chasm` vào trong panel ($X=185$), tách nhãn định vị lên đỉnh node ($Y-14$), nhãn mục tiêu xuống đáy node ($Y+H+13$), căn chỉnh phong ấn cầu cây giữa 2 node ($X=875$).
3. [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md) — Cập nhật riêng biệt `BUG-028` và `BUG-033` sang `CLOSED-VERIFIED local`.
4. [test_hw_bug10_ui.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug10_ui.py) — Bộ kiểm thử tự động Playwright 6 bài test toàn diện.
5. [HW_BUG_10_TEST_RESULTS.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_10_TEST_RESULTS.json) — Dữ liệu kết quả đo đạc JSON từ Playwright test suite.
6. [HW_BUG_10_ZONE_BANNER_WORLD_MAP_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_10_ZONE_BANNER_WORLD_MAP_REPORT.md) — Báo cáo nghiệm thu kỹ thuật chi tiết.
7. Thư mục ảnh Before/After trong `Read/V1.5/Reports/Visuals/`:
   * `before_zone_banner_hud_overlap.png` / `after_zone_banner_hud_clean.png`
   * `before_world_map_ui.png` / `after_world_map_ui_clean.png`
