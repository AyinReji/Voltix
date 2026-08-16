const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[build-vercel] Step 1: Building Storefront app...');
execSync('npx pnpm --filter @workspace/voltix-storefront build', { stdio: 'inherit' });

const srcDir = path.resolve(__dirname, '../artifacts/voltix-storefront/dist/public');
const fallbackSrcDir = path.resolve(__dirname, '../artifacts/voltix-storefront/dist');

let actualSrc = fs.existsSync(srcDir) ? srcDir : fallbackSrcDir;

console.log(`[build-vercel] Step 2: Copying build output from ${actualSrc}...`);

const targets = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../artifacts/voltix-storefront/dist'),
  path.resolve(__dirname, '../artifacts/voltix-storefront/dist/public'),
  path.resolve(__dirname, '../artifacts/voltix-storefront/public'),
  path.resolve(__dirname, '../.vercel/output/static')
];

for (const target of targets) {
  if (path.resolve(target) === path.resolve(actualSrc)) continue;
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(actualSrc, target, { recursive: true });
  console.log(`[build-vercel] Synced output to: ${target}`);
}

const vercelConfigPath = path.resolve(__dirname, '../.vercel/output/config.json');
fs.writeFileSync(
  vercelConfigPath,
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  }, null, 2)
);
console.log(`[build-vercel] Wrote Vercel Build Output API config to ${vercelConfigPath}`);
console.log('[build-vercel] Build completed successfully!');
