#!/usr/bin/env node
/**
 * Diagnostic: probe wsEndpoint availability after IDE launch
 */

const { execSync } = require('child_process');
const http = require('http');
const ws = require('ws');
const path = require('path');

const ROOT = process.cwd();
const MINIGAME_DIR = path.resolve(ROOT, 'minigame');
const DEVTOOLS_DIR = 'D:\\DevCache\\微信web开发者工具';
const DEVTOOLS_CLI = path.resolve(DEVTOOLS_DIR, 'cli.bat');
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
    } catch {
      if (!resolved) { resolved = true; clearTimeout(timer); resolve(false); }
    }
  });
}

async function main() {
  // Kill existing DevTools
  try { execSync('taskkill //F //IM wechatdevtools.exe 2>nul', {stdio:'ignore'}); } catch {}
  await sleep(4000);

  // Launch IDE with PowerShell Start-Process (avoids shell quoting issues)
  const psCmd = 'Start-Process -FilePath "' + DEVTOOLS_CLI + '" -ArgumentList "--port","' + AUTO_PORT + '","auto","--project","' + MINIGAME_DIR + '","--appid","' + APPID + '","--auto-port","' + AUTO_PORT + '","--trust-project"" -WindowStyle Hidden';
  console.log('Launching DevTools...');
  try {
    execSync('powershell.exe -Command "' + psCmd + '"', {encoding:'utf-8', stdio:['pipe','pipe','ignore']});
  } catch(e) {
    console.log('PS err:', e.message);
  }
  console.log('Launch command sent, probing...');

  // Probe for 60 seconds
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const elapsed = (i + 1) * 3;
    const h = await probeHttp(AUTO_PORT);

    if (h.ok) {
      console.log('[' + elapsed + 's] HTTP:' + h.status);

      // Check ws on auto-port and auto-port+1
      const wsPorts = [AUTO_PORT, AUTO_PORT + 1];
      for (const wp of wsPorts) {
        const wsOk = await probeWs(wp);
        if (wsOk) {
          console.log('  wsEndpoint READY on port ' + wp + '!');
          return { success: true, wsPort: wp };
        }
        console.log('  ws on port ' + wp + ': not ready');
      }
    } else {
      console.log('[' + elapsed + 's] HTTP: not yet');
    }
  }

  console.log('Timed out after 60s - wsEndpoint never became ready');
  return { success: false };
}

main().then(result => {
  console.log('\nResult:', JSON.stringify(result));
  process.exit(result.success ? 0 : 1);
}).catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
