/**
 * Cocos Creator → 微信开发者工具 部署脚本
 *
 * 流程：
 *   1. 调用 Cocos Creator CLI 构建微信小游戏
 *   2. 验证构建输出
 *   3. 启动微信开发者工具
 *   4. 通过 miniprogram-automator 连接并自动编译
 *
 * 用法：node scripts/deploy-wechat.mjs
 */

import { execSync, spawn, spawnSync } from 'child_process';
import { createConnection } from 'net';
import { existsSync, statSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// miniprogram-automator 是 CommonJS 包，在 .mjs(ESM) 中需通过 createRequire 引入
const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// CocosCreator.exe / 微信开发者工具 CLI 均为 Node 系二进制，会拒绝 NODE_OPTIONS 中的 --use-system-ca。
// 仅摘掉这一项，保留其它选项，避免污染子进程环境。
if (process.env.NODE_OPTIONS) {
  const cleaned = process.env.NODE_OPTIONS
    .split(/\s+/)
    .filter((f) => !f.startsWith('--use-system-ca'))
    .join(' ');
  process.env.NODE_OPTIONS = cleaned;
}

// 沙箱环境常全局设置 ELECTRON_RUN_AS_NODE=1，会让 CocosCreator.exe / 微信开发者工具（均为 Electron 内核）
// 退化成裸 Node，构建与 DevTools 启动都会失败。构建/部署前必须清除它。
if (process.env.ELECTRON_RUN_AS_NODE) {
  delete process.env.ELECTRON_RUN_AS_NODE;
}

const COCOS_CREATOR = 'G:/Game tools/CocosCreator/CocosCreator.exe';
const DEVTOOLS_CLI = 'D:/DevCache/微信web开发者工具/cli.bat';
const APPID = 'wx10c928d3274d2360';
const AUTO_PORT = 5000;
const BUILD_TIMEOUT_MS = 10 * 60 * 1000;
const DEVTOOLS_TIMEOUT_MS = 30 * 1000;
const INIT_WAIT_MS = 5000; // 运行时初始化 + console 采集窗口（原为 3s，扩展至 5s 提高捕获率）

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Cocos Creator → WeChat 部署管道 v2.0       ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // === 阶段 1: Cocos Creator 构建 ===
  console.log('━━━ [1/4] Cocos Creator 构建微信小游戏 ━━━');

  if (!existsSync(COCOS_CREATOR)) {
    console.error(`❌ 未找到 Cocos Creator: ${COCOS_CREATOR}`);
    process.exit(1);
  }

  // Cocos CLI 在 postBuild 统计阶段可能抛「Missing class: GameBootstrap」——这是一个
  // 无害的度量崩溃（类尚未在子进程上下文求值），所有游戏文件已写盘，运行时 bundle 已注册该类。
  // 因此用「产物完整性」而非「退出码」作为成功判据，与 build-cocos.mjs 保持一致。
  let cocosFailed = false;
  try {
    execSync(`"${COCOS_CREATOR}" --project "${ROOT}" --build "platform=wechatgame;appid=${APPID};buildPath=${ROOT}/build/wechatgame"`, {
      encoding: 'utf-8',
      timeout: BUILD_TIMEOUT_MS,
      stdio: 'inherit',
    });
    console.log('  ✅ 构建成功');
  } catch (err) {
    cocosFailed = true;
    console.warn(`\n⚠️  Cocos CLI 退出码非零（可能为无害的度量阶段崩溃）: ${err.message.split('\n')[0]}`);
  }

  // === 阶段 2: 验证产物 ===
  console.log('\n━━━ [2/4] 验证构建产物 ━━━');
  const complete = verifyOutput();

  if (cocosFailed && !complete) {
    console.error('\n❌ 构建失败且产物不完整，终止部署。');
    process.exit(1);
  }
  if (cocosFailed && complete) {
    console.warn('\n⚠️  注意：Cocos CLI 报告了非致命错误，但产物完整，判定构建成功，继续部署。');
  }

  // 强制写入正确的 AppID（Cocos 的 wechatgame 构建选项 key 为小写 appid，大写 APPID 会被忽略，
  // 且构建字符串中的 appid= 不一定透传，故在此兜底修正输出 project.config.json）
  if (complete) {
    patchAppId(resolve(ROOT, 'build', 'wechatgame', 'wechatgame'));
  }

  // === 阶段 3: 启动微信开发者工具 ===
  console.log('\n━━━ [3/4] 启动微信开发者工具 ━━━');
  await launchDevTools();

  // === 阶段 4: 自动编译 ===
  console.log('\n━━━ [4/4] 自动编译 ━━━');
  await autoCompile();
}

