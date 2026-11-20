# V153-F0-0 — Black Knight Frame Map

Nguồn là gói Black Knight v1.0 của Fellor. Master, 16 GIF xem trước và mô tả của tác giả đều có mặt trong Cloud. Gói có một spritesheet nguồn và không kèm bảng tọa độ hoặc metadata animation theo frame. Các số thứ tự Attack và Heavy Attack dưới đây dựa trên thứ tự ô và cách gộp trong GIF. Các nhãn kỹ năng lửa ở cuối tài liệu là tên nghiên cứu của dự án. [Master](<../../../Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png>) · [Preview_GIFs](<../../../Pixel_Art/Black Knight/Preview_GIFs/>) · [Read me.txt](<../../../Pixel_Art/Black Knight/Read me.txt>)

## Lưới và cách đối chiếu

- PNG RGBA **2592×1152 px**, **18 hàng × 18 cột**, **324 ô 144×64 px**. Viền màu đặc alpha 255 dày 1 px nằm trong mỗi ô. Khoảng cách giữa hai ô là 0 px, tạo hai dải viền kề nhau ở mỗi biên trong. Vùng nội dung `142×62 px` có nền alpha 0.
- `R01C01` là ô trên trái. Hàng và cột đánh số từ 1. Chỉ số `i` bắt đầu từ 0, đọc trái sang phải rồi xuống hàng. `i = (R − 1) × 18 + (C − 1)`. Góc trên trái trong tọa độ pixel từ 0 là `x = (C − 1) × 144` và `y = (R − 1) × 64`. Nội dung nằm ở offset `x = 1…142` và `y = 1…62`. Các khoảng ô trong tài liệu đều tính cả hai đầu.
- Mỗi ô được kiểm tra alpha ở phần nội dung. Đếm **34 dải màu liên tục** theo thứ tự đọc, sử dụng cả màu viền và động tác để xác định ranh giới. Nhiều màu tái sử dụng ở vị trí khác. Tổng này khớp 34 animation mà tác giả liệt kê. Một GIF có thể phát nhiều dải màu.
- Đã giải mã và đối chiếu toàn bộ **330 frame phát** trong 16 GIF. Phần ảnh GIF bỏ viền sau khi hạ 4× bằng nearest-neighbor tương ứng với offset master `x = 17…142`, `y = 1…62`. Không có pixel nội dung master bị loại khỏi vùng so khớp. Trong 330 frame, **327 khớp pixel RGBA** và **3 khớp tư thế với sai khác màu hoặc alpha nhỏ**. Parry phát lại 6 frame mở đầu, nên 330 lượt phát bao phủ đủ 324 ô.
- **324 ô có nội dung, 0 ô rỗng, 0 ô được nhận diện là dự phòng.** Master có 2.684.109 pixel alpha 0 và 301.874 pixel alpha 255, trong đó 133.488 pixel là viền. Một pixel alpha 59 nằm trong ô 320, ở `(2092, 1140)`. Ô rộng nhất theo hộp bao có nội dung là **93 px**, ô 80, kể cả VFX. Đây là dữ liệu kiểm kê trên ảnh nguồn.

## Bản đồ 34 chuỗi

