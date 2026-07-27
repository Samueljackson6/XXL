const { execSync, spawn } = require('child_process');
const http = require('http');
const ws = require('ws');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DEVTOOLS_CLI = 'D:\DevCache\微信web开发者工具\cli.bat';
const MINIGAME_DIR = 'D:\Tare-workspace\Game\WeChat Game\XXL\minigame';
const APPID = 'wx10c928d3274d2360';

// Use a RANDOM port for --port to see if IDE starts on a different port
const RANDOM_PORT = 6000;

async function probeHttp(port) {
  return new Promise(r => {
    http.request({hostname:'127.0.0.1',port,path:'/',method:'GET',timeout:2000},res=>r({ok:true,status:res.statusCode,port}))
    .on('error',()=>r({ok:false,port})).end();
  });
}

async function checkAllPorts(ports) {
  const results = {};
  for (const p of ports) {
    const r = await probeHttp(p);
    results[p] = r;
  }
  return results;
}

async function main() {
  // Kill existing
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  console.log('Launching DevTools with --port', RANDOM_PORT, '--auto-port', RANDOM_PORT);
  const args = ['--port', RANDOM_PORT, 'auto', '--project', MINIGAME_DIR, '--appid', APPID, '--auto-port', RANDOM_PORT, '--trust-project'];
  const child = spawn(DEVTOOLS_CLI, args, { shell: true, detached: true, windowsHide: true, stdio: ['ignore','pipe','ignore'] });
  child.unref();
  
  // Monitor stderr for port info
  if (child.stderr) {
    child.stderr.on('data', d => { 
      const msg = d.toString(); 
      if (msg.trim()) console.log('[IDE stderr]', msg.trim().slice(0, 200)); 
    });
  }

  // Probe multiple ports over time
  const probePorts = [RANDOM_PORT, RANDOM_PORT+1, RANDOM_PORT-1, 5858, 50314];
  
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const results = await checkAllPorts(probePorts);
    const activePorts = Object.entries(results).filter(([p, r]) => r.ok);
    if (activePorts.length > 0) {
      console.log(`[${(i+1)*3}s] Active ports:`, activePorts.map(([p,r]) => `${p}(${r.status})`).join(', '));
      
      // Try ws on each active port
      for (const [portStr, result] of activePorts) {
        const port = parseInt(portStr);
        try {
          const sock = new ws('ws://127.0.0.1:' + port + '/');
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => { sock.close(); resolve(false); }, 2000);
            sock.on('open', () => { clearTimeout(timer); console.log('  WS OPEN on port ' + port); sock.close(); resolve(true); });
            sock.on('error', () => { clearTimeout(timer); resolve(false); });
            sock.on('message', d => console.log('  WS msg:', d.toString().slice(0,100)));
          });
        } catch {}
      }
    } else {
      console.log(`[${(i+1)*3}s] No ports responding yet`);
    }
  }
  
  console.log('Done probing');
}

main().catch(e => console.error(e.message));
