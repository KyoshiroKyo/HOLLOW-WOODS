/**
 * HOLLOW WOODS V1.4 - P2Game Leaderboard & Auth Service (JavaScript Export)
 * Tương thích đặc tả tệp src/services/LeaderboardService.js
 */

export const SURVIVAL_LEADERBOARD_ID = 'survival-score';

export class LeaderboardService {
  static instance = null;
  isSubmitting = false;
  lastSubmittedScore = 0;

  static getInstance() {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  calculateSurvivalScore(params = {}) {
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

  async ensureAuthenticated() {
    try {
      if (typeof window === 'undefined' || !window.p2?.auth) return null;
      let player = await window.p2.auth.getUser();
      if (window.p2.isStandalone) return player;
      if (!player || player.anonymous) {
        console.log('[LeaderboardService] Yêu cầu nền tảng hiển thị hộp thoại đăng nhập...');
        player = await window.p2.auth.requestLogin();
      }
      return player;
    } catch (err) {
      console.warn('[LeaderboardService] Người chơi từ chối hoặc lỗi khi yêu cầu đăng nhập:', err);
      return null;
    }
  }

  async submitSurvivalScore(params = {}) {
    if (this.isSubmitting) {
      console.log('[LeaderboardService] Đang trong tiến trình gửi điểm trước đó, bỏ qua.');
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

      const metadata = {
        day: Math.max(1, Math.floor(params.dayCount || 1)),
        zone: String(params.lastZone || 'unknown').slice(0, 32),
        deathReason: String(params.deathReason || 'Sinh lực cạn kiệt trong màn sương').slice(0, 120),
        composure: Math.round(params.composure ?? 0),
        secrets: (params.unlockedLoreCount || 0) + (params.relicsCount || 0),
        version: '1.4.0',
        at: new Date().toISOString()
      };

      await this.ensureAuthenticated();

      console.log(`[LeaderboardService] Đang gửi điểm sinh tồn: ${score} điểm...`, metadata);
      const result = await window.p2.leaderboard.submit(SURVIVAL_LEADERBOARD_ID, score, metadata);

      if (result && result.improved === true) {
        const rankStr = result.rank ? ` (Hạng #${result.rank})` : '';
        window.p2?.ui?.toast?.(`🎉 Kỷ lục mới! Điểm sinh tồn: ${score.toLocaleString()}${rankStr}`, 'success');
      } else if (result && result.accepted) {
        const pb = result.personalBest ? ` (Kỷ lục: ${result.personalBest.toLocaleString()})` : '';
        window.p2?.ui?.toast?.(`Đã ghi nhận điểm sinh tồn: ${score.toLocaleString()}${pb}`, 'info');
      }

      return result;
    } catch (err) {
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

  async getTopScores(limit = 10) {
    try {
      if (typeof window === 'undefined' || !window.p2?.leaderboard?.top) return [];
      const clampedLimit = Math.min(Math.max(1, limit), 50);
      return await window.p2.leaderboard.top(SURVIVAL_LEADERBOARD_ID, { limit: clampedLimit });
    } catch (err) {
      console.warn('[LeaderboardService] Lỗi khi lấy Top bảng xếp hạng:', err);
      return [];
    }
  }

  async getScoresAroundMe(range = 3) {
    try {
      if (typeof window === 'undefined' || !window.p2?.leaderboard?.aroundMe) return [];
      const clampedRange = Math.min(Math.max(1, range), 10);
      return await window.p2.leaderboard.aroundMe(SURVIVAL_LEADERBOARD_ID, { range: clampedRange });
    } catch (err) {
      console.warn('[LeaderboardService] Lỗi khi lấy thứ hạng quanh người chơi:', err);
      return [];
    }
  }

  getLastSubmittedScore() {
    return this.lastSubmittedScore;
  }
}
