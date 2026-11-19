# BÁO CÁO BƯỚC V15-58C: NHỊP TIM WEB AUDIO ĐỘNG, VIỀN ÁM ẢNH CO BÓP & PHẢN HỒI HOẢNG LOẠN
**Hệ thống:** HOLLOW WOODS V1.5 (Core Psychological & Audio-Visual Survival Engine)  
**Mã phân đoạn:** V15-58C  
**Thời gian thực hiện:** 19/11/2026  
**Trạng thái kiểm thử:** 100% PASSED (4/4 Kiểm thử Tự động, TypeScript 0 Lỗi, Production Build thành công)

---

## 1. Mục Tiêu & Yêu Cầu Thiết Kế Của Bước V15-58C

Bước V15-58C hoàn thiện cơ chế căng thẳng tâm lý đa giác quan (Multi-Sensory Psychological Dread) khi chỉ số Tinh Thần (Sanity / `composure`) suy giảm hoặc khi người chơi bị quái vật rình rập, bao gồm:
1. **Âm Thanh Nhịp Tim & Bóp Nghẹt Không Gian Khi Hoảng Loạn (`AudioManager.ts`, `SurvivalSystem.ts`):**
   - Bộ tổng hợp âm thanh nhịp tim đôi (*lub-dub heartbeat*) hoàn toàn bằng Web Audio API không tốn thêm bộ nhớ lưu tệp ngoài.
   - Khi Tinh Thần $< 45/100$ HOẶC có quái vật săn đuổi trong bán kính $220\text{px}$: nhịp tim tự động vang lên trầm ấm.
   - Nhịp độ (BPM) và âm lượng tăng dần tỷ lệ nghịch với Tinh Thần: từ $75\text{ BPM}$ lúc bắt đầu bất an (tại 45) lên $135\text{ BPM}$ dồn dập khi Tinh Thần $< 15$.
   - Khi Tinh Thần $< 20/100$: Tự động dìm âm nhạc nền (BGM Ducking $0.45\times$) và phát tiếng thở gấp ngắt quãng (`uneasyBreathing`), tạo cảm giác cô lập hoàn toàn giữa rừng sâu.
2. **Viền Ám Ảnh Động & Rung Chấn Tinh Vi (`UIScene.ts`, `GameScene.ts`):**
   - Lớp Viền Ám Ảnh (*Horror Vignette Overlay*) tối sẫm pha sắc đỏ thẫm đen ở 4 góc màn hình trên `UIScene`.
   - Độ đậm và nhịp co bóp đồng bộ trực tiếp với tần số tim đập lấy từ `AudioManager`. Tự động tan biến hoàn toàn khi Tinh Thần $> 45$ hoặc đứng trong vùng lửa trại của Sir Vaelen / Làng Bellhollow.
   - Khi Tinh Thần $< 15/100$: thêm rung vi mô (*micro-tremor 120ms, 0.0015 intensity*) cực nhẹ cho camera và hiển thị thông báo tâm lý: `"⚠️ Tâm trí đang rạn nứt... Hãy tìm ánh lửa ngay!"` (debounce 18s).
3. **Dọn dẹp tài nguyên & An toàn trạng thái:**
   - Đảm bảo ngắt nhịp tim và phục hồi BGM khi tạm dừng `[ESC]`, chết hoặc vào khu an toàn.

---

## 2. Chi Tiết Triển Khai Kỹ Thuật

### 2.1. Web Audio Dynamic Heartbeat & Sanity Ducking (`src/audio/AudioManager.ts`)
- **Bộ tổng hợp âm thanh nhịp tim kép (Dual-stage Lub-Dub Synthesizer):**
  - **Nhịp 1 (Lub):** Âm tần trầm ấm $56\text{ Hz} \rightarrow 70\text{ Hz}$ theo hệ số $t$, âm lượng gain từ $0.24$ lên $0.62$.
  - **Nhịp 2 (Dub):** Âm tần $44\text{ Hz} \rightarrow 56\text{ Hz}$ theo sau $140\text{ms} \rightarrow 110\text{ms}$ khi tim đập nhanh, gain từ $0.18$ lên $0.48$.
