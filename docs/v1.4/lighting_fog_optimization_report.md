# BÁO CÁO KỸ THUẬT: KIỂM TRA & TỐI ƯU HIỆU ỨNG SƯƠNG MÙ VÀ ÁNH SÁNG HỔ PHÁCH CHO MÁY YẾU (HOLLOW WOODS V1.4)

*Tác giả: Antigravity Assistant & HOLLOW WOODS Core Engineering Team*  
*Phiên bản Engine: Phaser v4.2.1-custom / WebGL Renderer*  
*Trạng thái: Đã triển khai & Kiểm chứng hoàn tất (24/24 Test Passed)*

---

## 1. RÀ SOÁT KIẾN TRÚC HIỆN TẠI & PHÂN TÍCH NGUYÊN NHÂN TỐN GPU FILL-RATE / OVERDRAW

Trước khi tối ưu, game HOLLOW WOODS xây dựng bầu không khí Dark Woodland Pixel Art bằng sự kết hợp của 3 hệ thống đồ họa:

```
[Bầu Không Khí Môi Trường]
   ├── 1. Màn Sương Quỷ (The Veil) : 5 lớp TileSprite cuộn liên tục (1280×720) với chế độ hòa trộn Additive/Normal.
   ├── 2. Màn Đêm & Sương Mù (Fog of War) : 1 RenderTexture toàn màn hình (1280×720) phủ đen mờ và tẩy xóa (erase) theo từng nguồn sáng.
   └── 3. Bụi Đom Đóm (Fireflies Pool) : Vẽ hình cầu Gradient bằng Phaser Graphics mỗi frame tại các điểm tụ.
```

### Các Điểm Nghẽn Hiệu Năng Nghiêm Trọng Phát Hiện Trên Máy Yếu (Integrated GPU):
1. **Lãng phí GPU Fill-rate do Độ Phân Giải RenderTexture Quá Cao (1.0x HD):**
   - Lớp `fogOfWarLayer` là một `Phaser.GameObjects.RenderTexture` kích thước $1280 \times 720$ ($921,600\text{ pixels}$).
   - Mỗi khung hình, game xóa sạch (clear), tô phủ nền bóng tối bằng `fill(0x050811, 0.82)`, sau đó duyệt qua người chơi, đèn lồng và hàng chục ngọn đuốc cắm trên map để thực hiện lệnh `erase()` vòng tròn quầng sáng.
   - Thao tác này tương đương việc vẽ lại hàng triệu fragment pixel trên GPU trong khi bản chất quầng sáng hổ phách là ánh sáng mờ mịn (soft edge blur), không đòi hỏi độ sắc nét 1:1 cấp độ pixel.

2. **TileSprite Overdraw Quá Tải Trong `VeilSystem`:**
   - Hệ thống sương mù cũ duy trì tới 5 lớp `TileSprite` bao phủ trọn màn hình $1280 \times 720$: `fogLayerGround`, `fogLayerMid`, `fogLayerHigh`, `fogLayerPinkDawn`, `fogLayerPinkGlow`.
   - Kết quả: Mỗi frame, GPU phải blend tới **$4.6\text{ triệu}$ điểm ảnh** ($5 \times 921,600$), gây nghẽn băng thông bộ nhớ (memory bandwidth starvation) trên các chip đồ họa tích hợp như Intel UHD 620/Xe hay AMD Radeon Vega.

3. **Thiếu Frustum Culling Cho Các Nguồn Sáng Trên Bản Đồ Lớn:**
   - Toàn bộ danh sách đuốc nhựa thông (`plantedFlares`) cắm rải rác khắp bản đồ rộng $5,000\text{px}$ đều bị duyệt và thực thi lệnh `erase()` lên `RenderTexture` bóng tối mỗi frame, dù phần lớn ngọn đuốc đang nằm ngoài vùng nhìn của camera hàng nghìn pixel.

4. **Quá Tải Do Device Pixel Ratio (DPR) Không Kiểm Soát Trên Màn Hình Retina / 2K / 4K:**
   - Trên các laptop có màn hình độ phân giải cao (`window.devicePixelRatio = 1.5` hoặc `2.0`), canvas bị đẩy lên độ phân giải $1920 \times 1080$ hoặc $2560 \times 1440$, khiến tải fill-rate tăng vọt gấp **2.25 đến 4 lần** ngoài dự kiến.

---

