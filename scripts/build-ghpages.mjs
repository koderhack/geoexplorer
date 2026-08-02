import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import path from "node:path";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const apiDir = path.join(root, "src", "app", "api");
const apiHiddenDir = path.join(root, "node_modules", ".api-stashed");

const hide = existsSync(apiDir);
if (hide) {
  renameSync(apiDir, apiHiddenDir);
  process.stdout.write("→ src/app/api stashed for static export\n");
}

try {
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, DEPLOY_TARGET: "ghpages" },
  });
} finally {
  if (hide) {
    renameSync(apiHiddenDir, apiDir);
    process.stdout.write("→ src/app/api restored\n");
  }
}