# HOLLOW WOODS V1.4 — HỆ THỐNG TÀI LIỆU & BÁO CÁO PHÁT TRIỂN
## THE FOG THAT REMEMBERS — SURVIVAL & CONTENT EXPANSION
**Studio:** Kyoshiro Game Studio  
**Workspace:** `G:\HOLLOW WOODS`  
**Phiên bản nền tảng:** V1.3.4 (P2Game Build Freeze) ➔ **Mục tiêu:** V1.4.0 (Survival Expansion)  
**Ngày khởi tạo:** 17/11/2026  

---

## 📌 MỤC LỤC TÀI LIỆU THEO LỘ TRÌNH (DOCUMENTATION INDEX)

| Mã Báo Cáo | Giai Đoạn / Phân Hệ | Tên Tài Liệu & Nội Dung Chi Tiết | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **`01_P0`** | **Phase 0: Baseline Audit** | [01_P0_V13_Audit_And_Baseline.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/01_P0_V13_Audit_And_Baseline.md)<br>Kiểm toán toàn diện hiện trạng mã nguồn V1.3, đối chiếu Item, Zone, NPC, Combat, Save Payload và trạng thái build. | **HOÀN TẤT** |
| **`02_P1`** | **Phase 1: Content Registry** | [02_P1_Content_Registry_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/02_P1_Content_Registry_Report.md)<br>Xây dựng hệ thống định danh 4 tầng (Content, RuntimeKey, Asset, Dev/Mod), bảng ánh xạ 69 mục và giải quyết alias ở chế độ Mirror. | **HOÀN TẤT** |
| **`03_P1`** | **Phase 1: Save Migration** | [03_P1_Save_Migration_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/03_P1_Save_Migration_Report.md)<br>Cơ chế chuyển đổi Save không phá hủy, bảo toàn 100% key V1.3, sao lưu an toàn `hollow_woods_save_backup_v13` và 41/41 testcases đạt PASS. | **HOÀN TẤT** |
| **`04_P2`** | **Phase 2: Time System** | [04_P2_Time_And_Environment_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/04_P2_Time_And_Environment_Report.md)<br>Triển khai hệ thống chu kỳ thời gian 360s (Ngày 180s, Hoàng Hôn 90s, Đêm Sương 90s), nội suy chuyển pha mượt, tầm nhìn FOW, áp lực Bình Tâm, quy tắc tạm dừng và Widget HUD góc trên phải. | **HOÀN TẤT** |
| **`05_P2`** | **Phase 2: Weather & Badges** | [05_P2_Weather_And_Status_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/05_P2_Weather_And_Status_Report.md)<br>Triển khai thời tiết Mưa Sương (Mist Rain), tối ưu pool hạt mưa GPU, tích hợp âm thanh mưa Web Audio, cơ chế cản tiếng chân The Listener 40%, cảnh báo 220px và 2 Huy hiệu Độ Ẩm / Thân Nhiệt trên HUD. | **HOÀN TẤT** |
| **`05_P3`** | **Phase 3: Camp, Items & Farm** | [05_P3_Camp_Crafting_Farming_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/05_P3_Camp_Crafting_Farming_Report.md)<br>Cụm Sanctuary Camp Hub thống nhất trong Bellhollow (Lửa Trại 3 cấp, Rương 12 ô, Nồi Thảo Dược, Lều Trú Ẩn), 12 vật phẩm bối cảnh Trung cổ, phân trang CraftingModal, bảo vệ Quest/Lore items và nâng cấp nông trại 5 bước trực quan với 3 nhóm cây trồng (765/765 tests PASS). | **HOÀN TẤT** |
| **`06_P4`** | **Phase 4: Survival UI/UX** | [06_P4_UI_Equipment_Combat_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/06_P4_UI_Equipment_Combat_Report.md)<br>Nâng cấp Hotbar 8 ô đáy màn hình (gỗ tối, da cũ, đồng xỉn, hào quang hổ phách, bảo toàn 100% phím tắt), Viền nhận diện tương tác thế giới (trắng kem 1.5px trên duy nhất 1 mục tiêu gần nhất) và Bảng Chế Tạo trượt phải tránh che khuất tầm nhìn sương mù (799/799 tests PASS). | **HOÀN TẤT** |
| **`07_P4`** | **Phase 4: Equipment & Defense**| [07_P4_Equipment_Slots_And_Survival_Defense.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/07_P4_Equipment_Slots_And_Survival_Defense.md)<br>Hệ thống 4 ô trang bị cá nhân chuyên biệt (Áo, Ủng, Túi, Bùa) có đánh đổi chỉ số, độ bền vĩnh cửu, phím tắt `[B]`, 3 loại vũ khí tự vệ đẩy lùi theo hướng nhìn và Đuốc Nhựa Thông xua đuổi quái vật (840/840 tests PASS). | **HOÀN TẤT** |
| **`08_P5`** | **Phase 5: Wildlife, Memory & Events** | [07_P5_Wildlife_And_Horror_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/07_P5_Wildlife_And_Horror_Report.md)<br>Hệ sinh thái rừng (Quạ Rừng, Bướm Đêm Hổ Phách), Trí nhớ ngắn hạn The Listener chống lặp mồi nhử (Anti-Repeat Memory), Phân tách The Echo không sát thương vật lý và 5 Sự Kiện Thế Giới Động (930/930 tests PASS). | **HOÀN TẤT** |
| **`09_P6`** | **Phase 6: Sub-areas & Boss** | [08_P6_World_Quest_Boss_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/08_P6_World_Quest_Boss_Report.md)<br>Xây dựng 3 tiểu khu (Xưởng Chuông, Hầm Rễ, Khoảng Trống Thì Thầm), 5 nhiệm vụ phụ NPC, Sổ tay sinh vật Bestiary 4 loài, Bản đồ 13 vùng và Trận Trùm Giải Đố Kẻ Nuốt Tiếng Chuông 2 pha (1,006+ tests PASS). | **HOÀN TẤT** |
| **`10_P7`** | **Phase 7: Content Packs & Audio/VFX** | [09_P7_ContentPacks_And_QA_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/09_P7_ContentPacks_And_QA_Report.md)<br>Kiến trúc Built-in Data-Driven Content Packs JSON, phân tách namespace, bảo mật sandbox CSP RT-002, hệ thống Audio Ducking 35-50% và Trợ năng thị giác Mưa Sương (1,064+ tests PASS). | **HOÀN TẤT** |
| **`11_P8`** | **Phase 8: Polish & Data Preservation** | [09_P7_ContentPacks_And_QA_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/09_P7_ContentPacks_And_QA_Report.md#L180-L245)<br>Khắc phục lệch tâm quầng sáng đèn lồng, Rương gỗ Split-View 12 ô, Đồng hồ tròn 3 múi, Hitbox 4 hướng & Đuốc Nhựa Thông cắm đất, ContentPackValidator an toàn CSP và cơ chế bảo lưu khóa lạ `legacyExtraData` (1,181+ tests PASS). | **HOÀN TẤT** |
| **`12_FINAL`** | **Phase 8: Final Release & Tagging** | [10_P7_V14_Final_Release_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/10_P7_V14_Final_Release_Report.md)<br>Báo cáo tổng kết phát hành chính thức V1.4, kiểm thử hồi quy toàn diện 20 bộ test (1,181+ testcases PASS 100%), xác minh Build Vite production sạch 0 lỗi và gắn nhãn Git `v1.4.0-survival-expansion`. | **HOÀN TẤT** |

---

## 🧭 NGUYÊN TẮC CỐT LÕI KHI PHÁT TRIỂN V1.4
1. **Canon chuẩn:** Làng Bellhollow – Lữ khách The Mossbound Wayfarer – Màn sương The Fog That Remembers. Loại bỏ toàn bộ tàn dư không thuộc canon (Lâm Sơn, Radio cứu hộ, Old Camp hiện đại).
2. **Kỷ luật dữ liệu:** Không thay thế trực tiếp các `runtimeKey` cũ trong Save/Load. Mọi mở rộng phải thông qua lớp tra cứu hai chiều của `ContentRegistry`.
3. **Triển khai an toàn:** Thực hiện trên nhánh riêng `feat/v1.4-expansion`, giữ nguyên trạng bản `main` phục vụ vòng thi P2Game.io.
