# 🌲 HOLLOW WOODS V1.5 – THE FOG THAT REMEMBERS (Màn Sương Vọng Ký Ức)

> **Tập 1: The First Toll (Tiếng Chuông Đầu Tiên) — Bản Phát Hành Chính Thức V1.5 Production**  
> **Thể loại:** 2D Atmospheric Psychological Survival Horror (Kinh Dị Sinh Tồn Tâm Lý & Giải Đố)  
> **Độ phân giải:** Native Canvas HD 1280×720 | World Camera Zoom 2.2× | Target 60 FPS  
> **Kho lưu trữ GitHub:** [https://github.com/KyoshiroKyo/HOLLOW-WOODS](https://github.com/KyoshiroKyo/HOLLOW-WOODS)  

---

## 🌟 Điểm Nhấn Đột Phá Trên Phiên Bản V1.5

1. **Hiệp Sĩ The Mossbound Wayfarer & Cơ Chế Vòng Sáng Hộ Tâm [F]:**
   - Chuyển đổi nhân vật chính sang hình tượng Hiệp Sĩ 4 hướng với chuyển động bước chân mượt mà, chém kiếm cận chiến dứt khoát và công nghệ **Tangent Corner Slide 45°** chống kẹt góc tuyệt đối.
   - Bỏ đèn lồng cầm tay, thay bằng **Vòng Sáng Hộ Tâm [F]** tỏa ra từ chính linh hồn: tiêu tốn 10 Thể Lực khi bật, rút nhẹ 1.2 Thể Lực/giây để duy trì.
   - **Nghịch lý ánh sáng [F] (Quy Tắc Máu số 2):** Khi bật sáng bảo vệ Tinh Thần, bán kính phát hiện của quái vật bóng tối tăng thêm $+30\%$; khi tắt sáng, bóng tối gặm nhấm Tinh Thần buộc người chơi phải bật/tắt luân phiên đầy chiến thuật.

2. **Chiều Sâu Kinh Dị Tâm Lý & Nhận Thức Bị Bóp Méo:**
   - **Ảo giác thính giác & Bóng lướt rìa (< 55/100 Tinh Thần):** Tiếng bước chân giả sau lưng, tiếng thì thầm rùng rợn và vệt bóng ma lướt qua rìa màn hình sương.
   - **Bóng Ma Hiệp Sĩ Sa Ngã (< 30/100 Tinh Thần):** Ảo ảnh hiệp sĩ cổ xưa đứng u uất trong sương mù, tan biến thành khói đen khi bị rọi sáng hoặc chém trúng.
   - **Bẫy "Tiếng Gọi Trong Sương" (Quy Tắc Máu số 1):** Đốm sáng lập lòe mồi nhử kêu gọi lữ khách rời đường mòn; tương tác sẽ làm giật tối màn hình, trừ 15 Tinh Thần và kéo quái vật ùa tới.
   - **Nhịp tim Web Audio động (75..135 BPM) & Viền Ám Ảnh (Horror Vignette):** Âm thanh nhịp tim *lub-dub* dồn dập, tự động hạ nhỏ nhạc nền BGM và 4 góc màn hình co bóp theo mức độ hoảng loạn.

3. **Cốt Truyện Phi Tuyến Tính 7 Chặng & Màn Hình Kết Thúc Đa Phân Nhánh:**
   - Mạch nhiệm vụ chính tái cấu trúc theo chuỗi 7 chặng liên hoàn: $A \to E \to B \to D \to F \to E \to C$. Người chơi khám phá Xưởng Chuông Bỏ Hoang, Quảng Trường Cổ Ngữ, gặp gỡ Kỵ Sĩ Trầm Mặc Sir Vaelen tại Trạm Lửa để đúc Chìa Khóa Thanh Tẩy, mở Phong Ấn Rễ Cổ tại Đầm Lầy Tĩnh Lặng và hạ cầu cây vượt vực.
   - **Màn Hình Kết Thúc An Toàn:** Cơ chế fadeOut -> resetFX -> fadeIn chống triệt để lỗi kẹt màn hình đen, bộ đếm an toàn Fail-safe 1.5s, phân nhánh 3 kết thúc (True Ending Bình Minh, Sacrifice Ending, Bad Ending Vòng Lặp) kèm bảng thống kê hành trình sinh tồn.

4. **Đại Tu Giao Diện Người Dùng Phong Cách Don't Starve Together:**
   - Thanh Hotbar đáy 8 ô túi đồ + 4 ô Trang Bị cá nhân (`BODY`, `FEET`, `BACK`, `CHARM`) nền giấy da sáng ấm nẹp khung gỗ tối.
   - Thanh Ghim Nhanh Dọc (QuickCraftSidebar) bên trái với mũi tên chạm khắc nối liền (Connecting Bracket Pointer) và ô nguyên liệu đỏ sẫm khi thiếu.
   - Bảng Chế Tạo 2 tầng mở rộng [I/C] chuẩn DST: tai sách Bookmark Tabs mép phải, hộp tìm kiếm giấy da, thanh cuộn hình thoi và khung xem trước cổ điển.

5. **Đồ Họa Pixel Art Thật 100% & Bố Cục Thông Thoáng:**
   - Xóa bỏ 100% cây vẽ bằng code hình học; thay thế bằng Sprite Pixel Art chính thức từ Updated-Trees và TopDown Fantasy Forest.
   - Quy hoạch mặt tiền Làng Bellhollow thoáng đãng, dọn sạch cây che lò rèn Bram và nhà dân; thông suốt tim đường mòn Lối Mòn Xuyên Sương (Fog Crossing).

---

## 🛠️ Công Nghệ & Nền Tảng Kỹ Thuật

- **Game Engine:** Phaser 4.2.1 / 3.80+ (Arcade Physics Engine with Corner-Slide Assist)
- **Ngôn ngữ:** TypeScript Strict Mode (`0 errors`, Clean type-checking)
- **Bộ dựng (Bundler):** Vite 5.4+ (Fast HMR & Optimized Production Build)
- **Hệ thống An Toàn:** `SafeSpawnResolver` tự động gỡ kẹt collider, reset sạch cờ ẩn nấp khi nạp Save
- **Giao diện Cổ Điển:** Dark Woodland Parchment UI, Torn Page & Paper Note Modals tương tác giữa màn hình
- **Hệ thống Âm thanh:** Web Audio API đa tầng (Lọc âm sương mù, tiếng bước chân động, nhịp tim sinh tồn)
- **Giao diện & Chữ hiển thị:** Native 1280×720 HD Typography Helper (Linear Filtering, 2x Canvas Resolution)

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Bước 1: Tải mã nguồn về máy
```bash
git clone https://github.com/KyoshiroKyo/HOLLOW-WOODS.git
cd HOLLOW-WOODS
```

### Bước 2: Cài đặt các gói thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:3000/` (hoặc `http://localhost:8080/`).

---

## 🔍 Lệnh Kiểm Tra & Đóng Gói Sản Phẩm

- **Kiểm tra cú pháp & kiểu dữ liệu TypeScript (Strict Mode):**
  ```bash
  npx tsc --noEmit
  ```
  *(Đạt 0 lỗi)*

- **Đóng gói phiên bản phát hành chính thức (Production Bundle):**
  ```bash
  npm run build
  ```

- **Đóng gói bản phát hành Web P2Game:**
  ```bash
  npm run release:p2game
  ```
  *(Tự động tạo `release/p2game/hollow-woods-p2game-v1.5.2.zip` kèm `p2game.json` và bộ media)*

- **Đóng gói mã nguồn tinh gọn cho AI Review:**
  ```bash
  node scripts/pack_source_for_gemini.mjs
  ```

---

## 🎮 Bảng Phím Tắt Điều Khiển Trong Game

| Phím bấm | Chức năng chi tiết |
|:---:|---|
| **`W / A / S / D`** hoặc **Mũi tên** | Di chuyển nhân vật qua lại trong khu rừng (hỗ trợ trượt góc Corner-Slide 45°) |
| **`Shift`** | Chạy nhanh (tiêu hao Thể lực / Stamina) |
| **`F`** | **✨ Bật / Tắt Vòng Sáng Hộ Tâm:** Tiêu hao 10 Thể Lực khi nhóm, 1.2 Thể Lực/giây duy trì. Bảo vệ Tinh Thần khỏi bóng tối (quái vật phát hiện xa hơn +30%) |
| **`Chuột trái` / `Space`** | Vung kiếm tấn công cận chiến (tiêu hao nhẹ Thể Lực) |
| **`E`** | Tương tác nói chuyện NPC, Ẩn nấp thân cây rỗng/bụi rậm, Thu thập tài nguyên, Đọc biển báo/cổ thư, Rung chuông |
| **`Q`** | Ném Mồi Tiếng Động (Noise Lure) đánh lạc hướng quái vật The Listener |
| **`1` .. `8`** | Sử dụng nhanh vật phẩm trên Thanh Túi Đồ đáy màn hình |
| **`I` / `C`** | Mở / Đóng Bảng Chế Tạo Dã Ngoại DST (Crafting Modal 2 tầng có tìm kiếm & bookmark tabs) |
| **`J`** | Mở / Đóng Sổ Tay Lữ Khách (Nhiệm Vụ 7 Chặng, Ký Ức Hiệp Sĩ, Bestiary, Bản Đồ) |
| **`N`** | Bật / Tắt La Bàn Mở Rộng / Bản Đồ Mini |
| **`M`** | Bật / Tắt toàn bộ âm thanh trò chơi (Mute / Unmute) |
| **`ESC`** | Tạm dừng trò chơi & mở Bảng Tùy Chọn (Pause Menu) |
| **`F8`** | **🛡️ Gỡ Kẹt Về Điểm An Toàn (Emergency Unstuck):** Thoát kẹt địa hình/cổng sắt và hồi phục về điểm an toàn |
| **`F9`** | **⚙️ Chế độ Debug Khung Tương Tác Quản Trị Viên:** Bật/Tắt hiển thị hộp va chạm và tầm tương tác |
| **`F4`** | Bật / Tắt Bảng Kỹ Thuật Debug Overlay (FPS, Tọa độ, Hitbox chân đế) |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
HOLLOW-WOODS/
├── src/                           ← Toàn bộ mã nguồn TypeScript của game (scenes, entities, systems, ui, world...)
├── public/assets/                 ← Tài nguyên runtime phục vụ trực tiếp cho game (audio, maps, characters, ui...)
├── docs/                          ← Hệ thống tài liệu kỹ thuật, hướng dẫn & nhật ký
│   ├── reports/                   ← Báo cáo đánh giá & kiểm toán toàn diện V1.5
│   └── guides/                    ← Hướng dẫn chạy game và vận hành
├── Read/                          ← Báo cáo chuyên sâu và sổ chỉ mục kiến trúc
│   └── V1.5/                      ← Hồ sơ đại tu toàn diện V1.5 (Reports/, README_INDEX.md)
├── release/                       ← Bản đóng gói phát hành (p2game/, gemini_review/)
├── Backups/                       ← Kho lưu trữ dự phòng
├── Pixel_Art/                     ← Kho tài nguyên đồ họa pixel art gốc từ họa sĩ
├── Sound_Effects/                 ← Kho âm thanh nguồn và sample hiệu ứng gốc
├── scripts/                       ← Kịch bản kiểm thử tự động, build automation, đóng gói p2game
├── dist/                          ← Gói ứng dụng web sau khi build (Vite production bundle)
├── package.json                   ← Cấu hình thư viện và script npm
├── tsconfig.json                  ← Cấu hình biên dịch TypeScript Strict Mode
├── vite.config.ts                 ← Cấu hình máy chủ phát triển và đóng gói Vite
└── README.md                      ← Tài liệu này
```

---

## 🏆 Trạng Thái Dự Án & Bản Quyền

- **Phiên bản hiện tại:** HOLLOW WOODS V1.5.2 (`v1.5.2-final`).
- **Trạng thái nghiệm thu:** 🎉 **100% BUILD PRODUCTION & KIỂM ĐỊNH TOÀN DIỆN THÀNH CÔNG (0 LỖI)**.
- **Tác quyền & Quản trị:** Dự án thực thi bởi Chief Software Architect cho `KyoshiroKyo/HOLLOW-WOODS`.
