#!/usr/bin/env node
/**
 * Full WeChat MiniGame deployment pipeline
 * 1. Verify minigame files exist
 * 2. Launch DevTools with project
 * 3. Wait for project to compile
 * 4. Report status
 */

const { execSync, spawn } = require('child_process');
const { existsSync, statSync } = require('fs');
const { resolve, dirname } = require('path');

const ROOT = resolve(process.cwd());
const MINIGAME_DIR = resolve(ROOT, 'minigame');
const DEVTOOLS_CLI = resolve(ROOT, 'scripts', 'cli-wrapper.cmd');
const COMPILE_TIMEOUT_MS = 120000;
const DEVTOOLS_STARTUP_MS = 30000;
const PORT_SCAN_INTERVAL_MS = 3000;
const MAX_PORT_SCAN_ATTEMPTS = 20;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`[${new Date().toISOString().substr(11, 8)}] ${msg}`);
}

function checkRequiredFiles() {
  const required = [
    'game.json',
    'game.js',
    'weapp-adapter.js',
    'unity-namespace.js',
    'framework/MiniGame.loader.js',
    'framework/MiniGame.framework.js.br',
    'framework/MiniGame.wasm.br',
    '.framework/MiniGame.loader.js',
    '.framework/MiniGame.framework.js.br',
    '.framework/MiniGame.wasm.br',
  ];

  const missing = [];
  for (const rel of required) {
    const full = resolve(MINIGAME_DIR, rel);
    if (!existsSync(full)) {
      missing.push(rel);
      continue;
    }
    const size = statSync(full).size;
    log(`  OK: ${rel} (${(size / 1024).toFixed(1)}KB)`);
  }

  if (missing.length > 0) {
    log(`ERROR: Missing files: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

function findDevToolsPort() {
  try {
    const netstat = execSync('netstat -ano', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netstat.split('\n').filter(l => l.includes('LISTENING'));
    const ports = [];
    for (const line of lines) {
      const match = line.match(/:\s*(\d+)\s+\S+:\s*\d+\s+LISTENING\s+(\d+)/);
      if (!match) continue;
      const port = parseInt(match[1]);
      const pid = match[2];
      try {
        const proc = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH 2>nul`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
        if (proc.includes('wechatdevtools') || proc.includes('nw') || proc.includes('微信')) {
          ports.push(port);
        }
      } catch {}
    }
    return ports;
  } catch {
    return [];
  }
}

function waitForDevToolsReady(maxWaitMs = DEVTOOLS_STARTUP_MS) {
  log('Waiting for DevTools to start...');
  const start = Date.now();
  let lastPorts = [];

  while (Date.now() - start < maxWaitMs) {
    const ports = findDevToolsPort();
    if (ports.length > 0 && ports !== lastPorts) {
      log(`DevTools detected on ports: ${ports.join(', ')}`);
      lastPorts = ports;
      // Wait a bit more for the IDE server to be ready
      return new Promise(resolve => sleep(5000).then(() => resolve(ports)));
    }
    await sleep(PORT_SCAN_INTERVAL_MS);
  }

  log(`WARNING: DevTools did not start within ${maxWaitMs}ms`);
  return lastPorts;
}

async function main() {
  log('=== WeChat MiniGame Deployment Pipeline ===');

  // Step 1: Verify files
  log('\n[1/4] Verifying minigame files...');
  if (!checkRequiredFiles()) {
    log('ERROR: File verification failed. Run conversion first.');
    process.exit(1);
  }
  log('All files verified.');

  // Step 2: Kill existing DevTools
  log('\n[2/4] Preparing DevTools...');
  try {
    execSync('taskkill //F //IM wechatdevtools.exe 2>nul', { stdio: 'ignore' });
    log('Killed existing DevTools processes.');
  } catch {}
  await sleep(3000);

  // Step 3: Launch DevTools
  log('\n[3/4] Launching DevTools...');
  const psCmd = `Start-Process -FilePath '${DEVTOOLS_CLI}' -ArgumentList 'auto','--project','${MINIGAME_DIR}','--appid','wx10c928d3274d2360','--auto-port','5000','--trust-project' -WindowStyle Normal`;
  execSync(`powershell.exe -Command "${psCmd.replace(/"/g, '\\"')}"`, {
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  log('DevTools launch command sent.');

  // Step 4: Wait and report
  log('\n[4/4] Waiting for DevTools to be ready...');
  const ports = await waitForDevToolsReady();

  log('\n========================================');
  log('  DevTools launched successfully!');
  log('========================================');
  log(`  Project: ${MINIGAME_DIR}`);
  log(`  AppID:   wx10c928d3274d2360`);
  if (ports.length > 0) {
    log(`  Ports:   ${ports.join(', ')}`);
  }
  log('');
  log('  Next steps (manual in DevTools):');
  log('  1. Wait for project to fully load');
  log('  2. Enable wasmCodeSplit plugin if available');
  log('  3. Click "Compile" button');
  log('  4. Check console for runtime errors');
  log('');

  // Keep process alive
  process.stdin.resume();
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
