CREATE TYPE "EventMediaKind" AS ENUM ('IMAGE', 'VIDEO');

CREATE TABLE "event_media" (
  "id" UUID NOT NULL,
  "event_id" UUID NOT NULL,
  "kind" "EventMediaKind" NOT NULL,
  "cloudinary_public_id" VARCHAR(255) NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "thumbnail_url" VARCHAR(2048),
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "duration_seconds" INTEGER,
  "bytes" INTEGER NOT NULL,
  "alt_text" VARCHAR(255),
  "sort_order" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_media_cloudinary_public_id_key" ON "event_media"("cloudinary_public_id");
CREATE INDEX "event_media_event_id_sort_order_idx" ON "event_media"("event_id", "sort_order");
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
