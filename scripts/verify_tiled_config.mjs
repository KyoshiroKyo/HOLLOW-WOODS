import { TILED_PIPELINE_CONFIG } from '../src/config/tiledPipelineConfig.js';

console.log('TILED_PIPELINE_CONFIG verification:');
console.log(TILED_PIPELINE_CONFIG);

if (
  TILED_PIPELINE_CONFIG.enableYSortingModule === true &&
  TILED_PIPELINE_CONFIG.enableCullingOptimization === true &&
  TILED_PIPELINE_CONFIG.enableAutoPerimeterWalls === true &&
  TILED_PIPELINE_CONFIG.debugDrawModuleLogs === false
) {
  console.log('PASS: All 4 configuration flags match user specification exactly!');
} else {
  console.error('FAIL: Configuration does not match specification!');
  process.exit(1);
}