| # | Chuỗi trong gói | Ô `i` | Hàng/cột | Frame | Viền | Chuyển động và hiệu ứng |
|---:|---|---|---|---:|---|---|
| 01 | Weapon on | 0–17 | R01C01–R01C18 | 18 | `#45283C` | Tay với chuôi sau lưng 0–7. Rút và vung lưỡi cam 8–16. Tư thế cầm kiếm 17. |
| 02 | Weapon off | 18–31 | R02C01–R02C14 | 14 | `#FFFFFF` | Kiếm từ trước thân đi lên và vòng về lưng 18–25. Ánh cam giảm khi tra, tay hạ về idle 26–31. |
| 03 | Armed Idle | 32–37 | R02C15–R03C02 | 6 | `#8F563B` | Thở nhẹ, giữ kiếm cong thấp trước thân. |
| 04 | Unarmed Idle | 38–43 | R03C03–R03C08 | 6 | `#AC3232` | Nhịp thở tương ứng, chuôi/vũ khí trên lưng. |
| 05 | Heavy Attack 1 | 44–62 | R03C09–R04C09 | 19 | `#D77BBA` | Chuẩn bị 44–46, nâng/gồng kiếm 47–52, bổ và tàn lửa cung lớn 53–60, thu đòn thấp 61–62. |
| 06 | Heavy Attack 2 | 63–70 | R04C10–R04C17 | 8 | `#8F974A` | Nối từ thế thấp 63, quét cung ngược 64–68, thu vũ khí 69–70. |
| 07 | Heavy Attack 3 | 71–83 | R04C18–R05C12 | 13 | `#5FCDE4` | Nạp thế 71–75, quét ngang và vệt cháy rộng 76–81, trả kiếm lên 82–83. |
| 08 | Attack 1 | 84–92 | R05C13–R06C03 | 9 | `#FFFFFF` | Chuẩn bị 84–86, chém rộng 87–89, tàn lửa khi nối thế 90–92. |
| 09 | Attack 2 | 93–101 | R06C04–R06C12 | 9 | `#FBF236` | Nối thế 93, bổ và cung lửa 94–98, thu thấp 99–101. |
| 10 | Attack 3 | 102–112 | R06C13–R07C05 | 11 | `#99E550` | Quét vòm 102–106, nối thế 107, quét thấp sát đất và tàn lửa 108–112. |
| 11 | Attack 4 | 113–123 | R07C06–R07C16 | 11 | `#45283C` | Hạ người và đẩy lưỡi tới 113–114, luồng lửa 115–120, tắt dần 121–122, về thế cầm kiếm 123. |
| 12 | Armed Roll | 124–135 | R07C17–R08C10 | 12 | `#AC3232` | Tư thế cầm kiếm → cuộn người và kiếm sát thân → đứng dậy với kiếm phía trước. |
| 13 | Unarmed Roll | 136–147 | R08C11–R09C04 | 12 | `#5FCDE4` | Chuôi sau lưng, cúi/cuộn → áo choàng bung → đứng lại trong trạng thái tra kiếm. |
| 14 | Unarmed Run | 148–159 | R09C05–R09C16 | 12 | `#D77BBA` | Chạy nghiêng người và vung tay, chuôi/lưỡi đeo lưng lộ theo nhịp. |
| 15 | Armed Run | 160–171 | R09C17–R10C10 | 12 | `#FFFFFF` | Chạy nghiêng người với lưỡi cam thấp trước thân và áo choàng vẩy sau. |
| 16 | Unarmed Jump | 172–177 | R10C11–R10C16 | 6 | `#DF7126` | Vào thế nhảy, tay co và chân chuẩn bị rời đất. |
| 17 | Unarmed Mid air | 178 | R10C17 | 1 | `#FBF236` | Tư thế chuyển tiếp trên không, chân co. |
| 18 | Unarmed Fall light | 179–184 | R10C18–R11C05 | 6 | `#99E550` | Thế rơi co người, áo/vũ khí thu sát thân. |
| 19 | Unarmed Fall heavy | 185–190 | R11C06–R11C11 | 6 | `#AC3232` | Thế rơi thẳng hơn trước khi chạm đất. |
| 20 | Unarmed Land | 191–196 | R11C12–R11C17 | 6 | `#D77BBA` | Tiếp đất, bụi trắng 191–195, đứng lại ở 196. |
| 21 | Armed Jump | 197–202 | R11C18–R12C05 | 6 | `#DF7126` | Vào thế nhảy với kiếm giơ phía trước. |
| 22 | Armed Mid air | 203 | R12C06 | 1 | `#FBF236` | Tư thế chuyển tiếp trên không, kiếm hạ. |
| 23 | Armed Fall light | 204–209 | R12C07–R12C12 | 6 | `#99E550` | Thế rơi co người, kiếm dọc bên thân. |
| 24 | Armed Fall heavy | 210–215 | R12C13–R12C18 | 6 | `#AC3232` | Rơi thẳng hơn, mũi kiếm gần chân. |
| 25 | Armed Land | 216–221 | R13C01–R13C06 | 6 | `#D77BBA` | Chạm đất, bụi trắng 216–220, đứng dậy với kiếm ở 221. |
| 26 | Weapon Art | 222–256 | R13C07–R15C05 | 35 | `#45283C` | Sẵn thế 222–224. Chuỗi quét và xoay 225–242. Nối 243–244, lướt/cuộn lên 245–248, bổ 249–252 rồi thu kiếm 253–256. |
| 27 | Parry start | 257–262 | R15C06–R15C11 | 6 | `#FFFFFF` | Từ kiếm thấp đến thế gác trên đầu. GIF dùng chung cho hai nhánh. |
| 28 | Parry | 263–277 | R15C12–R16C08 | 15 | `#639BFF` | Bắt đòn 263–264, bùng lửa che thân 265–266, hiện lại với vệt cam 267–270, phục hồi kiếm phía trước 271–277. |
| 29 | Parry miss | 278–280 | R16C09–R16C11 | 3 | `#DF7126` | Hạ thế gác về idle cầm kiếm, không có quả cầu nổ. |
| 30 | Unarmed Hurt | 281–285 | R16C12–R16C16 | 5 | `#99E550` | Giật người và flash tại 281, xám dần 282–284, màu thường 285. |
| 31 | Armed Hurt | 286–290 | R16C17–R17C03 | 5 | `#AC3232` | Flash tại 286, lưỡi/ánh cam hiện ở 287–289, về tư thế cầm kiếm ở 290. |
| 32 | Death | 291–299 | R17C04–R17C12 | 9 | `#D77BBA` | Flash trắng 291, silhouette xám 292, tan thành mảnh đen/cam 293–299. Một chuỗi trong nguồn. |
| 33 | Unarmed Buff | 300–311 | R17C13–R18C06 | 12 | `#8A6F30` | Động tác tay, viền và hạt đỏ 304–310, dịu về tư thế tra kiếm. |
| 34 | Armed Buff | 312–323 | R18C07–R18C18 | 12 | `#FBF236` | Giữ lưỡi cam thấp, viền và hạt đỏ 316–322, về tư thế cầm kiếm. |

