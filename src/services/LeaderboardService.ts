/**
 * HOLLOW WOODS V1.4 - P2Game Leaderboard & Auth Service
 * Tích hợp Bảng Xếp Hạng Điểm Sinh Tồn (survival-score) qua window.p2.leaderboard
 * Tuân thủ nghiêm ngặt đặc tả P2Game SDK v1.1
 */

import { QA_BUILD } from '../debug/DevSessionPolicy';
import { P2GamePlayer, P2LeaderboardEntry, P2LeaderboardSubmitResult } from '../types/p2game';
import { DeveloperModeManager } from '../debug/DeveloperModeManager';

export const SURVIVAL_LEADERBOARD_ID = 'survival-score';

export interface SurvivalScoreParams {
  dayCount: number;
  composure: number;
  unlockedLoreCount?: number;
  visitedZonesCount?: number;
  completedQuestsCount?: number;
  relicsCount?: number;
}

export interface SubmitScoreParams extends SurvivalScoreParams {
  lastZone?: string;
  deathReason?: string;
}

export interface SurvivalMetadata {
  day: number;
  zone: string;
  deathReason: string;
  composure: number;
  secrets: number;
  version: string;
  at: string;
}

export class LeaderboardService {
  private static instance: LeaderboardService | null = null;
  private isSubmitting: boolean = false;
  private lastSubmittedScore: number = 0;

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * 1. Tính toán điểm sinh tồn từ số ngày sống sót, chỉ số Bình Tâm và bí mật/cổ vật
   * Điểm dao động từ 10 đến 1,000,000 (theo maxScore khai báo trong p2game.json)
   */
  public calculateSurvivalScore(params: SurvivalScoreParams): number {
    const day = Math.max(1, Math.floor(params.dayCount || 1));
    const dayPoints = day * 1000;

    const composure = Math.max(0, Math.min(100, Math.floor(params.composure ?? 0)));
    const composurePoints = composure * 10;

    const loreCount = Math.max(0, Math.floor(params.unlockedLoreCount || 0));
    const lorePoints = loreCount * 250;

    const zoneCount = Math.max(0, Math.floor(params.visitedZonesCount || 0));
    const zonePoints = zoneCount * 150;

    const questCount = Math.max(0, Math.floor(params.completedQuestsCount || 0));
    const questPoints = questCount * 500;

    const relicCount = Math.max(0, Math.floor(params.relicsCount || 0));
    const relicPoints = relicCount * 1000;

    const total = dayPoints + composurePoints + lorePoints + zonePoints + questPoints + relicPoints;
    return Math.min(1000000, Math.max(10, Math.round(total)));
  }

  /**
   * 2. Kiểm tra trạng thái người chơi và yêu cầu đăng nhập nền tảng nếu cần
   * Tuyệt đối không tự tạo form đăng nhập riêng theo quy tắc P2Game
   */
  public async ensureAuthenticated(): Promise<P2GamePlayer | null> {
    try {
      if (typeof window === 'undefined' || !window.p2?.auth) {
        return null;
      }

      // Lấy thông tin người chơi hiện tại
      let player = await window.p2.auth.getUser();

      // Nếu đang chạy độc lập (standalone), cho phép dùng tài khoản giả lập
      if (window.p2.isStandalone) {
        return player;
      }

      // Nếu chạy trong nền tảng nhưng chưa đăng nhập hoặc là khách vô danh, gọi requestLogin()
      if (!player || player.anonymous) {
        console.log('[LeaderboardService] Yêu cầu nền tảng hiển thị hộp thoại đăng nhập...');
        player = await window.p2.auth.requestLogin();
      }

      return player;
    } catch (err: any) {
      console.warn('[LeaderboardService] Người chơi từ chối hoặc lỗi khi yêu cầu đăng nhập:', err);
      return null;
    }
  }

