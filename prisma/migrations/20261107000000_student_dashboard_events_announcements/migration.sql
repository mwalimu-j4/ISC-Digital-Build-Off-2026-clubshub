CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "EventRegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED');
CREATE TYPE "AnnouncementAudience" AS ENUM ('MEMBERS', 'UNIVERSITY');

CREATE TABLE "events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "club_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "location" VARCHAR(200) NOT NULL,
  "starts_at" TIMESTAMPTZ(3) NOT NULL,
  "ends_at" TIMESTAMPTZ(3) NOT NULL,
  "capacity" INTEGER,
  "registration_deadline" TIMESTAMPTZ(3),
  "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "events_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "events_starts_at_status_idx" ON "events"("starts_at", "status");
CREATE INDEX "events_club_id_starts_at_idx" ON "events"("club_id", "starts_at");

CREATE TABLE "event_registrations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "status" "EventRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "event_registrations_event_id_user_id_key" UNIQUE ("event_id", "user_id"),
  CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "event_registrations_event_id_status_idx" ON "event_registrations"("event_id", "status");
CREATE INDEX "event_registrations_user_id_status_idx" ON "event_registrations"("user_id", "status");

CREATE TABLE "announcements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "club_id" UUID,
  "author_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "audience" "AnnouncementAudience" NOT NULL DEFAULT 'MEMBERS',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "announcements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "announcements_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "announcements_club_id_created_at_idx" ON "announcements"("club_id", "created_at");
CREATE INDEX "announcements_audience_created_at_idx" ON "announcements"("audience", "created_at");