Thứ tự Jump → Mid air → Fall light → Fall heavy → Land dựa trên năm dải viền lặp lại cho mỗi trạng thái và thứ tự tư thế trong GIF. Các ô 178 và 203 là tư thế một frame có nội dung. Ô 265–266 chứa hiệu ứng vàng cam phủ kín nhân vật. Flash trắng thật nằm trong nội dung ô 281, 286 và 291, còn viền trắng xuất hiện ở những nhóm khác. Ô 297–299 lần lượt có 24, 10 và 4 pixel khác trong suốt. Đây là phần cuối của Death, được phát trong GIF. [Read me.txt](<../../../Pixel_Art/Black Knight/Read me.txt>) · [Master](<../../../Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png>)

## Kiểm kê đầy đủ 16 GIF

Đường dẫn mỗi file là `Pixel_Art/Black Knight/Preview_GIFs/` cộng tên trong bảng. Tất cả có canvas **512×256 px**, mỗi frame **70 ms**, lặp vô hạn theo metadata GIF. Thời lượng là một vòng phát. Cột cuối dùng chỉ số ô master từ 0. RIGHT là hướng ngang chủ đạo, kể cả lúc nhân vật xoay, cuộn hoặc lấy đà trong combo. [Thư mục GIF](<../../../Pixel_Art/Black Knight/Preview_GIFs/>)

