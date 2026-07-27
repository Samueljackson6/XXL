const automator = require('miniprogram-automator');

const PORT = 3800;

(async () => {
  try {
    const mp = await automator.connect({ wsEndpoint: `ws://127.0.0.1:${PORT}` });
    console.log('[OK] Connected');

    // Expose a function that the game can call
    await mp.exposeFunction('__reportGameReady', (info) => {
      console.log('[GAME READY]', JSON.stringify(info));
    });

    // Also listen for console
    let consoleLogs = [];
    mp.on('console', (log) => {
      consoleLogs.push(log);
      console.log('[CONSOLE]', JSON.stringify(log));
    });
    mp.on('exception', (err) => {
      console.log('[EXCEPTION]', JSON.stringify(err));
    });
    mp.on('disconnect', () => {
      console.log('[DISCONNECT]');
    });

    console.log('[INFO] Waiting 25s...');
    await new Promise(r => setTimeout(r, 25000));

    console.log(`[SUMMARY] Console logs: ${consoleLogs.length}`);
    const gameLogs = consoleLogs.filter(l => l.data && typeof l.data === 'string' && l.data.includes('[GAME]'));
    console.log(`[GAME LOGS]: ${gameLogs.length}`);
    gameLogs.forEach(l => console.log('  ', l.data));

    mp.close();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  }
})();
