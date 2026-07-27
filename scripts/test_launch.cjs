const { launcher } = require('miniprogram-automator');

async function main() {
  const DEVTOOLS_CLI = 'D:\DevCache\微信web开发者工具\cli.bat';
  const MINIGAME_DIR = 'D:\Tare-workspace\Game\WeChat Game\XXL\minigame';
  
  console.log('Testing launcher.launch()...');
  try {
    const mp = await launcher.launch({
      cliPath: DEVTOOLS_CLI,
      projectPath: MINIGAME_DIR,
      autoPort: 5000,
      trustProject: true,
    });
    console.log('Launched and connected!');
    const info = await mp.send('Tool.getInfo');
    console.log('DevTools version:', info.version);
    await mp.close();
  } catch (e) {
    console.log('Error:', e.message);
  }
}

main();
