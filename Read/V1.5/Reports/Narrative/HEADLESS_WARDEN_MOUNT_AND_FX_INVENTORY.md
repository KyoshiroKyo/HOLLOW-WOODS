# HW-NR-14-R1 — HEADLESS WARDEN MOUNT, KNIGHT, UNDEAD & MAGICAL FX INVENTORY

- **Mission ID:** `HW-NR-14-R1 — HEADLESS WARDEN ASSET-BASED QUALITY REVIEW`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Scope:** Kiểm kê toàn bộ tài nguyên **Knight, Horseman, Mount/Horse, Cavalry, Spectral/Undead Knight, Magical FX & 3D Models** hiện có trong `HOLLOW_WOODS_EXPORT` (và đối chiếu bảo vệ `public/assets/characters/enemies/dread_horseman_sheet.png`).

---

## 1. Tài Nguyên Chiến Mã, Kỵ Binh & Thú Cưỡi (`Mount / Horse / Cavalry`)

| # | Tên Gói / Asset | Đường Dẫn Trên Đĩa | Góc Nhìn & Thông Số | Bản Quyền (`License`) | Khả Năng Dùng Cho `The Headless Warden` |
|---:|---|---|---|---|---|
| 1 | **`Dread Horseman` (`Runtime Protected Enemy`)** | `public/assets/characters/enemies/dread_horseman_sheet.png` (`448×384`) | Side-View `64×64` (`vis_h = 41–56 px`) | Đang dùng trong runtime | **PROTECTED — TUYỆT ĐỐI KHÔNG ĐỔI TÊN / GHI ĐÈ.** Chỉ dùng đối chiếu tỷ lệ & kỹ thuật (`§4`). |
| 2 | **`PixelHorse_V1.0` (`Horse Black I & II`, `HorseRider I & II`)** | `Pixel_Art/Monsters/Wildlife/PixelHorse/PixelHorse_V1.0/` + `Rar/Monsters/PixelHorse_V1.0.rar` | Side-View `64×64` (`Idle`, `Run`, `Stop`, `Raise`, `MountOn/Off`, `Leash`) | **NO LICENSE FILE IN ARCHIVE** (`MAKING YOUR OWN HORSE RIDER.txt` dẫn link ngoài) | **KHÔNG DÙNG** — Đây chính là asset gốc của `Dread Horseman`, dùng lại sẽ trùng silhouette kẻ địch hiện hành; thiếu góc Top-Down 4 hướng & thiếu license offline. |
| 3 | **`N3XUS Black Panther + Riders`** | `Pixel_Art/Rar/Characters/N3XUS-Starter-FREE-v1.1.zip` (`mounts/black-panther/`) | Top-Down `64×64` 4 hướng (`walk, gallop, idle, roar`) | **VERIFIED OK** (Credit `"Art by N3XUS - n3xus.dev"`) | **LOẠI** — Thú cưỡi là **báo đen (`panther`)**, tỷ lệ chibi hoạt hình; không phải chiến mã giáp nặng Dark Fantasy. |
| 4 | **`Mattz Art — Headless Horseman`** (`ASSET-K11` ref) | Không có file gốc trong kho (bị cấm ở `ART-K01`) | `80×80` trả phí | Thương mại trả phí (chưa mua) | **CẤM / KHÔNG CÓ FILE** — Không rip/trace. |

---

## 2. Tài Nguyên Kỵ Sĩ, Thực Thể Bóng Tối & Undead (`Knight / Spectral / Undead`)

| # | Tên Gói / Asset | Đường Dẫn & Bản Quyền | Góc Nhìn & Đặc Điểm | Đánh Giá Khi Ghép Hoặc Dùng Lại |
|---:|---|---|---|---|
| 1 | **`Heavy_Knight_Free`** | `Pixel_Art/Characters/Knights/Heavy_Knight_Free/` · **Lic OK (`Art by Jahnu`)** | Side-View (`208×112`, `vis=45×60 px`), đứng bộ hành | Chỉ có tư thế đứng bộ hành, **không có dáng cưỡi ngựa** & chỉ có `1` hướng ngang; có đầu đội mũ trụ. |
| 2 | **`Lantern_Knight`** (`DarkFantasy_FREE_Starter`) | `14_New_Downloaded_Packs/.../Lantern_Knight/` · **Lic OK + AI Note** | Top-Down `3/4` chỉ có **`down/`** (`128×128`) | Tư thế đứng thẳng cầm đèn, thiếu `up/left/right`, không có bộ chân dạng cưỡi ngựa. |
| 3 | **`Maxime_Nourry_Knight` / `CraftPix Knight_1-3` / `2D_SL_Knight`** | Theo kiểm kê `NR-12-R3` · **Lic OK** | Side-View đứng bộ hành | Toàn bộ đều đứng đất, không khớp phối cảnh Top-Down `3/4` hay khung xương ngồi yên ngựa. |
| 4 | **`Undead executioner`** | `Pixel_Art/Rar/Monsters/Undead executioner.zip` · **NO LICENSE IN ZIP** | Side-View `100×100` (`idle`, `attacking`, `skill1`, `summon`, `death`) | Tử thần trùm đầu cầm lưỡi hái bay lơ lửng; không có chiến mã, không mặc giáp kỵ sĩ và thiếu file license. |
| 5 | **`SHADOW Series` (`Hooded Knight`, `Blind Huntress`, `Hallokin`, `Shadeflit`, `Wetlands Boss`)** | `Pixel_Art/Monsters/...` & `Rar/Monsters/Hooded Knight Sprites.zip` | `100×100` / `160×160` / `247×87` Top-Down/Side bosses | Phần lớn đã sử dụng cho `HoodedKnightBoss` & `MireWardenBoss`; **không có nhân vật vô diện hay chiến mã**. |
| 6 | **`Dark Fantasy Big Boss`** & **`ghost_sheet` / `shadow_big_boss`** | `Monsters/Bosses/Dark_Fantasy_Big_Boss/` & `public/assets/characters/monsters/` | `64×64` / `128×64` | Đang làm `ShadowBehemoth` / quái sương; không phải kỵ sĩ cưỡi ngựa. |
| 7 | **`BentoPack Dark Fantasy Knight` (`3D FBX`)** | `Pixel_Art/Rar/Characters/dark-fantasy-knight-free-knight.zip` · **Lic OK + AI Note** | 3D Rigged FBX `SK_Knight.fbx` (`517k` tris) + `SM_Knight_Longsword.fbx` | Chỉ có **model người đi bộ**, **KHÔNG có model 3D chiến mã**, không áo choàng đỏ rượu, và **Blender chưa cài** trên workstation. |
| 8 | **`PeacockKnightPackage.zip`** | `Pixel_Art/Rar/Characters/PeacockKnightPackage.zip` | UE4 compiled `.exe` + `.pak` + PDF | **NO LICENSE / NO SOURCE 3D** — Chỉ tham khảo, không sử dụng. |

