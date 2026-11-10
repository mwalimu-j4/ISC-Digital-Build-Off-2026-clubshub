CREATE TABLE "interests" (
  "id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "slug" VARCHAR(80) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "club_interests" (
  "club_id" UUID NOT NULL,
  "interest_id" UUID NOT NULL,
  CONSTRAINT "club_interests_pkey" PRIMARY KEY ("club_id", "interest_id")
);

CREATE TABLE "user_interests" (
  "user_id" UUID NOT NULL,
  "interest_id" UUID NOT NULL,
  CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id", "interest_id")
);

CREATE UNIQUE INDEX "interests_name_key" ON "interests"("name");
CREATE UNIQUE INDEX "interests_slug_key" ON "interests"("slug");
CREATE INDEX "interests_sort_order_name_idx" ON "interests"("sort_order", "name");
CREATE INDEX "club_interests_interest_id_club_id_idx" ON "club_interests"("interest_id", "club_id");
CREATE INDEX "user_interests_interest_id_user_id_idx" ON "user_interests"("interest_id", "user_id");

ALTER TABLE "club_interests" ADD CONSTRAINT "club_interests_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_interests" ADD CONSTRAINT "club_interests_interest_id_fkey"
  FOREIGN KEY ("interest_id") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_id_fkey"
  FOREIGN KEY ("interest_id") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "interests" ("id", "name", "slug", "sort_order") VALUES
  ('f137a882-ea7c-4ab7-8fb4-000000000001', 'Technology', 'technology', 10),
  ('f137a882-ea7c-4ab7-8fb4-000000000002', 'Business', 'business', 20),
  ('f137a882-ea7c-4ab7-8fb4-000000000003', 'Sports', 'sports', 30),
  ('f137a882-ea7c-4ab7-8fb4-000000000004', 'Music', 'music', 40),
  ('f137a882-ea7c-4ab7-8fb4-000000000005', 'Leadership', 'leadership', 50),
  ('f137a882-ea7c-4ab7-8fb4-000000000006', 'Community service', 'community-service', 60),
  ('f137a882-ea7c-4ab7-8fb4-000000000007', 'Arts', 'arts', 70),
  ('f137a882-ea7c-4ab7-8fb4-000000000008', 'Academic', 'academic', 80);
