const env = (import.meta as ImportMeta & {
  env?: { DEV?: boolean; VITE_HOLLOW_WOODS_QA?: string };
}).env;

export const QA_BUILD = env?.DEV === true || env?.VITE_HOLLOW_WOODS_QA === '1';
export const QA_SAVE_KEY = 'hollow_woods_qa_v1_savegame';
export const QA_SETTINGS_KEY = 'hollow_woods_qa_settings';
export const GRAPHICS_QUALITY_KEY = QA_BUILD ? 'hw_qa_graphics_quality' : 'hw_graphics_quality';

/**
 * HW-STAB-34: Kiểm tra cờ QA thuần compile-time (KHÔNG cho phép runtime override trong production bundle)
 */
export function isQABuild(): boolean {
  return QA_BUILD;
}

/**
 * HW-STAB-34: Hàm chọn key cấu hình thuần (pure helper) hỗ trợ kiểm thử không phụ thuộc runtime override
 */
export function resolveSettingsStorageKey(isQa: boolean = QA_BUILD): string {
  return isQa ? QA_SETTINGS_KEY : 'hollow_woods_settings';
}

/**
 * HW-STAB-34: Hàm chọn key lưu game thuần (pure helper)
 */
export function resolveSaveStorageKey(isQa: boolean = QA_BUILD): string {
  return isQa ? QA_SAVE_KEY : 'hollow_woods_v1_savegame';
}

/**
 * HW-STAB-34: Hàm chọn key chất lượng đồ họa thuần (pure helper)
 */
export function resolveGraphicsQualityKey(isQa: boolean = QA_BUILD): string {
  return isQa ? 'hw_qa_graphics_quality' : 'hw_graphics_quality';
}

if (typeof window !== 'undefined') {
  (window as any).__DEV_SESSION_POLICY__ = {
    isQABuild,
    resolveSettingsStorageKey,
    resolveSaveStorageKey,
    resolveGraphicsQualityKey,
    QA_BUILD,
    QA_SAVE_KEY,
    QA_SETTINGS_KEY
  };
}
