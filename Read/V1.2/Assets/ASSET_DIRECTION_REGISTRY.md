# HOLLOW WOODS V1.2 — ASSET & WORLD DIRECTION REGISTRY

- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Mã bước:** `C4-12-00`

---

## 1. HƯỚNG NGHỆ THUẬT CHÍNH THỨC — PHƯƠNG ÁN A: DARK WOODLAND PIXEL ART

- **Phong cách chủ đạo:** Top-down 2D Pixel Art kết hợp giữa kiến trúc làng gỗ – đá trung cổ giữa rừng sâu (*weathered stone-and-timber cottages, cobblestone village square, wooden fences, lanterns, dense layered conifers & weeping willows*) với bầu không khí kinh dị sinh tồn huyền bí (*layered mist, warm amber lantern pools, ancient runic luminescence*).
- **Chuẩn kỹ thuật Pixel Art:**
  - Hiển thị sắc gọn (`nearest-neighbor` / integer pixel scaling), nền RGBA trong suốt (`colorType = 6`), không làm mờ hay răng cưa nội suy.
  - Tách biệt hoàn toàn khung hình ảnh hiển thị (`sprite frame`) với hộp va chạm vật lý (`collision body`) ở bàn chân/chân đế công trình để đảm bảo chiều sâu `Y-sorting` tự nhiên.

---

## 2. ĐỊNH HƯỚNG NHÂN VẬT CHÍNH & DÂN LÀNG BELLHOLLOW

### 2.1. Nhân vật chính — THE MOSSBOUND WAYFARER (*Lữ Khách Rêu Phong*)
- **Tài liệu concept gốc:** Ảnh tham chiếu lữ khách khoác áo choàng xanh rêu phủ lá rừng, đeo cuộn hành lý sau lưng, tay cầm cây gậy gỗ xoắn treo chiếc đèn lồng hổ phách ấm áp.
- **Đặc điểm nhận diện:**
  - Mái tóc nâu trầm tự nhiên, gương mặt trẻ trung kiên nghị.
  - Áo choàng xanh rêu đậm (`#183329` – `#386b56`) phủ lá rêu rừng trên vai (`#4e8548` – `#8ec26b`), mặc ngoài áo tunic vàng đất (`#6b4829` – `#b07f4e`) thắt đai da khóa đồng cổ (`#e0b24c`).
  - Quần tối màu và ủng da đi rừng chắc chắn.
  - **Trang bị biểu tượng:** Cây gậy gỗ của nhân vật kèm chiếc đèn lồng ánh hổ phách ấm áp (`#d35400` – `#f39c12`).
- **Thông số kỹ thuật Sprite:**
  - Ô frame chuẩn `64 × 64 px`, điểm neo bàn chân cố định tại `(32, 58)` (`origin: (0.5, 0.90625)`), chiều cao đứng `30 px` (`~1.58×` nhân vật cũ), 4 hướng đầy đủ (`DOWN`, `UP`, `LEFT`, `RIGHT`).

### 2.2. Ba NPC Dân làng Bellhollow
1. **Garth (`npc_garth`) — Người Gác Cổng (*Gate Watchman*):** Dáng vóc vạm vỡ, râu bạc, mặc giáp da – sắt bảo hộ và áo choàng gác cổng, tay cầm giáo canh gác tại lối ra Cổng Đông.
2. **Bà Lão Edda (`npc_edda`) — Người Giữ Chuông (*Elder Bell Keeper*):** Dáng người lưng còng, tóc bạc búi gọn cài cành liễu, khoác lễ phục giữ chuông nhiều lớp đeo bùa chuông đồng cổ, chống gậy gỗ liễu trước Tháp Chuông.
3. **Neris (`npc_neris`) — Thầy Thuốc Thảo Mộc (*Village Herbalist*):** Trang phục thầy thuốc thực dụng kèm tạp dề làm việc, giỏ thảo dược đan mây, cối giã thuốc và các lọ thuốc đắp thảo mộc.

---

## 3. CẤU TRÚC THẾ GIỚI — PHƯƠNG ÁN C: HYBRID OPEN WORLD

Thế giới **HOLLOW WOODS V1.2** được tổ chức theo mô hình **Hybrid Open World (Phương án C)** gồm 3 tầng không gian kết nối liền mạch:

1. **Layer 1 — Core World (Mở từ đầu):**
   - **Fog Crossing:** Điểm khởi đầu sương mù và tiếng chuông dẫn lối.
   - **Bellhollow (Trung tâm làng):** Quảng trường giếng cổ, Tháp Chuông, nhà dân, bàn chế tạo và 3 NPC.
   - **Sanctuary Farm (Nông trại nhỏ):** Khu canh tác thảo mộc, chế tạo và lưu trữ an toàn gắn liền với làng.
2. **Layer 2 — Frontier (Mở dần theo khám phá & nhiệm vụ):**
   - **Outer Woods (Rừng Ngoại Vi):** Khu rừng ven làng tự do thu thập tài nguyên cơ bản.
   - **The Crooked Path (Đường Mòn Quanh Co):** Rừng sâu nhiều tầng, tài nguyên hiếm và sự rình rập của *The Listener* (*Kẻ Lắng Nghe*).
3. **Layer 3 — Forbidden Regions (Khóa theo cốt truyện & giải đố):**
   - **Silent Mire (Đầm Lầy Tĩnh Lặng):** Đầm lầy cổ ngữ và câu đố 3 Cột Đá Cổ Ngữ (*Moon, Root, Eye*).
   - **Broken Bell Shrine (Miếu Chuông Đổ Nát):** Trung tâm bí ẩn của Hollow Woods và cao trào hồi kết.

---

## 4. CÁC TRỤ CỘT LỐI CHƠI (8 GAMEPLAY PILLARS)

1. **Sinh tồn (Survival):** Quản lý Máu (*Health*), Thể Lực (*Stamina*), Dầu Đèn (*Lantern Oil*) và Bình Tâm (*Composure*).
2. **Bầu không khí rừng sâu huyền bí (Atmospheric Woodland Horror):** Hiệu ứng *The Veil*, *The Echo* và lén lút âm thanh trước *The Listener*.
3. **Khám phá (Exploration):** Di chuyển qua mạng lưới đường mòn, cổng làng, biển chỉ đường và các khu vực mở khóa dần.
4. **Thu thập (Gathering):** Hái thảo mộc, nhặt gỗ khô, nhựa cây và đá lửa với nhãn tương tác `[E]` rõ ràng.
5. **Chế tạo (Crafting):** Pha chế *Bình Dầu Đèn*, *Thuốc Đắp Thảo Mộc* và *Mồi Tạo Tiếng Động* tại bàn chế tạo hoặc túi đồ.
6. **Nhiệm vụ (Quests):** Hệ thống nhiệm vụ dẫn dắt theo tiến trình từ Hồi 0 đến Hồi 5.
7. **Giải đố (Mystery & Puzzles):** Khám phá Quy tắc Làng, ảo ảnh Chiếc Đèn Thứ Hai và giải mã Cột Đá Cổ Ngữ.
8. **Nông trại nhỏ (Sanctuary Farming):** Trồng và thu hoạch thảo mộc sinh tồn quy mô vừa phải tại khu vườn làng Bellhollow.
