const { spawn, execSync } = require('child_process');
const http = require('http');
const ws = require('ws');
const path = require('path');

const DEVTOOLS_CLI = path.resolve('D:\DevCache\微信web开发者工具', 'cli.bat');
const MINIGAME_DIR = path.resolve(process.cwd(), 'minigame');
const APPID = 'wx10c928d3274d2360';
const PORT = 5000;

function probeHttp(port, reqPath) {
  return new Promise(resolve => {
    http.request({hostname:'127.0.0.1',port,path:reqPath||'/',method:'GET',timeout:3000},res=>{
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({status:res.statusCode, body:body.slice(0,500)}));
    }).on('error',()=>resolve({status:0, body:''})).end();
  });
}

async function main() {
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await new Promise(r => setTimeout(r, 4000));

  const args = ['--port', PORT, 'auto', '--project', `"${MINIGAME_DIR}"`, '--appid', APPID, '--auto-port', PORT, '--trust-project'];
  const child = spawn(DEVTOOLS_CLI, args, {shell:true, detached:true, windowsHide:true});
  child.unref();

  // Wait for HTTP
  console.log('Waiting for IDE HTTP...');
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const r = await probeHttp(PORT);
    if (r.status > 0) {
      console.log('IDE HTTP ready at t=' + ((i+1)*3) + 's, status=' + r.status);
      break;
    }
  }

  // Wait extra for ws
  console.log('Waiting 25s for ws...');
  await new Promise(r => setTimeout(r, 25000));

  // Probe various HTTP endpoints
  const endpoints = ['/', '/api', '/api/version', '/debugger', '/json/list', '/json/version', '/api/projects', '/api/automation'];
  for (const ep of endpoints) {
    const r = await probeHttp(PORT, ep);
    console.log('GET ' + ep + ' -> ' + r.status + (r.body ? ' | ' + r.body.slice(0,100) : ''));
  }

  // Try ws paths
  const wsPaths = ['/', '/ws', '/debugger', '/api/ws', '/automation/ws', '/devtools/page'];
  for (const wp of wsPaths) {
    try {
      const sock = new ws('ws://127.0.0.1:' + PORT + wp);
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => { sock.close(); resolve(false); }, 2000);
        sock.on('open', () => { clearTimeout(t); console.log('WS OPEN: ' + wp); sock.close(); resolve(true); });
        sock.on('error', () => { clearTimeout(t); resolve(false); });
        sock.on('message', d => console.log('WS msg: ' + d.toString().slice(0,100)));
      });
    } catch {}
  }

  console.log('Done');
}
main();
