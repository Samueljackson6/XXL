const { execSync } = require('child_process');
const WebSocket = require('ws');
const { existsSync, statSync } = require('fs');
const { resolve } = require('path');

const ROOT = 'D:\\Tare-workspace\\Game\\WeChat Game\\XXL';
const MINIGAME_DIR = resolve(ROOT, 'minigame');
const DEVTOOLS_CLI = 'D:\\DevCache\\微信web开发者工具\\cli.bat';

async function main() {
  // Verify files
  const requiredFiles = [
    'game.json', 'game.js',
    'framework/MiniGame.framework.js.br',
    'framework/MiniGame.wasm.br',
    'framework/MiniGame.loader.js',
    'unity-namespace.js',
  ];
  for (const rel of requiredFiles) {
    const full = resolve(MINIGAME_DIR, rel);
    if (!existsSync(full)) { console.error('Missing:', rel); process.exit(1); }
    const size = statSync(full).size;
    console.log('OK:', rel, `${(size/1024).toFixed(1)}KB`);
  }

  // Kill existing DevTools
  console.log('Killing existing DevTools...');
  try { execSync('taskkill //F //IM wechatdevtools.exe', { stdio: 'ignore' }); } catch {}
  await new Promise(r => setTimeout(r, 3000));

  // Use PowerShell to start DevTools with auto command
  console.log('Starting DevTools...');
  const psCmd = `Start-Process -FilePath '${DEVTOOLS_CLI}' -ArgumentList 'auto','--project','${MINIGAME_DIR}','--appid','wx10c928d3274d2360','--auto-port','5000','--trust-project' -WindowStyle Normal`;
  execSync(`powershell.exe -Command "${psCmd.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
  console.log('DevTools started, waiting...');

  // Wait for IDE server to start
  await new Promise(r => setTimeout(r, 20000));

  // Check if port is open
  try {
    const result = execSync('netstat -ano | findstr :59902 | findstr LISTENING', { encoding: 'utf-8' });
    console.log('Port 59902:', result.trim());
  } catch {
    console.log('Port 59902 not yet open');
  }

  // Try to find the port
  const netstat = execSync('netstat -ano', { encoding: 'utf-8' });
  const listeningLines = netstat.split('\n').filter(l => l.includes('LISTENING'));
  const devToolsLines = listeningLines.filter(l => {
    const match = l.match(/:\s*(\d+)\s+\S+:\s*\d+\s+LISTENING\s+(\d+)/);
    if (!match) return false;
    const pid = match[2];
    try {
      const proc = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf-8' });
      return proc.includes('wechatdevtools') || proc.includes('nw');
    } catch { return false; }
  });
  console.log('DevTools ports:', devToolsLines);

  process.exit(0);
}

main().catch(e => console.error('Fatal:', e.message));
