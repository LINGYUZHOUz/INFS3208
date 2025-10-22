// Worker thread for CPU-intensive calculations.
// Accepts { seconds, algo, intensity } as workerData.
// Runs a computation loop for the given duration, performing either PBKDF2 hashing or math operations.

const { parentPort, workerData } = require('worker_threads');
const crypto = require('crypto');

const { seconds, algo, intensity } = workerData;

function doPBKDF2(iter) {
  for (let i = 0; i < iter; i++) {
    crypto.pbkdf2Sync('secret', 'salt', 1000, 64, 'sha512');
  }
}

function doMath(loop) {
  for (let i = 0; i < loop; i++) {
    Math.sqrt(Math.random() * 1e6);
    Math.sin(Math.random() * Math.PI);
  }
}

(async () => {
  try {
    const t0 = Date.now();
    const deadline = t0 + seconds * 1000;
    let rounds = 0;

    while (Date.now() < deadline) {
      if (algo === 'math') {
        doMath(intensity * 1000);
      } else {
        doPBKDF2(intensity);
      }
      rounds++;
    }

    parentPort.postMessage({
      ok: true,
      algo,
      seconds,
      intensity,
      rounds,
      duration_ms: Date.now() - t0
    });
  } catch (e) {
    parentPort.postMessage({ ok: false, error: e.message });
  }
})();
