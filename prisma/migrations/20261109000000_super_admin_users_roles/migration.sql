ALTER TABLE "users"
ADD COLUMN "suspended_at" TIMESTAMPTZ(3),
ADD COLUMN "suspended_reason" VARCHAR(500);

CREATE INDEX "users_suspended_at_idx" ON "users"("suspended_at");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
