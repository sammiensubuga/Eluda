-- CreateTable
CREATE TABLE "rate_limit_counters" (
    "key" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rate_limit_counters_pkey" PRIMARY KEY ("key","window_start")
);

ALTER TABLE "rate_limit_counters" ADD CONSTRAINT "rate_limit_counters_count_check" CHECK ("count" >= 0);

ALTER TABLE "rate_limit_counters" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "rate_limit_counters" FROM PUBLIC;
REVOKE ALL ON TABLE "rate_limit_counters" FROM anon, authenticated;
