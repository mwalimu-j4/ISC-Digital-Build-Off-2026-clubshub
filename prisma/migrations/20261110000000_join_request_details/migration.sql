ALTER TABLE "club_memberships"
  ADD COLUMN "school_id" VARCHAR(80),
  ADD COLUMN "department" VARCHAR(120),
  ADD COLUMN "major" VARCHAR(80),
  ADD COLUMN "message" VARCHAR(280),
  ADD COLUMN "year_of_study" VARCHAR(20),
  ADD COLUMN "decided_by_id" UUID,
  ADD COLUMN "decided_at" TIMESTAMPTZ(3),
  ADD COLUMN "decision_note" VARCHAR(200),
  ADD COLUMN "decision_reason" VARCHAR(120),
  ADD COLUMN "undo_until" TIMESTAMPTZ(3);

ALTER TABLE "club_memberships"
  ADD CONSTRAINT "club_memberships_decided_by_id_fkey"
  FOREIGN KEY ("decided_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "club_memberships_club_id_status_applied_at_idx"
  ON "club_memberships"("club_id", "status", "applied_at");
