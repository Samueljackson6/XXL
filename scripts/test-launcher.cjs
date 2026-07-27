#!/usr/bin/env node
/**
 * Test: use Launcher's EXACT approach (stdio:ignore, no shell, no detached)
 */

const { spawn } = require('child_process');
const http = require('http');
const ws = require('ws');
const path = require('path');

const ROOT = process.cwd();
const MINIGAME_DIR = path.resolve(ROOT, 'minigame');
const DEVTOOLS_CLI = 'D:\DevCache\微信web开发者工具\cli.bat';
const APPID = 'wx10c928d3274d2360';
const AUTO_PORT = 5000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function probeHttp(port) {
  return new Promise(r => {
    http.request({hostname:'127.0.0.1',port,path:'/',method:'GET',timeout:3000},res=>r({ok:true,status:res.statusCode}))
    .on('error',()=>r({ok:false})).end();
  });
}

async function probeWs(port, timeout = 2000) {
  return new Promise(resolve => {
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, timeout);
    try {
      const sock = new ws('ws://127.0.0.1:' + port + '/');
      sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); sock.close(); resolve(true); } });
      sock.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } });
      sock.on('message', (d) => { console.log('  WS message: ' + d.toString().slice(0, 200)); });
    } catch {
      if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); }
    }
  });
}

async function main() {
  // Kill existing
  try { require('child_process').execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // Launch EXACTLY like Launcher.js does it:
  // spawn(e, n, {stdio:"ignore"}) - no shell, no detached
  const args = [
    '--port', AUTO_PORT,
    'auto',
    '--project', MINIGAME_DIR,
    '--appid', APPID,
    '--auto-port', AUTO_PORT,
    '--trust-project'
  ];

  console.log('Launching with spawn(stdio:ignore)...');
  let spawnError = null;
  let exited = false;

  const child = spawn(DEVTOOLS_CLI, args, { stdio: 'ignore' });
  child.on('error', (e) => { spawnError = e; console.log('Spawn error:', e.message); });
  child.on('exit', (code) => {
    console.log('Spawn exited with code:', code);
    exited = true;
  });

  // Wait for HTTP server (like waitForDevTools does)
  console.log('Waiting for HTTP server...');
  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const h = await probeHttp(AUTO_PORT);
    if (h.ok) {
      console.log('HTTP ready on port ' + AUTO_PORT + ' (status: ' + h.status + ')');
      break;
    }
    console.log('  HTTP not ready yet...');
  }

  // Now try wsEndpoint polling (like connectToDevTools does)
  console.log('Polling wsEndpoint...');
  for (let attempt = 1; attempt <= 20; attempt++) {
    await sleep(3000);
    const wsOk = await probeWs(AUTO_PORT);
    if (wsOk) {
      console.log('SUCCESS: wsEndpoint connected on attempt ' + attempt);
      child.kill();
      process.exit(0);
    }
    console.log('  Attempt ' + attempt + '/20: ws not ready');
  }

  console.log('\nFAILED: wsEndpoint never connected');
  console.log('Spawn error:', spawnError ? spawnError.message : 'none');
  console.log('Exited:', exited);
  child.kill();
  process.exit(1);
}

main();