- **Công thức tính BPM & Interval động:**
  $$\text{effectiveComp} = \text{clamp}(\text{isMonsterNear} ? \min(\text{comp}, 30) : \text{comp}, 0, 45)$$
  $$t = \frac{45 - \text{effectiveComp}}{30} \quad (0 \le t \le 1)$$
  $$\text{BPM} = \text{round}(75 + t \times (135 - 75)) \quad (75 \rightarrow 135\text{ BPM})$$
  $$\text{IntervalMs} = \text{round}\left(\frac{60000}{\text{BPM}}\right) \quad (800\text{ms} \rightarrow 444\text{ms})$$
- **Hệ thống Dìm Âm Nhạc Nền (Sanity Ducking):**
  - Khi $\text{effectiveComp} < 20$: Tự động gọi `setSanityDucking(true)`, hạ âm lượng BGM xuống $45\%$ (`bgmVolume * 0.45`) qua `linearRampToValueAtTime`, dìm âm nền Ambience xuống $0.35\times$, đồng thời kích hoạt `playUneasyBreathing()`.
  - Khi $\text{effectiveComp} \ge 20$ hoặc vào vùng an toàn: Tự động hồi phục BGM về mức chuẩn $100\%$ và khôi phục Ambience.

### 2.2. Viền Ám Ảnh Động 4 Góc Màn Hình (`src/scenes/UIScene.ts`)
- **Tần số dao động đồng bộ nhịp tim:**
  $$\omega = \frac{\text{BPM} \times 2\pi}{60000} \text{ rad/ms}$$
  $$\text{pulseFactor} = (\max(0, \sin(\text{time} \times \omega)))^{1.8}$$
- **Vẽ 4 góc màn hình với 3 lớp Gradient hữu cơ:**
  - Kích thước góc: $\text{dynamicCorner} = \text{round}(75 + t \times 130 + \text{pulseFactor} \times (20 + t \times 25))\text{px}$ ($75\text{px} \rightarrow 275\text{px}$).
  - **Lớp 1 (Quầng đỏ thẫm ngoài rìa):** Màu `0x280712`, $\alpha = 0.18 + t \times 0.32 + \text{pulse} \times 0.14 \times t$.
  - **Lớp 2 (Khối bóng tối thẫm):** Màu `0x18030b`, kích thước $0.72\times$, $\alpha = 0.30 + t \times 0.40 + \text{pulse} \times 0.18 \times t$.
  - **Lớp 3 (Tâm điểm đen sâu thẳm):** Màu `0x0a0105`, kích thước $0.45\times$, $\alpha = 0.45 + t \times 0.45$.
- **Tự động xóa sạch:**
  Khi người chơi bước vào vùng an toàn Làng Bellhollow, đứng gần Lửa trại Sir Vaelen / Campfire hoặc khi Tinh Thần vượt lên trên 45/100, Graphics viền ám ảnh lập tức `clear()` và tắt hoàn toàn.

### 2.3. Cảm Biến Cự Ly Quái Vật & Rung Vi Mô Camera (`src/scenes/GameScene.ts`)
- **Phát hiện quái vật săn đuổi trong bán kính $220\text{px}$:**
  - Tích hợp kiểm tra đồng thời: The Listener (cự ly $220\text{px} - 260\text{px}$), Quái vật hoang dã (`wildlifeSystem.isMonsterNear(x, y, 220)` bao gồm Skull Wolves, Fallen Knights, Dread Horsemen, Hooded Knight Boss, Shadow Behemoth), Act 5 Chase và Boss Arena.
- **Rung vi mô Camera (Micro-tremor):**
  - Khi Tinh Thần $< 15/100$ ngoài khu an toàn: Camera rung cực nhẹ `this.cameraSystem.shake(120, 0.0015)` đồng bộ theo từng nhịp tim đập.
  - Hiển thị thông báo tâm lý hoảng loạn: `"⚠️ Tâm trí đang rạn nứt... Hãy tìm ánh lửa ngay!"` có debounce $18\text{s}$.
