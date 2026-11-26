/**
 * HOLLOW WOODS V1.5 - DỮ LIỆU CÁC MẨU NHẬT KÝ, BIỂN BÁO & CỔ THƯ THẾ GIỚI
 * (TORN PAGES, SIGNPOSTS, NOTICES & ARCHAEOLOGICAL CLUES REGISTRY)
 */

export type NoteVisualVariant = 'parchment' | 'notice' | 'signpost' | 'stele';

export interface TornPageEntry {
  id: string;                      // Action ID trên bản đồ (e.g. 'read_cp_frontier_sign')
  loreId?: string;                 // Lore ID trong lore.json đồng bộ với Sổ Tay [J] (tùy chọn)
  variant?: NoteVisualVariant;     // Phân loại trực quan: parchment | notice | signpost | stele
  title: string;                   // Tiêu đề trang giấy / biển báo / văn bia
  author: string;                  // Tác giả / Nguồn gốc
  ancientRune: string;             // Ký hiệu cổ ngữ / icon (e.g. 'ᚱ', '🧭', '📜', '⚠️', '🌿')
  pages: string[];                 // Nội dung chia theo từng trang đọc
  memoryAwakeningStage?: number;   // Cập nhật tiến trình Thức Tỉnh Ký Ức nếu có
  composureBonus?: number;         // Điểm hồi phục Bình Tâm lần đầu đọc
  rewardItem?: { itemId: string; count: number; nameVi: string }; // Phần thưởng vật phẩm đính kèm nếu có
}

