#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const outDir = 'dist';

// Copy manifest.json
fs.copyFileSync('manifest.json', path.join(outDir, 'manifest.json'));
console.log('Copied manifest.json');

// Copy icons
const iconsDir = path.join(outDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sourceIcons = 'public/icons';
if (fs.existsSync(sourceIcons)) {
  fs.readdirSync(sourceIcons).forEach(file => {
    fs.copyFileSync(
      path.join(sourceIcons, file),
      path.join(iconsDir, file)
    );
  });
  console.log('Copied icons');
}

console.log('Assets copied successfully!');
