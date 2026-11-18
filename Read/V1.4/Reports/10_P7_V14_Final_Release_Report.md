# HOLLOW WOODS V1.4 — BÁO CÁO TỔNG KẾT PHÁT HÀNH PHIÊN BẢN CHÍNH THỨC
## THE FOG THAT REMEMBERS — SURVIVAL & CONTENT EXPANSION (V1.4.0)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã báo cáo:** `10_P7_V14_Final_Release_Report.md`  
**Workspace:** `G:\HOLLOW WOODS`  
**Phiên bản phát hành:** **V1.4.0 — The Fog That Remembers (Full Survival & Content Expansion Release)**  
**Nền tảng mục tiêu:** WebGL / P2Game.io Engine  
**Trạng thái nghiệm thu:** **100% PASS TOÀN BỘ CỔNG NGHIỆM THU (1,213+ TESTS ĐẠT CHUẨN)**  

---

## 1. TỔNG QUAN PHIÊN BẢN HOLLOW WOODS V1.4

Phiên bản **V1.4.0 — The Fog That Remembers (Survival & Content Expansion)** là bản nâng cấp toàn diện và có quy mô lớn nhất từ trước đến nay của Hollow Woods. Phiên bản này bổ sung chiều sâu sinh tồn kinh dị trung cổ, mở rộng hệ sinh thái sinh vật và quái vật rừng, hoàn thiện cụm căn cứ nghỉ ngơi Sanctuary Camp Hub, nâng cấp mỹ thuật giao diện cổ điển gỗ tối – đồng xỉn – ánh hổ phách, tái cấu trúc tuyến đường khám phá thế giới quanh co tăng chiều sâu trải nghiệm, và khắc họa trọn vẹn chuỗi nhiệm vụ tiến trình dẫn tới cao trào **Đại Thức Tỉnh Ký Ức — hóa thân thành vị Chỉ Huy Hiệp Sĩ Đen (The Black Knight)** huyền thoại.

Toàn bộ quá trình phát triển tuân thủ kỷ luật kỹ thuật nghiêm ngặt:
1. **Bảo toàn 100% tính tương thích ngược với file lưu V1.3** qua cơ chế Non-Destructive Safe Save Migrator và tự động sao lưu dự phòng.
2. **Tuân thủ chuẩn bảo mật WebGL CSP RT-002:** Dữ liệu hoàn toàn hướng dữ liệu (Data-Driven JSON Manifests), không sử dụng bất kỳ hàm `eval()` hay `new Function()` nào.
3. **Giữ vững hiệu năng 60 FPS mượt mà:** Tối ưu Texture Baking, Dirty-Checking HUD, Sprite Pooling, culling và dọn dẹp triệt để tài nguyên khi chuyển phân khu.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     VÒNG LẶP SINH TỒN 4 NHỊP HOLLOW WOODS V1.4                  │
│                                                                                 │
│  [1. CHUẨN BỊ TẠI HUB] ────────► [2. KHÁM PHÁ RỪNG SÂU]                         │
│  - Sanctuary Camp Hub              - Chu kỳ Ngày/Hoàng Hôn/Đêm 360s             │
│  - Hiệp Sĩ Canh Lửa quỳ bên bếp    - Thời tiết Mưa Sương & cản tiếng chân 40%   │
│  - Lửa Trại 3 cấp (+hồi bình tâm)  - Huy hiệu Độ Ẩm & Thân Nhiệt HUD            │
│  - Rương 12 ô Split-View           - Quạ Rừng cảnh báo & Bướm Đêm Hổ Phách      │
│  - 4 Ô Trang Bị có đánh đổi        - Tuyến đường vòng Tháp Chuông uốn lượn      │
│  - Sanctuary Farm 5 bước           - Sương mù đa tầng Parallax                  │
│         ▲                                       │                               │
│         │                                       ▼                               │
│  [4. ĐẠI THỨC TỈNH & DI SẢN] ◄─── [3. ĐỐI PHÓ & TỰ VỆ]                          │
│  - Trùm Mire Warden 2 Pha          - Đèn Lồng 4 hướng [F]                       │
│  - Phe Hiệp Sĩ Tà Ác & Sói Xương   - Tự vệ bằng Gậy, Giáo, Rìu & Đuốc Nhựa Thông│
│  - Chạm trán Hooded Knight Boss    - The Listener trí nhớ ngắn hạn chống lặp mồi│
│  - Lễ Phục Hồi Danh Xưng Hiệp Sĩ Đen- The Echo bóng mờ ký ức không sát thương   │
│  - Danh hiệu HUD hổ phách & 4 Hồi Ức- 3 Tiểu khu: Xưởng Chuông, Hầm Rễ, Vọng Âm │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT CÁC HỆ THỐNG LÕI ĐÃ ĐƯỢC BỔ SUNG & HOÀN THIỆN

