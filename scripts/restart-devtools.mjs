import { execSync, spawn } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = 'D:/DevCache/微信web开发者工具/cli.bat';
const autoPort = 5000;

async function waitForPort(port, timeoutMs = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf-8' });
      return true;
    } catch { await new Promise(r => setTimeout(r, 500)); }
  }
  return false;
}

async function main() {
  // 1. Build
  console.log('[1/3] Building project...');
  execSync('npx vite build --mode miniprogram', {
    cwd: projectDir,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });

  const srcGameJs = resolve(projectDir, 'dist/game.js');
  const dstGameJs = resolve(projectDir, 'game.js');
  if (existsSync(srcGameJs)) {
    copyFileSync(srcGameJs, dstGameJs);
    console.log('  game.js copied to project root');
  }

  // 2. Kill existing DevTools
  console.log('[2/3] Restarting DevTools...');
  try { execSync('taskkill //F //IM wechatdevtools.exe', { stdio: 'ignore' }); } catch {}
  await new Promise(r => setTimeout(r, 3000));

  // 3. Launch DevTools
  console.log(`[3/3] Launching DevTools with project...`);
  const cliProc = spawn(cliPath, [
    'auto', '--project', projectDir,
    '--auto-port', String(autoPort),
    '--trust-project'
  ], {
    shell: true, stdio: 'pipe'
  });

  let cliOutput = '';
  cliProc.stdout.on('data', d => { cliOutput += d.toString(); });
  cliProc.stderr.on('data', d => { cliOutput += d.toString(); });
  cliProc.on('exit', (code) => {
    console.log(`  CLI exited with code ${code}`);
    console.log('  Output:', cliOutput.trim().slice(0, 500));
  });

  console.log('  Waiting for automation WebSocket...');
  const portReady = await waitForPort(autoPort, 30000);
  if (!portReady) {
    console.error(`  Port ${autoPort} not available!`);
    console.log('  CLI output:', cliOutput);
    process.exit(1);
  }
  console.log(`  Port ${autoPort} listening`);

  console.log('\n========================================');
  console.log('  DevTools launched with project.');
  console.log('  Check IDE: should show "小游戏模式" now.');
  console.log('  Press Ctrl+C to close DevTools.');
  console.log('========================================');

  process.on('SIGINT', () => {
    console.log('\nClosing DevTools...');
    cliProc.kill();
    try { execSync('taskkill //F //IM wechatdevtools.exe', { stdio: 'ignore' }); } catch {}
    process.exit(0);
  });
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
