#!/usr/bin/env node
/**
 * XXL Tower Defense — Deploy + Test Pipeline
 *
 * Combined workflow:
 *   1. Verify and patch minigame files (same as deploy-auto.cjs Step 1)
 *   2. Launch DevTools and connect (same as deploy-auto.cjs Step 2)
 *   3. Trigger compilation (same as deploy-auto.cjs Step 3)
 *   4. Monitor console for errors (same as deploy-auto.cjs Step 4)
 *
 * This script provides a single entry point for the full deployment flow.
 * It assumes Unity batchmode build has already been run (minigame/ exists).
 *
 * Usage: node scripts/deploy-and-test.cjs
 */

const { execSync, spawn } = require('child_process');
const { existsSync, statSync, readFileSync, writeFileSync, copyFileSync, readdirSync } = require('fs');
const { resolve } = require('path');

// ============================================================================
// Configuration
// ============================================================================

const ROOT = resolve(process.cwd());
const MINIGAME_DIR = resolve(ROOT, 'minigame');
const DEVTOOLS_DIR = 'D:\\DevCache\\微信web开发者工具';
const APPID = 'wx10c928d3274d2360';
const AUTO_PORT = 5000;
const MONITOR_DURATION_MS = 120000;

// ============================================================================
// Logging
// ============================================================================

