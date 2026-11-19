/**
 * HOLLOW WOODS V1.5 - DỮ LIỆU CÁC MẨU NHẬT KÝ & CỔ THƯ THẾ GIỚI
 * (TORN PAGES & ARCHAEOLOGICAL CLUES DATA REGISTRY)
 */

export interface TornPageEntry {
  id: string;                      // Action ID trên bản đồ (e.g. 'inspect_fog_journal_1')
  loreId: string;                  // Lore ID trong lore.json đồng bộ với Sổ Tay [J]
  title: string;                   // Tiêu đề trang giấy
  author: string;                  // Tác giả / Nguồn gốc
  ancientRune: string;             // Ký hiệu cổ ngữ (e.g. 'ᚱ', 'ᛉ', 'ᛏ', 'ᚠ', 'ᛋ')
  pages: string[];                 // Nội dung chia theo từng trang đọc
  memoryAwakeningStage?: number;   // Cập nhật tiến trình Thức Tỉnh Ký Ức nếu có
  composureBonus?: number;         // Điểm hồi phục Bình Tâm lần đầu đọc
  rewardItem?: { itemId: string; count: number; nameVi: string }; // Phần thưởng vật phẩm đính kèm nếu có
}

export const TORN_PAGES_REGISTRY: Record<string, TornPageEntry> = {
  // 1. Mẩu Nhật Ký Rách #1 tại Fog Crossing (Cổng vòm đá vào rừng)
  inspect_fog_journal_1: {
    id: 'inspect_fog_journal_1',
    loreId: 'lore_fog_journal_1',
    title: 'MẨU NHẬT KÝ RÁCH: KẺ ĐI TRƯỚC',
    author: 'Người Lữ Hành Vô Danh – Fog Crossing',
    ancientRune: 'ᚱ',
    pages: [
      'Màn sương đen The Veil đã nuốt chửng lối quay về. Nó không chỉ là hơi sương giá buốt đơn thuần, mà là một thực thể sống đang thì thầm gọi tên từng người bước vào đại ngàn...\n\nNếu ngươi còn giữ được lý trí, hãy lần theo tiếng chuông ngân trầm và ánh đèn bão màu hổ phách phía Đông để tìm đến ngôi làng Bellhollow.',
      'Quy tắc sinh tồn duy nhất: Đừng bao giờ tắt đèn lồng quá lâu giữa bóng tối. Khi bình tâm suy kiệt, bóng ma The Tendril sẽ bóp nghẹt buồng phổi của ngươi.\n\nTa để lại mẩu giấy này tại cổng vòm đá trước khi bước vào đầm lầy... Cầu mong Đại Hồng Chung sẽ ngân vang trở lại.'
    ],
    composureBonus: 10
  },

  // 2. Trang Nhật Ký Ướt Sương của Thợ Đúc Chuông (sub_bell_workshop)
  inspect_bellmaker_dew_journal: {
    id: 'inspect_bellmaker_dew_journal',
    loreId: 'lore_bellmaker_dew_journal',
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

  // 3. Bức Thư Chưa Kịp Gửi của Elian (outer_woods)
  inspect_elian_unsent_letter: {
    id: 'inspect_elian_unsent_letter',
    loreId: 'lore_elian_unsent_letter',
    title: 'BỨC THƯ CHƯA KỊP GỬI CỦA ELIAN',
    author: 'Elian – Em Trai Người Gác Cổng Garth',
    ancientRune: 'ᚠ',
    pages: [
      'Lá thư gấp vội nhét trong hốc cây khô ven đường mòn hiểm trở:\n\n"Anh Garth thân mến, nếu anh đọc được bức thư này, nghĩa là đội tuần tra chúng em đã bị Kỵ Binh Hắc Ám mai phục... Đừng phái người ra tìm kiếm em! Hãy khóa chặt cổng làng phía Tây, thắp đuốc thật sáng dọc tường rào."',
      '"Lũ quái vật sợ ánh lửa rọi thẳng vào mắt! Chiếc đèn tuần tra của em đã vỡ ở bờ suối... Hãy tha thứ cho em vì không thể cùng anh uống cạn vò rượu mùa thu năm nay. Hãy giữ vững cổng làng, người anh trai dũng cảm của em."'
    ],
    composureBonus: 15
  },

  // 4. Ghi Chép Thợ Rèn Bellhollow (sub_bell_workshop)
  read_blacksmith_journal: {
    id: 'read_blacksmith_journal',
    loreId: 'lore_blacksmith_journal',
    title: 'GHI CHÉP THỢ RÈN: HỢP KIM XUA SƯƠNG',
    author: 'Bram – Thợ Rèn Bellhollow',
    ancientRune: 'ᛏ',
    pages: [
      '"Màn sương ngưng tụ từ rễ đại ngàn... Cần một hợp kim đặc biệt để tiếng chuông xuyên thủng The Veil. Phôi sắt khắc cổ ngữ Rad là chìa khóa duy nhất."',
      '"Năm xưa, vị Chỉ Huy Hiệp Sĩ Đen đã mang thanh đại kiếm của mình đến lò rèn này để tôi luyện cùng chuông đồng. Ánh mắt ngài kiên định như ngọn núi... Liệu ngài có còn sống sót giữa đầm lầy sâu thẳm?"'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 15
  },

  // 5. Văn Bia Tưởng Niệm Đoàn Kỵ Sĩ & Hiệp Sĩ Đen (outer_woods / sub_bell_workshop)
  inspect_knights_memorial_stele: {
    id: 'inspect_knights_memorial_stele',
    loreId: 'lore_knights_memorial_stele',
    title: 'BIA ĐÁ TƯỞNG NIỆM ĐOÀN KỴ SĨ',
    author: 'Văn Bia Cổ Xưởng Chuông',
    ancientRune: 'ᛋ',
    pages: [
      'Nơi an nghỉ của 12 hiệp sĩ danh dự đã ngã xuống bảo vệ phòng tuyến Bellhollow trong Mùa Sương đầu tiên: Sir Cedric, Sir Valen, Sir Rowen, Sir Gareth, Sir Alistair...\n\nTên của vị Tổng Chỉ Huy ở đầu văn bia đã bị một vết chém sâu cào mòn có chủ ý.',
      'Dưới chân bia đá có khắc dòng chữ nhỏ bằng máu khô:\n\n"Dù thân xác chôn vùi trong sương lạnh, lời thề giữ ngọn lửa sẽ mãi trường tồn. Chỉ Huy sẽ trở lại khi Đại Hồng Chung vang hồi thứ bảy."'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 15
  },
  read_black_knight_stele: {
    id: 'read_black_knight_stele',
    loreId: 'lore_black_knight_chronicle',
    title: 'VĂN BIA CỔ: LỜI THỀ HIỆP SĨ ĐEN',
    author: 'Khắc Đá Phế Tích Cổ',
    ancientRune: 'ᛋ',
    pages: [
      '"Hiệp Sĩ Đen — vị chỉ huy duy nhất năm xưa dám tiến vào tâm điểm Mạch Rễ để phong ấn lời nguyền và chấp nhận đánh đổi toàn bộ ký ức của chính mình."',
      '"Chừng nào ngọn đèn bão còn soi lối và tiếng chuông còn đọng lại trong tim người lữ khách, bóng đêm sẽ không bao giờ chiến thắng."'
    ],
    memoryAwakeningStage: 1,
    composureBonus: 20
  },

  // 6. Ghi Chép Dược Thảo Dưới Hầm Rễ (sub_root_cellar)
  inspect_root_cellar_alchemy: {
    id: 'inspect_root_cellar_alchemy',
    loreId: 'lore_root_cellar_alchemy',
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

  // 7. Bảng Tin Dị Thường Bellhollow
  read_bellhollow_notice_board: {
    id: 'read_bellhollow_notice_board',
    loreId: 'lore_three_rules',
    title: 'BẢNG TIN DỊ THƯỜNG BELLHOLLOW',
    author: 'Hội Đồng Làng Bellhollow',
    ancientRune: '📜',
    pages: [
      'CẢNH BÁO TÌNH HÌNH CÁC PHÂN KHU XUNG QUANH LÀNG:\n\n• Tây Bắc: Khói đen tắt tại Trạm Kiểm Lâm Rừng Ngoài. Dầu đèn dự trữ vẫn còn trong rương gỗ.\n• Đông Nam: Tiếng chuông chìm đáy Đầm Lầy Sương Mù. Cần người vượt cầu ván khảo sát miếu cổ.\n• Đông Bắc: Cột Vật Tổ Thì Thầm cảnh báo quái vật rình rập ở Rừng Sâu.',
      'BA QUY TẮC BẰNG MÁU:\n1. Đừng trả lời khi rừng gọi tên bạn.\n2. Đừng đi theo chiếc đèn thứ hai trong sương mù.\n3. Tuyệt đối không rung chuông khi sương mù đã tràn qua rào làng!'
    ],
    composureBonus: 10
  },

  // 8. Tấm Bản Đồ Da Cừu Tại Miếu Chuông (broken_bell_shrine)
  inspect_shrine_parchment_map: {
    id: 'inspect_shrine_parchment_map',
    loreId: 'lore_shrine_parchment_map',
    title: 'BẢN ĐỒ DA CỪU: HỘI TỤ MẠCH RỄ',
    author: 'Bản Đồ Chiến Lược Cổ Miếu Chuông',
    ancientRune: 'ᛗ',
    pages: [
      'Tấm bản đồ da cừu cào xước đặt trong ống da cạnh bậc thềm đổ nát:\n\nBản vẽ chi tiết mạng lưới rễ ngầm của thung lũng Hollow Woods. Mọi mạch rễ độc đều bắt nguồn từ Tâm Điểm The Veil và tỏa ra như mạng nhện khắp các ngóc ngách.',
      'Tại đỉnh Tháp Chuông, một vòng tròn cổ ngữ ghi rõ:\n\n"Tần số cộng hưởng của Đại Hồng Chung khi được gióng lên đủ 7 hồi sẽ kích hoạt sự sụp đổ của toàn bộ mạng rễ tha hóa, vĩnh viễn trục xuất màn sương khỏi thế giới thực."'
    ],
    composureBonus: 25
  },

  // 9. Cổ Thư Trận Đồ Đầm Lầy (silent_mire)
  read_rune_clue_stele: {
    id: 'read_rune_clue_stele',
    loreId: 'lore_runestones',
    title: 'CỔ THƯ ĐẦM LẦY: TRẬN ĐỒ CỘT ĐÁ',
    author: 'Khắc Cổ Bia Đá Đầm Lầy',
    ancientRune: 'ᚦ',
    pages: [
      '"Khi Trăng Khuyết soi bóng đáy nước (1), Rễ Sâu thức giấc đâm xuyên bùn lầy (2), Con Mắt viễn cổ mở ra dẫn lối qua đầm (3)."',
      'Ba cột đá cổ ngập nước bảo vệ lối vào Miếu Chuông. Chỉ khi kích hoạt đúng thứ tự cổ thư chỉ dẫn, bệ đá trung tâm mới giải phóng phong ấn dẫn vào đầm lầy sâu.'
    ],
    composureBonus: 10
  },

  // 10. Văn Bia Phế Tích Miếu Chuông (broken_bell_shrine)
  read_shrine_stele: {
    id: 'read_shrine_stele',
    loreId: 'lore_clapper_curse',
    title: 'BIA ĐÁ MIẾU CHUÔNG: LỜI NGUYỀN CÂM LẶNG',
    author: 'Văn Bia Phế Tích Miếu Chuông',
    ancientRune: 'ᚺ',
    pages: [
      '"Khi tiếng chuông vỡ câm lặng, Màn Sương The Veil sẽ nuốt chửng tất cả những gì rừng già từng chở che... Chỉ có tiếng ngân đầu tiên của Lưỡi Chuông Đồng mới có thể tái lập vòng phong ấn che chở cho Bellhollow."',
      '"Người lữ khách mang ngọn đèn bão trong tay... Hãy lắng nghe lời thì thầm của đất đá và hoàn thành đại nghiệp đúc chuông để xua tan màn đêm vĩnh hằng."'
    ],
    composureBonus: 15
  },

  // 11. Bích Họa Cổ Nguồn Gốc Màn Sương (ancient_ruins)
  read_fog_origin_mural: {
    id: 'read_fog_origin_mural',
    loreId: 'lore_fog_origin',
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
