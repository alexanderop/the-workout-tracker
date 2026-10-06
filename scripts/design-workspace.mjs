import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const catalog = new URL(
  "../apps/workout/src/preview/catalog.json",
  import.meta.url,
);
const mirror = new URL(
  "../apps/design-system/src/preview-catalog.json",
  import.meta.url,
);
const mode = process.argv[2];
if (mode !== "dev" && mode !== "build") throw new Error("Use dev or build.");

async function syncCatalog() {
  const source = await readFile(catalog, "utf8");
  JSON.parse(source);
  const previous = await readFile(mirror, "utf8").catch(() => "");
  if (source !== previous) await writeFile(mirror, source);
}

function launch(args) {
  return spawn("pnpm", args, {
    cwd: root,
    stdio: "inherit",
    detached: process.platform !== "win32",
  });
}

function stop(child, signal = "SIGTERM") {
  if (child.exitCode !== null || !child.pid) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

async function run(args) {
  const child = launch(args);
  const onSignal = () => stop(child);
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(`Design workspace command failed (${signal ?? code}).`),
          );
      });
    });
  } finally {
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
  }
}

async function build() {
  await run([
    "--filter",
    "@form/workout",
    "exec",
    "vite",
    "build",
    "--mode",
    "design-preview",
  ]);
  const destination = new URL(
    "../apps/design-system/public/product-preview/",
    import.meta.url,
  );
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(
    new URL("../apps/workout/dist-preview/", import.meta.url),
    destination,
    { recursive: true },
  );
  await run(["--filter", "@form/design-system", "build"]);
}

function dev() {
  const children = [
    launch([
      "--filter",
      "@form/workout",
      "exec",
      "vite",
      "--mode",
      "design-preview",
      "--host",
      "127.0.0.1",
      "--port",
      "4187",
      "--strictPort",
    ]),
    launch(["--filter", "@form/design-system", "dev"]),
  ];
  const watcher = watch(catalog, () => {
    syncCatalog().catch((error) => {
      console.error(error);
      shutdown(1);
    });
  });
  let stopped = false;
  function shutdown(code) {
    if (stopped) return;
    stopped = true;
    watcher.close();
    for (const child of children) stop(child);
    process.exitCode = code;
  }
  process.once("SIGINT", () => shutdown(0));
  process.once("SIGTERM", () => shutdown(0));
  for (const child of children) {
    child.once("error", (error) => {
      console.error(error);
      shutdown(1);
    });
    child.once("exit", (code) => shutdown(code ?? 1));
  }
}

await syncCatalog();
if (mode === "build") await build();
else dev();
