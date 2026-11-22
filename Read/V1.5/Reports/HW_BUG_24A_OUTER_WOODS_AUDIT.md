# BÁO CÁO KHẢO SÁT & KIỂM TOÁN LỘ TRÌNH: HW-BUG-24A — OUTER WOODS PATH AUDIT AFTER HW-FIX-21 (REVISED)

**Dự án:** HOLLOW WOODS — V1.5.4 PREP
**Workdir:** `G:\HOLLOW WOODS`
**Branch:** `feat/v1.5.3-ag-world-polish`
**Chế độ:** SOURCE READ-ONLY + QA + DOC-ONLY AUDIT
**Thời gian thực hiện:** 2026-11-22
**Gói dọn dẹp cơ sở:** HW-FIX-21 (commit `3b1982bac12a5e96941d99ed431cd2f1372bde15`) & HW-BUG-23 (commit `0a647bc5451bb4a3f3e7c11c2f2ed85670e7a65a`, 100% VERIFIED)
**Kết luận tổng thể:** **VERIFIED-NO-CHANGE** (Tất cả 5 tuyến đường lưu thông hai chiều thông suốt 100%, không tồn tại blocker).

---

## 1. MỤC TIÊU & PHẠM VI KHẢO SÁT

Sau khi hoàn thành đợt dọn dẹp Outer Woods trong HW-FIX-21 và nghiệm thu dứt điểm 5 prop cản trở trong HW-BUG-23 (VERIFIED-BY-PRIOR-COMMIT), nhiệm vụ HW-BUG-24A thực hiện kiểm toán độc lập thực tế (Physical Walk Traversal Audit) trên 5 huyết mạch giao thông chính của khu vực Rừng Ngoại Vi (Outer Woods).

### Phương pháp kiểm thử:
- **Chế độ vật lý:** `Noclip OFF` tuyệt đối (`body.checkCollision.none = false`).
- **Kích thước va chạm nhân vật (Arcade Body AABB):** Chiều rộng $W = 18\text{px}$, chiều cao $H = 12\text{px}$, neo sát bàn chân.
- **Phương thức di chuyển:** Mô phỏng vận tốc thực tế 60Hz ($v = 85.0\text{px/s}$) theo từng cặp waypoint hai chiều (Thuận & Nghịch).
- **Phân định rõ ràng:**
  - `SETUP`: Đặt nhân vật tại điểm xuất phát của tuyến, đồng bộ foot anchor và cập nhật bounding box.
  - `WALK-VERIFIED`: Nhân vật di chuyển liên tục qua từng waypoint hoàn toàn bằng Arcade Physics, kiểm tra va chạm với 228 static colliders trong `WorldBuilder.colliderGroup`.

---

## 2. KẾT QUẢ KHẢO SÁT 5 TUYẾN ĐƯỜNG HUYẾT MẠCH (100% PASS)

| STT | Tên tuyến đường | Lộ trình khảo sát (Waypoints) | Chiều Thuận (Forward) | Chiều Nghịch (Backward) | Walkable Clearance tối thiểu | Đối tượng lề gần nhất | Đánh giá lưu thông |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---:|
| 1 | **Tuyến 1: Cửa Bắc ↔ Bãi Trại Thợ Săn (Khúc cua chữ S)** | (1210, 580) $\to$ (1170, 625) $\to$ (1165, 685) $\to$ (1210, 725) $\to$ (1260, 745) $\to$ (1330, 745) | **PASS** | **PASS** | $0.5\text{px} - 1.5\text{px}$ (sát lề) / Hành lang $>45\text{px}$ | Gốc Cây Pixel Art / Biển Chỉ Dẫn | **THÔNG SUỐT 100%** |
| 2 | **Tuyến 2: Bãi Trại ↔ Ngã Ba ↔ Sir Vaelen** | (1330, 745) $\to$ (1360, 755) $\to$ (1410, 755) $\to$ (1435, 730) $\to$ (1435, 710) | **PASS** | **PASS** | $1.8\text{px} - 3.2\text{px}$ (sát lề) / Hành lang $>57\text{px}$ | Cụm Vật Phẩm Làng (Đống Củi) | **THÔNG SUỐT 100%** |
| 3 | **Tuyến 3: Ngã Ba Rừng ↔ Xưởng Chuông Bỏ Hoang** | (1330, 745) $\to$ (1360, 760) $\to$ (1360, 840) $\to$ (1360, 920) $\to$ (1360, 980) $\to$ (1360, 1000) | **PASS** | **PASS** | $11.9\text{px} - 13.7\text{px}$ / Hành lang $>75\text{px}$ | Cụm Vật Phẩm Làng / Cụm Cây Sồi | **THÔNG SUỐT 100%** |
| 4 | **Tuyến 4: Nhánh Bãi Liễu & Bìa Rừng Phía Nam** | (1330, 745) $\to$ (1270, 745) $\to$ (1265, 820) $\to$ (1260, 910) $\to$ (1240, 930) | **PASS** | **PASS** | $8.0\text{px} - 9.0\text{px}$ / Hành lang $>70\text{px}$ | Cụm Thùng Gỗ / Cây Liễu Cổ Thụ | **THÔNG SUỐT 100%** |
| 5 | **Tuyến 5: Vòng chu vi 360° quanh Bếp Sir Vaelen** | (1490, 680) $\to$ (1505, 710) $\to$ (1490, 745) $\to$ (1430, 745) $\to$ (1420, 710) $\to$ (1440, 680) $\to$ (1490, 680) | **PASS** | **PASS** | $0.1\text{px}$ (sát chân trạm) / Hành lang $40\text{px} - 72\text{px}$ | Trạm Kiểm Lâm / Bếp Lửa Cổ | **THÔNG SUỐT 100%** |

