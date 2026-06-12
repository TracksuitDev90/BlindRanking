// Loads topics.js and config.js (browser globals) into Node via a `window` stub,
// so the build pipeline reads the exact same data the app ships with.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function loadTopics(repoRoot) {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const file of ['config.js', 'topics.js']) {
    const src = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    vm.runInContext(src, ctx, { filename: file });
  }
  return {
    topics: window.TOPICS || [],
    moods: window.BR_MOODS || [],
    config: window.BR_CONFIG || {}
  };
}
