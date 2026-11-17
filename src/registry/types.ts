/**
 * HOLLOW WOODS V1.4 — HỆ THỐNG MÃ ĐỊNH DANH 4 TẦNG & TỪ ĐIỂN NỘI DUNG (CONTENT REGISTRY)
 * 
 * Tầng 1: Content ID (Mã định danh nội dung bất biến) -> HW-[TYPE]-[SUBTYPE]-[SEQ]
 * Tầng 2: Runtime / Legacy Key (Khóa đang dùng trong code & save cũ) -> snake_case
 * Tầng 3: Asset ID (Mã tài nguyên đồ họa/âm thanh) -> HW-AST-[CAT]-[SEQ]
 * Tầng 4: Development ID (Công việc phát triển) & Mod Namespace
 */

export type ContentType = 
  | 'ITM' // Vật phẩm, nguyên liệu, tiêu hao, công cụ, nhiệm vụ
  | 'WPN' // Vũ khí tự vệ
  | 'EQP' // Trang bị cá nhân
  | 'ANI' // Động vật môi trường & hoang dã
  | 'MON' // Thực thể siêu nhiên & Boss
  | 'NPC' // Nhân vật & dân làng
  | 'ZON' // Khu vực & tiểu khu
  | 'QST' // Nhiệm vụ cốt truyện & phụ
  | 'DIA' // Hội thoại
  | 'LOR' // Nhật ký, bản ghi ký ức
  | 'RCP' // Công thức chế tạo & nấu ăn
  | 'CRP' // Cây trồng & nông trại
  | 'TRP' // Bẫy & mồi nhử
  | 'PUZ' // Câu đố & cổ ngữ
  | 'SYS' // Hệ thống gameplay có dữ liệu
  | 'EVT' // Sự kiện thế giới & thời tiết
  | 'MOD' // Gói nội dung tích hợp (Content Pack)
  | 'AST' // Tài nguyên asset
  | 'ACH';// Thành tựu

export type ContentStatus = 
  | 'CONFIRMED_V1_3'  // Đang chạy thực tế trong V1.3
  | 'PROPOSED_V1_4'   // Đề xuất mới cho V1.4
  | 'DEPRECATED'      // Ngừng dùng nhưng giữ để tương thích save cũ
  | 'RETIRED';        // Đã xóa hoàn toàn

export interface AssetRecord {
  assetId: string;           // HW-AST-[CAT]-[SEQ]
  category: 'ICON' | 'CHAR' | 'NPC' | 'ENV' | 'TILE' | 'ANIM' | 'UI' | 'SFX' | 'MUS' | 'VFX';
  filePath: string;          // Đường dẫn tương đối
  dimensions?: { width: number; height: number };
  frameMap?: Record<string, number | number[]>;
  licenseRef?: string;       // Thông tin giấy phép bản quyền
}

export interface ContentEntry {
  id: string;                // Tầng 1: Content ID (VD: HW-ITM-RES-000001)
  type: ContentType;
  subType: string;           // RES, MAT, FOOD, CNS, MEL, BODY, etc.
  slug: string;              // Chuỗi nhận diện ngắn (VD: dry_wood)
  nameVi: string;            // Tên tiếng Việt chính thức
  nameEn: string;            // Tên tiếng Anh chính thức
  descriptionVi?: string;
  descriptionEn?: string;
  runtimeKey: string;        // Tầng 2: Khóa runtime/legacy key (VD: res_dry_wood)
  aliases?: string[];        // Các tên gọi hoặc key thay thế (VD: ["pine_resin", "res_pine_resin"])
  status: ContentStatus;
  introducedIn: string;      // '1.0.0', '1.3.0', '1.4.0'
  assetRefs?: string[];      // Tầng 3: Danh sách Asset ID tham chiếu
  dependencies?: string[];   // Các Content ID cần có trước
  tags?: string[];           // Nhãn phân loại
  meta?: Record<string, any>;// Thuộc tính dữ liệu bổ sung
}

export interface RegistryValidationResult {
  isValid: boolean;
  totalEntries: number;
  duplicateIds: string[];
  duplicateRuntimeKeys: string[];
  unresolvedAssetRefs: string[];
  issues: string[];
}