| Tên file | Frame | Một vòng | Hướng / vũ khí | Tư thế đầu → cuối | Áo choàng, chùm lông, kiếm và VFX | Ô master |
|---|---:|---:|---|---|---|---|
| `BK_heavy_attack.gif` | 40 | 2.800 ms | RIGHT, Armed | Kiếm thấp → thân đứng lại, kiếm lên trước | Mũ và chùm lông nghiêng khi gồng, áo choàng quét theo ba nhịp. Lưỡi lên đầu, bổ, quét ngược và quét ngang với lửa tàn dần. | 44–83 |
| `BK_hurt.gif` | 19 | 1.330 ms | RIGHT, Unarmed → Armed → Death | Silhouette giật lùi → tàn mảnh | Dáng mũ/áo hiện qua flash trắng–xám. Chuỗi đầu tra kiếm, chuỗi tiếp khôi phục lưỡi cam, đoạn cuối mất dần cả silhouette và vệt lửa. | 281–285, 286–290, 291–299 |
| `BK_light_attack.gif` | 40 | 2.800 ms | RIGHT, Armed | Kiếm ở hông → thu kiếm về trước người | Áo choàng và chùm lông trễ theo đà thân. Ba nhịp cung chém cam nối đòn đẩy kiếm tới với luồng lửa. | 84–123 |
| `BK_parry.gif` | 30 | 2.100 ms | RIGHT, Armed | Kiếm ngang thấp → gác → trở lại kiếm thấp ở mỗi nhánh | Chùm lông và áo đổi theo cú ngả/gác. Kiếm lên đầu, cầu lửa cam che thân khi đỡ trúng, mảnh lửa tan và kiếm hiện lại. Nhánh hụt hạ kiếm trực tiếp. | 257–277, 257–262, 278–280 |
| `BK_unarmed_buff.gif` | 12 | 840 ms | RIGHT, Unarmed | Đứng tra kiếm → đưa tay và trở lại thế nghỉ | Mũ/cape bob nhẹ, chuôi trên lưng. Viền và hạt đỏ lên rồi tan. | 300–311 |
| `BK_unarmed_idle.gif` | 6 | 420 ms | RIGHT, Unarmed | Đứng tra kiếm → về nhịp đứng đầu | Mũ/chùm lông và vai đổi nhẹ theo thở, áo rủ. Giữ chuôi ở lưng, không có đợt VFX. | 38–43 |
| `BK_unarmed_jump.gif` | 25 | 1.750 ms | RIGHT, Unarmed | Co tay lấy đà → nhảy/rơi → đứng | Áo và mũ/chùm lông đổi theo góc co chân và duỗi người, vũ khí vẫn đeo sau. Bụi trắng ở tiếp đất. | 172–196 |
| `BK_unarmed_roll.gif` | 12 | 840 ms | RIGHT, Unarmed | Đứng tra kiếm → cuộn người → đứng tra kiếm | Chùm lông khuất khi cuộn, áo bung lúc đứng lên. Vệt cam xoay sát vũ khí trên thân, kết thúc thấy chuôi lưng. | 136–147 |
| `BK_unarmed_run.gif` | 12 | 840 ms | RIGHT, Unarmed | Nghiêng tới, sải chân → co người về nhịp bước nối vòng | Chùm lông/áo kéo về sau rồi bật theo sải. Vũ khí đeo lưng lúc lộ lúc khuất, không có cung chém. | 148–159 |
| `BK_weapon_art.gif` | 35 | 2.450 ms | RIGHT làm hướng gốc, Armed | Kiếm thấp → chuỗi chém, lướt/cuộn và bổ → thu kiếm | Áo choàng xoè qua các vòng chém, mũ và chùm lông xoay theo thân hoặc bị che. Nhiều vệt cam và bụi trắng quanh pha nhào/bổ. | 222–256 |
| `BK_weapon_buff.gif` | 12 | 840 ms | RIGHT, Armed | Đứng cầm kiếm → đưa tay/rực aura → về thế cầm kiếm | Mũ/cape bob nhẹ. Lưỡi giữ sắc cam vàng, viền và hạt quanh người màu đỏ sẫm. | 312–323 |
| `BK_weapon_idle.gif` | 6 | 420 ms | RIGHT, Armed | Đứng với kiếm thấp → về nhịp đứng đầu | Vai, mũ/chùm lông và áo nhấp nhẹ. Lưỡi cam dao động ít khi thở. | 32–37 |
| `BK_weapon_jump.gif` | 25 | 1.750 ms | RIGHT, Armed | Kiếm giơ trước → co người/rơi → đứng với kiếm thấp | Áo và chùm lông theo tư thế trên không. Kiếm hạ dọc theo thân khi rơi, lóe sát đất cùng bụi trắng khi đáp. | 197–221 |
| `BK_weapon_on-off.gif` | 32 | 2.240 ms | RIGHT, Unarmed → Armed → Unarmed | Chuôi sau lưng → cầm kiếm → tra lại | Tay và vai xoay, áo/mũ nghiêng theo cú rút. Lưỡi cam vạch cung khi ra, nhỏ dần khi tra và về vị trí sau lưng. | 0–17, 18–31 |
| `BK_weapon_roll.gif` | 12 | 840 ms | RIGHT, Armed | Đứng cầm kiếm → cuộn người → đứng cầm kiếm | Áo bọc thân làm mũ/chùm lông khuất tạm thời. Lưỡi cam vòng sát thân rồi về trước. | 124–135 |
| `BK_weapon_run.gif` | 12 | 840 ms | RIGHT, Armed | Nghiêng tới với kiếm thấp → co người nối vòng | Áo choàng và chùm lông lắc theo sải chân, kiếm cam tiến lùi thấp trước thân. | 160–171 |

