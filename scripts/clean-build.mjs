/**
 * XXL 塔防 — 清理构建缓存 (pnpm clean)
 *
 * 删除 Cocos 导入缓存 library/ 与构建产物 build/，确保下次构建从干净状态开始：
 *   - library/：Cocos 工程导入缓存(约 36MB)。若保留「温/陈旧」缓存，Cocos 会复用旧的全量
 *     引擎包 → 首包回弹到 3.47MB+。清空后下次构建重新打包，引擎裁剪(engine.json 功能裁剪)
 *     才真正生效。这是首包体积门禁能成立的前提。
 *   - build/ ：构建产物(含 build/wechatgame/wechatgame 首包)。清理避免门禁吃到陈旧产物。
 *
 * 安全：仅删除仓库根下已知子目录，绝不递归删除仓库根或上级目录；任一目录删除失败不会
 * 阻断其它目录的清理，结束时以退出码反映是否全部成功。
 *
 * 用法：pnpm clean
 */

import { rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const TARGETS = ['library', 'build'];

console.log('╔══════════════════════════════════════════════╗');
console.log('║   XXL 塔防 · 清理构建缓存 (library + build)   ║');
console.log('╚══════════════════════════════════════════════╝\n');

let removed = 0;
let failed = false;
for (const name of TARGETS) {
  const full = resolve(ROOT, name);
  if (!existsSync(full)) {
    console.log(`  ℹ️  跳过(不存在): ${name}/`);
    continue;
  }
  try {
    rmSync(full, { recursive: true, force: true });
    console.log(`  🗑️  已清理: ${name}/`);
    removed++;
  } catch (e) {
    console.error(`  ❌ 清理失败: ${name}/ -> ${e.message}`);
    failed = true;
  }
}

console.log(`\n${failed ? '⚠️' : '✅'} 清理完成（${removed}/${TARGETS.length} 个目录已删除）`);
if (failed) process.exit(1);
