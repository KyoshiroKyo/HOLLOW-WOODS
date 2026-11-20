# HOLLOW WOODS V1.5.3 — 04B2 — Đại tu đồ họa môi trường, cây/collision, nhà, trại và bố trí Bellhollow

**R10 SPLIT | Lệnh 4/11 | ACTIVE GROUP: 04B2 ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04B2_WORLD_ART_LAYOUT_REPORT.md`.
- Mã thực thi: `V153-BATCH-04B2 EXECUTE REMAINING ONLY`.
- Không thực hiện mã khác hoặc tự tăng version.

## Quy tắc chung — áp dụng cho duy nhất batch trong file này

- HOLLOW WOODS — THE FOG THAT REMEMBERS V1.5.3. Repository: https://github.com/KyoshiroKyo/HOLLOW-WOODS. Codex Cloud `/workspace/HOLLOW-WOODS`; không giả định truy cập được ổ G:. Stack theo lockfile thực: Phaser 4.2.1, TypeScript Strict, Vite 5.4, P2Game SDK v1.1. Model do Owner chọn trong UI; không tự đổi.
- Đọc `AGENTS.md`, `Read/AGENTS.md`, `Read/AI_IRON_RULES.md`, `docs/FOLDER_STRUCTURE_RULES.md` và checkpoint mới nhất; nếu thiếu file thì ghi rõ. Không ghi đè luật; giữ lịch sử. Đọc manifest/registry/source thuộc phạm vi, không quét lại toàn bộ source ở mỗi batch. Không cần nhận lại R1–R9.
- Xác minh Git status, branch, HEAD, worktree, diff và checkpoint trước khi sửa. Batch 03-R2 QA `qa/v1.5.3-batch03-r2` @ `0ceffa5`, Draft PR #1, main lịch sử `b5eaa61` chỉ là mốc tham chiếu; không giả định là HEAD mới nhất. Khôi phục phần 04A chưa push từ task cũ trước khi chuyển chat. Không reset/clean/force push, không ghi đè nhánh QA cũ, không merge main/publish. Chỉ push nhánh phát triển/QA đã được Owner duyệt, kiểm tra secret/license/kích thước và xác minh remote SHA; nếu thiếu quyền, báo BLOCKED, không giả thành công.
- Lọc việc: `OPEN / PARTIAL / REOPENED` mới đưa vào danh sách sửa; `CLOSED-VERIFIED` bỏ khỏi hàng chờ, giữ trong ledger chỉ để truy vết/hồi quy khi liên quan; `BLOCKED` ghi điều kiện khôi phục và tiếp tục phần độc lập. Đối chiếu bằng chứng với HEAD, test ngắn nếu cần. Không suy diễn PASS từ log cũ, không lặp công việc đã đạt. Không sửa lỗi đã đóng chỉ vì có trong đặc tả dưới đây. Nếu tái xuất hiện, ghi SHA/bước tái hiện và mở lại đúng mã. Không thực hiện task thuộc file batch khác.
- Không chạy lại Batch 02/03, không trích lại nguồn/frame hoặc vẽ lại reference/portrait đã đạt, không lặp migration BlackKnightPlayer, không viết lại Save schema 3, SDK, HUD Running, avatar/cover/menu GIF đã đạt. Các lỗi mới liên quan vẫn phải sửa nếu xác minh được. `satyr_sheet` alias hợp lệ không bắt buộc đổi tên; missing frame phải chữa nguyên nhân.
- Bảo toàn Black Knight / The Mossbound Wayfarer, Fellor và license, UI Pack, Dark Woodland Pixel Art, Dark Moss & Ember Gold (#141712, #1F241B, #C8963E, #E09F3E, chữ #E8DFC8/#C8CFC2), Hybrid Open World C, các zone/quest/safe-zone/return route theo thiết kế. Giữ Vòng Sáng [F], Tinh Thần, Hương Trầm Tinh Thần, F9 cho QA, Game ID, leaderboard, Save schema 3/legacy IDs, renderType tường minh và SDK v1.1. Không thêm mini-map (World Map và La Bàn hiện có được sửa).
- Asset thật từ kho được cấp phép: không vẽ nhân vật/cây/nhà bằng code, không dùng artwork hình khối AG2.0, không ghi đè nguồn Fellor. Graphics chỉ dành cho debug, ánh sáng, sương, bóng, UI tối giản hợp lệ. Python chỉ xử lý/crop/pack/validate ảnh, không dựng hình nhân vật giả. Pixel art nearest/pivot đúng, không frame rỗng, không missing frame/404 ở ca đã test. Không lấy Internet hay tự upload audio/archive nguồn nặng khi chưa được duyệt. Nếu thiếu asset: ghi đường dẫn, tác động, MISSING_FROM_CLOUD/BLOCKED, tiếp tục việc độc lập.
- Giữ import Phaser tường minh theo luật; đọc đoạn liên quan ở file lớn; không tạo file rác ở root; không commit dist/node_modules/Backups/Save thật/token/asset không có quyền. Kiểm tra WebAudio/listener/timer/tween cleanup, tránh update thừa. Không tuyên bố 60 FPS nếu chưa đo. Không sửa test/assertion để báo xanh.
- Chơi thử runtime bằng Chromium với input thật, không chỉ chạy TypeScript hoặc teleport. Dùng mock SDK/profile QA cách ly cho Dev, không dùng leaderboard/save thật. Không bắt tester xem lại màn hình chớp gây đau mắt; ưu tiên kiểm tra log và ngăn nhấp nháy. Không bịa screenshot/test. Production local khác hosted P2Game; không publish. Nếu quota sắp hết, lưu checkpoint, không retry liên tục hoặc vượt hạn mức.
- Mặc định một batch/lượt, từng command tuần tự; dừng sau khi báo cáo. Không tự chạy batch tiếp theo. Khi chuyển chat, chỉ dùng nhánh/SHA chứa checkpoint đã xác minh hoặc patch bàn giao an toàn. Nếu mất worktree, dừng phần phụ thuộc, không tái tạo mù quáng.

## Chỉ dẫn phạm vi riêng

Nâng cấp hình ảnh thật, không chỉ fix bug. Chụp trước/sau cùng vị trí, zoom, thời điểm. Ưu tiên asset thật, tạo tuyến dễ đi, đồng bộ độ sâu và va chạm. Finn tại (909,231); nhà/Garth chưa có tọa độ cụ thể, chọn theo dữ liệu và báo lý do; bỏ đúng đèn dư và đúng 2 bụi Edda theo ảnh/ID. Nếu không xác định được 2 bụi, báo BLOCKED, không xóa bừa. Giữ trigger/quest/Save. Không coi khu camp Bellhollow và Outer Woods là một.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-05 — Trees, rocks, moss & vegetation (04B) — CLOUD-FIX-02/02A

Kiểm kê đồ họa thật từ các pack đã có: Resurrected RPG, Updated-Trees, Forest-Asset-Pack, Pixel Art Top Down Basic, Fan-tasy Tileset, Shadow series nếu hiện diện và được phép dùng. Đồng nhất kích thước, density, màu sắc, anchor chân cây; không đổi nét nguồn. Collider chỉ theo footprint hợp lý; cành/tán che hình nhưng không chặn toàn bộ sprite, bụi có thể đi qua nếu game thiết kế như vậy. Bỏ collider trùng/ghost chỉ khi chứng minh. Chạy đường vòng cả hai phía từng vật thể đại diện, kiểm tra lối hẹp, đường chính, exit; kiểm tra khi chạy và sau reload. Y-sort thân/tán, bóng và foreground; kiểm soát culling. Không thay asset bằng hình giả.

### B04-05A — Danh mục nguồn asset Owner từng chỉ định (kiểm kê / sử dụng nếu có sẵn và hợp lệ)

Đối chiếu tên thật, thư mục, license và trạng thái có mặt trên Cloud: `Resurrected RPG 1.1.rar`, `Updated-Trees.zip`, `Forest-Asset-Pack.zip`, `Pixel Art Top Down - Basic v1.2.3.zip`, `The Fan-tasy Tileset (Free) 1.5.9.zip`, `N3XUS-Starter-FREE-v1.1.zip`, `goblin_scout_v5_silhouette_free.zip`, Shadow series, UI Pack, Black Knight và các audio nguồn đã duyệt. Phân loại nguồn environment/character/monster/UI/audio, file được chọn, mapping runtime và lý do. N3XUS/goblin/Shadow theo B04-08, không dùng nhầm làm terrain. Nếu tài nguyên thiếu trên GitHub, không giả định đã có ở G:; ghi thiếu và xử lý phần độc lập. Ưu tiên thay nền/đường/prop giả hiện có bằng asset thật nếu tương thích; bảo toàn chức năng. Không tự mở rộng bản đồ/cốt truyện ngoài phạm vi sửa và nâng cấp đã duyệt; ghi đề xuất sau nếu cần.

## B04-06 — Buildings, props & collision integrity (04B) — CLOUD-FIX-03

Kiểm tra nhà, hàng rào, cầu, giếng, bàn chế tạo, bàn thuốc, cổng, đền, công trình bỏ hoang. Footprint đúng với vị trí world, scale, origin, body offset; sau cập nhật static body hoặc load lại không được về 32×32. Giữ lối cửa, điểm tương tác, vùng quanh NPC và đồ trang trí. Không xóa collision hàng loạt để hết lỗi. Kiểm tra depth khi đi phía trước/sau; tránh NPC/item lọt vào nhà hoặc tán cây. Chơi thử mỗi lối vào ra với phím thật và F9 chỉ dùng chẩn đoán.

### B04-06 — Tester regression: Outer Woods / Sir Vaelen camp & Hunter Camp

Ảnh tester xác nhận HUD hiện Outer Woods; quanh Sir Vaelen có hai bếp lửa, một lều, nhà mái vàng, rương, bụi ẩn nấp, vật phẩm và nhiều vùng tương tác gần nhau. Đừng nhầm với Sanctuary Camp Hub ở Bellhollow; kiểm tra cả hai nhưng phân biệt ID/zone. Dùng F9 Object Picker xác minh từng fire/trigger/collider, chức năng Bếp Lửa Thợ Săn và Trạm Lửa Sir Vaelen, safe-zone, hồi phục, ánh sáng và nhiệm vụ trước khi thay đổi. Nếu hai bếp trùng logic/spawn thì bỏ phần trùng có bằng chứng, giữ ID và tiến trình; nếu hai bếp khác chức năng thì giữ đúng chức năng và bố trí lại thành khu rõ ràng, không tự thêm hệ nấu ăn hoặc xóa bếp nhiệm vụ. Giữ lều và rương nếu đúng thiết kế, tạo lối đi thông thoáng đến NPC và lối ra, dời bụi/cây/props khỏi đường, dùng asset thật, không thay bằng Graphics. Sửa collider vô hình, vùng tương tác chồng gây prompt sai ưu tiên, depth và bóng. Kiểm tra E tại từng điểm, quay về, save/reload, không nhân đôi hồi phục hoặc thông báo lửa trại. Lưu ảnh bình thường và F9 trước/sau, ghi ID và route thực.

### B04-06A — BUG-034: nhà thợ rèn Bellhollow

- Xác minh NPC thợ rèn, building ID, vị trí, texture/tileset thực tế và cổng tương tác trong repository (không đoán tên NPC từ ảnh). Ảnh có mái xanh, tường đá, hai mảng xám lớn, cửa có khung xanh, lò lửa, biển hiệu và NPC lớn đứng trước. Kiểm tra từng thành phần bị thiếu texture, fallback vẽ hình học, sai crop/frame, scale, origin, depth hoặc palette; không khẳng định nguyên nhân khi chưa xem registry.
- Thiết kế lại nhà thợ rèn bằng asset Pixel Art thật sẵn có: mái/tường/cửa/sổ liền mạch, biển hiệu, lò rèn, đe, vật liệu gọn; lối vào dễ đọc, NPC có chỗ đứng, không chồng đạo cụ lên đường. Giữ cá tính thợ rèn, cân tỷ lệ NPC/công trình với các nhà trong làng dựa trên sprite gốc; không thay nhân vật bằng asset ngẫu nhiên. Không dựng nhà bằng Graphics hoặc hình hộp, không ghi đè artwork tác giả. Nếu thiếu asset hợp pháp, ghi BLOCKED artwork và sửa phần bố cục/collider độc lập.
- Kiểm tra collider chân tường/nhà/đạo cụ, không chắn lối đi trước cửa/bàn rèn, Y-sorting theo chân, player có thể đi vòng và tương tác [E] từ vị trí đúng. Đồng bộ ánh sáng lò rèn với vị trí thật, không tràn vô lý. Bảo toàn NPC ID, trigger, nhiệm vụ, recipe, kho đồ, phần thưởng. Không tạo chức năng rèn mới ngoài phạm vi chỉ để sửa hình ảnh.
- Acceptance: ảnh trước/sau ngày và đêm, đi vòng nhà cả hai phía, mở/đóng tương tác NPC/bàn rèn, kiểm tra trigger và collider bằng F9 rồi tắt F9; xác minh lại Save/Continue và quest nếu liên quan. Mở rộng kiểm tra cùng loại lỗi sang các nhà khác trong Bellhollow.

### B04-06B — R8: Bellhollow south path, Garth relocation, Finn, camp lighting & Edda (BUG-044..050)

**Phạm vi chính:** chỉnh bố trí thật trong dữ liệu map Bellhollow, không chỉ thay screenshot. Đây là nhóm sửa tiếp của 04B, sau khi 04A được nghiệm thu. Không chạy lại 04A nếu đã PASS có checkpoint. Không tùy tiện thêm map/NPC/công trình mới. B04-07C xử lý logic tương tác và lịch NPC còn thiếu; không tạo hai bản sửa chồng lên nhau.

**B04-06B-01 — Lối Nam và tấm biển (BUG-044)**

- Tìm đúng zone `bellhollow` và đối tượng có nhãn `[E] Xem Biển Lối Nam` dựa trên data/ID thực. Ảnh Owner cho thấy cạnh nhà Neris/đường xuống phía nam có hai mảng chữ nhật nâu giống biển, biển gỗ ở phía dưới bên trái, vòng chọn nằm giữa đường và nhãn cách vị trí biển; xác minh các thành phần này là gì trước khi xóa/sửa. Không mặc định hình chữ nhật là collision hoặc asset lỗi nếu chưa điều tra.
- Chỉnh đường nối quảng trường/nhà Neris với lối Nam (và các tuyến lân cận) bằng tileset thật, nối liền mép, đủ rộng cho nhân vật đi bộ/chạy theo footprint thực, không để cây, bảng, hàng rào hoặc vùng vô hình chặn. Không đổi cờ khóa vùng, điểm đến hoặc quest.
- Dùng đúng sprite signpost sẵn có, đặt sát lề đường tại điểm rẽ hợp lý, không chắn giữa đường. Chỉnh hướng chỉ dẫn dựa trên topology đã xác minh. Đảm bảo ID biển, hình, bóng, body (nếu có), trigger, điểm tương tác, highlight, text và label cùng world transform. Bỏ phần hiển thị trùng chỉ khi có bằng chứng duplicate. Một đối tượng chỉ có một dấu hiệu tương tác chủ động.
- QA: đứng ở trước/sau/hai bên biển, đi ra vào vùng E, đọc biển rồi thoát, chạy xuyên đường hai chiều với noclip OFF; đối chiếu vị trí chỉ dẫn với World Map [N]. Ảnh trước/sau, debug và không debug, lưu ID/tọa độ thật.

**B04-06B-02 — Di chuyển Garth và căn nhà (BUG-045)**

- Owner yêu cầu di chuyển cả NPC Garth lẫn căn nhà liên quan ở đầu làng. Xác định building ID thực, vị trí nhà/cửa, NPC spawn/home/patrol, tuyến Fog Crossing → Bellhollow, bảng chỉ đường, quest trigger, ánh sáng và các vật thể phụ liên kết. Không mặc định nhà nào thuộc Garth nếu dữ liệu cho thấy khác; nếu mâu thuẫn chỉ rõ cho Owner.
- Đề xuất một bố trí dễ đi: căn nhà nằm lùi khỏi trục đường vào làng, mặt cửa hướng lối tiếp cận phù hợp với sprite; Garth đứng cạnh cửa/cạnh đường như người gác cổng, không chắn điểm spawn, cổng, đường chính hoặc điểm tương tác khác. Chọn vị trí world cụ thể từ terrain, collider và topology; Owner chưa cho tọa độ nhà/Garth, Codex được chọn vị trí hợp lý và ghi rõ trước/sau trong báo cáo. Không tự dịch cả bản đồ, không đổi kết nối vùng.
- Di chuyển đồng bộ toàn bộ tổ hợp nhà: sprite/tile layers, body/footprint, mái/foreground, cửa, biển, đèn/bóng, interaction/trigger và dữ liệu spawn/patrol của Garth. Không để collider/trigger ở tọa độ cũ hoặc 2 Garth/2 nhà. Giữ ID, chức năng, lời thoại và quest flags. Nếu có Save lưu tọa độ Garth hoặc player trong nhà cũ, xác minh đường phục hồi hợp lệ mà không reset tiến trình; kiểm tra New Game và Continue riêng.
- QA: tiếp cận Garth từ lối vào làng và từ quảng trường, tương tác đúng, camera không quay/giật, không trigger chuyển vùng lặp, không kẹt ở cửa, đi vòng nhà hai phía, lưu/nạp/chuyển vùng quay lại. Ghi tọa độ nhà/Garth cũ và mới cùng asset key, ảnh F9 trước/sau.

**B04-06B-03 — Finn tại (909, 231) (BUG-046)**

- Đây là tọa độ Owner yêu cầu, không phải tọa độ gợi ý. Đặt Finn (Cậu Bé Đưa Tin) tại world X=909, Y=231 của Bellhollow, theo hệ tọa độ gameplay/điểm neo chân đang dùng. Không nhầm screen pixels, tile indices, camera scroll hoặc offset chunk. Xác minh quy ước spawn/anchor thật và, nếu cần, đổi tọa độ nội bộ để điểm chân thế giới đúng yêu cầu.
- Kiểm tra nơi đó không có collider, đường chính không bị chặn, bảng tin, cột đèn, nhà, item, trigger khác không chồng lên Finn. Nếu vị trí bận vì prop trang trí, ưu tiên bố trí lại prop trong phạm vi quyền đã duyệt. Nếu tọa độ thật nằm ngoài map hoặc xung đột quan trọng không thể sửa an toàn, ghi BLOCKED kèm ảnh/tọa độ; không tự chọn tọa độ khác thay Owner.
- Cập nhật duy nhất spawn/home hợp lệ, đường patrol (nếu có) phù hợp vị trí mới, collider/nameplate/quest marker và điểm tương tác. Không tạo Finn bản sao hoặc di chuyển bảng tin theo NPC nếu chúng là đối tượng độc lập. Bảo toàn NPC ID, các thư, phần thưởng, tiến trình đã hoàn thành, lịch NPC hợp lệ. Phân biệt vị trí home/spawn đúng (909,231) với vị trí lúc đang đi tuần; không khóa NPC đứng bất động nếu thiết kế có lịch di chuyển.
- QA: F9 Object Picker xác nhận đúng world tọa độ khi spawn, kiểm tra New Game, Continue và sau rời/quay lại Bellhollow. Trò chuyện, đọc bảng tin cạnh đó nếu phù hợp, không hiển thị hai prompt cạnh tranh, không mất/nhận thưởng trùng. Noclip OFF khi thử đường.

**B04-06B-04 — Khu lều/bếp/rương: bỏ đèn thừa (BUG-047)**

- Ảnh khu quảng trường Bellhollow có lều, rương, giếng/ao, nấm, bếp lửa và cột đèn gần bếp; Owner yêu cầu nơi đã có bếp lửa thì không cần đèn thừa. Xác minh đúng đối tượng lamp cạnh bếp bằng Object Picker/asset ID và vị trí, phân biệt đèn có chức năng nhiệm vụ/điểm dẫn lối với đèn trang trí. Bỏ cột đèn trang trí thừa cạnh bếp ở cụm được chỉ định; không xóa hàng loạt đèn trong làng hoặc rừng.
- Dọn đồng bộ sprite, light emitter, shadow, particle, collider, trigger và timer của đèn đã bỏ. Giữ bếp lửa, vùng hồi phục/ánh sáng, lều trú ẩn, rương, giếng và nội dung nhiệm vụ có chức năng riêng. Sắp lối tiếp cận lều/rương không bị trùng prompt; không di chuyển rương nhiệm vụ một cách mù quáng. Kiểm tra cả camp Outer Woods có hai bếp/1 lều theo B04-06; không coi hai khu vực là một.
- Không nhầm bỏ bếp lửa ở Main Menu (B04-13B) với bỏ bếp gameplay. QA ngày/đêm/sương, E nghỉ tại lều, E nạp củi/bếp, mở rương; kiểm tra ánh sáng không còn emitter mồ côi, không còn collider vô hình, không hồi phục hay thông báo hai lần, Save/Continue đúng. Nếu đèn có thiết kế bắt buộc, báo blocker thay vì xóa nhiệm vụ.

**B04-06B-05 — Xóa đúng hai bụi cây ở nhà bà Edda (BUG-048)**

- Tìm khu nhà Edda, vị trí NPC và đúng hai bụi được Owner chỉ ra. Ảnh cho thấy player ở gần bụi/cạnh đường, nhà Edda với vùng collider màu đỏ ở phía trước. Không đoán ID/tọa độ chính xác từ ảnh cắt; dùng Object Picker/registry map để nhận dạng hai bụi gần khu nhà Edda ảnh hưởng lối đi. Nếu còn nhiều ứng viên không phân biệt được, ghi ảnh và các ID để Owner chọn, không xóa bừa nhiều cây.
- Bỏ đúng hai instance bụi đó trong dữ liệu map; không xóa texture gốc đang dùng nơi khác. Dọn collider/trigger ẩn nấp/interaction/shadow/depth/culling/spawn data dư tương ứng, nếu bụi có quest/safe spot bắt buộc thì xử lý phụ thuộc hoặc báo blocker. Lấp nền bằng terrain thật để không tạo khoảng đen/ô trống, mở đường trước nhà Edda. Không ảnh hưởng bụi rậm hợp lệ ở vùng khác.
- QA: đi ngang/dọc qua chỗ cũ cả hai hướng bằng phím, thử tương tác Edda, F9 xác nhận không có body treo, quay lại map sau reload. Báo ID hai bụi, ảnh trước/sau, kết quả không có collider vô hình.

**B04-06B-06 — Vòng tương tác lệch, vật thể không nhìn thấy (BUG-049/050)**

- Soi các điểm trong ảnh: biển Lối Nam, Gỗ Khô (x1), Lều Trú Ẩn, Bếp Lửa, Hốc Sồi Ngàn Năm. F9 tại Bellhollow (863,322) là tọa độ player trong một ảnh bếp, không phải tọa độ bếp/sồi. Không suy luận vùng highlight sai chỉ vì vòng tròn minh họa khác collider; đối chiếu phạm vi logic từng đối tượng với hình và vị trí thực.
- Hốc Sồi Ngàn Năm: xác minh có entity/quest/interactable hợp lệ, đúng zone, sprite key/frame tồn tại, visibility/alpha, depth, culling, origin, body, registry và spawn. Nếu cây sồi đáng lẽ xuất hiện mà bị mất, khôi phục bằng asset thật có sẵn đúng bối cảnh; không tạo một collider/trigger giả, không xóa manh mối/câu đố. Nếu Hốc Sồi cố ý ẩn, giữ cơ chế hợp lệ, cho tín hiệu theo thiết kế và báo rõ. Nếu cần sửa logic nhiệm vụ, chuyển B04-07C/09, không sửa lặp ở 04B.
- Sửa transform world/local, origin/pivot, scale, target position, vùng tương tác và highlight theo dữ liệu, không chỉnh bằng offset tùy ý cho từng screenshot. Kiểm tra tương tự toàn map để phát hiện instance ẩn, asset thiếu, prompt còn sót sau despawn.
- Acceptance B04-06B: lập bảng `zone | entity ID | asset | old world x/y | new world x/y | body/trigger | quest/save impact | QA`; ảnh trước/sau 5 vị trí trọng điểm, bình thường và F9; kết quả điều hướng thực không noclip; cập nhật bug registry và checkpoint. Không tuyên bố layout đạt nếu chỉ thay vị trí hình nhưng vùng tương tác/vật lý chưa khớp.

## Báo cáo bắt buộc sau khi sửa (để Owner gửi ChatGPT đánh giá)

Sau mỗi command, cập nhật `Read/V1.5/Reports/V153_BATCH_04_CHECKPOINT.md` và registry `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md` (hoặc đường dẫn hợp lệ theo quy chuẩn repo). Cuối batch tạo báo cáo riêng theo tên ở đầu file; cập nhật README_INDEX và báo cáo tổng hợp. Không chỉ trả một câu PASS.

Báo cáo phải chứa:
1. Nhánh, SHA đầu/cuối, worktree, môi trường, diff summary, remote SHA/PR nếu thực sự bàn giao; xác nhận main/QA cũ không bị ghi đè.
2. Bảng từng mã task/BUG: trạng thái trước → sau, bước tái hiện, nguyên nhân đã xác minh hoặc chưa tái hiện, sửa gì, file/dòng liên quan, build/SHA kiểm chứng. Phân biệt CLOSED-VERIFIED, PARTIAL, BLOCKED, FAIL, NOT TESTED, REOPENED; ghi rõ các mục đã bỏ qua do đã đóng và lý do. Không biến NOT TESTED thành PASS.
3. Danh sách file thêm/sửa/xóa, tài nguyên thật sử dụng, đường dẫn/texture/metadata/runtime mapping nếu có, ảnh trước/sau hoặc log/evidence và tác động đến Save/quest/SDK. Với map: entity ID, tọa độ cũ/mới, collider và route; với nhân vật: số frame/hướng, asset nào thực sự xuất hiện trong game, ma trận còn thiếu; với UI: input/focus/resolution; với audio/performance: số liệu đo và điều kiện test phù hợp.
4. Lệnh test thực chạy, kết quả (pass/total, exit code, console/network), ca runtime New Game/Continue hoặc fixture đúng phạm vi. Ghi `LOCAL PASS`, `PRODUCTION LOCAL PASS`, `HOSTED PASS` hoặc `HOSTED BLOCKED` tách biệt. TypeScript `npx tsc --noEmit` và `git diff --check`, targeted QA cuối batch; full suite ở 04F. Không suy diễn tester thực tế đã chơi.
5. Lỗi chưa xong, tài nguyên còn thiếu, rủi ro, quyết định chưa được Owner xác nhận, bước tiếp theo cụ thể hoặc BLOCKED, gate phát hành (vẫn BLOCKED nếu thiếu điều kiện bắt buộc). Checkpoint phải ghi rõ command đầu tiên chưa xong, đủ để mở chat mới khi đã bàn giao an toàn.
6. Cuối phản hồi chat Codex, gửi nguyên bản tóm tắt đủ các mục 1–5 cùng link/path báo cáo, ảnh và hướng dẫn lấy file để Owner gửi cho ChatGPT. Không tuyên bố ChatGPT tự nhận báo cáo. Nếu báo cáo quá dài, gửi file .md và summary trong chat.

**STOP:** kết thúc đúng batch này; nếu công việc đã CLOSED-VERIFIED toàn bộ, trả báo cáo SKIPPED (kèm chứng cứ), không sửa lại. Nếu quota/blocker, checkpoint và dừng an toàn. Không tự chuyển batch.
