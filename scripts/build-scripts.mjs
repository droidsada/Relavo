#!/usr/bin/env node
import * as esbuild from 'esbuild';

// Build service worker
await esbuild.build({
  entryPoints: ['src/background/service-worker.ts'],
  bundle: true,
  outfile: 'dist/service-worker.js',
  format: 'esm',
  target: 'chrome100',
  minify: true,
});

console.log('Built service-worker.js');

// Build content script
await esbuild.build({
  entryPoints: ['src/content/content-script.ts'],
  bundle: true,
  outfile: 'dist/content-script.js',
  format: 'iife',
  target: 'chrome100',
  minify: true,
});

console.log('Built content-script.js');
