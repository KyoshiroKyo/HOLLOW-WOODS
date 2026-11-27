# HW-CODEX-AUDIO-01A — Âm thanh thế giới và kiểm kê

- Baseline · `5ff7dedfd79215bf09057aee2262bfbcafa31248`
- Nhánh · `feat/v1.6-codex-development`
- Phạm vi · Chuông mở đầu, SFX, ambience và kiểm kê

## Thay đổi

- **Chuông Hồi 0.** Master chuông đồng giải mã là 11,222 giây. Trước sửa, cue lúc vào game và cue cành gãy đều có thể phát lại master đầy đủ. Hai lượt có tổng thời lượng nguồn khoảng 22,44 giây nếu phát trọn. Giữ cue đầu và bỏ lần phát lặp. Mốc dừng 6,000 giây, giữ nguyên cao độ và attack. Gain giảm về 0 từ giây 3,5 đến giây 6. Chuông nhiệm vụ và chuông nứt giữ thời lượng hiện hành.
- **Âm giống sóng ở đầu Bellhollow.** Zone map Fog Crossing → Crossing và Bellhollow → Village đúng. `footstep_leaves_1.mp3` và `ambience_crossing.mp3` cùng SHA-256. Sample gió dài 150,74 giây được nhầm làm một biến thể bước chân cỏ và đất, nên các tiếng gió có thể tiếp tục chồng lên ambience làng. Bước chân cỏ dùng sample 0,218 giây. Đường đất luân phiên cỏ và đá. Bản sao gió được giữ trong kho và gỡ khỏi preload/lazy routing. Wind modulation chờ crossfade vào hoàn tất để tránh thay lịch gain giữa chừng.
- **Tiếng lò.** Track làng có metadata `furnace`. Giảm 7 dB ở dải cao bằng high-shelf 1.650 Hz trên kênh Village, giữ nguyên dấu vân tay file và âm nền trầm. Node EQ dọn theo vòng đời kênh ambience.
- **Tấn công.** Tăng sample swing từ gain 0,80 lên 0,96 trước SFX bus, tốc độ 1,06× và giới hạn 2 lượt đồng thời. Giữ đường âm qua Veil filter và master limiter. Tương tác, bề mặt gỗ/đá/bùn, input mute và nhạc nền giữ cơ chế hiện hành.

## Kiểm kê và tối ưu

[CSV trước/sau](../Evidence/HW-CODEX-AUDIO-01A/01_ASSET_INVENTORY.csv) có đủ 65 file, byte, hash, codec, bitrate, số kênh, sample rate, thời lượng, PCM ước tính và chính sách nạp. Tổng kho vẫn là **70.904.667 byte (67,62 MiB)**. Gỡ lượt nạp bản sao giảm **2.771.121 byte (~2,64 MiB)** tài nguyên âm thanh yêu cầu lúc khởi động và khoảng **55,20 MiB PCM** theo mô hình stereo float32 48 kHz. Đây là ước tính theo buffer, không phải đo tổng RAM trình duyệt. Kho preload ước tính giảm từ 197,76 xuống 142,56 MiB PCM. Năm BGM MP3 320 kb/s nạp qua HTMLAudio khi cần. Một số WAV lớn xuất hiện cả trong Preload lẫn bảng lazy. Không đổi chính sách đó trong bước này vì cần kiểm tra lần phát đầu và vòng đời theo zone. Không chuyển codec, giảm bitrate hoặc xóa master.

## Mẫu A/B và quyền sử dụng

Tám WAV A/B được xuất cục bộ trong `scratch/hw-codex-audio-01/AB/`. Mẫu bell, furnace, bước chân và swing dùng tệp đã có trong repo. Mẫu tái hiện các điều chỉnh chính trên nguồn riêng, trước khi trộn với gameplay. Mẫu step A là trích đoạn của tệp định tuyến nhầm. Các mẫu là bản review cục bộ. Git lưu danh sách checksum, dữ liệu đo và báo cáo. Metadata chuông, gió và lò ghi Fesliyan Studios. Không thêm tài nguyên bên thứ ba và không đưa WAV trích xuất lên remote khi quyền phân phối riêng chưa có xác nhận.

## Nghiệm thu

- **Automated QA.** `npx tsc --noEmit` và `npm run build` đạt. Vite còn cảnh báo startup script và font có từ baseline. Test V15-FIX-02 đạt 12/12. Test Sanctuary đạt 18 kiểm tra logic, 4 kiểm tra tồn tại backup lịch sử vắng trong worktree, cùng tình trạng với báo cáo B06. Script ma trận `verify_b06_matrix.py` không nằm trong checkout. Python launcher Windows không khả dụng cho BUG-09. [Chromium cục bộ](../Evidence/HW-CODEX-AUDIO-01A/03_RUNTIME.json) đạt **8/8** cho cue 6 giây, bước chân, swing/tương tác, slider, fade/EQ, mute/unmute, cleanup và lỗi runtime. Chạy trên profile riêng, SDK bị chặn. Chuyển zone bằng bộ điều khiển AudioManager để đo chính xác kênh và AudioParam.
- **Human Listening QA.** Chưa chạy. Xác nhận mức độ tự nhiên, lực swing và âm lò cần nghe mẫu A/B hoặc chơi bản cập nhật. Các số đo và kiểm tra routing chỉ xác nhận hành vi kỹ thuật.
