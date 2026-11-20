import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/services/LeaderboardService.ts', import.meta.url))],
  bundle: true,
  write: false,
  format: 'esm',
  define: { 'import.meta.env': JSON.stringify({ DEV: false }) },
  plugins: [{
    name: 'mock-dev-session',
    setup(builder) {
      builder.onResolve({ filter: /\/DeveloperModeManager$/ }, () => ({ path: 'dev-session', namespace: 'test' }));
      builder.onLoad({ filter: /^dev-session$/, namespace: 'test' }, () => ({
        contents: `export const DeveloperModeManager = { getInstance: () => globalThis.qaDeveloperSession };`
      }));
    }
  }]
});
const url = 'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64');

let resolveAuthentication;
let authCalls = 0;
let submissions = 0;
globalThis.qaDeveloperSession = {
  isDevSession: false,
  canReportProgress() { return !this.isDevSession; }
};
globalThis.window = {
  p2: {
    auth: { getUser: () => {
      authCalls++;
      return new Promise(resolve => { resolveAuthentication = resolve; });
    } },
    leaderboard: { submit: async (board) => {
      assert.equal(board, 'survival-score');
      submissions++;
      return { accepted: true };
    } }
  }
};

const { LeaderboardService } = await import(url);
const service = LeaderboardService.getInstance();
const score = { dayCount: 2, composure: 50, lastZone: 'outer_woods' };
const clean = service.submitSurvivalScore(score);
assert.equal(await service.submitSurvivalScore(score), null);
resolveAuthentication({ id: 'qa-fixture', anonymous: false });
assert.deepEqual(await clean, { accepted: true });
assert.equal(submissions, 1);

const waiting = service.submitSurvivalScore(score);
qaDeveloperSession.isDevSession = true;
resolveAuthentication({ id: 'qa-fixture', anonymous: false });
const blocked = { accepted: false, reason: 'developer_mode_session' };
assert.deepEqual(await waiting, blocked);
assert.deepEqual(await service.submitSurvivalScore(score), blocked);
assert.equal(authCalls, 2);
assert.equal(submissions, 1);
console.log('PASS clean submit once, duplicate suppression, late Dev activation and blocked retry');
