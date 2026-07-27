const { spawn, execSync } = require('child_process');
const ws = require('ws');
const http = require('http');
const path = require('path');

const DEVTOOLS_NODE = 'D:\DevCache\微信web开发者工具\node.exe';
const DEVTOOLS_CLI_JS = path.resolve('D:\DevCache\微信web开发者工具', 'cli.js');
const MINIGAME_DIR = path.resolve(process.cwd(), 'minigame');
const APPID = 'wx10c928d3274d2360';
const PORT = 5000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function probeHttp(port) {
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
      sock.on('open', () => { if (!resolved) { resolved = true; clearTimeout(timer); console.log('  WS OPEN on port ' + port); sock.close(); resolve(true); } });
      sock.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } });
      sock.on('message', d => console.log('  WS msg:', d.toString().slice(0,100)));
    } catch { if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); } }
  });
}

async function main() {
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // KEY: spawn node.exe + cli.js with shell:false + array args
  // This avoids shell quoting issues AND can execute without .bat
  const args = ['--port', PORT, 'auto', '--project', MINIGAME_DIR, '--appid', APPID, '--auto-port', PORT, '--trust-project'];
  console.log('Spawning:', DEVTOOLS_NODE, [DEVTOOLS_CLI_JS, ...args].join(' '));
  
  const child = spawn(DEVTOOLS_NODE, [DEVTOOLS_CLI_JS, ...args], {
    shell: false,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  child.unref();
  console.log('Spawned PID:', child.pid);

  // Wait for HTTP
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

  // Poll wsEndpoint
  console.log('Polling wsEndpoint...');
  for (let attempt = 1; attempt <= 20; attempt++) {
    await sleep(3000);
    const ok = await probeWs(PORT);
    if (ok) { console.log('SUCCESS on attempt ' + attempt); process.exit(0); }
    console.log('  Attempt ' + attempt + '/20');
  }
  console.log('FAILED');
}

main().catch(e => console.error(e.message));
