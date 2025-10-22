// ！Part of the cide were generated with the assistance of ChatGPT.
const { Router } = require('express');
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

const router = Router();

// POST /api/cpu-intensive
// Spawns a worker thread to execute CPU-intensive calculations.
// Accepts JSON body with { seconds?: number, algo?: 'pbkdf2'|'math', intensity?: number }.
// Default duration is 3 seconds, maximum 10 seconds.
router.post('/cpu-intensive', async (req, res) => {
  const seconds = Math.max(1, Math.min(10, parseInt(req.body?.seconds ?? 3, 10)));
  const algo = (req.body?.algo || 'pbkdf2').toLowerCase();
  const intensity = Math.max(1, Math.min(2000, parseInt(req.body?.intensity ?? 500, 10)));
  const startedAt = Date.now();

  try {
    const worker = new Worker(path.join(__dirname, '../workers/cpuWorker.js'), {
      workerData: { seconds, algo, intensity }
    });

    worker.once('message', (msg) => {
      if (!msg.ok) return res.status(500).json({ error: msg.error });
      res.json({
        message: 'CPU intensive task completed',
        ...msg,
        wall_clock_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      });
    });

    worker.once('error', (err) => res.status(500).json({ error: err.message }));
    worker.once('exit', (code) => {
      if (code !== 0) console.error('cpu worker exited with code', code);
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/cpu-usage
// Estimates the CPU usage of the current Node.js process over a short sampling window.
// Default sampling window is 300ms; can be adjusted with ?window=<ms>.
router.get('/cpu-usage', async (req, res) => {
  const windowMs = Math.max(100, Math.min(2000, parseInt(req.query.window ?? '300', 10)));

  const startUsage = process.cpuUsage();
  const startHr = process.hrtime.bigint();
  await new Promise(r => setTimeout(r, windowMs));
  const endUsage = process.cpuUsage(startUsage);
  const endHr = process.hrtime.bigint();

  const userUs = endUsage.user;
  const systemUs = endUsage.system;
  const elapsedNs = Number(endHr - startHr);
  const elapsedMs = elapsedNs / 1e6;
  const cores = os.cpus().length || 1;

  const cpuPercent = Math.min(
    100,
    ((userUs + systemUs) / 1000) / (elapsedMs * cores) * 100
  );

  res.json({
    window_ms: windowMs,
    cpu_percent_process: Number(cpuPercent.toFixed(1)),
    cores,
    note: 'Process CPU% sampled over window; not system load average.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
