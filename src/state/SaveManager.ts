/**
 * HOLLOW WOODS V1.4 — NON-DESTRUCTIVE SAFE SAVE MIGRATOR & MANAGER
 * File: src/state/SaveManager.ts
 *
 * Cho phép truy cập SaveManager đồng thời từ src/state/SaveManager hoặc src/systems/SaveManager:
 * - Tự động nhận diện save V1.3 qua saveVersion / saveSchemaVersion.
 * - Bảo toàn 100% trường dữ liệu và runtimeKey cũ (inventory, questFlags, v.v.).
 * - Điền giá trị mặc định an toàn V1.4 (dayCount=1, timeOfDay=0, moisture=0, temperature=80, equippedSlots, storageChestInventory, unlockedBestiary).
 * - Lưu giữ khóa lạ không xác định vào legacyExtraData.
 * - Sao lưu dự phòng an toàn trước khi di trú vào hollow_woods_save_backup_v1_3 và hollow_woods_save_backup_v13.
 */
import { SaveManager } from '../systems/SaveManager';
export * from '../systems/SaveManager';
export default SaveManager;