---

## 3. Tài Nguyên Hiệu Ứng Phép Thuật (`Magical FX / Spectral Flame`)

| # | Tên Asset FX | Đường Dẫn | Bản Quyền | Hình Thức & Sự Phù Hợp Với *Linh Hỏa Xanh Bạc* |
|---:|---|---|---|---|
| 1 | **`GandalfHardcore character effects`** | `Pixel_Art/Rar/Effects/GandalfHardcore character effects.zip` | **Lic OK** (`Links.txt` / standard terms) | `24` dải sprite `400×64` (tim, sao, bọt máu, vệt buff nhỏ kiểu chibi arcade `buff_blue`). **Không phù hợp** làm linh hỏa hắc ám u sầu xanh-bạc cho Boss. |
| 2 | **`Hooded Knight Powerup FX`** | `Spritesheets/hooded knight powerup - effects.png` (`900×180`) | **NO LICENSE IN ZIP** | Vệt chém trắng/tụ khí nhỏ góc ngang của Hooded Knight, không phải ngọn lửa xanh bạc hay khói vó ngựa. |
| 3 | **`Meliodas Fire Wave / Flame Stream / Buff`** | `Meliodas_Blackwood/03_Sprites/` | Fellor Source / Codex V2 (Player Hero) | Lửa cam vàng đặc trưng riêng của nhân vật chính `Meliodas`, không nên dùng trùng cho Boss. |
| 4 | **`Ancient Ruins Atmospheric Particles / Resurrected Shadows`** | `14_New_Downloaded_Packs/.../atmospheric nature particles.png`, `PlantShadow.png` | Verified env packs | Hạt lá/đom đóm thiên nhiên và bóng đổ tĩnh (`oval`); không có FX chiến đấu hay hỏa khí xanh bạc. |

---

## 4. Ma Trận Phần Đã Có vs Phần Còn Thiếu So Với Thiết Kế Chuẩn (`Concept Sheet`)

| Thành Phần Theo Thiết Kế Owner (`ART-K01`) | Đã Có Trong `HOLLOW_WOODS_EXPORT`? | Tình Trạng Thực Tế |
|---|:---:|---|
| 1. **Kỵ sĩ vô diện mặc giáp tối khắc rễ cây đồng cổ** *(dáng cưỡi ngựa, Top-Down 4 hướng)* | **KHÔNG (`0%`)** | Chưa có asset pixel art hoặc model 3D nào ở tư thế kỵ sĩ không đầu cưỡi ngựa. |
| 2. **Áo choàng đỏ rượu 2 tà rách & tấm trùm ngựa thêu chỉ đồng** | **KHÔNG (`0%`)** | Chỉ có vải đỏ thẫm trên kỵ sĩ đi bộ `Heavy_Knight_Free` (góc ngang) hoặc mảng khối bị từ chối ở `HW-NR-14`. |
| 3. **Chiến mã ma thuật giáp đồng *chanfron*** *(tỉ lệ lớn `72–100 px`, `4` hướng)* | **KHÔNG (`0%`)** | Chỉ có `PixelHorse_V1.0` (`64×64` side-view đang làm `Dread Horseman`, thiếu license offline) & báo đen chibi N3XUS. |
| 4. **Linh hỏa xanh bạc** *(hốc cổ, bờm/đuôi/móng ngựa, vệt đại kiếm `Attack/Hurt/Death`)* | **KHÔNG (`0%`)** | Kho hiện chưa có bất kỳ bộ particle/flame FX màu `#E5F5EB → #8FD0AC → #3E6E5D` nào đạt tầm Dark Fantasy Boss. |
| 5. **Portrait `64×64` cận giáp vai hoa văn rễ + linh hỏa cổ** | **KHÔNG (`0%`)** | Bản `headless_warden_portrait_64x64.png` cũ là đồ họa khối đơn giản, đã bị loại theo `HW-NR-14-R1`. |
