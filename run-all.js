const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CouponDunia backend and frontend dev servers...');

function runProcess(dir, command, args) {
  // Use shell: true to support npm execution on Windows / PowerShell
  const child = spawn(command, args, {
    cwd: path.join(__dirname, dir),
    shell: true,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(`❌ Failed to start process in ${dir}:`, err);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`ℹ️ Process in ${dir} exited with code ${code}`);
    }
  });

  return child;
}

const backend = runProcess('coupondunia-backend', 'npm', ['run', 'dev']);
const frontend = runProcess('coupondunia-frontend', 'npm', ['run', 'dev']);

// Ensure child processes are cleaned up when the main process is terminated
const cleanup = () => {
  console.log('\nStopping dev servers...');
  if (backend && !backend.killed) {
    backend.kill();
  }
  if (frontend && !frontend.killed) {
    frontend.kill();
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