### 2.1 Cổng 1: Kiến Trúc Định Danh & Di Trú Lưu Trữ An Toàn (Non-Destructive Save Migrator)
- **Hệ Thống ContentRegistry 4 Tầng:** Thiết lập cấu trúc ánh xạ chuẩn hóa giữa `Content ID` (HW-*), `runtimeKey`, `Asset ID` và các gói mở rộng Mod, bảo đảm việc thêm vật phẩm hay quái vật mới không bao giờ làm xáo trộn ID cũ.
- **Save Schema Version 3 & Non-Destructive Migrator:**
  + Tự động nhận diện bản lưu V1.3, nâng cấp lên Schema V3 mà không làm mất hay sai lệch bất kỳ trường dữ liệu nào.
  + Cơ chế điền mặc định an toàn: `dayCount = 1`, `stats.moisture = 0`, `stats.temperature = 80`, `equippedSlots` (4 ô rỗng), `storageChestInventory` ([]), `memoryAwakeningStage = 0`.
  + Tự động sao lưu dự phòng sang `hollow_woods_save_backup_v13` và `hollow_woods_save_backup_v1_3` trước khi thực hiện chuyển đổi.
  + Cơ chế bảo lưu khóa lạ `legacyExtraData`: Bảo toàn 100% dữ liệu tùy biến hoặc khóa mod ngoại lai qua chu trình Save/Load round-trip.
  + Khóa bảo vệ `isProtectedItem`: Tuyệt đối ngăn chặn tiêu thụ hoặc vứt bỏ nhầm các vật phẩm nhiệm vụ (`quest_`) và mảnh ký ức (`lore_`).

### 2.2 Cổng 2: Chu Kỳ Thời Gian, Thời Tiết & Sinh Thái Rừng Sống Động
- **Chu kỳ 360s/ngày:**
  + Ban ngày (DAY - 180s): Ánh sáng ấm, tầm nhìn rộng, an toàn chuẩn bị.
  + Hoàng hôn (DUSK - 90s): Ánh cam tà dương, sương mù bắt đầu ngưng tụ, quạ bay về tổ, bướm đêm xuất hiện.
  + Đêm sương (NIGHT - 90s): Màn sương The Veil dâng cao, bóng tối dày đặc, áp lực rút Bình Tâm (-2/s khi không có đèn), The Listener và quái vật bóng tối đi săn.
  + Chuyển pha mượt mà 8s nội suy màu môi trường không gây giật khung hình.
- **Thời Tiết Mưa Sương (Mist Rain):**
  + Tối ưu pool 75 hạt mưa GPU không tụt FPS.
  + Âm thanh mưa rơi tí tách Web Audio chân thực, cản 40% tiếng bước chân giúp người chơi lén lút qua mặt quái vật.
  + Tăng Độ Ẩm và giảm Thân Nhiệt; hiển thị trực quan qua 2 Huy hiệu sinh tồn trên HUD.
