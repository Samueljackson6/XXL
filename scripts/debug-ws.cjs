const WebSocket = require('ws');
const { execSync } = require('child_process');

const PORT = 59902;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Wait for project to fully load
  console.log('Waiting for project to load...');
  await sleep(10000);

  console.log('Connecting WebSocket to ws://127.0.0.1:' + PORT + ' ...');

  return new Promise((resolve) => {
    const ws = new WebSocket('ws://127.0.0.1:' + PORT);

    ws.on('open', () => {
      console.log('WebSocket OPENED!');
      ws.close();
      resolve('connected');
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      resolve('failed');
    });

    ws.on('message', (data) => {
      console.log('Message received:', data.toString().substring(0, 500));
    });

    setTimeout(() => {
      console.log('Timeout - closing');
      ws.close();
      resolve('timeout');
    }, 5000);
  });
}

main().then(result => {
  console.log('Result:', result);
  process.exit(result === 'connected' ? 0 : 1);
});