const START_TIME = Date.now();
function log(msg) {
  console.log(`[${((Date.now() - START_TIME) / 1000).toFixed(1)}s] ${msg}`);
}
function logStep(step, total, msg) { log(`[${step}/${total}] ${msg}`); }
function logOk(msg) { log(`  OK: ${msg}`); }
function logErr(msg) { log(`  ERROR: ${msg}`); }
function logWarn(msg) { log(`  WARN: ${msg}`); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function execQuiet(cmd) {
  try {
    return require('child_process').execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch { return null; }
}

// ============================================================================
// File Operations (same as deploy-auto.cjs)
// ============================================================================

function copyFrameworkDir(src, dst) {
  if (!existsSync(dst)) {
    try { execQuiet(`powershell.exe -Command "New-Item -ItemType Directory -Path '${dst}' -Force"`); } catch {}
  }
  const items = readdirSync(src);
  for (const item of items) {
    const srcPath = resolve(src, item);
    const dstPath = resolve(dst, item);
    if (statSync(srcPath).isDirectory()) {
      copyFrameworkDir(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

function getFileList(dir) {
  const result = [];
  function walk(d) {
    const items = readdirSync(d);
    for (const item of items) {
      const full = resolve(d, item);
      const rel = full.slice(dir.length + 1);
      if (statSync(full).isDirectory()) { walk(full); }
      else { result.push(rel); }
    }
  }
  walk(dir);
  return result;
}

// ============================================================================
// Step 1: Verify and patch files
// ============================================================================

async function probeHttp(hostname, port) {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.request({
      hostname, port, path: '/', method: 'GET', timeout: 3000
    }, (res) => resolve({ ok: true, status: res.statusCode }));
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
    req.end();
  });
}

function verifyAndPatchFiles() {
  logStep(1, 4, 'Verifying and patching minigame files...');

  const required = [
    'game.json', 'game.js', 'weapp-adapter.js', 'unity-namespace.js',
    'framework/MiniGame.loader.js', 'framework/MiniGame.framework.js.br', 'framework/MiniGame.wasm.br',
  ];
  for (const rel of required) {
    const full = resolve(MINIGAME_DIR, rel);
    if (!existsSync(full)) { logErr(`Missing: ${rel}`); return false; }
    logOk(`${rel} (${(statSync(full).size / 1024).toFixed(1)}KB)`);
  }

  // Sync .framework/ directory
  const dotFramework = resolve(MINIGAME_DIR, '.framework');
  const framework = resolve(MINIGAME_DIR, 'framework');
  if (!existsSync(dotFramework)) {
    log('  Creating .framework/ directory...');
    copyFrameworkDir(framework, dotFramework);
    logOk('.framework/ created');
  } else {
    const srcFiles = getFileList(framework);
    const dstFiles = getFileList(dotFramework);
    const missing = srcFiles.filter(f => !dstFiles.includes(f));
    if (missing.length > 0) {
      log(`  Syncing ${missing.length} files to .framework/...`);
      for (const f of missing) copyFileSync(resolve(framework, f), resolve(dotFramework, f));
      logOk('Files synced');
    } else {
      logOk('.framework/ in sync');
    }
  }

  // Ensure game-init.js exists and is imported
  const gameInitPath = resolve(MINIGAME_DIR, 'game-init.js');
  if (!existsSync(gameInitPath)) {
    log('  Creating game-init.js (navigator/window polyfill)...');
    writeFileSync(gameInitPath, readFileSync(resolve(ROOT, 'minigame', 'game-init.js'), 'utf-8'));
    logOk('game-init.js created');
  }

  const gameJsPath = resolve(MINIGAME_DIR, 'game.js');
  const gameJs = readFileSync(gameJsPath, 'utf-8');
  if (!gameJs.includes("import './game-init'")) {
    log('  Patching game.js with game-init import...');
    writeFileSync(gameJsPath, gameJs.replace("// @ts-nocheck\n", "// @ts-nocheck\nimport './game-init';\n"));
    logOk('game.js patched');
  } else {
    logOk('game.js already has game-init import');
  }

  log('All files verified and patched.');
  return true;
}

// ============================================================================
// Step 2: Launch DevTools + Connect
// ============================================================================

function killDevTools() {
  execQuiet('taskkill //F //IM wechatdevtools.exe 2>nul');
  sleep(4000);
}

const DEVTOOLS_CLI_BAT = resolve(DEVTOOLS_DIR, 'cli.bat');

async function launchAndConnect() {
  logStep(2, 4, 'Launching DevTools and connecting...');
  killDevTools();
  log('  Spawning IDE with shell:true + cli.bat...');

  execQuiet('taskkill //F //IM wechatdevtools.exe 2>nul');
  sleep(3000);

  const args = ['--port', AUTO_PORT, 'auto', '--project', MINIGAME_DIR, '--appid', APPID, '--auto-port', AUTO_PORT, '--trust-project'];
  const child = spawn(DEVTOOLS_CLI_BAT, args, {
    shell: true,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  child.unref();

  log(`IDE spawned (PID: ${child.pid})`);
  log('  Waiting for IDE HTTP server on port ' + AUTO_PORT + '...');

  // Wait for IDE HTTP server
  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const r = await probeHttp('127.0.0.1', AUTO_PORT);
    if (r.ok) {
      log(`  IDE HTTP ready (${((i+1)*3)}s)`);
      break;
    }
    log(`  [${((i+1)*3)}s] waiting...`);
  }

  // Extra wait for wsEndpoint to initialize
  log('  Waiting 20s for wsEndpoint...');
  await sleep(20000);

  // Connect via launcher.connect()
  log('  Connecting via launcher.connect() ws://127.0.0.1:9996...');
  const { launcher } = require('miniprogram-automator');

  let mp;
  try {
    mp = await launcher.connect({ wsEndpoint: 'ws://127.0.0.1:9996' });
    logOk('Connected on ws://127.0.0.1:9996');
  } catch (e) {
    log(`  ws:9996 failed: ${e.message.slice(0, 80)}`);
    logWarn('IDE launched but could not connect. DevTools window should be open for manual compilation.');
    return null;
  }

  try {
    const info = await mp.send('Tool.getInfo');
    log(`  DevTools v${info.version || 'unknown'}`);
  } catch {}

  return mp;
}

// ============================================================================
// Step 3: Trigger compilation
// ============================================================================

async function triggerCompilation(mp) {
  logStep(3, 4, 'Triggering compilation...');

  let cdps = null;
  try {
    cdps = await mp.getNewCDPSession();
    log('  CDP session available');
  } catch {
    logWarn('CDP not available, using UI Automation');
  }

  if (cdps) {
    try {
      await cdps.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'b', code: 'KeyB', modifiers: 2 });
      await cdps.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'b', code: 'KeyB' });
      logOk('Ctrl+B sent via CDP');
      await cdps.close();
      return true;
    } catch (e) {
      logWarn(`CDP Ctrl+B failed: ${e.message}`);
    }
  }

  // Fallback: Windows UI Automation
  const psCmd = `Add-Type -AssemblyName System.Windows.Forms; Add-Type @'
using System;
using System.Runtime.InteropServices;
public class W32 {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
}
'@; $p = Get-Process -Name wechatdevtools -EA SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1; if ($p) { $h = [IntPtr]::new([long]$p.MainWindowHandle); if ([W32]::IsIconic($h)) { [W32]::ShowWindow($h, 9); } [W32]::SetForegroundWindow($h); Start-Sleep -Milliseconds 500; [System.Windows.Forms.SendKeys]::SendWait('^b'); Write-Host 'OK' } else { Write-Host 'NO_PROCESS' }`;

  const psCmdEscaped = psCmd.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, '; ');
  const result = execQuiet(`powershell.exe -Command "${psCmdEscaped}"`);
  if (result && result.includes('OK')) {
    logOk('Ctrl+B sent via Windows UI Automation');
    return true;
  }

  logWarn('Could not trigger compilation automatically.');
  return false;
}