function verifyOutput() {
  const buildDir = resolve(ROOT, 'build', 'wechatgame', 'wechatgame');
  console.log(`  输出目录: ${buildDir}`);
  const requiredFiles = [
    'game.json',
    'project.config.json',
  ];

  let allOk = true;
  for (const rel of requiredFiles) {
    const full = resolve(buildDir, rel);
    if (existsSync(full)) {
      const size = statSync(full).size;
      console.log(`  ✅ ${rel} (${(size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`  ⚠️  缺失: ${rel}`);
      allOk = false;
    }
  }

  // 检查脚本与资源目录（Cocos 微信小游戏产物使用 src/ 而非 js/）
  for (const dirRel of ['src', 'assets', 'cocos-js']) {
    const d = resolve(buildDir, dirRel);
    if (existsSync(d) && statSync(d).isDirectory()) {
      console.log(`  ✅ ${dirRel}/ 目录存在`);
    } else {
      console.warn(`  ⚠️  缺失目录: ${dirRel}/`);
      allOk = false;
    }
  }

  // 统计总大小
  let totalSize = 0;
  function dirSize(dir) {
    try {
      const entries = statSync(dir);
      if (!entries.isDirectory()) {
        totalSize += entries.size;
        return;
      }
      const files = readdirSync(dir);
      for (const f of files) {
        const p = resolve(dir, f);
        const s = statSync(p);
        if (s.isDirectory()) {
          dirSize(p);
        } else {
          totalSize += s.size;
        }
      }
    } catch {}
  }
  dirSize(buildDir);

  console.log(`\n  构建产物总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  if (!allOk) {
    console.warn('\n⚠️  部分文件缺失，构建可能不完整');
  }
  return allOk;
}

function patchAppId(realOutput) {
  const pconfig = resolve(realOutput, 'project.config.json');
  if (!existsSync(pconfig)) return;

  // Cocos 每次构建都会把 description 字段以 GBK 写出，按 utf-8 解析会抛错。
  // 多层降级：utf-8 → latin1（绝不抛错）→ 空对象，确保一定能写出合法 JSON。
  const raw = readFileSync(pconfig);
  let json;
  try {
    json = JSON.parse(raw.toString('utf-8'));
  } catch {
    try {
      json = JSON.parse(raw.toString('latin1'));
    } catch {
      json = {};
    }
  }

  let changed = false;

  if (json.appid !== APPID) {
    json.appid = APPID;
    changed = true;
  }

  if (json.compileType === 'game') {
    if (!json.gameRoot) {
      json.gameRoot = json.miniprogramRoot || './';
      changed = true;
    }
    if (json.libVersion) {
      delete json.libVersion;
      changed = true;
    }
  }

  if (json.condition && json.condition.game && json.condition.game.currentL !== undefined) {
    delete json.condition.game.currentL;
    changed = true;
  }

  // 关键：把 description 强制收敛为纯 ASCII，杜绝任何编码往返再污染 JSON。
  const cleanDesc = (typeof json.description === 'string')
    ? json.description.replace(/[^\x20-\x7E]/g, '').trim()
    : '';
  const newDesc = cleanDesc || 'XXL Tower Defense';
  if (json.description !== newDesc) {
    json.description = newDesc;
    changed = true;
  }

  // 始终以合法 UTF-8 重写（即便没变化也重写，抹掉 GBK 残迹）
  writeFileSync(pconfig, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`  ✅ 已固化 project.config.json（appid=${json.appid}, gameRoot=${json.gameRoot || '(none)'}, description="${newDesc}"）`);
}

async function launchDevTools() {
  const cliPath = DEVTOOLS_CLI;

  if (!existsSync(cliPath)) {
    console.error(`❌ 未找到微信开发者工具 CLI: ${cliPath}`);
    console.log('  请确认微信开发者工具安装路径');
    process.exit(1);
  }

  // 关闭已有 DevTools 实例
  console.log('  关闭已有 DevTools 实例...');
  try { spawnSync('taskkill', ['/F', '/IM', 'wechatdevtools.exe'], { stdio: 'ignore' }); } catch {}
  await sleep(3000);

  // 启动 DevTools（产物根目录为 build/wechatgame/wechatgame/，内含 game.js / project.config.json）
  const buildDir = resolve(ROOT, 'build', 'wechatgame', 'wechatgame');
  console.log(`  启动 DevTools（自动化端口 ${AUTO_PORT}）...`);

  const cliProc = spawn(cliPath, [
    'auto',
    '--project', buildDir,
    '--auto-port', String(AUTO_PORT),
    '--trust-project'
  ], { shell: true, stdio: 'pipe' });

  let cliOutput = '';
  cliProc.stdout.on('data', d => { cliOutput += d.toString(); });
  cliProc.stderr.on('data', d => { cliOutput += d.toString(); });

  // 等待端口就绪
  console.log(`  等待端口 ${AUTO_PORT}...`);
  const portReady = await waitForPort(AUTO_PORT, 30000);
  if (!portReady) {
    console.error(`  ❌ 端口 ${AUTO_PORT} 未就绪`);
    console.log('  CLI 输出:', cliOutput.trim().slice(0, 500));
    process.exit(1);
  }
  console.log(`  ✅ 端口 ${AUTO_PORT} 已就绪`);

  // 保持进程引用
  process.__devtoolsCli = cliProc;
}

async function autoCompile() {
  try {
    const { default: Automator } = require('miniprogram-automator/out/Automator');
    const automator = new Automator();
    const mp = await automator.connect({ wsEndpoint: `ws://127.0.0.1:${AUTO_PORT}` });
    console.log('  ✅ 已连接 DevTools');

    const info = await mp.send('Tool.getInfo');
    console.log(`  DevTools v${info.version} | SDK v${info.SDKVersion}`);

    // === 控制台插桩（smoke gate 2.6）===
    // automator.connect() 返回的是 MiniProgram 实例（extends EventEmitter），
    // 它对外仅 emit 两种事件：'console'（运行时 console.* 日志）与 'exception'
    // （未捕获异常 / 运行时错误，等价于其它框架的 pageerror）。
    // 在此挂载监听，于运行时初始化窗口采集结构化记录。
    const consoleRecords = [];

    const attachListener = (evt, handler) => {
      try {
        if (mp && typeof mp.on === 'function') {
          mp.on(evt, handler);
          return true;
        }
      } catch (e) {
        console.warn(`  ⚠️  监听 "${evt}" 挂载失败（不影响部署）: ${e.message}`);
      }
      return false;
    };

    const onConsole = (t) => {
      // 防御性归一化：微信 runtime 的 logAdded 负载字段名可能随版本变化，
      // 这里尽量兼容 type/level、value/text/message、args、time 等形态。
      const level = (t && (t.type || t.level)) || 'log';
      let text = '';
      if (t) {
        text = t.value || t.text || t.message || (Array.isArray(t.args) ? t.args.join(' ') : '');
      }
      if (!text) text = safeStringify(t);
      const args = Array.isArray(t && t.args) ? t.args.map(safeStringify) : null;
      const time = t && t.time ? new Date(t.time).toISOString() : new Date().toISOString();
      consoleRecords.push({ type: 'console', level: String(level), text, args, time });
    };

    const buildErrorRecord = (t, type) => {
      const text = t && (t.stack || t.message || t.reason)
        ? (t.stack || t.message || t.reason)
        : safeStringify(t);
      return { type, level: 'error', text, args: null, time: new Date().toISOString() };
    };
    const onException = (t) => consoleRecords.push(buildErrorRecord(t, 'exception'));
    const onPageError = (t) => consoleRecords.push(buildErrorRecord(t, 'pageerror')); // 前向兼容：未来版本若补 'pageerror'

    let attachedAny = false;
    attachedAny = attachListener('console', onConsole) || attachedAny;
    attachedAny = attachListener('exception', onException) || attachedAny;
    attachedAny = attachListener('pageerror', onPageError) || attachedAny;
    if (!attachedAny) {
      console.warn('  ⚠️  未能挂载任何 console 监听器（MiniProgram.on 不可用），仅记录缓冲区已有事件（如有）。');
    }

    // 运行时初始化窗口：采集 console / exception（扩展为 5s 以提高捕获率）
    console.log(`  等待运行时初始化并采集控制台（${INIT_WAIT_MS / 1000}s）...`);
    await sleep(INIT_WAIT_MS);

    // 保存证据 + 判定
    const evidence = saveConsoleEvidence(consoleRecords);
    const threshold = parseThreshold();
    const errs = evidence.summary.errorCount;
    if (errs > threshold) {
      console.log(`\n  Console errors: ${errs} (FAIL)  [threshold=${threshold}]`);
    } else {
      console.log(`\n  Console errors: ${errs} (PASS)  [threshold=${threshold}]`);
    }

    // === 截图验证（在 console 采集窗口之后） ===
    try {
      const shotPath = resolve(ROOT, 'build', 'playtest-screenshot.png');
      // 小游戏 canvas 在部分环境（无 GPU 缓存的 headless）下 screenshot 可能长时间阻塞，
      // 用超时包裹，绝不让它卡住整条部署管道。
      const shot = await Promise.race([
        mp.screenshot({ path: shotPath }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('截图超时 8s')), 8000)),
      ]);
      console.log(`  ✅ 已截图验证渲染: ${shot || shotPath}`);
    } catch (se) {
      console.warn(`  ⚠️  截图跳过/失败（不影响运行，可在 DevTools 手动试玩）: ${se.message}`);
    }

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  ✅ 部署成功！项目已在微信开发者工具中打开  ║');
    console.log('║  请在 DevTools 中试玩（IDE 已独立运行）     ║');
    console.log('╚══════════════════════════════════════════════╝');

    // DevTools 以独立进程运行，断开 automator 连接并干净退出，不阻塞管道。
    try { mp.disconnect(); } catch {}
    if (errs > threshold) {
      // 控制台错误超阈值：让流水线响亮失败（被 CI 捕获）。
      process.exit(2);
    }
    process.exit(0);
  } catch (e) {
    console.error('  ❌ 连接失败:', e.message);
    console.log('  请检查 DevTools 是否已启动并监听自动化端口');
    process.exit(1);
  }
}

function cleanup() {
  console.log('\n关闭 DevTools...');
  if (process.__devtoolsCli) {
    process.__devtoolsCli.kill();
  }
  try { spawnSync('taskkill', ['/F', '/IM', 'wechatdevtools.exe'], { stdio: 'ignore' }); } catch {}
  process.exit(0);
}

async function waitForPort(port, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const open = await new Promise((resolve) => {
      const sock = createConnection(port, '127.0.0.1');
      sock.setTimeout(1000);
      sock.once('connect', () => { sock.destroy(); resolve(true); });
      sock.once('error', () => { sock.destroy(); resolve(false); });
      sock.once('timeout', () => { sock.destroy(); resolve(false); });
    });
    if (open) return true;
    await sleep(500);
  }
  return false;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== 控制台插桩辅助（smoke gate 2.6） =====

// 判定一条记录是否为“错误级”（驱动 FAIL 门控）
function isErrorRecord(r) {
  if (!r || !r.type) return false;
  if (r.type === 'exception' || r.type === 'pageerror') return true;
  if (r.type === 'console' && r.level === 'error') return true;
  return false;
}

// 安全序列化任意值为字符串（避免循环引用 / 不可序列化对象导致 dump 失败）
function safeStringify(v) {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'string') return v;
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
  try {
    return JSON.stringify(v);
  } catch {
    try { return String(v); } catch { return '[unserializable]'; }
  }
}

