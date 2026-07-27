const { spawn, execSync } = require('child_process');
const ws = require('ws');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DEVTOOLS_NODE = 'D:\DevCache\微信web开发者工具\node.exe';
const DEVTOOLS_CLI_JS = 'D:\DevCache\微信web开发者工具\cli.js';
const MINIGAME_DIR = 'D:\Tare-workspace\Game\WeChat Game\XXL\minigame';
const APPID = 'wx10c928d3274d2360';
const PORT = 5000;

function getListeningPorts() {
  try {
    const out = execSync('netstat -ano | findstr LISTENING', {encoding:'utf-8', stdio:['pipe','pipe','ignore']});
    const lines = out.trim().split('\n');
    const ports = [];
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const addr = parts[1]; // e.g. 0.0.0.0:5000 or [::]:5000
      const match = addr.match(/:(\d+)$/);
      if (match) ports.push(parseInt(match[1]));
    }
    return ports;
  } catch { return []; }
}

async function probeWs(port, timeout = 2000) {
  return new Promise(resolve => {
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) { resolved = true; resolve(false); } }, timeout);
    const paths = ['/', '/ws', '/api/ws', '/automation', '/debugger'];
    for (const path of paths) {
      try {
        const sock = new ws('ws://127.0.0.1:' + port + path);
        sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  WS OPEN on port ' + port + ' path ' + path); sock.close(); resolve(true); } });
        sock.on('error', () => { sock.close(); });
      } catch {}
    }
    if (!resolved) { clearTimeout(timer); resolve(false); }
  });
}

async function main() {
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  const args = ['--port', PORT, 'auto', '--project', MINIGAME_DIR, '--appid', APPID, '--auto-port', PORT, '--trust-project'];
  const child = spawn(DEVTOOLS_NODE, [DEVTOOLS_CLI_JS, ...args], { shell: false, detached: true, windowsHide: true });
  child.unref();
  console.log('Launched PID:', child.pid);

  // Wait for IDE to be fully up
  for (let i = 0; i < 15; i++) {
    await sleep(3000);
    const ports = getListeningPorts();
    if (ports.includes(PORT)) {
      console.log('IDE HTTP ready on port ' + PORT + ' at ' + ((i+1)*3) + 's');
      console.log('Listening ports:', ports.join(', '));
      break;
    }
  }

  // Extra wait for ws to initialize
  console.log('Waiting 15s for wsEndpoint to initialize...');
  await sleep(15000);

  // Scan ALL listening ports for ws
  console.log('Scanning all ports for WebSocket...');
  const ports = getListeningPorts();
  console.log('Current listening ports:', ports.join(', '));

  for (const p of ports) {
    const result = await probeWs(p, 3000);
    if (result) { console.log('FOUND ws on port ' + p); process.exit(0); }
  }

  console.log('No ws found on any port. Will retry in 10s...');
  await sleep(10000);
  const ports2 = getListeningPorts();
  console.log('New listening ports:', ports2.join(', '));
  for (const p of ports2) {
    const result = await probeWs(p, 3000);
    if (result) { console.log('FOUND ws on port ' + p); process.exit(0); }
  }

  console.log('FAILED: no ws endpoint found');
  process.exit(1);
}

main();
