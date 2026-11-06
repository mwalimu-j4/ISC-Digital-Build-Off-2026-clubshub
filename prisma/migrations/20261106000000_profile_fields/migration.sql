-- AddProfileFields
-- Add optional profile fields to users table

ALTER TABLE "users" ADD COLUMN "avatar_url" VARCHAR(2048);
ALTER TABLE "users" ADD COLUMN "bio" VARCHAR(500);
ALTER TABLE "users" ADD COLUMN "course" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "year_of_study" VARCHAR(20);
