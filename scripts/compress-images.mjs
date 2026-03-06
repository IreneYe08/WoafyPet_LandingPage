/**
 * Compress oversized PNG assets in src/assets/ using sharp.
 * Targets files >500 KB. Overwrites in-place.
 * Run: node scripts/compress-images.mjs
 */
import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ASSETS_DIR = new URL('../src/assets', import.meta.url).pathname;
const MIN_BYTES  = 500 * 1024; // only touch files >500 KB
const PNG_QUALITY = 80;         // pngquant-style quality (sharp uses zlib level)
const MAX_WIDTH  = 2400;        // no image displayed wider than this on web

const files = readdirSync(ASSETS_DIR).filter(
  f => extname(f).toLowerCase() === '.png'
);

let totalSavedBytes = 0;

for (const file of files) {
  const fullPath = join(ASSETS_DIR, file);
  const originalSize = statSync(fullPath).size;
  if (originalSize < MIN_BYTES) continue;

  try {
    const image = sharp(fullPath);
    const meta  = await image.metadata();

    const pipeline = image.clone();

    // Down-scale if wider than MAX_WIDTH (preserves aspect ratio)
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // PNG with effort=9 (maximum compression) + adaptiveFiltering
    const buffer = await pipeline
      .png({ effort: 9, adaptiveFiltering: true, compressionLevel: 9 })
      .toBuffer();

    const savedBytes = originalSize - buffer.length;
    if (savedBytes > 0) {
      // Only write back if we actually made it smaller
      const { writeFileSync } = await import('fs');
      writeFileSync(fullPath, buffer);
      totalSavedBytes += savedBytes;
      console.log(
        `✅  ${file}  ${(originalSize / 1024 / 1024).toFixed(1)} MB → ${(buffer.length / 1024 / 1024).toFixed(1)} MB  (-${(savedBytes / 1024).toFixed(0)} KB)`
      );
    } else {
      console.log(`⏭  ${file}  already optimal`);
    }
  } catch (err) {
    console.error(`❌  ${file}  ${err.message}`);
  }
}

console.log(`\nTotal saved: ${(totalSavedBytes / 1024 / 1024).toFixed(1)} MB`);
