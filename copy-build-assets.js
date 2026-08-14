const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  try {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Successfully copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err.message);
    process.exit(1);
  }
}

// Ensure standalone directories exist
const standaloneNextDir = path.join(__dirname, '.next', 'standalone', '.next');
fs.mkdirSync(standaloneNextDir, { recursive: true });

// Copy static folder
const staticSrc = path.join(__dirname, '.next', 'static');
const staticDest = path.join(standaloneNextDir, 'static');
copyRecursiveSync(staticSrc, staticDest);

// Copy public folder
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(__dirname, '.next', 'standalone', 'public');
copyRecursiveSync(publicSrc, publicDest);
