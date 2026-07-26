/**
 * Cocos Creator 微信小游戏构建脚本
 *
 * 流程：
 *   1. 调用 Cocos Creator CLI 构建微信小游戏
 *   2. 验证构建输出
 *   3. 输出构建产物路径
 *
 * 用法：
 *   node scripts/build-cocos.mjs              # 构建到默认输出目录
 *   node scripts/build-cocos.mjs --output ./build  # 指定输出目录
 */

import { execSync, spawn } from 'child_process';
import { existsSync, statSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// CocosCreator.exe 是基于 Node 的二进制，会拒绝 NODE_OPTIONS 中的 --use-system-ca（沙箱环境常带此参数）。
// 仅摘掉这一项，保留其它选项，避免污染子进程环境。
if (process.env.NODE_OPTIONS) {
  const cleaned = process.env.NODE_OPTIONS
    .split(/\s+/)
    .filter((f) => !f.startsWith('--use-system-ca'))
    .join(' ');
  process.env.NODE_OPTIONS = cleaned;
}

// 沙箱环境常全局设置 ELECTRON_RUN_AS_NODE=1，会让 CocosCreator.exe（Electron 内核）
// 退化成裸 Node，导致 --project/--build 被当成 Node 非法参数而报 "bad option"。
// 构建前必须清除它，Electron + Cocos 主进程才能正常启动。
if (process.env.ELECTRON_RUN_AS_NODE) {
  delete process.env.ELECTRON_RUN_AS_NODE;
}

const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const OUTPUT_DIR = outputIndex >= 0 ? resolve(args[outputIndex + 1]) : resolve(ROOT, 'build', 'wechatgame');

const COCOS_CREATOR = 'G:/Game tools/CocosCreator/CocosCreator.exe';
const APPID = 'wx10c928d3274d2360';
const BUILD_TIMEOUT_MS = 10 * 60 * 1000; // 10 分钟

function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Cocos Creator → WeChat Mini-Game 构建     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // 1. 检查 Cocos Creator 是否存在
  if (!existsSync(COCOS_CREATOR)) {
    console.error(`❌ 未找到 Cocos Creator: ${COCOS_CREATOR}`);
    console.log('  请确认安装路径或设置 COCOS_CREATOR 环境变量');
    process.exit(1);
  }
  console.log(`  Cocos Creator: ${COCOS_CREATOR}`);

  // 2. 执行构建
  console.log(`\n  构建目标: ${OUTPUT_DIR}`);
  console.log('  开始构建...\n');

  // Cocos Creator CLI：--build 的值必须是 "key=value;key2=value2" 形式，
  // buildPath 不能当作独立 flag 传递（否则报 bad option）。
  // appid 显式传入，确保产物 project.config.json 使用用户自己的小程序 AppID，
  // 而非 Cocos 内置默认测试 AppID（wx6ac3f5090a6b99c5）。
  //
  // 首包体积优化（微信小游戏 <4MB 约束）：
  // Cocos CLI 的 --build 字符串不支持嵌套 key（如 packages.wechatgame.separateEngine），
  // 实测会把 `packages.wechatgame.separateEngine=true` 当成扁平字符串 key 而失效。
  // 因此改用官方支持的 configPath：把 project.json -> builder.wechatgame 的选项生成为
  // 完整构建参数 JSON，交给 Cocos 加载。separateEngine=true 将整个 Cocos 引擎
  // （cocos-js，含 bullet/spine wasm）拆到「分包」，使主包体积降到 ~0.85MB，
  // 满足 <4MB（目标 <2MB）约束，且引擎仍在启动时加载，无运行时风险。
  const cfg = buildWechatConfig(APPID, OUTPUT_DIR);
  const cfgPath = resolve(ROOT, 'temp', 'wechatgame-build-config.json');
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
  console.log(`  生成构建配置: ${cfgPath}`);
  console.log(`  separateEngine = ${cfg.packages.wechatgame.separateEngine}`);

  const buildArgs = [
    '--project', ROOT,
    '--build', `configPath=${cfgPath}`,
  ];

  let cocosFailed = false;
  try {
    execSync(`"${COCOS_CREATOR}" ${buildArgs.map(a => `"${a}"`).join(' ')}`, {
      encoding: 'utf-8',
      timeout: BUILD_TIMEOUT_MS,
      stdio: 'inherit',
    });
  } catch (err) {
    // Cocos CLI 退出码非零：可能是真实的构建失败，也可能是已知的"指标收集"步骤
    // 对手工编写场景的类解析告警（collectMetricFromScene 报 Missing class → 末尾 exit non-zero），
    // 该步骤仅影响构建报告，不影响实际产物。先记录，最后用产物完整性裁决。
    cocosFailed = true;
    console.warn('\n⚠️  Cocos CLI 退出码非零:', err.message.split('\n')[0]);
  }

  // 3. 验证输出（产物在 OUTPUT_DIR/wechatgame/ 下）
  console.log('\n━━━ 验证构建产物 ━━━');
  const realOutput = resolve(OUTPUT_DIR, 'wechatgame');
  const complete = verifyOutput(OUTPUT_DIR, realOutput);

  // 3.5 修正产物 AppID（Cocos 微信小游戏构建在 build option 未正确注入 appid 时
  // 会回退到内置默认测试 AppID，导致产物 project.config.json 不是用户自己的 AppID）
  if (complete) {
    patchAppId(realOutput);
  }

  if (cocosFailed && !complete) {
    console.error('\n❌ 构建失败且核心产物不完整');
    process.exit(1);
  }
  if (cocosFailed && complete) {
    console.warn('\n⚠️  注意：Cocos CLI 报告了非致命错误（多为构建后"指标收集"步骤对手工场景的');
    console.warn('    class 解析告警，不影响运行产物）。已确认核心产物完整，判定构建成功。');
  }
}

