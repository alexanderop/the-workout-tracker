import { readdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const directory = new URL("../src/features/workouts/ui/assets/exercises/", import.meta.url);
const sources = (await readdir(directory)).filter((name) => name.endsWith(".png")).sort();

if (sources.length === 0) {
  throw new Error(`No exercise PNGs found in ${directory.pathname}`);
}

let sourceBytes = 0;
let thumbnailBytes = 0;

for (const name of sources) {
  try {
    const source = await readFile(new URL(name, directory));
    const thumbnail = await sharp(source)
      .resize(192, 192, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();
    await writeFile(new URL(name.replace(/\.png$/, ".webp"), directory), thumbnail);
    sourceBytes += source.byteLength;
    thumbnailBytes += thumbnail.byteLength;
  } catch (cause) {
    throw new Error(`Could not convert ${name}. Earlier thumbnails may already be updated.`, { cause });
  }
}

console.log(`Converted ${sources.length} exercise images.`);
console.log(`Source PNGs: ${sourceBytes} bytes. WebP thumbnails: ${thumbnailBytes} bytes.`);
