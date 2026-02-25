import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#2383E2"/>
  <rect x="96" y="64" width="320" height="384" rx="24" fill="#fff"/>
  <path d="M288 64v80h80" fill="#E8F3FD" stroke="#2383E2" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="144" y1="224" x2="304" y2="224" stroke="#2383E2" stroke-width="24" stroke-linecap="round"/>
  <line x1="144" y1="304" x2="368" y2="304" stroke="#2383E2" stroke-width="24" stroke-linecap="round"/>
  <line x1="144" y1="384" x2="272" y2="384" stroke="#2383E2" stroke-width="24" stroke-linecap="round"/>
</svg>`;

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `pwa-${size}x${size}.png`));

    console.log(`Generated pwa-${size}x${size}.png`);
  }

  // Also generate apple-touch-icon
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));

  console.log('Generated apple-touch-icon.png');
}

generateIcons().catch(console.error);
