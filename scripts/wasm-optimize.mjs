/**
 * WASM 后处理优化管道
 * 功能：
 *   1. wasm-opt -Oz — 二进制级 WASM 优化（额外 10-30% 缩减）
 *   2. 外部 gzip 压缩 — 比 Unity 内置 Brotli 更可靠
 * 用法：node scripts/wasm-optimize.mjs [buildDir]
 * 默认处理 Build/MiniGame/Build/ 目录
 */

import { execSync } from 'child_process';
import { existsSync, statSync, renameSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const WASM_OPT = join(ROOT, 'tools/binaryen-version_131/bin/wasm-opt.exe');
const BUILD_DIR = resolve(process.argv[2] || 'Build/MiniGame/Build');

function findWasmFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findWasmFiles(fullPath));
    } else if (entry.name.endsWith('.wasm') && !entry.name.endsWith('.wasm.br')) {
      results.push(fullPath);
    }
  }
  return results;
}

function optimizeWasm(wasmPath) {
  if (!existsSync(WASM_OPT)) {
    console.warn('  [wasm-opt] wasm-opt 不存在，跳过 WASM 优化');
    return null;
  }

  const originalSize = statSync(wasmPath).size;
  const optimizedPath = wasmPath.replace(/\.wasm$/, '.optimized.wasm');

  try {
    execSync(`"${WASM_OPT}" "${wasmPath}" -Oz --converge --vacuum --strip-debug -o "${optimizedPath}"`, {
      encoding: 'utf-8',
      timeout: 120_000,
    });

    const optimizedSize = statSync(optimizedPath).size;
    const ratio = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    console.log(`  [wasm-opt] ${wasmPath.split(/[\\/]/).pop()}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${ratio}% 缩减)`);

    renameSync(optimizedPath, wasmPath);
    return { originalSize, optimizedSize };
  } catch (err) {
    console.error(`  [wasm-opt] 失败: ${err.message}`);
    if (existsSync(optimizedPath)) {
      try { unlinkSync(optimizedPath); } catch {}
    }
    return null;
  }
}

function gzipCompress(filePath) {
  const data = readFileSync(filePath);
  const compressed = gzipSync(data, { level: 9 });
  const gzPath = filePath + '.gz';
  writeFileSync(gzPath, compressed);

  const originalSize = data.length;
  const compressedSize = compressed.length;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  console.log(`  [gzip] ${filePath.split(/[\\/]/).pop()}: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${ratio}% 缩减)`);

  return { originalSize, compressedSize };
}

async function main() {
  console.log('[wasm-optimize] 开始 WASM 后处理优化...');
  console.log(`  目标目录: ${BUILD_DIR}`);

  if (!existsSync(BUILD_DIR)) {
    console.error('[wasm-optimize] 构建目录不存在');
    process.exit(1);
  }

  // 1. WASM 优化
  const wasmFiles = findWasmFiles(BUILD_DIR);
  console.log(`\n[1/2] 找到 ${wasmFiles.length} 个 WASM 文件`);
  for (const wasm of wasmFiles) {
    optimizeWasm(wasm);
  }

  // 2. 压缩优化后的 WASM
  console.log(`\n[2/2] 压缩 WASM 文件`);
  let totalOrig = 0, totalComp = 0;
  for (const wasm of wasmFiles) {
    const result = gzipCompress(wasm);
    if (result) { totalOrig += result.originalSize; totalComp += result.compressedSize; }
  }

  if (totalOrig > 0) {
    const ratio = ((1 - totalComp / totalOrig) * 100).toFixed(1);
    console.log(`\n  总计: ${(totalOrig/1024).toFixed(1)}KB → ${(totalComp/1024).toFixed(1)}KB (${ratio}% 缩减)`);
  }

  console.log('\n[wasm-optimize] ✅ 完成');
}

main().catch(err => { console.error('[wasm-optimize] 失败:', err.message); process.exit(1); });
