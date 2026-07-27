/**
 * XXL 塔防 — CI 全流程编排脚本（Phase 5 解锁 PASS + 全流程自动化）
 *
 * 串联「编辑器+MCP 就绪 → 构建 → 部署(含控制台采集)」一条流水线，
 * 供 `pnpm ci:full` 或 `node scripts/ci-full.mjs` 调用。
 *
 * 用法：
 *   node scripts/ci-full.mjs
 *   pnpm ci:full
 *
 * 流程：
 *   (a) 确保 Cocos Creator 编辑器运行且 cocos-mcp-server 在 http://127.0.0.1:3000/mcp 存活
 *       - 先 GET /health；若未存活且编辑器进程未运行，则启动 CocosCreator.exe（MCP 随 autoStart 自动拉起），
 *         再轮询 /health 至多 90s。
 *       - 若编辑器进程已存在，则只等待其 MCP 就绪，不重复拉起（幂等）。
 *   (b) （best-effort，非阻断）轻量 MCP 场景校验：GET /api/tools 确认 scene_management 已注册，
 *       再 POST /api/scene_management 试探；任一步失败均静默跳过，绝不影响流水线判定。
 *   (c) 运行 node scripts/build-cocos.mjs（Cocos CLI 构建微信小游戏）。
 *   (d) 运行 node scripts/deploy-wechat.mjs（启动 DevTools + miniprogram-automator 连接 + 控制台采集 + 截图）。
 *   末：打印汇总（editor launched / MCP live / build / deploy / console errors），并按结果设置退出码。
 *
 * 环境变量：
 *   CONSOLE_ERROR_THRESHOLD  控制台错误阈值（默认 0）。透传给 deploy-wechat.mjs；> 阈值时 deploy 退出 2，本脚本同退 2。
 *   CI_WITH_MCP              =1 时额外确保 Cocos 编辑器+MCP 就绪并执行 best-effort 场景校验；
 *                            不设置（默认）则仅 build→deploy，避免与 Cocos CLI 构建争用工程锁。
 *
 * 注意：
 *   - 构建(build-cocos.mjs)走 Cocos CLI，不依赖 MCP；MCP 仅用于 (b) 的 best-effort 场景校验。
 *     因此即便 MCP 未存活，构建与部署仍会继续（仅报告 MCP live = n 作为关注项）。
 *   - 顶部镜像了现有脚本的 NODE_OPTIONS / ELECTRON_RUN_AS_NODE 清理，避免污染子进程环境。
 */

import { spawn, spawnSync, execSync } from 'child_process';
import http from 'http';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── 与现有脚本一致的 env 清理 ──
// CocosCreator.exe / 微信开发者工具 CLI 为 Node 系二进制，会拒绝 NODE_OPTIONS 中的 --use-system-ca。
if (process.env.NODE_OPTIONS) {
  const cleaned = process.env.NODE_OPTIONS
    .split(/\s+/)
    .filter((f) => !f.startsWith('--use-system-ca'))
    .join(' ');
  process.env.NODE_OPTIONS = cleaned;
}
// 沙箱常全局设置 ELECTRON_RUN_AS_NODE=1，会让 Electron 内核的 CocosCreator.exe 退化成裸 Node。
if (process.env.ELECTRON_RUN_AS_NODE) {
  delete process.env.ELECTRON_RUN_AS_NODE;
}

const COCOS_CREATOR = 'G:/Game tools/CocosCreator/CocosCreator.exe';
const MCP_BASE = 'http://127.0.0.1:3000';
const MCP_HEALTH = `${MCP_BASE}/health`;
const GAMESCENE_ID = '25a94596-80db-4c86-bba2-819aa19b4152'; // GameScene 场景 uuid
const MCP_POLL_MS = 90 * 1000;
const MCP_POLL_INTERVAL_MS = 2000;
const HTTP_TIMEOUT_MS = 5000;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── 最小 HTTP 请求封装（避免依赖 fetch 可用性） ──
function httpReq(method, urlStr, bodyObj, timeoutMs) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(urlStr); } catch (e) { return reject(e); }
    const data = bodyObj ? JSON.stringify(bodyObj) : null;
    const req = http.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => { chunks += c; });
        res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
      }
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('http timeout')));
    if (data) req.write(data);
    req.end();
  });
}

async function checkMcpHealth() {
  try {
    const r = await httpReq('GET', MCP_HEALTH, null, HTTP_TIMEOUT_MS);
    return r.status === 200;
  } catch {
    return false;
  }
}

async function waitForMcp(timeoutMs) {
  const start = Date.now();
  let dots = 0;
  while (Date.now() - start < timeoutMs) {
    if (await checkMcpHealth()) return true;
    dots++;
    if (dots % 5 === 0) process.stdout.write(`  …等待 MCP 就绪(${Math.round((Date.now() - start) / 1000)}s)\n`);
    await sleep(MCP_POLL_INTERVAL_MS);
  }
  return false;
}

