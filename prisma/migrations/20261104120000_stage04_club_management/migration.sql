ALTER TYPE "ClubStatus" ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';
ALTER TABLE "clubs" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT '';
ALTER TABLE "clubs" ADD COLUMN "activities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "clubs" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "clubs" ADD COLUMN "change_request_reason" TEXT;
ALTER TABLE "clubs" ADD COLUMN "reviewed_by_id" UUID;
ALTER TABLE "clubs" ADD COLUMN "reviewed_at" TIMESTAMPTZ(3);
ALTER TABLE "clubs" ADD COLUMN "suspended_at" TIMESTAMPTZ(3);
ALTER TABLE "clubs" ADD COLUMN "suspended_by_id" UUID;
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_suspended_by_id_fkey"
  FOREIGN KEY ("suspended_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "clubs_reviewed_by_id_idx" ON "clubs"("reviewed_by_id");
CREATE INDEX "clubs_suspended_by_id_idx" ON "clubs"("suspended_by_id");
