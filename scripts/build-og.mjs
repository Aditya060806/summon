// Regenerate site/og-image.png from site/og-image.svg.
//
// Social platforms (LinkedIn, Facebook, Twitter/X) don't render SVG OG images,
// so we ship a rasterized PNG. Edit og-image.svg, then run:
//
//   npm install --no-save sharp
//   node scripts/build-og.mjs
//
import sharp from 'sharp';

const input = 'site/og-image.svg';
const output = 'site/og-image.png';

const info = await sharp(input, {density: 144})
	.resize(1200, 630, {fit: 'fill'})
	.png()
	.toFile(output);

console.log(`Wrote ${output} (${info.width}x${info.height}, ${info.size} bytes)`);
