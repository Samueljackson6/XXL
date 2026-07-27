/**
 * XXL 微信小游戏 — 首包体积门禁 (first-package size gate)
 *
 * 目的：把「引擎裁剪胜利」固化进 CI / 本地流水线，让首包体积永不悄无声息地
 * 回弹到 3.47MB+。
 *   - 基线：b9de720 前 3.47MB（未裁剪全量引擎）
 *   - 裁剪后：~0.58MB（settings/v2/packages/engine.json 功能裁剪 + build-cocos.mjs
 *     includeModules:off；详见该提交）
 *
 * 为什么需要门禁（残留风险）：
 *   引擎裁剪只在「重新打包 library/」后生效。若 library/ 是温/陈旧缓存(约 36MB)，
 *   Cocos 会复用旧的全量引擎包 → 首包回弹到 3.47MB+。因此门禁必须配合 CI 中清空
 *   library/（见 build-cocos.mjs 的 CI=1 清空逻辑 + clean-build.mjs 的 pnpm clean）。
 *   本脚本只负责「断言构建后的首包体积」，不负责重建。
 *
 * 用法：
 *   node scripts/check-bundle-size.mjs                 # 默认检查 build/wechatgame/wechatgame
 *   node scripts/check-bundle-size.mjs <dir>           # 检查指定目录
 *   pnpm size:gate                                     # 等价于默认路径（无需参数）
 *
 * 阈值（三级出口码，字节）：
 *   退出码 0  PASS   首包 ≤ 2.0MB            —— 达标（落在 <2MB 项目目标内，含余量）
 *   退出码 2  WARN   2.0MB < 首包 ≤ 2.5MB    —— 接近目标上限，告警
 *   退出码 1  FAIL   首包 > 2.5MB            —— 突破 <2MB 目标门禁（3.47MB 回弹必触发）
 *   退出码 1  FAIL   首包 > 4.0MB            —— 突破 WeChat 主包硬上限（最终兜底）
 *
 * 阈值依据：
 *   - 0.58MB：b9de720 裁剪后的实测基线。
 *   - 2.0MB ：项目声明的首包目标（<2MB）。超过即告警，提醒关注资源增量。
 *   - 2.5MB ：硬门禁。给未来「合法」资源增长留 ~1.9MB 余量，同时仍能在 3.47MB 裁剪
 *            回弹时以充足 margin 拦截（2.5MB << 3.47MB）。
 *   - 4.0MB ：WeChat 小游戏主包硬上限，最终兜底（理论上 >2.5MB 已先触发）。
 *
 * 注意：本地 `pnpm size:gate` 在 2.0~2.5MB 仅告警(退出 2，非阻断)；但 CI（ci-full /
 * GitHub Actions）会把任意非 0 出口码视为失败，确保任何回弹必然暴露、阻断合并。
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { resolve, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TARGET = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(ROOT, 'build', 'wechatgame', 'wechatgame');

// === 阈值（字节） ===
const MB = 1024 * 1024;
const HARD_LIMIT_BYTES = 4 * MB; // WeChat 主包硬上限
const TARGET_FAIL_BYTES = 2.5 * MB; // 目标门禁：突破 <2MB 目标即失败
const WARN_BYTES = 2 * MB; // 警告阈值：接近目标上限

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const full = resolve(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, acc);
    } else {
      acc.push({ path: relative(TARGET, full), size: st.size });
    }
  }
  return acc;
}

function fmtKB(b) {
  return (b / 1024).toFixed(1) + ' KB';
}
function fmtMB(b) {
  return (b / 1024 / 1024).toFixed(2) + ' MB';
}

if (!existsSync(TARGET)) {
  console.error(`❌ 构建产物目录不存在: ${TARGET}`);
  console.error('   请先执行 pnpm build:cocos（或把已构建目录作为第一个参数传入）。');
  process.exit(1);
}

const files = walk(TARGET, []);
const total = files.reduce((s, f) => s + f.size, 0);
files.sort((a, b) => b.size - a.size);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   XXL 微信小游戏 — 首包体积门禁 (first-package size gate)     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`\n检查目录: ${TARGET}`);
console.log(`总体积:   ${fmtMB(total)} (${total.toLocaleString()} bytes, ${files.length} 文件)\n`);

console.log('| #  | 文件                                        | 体积       | 占比   |');
console.log('|----|---------------------------------------------|-----------|--------|');
files.slice(0, 15).forEach((f, i) => {
  const pct = ((f.size / total) * 100).toFixed(1).padStart(5);
  console.log(`| ${String(i + 1).padStart(2)} | ${f.path.padEnd(43)} | ${fmtKB(f.size).padStart(9)} | ${pct}% |`);
});

console.log('\n── 门禁阈值 ──');
console.log(`  软告警 WARN    : > ${fmtMB(WARN_BYTES)}           (退出码 2)`);
console.log(`  目标失败 FAIL  : > ${fmtMB(TARGET_FAIL_BYTES)}    (退出码 1)`);
console.log(`  WeChat 硬上限  : > ${fmtMB(HARD_LIMIT_BYTES)}   (退出码 1)`);
console.log(`  基线参考       : 0.58MB (b9de720 引擎裁剪后)`);

// === 判定 ===
let exitCode;
let verdict;
if (total > HARD_LIMIT_BYTES) {
  verdict = `❌ 首包超过 WeChat 主包硬上限 ${fmtMB(HARD_LIMIT_BYTES)}！实测 ${fmtMB(total)}`;
  console.error('\n' + verdict);
  console.error('   必须立即削减主包体积（资源远程化 / 引擎裁剪 / 代码分包）。');
  exitCode = 1;
} else if (total > TARGET_FAIL_BYTES) {
  verdict = `❌ 首包突破 <2MB 目标门禁 ${fmtMB(TARGET_FAIL_BYTES)}！实测 ${fmtMB(total)}（疑似引擎裁剪回弹）`;
  console.error('\n' + verdict);
  console.error('   典型原因：library/ 未重新打包，Cocos 复用旧全量引擎包。');
  console.error('   请确认 CI/构建已清空 library/ 后重新构建（见 build-cocos.mjs 的 CI=1 清空逻辑）。');
  exitCode = 1;
} else if (total > WARN_BYTES) {
  verdict = `⚠️  首包接近目标上限 ${fmtMB(WARN_BYTES)}：实测 ${fmtMB(total)}（目标 <2.0MB）`;
  console.warn('\n' + verdict);
  console.warn('   建议关注后续资源增量；CI 中此级别会升级为失败。');
  exitCode = 2;
} else {
  verdict = `✅ 首包体积达标：${fmtMB(total)}（< 2.0MB 目标）`;
  console.log('\n' + verdict);
  exitCode = 0;
}

console.log(`\n  门禁结果: 退出码=${exitCode}`);
process.exit(exitCode);
