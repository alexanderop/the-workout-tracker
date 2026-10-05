import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, process.env.PERFORMANCE_DIST || "dist");
const budgets = JSON.parse(
  await readFile(
    new URL("../performance-budgets.json", import.meta.url),
    "utf8",
  ),
);
const failures = [];
function limit(label, value, maximum) {
  console.log(`${label}: ${value} / ${maximum}`);
  if (value > maximum) failures.push(`${label}: ${value} exceeds ${maximum}`);
}
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? filesIn(path) : [path];
    }),
  );
  return groups.flat();
}
const files = await filesIn(dist);
if (!files.includes(resolve(dist, "sw.js")))
  throw new Error("Production service worker is missing");
let buildBytes = 0;
let javascriptGzipBytes = 0;
let inlineImageBytes = 0;
for (const file of files) {
  buildBytes += (await stat(file)).size;
  if (extname(file) === ".js") {
    const content = await readFile(file);
    javascriptGzipBytes += gzipSync(content).length;
    for (const match of content
      .toString()
      .matchAll(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g)) {
      inlineImageBytes += Buffer.byteLength(match[0]);
    }
  }
  if (
    file.startsWith(resolve(dist, "assets") + "/") &&
    /\.(png|jpe?g)$/i.test(file)
  ) {
    failures.push(`Unoptimized raster emitted in assets: ${file}`);
  }
}
const artworkPath = resolve(
  root,
  "src/features/workouts/ui/exerciseArtwork.ts",
);
const artwork = await readFile(artworkPath, "utf8");
const imports = [
  ...artwork.matchAll(/from\s+["'](\.\/assets\/exercises\/[^"']+)["']/g),
].map((match) => match[1]);
if (!imports.length)
  throw new Error("No exercise artwork imports found; audit would be empty");
let exerciseImageBytes = 0;
for (const source of imports) {
  if (!source.endsWith(".webp"))
    failures.push(`Exercise artwork must use WebP: ${source}`);
  const path = resolve(root, "src/features/workouts/ui", source);
  const bytes = (await stat(path)).size;
  exerciseImageBytes += bytes;
  if (bytes > budgets.singleExerciseImageBytes)
    failures.push(`${source}: ${bytes} bytes exceeds per-image budget`);
  const metadata = await sharp(path).metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    Math.max(metadata.width, metadata.height) > budgets.exerciseImageDimension
  ) {
    failures.push(`${source}: invalid or oversized dimensions`);
  }
}
limit("Production build bytes (uncompressed)", buildBytes, budgets.buildBytes);
limit(
  "JavaScript bytes (gzip, including service worker)",
  javascriptGzipBytes,
  budgets.javascriptGzipBytes,
);
limit(
  `${imports.length} exercise images (bytes)`,
  exerciseImageBytes,
  budgets.exerciseImageBytes,
);
limit(
  "Inline image data URL bytes",
  inlineImageBytes,
  budgets.inlineImageBytes,
);
if (failures.length)
  throw new Error(`Performance budgets failed:\n${failures.join("\n")}`);