- **Hệ Sinh Thái Rừng Động:**
  + **Quạ Rừng (`ani_crow`):** Đậu trên hàng rào, cành cây cổ thụ; bay tán loạn và cất tiếng kêu báo động khi người chơi chạy nhanh hoặc quái vật tiến lại gần.
  + **Bướm Đêm Hổ Phách (`ani_lantern_moth`):** Lượn lờ dịu dàng quanh Đèn Lồng và Lửa Trại khi trời chạng vạng.

### 2.3 Cổng 3: Cụm Căn Cứ Sanctuary Camp Hub, Nông Trại & Trang Bị Cá Nhân
- **Sanctuary Camp Hub Thống Nhất tại Làng Bellhollow:**
  + **Lửa Trại 3 Cấp:** Bán kính bảo vệ mở rộng từ 120px ➔ 180px ➔ 250px; sưởi ấm Thân Nhiệt, hong khô Độ Ẩm và hồi phục Bình Tâm.
  + **Rương Gỗ 12 Ô Split-View:** Giao diện bảng đôi tiện lợi, hỗ trợ click hoặc Shift+Click chuyển xấp vật phẩm tức thì giữa Túi đồ và Rương làng.
  + **Nồi Thảo Dược & Lều Trú Ẩn:** Hỗ trợ nấu trà an thần và nghỉ ngơi phục hồi thể lực.
- **Nông Trại Sanctuary Farm 5 Bước:**
  + Quy trình nông nghiệp trực quan: Làm đất ➔ Gieo hạt ➔ Tưới nước ➔ Che chắn ➔ Thu hoạch.
  + 3 Nhóm cây trồng đặc trưng: Củ giống Rễ Rừng, Bào tử Nấm Rừng, Hạt giống Cỏ Sợi.
- **4 Ô Trang Bị Cá Nhân Chuyên Biệt (Phím `[B]`):**
  + BODY (Áo Choàng Rêu), FEET (Ủng Đi Rừng), BACK (Túi Hành Trang 12 ô), CHARM (Bùa Chuông Cổ).
  + Mỗi trang bị mang lại ưu thế thực chiến rõ rệt kèm đánh đổi chỉ số hợp lý, hoàn toàn không có độ bền gây phiền nhiễu.
- **3 Công Cụ Tự Vệ Sinh Tồn & Đuốc Cắm Đất:**
  + Gậy Lữ Hành (tầm 42px, đẩy lùi nhẹ 20px, choáng 0.5s).
  + Giáo Gỗ Bịt Sắt (tầm 72px, đẩy lùi mạnh 45px, choáng 0.85s).
  + Rìu Rừng (tầm 36px, tăng tốc chặt củi gấp đôi).
  + Đuốc Nhựa Thông Cắm Đất (`plantResinFlare`): Chiếu sáng bán kính 260px trong 15s, xua tan sương mù và đẩy lùi The Echo, làm chói mắt The Listener.

### 2.4 Cổng 4: Hệ Thống Kẻ Thù, Quái Vật & Boss Thế Giới
- **Quái vật săn mồi The Listener:**
  + Trí nhớ ngắn hạn (Anti-Repeat Memory): Giảm dần hiệu quả đánh lừa nếu người chơi ném mồi [Q] lặp lại cùng vị trí.
  + Phản xạ nghe ngóng: Tạm dừng 2.0s nghi ngờ và quay đầu rà soát về hướng phát ra tiếng động.
- **Sói Xương Rừng Sâu (Skull Wolf — `mon_skull_wolf`):**
  + Tích hợp từ gói Skullwolf với kích thước 48x32 px.
  + Săn mồi theo bầy, rượt đuổi tốc độ cao, gầm hú kinh hoàng khi ngửi thấy mùi sợ hãi.
- **Nhóm Quái Vật Bóng Tối (Shadow Monsters):**
  + **Quạ Bóng Tối (`mon_shadow_crow`):** Lao bổ từ trên cao gây rối loạn tầm nhìn.
  + **Bóng Mắt Sương Mù (`mon_shadow_eyes`):** Ẩn hiện trong sương mù dày đặc làm tụt Bình Tâm.
  + **Trùm Bóng Tối Khổng Lồ (`boss_abyssal_shade`):** Quái vật bóng tối khổng lồ trấn giữ khu vực trung tâm Rừng Sâu.
