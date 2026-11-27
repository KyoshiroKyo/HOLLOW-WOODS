# HW-CODEX-COMPETITION-SMOKE

**PASS local** · Candidate production `38877b546167591255e4b80726791caa1869ec10` · Checkpoint V1.6.0 dự thi `35317c0ef397edb8da3ce7471a18e5b87cada6a9`.

- Chromium **20/20**, exit 0. Menu/New Game/Prologue/Space Skip, điều khiển WASD qua Fog Crossing/Bellhollow/Outer Woods và quay lại, FIX-23 Edda/Neris, Save → reload → Continue, F4/F9 khóa với `?dev=1`. Trace ghi 0 lỗi runtime và 0 phản hồi HTTP local 4xx/5xx cho tài nguyên game. Chạy production build localhost với profile riêng, SDK ngoài bị chặn và fixture đặt gần ranh giới để kiểm chuyển vùng tự nhiên.
- Validator P2Game local **23/23**, SE-004 quét app bundle đạt, RT-002 V15-48 **28/28** và trace focus chỉ sau tương tác. Guard bảng xếp hạng đối chiếu tĩnh: từ chối submit cho QA_BUILD hoặc phiên Developer. Không gửi điểm thật.
- Kế thừa TypeScript/build, B07-R1 + MICRO-03 **18/18**, B05 **6/6** và kiểm Schema 3 từ checkpoint có cùng source đã dùng. Không thấy blocker trong phạm vi chạy.
- Trace và ảnh cục bộ tại `scratch/hw-codex-competition-smoke/browser/`. Tiến trình Chromium/Vite do task tạo đã thoát. Hosted Portal, cloud thật, IME vật lý và kiểm lại ZIP lịch sử: **NOT RUN**. ZIP và bản offline V1.6.0 được giữ nguyên.

Theo R4, checkpoint này chỉ thêm báo cáo và tiếp tục hàng chờ kỹ thuật.
