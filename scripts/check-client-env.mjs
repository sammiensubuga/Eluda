// Fails the build if a "use client" file references an environment variable that is not public.
// Prints variable NAMES only, never values.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", ".next", ".git", "coverage"]);
const ALLOWED_ENV_NAMES = new Set(["NODE_ENV"]);
const SCAN_ROOTS = ["app", "components", "src", "lib"];

const USE_CLIENT = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/;
const ENV_ACCESS = /process\.env(?:\.([A-Za-z_][A-Za-z0-9_]*)|\[\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\])?/g;

export function findServerEnvInClientSource(source, fileName = "<source>") {
  if (!USE_CLIENT.test(source)) {
    return [];
  }
  const violations = [];
  for (const match of source.matchAll(ENV_ACCESS)) {
    const name = match[1] ?? match[2];
    const allowed =
      name !== undefined && (name.startsWith("NEXT_PUBLIC_") || ALLOWED_ENV_NAMES.has(name));
    if (allowed) {
      continue;
    }
    const line = source.slice(0, match.index).split("\n").length;
    const what = name === undefined ? "process.env used as a whole object" : `process.env.${name}`;
    violations.push(`${fileName}:${line}: ${what}`);
  }
  return violations;
}

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(entry)) {
      continue;
    }
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      yield* walk(fullPath);
    } else if (SOURCE_EXTENSIONS.has(extname(entry))) {
      yield fullPath;
    }
  }
}

export function scanDirectories(roots = SCAN_ROOTS) {
  const violations = [];
  for (const root of roots) {
    if (!existsSync(root)) {
      continue;
    }
    for (const file of walk(root)) {
      const source = readFileSync(file, "utf8");
      violations.push(...findServerEnvInClientSource(source, file.replaceAll("\\", "/")));
    }
  }
  return violations;
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const violations = scanDirectories();
  if (violations.length > 0) {
    console.error("Server-only environment variable names found in client components:");
    for (const violation of violations) {
      console.error(`  ${violation}`);
    }
    process.exit(1);
  }
  console.log("check-client-env: no server-only env var names found in client components.");
}
