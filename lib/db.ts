import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

// The only place Prisma Client is created. Server-only: it must never be imported by client code.
// Prisma connects with a role that bypasses Row Level Security, so every access rule
// is enforced in server code (see docs/DATA_MODEL_AND_AUTHORIZATION.md).
const globalForDb = globalThis as unknown as { eludaDb?: PrismaClient };

export function getDb(): PrismaClient {
  if (globalForDb.eludaDb) {
    return globalForDb.eludaDb;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  globalForDb.eludaDb = client;
  return client;
}
