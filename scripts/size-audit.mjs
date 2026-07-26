/**
 * XXL 微信小游戏首包体积审计
 *
 * 递归统计 build/wechatgame/wechatgame/ 下所有文件体积，
 * 输出 Top-15 贡献项（含累计占比）与四大类（引擎代码 / 游戏代码 / 资源 / 开销）汇总。
 *
 * 用法：
 *   node scripts/size-audit.mjs                       # 默认审计 build/wechatgame/wechatgame
 *   node scripts/size-audit.mjs <dir>                 # 审计指定目录
 *
 * 仅做只读统计，不修改任何产物。
 */
import { readdirSync, statSync, existsSync } from 'fs';
import { resolve, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TARGET = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(ROOT, 'build', 'wechatgame', 'wechatgame');

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

function splitPath(p) {
  return p.split(/[\\/]/);
}
function categoryOf(p) {
  const segs = splitPath(p);
  const top = segs[0];
  const base = segs[segs.length - 1];
  if (base === 'engine-adapter.js' || base === 'web-adapter.js' || base === 'first-screen.js' || top === 'cocos-js') {
    return 'engine';
  }
  if (base === 'game.js' || base === 'application.js' || top === 'src') {
    return 'game';
  }
  if (top === 'assets') {
    return 'assets';
  }
  return 'overhead';
}

function fmtKB(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}
function fmtMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

if (!existsSync(TARGET)) {
  console.error(`❌ 审计目标不存在: ${TARGET}`);
  process.exit(1);
}

const files = walk(TARGET, []);
const total = files.reduce((s, f) => s + f.size, 0);

files.sort((a, b) => b.size - a.size);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   XXL 微信小游戏 — 首包体积审计 (Top-15 contributors)         ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`\n审计目录: ${TARGET}`);
console.log(`总体积:   ${fmtMB(total)} (${total.toLocaleString()} bytes)\n`);

console.log('| #  | 文件                                        | 体积       | 占比   | 累计%  |');
console.log('|----|---------------------------------------------|-----------|--------|--------|');
let cum = 0;
files.slice(0, 15).forEach((f, i) => {
  cum += f.size;
  const pct = ((f.size / total) * 100).toFixed(1).padStart(5);
  const cpct = ((cum / total) * 100).toFixed(1).padStart(5);
  console.log(`| ${String(i + 1).padStart(2)} | ${f.path.padEnd(43)} | ${fmtKB(f.size).padStart(9)} | ${pct}% | ${cpct}% |`);
});

console.log('\n── 分类汇总 ──');
const cats = { engine: 0, game: 0, assets: 0, overhead: 0 };
for (const f of files) cats[categoryOf(f.path)] += f.size;
const catLabels = { engine: '引擎代码', game: '游戏代码', assets: '资源', overhead: '开销/配置' };
for (const k of ['engine', 'game', 'assets', 'overhead']) {
  const pct = ((cats[k] / total) * 100).toFixed(1).padStart(5);
  console.log(`  ${catLabels[k].padEnd(8)}: ${fmtMB(cats[k]).padStart(8)}  (${pct}%)`);
}

console.log(`\n  ${'合计'.padEnd(8)}: ${fmtMB(total).padStart(8)}  (100.0%)`);

// 启动必需体积（首屏立即加载）：顶层脚本 + cocos-js + src 全集（非远程资源）
const startupFiles = ['engine-adapter.js', 'web-adapter.js', 'first-screen.js', 'game.js', 'application.js'];
let startup = 0;
for (const f of files) {
  const segs = splitPath(f.path);
  const top = segs[0];
  const base = segs[segs.length - 1];
  if (startupFiles.includes(base) || top === 'cocos-js' || top === 'src') startup += f.size;
}
console.log('\n── 启动相关体积（默认全在主包，非远程资源）──');
console.log(`  引擎适配+脚本+cocos-js+src: ${fmtMB(startup)}`);
console.log(`  其中资源(assets)若未设远程，将并入主包: ${fmtMB(cats.assets)}`);
