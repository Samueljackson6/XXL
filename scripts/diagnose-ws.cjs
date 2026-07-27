#!/usr/bin/env node
/**
 * Diagnostic: Find wsEndpoint after IDE launches
 * Uses the EXACT same launch approach as v2.0 (which worked)
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

function getListeningPorts() {
  try {
    const out = execSync('netstat -ano | findstr LISTENING', {encoding:'utf-8', stdio:['pipe','pipe','ignore']});
    const ports = new Set();
    for (const line of out.trim().split('\n')) {
      const parts = line.trim().split(/\s+/);
      const addr = parts[1] || '';
      const m = addr.match(/:(\d+)$/);
      if (m) ports.add(parseInt(m[1]));
    }
    return [...ports].sort((a,b) => a-b);
  } catch { return []; }
}

async function probeWs(port, timeout = 3000) {
  return new Promise(resolve => {
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, timeout);
    try {
      const sock = new ws('ws://127.0.0.1:' + port + '/');
      sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  >> WS OPEN on port ' + port); sock.close(); resolve(true); } });
      sock.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } });
      sock.on('message', d => { console.log('  >> WS msg on ' + port + ': ' + d.toString().slice(0,100)); });
    } catch { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } }
  });
}

async function main() {
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // EXACT same launch as v2.0 (which successfully connected wsEndpoint)
  const args = ['--port', AUTO_PORT, 'auto', '--project', `"${MINIGAME_DIR}"`, '--appid', APPID, '--auto-port', AUTO_PORT, '--trust-project'];
  console.log('Launching with cli.bat shell:true detached:true...');
  const child = spawn(DEVTOOLS_CLI, args, {
    shell: true,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  child.unref();

  if (child.stderr) {
    child.stderr.on('data', d => {
      const msg = d.toString().trim();
      if (msg) console.log('[IDE stderr]', msg.slice(0, 200));
    });
  }

  // Wait for HTTP
  console.log('Waiting for HTTP on port ' + AUTO_PORT + '...');
  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    try {
      const r = execSync('netstat -ano | findstr :' + AUTO_PORT + ' | findstr LISTENING', {encoding:'utf-8', stdio:['pipe','pipe','ignore']});
      if (r.trim()) {
        console.log('HTTP ready at ' + ((i+1)*3) + 's');
        console.log('Port ' + AUTO_PORT + ':', r.trim().split('\n').map(l => l.trim()));
        break;
      }
    } catch {}
  }

  // Wait extra time for wsEndpoint
  console.log('Waiting 20s for wsEndpoint to initialize...');
  await sleep(20000);

  // Scan all listening ports
  const ports = getListeningPorts();
  console.log('All listening ports:', ports.join(', '));

  // Try ws on each port
  console.log('Scanning for ws...');
  for (const p of ports) {
    const ok = await probeWs(p, 3000);
    if (ok) { console.log('SUCCESS!'); process.exit(0); }
  }

  console.log('No ws found. Trying miniprogram-automator connect...');
  try {
    const { launcher } = require('miniprogram-automator');
    const mp = await launcher.connect({ wsEndpoint: 'ws://127.0.0.1:' + AUTO_PORT });
    console.log('launcher.connect SUCCESS!');
    process.exit(0);
  } catch(e) {
    console.log('launcher.connect failed:', e.message.slice(0, 200));
  }

  console.log('\nFAILED - no ws endpoint found');
  process.exit(1);
}

main();