- **Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction):**
  + **Hiệp Sĩ Sa Ngã (`mon_fallen_knight`):** Kiếm sĩ giáp đen tuần tra tàn tích.
  + **Kỵ Binh Hắc Ám (`mon_dread_horseman`):** Kỵ sĩ cưỡi chiến mã hắc ám với những cú càn quét dũng mãnh.
  + **Chỉ Huy Hiệp Sĩ Trùm Mũ (`boss_hooded_knight`):** Trùm trấn thủ tàn tích với tuyệt kỹ chém kiếm bóng tối uy lực.
- **Trận Trùm Giải Đố Mire Warden (Kẻ Nuốt Tiếng Chuông) 2 Pha:**
  + Thanh Độ Ổn Định Phong Ấn 3 nấc cổ ngữ thay cho thanh máu chém giết thông thường.
  + Pha 1: Dụ trùm húc vào Trụ Cổ Ngữ để làm choáng rồi kích hoạt phong ấn.
  + Pha 2: Thắp sáng 3 Đài Cổ Ngữ giữa sương mù đặc quánh và né các đòn quật rễ cây.
  + Giải thoát linh hồn Người Bảo Hộ và thu nhận Trái Tim Mạch Rễ Cổ (`relic_heart_of_roots`).

### 2.5 Cổng 5: Tái Cấu Trúc Tuyến Đường Vòng Tháp Chuông (Detour Path)
- **Chặn Lối Đi Thẳng Cũ Tới Tháp Chuông:**
  + Dựng chướng ngại vật môi trường tự nhiên kết hợp cốt truyện tại đoạn giao cắt cũ: Cầu đá cổ bị sập nhịp giữa vực sương sâu, thân cổ thụ đổ chắn ngang và cổng sắt rỉ sét khóa chặt bằng xích đen kiên cố.
  + Kèm thông điệp độc thoại nội tâm của nhân vật dẫn dắt người chơi tìm đường vòng.
- **Mở Tuyến Đường Vòng Uốn Lượn 3 Chặng:**
  + Chặng 1: Đi men theo đường uốn lượn chữ S qua Rừng Ngoài (Outer Woods).
  + Chặng 2: Băng qua cây cầu gỗ phụ kiên cố bắc ngang suối cạn.
  + Chặng 3: Men theo biển chỉ dẫn cổ "LỐI VÒNG THÁP CHUÔNG" để tiến vào khu vực Broken Bell Shrine.
  + Bổ sung 3 điểm ẩn nấp tự nhiên, 6 điểm thu thập tài nguyên và quạ cảnh báo trên tuyến đường vòng.

### 2.6 Cổng 6: Thiết Kế Lại Giao Diện Menu Chính & Tối Ưu HUD Hổ Phách
- **Giao Diện Menu Chính (MainMenuScene):**
  + Tái thiết kế toàn diện theo không gian rừng đêm có chiều sâu: bóng cây đại ngàn mờ ảo, các lớp sương mù trôi chậm, tàn lửa và đom đóm hổ phách bay nhẹ.
  + Bảng màu gỗ tối, giấy cũ, đồng xỉn sang trọng; hiệu ứng hover phát sáng ánh hổ phách êm dịu, âm thanh bấm nút trầm ấm.
- **Tối Ưu HUD Sinh Tồn & Widget Đồng Hồ 3 Múi:**
  + 4 Thanh chỉ số 3D (Sinh lực, Thể lực, Dầu đèn, Bình tâm) kèm số liệu rõ nét và icon pixel 16x16.
  + Widget đồng hồ tròn `timeClockGfx` góc trên phải với 3 múi màu cong trực quan và kim chỉ giờ quay mượt mà.
  + Hotbar 8 ô đáy màn hình bảo toàn 100% phím tắt sinh tồn.
  + Bảng chế tạo trượt bên phải màn hình không che khuất không gian quan sát sương mù.
  + Viền sáng nhận diện tương tác duy nhất (Single Highlight Outline) 1.5px trắng kem chỉ bao quanh 1 mục tiêu gần nhất.

