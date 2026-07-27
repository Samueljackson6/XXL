/**
 * Unity batchmode 构建 + WASM 后处理优化管道
 * 用法：node scripts/build-unity.mjs
 *
 * 流程：
 *   1. 定位团结引擎可执行文件
 *   2. 执行 batchmode WebGL 构建（代码裁剪 + 压缩禁用）
 *   3. WASM 后处理（wasm-opt -Oz + 外部 gzip 压缩）
 *   4. 包体大小检查
 *   5. 输出优化报告
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// === 配置 ===
const PROJECT_PATH = resolve('.');
const LOG_DIR = resolve('build');
const LOG_FILE = join(LOG_DIR, 'unity-build.log');
const TIMEOUT_MS = 10 * 60 * 1000; // 10 分钟超时

// 团结引擎可执行文件路径（按优先级查找）
const UNITY_PATHS = [
  process.env.UNITY_PATH,
  'G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe',
  'C:/Program Files/Tuanjie/Editor/Tuanjie.exe',
  'C:/Program Files/Unity/Hub/Editor/2022.3.22f1c1/Editor/Unity.exe',
].filter(Boolean);

// === 主逻辑 ===
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Unity WebGL 构建 + WASM 优化管道 v2.0      ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  const unityPath = findUnity();
  if (!unityPath) {
    console.error('❌ 未找到团结引擎/Unity 可执行文件');
    console.error('   请设置环境变量 UNITY_PATH 或确认安装路径');
    process.exit(1);
  }
  console.log(`   引擎路径: ${unityPath}`);
  console.log(`   项目路径: ${PROJECT_PATH}`);
  console.log(`   日志文件: ${LOG_FILE}\n`);

  // ── 阶段 1: Unity batchmode 构建 ──
  console.log('━━━ [1/4] Unity batchmode 构建 ━━━');
  const buildStart = Date.now();

  try {
    await runWithTimeout(unityPath, [
      '-batchmode',
      '-nographics',
      '-projectPath', PROJECT_PATH,
      '-executeMethod', 'XXL.Editor.BuildScript.PerformBuild',
      '-logFile', LOG_FILE,
      '-quit',
    ], TIMEOUT_MS);
    console.log(`  ✅ 构建成功（耗时 ${((Date.now() - buildStart) / 1000).toFixed(1)}s）`);
  } catch (err) {
    console.error(`  ❌ 构建失败: ${err.message}`);
    if (existsSync(LOG_FILE)) {
      const { readFileSync } = await import('fs');
      const tail = readFileSync(LOG_FILE, 'utf-8').split('\n').slice(-30).join('\n');
      console.error('\n--- 日志尾部 ---\n' + tail);
    }
    process.exit(1);
  }

  // ── 阶段 2: WASM 后处理优化 ──
  console.log('\n━━━ [2/4] WASM 后处理优化 ━━━');
  try {
    execSync('node scripts/wasm-optimize.mjs Build/MiniGame/Build', {
      cwd: ROOT, stdio: 'inherit', timeout: 180_000,
    });
    console.log('  ✅ WASM 优化完成');
  } catch (err) {
    console.warn(`  ⚠️ WASM 优化跳过: ${err.message}`);
  }

  // ── 阶段 3: 包体大小检查 ──
  console.log('\n━━━ [3/4] 包体大小检查 ━━━');
  try {
    execSync('node scripts/check-bundle-size.mjs Build/MiniGame/Build', {
      cwd: ROOT, stdio: 'inherit',
    });
  } catch (err) {
    console.warn(`  ⚠️ 包体检查: ${err.message}`);
  }

  // ── 阶段 4: 优化报告 ──
  console.log('\n━━━ [4/4] 构建报告 ━━━');
  printBuildReport();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   ✅ 构建 + 优化流程全部完成                    ║');
  console.log('╚══════════════════════════════════════════════╝');
}

// === 工具函数 ===

function findUnity() {
  for (const p of UNITY_PATHS) {
    if (p && existsSync(p)) return p;
  }
  try {
    const result = execSync('where Tuanjie.exe 2>nul || where Unity.exe 2>nul', { encoding: 'utf-8' });
    return result.trim().split('\n')[0];
  } catch { return null; }
}

function runWithTimeout(cmd, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe' });
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(`超时 (${timeoutMs/1000}s)`)); }, timeoutMs);
    child.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`退出码: ${code}`)); });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
  });
}

function printBuildReport() {
  const buildDir = resolve('Build/MiniGame/Build');
  if (!existsSync(buildDir)) { console.log('  构建目录不存在'); return; }

  const files = [];
  let totalSize = 0;

  for (const entry of readdirSync(buildDir, { withFileTypes: true })) {
    const fullPath = join(buildDir, entry.name);
    if (entry.isDirectory()) {
      for (const sub of getAllFiles(fullPath)) { files.push(sub); totalSize += sub.size; }
    } else {
      const size = statSync(fullPath).size;
      files.push({ name: entry.name, size });
      totalSize += size;
    }
  }

  console.log(`\n  总计: ${files.length} 个文件，${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

  files.sort((a, b) => b.size - a.size);
  console.log('  文件明细:');
  files.forEach(f => {
    console.log(`    ${(f.size / 1024).toFixed(1).padStart(8)} KB  ${f.name}`);
  });

  const wasmFile = files.find(f => /\.wasm$/.test(f.name) && !f.name.endsWith('.wasm.br'));
  const dataFile = files.find(f => /\.data(\.gz)?$/.test(f.name));
  const jsFile = files.find(f => /\.(js|framework\.js|loader\.js)$/.test(f.name));

  console.log('\n  首包分解（WASM + JS = 微信 4MB 限制）:');
  if (wasmFile) console.log(`    WASM:   ${(wasmFile.size / 1024 / 1024).toFixed(2)} MB`);
  if (jsFile) console.log(`    JS:    ${(jsFile.size / 1024).toFixed(1)} KB`);
  if (dataFile) console.log(`    Data:  ${(dataFile.size / 1024 / 1024).toFixed(2)} MB (CDN)`);

  const firstPkg = (wasmFile?.size || 0) + (jsFile?.size || 0);
  console.log(`\n  首包合计: ${(firstPkg / 1024 / 1024).toFixed(2)} MB`);

  if (firstPkg > 4 * 1024 * 1024) {
    console.log('  ❌ 首包超限！下一步：WASM 代码分包（wasmCodeSplit）');
  } else if (firstPkg > 3.5 * 1024 * 1024) {
    console.log('  ⚠️  首包接近上限（3.5MB）');
  } else {
    console.log('  ✅ 首包合规');
  }
}

function getAllFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllFiles(fullPath));
    else results.push({ name: entry.name, size: statSync(fullPath).size });
  }
  return results;
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
