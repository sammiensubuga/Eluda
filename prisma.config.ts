import "dotenv/config";
import { defineConfig } from "prisma/config";

// DIRECT_URL is only needed by Prisma CLI commands that touch a database.
// The empty fallback keeps `prisma generate` working in CI and on Vercel, where it is not set.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DIRECT_URL ?? "" },
});
