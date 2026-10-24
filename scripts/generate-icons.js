import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, colorR = 220, colorG = 38, colorB = 38) {
  // Create raw RGBA bitmap
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const buffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Check if pixel is within medical cross (center)
      const cx = width / 2;
      const cy = height / 2;
      const armW = width * 0.2;
      const armL = width * 0.6;

      const inVerticalArm = Math.abs(x - cx) <= armW / 2 && Math.abs(y - cy) <= armL / 2;
      const inHorizontalArm = Math.abs(y - cy) <= armW / 2 && Math.abs(x - cx) <= armL / 2;
      const isCross = inVerticalArm || inHorizontalArm;

      if (isCross) {
        // White medical cross
        buffer[pixelOffset] = 255;
        buffer[pixelOffset + 1] = 255;
        buffer[pixelOffset + 2] = 255;
        buffer[pixelOffset + 3] = 255;
      } else {
        // Red background
        buffer[pixelOffset] = colorR;
        buffer[pixelOffset + 1] = colorG;
        buffer[pixelOffset + 2] = colorB;
        buffer[pixelOffset + 3] = 255;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk (compressed image data)
  const compressed = zlib.deflateSync(buffer, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcVal = crc32(crcInput);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcVal, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 185, 28, 28));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64));

console.log('Successfully generated all PWA PNG icons!');
