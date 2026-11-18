export interface TiledPipelineConfig {
  enableYSortingModule: boolean;
  enableCullingOptimization: boolean;
  enableAutoPerimeterWalls: boolean;
  debugDrawModuleLogs: boolean;
}

export const TILED_PIPELINE_CONFIG: TiledPipelineConfig = {
  enableYSortingModule: true,       // Bật/tắt tự động phân lớp hiển thị trước-sau
  enableCullingOptimization: true,  // Bật/tắt tối ưu render & culling tilemap lớn
  enableAutoPerimeterWalls: true,   // Bật/tắt tự động dựng tường chặn chu vi map
  debugDrawModuleLogs: false,       // In log chi tiết từng module ra Console
};
