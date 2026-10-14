import { spawnSync } from "node:child_process";
import path from "node:path";

const result = spawnSync(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "build"], {
  stdio: "inherit",
  env: { ...process.env, CATCH_STATIC_EXPORT: "1" },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