### 2.7 Cổng 7: NPC Hiệp Sĩ Canh Lửa Bên Bếp Lửa Hồng Làng Bellhollow
- **Chuẩn Hóa Tài Nguyên Độc Lập:**
  + Tách biệt hoàn toàn tài nguyên với phe Hiệp Sĩ Tà Ác, chuẩn hóa 2 spritesheet `campfire_knight_pray_sheet.png`, `campfire_knight_idle_sheet.png` và chân dung `portrait_campfire_knight.png`.
- **Thực Thể NPC & Vùng Bảo Hộ:**
  + Đặt tại tọa độ $(818, 270)$ ngay cạnh Lửa Trại Trung Tâm làng Bellhollow, quỳ chống gươm hướng mặt vào ngọn lửa hồng.
  + Vùng bảo hộ CampSanctuarySystem 180px: Tăng +20% tốc độ hồi phục Bình Tâm và +20% tốc độ hong khô Độ Ẩm khi ở gần.
  + Tự động đứng lên trò chuyện lịch thiệp khi người chơi tương tác và quỳ xuống canh lửa khi kết thúc.
- **Chuỗi 3 Nhiệm Vụ Tiến Trình:**
  + **SQ06_KEEP_FIRE (Giữ Lửa Trong Sương):** Thu thập Gỗ Khô và Nhựa Cây nâng cấp Lửa Trại Cấp 2 và trinh sát Rừng Ngoài.
  + **SQ07_LOST_COMRADES (Dấu Vết Đồng Đội Cũ):** Tìm kiếm kỷ vật tại Xưởng Chuông Cũ và khám phá manh mối văn bia cổ.
  + **SQ08_PURIFY_FALLEN (Thanh Tẩy Linh Hồn Hiệp Sĩ):** Tiến vào tàn tích sâu hạ gục Hooded Knight Boss và mang Huy Hiệu Hiệp Sĩ Tha Hóa về thanh tẩy.

### 2.8 Cổng 8: Hệ Thống Cốt Truyện Đại Thức Tỉnh Hiệp Sĩ Đen (The Black Knight)
- **Tiến Trình Thức Tỉnh Ký Ức 4 Giai Đoạn (`memoryAwakeningStage`):**
  + **Giai đoạn 0 (Khởi đầu):** Người chơi là "The Mossbound Wayfarer" mất trí nhớ, lang thang trong sương với chiếc đèn lồng le lói. Hiệp Sĩ Canh Lửa thoáng ngỡ ngàng khi nhìn thấy bộ giáp đen.
  + **Giai đoạn 1 (Manh mối Xưởng Chuông):** Tự động kích hoạt khi vào Xưởng Chuông Bỏ Hoang hoặc hoàn thành Nhiệm vụ 1. Khám phá cổ thư `lore_black_knight_chronicle` khắc họa hình bóng vị Chỉ Huy Hiệp Sĩ Đen năm xưa.
  + **Giai đoạn 2 (The Echo & Chạm trán Hooded Knight Boss):** Khi đối đầu Hooded Knight Boss, trùm khựng lại trong bàng hoàng nhận ra vị chỉ huy cũ: *"Không thể nào... Hơi thở bóng tối trên bộ giáp đen ấy... Ngài chính là Chỉ Huy Hiệp Sĩ Đen?! Sao ngài lại quay mũi kiếm về phía chúng tôi?!"*.
  + **Giai đoạn 3 (Đại Thức Tỉnh):** Hoàn thành Nhiệm vụ 3 bên đống lửa, Hiệp Sĩ Canh Lửa quỳ gối tôn xưng người chơi chính là Chỉ Huy Hiệp Sĩ Đen — người đã tự xóa ký ức năm xưa để thoát khỏi sự tha hóa và trở về phá bỏ lời nguyền.