// 仅在 Windows 上通过 tasklist 判断 CocosCreator.exe 是否已在运行（幂等用）
function isEditorRunning() {
  try {
    const out = execSync('tasklist /FI "IMAGENAME eq CocosCreator.exe" /NH', { encoding: 'utf8', timeout: 5000 });
    return /CocosCreator\.exe/i.test(out);
  } catch {
    return false; // 无法判定时当作“未运行”，交给后续启动逻辑
  }
}

function launchEditor() {
  if (!existsSync(COCOS_CREATOR)) {
    console.warn(`  ⚠️  未找到 Cocos Creator: ${COCOS_CREATOR}（跳过自动启动，MCP 可能无法就绪）`);
    return false;
  }
  try {
    const child = spawn(COCOS_CREATOR, [ROOT], { detached: true, stdio: 'ignore' });
    child.unref(); // 脱离父进程，父退出后编辑器继续运行（MCP 持续可用）
    child.on('error', (e) => console.warn(`  ⚠️  启动编辑器失败: ${e.message}`));
    return true;
  } catch (e) {
    console.warn(`  ⚠️  启动编辑器异常: ${e.message}`);
    return false;
  }
}

async function ensureEditorAndMcp() {
  console.log('\n━━━ [0/4] 确保 Cocos 编辑器 + MCP 就绪 ━━━');
  let mcpLive = await checkMcpHealth();
  let editorLaunched = false;

  if (mcpLive) {
    console.log('  ✅ MCP 已存活（/health OK），无需启动编辑器');
    return { mcpLive: true, editorLaunched: false };
  }

  const running = await isEditorRunning();
  if (!running) {
    console.log('  ⚙️  MCP 未存活，启动 Cocos Creator 编辑器（MCP 随 autoStart 自动拉起）...');
    editorLaunched = launchEditor();
  } else {
    console.log('  ℹ️  Cocos Creator 进程已存在，等待其 MCP 自动就绪...');
  }

  mcpLive = await waitForMcp(MCP_POLL_MS);
  if (mcpLive) {
    console.log('  ✅ MCP 已就绪（/health OK）');
  } else {
    console.warn('  ⚠️  MCP 在 90s 内未就绪（autoStart 可能未触发）；将继续构建/部署（MCP 非构建必需）。');
  }
  return { mcpLive, editorLaunched };
}

// best-effort 场景校验：先确认工具注册，再试探调用；任何失败都静默跳过（非阻断）
async function validateSceneBestEffort() {
  try {
    const toolsRes = await httpReq('GET', `${MCP_BASE}/api/tools`, null, HTTP_TIMEOUT_MS);
    if (toolsRes.status !== 200) return 'skipped';
    let tools;
    try { tools = JSON.parse(toolsRes.body); } catch { return 'skipped'; }
    const names = Array.isArray(tools.tools) ? tools.tools.map((t) => (t && t.name) || '').filter(Boolean) : [];
    if (!names.includes('scene_management')) {
      console.log('  ℹ️  scene_management 未注册，跳过场景校验（best-effort）');
      return 'skipped';
    }
    const r = await httpReq('POST', `${MCP_BASE}/api/scene_management`, {
      action: 'get-current-scene',
      sceneId: GAMESCENE_ID,
    }, HTTP_TIMEOUT_MS);
    let ok = false;
    try { ok = JSON.parse(r.body).success === true; } catch {}
    console.log(`  ${ok ? '✅' : 'ℹ️'} 场景 best-effort 校验: ${ok ? 'scene_management 可达' : '返回非成功(非阻断) status=' + r.status}`);
    return ok ? 'ok' : 'checked';
  } catch (e) {
    console.log(`  ℹ️  场景 best-effort 校验跳过（非阻断）: ${e.message}`);
    return 'skipped';
  }
}