---

## 3. BẢNG KHẢO SÁT CHI TIẾT 4 VẬT THỂ LỀ ĐƯỜNG & ĐIỂM HẸP

Không phát hiện bất kỳ vật thể nào chặn đứng lòng đường (blocker). Bốn vật thể lề đường dưới đây được lập hồ sơ đánh giá hành lang an toàn:

| STT | Tên đối tượng & Tọa độ | Bounding Box Collider | Vị trí & Hiện trạng lòng đường | Đánh giá lưu thông & Tuyến đi vòng | Khuyến nghị kỹ thuật | Rủi ro Stealth / Quest |
|:---:|:---|:---|:---|:---|:---:|:---:|
| 1 | **Cụm Thùng Gỗ Làng**<br>`(1275, 710)` | `x: 1265..1285`<br>`y: 706..718`<br>($W=20, H=12$) | Nằm ở lề Bắc ngã ba Trại Thợ Săn. Lòng đường đất nâu uốn lượn tại $Y = 740..745$. | Khoảng hở giữa chân thùng ($Y=718$) và lề Nam ($Y=780$) rộng **$62\text{px}$**, cho phép hơn 5 thân nhân vật đi song song. | **KEEP**<br>(Giữ nguyên) | **Không ảnh hưởng** (0%) |
| 2 | **Cụm Đống Củi Làng**<br>`(1385, 725)` | `x: 1375..1395`<br>`y: 721..733`<br>($W=20, H=12$) | Nằm ở lề phân cách giữa nhánh rẽ Sir Vaelen và nhánh xuống Xưởng Chuông. | Khoảng mở phía Nam giữa đống củi ($Y=733$) và thân cây đổ ven suối ($Y=790$) rộng **$57\text{px}$**. Hành lang nối Sir Vaelen rộng $>60\text{px}$. | **KEEP**<br>(Giữ nguyên) | **Không ảnh hưởng** (0%) |
| 3 | **Trạm Kiểm Lâm Bỏ Hoang**<br>`(1420, 620)` | `x: 1418..1478`<br>`y: 642..662`<br>($W=60, H=20$) | Chân đế công trình Landmark phía sau Bếp Lửa Sir Vaelen. | Khoảng trống ngõ sau giữa chân trạm ($Y=662$) và đỉnh bếp ($Y=702$) là **$40\text{px}$** (nhân vật cao $12\text{px}$ đi lọt thoải mái với clearance $>10\text{px}$). Vòng 360° thông suốt. | **KEEP**<br>(Giữ nguyên) | **Không ảnh hưởng** (Bảo toàn điểm lore/rương) |
| 4 | **Biển Chỉ Dẫn Cửa Rừng Bắc**<br>`(1220, 640)` | `x: 1213..1227`<br>`y: 633..643`<br>($W=14, H=10$) | Biển đá cắm ở mỏm ngoặt phía Đông khúc cua chữ S. | Lối mòn tự nhiên ôm cua sang Tây men $X=1165..1170$ với hành lang rộng $>45\text{px}$. Biển chỉ dẫn có hitbox chân chống xuyên đúng chuẩn. | **KEEP**<br>(Giữ nguyên) | **Không ảnh hưởng** (0%) |

---

## 4. BẰNG CHỨNG THỰC TẾ & BẢN ĐỒ LỘ TRÌNH (ROUTE MAP)

Script kiểm thử tự động: `tests/hw_bug_24a_outer_woods_path_audit.py`

### Danh mục ảnh minh chứng kiểm toán:
1. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route_map.png`: Bản đồ toàn cảnh phân khu Outer Woods với 5 lộ trình được vẽ màu phân biệt, kèm tọa độ waypoint và chú giải thông số kỹ thuật.
2. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route1_s_curve.png`: Ảnh chụp thực tế khúc cua chữ S cửa rừng phía Bắc (Route 1).
3. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route2_vaelen_junction.png`: Ảnh chụp ngã ba rẽ sang trạm lửa Sir Vaelen (Route 2).
4. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route3_bell_corridor.png`: Ảnh chụp hành lang đại lộ X=1360 xuống Xưởng Chuông Bỏ Hoang (Route 3).
5. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route4_willow_clearing.png`: Ảnh chụp nhánh rẽ Bãi Liễu Cổ Thụ & Cây Rỗng (Route 4).
6. `Read/V1.5/Reports/Visuals/HW_BUG_24A/hw_bug_24a_route5_bonfire_loop.png`: Ảnh chụp chu vi đi bộ vòng quanh bếp lửa Sir Vaelen (Route 5).

---

## 5. KẾT LUẬN

1. Không phát hiện bất kỳ vật cản đường (blocker) hay lỗi kẹt góc nào trên cả 5 tuyến đường huyết mạch của Outer Woods.
2. Tình trạng sau bản dọn rừng HW-FIX-21 và nghiệm thu HW-BUG-23 đạt độ hoàn thiện cao, đảm bảo trải nghiệm khám phá và chiến đấu mượt mà cho phiên bản phát hành V1.5.4.
3. **Kết luận kỹ thuật:** **VERIFIED-NO-CHANGE** (Không chỉnh sửa gameplay code, hoàn tất bằng doc-only commit).