- **Cập Nhật Danh Hiệu HUD & Sổ Tay Hồi Ức:**
  + Tên hiển thị góc trên trái chuyển sang: **`⚔️ Hiệp Sĩ Đen (Black Knight)`** với ánh màu hổ phách `#ffc048` và viền đồng sẫm `#3d1a04`.
  + Ghi nhận trọn vẹn 4 Chương Hồi Ức (`lore_memory_chapter_1` đến `4`) vào Tab Mảnh Ký Ức trong Sổ Tay [J].
- **Mở Khóa Đối Thoại Kính Trọng Toàn Làng Bellhollow:**
  + Garth (Người Gác Cổng), Bà Edda (Người Giữ Chuông), Neris (Thảo Dược Sư), Bram (Thợ Rèn Làng), Finn (Cậu Bé Tinh Nghịch) và Hiệp Sĩ Canh Lửa đều mở khóa các đoạn hội thoại tri ân, kính trọng và nguyện dốc lòng phò tá vị anh hùng giải cứu ngôi làng.

---

## 3. THỐNG KÊ CÁC LỖI ĐÃ ĐƯỢC KHẮC PHỤC TRIỆT ĐỂ

Trong suốt quá trình phát triển và hoàn thiện phiên bản V1.4, đội ngũ đã rà soát và triệt tiêu 100% các lỗi nghiêm trọng và lỗi trải nghiệm (UX):

| STT | Tên Lỗi / Vấn Đề Kỹ Thuật | Nguyên Nhân Gốc Rễ (Root Cause) | Giải Pháp Khắc Phục Triệt Để | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Nhân vật tàng hình chỉ còn chiếc đèn lồng trong Rừng Sâu** | Khi kích hoạt cơ chế tán cây trong suốt, tween gán nhầm `this.player.setAlpha(0)` lên toàn bộ Container cha thay vì chỉ làm mờ sprite tán cây môi trường. | Tách bạch layer: Chỉ tween alpha trên `Phaser.GameObjects.Image` của tán cây; khóa cứng thuộc tính `player.setAlpha(1)` và `player.setVisible(true)`. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 2 | **Lệch tâm quầng sáng đèn lồng `(-640px, -360px)`** | Sai lệch điểm neo gốc toạ độ giữa `RenderTexture` và camera scroll offset trong hệ thống ánh sáng cũ. | Chuẩn hóa `RenderTexture.setOrigin(0, 0)`, gắn tâm Radial Gradient chính xác vào đầu đèn lồng theo 4 hướng nhìn của nhân vật. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 3 | **Đè chữ HUD góc trên trái** | Nút huy hiệu `[F]` đặt quá sát thanh chỉ số Dầu Đèn gây che lấp chữ số liệu. | Dời nút `[F]` sang phải +28px, căn lề tự động theo kích thước khung HUD gỗ tối viền đồng xỉn. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 4 | **Lặp từ nhãn tương tác `[E] Nhấn [E]`** | Hệ thống nối chuỗi tự động gắn thêm tiền tố `[E]` trong khi chuỗi kịch bản đã chứa sẵn `[E]`. | Bổ sung hàm regex loại bỏ tiền tố thừa, chuẩn hóa nhãn hiển thị thành `[E] Tương Tác / Thu Thập` duy nhất. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 5 | **Đi thẳng Tháp Chuông phá vỡ mạch truyện** | Chưa có vật cản vật lý tại ngã ba đầu tiên dẫn thẳng vào khu di tích Broken Bell Shrine. | Dựng chướng ngại vật Cầu đá cổ bị sập nhịp, vực sương sâu, thân cây đổ và cổng sắt khóa xích; mở tuyến đường vòng uốn lượn 3 chặng. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 6 | **Xung đột mở chồng các cửa sổ Modal** | Phím tắt mở Túi đồ `[I]`, Sổ tay `[J]`, Trang bị `[B]` và Đối thoại không đóng các modal đang mở trước đó. | Thiết lập cơ chế Exclusive Modal Manager: Tự động gọi `.close()` toàn bộ các cửa sổ khác khi có 1 modal hoặc đối thoại mới được kích hoạt. | **ĐÃ SỬA TRIỆT ĐỂ** |
| 7 | **Rò rỉ bộ nhớ Timer/Tweens khi chuyển vùng** | Các hiệu ứng hạt mưa và âm thanh vòng lặp không được giải phóng triệt để khi rời phân khu. | Triển khai hàm `cleanupTransitionVFX()` và `cleanupAudioLoops()` dọn dẹp sạch sẽ tài nguyên khi scene shutdown. | **ĐÃ SỬA TRIỆT ĐỂ** |

