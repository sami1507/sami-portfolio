import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import path from "node:path";

const publicKeys = ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_RESUME_URL"];
const productionFiles = [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
];

// Browser assertions must use the same public settings as the production export.
// Keep server, browser-tool and secret settings exclusively in the caller's environment.
export function loadPublicTestEnv(
  directory = process.cwd(),
  environment = process.env,
) {
  for (const file of productionFiles) {
    let parsed;
    try {
      parsed = parseEnv(readFileSync(path.join(directory, file), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    for (const key of publicKeys) {
      if (environment[key] === undefined && parsed[key] !== undefined)
        environment[key] = parsed[key];
    }
  }
}
