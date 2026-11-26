# HW-ASSET-03 — BÁO CÁO TỔ CHỨC KHO TÀI NGUYÊN MỚI, KHẢO SÁT BLACK KNIGHT V2 VÀ KẾ HOẠCH TÍCH HỢP RESURRECTED RPG

- **Dự án:** `HOLLOW WOODS`
- **Studio:** `KYOSHIRO STUDIO`
- **Đặc phái viên:** `AG 4 Hydro High`
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **HEAD SHA:** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
- **Giai đoạn:** `WORLD RECONSTRUCTION 2.0`
- **Tham chiếu phong cách:** `HOLLOW WOODS TRAILER V12.2`
- **Chế độ:** `ASSET DISCOVERY, RECOVERY & MAP PROTOTYPE`
- **Ngày thực hiện:** `2026-11-26`

---

## 1. TỔNG QUAN & CHỈ THỊ CỦA OWNER
Owner vừa bổ sung 21 bộ tài nguyên Pixel Art thế giới mới và yêu cầu:
1. Đánh giá và ưu tiên bộ tài nguyên **Resurrected RPG** của Immunity làm nền tảng tái thiết môi trường rừng và di tích, vì bộ này có chất lượng mỹ thuật tiệm cận nhất với Trailer V12.2 nhưng chưa từng được khai thác trong game.
2. Tìm kiếm và phục hồi phiên bản **Black Knight V2** trong toàn bộ kho lưu trữ.
3. Chuẩn hóa kho tài nguyên thiết kế chính thức tại:
   `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\`
   với các phân nhánh: `Pixel_Art/`, `Rar/`, `SFX/`, `Sound_Effects/`.
4. Xây dựng các bản thử nghiệm mỹ thuật (Visual Labs) và ý tưởng World Map UI mới.

---

## 2. BẢO TỒN DỮ LIỆU P0 & SAFETY GATE
- **Quy tắc bất khả xâm phạm HW-ASSET-01-R1:**
  - Tuyệt đối `0` file archive bị xóa, `0` file bị ghi đè, `0` file bị nén lại.
  - Toàn bộ 60 gói nén gốc + 28 gói mới bổ sung đều được bảo toàn nguyên vẹn mã băm SHA-256.
  - Các bản sao lưu đối chiếu nguyên trạng tại:
    - `G:\HOLLOW WOODS\Backups\EXPORT_BACKUP_20261126_PRE_CONSOLIDATE` (3.130 tệp)
    - `G:\HOLLOW WOODS\Backups\REPO_ROOT_ASSETS_BACKUP_20261126`
- **Bảo toàn trạng thái Git & Mã nguồn:**
  - Nhánh: `feat/v1.5.3-ag-world-polish` (HEAD: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`).
  - Toàn bộ các thay đổi sửa lỗi `HW-H4-12A` và `HW-ASSET-01` được bảo vệ nguyên vẹn.
  - Game source (`src/`) và runtime assets (`public/assets/`) hoàn toàn không bị chỉnh sửa.
  - `tsc --noEmit`: **PASS** (0 lỗi).
  - `verify:data`: **15/15 PASS**.

---

## 3. PHASE A — KHO TÀI NGUYÊN THIẾT KẾ HOLLOW_WOODS_EXPORT
Cấu trúc thực tế tại `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT`:
- **`Pixel_Art/` (338 tệp):**
  - `Rar/`: 78 gói archive phân loại theo chủ đề (`World/`: 30 gói, `Characters/`: 24 gói, `Monsters/`: 14 gói, `UI_UX/`: 7 gói, `Items/`: 1 gói, `Effects/`: 1 gói, `Unclassified/`: 1 gói).
  - `13_Tileset_Packs/Resurrected_RPG/`: Toàn bộ bộ tài nguyên Resurrected RPG 1.1 đã giải nén đầy đủ.
  - `14_New_Downloaded_Packs/`: 21 gói tải mới đã trích xuất an toàn phục vụ phân tích.
  - `Characters/`, `Monsters/`, `World/`, `UI_UX/`, `Reference_Art/`, `Licenses/`.