- **Dọn dẹp trạng thái hoàn hảo:**
  - Khi mở Pause Menu `[ESC]`: Gọi `this.audioManager.setHeartbeatActive(false)`.
  - Khi Game Over: Gọi `this.audioManager.setHeartbeatActive(false)` và `this.audioManager.setSanityDucking(false)`.

---

## 3. Kết Quả Kiểm Thử

### 3.1. Bộ Test Tự Động `test_v15_58c_heartbeat_vignette_panic.mjs`
Chạy lệnh: `node scripts/test_v15_58c_heartbeat_vignette_panic.mjs`
```
=== [V15-58C] BẮT ĐẦU KIỂM THỬ NHỊP TIM ĐỘNG, VIỀN ÁM ẢNH & HOẢNG LOẠN ===
✔ [1/4] AudioManager.ts: Bộ tổng hợp nhịp tim kép Web Audio động (75..135 BPM, 800..444ms), BGM Ducking 0.45x và tiếng thở gấp < 20/100 chuẩn xác.
✔ [2/4] UIScene.ts: Viền Ám Ảnh (Horror Vignette Overlay) 4 góc đồng bộ nhịp tim Web Audio, tự tắt khi an toàn và cảnh báo hoảng loạn.
✔ [3/4] GameScene.ts: Cảm biến quái vật 220px, micro-tremor camera 120ms/0.0015, debounce cảnh báo 18s và dọn dẹp âm thanh khi pause/chết.
✔ [4/4] SurvivalSystem.ts & WildlifeSystem.ts: Bổ sung các phương thức kiểm tra trạng thái bất an/nguy cấp và cảm biến cự ly quái vật.

============================================================
🎉 TOÀN BỘ 4 HẠNG MỤC TEST BƯỚC V15-58C ĐÃ ĐẠT 100%!
============================================================
```

### 3.2. Kiểm Tra Hồi Quy (Regression Tests)
- `test_v15_58a_hallucinations_and_apparitions.mjs`: 100% PASSED.
- `test_v15_58b_whisper_trap_and_light_dilemma.mjs`: 100% PASSED.
- `test_v15_57_check_passages.mjs`: 100% PASSED.

### 3.3. Kiểm Tra Biên Dịch & Đóng Gói Production
- `npx tsc --noEmit`: **0 errors**.
- `npm run build`: Hoàn thành xuất sắc trong **10.36 giây**, đóng gói sạch sẽ thư mục `dist/`.

---

## 4. Danh Sách Tệp Đã Chỉnh Sửa / Tạo Mới

| Tệp tin | Hành động | Mô tả |
| :--- | :--- | :--- |
| `src/audio/AudioManager.ts` | Cập nhật | Bổ sung `updateDynamicHeartbeat`, `setSanityDucking`, `getHeartbeatBpm`, `getCurrentHeartbeatGain`, bộ tổng hợp lub-dub động 75..135 BPM. |
| `src/scenes/UIScene.ts` | Cập nhật | Cập nhật `updatePanicVignette` 4 góc màn hình đồng bộ nhịp tim Web Audio, tích hợp `CampSanctuarySystem`, cảnh báo hoảng loạn. |
| `src/scenes/GameScene.ts` | Cập nhật | Tích hợp cảm biến quái vật 220px, micro-tremor camera 120ms/0.0015 khi $< 15$, debounce cảnh báo 18s, dọn dẹp âm thanh khi pause/chết. |
| `src/systems/SurvivalSystem.ts` | Cập nhật | Thêm các helper `isSanityPanic()`, `isSanityCritical()`. |
| `src/systems/WildlifeSystem.ts` | Cập nhật | Thêm phương thức `isMonsterNear(x, y, radius = 220)`. |
| `scripts/test_v15_58c_heartbeat_vignette_panic.mjs` | Tạo mới | Bộ kiểm thử tự động 4 hạng mục cho V15-58C. |
| `Read/V1.5/Reports/58C_Dynamic_Heartbeat_And_Horror_Vignette.md` | Tạo mới | Báo cáo chi tiết kỹ thuật bước V15-58C. |
