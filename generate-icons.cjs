// Generador de iconos PNG para PWA - sin dependencias externas
// Crea iconos PNG validos con fondo verde #1ED760 y nota musical

const fs = require('fs');
const path = require('path');

function createPNG(width, height, filename) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw image data with zlib compression
  const rawData = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;
  const innerRadius = radius * 0.35;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte: none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Circle shape
      if (dist <= radius) {
        // Inner circle (dark center of vinyl/disc)
        if (dist <= innerRadius) {
          // Note symbol - white on dark
          const noteX = (x - cx) / innerRadius;
          const noteY = (y - cy) / innerRadius;

          // Simple music note shape (filled circle at bottom, stem going up)
          const noteHead = Math.sqrt((noteX + 0.1) * (noteX + 0.1) + (noteY + 0.15) * (noteY + 0.15));
          const inStem = noteX > 0.0 && noteX < 0.25 && noteY > -0.6 && noteY < 0.15;

          if (noteHead < 0.25 || inStem) {
            rawData.push(255, 255, 255); // white
          } else {
            // Dark inner circle
            const shade = 20 + Math.floor(dist / radius * 15);
            rawData.push(shade, shade, shade);
          }
        } else {
          // Disc gradient - green to darker
          const t = (dist - innerRadius) / (radius - innerRadius);
          const r = Math.floor(30 + t * 10);
          const g = Math.floor(215 - t * 40);
          const b = Math.floor(96 - t * 20);
          rawData.push(r, g, b);
        }
      } else {
        // Transparent → dark background
        rawData.push(10, 10, 10); // #0a0a0a
      }
    }
  }

  const rawBuffer = Buffer.from(rawData);

  // Compress with deflate (use zlib)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawBuffer);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  // Assemble PNG
  const png = Buffer.concat([signature, ihdr, idat, iend]);
  fs.writeFileSync(path.join(__dirname, 'public', filename), png);
  console.log(`Created: public/${filename} (${png.length} bytes)`);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generar todos los iconos
createPNG(192, 192, 'icon-192.png');
createPNG(512, 512, 'icon-512.png');
createPNG(180, 180, 'apple-icon-180.png');
createPNG(32, 32, 'icon-32.png');
createPNG(1284, 2778, 'splash.png'); // iPhone X splash dimensions
console.log('All icons generated!');