- **`Sound_Effects/` (589 tệp):**
  - `Rar/SFX/`: 10 gói archive âm thanh (`Horror SFX`, `Beasts`, `Werewolf`, `Monsters`, `Japanese Horror`...).
  - `Rar/Voice_Dialogue/`: 1 gói archive `Super Dialogue Audio Pack v1.zip`.
  - `Music/`: 5 bản nhạc nền chất lượng cao `The Knight’s Quiet Fire`.
  - `Voice_Dialogue/`: 549 tệp thoại nhân vật sạch.
  - `SFX/`: 24 hiệu ứng âm thanh phong cách retro.

---

## 4. PHASE B — KẾT QUẢ KHẢO SÁT BLACK KNIGHT V2
- **Mức độ ưu tiên:** P0
- **Phạm vi tìm kiếm:** Toàn bộ repository `G:\HOLLOW WOODS`, lịch sử Git commit, các thư mục `Backup`, `Backups`, toàn bộ 89 archive ZIP/RAR.
- **Từ khóa:** `Black Knight V2`, `Black_Knight_V2`, `BlackKnightV2`, `Black Knight 2.0`, `Mossbound Wayfarer`, `Knight atlas`.
- **KẾT QUẢ XÁC MINH: `NOT FOUND / UNVERIFIED`**
  - **Bản gốc thực tế duy nhất:** Bộ tài nguyên chính thức của tác giả **Fellor** là `Black Knight V1.0` (phát hành Unity 2025-09-22 / itch.io 2026-07-08), lưu trữ tại `HOLLOW_WOODS_EXPORT/Pixel_Art/Rar/Characters/Black Knight.zip`.
  - **Dấu vết chữ "v2":** Chỉ xuất hiện ở 2 ảnh banner quảng bá trên web `WEB_Images/Banner_v2.png` và `Banner_v22.png` (không phải sprite nhân vật).
  - **Runtime Atlases:** Các tệp atlas trong `public/assets/characters/black_knight/` (`black_knight_conversion_combat`, `movement`, `air`, `actions`) là sản phẩm trích xuất và đóng gói tự động từ tệp master `Black_Knight_All_In_One_New.png` của Fellor bởi các script `extract_black_knight_wayfarer.mjs` và `pack_v153_*.py`.
  - **Tuân thủ quy tắc an toàn:** Không tự tiện đổi tên V1 thành V2; không chế tác sprite V2 giả mạo; ghi nhận trạng thái chờ Owner cung cấp nếu có bộ V2 độc lập.
- **Bằng chứng thị giác:** Đã tạo bảng đối chiếu [BLACK_KNIGHT_V1_V2_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/BLACK_KNIGHT_V1_V2_COMPARISON.png).
- **Hồ sơ chi tiết:** [HW_BLACK_KNIGHT_V2_INVENTORY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BLACK_KNIGHT_V2_INVENTORY.json).

---