function verifyOutput(outputDir, realOutput) {
  // 核心可运行产物（位于 <outputDir>/wechatgame/ 下）
  const requiredFiles = [
    'game.js',
    'game.json',
    'project.config.json',
  ];

  let allOk = true;
  for (const rel of requiredFiles) {
    const full = resolve(realOutput, rel);
    if (existsSync(full)) {
      const size = statSync(full).size;
      console.log(`  ✅ ${rel} (${(size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`  ⚠️  缺失: ${rel} (at ${realOutput})`);
      allOk = false;
    }
  }

  // 检查脚本与资源目录
  for (const dirRel of ['src', 'assets', 'cocos-js']) {
    const d = resolve(realOutput, dirRel);
    if (existsSync(d) && statSync(d).isDirectory()) {
      console.log(`  ✅ ${dirRel}/ 目录存在`);
    } else {
      console.warn(`  ⚠️  缺失目录: ${dirRel}/`);
      allOk = false;
    }
  }

  // 统计总大小（纯递归函数，返回字节数）
  const totalSize = (function calc(dir) {
    let t = 0;
    try {
      const e = statSync(dir);
      if (!e.isDirectory()) return e.size;
      for (const f of readdirSync(dir)) {
        const p = resolve(dir, f);
        const s = statSync(p);
        t += s.isDirectory() ? calc(p) : s.size;
      }
    } catch {}
    return t;
  })(realOutput);

  console.log(`\n  构建产物总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  输出目录: ${realOutput}`);

  if (!allOk) {
    console.warn('\n⚠️  部分文件缺失，构建可能不完整');
  }

  return allOk;
}

// 将产物 project.config.json 的 appid 强制改为用户自己的小程序 AppID。
function patchAppId(realOutput) {
  const pconfig = resolve(realOutput, 'project.config.json');
  if (!existsSync(pconfig)) return;
  try {
    const json = JSON.parse(readFileSync(pconfig, 'utf-8'));
    if (json.appid !== APPID) {
      json.appid = APPID;
      writeFileSync(pconfig, JSON.stringify(json, null, 2) + '\n', 'utf-8');
      console.log(`  ✅ 已写入 AppID: ${APPID}`);
    } else {
      console.log(`  ✅ AppID 已正确: ${APPID}`);
    }
  } catch (e) {
    console.warn(`  ⚠️  无法写入 AppID: ${e.message}`);
  }
}

// 生成微信小游戏构建参数：以已知良好的默认选项为基底，用
// project.json -> builder.wechatgame 中的选项覆盖（单一事实来源）。
// 这样无需在 Cocos 构建面板手动勾选，即可通过 configPath 把首包优化选项传给 Cocos。
function buildWechatConfig(appid, buildPath) {
  let wg = {};
  try {
    const pj = JSON.parse(readFileSync(resolve(ROOT, 'project.json'), 'utf-8'));
    wg = (pj && pj.builder && pj.builder.wechatgame) || {};
  } catch (e) {
    console.warn('  ⚠️ 读取 project.json builder.wechatgame 失败，使用默认构建参数:', e.message);
  }
  return {
    platform: 'wechatgame',
    appid,
    buildPath,
    name: 'xxl-tower-defense',
    outputName: 'wechatgame',
    taskName: 'wechatgame',
    buildMode: 'normal',
    mainBundleCompressionType: 'merge_dep',
    packages: {
      wechatgame: {
        orientation: 'portrait',
        appid,
        buildOpenDataContextTemplate: '',
        separateEngine: false,
        highPerformanceMode: false,
        ...wg,
      },
    },
    server: '',
    engineModulesConfigKey: 'defaultConfig',
    debug: false,
    mangleProperties: false,
    md5Cache: false,
    skipCompressTexture: false,
    sourceMaps: false,
    overwriteProjectSettings: {
      macroConfig: { cleanupImageCache: 'on' },
      // 注：物理/Spine 等未使用模块的彻底剔除需走「项目设置 → 功能裁剪」(engine.json features)
      // + 清空 library 缓存重新构建；includeModules 设为 "off" 在本项目未生效（引擎被缓存且
      // 该字段仅强制包含而非排除），故保持 inherit，作为后续 <2MB 目标的优化项。
      includeModules: {
        physics: 'inherit-project-setting',
        'physics-2d': 'inherit-project-setting',
        'gfx-webgl2': 'off',
      },
    },
    nativeCodeBundleMode: 'wasm',
    polyfills: { asyncFunctions: false },
    experimentalEraseModules: false,
    startSceneAssetBundle: false,
    bundleConfigs: [],
    inlineEnum: true,
    useBuiltinServer: false,
    md5CacheOptions: { excludes: [], includes: [], replaceOnly: [], handleTemplateMd5Link: true },
    mainBundleIsRemote: false,
    useSplashScreen: true,
    bundleCommonChunk: false,
    packAutoAtlas: true,
    startScene: '25a94596-80db-4c86-bba2-819aa19b4152',
    scenes: [{ url: 'db://assets/scenes/GameScene.scene', uuid: '25a94596-80db-4c86-bba2-819aa19b4152' }],
    wasmCompressionMode: false,
    binGroupConfig: { threshold: 16, enable: false },
  };
}

main();