function runNodeScript(label, scriptRel) {
  const scriptPath = resolve(__dirname, scriptRel);
  console.log(`\n━━━ ${label} ━━━`);
  console.log(`  ▶ node ${scriptRel}`);
  const res = spawnSync(process.execPath, [scriptPath], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
    timeout: 20 * 60 * 1000,
  });
  const ok = res.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} ${scriptRel} 退出码=${res.status}${res.signal ? ' signal=' + res.signal : ''}`);
  return { ok, status: res.status ?? (res.error ? 1 : 0), signal: res.signal };
}

function readLatestConsoleSummary() {
  const dir = resolve(ROOT, 'tests', 'smoke', 'console_evidence');
  if (!existsSync(dir)) return null;
  let files = [];
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort(); } catch { return null; }
  if (!files.length) return null;
  try {
    const j = JSON.parse(readFileSync(resolve(dir, files[files.length - 1]), 'utf-8'));
    return j.summary || null;
  } catch {
    return null;
  }
}

function yN(b) { return b ? 'y' : 'n'; }

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   XXL 塔防 · CI 全流程编排 (ci-full)          ║');
  console.log('╚══════════════════════════════════════════════╝');

  // 默认不拉起编辑器/MCP：否则 ci-full 拉起完整编辑器（为 MCP）的同时，
  // build-cocos.mjs 也会无头启动 CocosCreator.exe 做构建，二者作用于同一工程，
  // 可能争用工程锁。故默认 pnpm ci:full = build→deploy；仅当 CI_WITH_MCP=1 时才
  // 确保编辑器+MCP 就绪并执行 best-effort 场景校验。
  const withMcp = process.env.CI_WITH_MCP === '1';
  let mcpLive = false;
  let editorLaunched = false;

  if (withMcp) {
    ({ mcpLive, editorLaunched } = await ensureEditorAndMcp());
  } else {
    console.log('\n━━━ [0/4] 跳过编辑器/MCP 启动（默认不拉起，避免与 Cocos CLI 构建争用工程锁） ━━━');
    console.log('  ℹ️  设置 CI_WITH_MCP=1 可启用编辑器+MCP 就绪与 best-effort 场景校验。');
  }

  // (b) best-effort 场景校验（非阻断，仅 MCP 存活时尝试）
  if (mcpLive) {
    console.log('\n━━━ [1/4] MCP 场景校验（best-effort） ━━━');
    await validateSceneBestEffort();
  } else {
    console.log(`\n━━━ [1/4] MCP 场景校验跳过（${withMcp ? 'MCP 未存活' : 'MCP 未启用'}） ━━━`);
  }

  // (c) 构建
  const build = runNodeScript('[2/4] Cocos Creator 构建', 'build-cocos.mjs');

  // (c.5) 首包体积门禁：构建成功后、部署前断言首包体积，体积回弹尽早失败。
  //   门禁脚本见 scripts/check-bundle-size.mjs：>2.5MB 失败(退出 1)、>2.0MB 告警(退出 2)、
  //   其余通过；CI 中任一非 0 出口码都会令本编排失败（见末尾退出码逻辑）。
  //   构建未成功时无有效产物，跳过门禁以免误导。
  let sizeGate;
  if (!build.ok) {
    console.log('\n━━━ [3/4] 首包体积门禁 (size:gate) ━━━');
    console.log('  ⚠️  跳过：构建未成功，无有效产物可供门禁');
    sizeGate = { ok: false, status: 'skipped', skipped: true };
  } else {
    sizeGate = runNodeScript('[3/4] 首包体积门禁 (size:gate)', 'check-bundle-size.mjs');
  }

  // (d) 部署 + 控制台采集
  const deploy = runNodeScript('[4/4] 微信开发者工具部署 + 控制台采集', 'deploy-wechat.mjs');

  // 汇总
  const summary = readLatestConsoleSummary();
  const threshold = (() => {
    const raw = process.env.CONSOLE_ERROR_THRESHOLD;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  })();
  const consoleErrors = summary ? summary.errorCount : null;
  // 首包体积门禁结果标签：OK / WARN(退出 2，接近目标) / FAIL(退出 1，突破门禁) / SKIP(构建未成功)
  const sizeGateLabel = sizeGate.skipped
    ? 'SKIP'
    : (sizeGate.status === 0 ? 'OK' : (sizeGate.status === 2 ? 'WARN' : 'FAIL'));
  const consoleVerdict = consoleErrors === null
    ? 'n/a (无证据)'
    : (consoleErrors > threshold ? `FAIL (${consoleErrors} > ${threshold})` : `PASS (${consoleErrors} ≤ ${threshold})`);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║            CI 全流程编排结果                  ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Editor launched : ${yN(editorLaunched).padEnd(34)}║`);
  console.log(`║  MCP live       : ${yN(mcpLive).padEnd(34)}║`);
  console.log(`║  Build          : ${(build.ok ? 'OK' : 'FAIL').padEnd(34)}║`);
  console.log(`║  Size gate      : ${sizeGateLabel.padEnd(34)}║`);
  console.log(`║  Deploy         : ${(deploy.ok ? 'OK' : 'FAIL').padEnd(34)}║`);
  console.log(`║  Console errors : ${consoleVerdict.padEnd(34)}║`);
  console.log('╚══════════════════════════════════════════════╝');

  // 退出码：构建或部署失败 → 1；部署因控制台错误退 2 → 2；其余 0
  let exitCode = 0;
  if (!build.ok || (deploy.status !== 0 && deploy.status !== 2)) exitCode = 1;
  else if (deploy.status === 2) exitCode = 2;
  else if (consoleErrors !== null && consoleErrors > threshold) exitCode = 2;
  // 首包体积门禁：任意非 0 出口码（含 WARN 退出 2）在 CI 一律升级为失败，
  // 确保引擎裁剪回弹 / 首包体积增长必然暴露、阻断流程。
  if (!sizeGate.skipped && sizeGate.status !== 0) exitCode = 1;

  process.exit(exitCode);
}

main().catch((err) => { console.error('Fatal:', err && err.message ? err.message : err); process.exit(1); });