// ============================================================================
// Step 4: Monitor console
// ============================================================================

async function monitorConsole(mp) {
  logStep(4, 4, 'Monitoring runtime console...');

  const errors = [];
  const consoleEntries = [];
  let monitorDone = false;

  mp.on('console', (entry) => {
    try {
      const msg = typeof entry === 'string' ? entry : JSON.stringify(entry);
      consoleEntries.push(msg);
      if (/TypeError|SyntaxError|ReferenceError|Error/i.test(msg)) {
        errors.push(msg);
        if (errors.length <= 50) console.log(`  [ERROR] ${msg.slice(0, 200)}`);
      }
    } catch {}
  });

  mp.on('exception', (e) => {
    try {
      const msg = typeof e === 'string' ? e : JSON.stringify(e);
      errors.push(msg);
      if (errors.length <= 50) console.log(`  [EXCEPTION] ${msg.slice(0, 200)}`);
    } catch {}
  });

  log(`  Monitoring for ${MONITOR_DURATION_MS / 1000}s...`);

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!monitorDone) { monitorDone = true; log('  Monitor timeout'); resolve(); }
    }, MONITOR_DURATION_MS);

    const checkInterval = setInterval(() => {
      if (!monitorDone) {
        const hasInit = consoleEntries.some(e => /game.*init|unity|loaded|ready|MiniGame|compile/i.test(e));
        const noErrors = errors.length === 0;
        if (hasInit && noErrors && consoleEntries.length > 5) {
          if (!monitorDone) {
            monitorDone = true;
            clearTimeout(timeout);
            clearInterval(checkInterval);
            log(`  Game initialized! (${((Date.now() - START_TIME) / 1000).toFixed(1)}s)`);
            resolve();
          }
        }
      }
    }, 5000);
  });

  try { await mp.close(); } catch {}

  log(`\n  Console entries: ${consoleEntries.length}`);
  log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    log('\n  ERRORS:');
    errors.slice(0, 20).forEach((e, i) => log(`    [${i + 1}] ${e.slice(0, 300)}`));
    if (errors.length > 20) log(`    ... +${errors.length - 20} more`);
    return errors;
  }

  log('\n  No runtime errors detected!');
  return [];
}

// ============================================================================
// Report
// ============================================================================

function report(result) {
  const elapsed = ((Date.now() - START_TIME) / 1000).toFixed(1);
  const success = result.success === true;
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │   XXL Tower Defense — Deployment Report     │');
  console.log('  ├─────────────────────────────────────────────┤');
  console.log(`  │  Status:  ${(success ? 'SUCCESS ✓' : 'ERRORS ✗').padEnd(22)}│`);
  console.log(`  │  Time:    ${elapsed.padStart(6)}s                         │`);
  console.log(`  │  AppID:   ${APPID} │`);
  if (result.errors !== undefined) {
    console.log(`  │  Errors:  ${String(result.errors).padStart(6)} │`);
  }
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  XXL Tower Defense — WeChat MiniGame      ║');
  console.log('║  Deploy + Test Pipeline                   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');

  try {
    if (!verifyAndPatchFiles()) {
      logErr('File verification failed.');
      process.exit(1);
    }

    const mp = await launchAndConnect();
    if (!mp) {
      report({ success: false });
      process.exit(1);
    }

    const compiled = await triggerCompilation(mp);
    if (!compiled) {
      logWarn('Compilation trigger failed — will still monitor');
    }

    log('  Waiting 30s for compilation to finish...');
    await sleep(30000);

    const errors = await monitorConsole(mp);
    const success = errors.length === 0;
    report({ success, errors: errors.length });

    if (!success) process.exit(1);

  } catch (err) {
    log(`FATAL: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
