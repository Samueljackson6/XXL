#!/usr/bin/env node
/**
 * Diagnostic: IDE launches with shell:true + cli.bat, but wsEndpoint won't connect.
 * This script: launches IDE, scans ALL ports, tries multiple ws paths,
 * and also tries miniprogram-automator's connect directly.
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
const PORT = 5000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getListeningPorts() {
  try {
    const out = execSync('netstat -ano | findstr LISTENING', {encoding:'utf-8', stdio:['pipe','pipe','ignore']});
    const ports = new Map();
    for (const line of out.trim().split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const m = parts[1].match(/:(\d+)$/);
        if (m) ports.set(parseInt(m[1]), parts[2]);
      }
    }
    return ports;
  } catch { return new Map(); }
}

async function probeHttp(port) {
  return new Promise(r => {
    http.request({hostname:'127.0.0.1',port,path:'/',method:'GET',timeout:2000},res=>r({ok:true,status:res.statusCode}))
    .on('error',()=>r({ok:false})).end();
  });
}

async function probeWs(port, wsPath, timeout = 2500) {
  return new Promise(resolve => {
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, timeout);
    try {
      const sock = new ws('ws://127.0.0.1:' + port + (wsPath || '/'));
      sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  >> WS OPEN: port=' + port + ' path=' + (wsPath||'/')); sock.close(); resolve(true); } });
      sock.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } });
      sock.on('message', d => { console.log('  >> WS msg on ' + port + (wsPath||'') + ': ' + d.toString().slice(0,100)); });
      sock.on('close', (code, reason) => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  >> WS closed: ' + code + ' ' + reason.toString().slice(0,50)); resolve(false); } });
    } catch { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } }
  });
}

async function main() {
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // Launch with cli.bat (shell:true) - this DOES work per v3.1 output
  const args = ['--port', PORT, 'auto', '--project', `"${MINIGAME_DIR}"`, '--appid', APPID, '--auto-port', PORT, '--trust-project'];
  console.log('Launching with cli.bat shell:true...');
  const child = spawn(DEVTOOLS_CLI, args, {shell:true, detached:true, windowsHide:true, stdio:['ignore','pipe','ignore']});
  child.unref();

  if (child.stderr) {
    child.stderr.on('data', d => { const m = d.toString().trim(); if (m) console.log('[stderr]', m.slice(0,200)); });
  }

  // Wait for IDE HTTP
  console.log('Waiting for HTTP on port ' + PORT + '...');
  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const r = await probeHttp(PORT);
    if (r.ok) {
      console.log('HTTP ready at ' + ((i+1)*3) + 's (status: ' + r.status + ')');
      break;
    }
    console.log('  [' + ((i+1)*3) + 's] not yet');
  }

  // Wait extra 20s for wsEndpoint
  console.log('Waiting 20s for wsEndpoint to initialize...');
  await sleep(20000);

  // Get all listening ports
  const portsMap = getListeningPorts();
  const portList = [...portsMap.entries()].sort((a,b) => a[0]-b[0]);
  console.log('\nListening ports:', portList.map(([p,pid]) => p + '(PID:' + pid + ')').join(', '));

  // Try ws on port 5000 with various paths
  console.log('\nTrying ws on port ' + PORT + ' with different paths...');
  const wsPaths = ['/', '/ws', '/debugger', '/api/ws', '/automation', '/ide/ws', '/page/ws', '/devtools/page/ws'];
  for (const wp of wsPaths) {
    const ok = await probeWs(PORT, wp, 1500);
    if (ok) { console.log('SUCCESS! ws on port ' + PORT + wp); process.exit(0); }
  }

  // Try ws on ALL listening ports
  console.log('\nTrying ws on ALL listening ports...');
  for (const [port, pid] of portList) {
    const ok = await probeWs(port);
    if (ok) { console.log('SUCCESS! ws on port ' + port); process.exit(0); }
  }

  // Try miniprogram-automator's own connect method
  console.log('\nTrying miniprogram-automator launcher.connect...');
  try {
    const { launcher } = require('miniprogram-automator');
    const mp = await launcher.connect({ wsEndpoint: 'ws://127.0.0.1:' + PORT });
    console.log('SUCCESS via launcher.connect!');
    process.exit(0);
  } catch(e) {
    console.log('launcher.connect failed:', e.message.slice(0, 200));
  }

  // Try the full launch approach
  console.log('\nTrying miniprogram-automator launcher.launch...');
  try {
    const { launcher } = require('miniprogram-automator');
    const mp = await launcher.launch({
      projectPath: MINIGAME_DIR,
      appID: APPID,
      port: PORT,
    });
    console.log('SUCCESS via launcher.launch!');
    process.exit(0);
  } catch(e) {
    console.log('launcher.launch failed:', e.message.slice(0, 200));
  }

  console.log('\nFAILED: no ws endpoint found');
  process.exit(1);
}

main();
