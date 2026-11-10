ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'GRADUATED';
ALTER TABLE "club_memberships" ADD COLUMN "official_role" VARCHAR(80);
