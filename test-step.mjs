import minimp from 'miniprogram-automator';

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout after ' + ms + 'ms')), ms))
  ]);
}

async function main() {
  console.log('Connecting...');
  const ws = await minimp.connect({
    wsEndpoint: 'ws://127.0.0.1:5000',
  });
  console.log('Connected!');
  
  try {
    console.log('Trying currentPage...');
    const page = await withTimeout(ws.currentPage(), 10000);
    console.log('currentPage result:', typeof page);
  } catch(e) {
    console.log('currentPage failed:', e.message);
  }
  
  try {
    console.log('Trying IDE.getState...');
    const state = await withTimeout(ws.IDE.getState(), 10000);
    console.log('getState result:', JSON.stringify(state).substring(0, 200));
  } catch(e) {
    console.log('getState failed:', e.message);
  }
  
  try {
    console.log('Trying IDE.getProjectPath...');
    const path = await withTimeout(ws.IDE.getProjectPath(), 10000);
    console.log('getProjectPath result:', JSON.stringify(path).substring(0, 200));
  } catch(e) {
    console.log('getProjectPath failed:', e.message);
  }
  
  try {
    console.log('Trying IDE.getAllLogs...');
    const logs = await withTimeout(ws.IDE.getAllLogs(), 10000);
    console.log('getAllLogs result:', Array.isArray(logs) ? `Array of ${logs.length} items` : typeof logs);
    if (Array.isArray(logs) && logs.length > 0) {
      console.log('First log:', JSON.stringify(logs[0]).substring(0, 500));
    }
  } catch(e) {
    console.log('getAllLogs failed:', e.message);
  }
  
  console.log('Done!');
  ws.close().catch(() => {});
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