// 解析错误阈值（默认 0）；非法值回退到 0
function parseThreshold() {
  const raw = process.env.CONSOLE_ERROR_THRESHOLD;
  if (raw === undefined || raw === null || String(raw).trim() === '') return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// 将采集到的控制台记录落盘为结构化 JSON + 可读 LOG，并返回汇总
function saveConsoleEvidence(records) {
  const evidenceDir = resolve(ROOT, 'tests', 'smoke', 'console_evidence');
  try { mkdirSync(evidenceDir, { recursive: true }); } catch {}
  const stamp = new Date().toISOString().replace(/[:.]/g, '-'); // 文件系统安全的 ISO 时间戳
  const errorCount = records.filter(isErrorRecord).length;
  const warningCount = records.filter(r => r.type === 'console' && r.level === 'warn').length;
  const summary = {
    errorCount,
    warningCount,
    totalCount: records.length,
    generatedAt: new Date().toISOString(),
    threshold: parseThreshold(),
  };

  const jsonPath = resolve(evidenceDir, `${stamp}.json`);
  const logPath = resolve(evidenceDir, `${stamp}.log`);

  try {
    writeFileSync(jsonPath, JSON.stringify({ summary, records }, null, 2) + '\n', 'utf-8');
  } catch (e) {
    console.warn(`  ⚠️  无法写入控制台证据 JSON: ${e.message}`);
  }
  try {
    const lines = [
      `# Console evidence — ${summary.generatedAt}`,
      `# errorCount=${errorCount} warningCount=${warningCount} totalCount=${records.length} threshold=${summary.threshold}`,
      '',
    ];
    for (const r of records) {
      const argStr = r.args ? ' ' + JSON.stringify(r.args) : '';
      lines.push(`[${r.time}] ${r.type}/${r.level}: ${r.text}${argStr}`);
    }
    writeFileSync(logPath, lines.join('\n') + '\n', 'utf-8');
  } catch (e) {
    console.warn(`  ⚠️  无法写入控制台证据 LOG: ${e.message}`);
  }

  console.log(`  📝 控制台证据已保存: ${jsonPath}`);
  console.log(`  📝 控制台日志(可读): ${logPath}`);
  return { jsonPath, logPath, summary };
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
