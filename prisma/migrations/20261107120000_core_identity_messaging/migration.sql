-- ELUDA core identity and messaging tables.
-- Prisma's generated CREATE SCHEMA IF NOT EXISTS "public" statement was removed on purpose:
-- the public schema already exists on Supabase, and that statement may need database-level
-- CREATE privilege, which the dedicated prisma role does not have.

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "intent" AS ENUM ('MEETUPS', 'DATING', 'MARRIAGE', 'FRIENDS');

-- CreateEnum
CREATE TYPE "availability" AS ENUM ('AVAILABLE', 'BUSY', 'HIDDEN');

-- CreateEnum
CREATE TYPE "conversation_status" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "message_kind" AS ENUM ('PRESET', 'CUSTOM');

-- CreateEnum
CREATE TYPE "unlock_reason" AS ENUM ('NOT_REQUIRED', 'ACTIVE_PLAN_AT_ARRIVAL', 'PLAN_ACTIVATION');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "gender" "gender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "intent" "intent" NOT NULL,
    "availability" "availability",
    "bio" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "profile_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "storage_path" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_a_id" UUID NOT NULL,
    "user_b_id" UUID NOT NULL,
    "status" "conversation_status" NOT NULL DEFAULT 'OPEN',
    "closed_at" TIMESTAMPTZ(6),
    "last_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "sender_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "kind" "message_kind" NOT NULL,
    "preset_key" TEXT,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_contents" (
    "message_id" UUID NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "message_contents_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "message_unlocks" (
    "message_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" "unlock_reason" NOT NULL,

    CONSTRAINT "message_unlocks_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "icebreaker_daily_counts" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "icebreaker_daily_counts_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_photos_storage_path_key" ON "profile_photos"("storage_path");

-- CreateIndex
CREATE INDEX "profile_photos_user_id_idx" ON "profile_photos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_photos_user_id_position_key" ON "profile_photos"("user_id", "position");

-- CreateIndex
CREATE INDEX "conversations_user_b_id_idx" ON "conversations"("user_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_user_a_id_user_b_id_key" ON "conversations"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "messages_recipient_id_sent_at_idx" ON "messages"("recipient_id", "sent_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_conversation_id_seq_key" ON "messages"("conversation_id", "seq");

-- CreateIndex
CREATE INDEX "message_unlocks_recipient_id_unlocked_at_idx" ON "message_unlocks"("recipient_id", "unlocked_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_contents" ADD CONSTRAINT "message_contents_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_unlocks" ADD CONSTRAINT "message_unlocks_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_unlocks" ADD CONSTRAINT "message_unlocks_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icebreaker_daily_counts" ADD CONSTRAINT "icebreaker_daily_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Row Level Security: enabled in the same migration that creates each table =====
-- No policies are created. The app connects with a role that bypasses RLS and enforces every rule in server code.
-- anon and authenticated lose all access as a second layer.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profile_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_contents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_unlocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "icebreaker_daily_counts" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "users" FROM anon, authenticated;
REVOKE ALL ON TABLE "profiles" FROM anon, authenticated;
REVOKE ALL ON TABLE "profile_photos" FROM anon, authenticated;
REVOKE ALL ON TABLE "conversations" FROM anon, authenticated;
REVOKE ALL ON TABLE "messages" FROM anon, authenticated;
REVOKE ALL ON TABLE "message_contents" FROM anon, authenticated;
REVOKE ALL ON TABLE "message_unlocks" FROM anon, authenticated;
REVOKE ALL ON TABLE "icebreaker_daily_counts" FROM anon, authenticated;

-- ===== CHECK constraints (Prisma cannot express these) =====
ALTER TABLE "users" ADD CONSTRAINT "users_adult_check" CHECK ("date_of_birth" <= (CURRENT_DATE - INTERVAL '18 years'));
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_position_check" CHECK ("position" >= 0);
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participants_ordered_check" CHECK ("user_a_id" < "user_b_id");
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_last_seq_check" CHECK ("last_seq" >= 0);
ALTER TABLE "messages" ADD CONSTRAINT "messages_seq_check" CHECK ("seq" > 0);
ALTER TABLE "messages" ADD CONSTRAINT "messages_participants_differ_check" CHECK ("sender_id" <> "recipient_id");
ALTER TABLE "messages" ADD CONSTRAINT "messages_preset_key_check" CHECK (("kind" = 'PRESET' AND "preset_key" IS NOT NULL) OR ("kind" = 'CUSTOM' AND "preset_key" IS NULL));
ALTER TABLE "message_contents" ADD CONSTRAINT "message_contents_body_check" CHECK (char_length("body") > 0);
ALTER TABLE "icebreaker_daily_counts" ADD CONSTRAINT "icebreaker_daily_counts_count_check" CHECK ("count" >= 0 AND "count" <= 15);