  /**
   * 3. Gửi điểm sinh tồn lên Bảng xếp hạng P2Game (survival-score)
   * Metadata luôn được đảm bảo kích thước dưới 1 KB (khoảng 150-200 bytes)
   */
  public async submitSurvivalScore(params: SubmitScoreParams): Promise<P2LeaderboardSubmitResult | null> {
    if (QA_BUILD || DeveloperModeManager.getInstance().isDevSession) {
      console.warn('[DevMode] Đã chặn gửi điểm BXH vì phiên chơi có dùng công cụ Developer');
      return { accepted: false, reason: 'developer_mode_session' };
    }

    if (this.isSubmitting) {
      console.log('[LeaderboardService] Đang trong tiến trình gửi điểm trước đó, bỏ qua lệnh trùng lặp.');
      return null;
    }

    this.isSubmitting = true;

    try {
      if (typeof window === 'undefined' || !window.p2?.leaderboard?.submit) {
        console.warn('[LeaderboardService] window.p2.leaderboard.submit không khả dụng.');
        return null;
      }

      const score = this.calculateSurvivalScore(params);
      this.lastSubmittedScore = score;

      // Chuẩn bị metadata dung lượng nhỏ (dưới 1 KB)
      const metadata: SurvivalMetadata = {
        day: Math.max(1, Math.floor(params.dayCount || 1)),
        zone: String(params.lastZone || 'unknown').slice(0, 32),
        deathReason: String(params.deathReason || 'Sinh lực cạn kiệt trong màn sương').slice(0, 120),
        composure: Math.round(params.composure ?? 0),
        secrets: (params.unlockedLoreCount || 0) + (params.relicsCount || 0),
        version: '1.5.2',
        at: new Date().toISOString()
      };

      // Đảm bảo kích thước metadata an toàn dưới 1024 bytes
      const metaJson = JSON.stringify(metadata);
      if (metaJson.length > 900) {
        metadata.deathReason = metadata.deathReason.slice(0, 60);
      }

      // Xác thực người chơi nếu cần
      await this.ensureAuthenticated();
      if (!DeveloperModeManager.getInstance().canReportProgress()) {
        return { accepted: false, reason: 'developer_mode_session' };
      }

      console.log(`[LeaderboardService] Đang gửi điểm sinh tồn: ${score} điểm...`, metadata);
      const result = await window.p2.leaderboard.submit(SURVIVAL_LEADERBOARD_ID, score, metadata);
      console.log('[LeaderboardService] Kết quả gửi điểm:', result);

      // Hiển thị toast thông báo kết quả
      if (result && result.improved === true) {
        const rankStr = result.rank ? ` (Hạng #${result.rank})` : '';
        const msg = `🎉 Kỷ lục mới! Điểm sinh tồn: ${score.toLocaleString()}${rankStr}`;
        window.p2?.ui?.toast?.(msg, 'success');
      } else if (result && result.accepted) {
        const pb = result.personalBest ? ` (Kỷ lục: ${result.personalBest.toLocaleString()})` : '';
        const msg = `Đã ghi nhận điểm sinh tồn: ${score.toLocaleString()}${pb}`;
        window.p2?.ui?.toast?.(msg, 'info');
      }

      return result;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'UNAUTHENTICATED') {
        console.warn('[LeaderboardService] UNAUTHENTICATED: Người chơi chưa đăng nhập.');
        window.p2?.ui?.toast?.('Vui lòng đăng nhập p2game để lưu điểm sinh tồn lên bảng xếp hạng.', 'warning');
      } else if (code === 'SCORE_REJECTED') {
        console.warn('[LeaderboardService] SCORE_REJECTED:', err.message);
        window.p2?.ui?.toast?.('Điểm số không hợp lệ hoặc phiên chơi chưa đủ 30 giây.', 'warning');
      } else if (code === 'RATE_LIMITED') {
        const waitSec = Math.ceil((err.retryAfterMs ?? 5000) / 1000);
        console.warn(`[LeaderboardService] RATE_LIMITED: Thử lại sau ${waitSec}s.`);
        window.p2?.ui?.toast?.(`Gửi điểm quá nhanh, vui lòng đợi ${waitSec} giây.`, 'warning');
      } else {
        console.warn('[LeaderboardService] Lỗi khi gửi điểm bảng xếp hạng:', err);
      }
      return null;
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * 4. Lấy danh sách Top bảng xếp hạng điểm sinh tồn (mặc định WEEKLY limit 10)
   */
  public async getTopScores(limit: number = 10, timeWindow: 'ALL_TIME' | 'DAILY' | 'WEEKLY' = 'WEEKLY'): Promise<P2LeaderboardEntry[]> {
    try {
      if (typeof window === 'undefined' || !window.p2?.leaderboard?.top) {
        return [];
      }
      const clampedLimit = Math.min(Math.max(1, limit), 50);
      return await window.p2.leaderboard.top(SURVIVAL_LEADERBOARD_ID, { limit: clampedLimit, window: timeWindow });
    } catch (err: any) {
      this.handleLeaderboardError('getTopScores', err);
      return [];
    }
  }

  /**
   * 5. Lấy danh sách thứ hạng quanh người chơi hiện tại (mặc định range 3)
   */
  public async getScoresAroundMe(range: number = 3, timeWindow: 'ALL_TIME' | 'DAILY' | 'WEEKLY' = 'WEEKLY'): Promise<P2LeaderboardEntry[]> {
    try {
      if (typeof window === 'undefined' || !window.p2?.leaderboard?.aroundMe) {
        return [];
      }
      const clampedRange = Math.min(Math.max(1, range), 10);
      return await window.p2.leaderboard.aroundMe(SURVIVAL_LEADERBOARD_ID, { range: clampedRange, window: timeWindow });
    } catch (err: any) {
      this.handleLeaderboardError('getScoresAroundMe', err);
      return [];
    }
  }

  /**
   * Bọc xử lý lỗi chuẩn P2GameError: UNAUTHENTICATED, SCORE_REJECTED, RATE_LIMITED
   */
  private handleLeaderboardError(action: string, err: any): void {
    const code = err?.code || '';
    if (code === 'UNAUTHENTICATED') {
      console.warn(`[LeaderboardService] ${action}: Người chơi chưa đăng nhập.`);
      window.p2?.ui?.toast?.('Vui lòng đăng nhập để đồng bộ bảng xếp hạng.', 'warning');
    } else if (code === 'SCORE_REJECTED') {
      console.warn(`[LeaderboardService] ${action}: Điểm số bị từ chối (${err?.message}).`);
      window.p2?.ui?.toast?.('Điểm số không được chấp nhận hoặc phiên chơi không hợp lệ.', 'warning');
    } else if (code === 'RATE_LIMITED') {
      const waitSec = Math.ceil((err.retryAfterMs ?? 5000) / 1000);
      console.warn(`[LeaderboardService] ${action}: Bị giới hạn tần suất, đợi ${waitSec}s.`);
      window.p2?.ui?.toast?.(`Thao tác quá nhanh, vui lòng đợi ${waitSec} giây.`, 'warning');
    } else {
      console.warn(`[LeaderboardService] ${action} lỗi:`, err?.message || err);
    }
  }

  public getLastSubmittedScore(): number {
    return this.lastSubmittedScore;
  }
}