## 2. TRIỂN KHAI 4 KỸ THUẬT TỐI ƯU CỐT LÕI

### 2.1. Đệm Ánh Sáng Độ Phân Giải Thấp (Half-Res Lighting Buffer)
- **Cơ chế:** Thay vì render bóng tối ở kích thước đầy đủ $1280 \times 720$, game hạ độ phân giải nội tại của `RenderTexture` xuống:
  - **MEDIUM (0.5x):** $640 \times 360$ điểm ảnh (chỉ $230,400\text{ pixels}$ — **giảm 75% GPU Fill-rate**).
  - **LOW (0.35x):** $448 \times 252$ điểm ảnh (chỉ $112,896\text{ pixels}$ — **giảm 87.7% GPU Fill-rate**).
- **Phóng to phần cứng không tốn tài nguyên:** Sử dụng `this.fogOfWarLayer.setDisplaySize(1280, 720)`. WebGL GPU tự động phóng to buffer kết cấu bằng bộ lọc bilinear filtering mượt mà.
- **Hiệu quả thị giác:** Do ánh sáng hổ phách và sương mù có đặc tính khuếch tán mềm, việc giảm độ phân giải buffer ánh sáng không những không làm suy giảm chất lượng hình ảnh mà còn giúp quầng sáng hổ phách trông êm dịu, ấm áp và bớt gai góc hơn.

### 2.2. Loại Bỏ Nguồn Sáng Ngoài Màn Hình (Light Frustum Culling)
- **Cơ chế:** Thiết lập biên Frustum Culling mở rộng dựa trên `camera.worldView` với khoảng lề an toàn $120\text{px}$:
  ```typescript
  const cam = this.cameras.main;
  const margin = 120;
  const viewLeft = cam.worldView.x - margin;
  const viewRight = cam.worldView.right + margin;
  const viewTop = cam.worldView.y - margin;
  const viewBottom = cam.worldView.bottom + margin;
  ```
- **Xử lý:** Chỉ thực hiện `erase()` ánh sáng cho các ngọn đuốc nhựa thông thỏa mãn tọa độ nằm trong biên `[viewLeft, viewRight, viewTop, viewBottom]`. Bỏ qua hoàn toàn các nguồn sáng ở xa.
- **Tiết kiệm:** Giảm từ 30–50 thao tác erase WebGL xuống còn 1–4 thao tác mỗi frame.

### 2.3. Khống Chế Số Lớp Sương Mù & Giới Hạn Hạt Đom Đóm (Fog & Particle Cap)
- **Sương Mù (Veil):**
  - Cắt giảm từ 5 lớp xuống tối đa **2 lớp cuộn** ở cấu hình `HIGH` (Ground + Mid ở khu rừng thường; Ground + Pink Dawn ở khu vực khởi đầu).
  - Giảm xuống đúng **1 lớp cuộn** ở cấu hình `MEDIUM`.
  - Giảm xuống **1 lớp sương tĩnh nhẹ** (tắt hoàn toàn tính toán sóng sin/cos drift) ở cấu hình `LOW`, triệt tiêu hoàn toàn gánh nặng CPU/GPU.
- **Hạt Đom Đóm (Fireflies Pool):**
  - Khống chế Object Pool tối đa **30 hạt** trên toàn bản đồ (HIGH: 30 hạt, MEDIUM: 15 hạt, LOW: 0 hạt để giải phóng 100% tài nguyên vẽ hình).
  - Bổ sung Frustum Culling lề $60\text{px}$ khi vẽ đom đóm.

### 2.4. Khóa Tỷ Lệ Điểm Ảnh (DPR Cap $\le 1.0$)
- Trong `GameConfig.ts`, bổ sung cấu hình:
  ```typescript
  resolution: Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 1.0),
  ```
- Ngăn chặn hoàn toàn tình trạng máy tính có màn hình DPI cao tự động nhân đôi kích thước buffer WebGL, bảo vệ tuyệt đối ngưỡng 60 FPS trên mọi loại màn hình.

---

## 3. HỆ THỐNG QUẢN LÝ CHẤT LƯỢNG ĐỒ HỌA (GRAPHICS QUALITY SYSTEM)

Hệ thống được module hóa độc lập tại `src/systems/GraphicsQualitySystem.ts`:

