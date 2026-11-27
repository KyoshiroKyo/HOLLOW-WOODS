# HW-CODEX-AUDIO-01B — Main Menu Cinematic Music

- Baseline · `965660a814820ce1e011f3c516d7d07e50522adc`
- Trạng thái · **AUDIO REVIEW GATE · Chờ Owner nghe duyệt**
- Phạm vi · Mẫu nghe và phương án đấu nối. Main Menu và gameplay tiếp tục dùng routing hiện hành.

## Mẫu nghe

| Mẫu | Nội dung | Tệp |
| --- | --- | --- |
| A | Nền Main Menu hiện hành. Lặp vòng rừng, lọc 3,6 kHz và hạ 5,8 dB để so ở mức nghe gần B. Đây là bản nghe riêng, trước master gain. | [A — Nền hiện hành đã cân mức nghe](../../../../scratch/hw-codex-audio-01b/01_A_MENU_CURRENT.flac) |
| B | **The Oath Beyond the Mist**. 16 ô nhịp chậm, piano làm giai điệu, dây trầm tổng hợp, harp và lớp hòa âm thoáng. D minor chuyển sắc Dorian ở nửa sau, rồi trở lại chủ âm. | [B — Bản nhạc gốc](../Evidence/HW-CODEX-AUDIO-01B/02_B_MENU_CANDIDATE.flac) |
| Điểm nối B | Ba giây cuối nối trực tiếp với ba giây đầu. | [Điểm nối vòng lặp](../Evidence/HW-CODEX-AUDIO-01B/03_B_LOOP_SEAM.flac) |
| B → Fog Crossing | Mô phỏng fade 1,5 giây sang ambience hiện có. | [Mô phỏng chuyển cảnh](../../../../scratch/hw-codex-audio-01b/03_TRANSITION_DEMO.flac) |

A và mẫu chuyển cảnh nằm ở máy local vì sử dụng nguồn âm thanh runtime của dự án. B là bản soạn và dựng sóng riêng cho lượt review này, dùng hàm tổng hợp và bản nhạc lưu trong [script render](../Evidence/HW-CODEX-AUDIO-01B/render_menu_candidate.mjs). Không dùng sample, soundfont hoặc stem từ trailer. FLAC stereo 48 kHz/24-bit, dài **57,600 giây**, ~3,47 MiB. B đạt **−18,6 LUFS-I** và peak PCM **−8,31 dBFS**. Đuôi các nốt và phản xạ âm quấn qua điểm nối. Bước biên PCM lớn nhất là 0,000676 toàn thang (~−63,4 dBFS). [Số đo vòng lặp](../Evidence/HW-CODEX-AUDIO-01B/01_LOOP_METRICS.json) · [Mức nghe A/B và SHA-256](../Evidence/HW-CODEX-AUDIO-01B/04_AB_LEVELS.json)

## Phương án sau khi duyệt

1. Đăng ký key riêng trong manifest BGM. Đưa file đã được Owner duyệt vào đường dẫn runtime với nạp theo nhu cầu. Dùng luồng mở khóa audio hiện hành của Main Menu. Chỉ để một nền menu hoạt động.
2. Dùng gain và mute hiện có, thử `volumeScale = 0.55` để bắt đầu gần mức nền rừng hiện tại. Giữ fade vào khoảng 1,5 giây. New Game fade ra khi vào Prologue. Continue fade sang ambience hoặc BGM của vùng đích. Hủy yêu cầu phát chưa hoàn tất khi rời menu và dọn source trên shutdown.
3. Dùng HTMLAudio hiện có nếu điểm nối nghe liền trên trình duyệt đích. Nếu trình phát chèn khoảng nghỉ, dùng WebAudio buffer loop cho riêng theme menu, giải mã khi cần (~21,1 MiB float32 tại 48 kHz). Kiểm tra mute, autoplay, bỏ qua Prologue, về Main Menu và hai đường New Game/Continue sau khi đấu nối.

## Kiểm nghiệm

- TypeScript, build và integrity dữ liệu **15/15** đạt. Vite vẫn báo cảnh báo startup script và hai font từ baseline.
- V15-FIX-02 **12/12**. Sanctuary **18 kiểm tra logic đạt**, 4 mục chỉ kiểm tra backup lịch sử vắng trong worktree. V15-39 xác nhận đủ năm BGM runtime rồi dừng vì checkout thiếu thư mục master `Sound_Effects`. Đây là các giới hạn đã ghi ở B06.
- Ma trận Python B06 gốc không nằm trong checkout. BUG-09 chưa chạy vì Python launcher Windows không khả dụng. [Chromium cục bộ](../Evidence/HW-CODEX-AUDIO-01B/05_RUNTIME.json) đạt **10/10**, gồm các đường âm của 01A, BGM race và giải mã FLAC. OfflineAudioContext phát qua điểm nối với 0 sai khác trong 1.024 mẫu sau khi lặp. Đã đối chiếu 2.764.800 mẫu/kênh giải mã bằng FFmpeg với bản render, sai số tối đa 1,19e−7 do lượng tử hóa. Khoảng nghỉ của HTMLAudio thực tế chưa được xác nhận.
- **Human Listening QA chưa chạy.** Owner nghe A/B trên loa hoặc tai nghe, đặc biệt đoạn nối và mốc chuyển sang ambience. Bản ghi kiểm tra decode, gain và thời gian không thay cho đánh giá cảm nhận.
