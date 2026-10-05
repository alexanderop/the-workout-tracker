import { spawn } from "node:child_process";

const mode = process.argv[2];
if (mode !== "build" && mode !== "serve")
  throw new Error("Expected build or serve");
const args =
  mode === "build"
    ? ["build"]
    : [
        "exec",
        "vite",
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        "4198",
        "--strictPort",
      ];
const child = spawn("pnpm", ["--filter", "@form/workout", ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_BASE_PATH: process.env.VITE_BASE_PATH || "/the-workout-tracker/",
  },
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
