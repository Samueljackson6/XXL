const { launcher } = require('miniprogram-automator');

async function main() {
  const DEVTOOLS_CLI = 'D:\DevCache\微信web开发者工具\cli.bat';
  
  console.log('Test 1: launcher.launch() with forward slashes...');
  try {
    const mp = await launcher.launch({
      cliPath: DEVTOOLS_CLI,
      projectPath: 'D:/Tare-workspace/Game/WeChat Game/XXL/minigame',
      autoPort: 5555,
      trustProject: true,
    });
    console.log('SUCCESS with forward slashes!');
    const info = await mp.send('Tool.getInfo');
    console.log('DevTools version:', info.version);
    const proj = await mp.send('project.getProjectInfo');
    console.log('Project path:', proj.projectPath);
    await mp.close();
  } catch (e) {
    console.log('Forward slashes error:', e.message);
  }

  console.log('\nTest 2: launcher.launch() with 8.3 short path...');
  try {
    const mp = await launcher.launch({
      cliPath: DEVTOOLS_CLI,
      projectPath: 'D:\TARE-WOR~1\GAME\WECHAT~1\XXL\minigame',
      autoPort: 5556,
      trustProject: true,
    });
    console.log('SUCCESS with 8.3 path!');
    const info = await mp.send('Tool.getInfo');
    console.log('DevTools version:', info.version);
    await mp.close();
  } catch (e) {
    console.log('8.3 path error:', e.message);
  }
}

main();