export const TORN_PAGES_REGISTRY: Record<string, TornPageEntry> = {
  // =========================================================================
  // I. CÁC BIỂN CHỈ DẪN & CỘT MỐC GỖ (SIGNPOSTS)
  // =========================================================================

  // 1. Cột Mốc Tiền Tuyến (Crooked Path)
  read_cp_frontier_sign: {
    id: 'read_cp_frontier_sign',
    variant: 'signpost',
    title: 'CỘT MỐC TIỀN TUYẾN',
    author: 'Khắc Trên Cọc Gỗ Sồi – Lối Mòn Quanh Co',
    ancientRune: '🧭',
    pages: [
      'Vết khắc dao vội vã trên thớ gỗ sồi già:\n\n"LỐI MÒN QUANH CO — Đi theo vệt đèn lồng. Cẩn thận bước chân khi sương mù đặc lại."\n\nPhía trước là vùng đất hoang vu ngoài rìa Bellhollow. Đèn lồng bảo hộ được thắp dọc lối đi để dẫn đường cho những người tuần tra kiên cường.'
    ],
    composureBonus: 5
  },

  // 2. Tấm Biển Mục Cửa Rừng (Fog Crossing)
  read_fog_sign: {
    id: 'read_fog_sign',
    variant: 'signpost',
    title: 'TẤM BIỂN MỤC CỬA RỪNG',
    author: 'Biển Gỗ Phong Hóa – Fog Crossing',
    ancientRune: '🧭',
    pages: [
      'Tấm ván sồi nứt nẻ đóng trên cọc gỗ bên mép vực sương mù:\n\n"◄ HƯỚNG ĐÔNG: Làng Chuông Bellhollow — Vùng Trú Ẩn An Toàn.\n\nHỡi lữ khách vừa thoát khỏi màn đêm, hãy giữ ngọn đèn luôn cháy sáng và đi theo vệt hoa dại dẫn vào cổng làng!"'
    ],
    composureBonus: 5
  },

  // 3. Biển Chỉ Đường Tuyến Vòng (Crooked Path)
  read_detour_sign: {
    id: 'read_detour_sign',
    loreId: 'lore_detour_path',
    variant: 'signpost',
    title: 'BIỂN CHỈ ĐƯỜNG TUYẾN VÒNG',
    author: 'Đội Tuần Tra Bellhollow',
    ancientRune: '🧭',
    pages: [
      'Mũi tên chỉ hướng đóng đinh vào thân cây sồi:\n\n"▲ HƯỚNG BẮC: Bìa Rừng Sâu & Xưởng Đúc Chuông Cổ\n► HƯỚNG ĐÔNG NAM: Lối Vòng Đầm Lầy & Tháp Chuông"\n\nLưu ý: Cầu đá thẳng tới tháp chuông đã sập hoàn toàn. Muốn đến được đài chuông, bắt buộc phải băng qua Đầm Lầy Tĩnh Lặng.'
    ],
    composureBonus: 10
  },

  // 4. Biển Nông Trại Trú Ẩn (Sanctuary Farm)
  read_farm_sign: {
    id: 'read_farm_sign',
    variant: 'signpost',
    title: 'BIỂN NÔNG TRẠI TRÚ ẨN',
    author: 'Người Dân Bellhollow',
    ancientRune: '🌱',
    pages: [
      'Biển gỗ sồi mộc mạc dựng bên hàng rào hoa cúc:\n\n"NÔNG TRẠI TRÚ ẨN (SANCTUARY FARM)\n\nVùng đất phì nhiêu được che chở bởi hơi ấm đốm lửa và tiếng chuông ngân. Nơi gieo trồng thảo dược bạc và tích trữ lương thảo sinh tồn cho những ngày sương giá."'
    ],
    composureBonus: 5
  },

  // 5. Biển Chỉ Dẫn Rừng Ven (Outer Woods)
  read_ow_sign: {
    id: 'read_ow_sign',
    variant: 'signpost',
    title: 'BIỂN CHỈ DẪN RỪNG VEN',
    author: 'Trạm Kiểm Lâm Rừng Ngoài',
    ancientRune: '🌲',
    pages: [
      'Tấm biển gỗ bạch dương khắc chữ sâu:\n\n"HƯỚNG ĐÔNG NAM — Vành Đai Rừng Ngoại Vi (Outer Woods).\n\nKhu vực dồi dào cành củi khô, nấm rừng và thảo mộc tự nhiên. Hãy để mắt tới bóng cây mục và lắng nghe từng tiếng động lạ khi trời ngả về chiều."'
    ],
    composureBonus: 5
  },

  // 6. Biển Cảnh Báo Đầm Lầy Tĩnh Lặng (Silent Mire)
  read_sm_entry_sign: {
    id: 'read_sm_entry_sign',
    variant: 'signpost',
    title: 'BIỂN CẢNH BÁO ĐẦM LẦY TĨNH LẶNG',
    author: 'Người Dò Đường Đầm Lầy',
    ancientRune: '🌊',
    pages: [
      'Khung gỗ sồi phong hóa bám đầy rêu trơn đặt cạnh mép nước ngập:\n\n"ĐẦM LẦY TĨNH LẶNG (SILENT MIRE) — VÙNG NƯỚC SƯƠNG ĐỘC\n\n• Đi trên các gờ đất cao và cầu ván gỗ để tránh sụt bùn lầy nuốt chửng bước chân.\n• Nước đen và khí sương ăn mòn Tinh Thần cực nhanh.\n• Hãy ẩn nấp vào hốc cây cổ hoặc lùm lau sậy rậm rạp khi sương mù cuộn sóng."'
    ],
    composureBonus: 10
  },

  // 7. Biển Chỉ Hướng Lối Nam Nông Trại (Bellhollow)
  inspect_farm_gate: {
    id: 'inspect_farm_gate',
    variant: 'signpost',
    title: 'BIỂN CHỈ HƯỚNG: LỐI NAM NÔNG TRẠI',
    author: 'Cổng Nam Làng Bellhollow',
    ancientRune: '🚪',
    pages: [
      'Tấm biển gỗ chỉ dẫn hướng Nam:\n\n"LỐI NAM MỞ RỘNG — Đường mòn dẫn xuống Nông Trại Trú Ẩn (Sanctuary Farm).\n\nVùng đất bình yên ngoài lũy tre làng, nơi có nguồn nước giếng ngọt và các luống thảo dược che chở tâm trí người lữ khách."'
    ],
    composureBonus: 5
  },

  // 8. Biển Chỉ Hướng Cổng Rừng Ngoại Vi (Bellhollow)
  inspect_outer_woods_gate: {
    id: 'inspect_outer_woods_gate',
    variant: 'signpost',
    title: 'BIỂN CHỈ HƯỚNG: CỔNG RỪNG NGOẠI VI',
    author: 'Cổng Đông Nam Làng Bellhollow',
    ancientRune: '🚪',
    pages: [
      'Tấm biển gỗ chỉ dẫn hướng Đông Nam:\n\n"LỐI ĐÔNG NAM MỞ RỘNG — Vành đai Rừng Ngoại Vi (Outer Woods).\n\nVùng đệm giữa làng và đại ngàn. Nguồn thu thập củi khô, nhựa thông và dược liệu sương sớm của dân làng Bellhollow."'
    ],
    composureBonus: 5
  },

  // =========================================================================
  // II. CÁC THÔNG BÁO, CÁO THỊ & GHI CHÚ (NOTICES / WARNING SHEETS)
  // =========================================================================

  // 9. Bảng Tin Dị Thường Bellhollow
  read_bellhollow_notice_board: {
    id: 'read_bellhollow_notice_board',
    loreId: 'lore_three_rules',
    variant: 'notice',
    title: 'BẢNG TIN DỊ THƯỜNG BELLHOLLOW',
    author: 'Hội Đồng Làng Bellhollow',
    ancientRune: '📜',
    pages: [
      'CẢNH BÁO TÌNH HÌNH CÁC PHÂN KHU XUNG QUANH LÀNG:\n\n• Tây Bắc: Khói đen tắt tại Trạm Kiểm Lâm Rừng Ngoài. Dầu đèn dự trữ vẫn còn trong rương gỗ.\n• Đông Nam: Tiếng chuông chìm đáy Đầm Lầy Sương Mù. Cần người vượt cầu ván khảo sát miếu cổ.\n• Đông Bắc: Cột Vật Tổ Thì Thầm cảnh báo quái vật rình rập ở Rừng Sâu.',
      'BA QUY TẮC BẰNG MÁU:\n1. Đừng trả lời khi rừng gọi tên bạn.\n2. Đừng đi theo chiếc đèn thứ hai trong sương mù.\n3. Tuyệt đối không rung chuông khi sương mù đã tràn qua rào làng!'
    ],
    composureBonus: 10
  },

  // 10. Hướng Dẫn Vườn Dược Sanctuary (Sanctuary Farm)
  read_herb_terrace_sign: {
    id: 'read_herb_terrace_sign',
    variant: 'notice',
    title: 'HƯỚNG DẪN VƯỜN DƯỢC SANCTUARY',
    author: 'Ghi Chú Của Bà Moira Thảo Dược',
    ancientRune: '🌿',
    pages: [
      'Mẩu giấy da đóng đinh gỗ trên thành giàn thảo dược:\n\n"VƯỜN DƯỢC SANCTUARY:\n4 ô đất màu mỡ dành riêng cho Thảo Dược Bạc.\n\n• Nhấn [E] khi đứng gần ô đất trống để gieo hạt giống.\n• Tưới nước giếng và kiên nhẫn đợi cây trưởng thành.\n• Thu hoạch lá bạc để chế thuốc đắp vết thương và thuốc an thần."'
    ],
    composureBonus: 5
  },

  // 11. Cáo Thị Cảnh Báo Rừng Sâu (Deep Forest)
  inspect_df_entry_sign: {
    id: 'inspect_df_entry_sign',
    variant: 'notice',
    title: 'CÁO THỊ: CẢNH BÁO RỪNG SÂU',
    author: 'Lực Lượng Phòng Vệ Bellhollow',
    ancientRune: '⚠️',
    pages: [
      'Bản cáo thị đóng ghim sắt viền sáp đỏ trên gốc cây cổ thụ:\n\n"CẢNH BÁO TỐI NGUY HIỂM — LÃNH ĐỊA RỪNG SÂU (DEEP FOREST)\n\nNơi Kẻ Lắng Nghe (The Listener) ẩn nấp săn mồi.\n\n1. Luôn giữ ngọn đèn lồng bốc cháy sáng rực.\n2. Tuyệt đối hạn chế chạy thục mạng gây tiếng động lớn.\n3. Khi nghe tiếng rít gió hoặc tiếng cào đất, hãy lập tức nấp vào Thân Cây Rỗng gần nhất!"'
    ],
    composureBonus: 10
  },

  // 12. Cửa Ngõ Bìa Rừng Sâu (Crooked Path)
  inspect_deep_forest_gate: {
    id: 'inspect_deep_forest_gate',
    variant: 'notice',
    title: 'CỬA NGÕ BÌA RỪNG SÂU',
    author: 'Trạm Gác Tiền Tuyến',
    ancientRune: '⚠️',
    pages: [
      'Bản thông báo dán chặt vào rào cọc nhọn phân ranh giới:\n\n"RÀO CHẮN RỪNG SÂU (DEEP FOREST GATE)\n\nPhía bên kia là vùng bóng tối nguyên sinh. Màn sương The Veil ngưng tụ dày đặc và Kẻ Lắng Nghe luôn rình rập.\n\nNgười lữ khách chỉ nên vượt qua cửa ngõ này khi chiếc đèn lồng đã đầy dầu và ngọn lửa niềm tin vững vàng trong tim."'
    ],
    composureBonus: 5
  },

  // =========================================================================
  // III. CÁC MẨU NHẬT KÝ & BỨC THƯ DA DÊ CỔ (TORN PARCHMENTS)
  // =========================================================================

  // 13. Mẩu Nhật Ký Rách #1 tại Fog Crossing
  inspect_fog_journal_1: {
    id: 'inspect_fog_journal_1',
    loreId: 'lore_fog_journal_1',
    variant: 'parchment',
    title: 'MẨU NHẬT KÝ RÁCH: KẺ ĐI TRƯỚC',
    author: 'Người Lữ Hành Vô Danh – Fog Crossing',
    ancientRune: 'ᚱ',
    pages: [
      'Màn sương đen The Veil đã nuốt chửng lối quay về. Nó không chỉ là hơi sương giá buốt đơn thuần, mà là một thực thể sống đang thì thầm gọi tên từng người bước vào đại ngàn...\n\nNếu ngươi còn giữ được lý trí, hãy lần theo tiếng chuông ngân trầm và ánh đèn bão màu hổ phách phía Đông để tìm đến ngôi làng Bellhollow.',
      'Quy tắc sinh tồn duy nhất: Đừng bao giờ tắt đèn lồng quá lâu giữa bóng tối. Khi bình tâm suy kiệt, bóng ma The Tendril sẽ bóp nghẹt buồng phổi của ngươi.\n\nTa để lại mẩu giấy này tại cổng vòm đá trước khi bước vào đầm lầy... Cầu mong Đại Hồng Chung sẽ ngân vang trở lại.'
    ],
    composureBonus: 10
  },

  // 14. Trang Nhật Ký Ướt Sương của Thợ Đúc Chuông (sub_bell_workshop)
  inspect_bellmaker_dew_journal: {
    id: 'inspect_bellmaker_dew_journal',
    loreId: 'lore_bellmaker_dew_journal',
    variant: 'parchment',
    title: 'TRANG NHẬT KÝ ƯỚT SƯƠNG: HỢP KIM NGÂN VANG',
    author: 'Ghi Chép Của Thợ Đúc Chuông Cuối Cùng',
    ancientRune: 'ᛉ',
    pages: [
      'Trang giấy da ướt đẫm sương đêm kẹp dưới đế đe sắt mục:\n\n"Hôm nay ta đã thử nghiệm tôi luyện đồng đỏ cùng nhựa thông cổ thụ và phôi sắt khắc cổ ngữ Rad. Hợp kim phát ra thứ ánh sáng hoàng kim khi nung nóng... Âm sắc của nó không chỉ vang xa, mà còn tạo ra sóng chấn động làm tan rã tà khí The Veil trong bán kính 100 bước chân."',
      '"Hỡi người đến sau, hãy gom đủ đá lửa và nhựa thông để nung chảy hợp kim này! Chỉ có tiếng ngân của Đại Hồng Chung mới giải phóng được linh hồn thung lũng... Đừng để ngọn lửa lò rèn nguội lạnh!"'
    ],
    composureBonus: 10,
    rewardItem: { itemId: 'res_tree_resin', count: 1, nameVi: 'Nhựa Thông Cổ Thụ' }
  },

  // 15. Bức Thư Chưa Kịp Gửi của Elian (outer_woods)
  inspect_elian_unsent_letter: {
    id: 'inspect_elian_unsent_letter',
    loreId: 'lore_elian_unsent_letter',
    variant: 'parchment',
    title: 'BỨC THƯ CHƯA KỊP GỬI CỦA ELIAN',
    author: 'Elian – Em Trai Người Gác Cổng Garth',
    ancientRune: 'ᚠ',
    pages: [
      'Lá thư gấp vội nhét trong hốc cây khô ven đường mòn hiểm trở:\n\n"Anh Garth thân mến, nếu anh đọc được bức thư này, nghĩa là đội tuần tra chúng em đã bị Kỵ Binh Hắc Ám mai phục... Đừng phái người ra tìm kiếm em! Hãy khóa chặt cổng làng phía Tây, thắp đuốc thật sáng dọc tường rào."',
      '"Lũ quái vật sợ ánh lửa rọi thẳng vào mắt! Chiếc đèn tuần tra của em đã vỡ ở bờ suối... Hãy tha thứ cho em vì không thể cùng anh uống cạn vò rượu mùa thu năm nay. Hãy giữ vững cổng làng, người anh trai dũng cảm của em."'
    ],
    composureBonus: 15
  },

  // 16. Ghi Chép Thợ Rèn Bellhollow (sub_bell_workshop)
  read_blacksmith_journal: {
    id: 'read_blacksmith_journal',
    loreId: 'lore_blacksmith_journal',
    variant: 'parchment',
    title: 'GHI CHÉP THỢ RÈN: HỢP KIM XUA SƯƠNG',
    author: 'Bram – Thợ Rèn Bellhollow',
    ancientRune: 'ᛏ',
    pages: [
      '"Màn sương ngưng tụ từ rễ đại ngàn... Cần một hợp kim đặc biệt để tiếng chuông xuyên thủng The Veil. Phôi sắt khắc cổ ngữ Rad là chìa khóa duy nhất."',
      '"Năm xưa, một kỵ sĩ giáp đen rêu phong đã mang thanh đại kiếm của mình đến lò rèn này để tôi luyện cùng chuông đồng. Ánh mắt người đó kiên định như ngọn núi... Liệu họ có từng trở về từ màn sương sâu thẳm?"'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 15
  },

  // 17. Ghi Chép Dược Thảo Dưới Hầm Rễ (sub_root_cellar)
  inspect_root_cellar_alchemy: {
    id: 'inspect_root_cellar_alchemy',
    loreId: 'lore_root_cellar_alchemy',
    variant: 'parchment',
    title: 'GHI CHÉP DƯỢC THẢO DƯỚI HẦM RỄ',
    author: 'Bàn Thảo Mộc Rêu Phong Hầm Rễ',
    ancientRune: 'ᛚ',
    pages: [
      'Mẩu giấy ố vàng dán trên thành bàn đá phủ rêu dưới Hầm Rễ Cổ:\n\n"Loài Nấm Dạ Quang sinh trưởng bên cạnh rễ cây không hề mang độc tố như dân làng lầm tưởng. Nếu kết hợp dịch chiết nấm cùng cánh Hoa Mạch Rễ tím, nó sẽ tạo thành chất xúc tác ổn định tinh thần tuyệt hảo, chữa lành Hội Chứng Trắng Não do sương mù."',
      '"Dưới chân kệ thuốc có một phiến đá lỏng, gạt nhẹ sẽ mở ra hốc cất giấu thảo dược dự phòng cho người hữu duyên."'
    ],
    composureBonus: 20,
    rewardItem: { itemId: 'res_herbs', count: 2, nameVi: 'Thảo Dược Bạc' }
  },

  // 18. Tấm Bản Đồ Da Cừu Tại Miếu Chuông (broken_bell_shrine)
  inspect_shrine_parchment_map: {
    id: 'inspect_shrine_parchment_map',
    loreId: 'lore_shrine_parchment_map',
    variant: 'parchment',
    title: 'BẢN ĐỒ DA CỪU: HỘI TỤ MẠCH RỄ',
    author: 'Bản Đồ Chiến Lược Cổ Miếu Chuông',
    ancientRune: 'ᛗ',
    pages: [
      'Tấm bản đồ da cừu cào xước đặt trong ống da cạnh bậc thềm đổ nát:\n\nBản vẽ chi tiết mạng lưới rễ ngầm của thung lũng Hollow Woods. Mọi mạch rễ độc đều bắt nguồn từ Tâm Điểm The Veil và tỏa ra như mạng nhện khắp các ngóc ngách.',
      'Tại đỉnh Tháp Chuông, một vòng tròn cổ ngữ ghi rõ:\n\n"Tần số cộng hưởng của Đại Hồng Chung khi được gióng lên đủ 7 hồi sẽ kích hoạt sự sụp đổ của toàn bộ mạng rễ tha hóa, vĩnh viễn trục xuất màn sương khỏi thế giới thực."'
    ],
    composureBonus: 25
  },

  // =========================================================================
  // IV. CÁC VĂN BIA ĐÁ & BÍCH HỌA CỔ NGỮ (STELES & STONE INSCRIPTIONS)
  // =========================================================================

  // 19. Bia Đá Tưởng Niệm Đoàn Kỵ Sĩ (outer_woods)
  inspect_knights_memorial_stele: {
    id: 'inspect_knights_memorial_stele',
    loreId: 'lore_knights_memorial_stele',
    variant: 'stele',
    title: 'BIA ĐÁ TƯỞNG NIỆM ĐOÀN KỴ SĨ',
    author: 'Văn Bia Cổ Xưởng Chuông',
    ancientRune: 'ᛋ',
    pages: [
      'Nơi an nghỉ của 12 hiệp sĩ danh dự đã ngã xuống bảo vệ phòng tuyến Bellhollow trong Mùa Sương đầu tiên: Sir Cedric, Sir Vaelen, Sir Rowen, Sir Gareth, Sir Alistair...\n\nTên của người thủ lĩnh Đoàn Kỵ Sĩ Hắc Lang ở đầu văn bia đã bị một vết chém sâu cào mòn có chủ ý.',
      'Dưới chân bia đá có khắc dòng chữ nhỏ:\n\n"Fides Ultra Tenebras — Dù thân xác chôn vùi trong sương lạnh, lời thề giữ ngọn lửa sẽ mãi trường tồn."'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 15
  },

  // 20. Văn Bia Cổ: Lời Thề Hiệp Sĩ Đen (sub_bell_workshop)
  read_black_knight_stele: {
    id: 'read_black_knight_stele',
    loreId: 'lore_black_knight_chronicle',
    variant: 'stele',
    title: 'VĂN BIA CỔ: LỜI THỀ HẮC LANG',
    author: 'Khắc Đá Phế Tích Cổ',
    ancientRune: 'ᛋ',
    pages: [
      '"Theo tiếng cầu cứu từ rừng già, người dẫn dắt Đoàn Kỵ Sĩ Hắc Lang năm xưa đã bước vào tầng sương sâu không lối về, chỉ để lại lời thề bảo vệ Bellhollow."',
      '"Chừng nào Vòng Sáng Hộ Tâm [F] còn soi lối và tiếng chuông còn đọng lại trong tim người lữ khách, bóng đêm sẽ không bao giờ chiến thắng."'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 20
  },

  // 21. Cổ Thư Trận Đồ Đầm Lầy (silent_mire)
  read_rune_clue_stele: {
    id: 'read_rune_clue_stele',
    loreId: 'lore_runestones',
    variant: 'stele',
    title: 'CỔ THƯ ĐẦM LẦY: TRẬN ĐỒ CỘT ĐÁ',
    author: 'Khắc Cổ Bia Đá Đầm Lầy',
    ancientRune: 'ᚦ',
    pages: [
      '"Khi Trăng Khuyết soi bóng đáy nước (1), Rễ Sâu thức giấc đâm xuyên bùn lầy (2), Con Mắt viễn cổ mở ra dẫn lối qua đầm (3)."',
      'Ba cột đá cổ ngập nước bảo vệ lối vào Miếu Chuông. Chỉ khi kích hoạt đúng thứ tự cổ thư chỉ dẫn, bệ đá trung tâm mới giải phóng phong ấn dẫn vào đầm lầy sâu.'
    ],
    composureBonus: 10
  },

  // 22. Văn Bia Phế Tích Miếu Chuông (broken_bell_shrine)
  read_shrine_stele: {
    id: 'read_shrine_stele',
    loreId: 'lore_clapper_curse',
    variant: 'stele',
    title: 'BIA ĐÁ MIẾU CHUÔNG: LỜI NGUYỀN CÂM LẶNG',
    author: 'Văn Bia Phế Tích Miếu Chuông',
    ancientRune: 'ᚺ',
    pages: [
      '"Khi tiếng chuông vỡ câm lặng, Màn Sương The Veil sẽ nuốt chửng tất cả những gì rừng già từng chở che... Chỉ có tiếng ngân đầu tiên của Lưỡi Chuông Đồng mới có thể tái lập vòng phong ấn che chở cho Bellhollow."',
      '"Người lữ khách mang Vòng Sáng Hộ Tâm trong tim... Hãy lắng nghe lời thì thầm của đất đá và hoàn thành đại nghiệp đúc chuông để xua tan màn đêm vĩnh hằng."'
    ],
    composureBonus: 15
  },

  // 23. Bích Họa Cổ Nguồn Gốc Màn Sương (ancient_ruins)
  read_fog_origin_mural: {
    id: 'read_fog_origin_mural',
    loreId: 'lore_fog_origin',
    variant: 'stele',
    title: 'BÍCH HỌA CỔ: NGUỒN GỐC THE VEIL',
    author: 'Bích Họa Tường Đá Phế Tích Cổ',
    ancientRune: 'ᛖ',
    pages: [
      '"Màn sương The Veil không sinh ra từ bóng tối đơn thuần, mà là hơi thở của Rừng Rỗng khi quả chuông câm lặng và lời thề của những hiệp sĩ bị lãng quên..."',
      'Bức họa mô tả dòng người lữ hành quỳ gối dưới chân Tháp Chuông, ánh sáng hoàng kim từ đỉnh tháp xua tan những xúc tua bóng tối khổng lồ đang quấn quanh thung lũng.'
    ],
    composureBonus: 15
  }
};
