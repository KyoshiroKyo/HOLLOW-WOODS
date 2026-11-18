/**
 * P2Game SDK TypeScript Definitions
 * SDK Version: 1.1 (https://games.p2game.io/sdk/p2game-sdk.v1.js)
 */

export interface P2GameInitOptions {
  timeoutMs?: number;
  allowStandalone?: boolean;
  debug?: boolean;
}

export interface P2GamePlayer {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  anonymous?: boolean;
}

export interface P2GameContext {
  protocolVersion: string;
  gameId: string;
  sessionId: string;
  player: P2GamePlayer;
  locale: string;
  permissions: string[];
  leaderboards?: any[];
  multiplayer?: any;
}

export interface P2LeaderboardSubmitResult {
  accepted: boolean;
  rank?: number;
  personalBest?: number;
  improved?: boolean;
  reason?: string;
}

export interface P2LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  achievedAt: string;
  isMe?: boolean;
  meta?: Record<string, any>;
}

export interface P2LeaderboardTopOptions {
  limit?: number;
  window?: 'ALL_TIME' | 'DAILY' | 'WEEKLY';
}

export interface P2LeaderboardAroundMeOptions {
  range?: number;
  window?: 'ALL_TIME' | 'DAILY' | 'WEEKLY';
}

export interface P2LeaderboardAPI {
  submit(leaderboardId: string, score: number, meta?: Record<string, any>): Promise<P2LeaderboardSubmitResult>;
  top(leaderboardId: string, opts?: P2LeaderboardTopOptions): Promise<P2LeaderboardEntry[]>;
  aroundMe(leaderboardId: string, opts?: P2LeaderboardAroundMeOptions): Promise<P2LeaderboardEntry[]>;
}

export interface P2AuthAPI {
  getUser(): Promise<P2GamePlayer | null>;
  requestLogin(): Promise<P2GamePlayer | null>;
  onChange(fn: (player: P2GamePlayer | null) => void): () => void;
}

export interface P2UIAPI {
  toast(message: string, tone?: 'info' | 'success' | 'warning' | 'error'): void;
  requestFullscreen(): Promise<boolean>;
}

export interface P2StorageAPI {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any): Promise<void>;
  delete?(key: string): Promise<void>;
  remove?(key: string): Promise<void>;
  keys?(): Promise<string[]>;
}

export interface P2GameSDK {
  readonly isStandalone: boolean;
  readonly player: P2GamePlayer | null;
  auth?: P2AuthAPI;
  leaderboard?: P2LeaderboardAPI;
  storage?: P2StorageAPI;
  ui?: P2UIAPI;
  init(options?: P2GameInitOptions): Promise<P2GameContext>;
  ready(): void;
  gameOver(payload?: Record<string, any>): void;
  onPause(fn: () => void): () => void;
  onResume(fn: () => void): () => void;
  onBeforeUnload(fn: () => void): () => void;
  destroy(): void;
  [key: string]: any;
}

declare global {
  interface Window {
    p2?: P2GameSDK;
    p2game?: P2GameSDK;
  }
}
