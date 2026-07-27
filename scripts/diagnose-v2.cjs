#!/usr/bin/env node
/**
 * EXACT replica of v2.0 approach that SUCCESSFULLY connected wsEndpoint.
 * Uses shell:false, stdio:'ignore', and spawn with array args.
 * If this works, we know the exact config that works.
 */

const { spawn, execSync } = require('child_process');
const ws = require('ws');
const http = require('http');
const path = require('path');

const ROOT = process.cwd();
const MINIGAME_DIR = path.resolve(ROOT, 'minigame');
const DEVTOOLS_DIR = 'D:\\DevCache\\微信web开发者工具';
const DEVTOOLS_CLI = path.resolve(DEVTOOLS_DIR, 'cli.bat');
const APPID = 'wx10c928d3274d2360';
const AUTO_PORT = 5000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function probeHttp(port) {
  return new Promise(resolve => {
    http.request({hostname:'127.0.0.1',port,path:'/',method:'GET',timeout:3000},res=>{
      resolve({ok:true,status:res.statusCode});
    }).on('error',()=>resolve({ok:false})).end();
  });
}

async function probeWs(port, timeout = 2000) {
  return new Promise(resolve => {
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, timeout);
    try {
      const sock = new ws('ws://127.0.0.1:' + port + '/');
      sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  WS OPEN on port ' + port); sock.close(); resolve(true); } });
      sock.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } });
      sock.on('message', d => console.log('  WS msg:', d.toString().slice(0,100)));
    } catch { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } }
  });
}

async function main() {
  // Kill existing
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // EXACT same config as v2.0 deploy-auto.cjs:
  // shell: false (default), detached: true, stdio: 'ignore' (single string)
  console.log('Launching with shell:false, detached:true, stdio:ignore...');
  const args = ['--port', AUTO_PORT, 'auto', '--project', MINIGAME_DIR, '--appid', APPID, '--auto-port', AUTO_PORT, '--trust-project'];
  const child = spawn(DEVTOOLS_CLI, args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  console.log('Spawned PID:', child.pid);

  // Wait for HTTP (exactly like v2.0 Step 3)
  console.log('Waiting for HTTP server...');
  const startTime = Date.now();
  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const result = await probeHttp(AUTO_PORT);
    if (result.ok) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('OK: DevTools IDE server on port ' + AUTO_PORT + ' (' + elapsed + 's)');
      break;
    }
    console.log('  [' + ((i+1)*3) + 's] HTTP not ready yet');
  }

  // Extra wait
  await sleep(5000);

  // Connect via miniprogram-automator (exactly like v2.0 Step 4)
  console.log('\nConnecting via launcher.connect...');
  const { launcher } = require('miniprogram-automator');
  const wsEndpoint = 'ws://127.0.0.1:' + AUTO_PORT;

  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const mp = await launcher.connect({ wsEndpoint });
      console.log('SUCCESS: Connected on attempt ' + attempt + '/20');
      try {
        const info = await mp.send('Tool.getInfo');
        console.log('DevTools version:', info.version || 'unknown');
      } catch {}
      await mp.close();
      process.exit(0);
    } catch (e) {
      console.log('  Attempt ' + attempt + '/20 failed: ' + e.message.slice(0, 80));
    }
    await sleep(3000);
  }

  console.log('\nFAILED: Could not connect wsEndpoint');
  process.exit(1);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
