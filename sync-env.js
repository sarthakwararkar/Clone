const fs = require('fs');
const path = require('path');

const rootEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'coupondunia-backend', '.env');
const backendDevVarsPath = path.join(__dirname, 'coupondunia-backend', '.dev.vars');
const frontendEnvPath = path.join(__dirname, 'coupondunia-frontend', '.env.local');

// 1. Initialize root .env if it doesn't exist
if (!fs.existsSync(rootEnvPath)) {
  console.log('No root .env file found. Creating one from examples...');
  let mergedEnvContent = '# =========================================================================\n';
  mergedEnvContent += '# CouponDunia Shared Environment Variables\n';
  mergedEnvContent += '# Edit this file; changes will sync to frontend/backend on running dev tasks\n';
  mergedEnvContent += '# =========================================================================\n\n';

  const backendExamplePath = path.join(__dirname, 'coupondunia-backend', '.env.example');
  if (fs.existsSync(backendExamplePath)) {
    mergedEnvContent += '# ─── Backend Variables ───────────────────────────────────────────────────\n';
    mergedEnvContent += fs.readFileSync(backendExamplePath, 'utf8') + '\n';
  }

  const frontendExamplePath = path.join(__dirname, 'coupondunia-frontend', '.env.local.example');
  if (fs.existsSync(frontendExamplePath)) {
    mergedEnvContent += '# ─── Frontend Variables ──────────────────────────────────────────────────\n';
    // Remove any overlapping comments or lines to keep it clean
    const frontendLines = fs.readFileSync(frontendExamplePath, 'utf8').split('\n');
    const filteredFrontendLines = frontendLines.filter(line => {
      // Avoid duplicate keys if they already exist in backend example
      if (line.includes('=')) {
        const key = line.split('=')[0].trim();
        if (mergedEnvContent.includes(`${key}=`)) {
          return false;
        }
      }
      return true;
    });
    mergedEnvContent += filteredFrontendLines.join('\n') + '\n';
  }

  fs.writeFileSync(rootEnvPath, mergedEnvContent);
  console.log('✓ Created .env at workspace root. Please fill it with your credentials.');
} else {
  // 2. Sync root .env to targets
  console.log('Syncing root .env to subprojects...');
  const envContent = fs.readFileSync(rootEnvPath, 'utf8');

  // Write to backend
  fs.writeFileSync(backendEnvPath, envContent);
  fs.writeFileSync(backendDevVarsPath, envContent);
  console.log('✓ Synced to coupondunia-backend/.env and .dev.vars');

  // Write to frontend
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log('✓ Synced to coupondunia-frontend/.env.local');
}
