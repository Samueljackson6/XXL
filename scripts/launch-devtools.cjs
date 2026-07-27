const { execSync, spawn } = require('child_process');
const { existsSync, statSync } = require('fs');
const { resolve } = require('path');

const ROOT = 'D:\\Tare-workspace\\Game\\WeChat Game\\XXL';
const MINIGAME_DIR = resolve(ROOT, 'minigame');
const DEVTOOLS_CLI = resolve(ROOT, 'scripts', 'cli-wrapper.cmd');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
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
  await sleep(3000);

  console.log('Launching DevTools via launcher.launch() with wrapper...');
  console.log('cliPath:', DEVTOOLS_CLI, 'exists:', existsSync(DEVTOOLS_CLI));

  const { launcher } = require('miniprogram-automator');

  try {
    const mp = await launcher.launch({
      cliPath: DEVTOOLS_CLI,
      projectPath: MINIGAME_DIR,
      autoPort: 5000,
      trustProject: true,
    });

    const info = await mp.send('Tool.getInfo');
    console.log('Connected! DevTools v' + info.version);

    try {
      await mp.project.compile();
      console.log('Compile triggered!');
    } catch (e) {
      console.warn('Compile warning:', e.message);
    }

    console.log('\n========================================');
    console.log('  DevTools connected successfully!');
    console.log('========================================');

    process.stdin.resume();
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
}

main().catch(e => console.error('Fatal:', e.message));
