const { launcher } = require('miniprogram-automator');
const { execSync } = require('child_process');

async function main() {
  const netstat = execSync('netstat -ano', { encoding: 'utf-8' });
  const lines = netstat.split('\n').filter(l => l.includes('LISTENING'));
  const wmicOut = execSync('wmic process where "name=\'wechatdevtools.exe\'" get ProcessId', { encoding: 'utf-8' });
  const pids = new Set();
  wmicOut.split('\n').forEach(l => { const m = l.trim().match(/^\d+$/); if (m) pids.add(m[0]); });
  console.log('DevTools PIDs:', [...pids].join(','));
  
  for (const line of lines) {
    const match = line.match(/:(\d+)\s+\S+:(\d+)\s+LISTENING\s+(\d+)/);
    if (match && pids.has(match[3])) {
      console.log(`Port ${match[1]} owned by PID ${match[3]}`);
    }
  }
  
  // Try all listening ports
  const allPorts = new Set();
  for (const line of lines) {
    const match = line.match(/:(\d+)\s+\S+:(\d+)\s+LISTENING\s+(\d+)/);
    if (match) allPorts.add(parseInt(match[1]));
  }
  
  for (const port of allPorts) {
    try {
      const mp = await launcher.connect({ wsEndpoint: `ws://127.0.0.1:${port}` });
      console.log(`\nCONNECTED on port ${port}!`);
      const info = await mp.send('Tool.getInfo');
      console.log('DevTools version:', info.version);
      await mp.close();
      process.exit(0);
    } catch (e) {
      // Not this port
    }
  }
  console.log('\nCould not connect to any port');
}

main().catch(e => console.log('Error:', e.message));