## 5. PHASE C — KHÁM PHÁ & ĐÁNH GIÁ BỘ RESURRECTED RPG 1.1
- **Tác giả:** `Immunity` ([https://immunitys.itch.io/resurected-rpg-tile](https://immunitys.itch.io/resurected-rpg-tile)).
- **Vị trí lưu trữ mới:** `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\Pixel_Art\13_Tileset_Packs\Resurrected_RPG\` (15 tệp đầy đủ).
- **Thành phần tài nguyên:**
  1. `Plants.png` (`1024×1024 px`): Cụm cây cổ thụ tán rộng nhiều lớp, cây nhỏ, bụi rậm, hoa cỏ, dây leo.
  2. `Wall.png` (`2048×1024 px`): Tường thành đá cổ rêu phong, cột trụ đổ nát, bậc thang đá, cổng vòm vỡ.
  3. `Grass.png` (`1024×512 px`): Gạch nền đất cỏ, lối mòn tự nhiên, thảm cỏ mịn.
  4. `Grass 2 layer.png` (`1024×512 px`): Lớp phủ địa hình chuyển tiếp.
  5. `Props.png` (`512×512 px`): Tượng đá cổ, bàn thờ đá (Shrines), đèn đá, rương cổ, vò gốm.
  6. `portal-Sheet.png` (`3264×112 px`): Hoạt ảnh Cổng dịch chuyển cổ đại (Forgotten Portal) gồm **`29 frames`** kích thước `112×112 px` với luồng sáng ma thuật xoay vần cực kỳ sống động.
  7. Toàn bộ các tệp nguồn thiết kế `.aseprite` đi kèm nguyên bản.
- **Tình trạng sử dụng trong game hiện hành:** **`AVAILABLE BUT UNUSED`** (Chưa từng được import hay crop vào bất kỳ atlas nào trong `public/assets/` hay `src/`).
- **Đánh giá tích hợp:** Điểm mỹ thuật 10/10; tương thích hoàn hảo với tỷ lệ 32×32 px của Phaser 4 và vóc dáng 64×64 của Black Knight.
- **Bằng chứng thị giác:** [RESURRECTED_RPG_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/RESURRECTED_RPG_CONTACT_SHEET.png).
- **Hồ sơ chi tiết:** [HW_RESURRECTED_RPG_USAGE_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_RESURRECTED_RPG_USAGE_INDEX.json).

---

## 6. PHASE D — KIỂM KÊ 21 GÓI TÀI NGUYÊN MỚI
Toàn bộ 21 gói đã được giải nén và phân tích tại `HOLLOW_WOODS_EXPORT/Pixel_Art/14_New_Downloaded_Packs/`:
1. **EPIC RPG World - Ancient Ruins:** 45 tệp, 32 PNG, **5 tệp bản đồ TMX/TSX Tiled hoàn chỉnh**.
2. **EPIC RPG World - Grass Land 2.0:** 7 tệp, 2 PNG, **2 tệp bản đồ TMX/TSX Tiled**.
3. **Pixel Art Top Down - Basic v1.2.3:** 17 tệp, 12 PNG (địa hình cơ bản).
4. **Plants:** 3 tệp PNG cây cỏ bổ sung.
5. **Pixel Valley - Revamp:** 13 tệp, 12 PNG (lối mòn thung lũng).
6. **TF Jungle:** 17 tệp, 13 PNG (rừng nhiệt đới ẩm ướt).
7. **DarkFantasy FREE Starter:** 123 tệp, 113 PNG, **2 tệp bản đồ TMX** (kiến trúc u tối, tượng quỷ).
8. **RF Catacombs v1.0:** 28 tệp, 19 PNG (tường đá hầm mộ, đuốc, đầu lâu).
9. **TF DarkDimension & Updated:** 38 tệp, 36 PNG (vùng đất hư không dị giới).
10. **Houses Pack:** 3 tệp, nhà cửa làng mạc thời Trung cổ.
11. **Serene Village Revamped v1.9:** 36 tệp, 22 PNG (làng quê thanh bình, hàng rào, giếng nước).
12. **Atelier Magicae Extras:** 3 tệp, nội thất phòng ma thuật.
13. **Dead Swamp:** 15 tệp, 13 PNG (đầm lầy chết, nước tù đọng, rêu bùn).
14. **Mangrove Swamp Sampler:** 8 tệp, 5 PNG (cây rễ chùm ngập mặn).
15. **Kauzz Cave Tiles & RPGW Caves:** 28 tệp, 16 PNG (hang đá ngầm, thạch nhũ).
16. **TF Ashlands, Atlantis & Updated:** 72 tệp, 69 PNG (vùng tro bụi núi lửa và tàn tích ngập nước).
17. **Pocket Inventory Series #2 Pixel Map:** 286 tệp, 249 PNG (hệ thống World Map UI).
- **Bằng chứng thị giác:** [NEW_ASSET_PACKS_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/NEW_ASSET_PACKS_CONTACT_SHEET.png).
- **Hồ sơ chi tiết:** [HW_NEW_ASSET_PACK_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_ASSET_PACK_INDEX.json).

---

## 7. PHASE E — ĐỊNH HƯỚNG MỸ THUẬT & PHÂN BỔ KHU VỰC THẾ GIỚI
Theo nguyên tắc mỹ thuật thống nhất, không trộn lẫn hỗn loạn, đề xuất phân bổ tài nguyên cho 17 phân khu của HOLLOW WOODS:
- **Khu an toàn Bellhollow Hamlet:**
  - *Tài nguyên chủ đạo:* `Serene Village Revamped v1.9` kết hợp `Houses Pack`.
  - *Đặc trưng:* Mái ngói nâu, tường vách gỗ, hàng rào nhỏ, giếng nước đá, ánh đèn vàng ấm áp tạo cảm giác bình yên của một nơi trú ẩn (Safe Haven).
- **Khu rừng Outer Woods & Ngã tư Verdant Crossroad:**
  - *Tài nguyên chủ đạo:* `Resurrected RPG 1.1` (Immunity) kết hợp `Grass Land 2.0`.
  - *Đặc trưng:* Thảm cỏ tự nhiên xanh rì rêu phong, cây sồi/cây phong tán khổng lồ nhiều tầng che bóng mát, đường mòn đất nện rộng rãi thoáng đãng cho Black Knight chạy nước rút và chiến đấu.
- **Khu đầm lầy Silent Mire & Ổ Boss Mire Warden Basin:**
  - *Tài nguyên chủ đạo:* `Dead Swamp` kết hợp `Mangrove Swamp Sampler`.
  - *Đặc trưng:* Nước bùn sẫm màu, cây khô gãy trơ cành, rễ đước quấn quanh thềm đá, lớp sương lam mỏng huyền ảo.
- **Khu rừng sâu Deep Forest & Đền cổ Sanctuary:**
  - *Tài nguyên chủ đạo:* `Resurrected RPG 1.1` (Ruined Walls & Props) kết hợp `DarkFantasy Starter`.
  - *Đặc trưng:* Cột đá cổ đổ nát, tượng chiến binh cổ, thạch đài rêu phong bao phủ, ánh sáng le lói qua kẽ lá.
- **Khu Hầm mộ Forgotten Crypt & Vực thẳm Abyssal Chasm:**
  - *Tài nguyên chủ đạo:* `RF Catacombs v1.0`, `RPGW Caves` và `portal-Sheet.png`.
  - *Đặc trưng:* Bậc đá tối tăm dẫn xuống lòng đất sâu, Cổng cổ đại xoay vần ánh sáng xanh tím huyền bí.
- **Bản đồ thế giới (World Map UI):**
  - *Tài nguyên chủ đạo:* `Pocket Inventory Series #2 Pixel Map`.

---

## 8. PHASE F — RESURRECTED RPG WORLD VISUAL LAB (3 BẢN THỬ NGHIỆM MỸ THUẬT)
Đã dựng hoàn chỉnh 3 bản dựng phối cảnh độ phân giải cao `1920×1080 px` bằng chính tài nguyên thực tế:
1. **[LAB_01_RESURRECTED_FOREST.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_01_RESURRECTED_FOREST.png):**  
   Phối cảnh Rừng Hồi Sinh: Lối mòn đất cỏ tự nhiên uốn lượn, cụm cây đại thụ nhiều tầng tán lá tạo độ sâu tiền cảnh và hậu cảnh, thảm cỏ đan xen đá rêu, nhân vật Black Knight di chuyển tự nhiên với không gian rộng mở.
2. **[LAB_02_ANCIENT_KNIGHT_SANCTUARY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_02_ANCIENT_KNIGHT_SANCTUARY.png):**  
   Phối cảnh Đền Hiệp Sĩ Cổ Đại: Tường thành đá đổ nát thời trung cổ, hàng cột trụ cổ kính sừng sững, đài tế đá và tượng thánh rêu phong, ánh sáng vàng cam hắt nhẹ tôn vinh tông màu Dark Moss & Ember Gold.
3. **[LAB_03_FORGOTTEN_PORTAL.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_03_FORGOTTEN_PORTAL.png):**  
   Phối cảnh Cổng Hư Không Bí Ẩn: Kiến trúc vòm đá cổ uy nghiêm bao quanh chiếc cổng dịch chuyển ma thuật phát sáng luồng năng lượng xanh lam ma mị từ tệp `portal-Sheet.png`, sương đêm bao phủ chân vực thẳm.

---

## 9. PHASE G — NGHIÊN CỨU & BẢN THẢO WORLD MAP UI
- **Khảo sát bộ Pocket Inventory Series #2 Pixel Map v1.2:**
  - Cung cấp tấm nền bản đồ da dê cuộn (`0.png`) cổ điển cực kỳ sang trọng.
  - Bộ icon địa danh phong phú: Tháp lâu đài, lều làng, đầu lâu nguy hiểm, la bàn chỉ hướng, ngọn lửa cắm trại, chân ghim định vị.
- **Bản dựng ý tưởng [WORLD_MAP_UI_CONCEPT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/WORLD_MAP_UI_CONCEPT.png):**
  - Trình bày toàn bộ **17 phân khu** của HOLLOW WOODS với đường nối tuyến trình thám hiểm tự nhiên.
  - Tích hợp nhãn tên khu vực, ghim định vị vị trí hiện tại của Black Knight tại Bellhollow (`★ YOU ARE HERE`).
  - Khung chú thích bản đồ (Legend) phân cấp rõ: Safe Zone, Vùng khám phá nguy hiểm, Ổ Boss và Cổng Abyssal.
  - Sẵn sàng tích hợp vào giao diện mở bản đồ toàn cảnh bằng phím `[M]`.

---

## 10. BẢNG TỔNG KẾT TRẠNG THÁI CUỐI CÙNG (FINAL STATUS)

```text
NEW ASSET ROOT:                   G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT\
ARCHIVES VERIFIED:                89 / 89 (100% SHA-256 MATCH)
FILES DELETED:                    0
FILES OVERWRITTEN:                0
BLACK KNIGHT V2 FOUND:            NOT FOUND / UNVERIFIED (Awaiting Owner Source)
BLACK KNIGHT V2 ORIGINAL PATH:    N/A (Current master is Fellor V1.0)
BLACK KNIGHT V2 NEW LIBRARY PATH: HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Player/Black_Knight/
RESURRECTED RPG FOUND:            YES (Resurrected RPG 1.1 by Immunity)
RESURRECTED RPG GAME USAGE:       AVAILABLE BUT UNUSED (Verified 100% Clean)
NEW PACKS INVENTORIED:            21 PACKS EXTRACTED & ANALYZED
EDITABLE MAPS FOUND:              YES (TMX/TSX maps in Ancient Ruins, Grass Land 2.0, DarkFantasy)
LICENSE STATUS:                   VERIFIED (Commercial / Royalty-Free with Attribution)
VISUAL LABS CREATED:              LAB-01, LAB-02, LAB-03 (1920x1080)
WORLD MAP CONCEPT:                CREATED (WORLD_MAP_UI_CONCEPT.png)
RUNTIME ASSETS MODIFIED:          NO
PRODUCTION SOURCE MODIFIED:       NO
FINAL STATUS:                     PASS — READY FOR OWNER REVIEW
```

---

## 11. CÁC TỆP ĐÃ TẠO VÀ ĐƯỜNG DẪN TRỰC TIẾP
1. 📄 [HW_ASSET_03_NEW_LIBRARY_AND_RESURRECTED_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_ASSET_03_NEW_LIBRARY_AND_RESURRECTED_REPORT.md)
2. 📄 [HW_NEW_ASSET_PACK_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_ASSET_PACK_INDEX.json)
3. 📄 [HW_BLACK_KNIGHT_V2_INVENTORY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BLACK_KNIGHT_V2_INVENTORY.json)
4. 📄 [HW_RESURRECTED_RPG_USAGE_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_RESURRECTED_RPG_USAGE_INDEX.json)
5. 📄 [HW_TILESET_COMPATIBILITY_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TILESET_COMPATIBILITY_MATRIX.md)
6. 📄 [HW_ASSET_LICENSE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_ASSET_LICENSE_REPORT.md)
7. 🖼️ [RESURRECTED_RPG_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/RESURRECTED_RPG_CONTACT_SHEET.png)
8. 🖼️ [BLACK_KNIGHT_V1_V2_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/BLACK_KNIGHT_V1_V2_COMPARISON.png)
9. 🖼️ [NEW_ASSET_PACKS_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/NEW_ASSET_PACKS_CONTACT_SHEET.png)
10. 🖼️ [LAB_01_RESURRECTED_FOREST.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_01_RESURRECTED_FOREST.png)
11. 🖼️ [LAB_02_ANCIENT_KNIGHT_SANCTUARY.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_02_ANCIENT_KNIGHT_SANCTUARY.png)
12. 🖼️ [LAB_03_FORGOTTEN_PORTAL.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/LAB_03_FORGOTTEN_PORTAL.png)
13. 🖼️ [WORLD_MAP_UI_CONCEPT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-03/WORLD_MAP_UI_CONCEPT.png)
