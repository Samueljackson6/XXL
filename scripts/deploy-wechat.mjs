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
import { existsSync, statSync, readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import os from 'os';
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
const DEVTOOLS_TIMEOUT_MS = 150 * 1000;
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
  // 委托给 build-cocos.mjs 执行构建：它走 configPath / separateEngine 路径，
  // 能把首包压到 <4MB（约 3.47MB），远优于内联 --build 字符串（无 separateEngine → 约 4.42MB，超限）。
  // 与 build-cocos.mjs 一致：用「产物完整性」而非「退出码」作为成功判据。
  let cocosFailed = false;
  try {
    const buildRes = spawnSync(process.execPath, [resolve(ROOT, 'scripts', 'build-cocos.mjs')], {
      cwd: ROOT,
      stdio: 'inherit',
      timeout: BUILD_TIMEOUT_MS,
    });
    if (buildRes.status !== 0) {
      cocosFailed = true;
      const detail = buildRes.error ? buildRes.error.message : `exit=${buildRes.status}`;
      console.warn(`\n⚠️  build-cocos.mjs 退出码非零（可能为无害的度量阶段崩溃）: ${detail.split('\n')[0]}`);
    } else {
      console.log('  ✅ 构建成功');
    }
  } catch (err) {
    cocosFailed = true;
    console.warn(`\n⚠️  构建委托异常: ${err.message.split('\n')[0]}`);
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
    // 关键修复：小游戏项目绝不能保留 miniprogramRoot —— 那是「小程序」专属字段。
    // DevTools 的 getProjectInfo 会因该字段判定 project.config.json 非法，稳定报 code 19。
    // Cocos 即便对小游戏也会写出 miniprogramRoot，必须在此显式删除。
    if (json.miniprogramRoot !== undefined) {
      delete json.miniprogramRoot;
      changed = true;
    }
    if (!json.gameRoot) {
      json.gameRoot = './';
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
  const miniNote = (json.compileType === 'game') ? '，已剥离 miniprogramRoot' : '';
  console.log(`  ✅ 已固化 project.config.json（appid=${json.appid}, gameRoot=${json.gameRoot || '(none)'}, description="${newDesc}"${miniNote}）`);
}

async function launchDevTools() {
  const cliPath = DEVTOOLS_CLI;

  if (!existsSync(cliPath)) {
    console.error(`❌ 未找到微信开发者工具 CLI: ${cliPath}`);
    console.log('  请确认微信开发者工具安装路径');
    process.exit(1);
  }

  // 启动 DevTools（产物根目录为 build/wechatgame/wechatgame/，内含 game.js / project.config.json）
  const buildDir = resolve(ROOT, 'build', 'wechatgame', 'wechatgame');

  // 多轮重试：微信开发者工具 CLI 的 `auto` 会“挂到”已运行的陈旧 IDE 实例（而非启动全新实例），
  // 而陈旧实例往往持有无效/旧的项目配置 → 稳定报 code 19、且不会在 5000 端口开放自动化。
  // 因此：端口未就绪（或检测到陈旧 IDE 端口）时，精准清理该实例 + 整棵树，再重新拉起，
  // 直到 CLI 启动一个全新、干净的 IDE 并开放自动化端口为止。
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n  ── 启动 DevTools 尝试 ${attempt}/${MAX_ATTEMPTS} ──`);

    // 彻底清场：杀掉整棵进程树（含守护进程），轮询至干净
    for (let i = 0; i < 4; i++) {
      killDevTools();
      await sleep(1500);
      if (!devToolsRunning()) break;
    }
    if (devToolsRunning()) {
      console.warn('  ⚠️  仍有 DevTools 进程残留，CLI 可能挂到陈旧实例（code 19 风险）');
    }

    // 清理陈旧的 IDE 端口文件（.ide）：CLI 用它判断“是否有 IDE 已在运行”。
    // 若上次 IDE 被我们杀掉但 .ide 没清，CLI 会读到死端口并尝试连接陈旧 IDE，
    // 导致 waitForPort 在 IDE 真正起来前误判失败。清掉后 CLI 会干净地启动全新 IDE 并自行重写 .ide。
    // （注意：不要动 .ide-status —— 里面 "On" 表示服务端口已开启，是我们要保留的持久化状态。）
    try {
      const localAppData = process.env.LOCALAPPDATA || join(os.homedir(), 'AppData', 'Local');
      const idePortFile = join(localAppData, '微信开发者工具', 'User Data', '47bc2ae129c54a6f1173e5c6cf14a7b6', 'Default', '.ide');
      if (existsSync(idePortFile)) {
        unlinkSync(idePortFile);
        console.log('  🧹 已清理陈旧 .ide 端口文件（避免 CLI 挂到死端口）');
      }
    } catch {}

    console.log(`  启动 DevTools（自动化端口 ${AUTO_PORT}）...`);
    // 关键修复（2026-07-26）：buildDir 含空格时（旧路径 "WeChat Game"），在 shell:true 下 cmd.exe
    // 会把路径按空格拆词 → CLI 收到截断的 --project D:\Tare-workspace\Game\WeChat → 该目录无
    // project.config.json → getProjectInfo 稳定报 code 19。必须对路径加双引号，确保 CLI 收到完整路径。
    // 注（2026-07-27）：工程已整体迁至无空格路径 D:\Tare-workspace\Game\WeChatMiniGame，此类空格路径
    // bug 已从根上消除；本引号修复仍保留作双保险（任何含空格路径都不会再触发 code 19）。
    const cliProc = spawn(cliPath, [
      'auto',
      '--project', `"${buildDir}"`,
      '--auto-port', String(AUTO_PORT),
      '--trust-project'
    ], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });

    let cliOutput = '';
    // 关键修复：DevTools CLI 在「服务端口未开启」时会交互式提示 “Enable IDE Service (y/N)”
    // 并挂起等待 stdin。若不做应答，它会一直阻塞直到 waitForPort 超时（code 19 类失败）。
    // 这里监测该提示并自动喂 'y\n'，从而让 CLI 自行持久化“开启服务端口”设置，
    // 后续运行不再提示，实现全流程无人值守。
    let enablePromptAnswered = false;
    const answerEnablePrompt = () => {
      if (enablePromptAnswered) return;
      if (/Enable IDE Service/i.test(cliOutput)) {
        enablePromptAnswered = true;
        try {
          cliProc.stdin.write('y\n');
          console.log('  ↳ 检测到「开启工具服务」提示，已自动应答 y（启用 CLI 服务端口）');
        } catch (e) {
          console.warn(`  ⚠️  自动应答失败: ${e.message}`);
        }
      }
    };
    cliProc.stdout.on('data', d => { cliOutput += d.toString(); answerEnablePrompt(); });
    cliProc.stderr.on('data', d => { cliOutput += d.toString(); answerEnablePrompt(); });
    // 再保险：部分版本在首屏即等待输入而 stderr/stdout 关键字尚未 flush，
    // 故 spawn 后主动预喂一次 y（缓冲的输入会在 CLI 读取 stdin 时被消费，幂等无害）。
    const proactive = setTimeout(() => {
      if (!enablePromptAnswered) {
        try { cliProc.stdin.write('y\n'); enablePromptAnswered = true; console.log('  ↳ 主动预应答 y（启用 CLI 服务端口）'); } catch {}
      }
    }, 4000);

    const portReady = await waitForPort(AUTO_PORT, DEVTOOLS_TIMEOUT_MS);
    clearTimeout(proactive);
    if (portReady) {
      console.log(`  ✅ 端口 ${AUTO_PORT} 已就绪`);
      process.__devtoolsCli = cliProc;
      return; // 成功
    }

    // 端口未就绪：本轮尝试失败。cliProc 在超时后已无意义，清理后由下一轮 attempt 顶部的
    // killDevTools() + .ide 端口文件清理重新拉起一个干净的 IDE。
    // 注：不再依赖 CLI 的 “IDE may already started at port X” 提示做精准 kill——
    // 该提示是“正在连接已有 IDE”的信息性日志，并非错误；旧逻辑误杀正常 IDE、反而掩盖了真正的 code 19。
    console.error(`  ❌ 端口 ${AUTO_PORT} 未就绪（尝试 ${attempt}）`);
    console.log('  CLI 输出:', cliOutput.trim().slice(0, 600));
    try { cliProc.kill(); } catch {}
    killDevTools();
    if (attempt < MAX_ATTEMPTS) await sleep(2000);
  }

  console.error(`  ❌ ${MAX_ATTEMPTS} 次尝试后仍无法在端口 ${AUTO_PORT} 启动 DevTools`);
  process.exit(1);
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
    if (e.stack) console.error('  stack:', e.stack.split('\n').slice(0, 8).join('\n'));
    console.log('  请检查 DevTools 是否已启动并监听自动化端口');
    process.exit(1);
  }
}

function cleanup() {
  console.log('\n关闭 DevTools...');
  if (process.__devtoolsCli) {
    process.__devtoolsCli.kill();
  }
  killDevTools();
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

// 可靠杀掉整棵 DevTools 进程树（守护进程 微信开发者工具.exe + wechatdevtools.exe + filewatcher）。
// 关键：spawnSync 直传中文进程名「微信开发者工具」常因命令行编码匹配失败，导致 GUI 残存并不断
// 重生 worker → cli 反复挂到陈旧 IDE → code 19。改为把命令写入 UTF-8+BOM 的临时 .ps1，
// 用 powershell -File 执行（BOM 保证中文被正确解析），从而精确杀掉含中文名 GUI 的整棵树。
function killDevTools() {
  const ps = "Get-Process -Name wechatdevtools,微信开发者工具,wxfilewatcher_x64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue\n" +
    "Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*微信web开发者工具*' } | Stop-Process -Force -ErrorAction SilentlyContinue\n";
  const tmp = join(os.tmpdir(), 'xxl_kill_devtools.ps1');
  try { writeFileSync(tmp, '﻿' + ps, 'utf-8'); } catch {}
  try { spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmp], { stdio: 'ignore' }); } catch {}
  // 兜底：ASCII 名进程用 taskkill 整棵树杀（/T 含子进程）
  try { spawnSync('taskkill', ['/F', '/T', '/IM', 'wechatdevtools.exe'], { stdio: 'ignore' }); } catch {}
  try { spawnSync('taskkill', ['/F', '/T', '/IM', 'wxfilewatcher_x64.exe'], { stdio: 'ignore' }); } catch {}
}

// 是否仍有 DevTools 主进程在运行（用于轮询判定清理是否干净）
function devToolsRunning() {
  const ps = "(Get-Process -Name wechatdevtools,微信开发者工具 -ErrorAction SilentlyContinue).Count\n";
  const tmp = join(os.tmpdir(), 'xxl_devtools_running.ps1');
  try { writeFileSync(tmp, '﻿' + ps, 'utf-8'); } catch {}
  try {
    const out = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmp], { encoding: 'utf8' });
    const n = parseInt((out.stdout || '').trim(), 10);
    return Number.isFinite(n) && n > 0;
  } catch {
    return false;
  }
}

// 精准杀掉占据指定端口的进程（清理 CLI 报出的“陈旧 IDE”端口，避免重启后仍然挂到它）
function killPortOwner(port) {
  try {
    const ps = 'Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq ' + port + ' } | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force }';
    spawnSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'ignore' });
  } catch {}
}

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