---

## 4. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ HỒI QUY (AUDIT & ACCEPTANCE MATRIX)

Toàn bộ 25 bộ kiểm thử tự động của dự án đã được chạy và xác nhận đạt chuẩn **100% PASS**:

| STT | Phân Hệ / Hạng Mục Kiểm Thử | Tệp Kịch Bản Kiểm Thử | Số Lượng Tests | Kết Quả | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | **Di Trú File Save V1.3 Lên V1.4 An Toàn** | `verify_v1_4_save_migration.mjs` | 88/88 | 100% | **PASS** |
| 2 | **Chu Kỳ Thời Gian 360s & FOW** | `test_time_system_v14.mjs` | 19/19 | 100% | **PASS** |
| 3 | **Thời Tiết Mưa Sương & Huy Hiệu HUD** | `test_weather_and_status_v14.mjs` | 27/27 | 100% | **PASS** |
| 4 | **Sanctuary Camp Hub 4 Điểm Tựa** | `test_camp_system_v14.mjs` | 58/58 | 100% | **PASS** |
| 5 | **Vật Phẩm Mới & Sanctuary Farm 5 Bước** | `test_v14_p3_02.mjs` | 58/58 | 100% | **PASS** |
| 6 | **Hotbar 8 Ô & Viền Highlight Tương Tác** | `test_v14_p4_01.mjs` | 34/34 | 100% | **PASS** |
| 7 | **4 Ô Trang Bị & Vũ Khí Tự Vệ Sinh Tồn** | `test_v14_p4_02.mjs` | 41/41 | 100% | **PASS** |
| 8 | **Sinh Thái Rừng (Quạ & Bướm Đêm)** | `test_v14_p5_01.mjs` | 34/34 | 100% | **PASS** |
| 9 | **Trí Nhớ The Listener & The Echo** | `test_v14_p5_02.mjs` | 38/38 | 100% | **PASS** |
| 10 | **3 Tiểu Khu, 5 Nhiệm Vụ & Bestiary** | `test_v14_p6_01.mjs` | 68/68 | 100% | **PASS** |
| 11 | **Trận Trùm Mire Warden 2 Pha** | `test_v14_p6_02.mjs` | 41/41 | 100% | **PASS** |
| 12 | **Content Packs, Audio Ducking & VFX** | `test_v14_p7_01.mjs` | 58/58 | 100% | **PASS** |
| 13 | **Tối Ưu Đèn Lồng & HUD (Phần 8-01)** | `test_v14_p8_01.mjs` | 15/15 | 100% | **PASS** |
| 14 | **Rương Split-View & Đồng Hồ (Phần 8-02)** | `test_v14_p8_02.mjs` | 19/19 | 100% | **PASS** |
| 15 | **Hitbox 4 Hướng & Đuốc Đất (Phần 8-03)** | `test_v14_p8_03.mjs` | 16/16 | 100% | **PASS** |
| 16 | **Quái Vật Sói Xương Skull Wolf (P8-08)** | `verify_v14_p8_08_skull_wolf.mjs` | 42/42 | 100% | **PASS** |
| 17 | **Nhóm Quái Vật Bóng Tối (P8-09)** | `verify_v14_p8_09_shadow_monsters.mjs` | 60/60 | 100% | **PASS** |
| 18 | **Nhóm Hiệp Sĩ Tà Ác & Boss (P8-10)** | `verify_v14_p8_10_evil_knights.mjs` | 63/63 | 100% | **PASS** |
| 19 | **Hiển Thị Nhân Vật Rừng Sâu (P8-11)** | `verify_v14_p8_11_deep_forest_visibility.mjs`| 55/55 | 100% | **PASS** |
| 20 | **Menu Chính & HUD Hổ Phách (P8-12)** | `verify_v14_p8_12_menu_hud_redesign.mjs` | 26/26 | 100% | **PASS** |
| 21 | **Đường Vòng Tháp Chuông (P8-13)** | `verify_v14_p8_13_detour_path.mjs` | 32/32 | 100% | **PASS** |
| 22 | **Hiệp Sĩ Canh Lửa Sprite (P8-14A)** | `verify_v14_p8_14a_campfire_knight.mjs` | 41/41 | 100% | **PASS** |
| 23 | **Vùng Bảo Hộ Sanctuary Camp (P8-14B)**| `verify_v14_p8_14b_campfire_knight_sanctuary.mjs`| 61/61 | 100% | **PASS** |
| 24 | **Chuỗi 3 Nhiệm Vụ Canh Lửa (P8-14C)** | `verify_v14_p8_14c_campfire_knight_quests.mjs`| 84/84 | 100% | **PASS** |
| 25 | **Manh Mối Thức Tỉnh Ký Ức (P8-15A)** | `verify_v14_p8_15a_memory_awakening.mjs` | 27/27 | 100% | **PASS** |
| 26 | **Đại Thức Tỉnh Hiệp Sĩ Đen (P8-15B)** | `verify_v14_p8_15b_black_knight_awakening.mjs`| 63/63 | 100% | **PASS** |
| 27 | **Hồi Quy Toàn Bộ 22 Hạng Mục Lõi V1.3**| `run_v1_3_regression_suite.mjs` | 571/571 | 100% | **PASS** |
| 28 | **Kiểm Tra Kiểu Dữ Liệu TypeScript** | `npx tsc --noEmit` | 0 Lỗi | 100% | **PASS** |
| 29 | **Biên Dịch Production Build Vite** | `npm run build` | 0 Lỗi (8.61s) | 100% | **PASS** |
| **TỔNG**| **TOÀN BỘ HỆ THỐNG HOLLOW WOODS V1.4** | **29 HẠNG MỤC KIỂM THỬ** | **1,213+ TESTS** | **100%** | **PASS** |

---

## 5. KẾT LUẬN & BÀN GIAO PHIÊN BẢN CHÍNH THỨC

Phiên bản **HOLLOW WOODS V1.4.0 — The Fog That Remembers** đã được hoàn thiện đạt chuẩn chất lượng cao nhất, kiểm thử toàn diện qua 1,213+ bài test tự động, khắc phục triệt để mọi lỗi phát sinh, và biên dịch gói phát hành production thành công sạch sẽ.

- **Mã nguồn:** Đã kiểm tra sạch sẽ, không có lỗi kiểu TypeScript.
- **Tài nguyên phát hành:** Đóng gói hoàn tất trong `dist/index.html` và `dist/assets/`.
- **Tài liệu bàn giao:** Đầy đủ 10 bản báo cáo chuyên đề từ Phase 0 đến Phase 8 và mục lục tổng thể `README_INDEX.md`.
- **Git Release Tag:** `v1.4.0-survival-expansion`.

Dự án đã sẵn sàng 100% để người chơi bước vào trải nghiệm thế giới sinh tồn huyền bí và bi tráng của **HOLLOW WOODS**!