Hai frame `BK_hurt.gif` số 2 và 7 lệch nhẹ RGB ở 8 pixel mỗi frame so với ô 282 và 287. Frame 9 của `BK_weapon_buff.gif` dùng alpha 255 cho pixel mà master ô 320 dùng alpha 59. Vị trí hình và thứ tự được đối chiếu ở cả ba trường hợp. GIF Death riêng không có trong gói hiện diện. [GIF Hurt](<../../../Pixel_Art/Black Knight/Preview_GIFs/BK_hurt.gif>) · [GIF Armed Buff](<../../../Pixel_Art/Black Knight/Preview_GIFs/BK_weapon_buff.gif>)

## Kiểm chứng các vị trí Project Owner đề xuất

| Đề xuất | Tọa độ đã kiểm chứng | Bằng chứng và mức xác nhận |
|---|---|---|
| Heavy Attack ở R03C11 đến R04C10 | Toàn bộ R03C09–R05C12, ô 44–83 | GIF 40 frame, ba chuỗi 19 + 8 + 13. Điểm đề xuất bắt đầu giữa Heavy 1 và chạm đầu Heavy 2. |
| Thrust / Ground Slam ở R05–R07 | Thrust 113–123, R07C06–R07C16. Ground Slam ứng viên 108–112, R07C01–R07C05. | Phần đẩy kiếm là Attack 4. Quét thấp là đuôi Attack 3. Cú bổ Heavy 1 ô 53–60 có hình gần đất tương tự. Chưa có dải riêng mang tên Ground Slam. |
| Flame Stream / Fire Wave ở R07C06–R07C16 | Luồng lửa 113–122, R07C06–R07C15, thu kiếm 123 | Cùng đoạn Attack 4 với Thrust. Heavy 3 ô 76–81 cho tham chiếu làn chém rộng, R05C05–R05C10. Chưa xác minh được Fire Wave tách khỏi lưỡi hoặc một chuỗi độc lập. |
| Aerial Somersault ở R13C10–R15C05 | Pha nhào/bổ 245–256, R14C12–R15C05, nối đà 243–244 | Vùng đề xuất chứa cả các nhịp chém đầu của Weapon Art. Pha 245–248 co thân và xoay khi nâng lên, 249–252 hạ lưỡi theo cung và chạm đất, 253–256 hồi thế. Chuỗi có dịch chuyển tư thế, cung kiếm và bụi, cùng viền Weapon Art. |
| Fire Nova ở R15C12–R16C08 | Đúng dải Parry 263–277 | `BK_parry.gif` phát 263–264 tích tụ, 265–266 bùng cầu, 267–270 tan hạt và 271–277 hồi thế. Dải màu phân ranh nhánh Parry thành công. |
| Weapon On/Off ở R01C09 qua R02C14 | Weapon On R01C01–R01C18 (0–17), Weapon Off R02C01–R02C14 (18–31) | Phần rút kiếm bắt đầu bằng tám frame với tay/chuôi trước khi có lưỡi cam ở R01C09. |
| Unarmed Roll ở R08C11–R09C04 | R08C11–R09C04, ô 136–147 | Khớp cả 12 frame của GIF. Armed Roll ngay trước đó ở 124–135. |
| Buff ở R17C13 đến hết R18 | R17C13–R18C06 (300–311), R18C07–R18C18 (312–323) | Hai GIF và hai viền phân biệt vũ khí. Màu viền vàng của Armed Buff không phải màu aura. |
| Jump/Fall/Land từ R10 đến đầu R13 | R10C11–R13C06, ô 172–221 | Năm chuỗi × hai trạng thái theo GIF Jump, gồm cả tư thế Mid air một frame. |
| Hurt/Death ở R16–R18 | R16C12–R16C16 (281–285), R16C17–R17C03 (286–290), R17C04–R17C12 (291–299) | GIF Hurt có 5 + 5 + 9 frame. R18 thuộc Buff. Master có hai Hurt riêng và một Death. Các mảnh lửa cuối Death không cho thấy hai chuỗi theo vũ khí. |
