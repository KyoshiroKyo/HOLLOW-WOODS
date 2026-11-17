import * as Phaser from 'phaser';
import { TheEcho } from './TheEcho';
import { EchoSpec } from '../types';

/**
 * HOLLOW WOODS V1.4 — ECHO APPARITION (BÓNG MA TIẾNG VỌNG KÝ ỨC)
 * Thực thể / bí danh của TheEcho:
 * - Đại diện cho hiện tượng bóng ma ký ức mờ ảo trong sương.
 * - Tác động ánh nhìn: Giảm -5 Composure khi người chơi nhìn trực diện trong bóng tối (đèn lồng TẮT).
 * - Tan biến thành tàn tro phát sáng kèm thì thầm ký ức khi tiếp cận lại gần.
 */
export class EchoApparition extends TheEcho {
  constructor(scene: Phaser.Scene, spec: EchoSpec) {
    super(scene, spec);
  }
}
