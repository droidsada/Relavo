#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function createLetterR(size) {
  const pattern = new Array(size * size).fill(false);
  const s = size / 16;

  const setPixel = (x, y) => {
    const px = Math.round(x * s);
    const py = Math.round(y * s);
    if (px >= 0 && px < size && py >= 0 && py < size) {
      pattern[py * size + px] = true;
    }
  };

  // Vertical bar
  for (let y = 3; y <= 13; y++) {
    for (let x = 4; x <= 6; x++) setPixel(x, y);
  }
  // Top horizontal
  for (let x = 4; x <= 10; x++) {
    for (let y = 3; y <= 4; y++) setPixel(x, y);
  }
  // Middle horizontal
  for (let x = 4; x <= 10; x++) {
    for (let y = 7; y <= 8; y++) setPixel(x, y);
  }
  // Right curve
  for (let y = 4; y <= 7; y++) {
    for (let x = 10; x <= 12; x++) setPixel(x, y);
  }
  // Diagonal leg
  for (let i = 0; i <= 5; i++) {
    for (let dx = 0; dx <= 2; dx++) setPixel(7 + i + dx, 8 + i);
  }

  return pattern;
}

function createPNG(size) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  const bgColor = [59, 130, 246];   // Blue
  const fgColor = [255, 255, 255];  // White
  const letterR = createLetterR(size);

  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // Filter byte
    for (let x = 0; x < size; x++) {
      const color = letterR[y * size + x] ? fgColor : bgColor;
      rawData.push(color[0], color[1], color[2]);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

[16, 48, 128].forEach(size => {
  const png = createPNG(size);
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('Done!');
