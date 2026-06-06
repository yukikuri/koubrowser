const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'scripts', 'debug-data.ts');
const targetPath = path.join(projectRoot, 'src', 'main', 'debug-data.ts');

function copyIfMissing(fromPath, toPath) {
  if (fs.existsSync(toPath)) {
    return;
  }
  fs.copyFileSync(fromPath, toPath);
}

copyIfMissing(sourcePath, targetPath);
