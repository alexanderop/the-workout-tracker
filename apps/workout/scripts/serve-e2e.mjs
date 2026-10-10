// Serves two production builds of the workout app so the update journey can
// ship a real new service worker. POST /__test/version?value=1|2 selects which
// build the server answers with. The control exists only in this test server;
// it is never part of the application build.
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const port = Number(process.env.E2E_UPDATE_PORT ?? 4199);
const versions = ["1", "2"];
const builds = new Map();
for (const version of versions) {
  const directory = resolve(".test-builds", `e2e-${version}`);
  const build = spawnSync(
    "pnpm",
    ["exec", "vite", "build", "--outDir", directory, "--emptyOutDir"],
    {
      stdio: "inherit",
      env: { ...process.env, VITE_BASE_PATH: "/", VITE_APP_VERSION: version },
    },
  );
  if (build.status !== 0) process.exit(build.status ?? 1);
  builds.set(version, directory);
}

let active = "1";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
};

function send(response, status, body = "") {
  response.writeHead(status, { "Cache-Control": "no-store" });
  response.end(body);
}

function handleTestRoute(request, url, response) {
  if (url.pathname !== "/__test/version") return false;
  if (request.method !== "POST") {
    send(response, 405);
    return true;
  }
  const version = url.searchParams.get("value");
  if (!builds.has(version)) {
    send(response, 400);
    return true;
  }
  active = version;
  send(response, 200, active);
  return true;
}

function resolveFile(pathname) {
  const directory = builds.get(active);
  let file;
  try {
    file = resolve(directory, "." + decodeURIComponent(pathname));
  } catch {
    return { status: 400 };
  }
  if (file !== directory && !file.startsWith(directory + sep))
    return { status: 403 };
  const isDirectory = statSync(file, { throwIfNoEntry: false })?.isDirectory();
  if (!extname(file) || isDirectory) file = resolve(directory, "index.html");
  if (!existsSync(file)) return { status: 404 };
  return { file };
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (handleTestRoute(request, url, response)) return;
  if (request.method !== "GET") return send(response, 405);
  const { file, status } = resolveFile(url.pathname);
  if (!file) return send(response, status);
  response.writeHead(200, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  response.end(readFileSync(file));
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Two-version production PWA server ready on port ${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