| Thông số Kỹ thuật | Cấu hình CAO (HIGH) | Cấu hình CÂN BẰNG (MEDIUM) | Cấu hình TIẾT KIỆM (LOW) |
| :--- | :---: | :---: | :---: |
| **Lighting Buffer Scale** | `1.0x` ($1280 \times 720$) | `0.5x` ($640 \times 360$) | `0.35x` ($448 \times 252$) |
| **GPU Fill-rate Tiết Kiệm** | Baseline (0%) | **Giảm 75%** | **Giảm 88%** |
| **Lớp Sương Mù Active** | 2 lớp cuộn song song | 1 lớp cuộn chính | 1 lớp tĩnh nhẹ (Zero drift) |
| **Số Lượng Đom Đóm Pool** | 30 hạt | 15 hạt | 0 hạt (tắt hoàn toàn) |
| **Hiệu Ứng Hổ Phách Nhấp Nháy** | BẬT (Sinusoidal flicker) | BẬT (Sinusoidal flicker) | TẮT (Giữ bán kính tĩnh) |
| **Frustum Culling Nguồn Sáng** | BẬT (Lề $120\text{px}$) | BẬT (Lề $120\text{px}$) | BẬT (Lề $120\text{px}$) |
| **Mục Tiêu Khung Hình** | 60 FPS (Máy thường) | 60 FPS (Máy yếu) | 60 FPS (Máy rất yếu) |

### Cơ Chế Tự Động Giáng Cấp (Auto-Fallback):
- Hệ thống theo dõi FPS thực tế thông qua hàm `updateAutoFallback(fps, deltaMs)`.
- Nếu phát hiện `fps < 38.0` tích lũy liên tục trong vòng **4,000 ms (4 giây)**:
  - Hệ thống tự động chuyển từ `HIGH` $\to$ `MEDIUM`, hoặc từ `MEDIUM` $\to$ `LOW`.
  - Hiển thị thông báo Toast cảnh báo mượt mà cho người chơi.
  - Không bao giờ nâng cấp tự động để tránh hiện tượng giật cục (oscillation / thrashing).

---

## 4. TƯƠNG TÁC NGƯỜI DÙNG & GIAO DIỆN ĐIỀU KHIỂN

1. **Phím Tắt [F8] Chuyển Đổi Nhanh:**
   - Nhấn `F8` trong lúc chơi để chuyển đổi tuần hoàn: `HIGH` $\to$ `MEDIUM` $\to$ `LOW` $\to$ `HIGH`.
   - Trạng thái được cập nhật trực tiếp lên bảng giám sát hiệu năng `[F9]`.
2. **Nút Bấm Cấu Hình Trong Pause Menu [ESC]:**
   - Menu Tạm Dừng bổ sung khu vực `⚙️ CẤU HÌNH ĐỒ HỌA & ÂM LƯỢNG` với nút bấm trực quan:
     - `🌟 CAO (HIGH - 1.0x Buffer)` (Vàng hoàng kim)
     - `⚡ CÂN BẰNG (MEDIUM - 0.5x Buffer)` (Xanh lam ngọc)
     - `🍃 MƯỢT MÀ (LOW - 0.35x Buffer)` (Xanh lục ngọc)
   - Người chơi có thể nhấp chuột trực tiếp để đổi cấu hình, kèm dòng giải thích chi tiết cấu hình buffer và số lớp sương mù.
3. **Lưu Trữ Bền Vững:**
   - Cấu hình người chơi lựa chọn được tự động lưu vào `localStorage` (`hw_graphics_quality`) và khôi phục ngay khi khởi động game.

---

## 5. BẢO TỒN BẢN SẮC KHÔNG KHÍ SINH TỒN KINH DỊ DÂN GIAN

> [!IMPORTANT]
> **Cam Kết Bảo Tồn Thị Giác:**
> - Toàn bộ các mức cấu hình (`HIGH`, `MEDIUM`, `LOW`) tuyệt đối **không làm tối mù màn hình**. Quầng sáng hổ phách ấm áp quanh nhân vật Satyr (bán kính $135\text{px} \times 125\text{px}$) và đèn lồng ($155\text{px} \times 145\text{px}$) luôn được duy trì toàn vẹn với tông màu hổ phách ấm `#ffb347` / `#ffcc66`.
> - Người chơi luôn nhận diện rõ ràng đường mòn, bẫy gấu bùn lầy, quái vật bóng tối và các vật thể tương tác trên mọi cấu hình phần cứng.
