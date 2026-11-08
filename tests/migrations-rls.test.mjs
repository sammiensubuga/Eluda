import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = "prisma/migrations";

function migrationFiles() {
  if (!existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(MIGRATIONS_DIR, entry.name, "migration.sql"))
    .filter((file) => existsSync(file));
}

function createdTables(sql) {
  return [...sql.matchAll(/CREATE TABLE\s+"?([A-Za-z0-9_]+)"?/gi)].map((match) => match[1]);
}

describe("migrations keep Row Level Security on for every table they create", () => {
  const files = migrationFiles();

  it("finds at least one migration", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const sql = readFileSync(file, "utf8");
    for (const table of createdTables(sql)) {
      it(`${file}: ${table} enables RLS and revokes anon and authenticated access`, () => {
        const enable = new RegExp(`ALTER TABLE\\s+"?${table}"?\\s+ENABLE ROW LEVEL SECURITY`, "i");
        const revoke = new RegExp(
          `REVOKE ALL ON TABLE\\s+"?${table}"?\\s+FROM\\s+anon,\\s*authenticated`,
          "i",
        );
        expect(sql).toMatch(enable);
        expect(sql).toMatch(revoke);
      });
    }
  }
});
