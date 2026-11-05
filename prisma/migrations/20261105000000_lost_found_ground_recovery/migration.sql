-- Add RECOVERY_OFFICER to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RECOVERY_OFFICER';

-- Create Lost & Found enums
CREATE TYPE "LostFoundType" AS ENUM ('LOST', 'FOUND');

CREATE TYPE "LostFoundStatus" AS ENUM (
  'PENDING_REVIEW',
  'VERIFIED',
  'SEARCHING',
  'POSSIBLE_MATCH',
  'OWNERSHIP_VERIFICATION',
  'READY_FOR_COLLECTION',
  'HANDED_OVER',
  'RECOVERED',
  'CLOSED',
  'EXPIRED',
  'REJECTED'
);

CREATE TYPE "LostFoundCategory" AS ENUM (
  'IDENTIFICATION',
  'ELECTRONICS',
  'CLOTHING',
  'BAGS_WALLETS',
  'BOOKS_STATIONERY',
  'KEYS',
  'JEWELRY_ACCESSORIES',
  'SPORTS_EQUIPMENT',
  'DOCUMENTS',
  'WATER_BOTTLES',
  'HEADPHONES_EARBUDS',
  'OTHER'
);

CREATE TYPE "RecoveryPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TYPE "RecoveryTaskStatus" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED_FOUND',
  'COMPLETED_NOT_FOUND',
  'CANCELLED',
  'ESCALATED'
);

CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');

CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HANDED_OVER', 'CANCELLED');

CREATE TYPE "NotificationType" AS ENUM (
  'LOST_REPORT_CREATED',
  'FOUND_REPORT_CREATED',
  'REPORT_VERIFIED',
  'RECOVERY_TASK_CREATED',
  'RECOVERY_STARTED',
  'RECOVERY_COMPLETED',
  'POSSIBLE_MATCH',
  'OWNERSHIP_VERIFICATION_REQUIRED',
  'OWNERSHIP_VERIFIED',
  'OWNERSHIP_REJECTED',
  'READY_FOR_COLLECTION',
  'ITEM_HANDED_OVER',
  'ITEM_RECOVERED',
  'ITEM_CLOSED',
  'CLAIM_SUBMITTED',
  'CLAIM_REVIEWED',
  'RECOVERY_SEARCH_COMPLETED',
  'GENERAL'
);

-- Create lost_found_items table
CREATE TABLE "lost_found_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "report_type" "LostFoundType" NOT NULL,
  "status" "LostFoundStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "category" "LostFoundCategory" NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "color" VARCHAR(80),
  "brand" VARCHAR(120),
  "model" VARCHAR(120),
  "distinguishing" TEXT,
  "serial_number" VARCHAR(160),
  "campus_area" VARCHAR(160) NOT NULL,
  "building" VARCHAR(160),
  "specific_location" TEXT,
  "location_notes" TEXT,
  "date_occurred" DATE NOT NULL,
  "time_occurred" VARCHAR(40),
  "item_condition" VARCHAR(80),
  "current_holding" TEXT,
  "images" JSONB DEFAULT '[]',
  "collection_location" TEXT,
  "collection_deadline" TIMESTAMPTZ(3),
  "reference_code" VARCHAR(40),
  "reported_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "lost_found_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lost_found_items_reference_code_key" UNIQUE ("reference_code"),
  CONSTRAINT "lost_found_items_reported_by_id_fkey"
    FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "lost_found_items_report_type_status_created_at_idx" ON "lost_found_items"("report_type", "status", "created_at");
CREATE INDEX "lost_found_items_category_status_idx" ON "lost_found_items"("category", "status");
CREATE INDEX "lost_found_items_campus_area_status_idx" ON "lost_found_items"("campus_area", "status");
CREATE INDEX "lost_found_items_reported_by_id_created_at_idx" ON "lost_found_items"("reported_by_id", "created_at");
CREATE INDEX "lost_found_items_status_created_at_idx" ON "lost_found_items"("status", "created_at");
CREATE INDEX "lost_found_items_created_at_idx" ON "lost_found_items"("created_at");

-- Create lost_found_status_history table
CREATE TABLE "lost_found_status_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "item_id" UUID NOT NULL,
  "status" "LostFoundStatus" NOT NULL,
  "note" TEXT,
  "evidence" JSONB,
  "actor_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "lost_found_status_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lost_found_status_history_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "lost_found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lost_found_status_history_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "lost_found_status_history_item_id_created_at_idx" ON "lost_found_status_history"("item_id", "created_at");

-- Create recovery_tasks table
CREATE TABLE "recovery_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "item_id" UUID NOT NULL,
  "priority" "RecoveryPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "RecoveryTaskStatus" NOT NULL DEFAULT 'PENDING',
  "assigned_to_id" UUID,
  "search_notes" TEXT,
  "started_at" TIMESTAMPTZ(3),
  "completed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "recovery_tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recovery_tasks_item_id_key" UNIQUE ("item_id"),
  CONSTRAINT "recovery_tasks_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "lost_found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recovery_tasks_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "recovery_tasks_status_priority_idx" ON "recovery_tasks"("status", "priority");
CREATE INDEX "recovery_tasks_assigned_to_id_status_idx" ON "recovery_tasks"("assigned_to_id", "status");
CREATE INDEX "recovery_tasks_created_at_idx" ON "recovery_tasks"("created_at");

-- Create recovery_checkpoints table
CREATE TABLE "recovery_checkpoints" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "task_id" UUID NOT NULL,
  "area_name" VARCHAR(200) NOT NULL,
  "searched" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "evidence" JSONB,
  "searched_at" TIMESTAMPTZ(3),
  "searched_by_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "recovery_checkpoints_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recovery_checkpoints_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "recovery_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recovery_checkpoints_searched_by_id_fkey"
    FOREIGN KEY ("searched_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "recovery_checkpoints_task_id_idx" ON "recovery_checkpoints"("task_id");

-- Create lost_found_matches table
CREATE TABLE "lost_found_matches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "lost_item_id" UUID NOT NULL,
  "found_item_id" UUID NOT NULL,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "reviewed_by_id" UUID,
  "reviewed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "lost_found_matches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lost_found_matches_lost_item_id_found_item_id_key" UNIQUE ("lost_item_id", "found_item_id"),
  CONSTRAINT "lost_found_matches_lost_item_id_fkey"
    FOREIGN KEY ("lost_item_id") REFERENCES "lost_found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lost_found_matches_found_item_id_fkey"
    FOREIGN KEY ("found_item_id") REFERENCES "lost_found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lost_found_matches_reviewed_by_id_fkey"
    FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "lost_found_matches_status_idx" ON "lost_found_matches"("status");
CREATE INDEX "lost_found_matches_lost_item_id_idx" ON "lost_found_matches"("lost_item_id");
CREATE INDEX "lost_found_matches_found_item_id_idx" ON "lost_found_matches"("found_item_id");

-- Create lost_found_claims table
CREATE TABLE "lost_found_claims" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "item_id" UUID NOT NULL,
  "match_id" UUID,
  "claimant_id" UUID NOT NULL,
  "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
  "verification_data" JSONB,
  "verified_by_id" UUID,
  "verified_at" TIMESTAMPTZ(3),
  "rejection_reason" TEXT,
  "handover_notes" TEXT,
  "handed_over_at" TIMESTAMPTZ(3),
  "handed_over_by_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "lost_found_claims_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lost_found_claims_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "lost_found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lost_found_claims_match_id_fkey"
    FOREIGN KEY ("match_id") REFERENCES "lost_found_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "lost_found_claims_claimant_id_fkey"
    FOREIGN KEY ("claimant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "lost_found_claims_verified_by_id_fkey"
    FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "lost_found_claims_handed_over_by_id_fkey"
    FOREIGN KEY ("handed_over_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "lost_found_claims_item_id_status_idx" ON "lost_found_claims"("item_id", "status");
CREATE INDEX "lost_found_claims_claimant_id_idx" ON "lost_found_claims"("claimant_id");
CREATE INDEX "lost_found_claims_status_idx" ON "lost_found_claims"("status");

-- Create notifications table
CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recipient_id" UUID NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMPTZ(3),
  "related_entity" VARCHAR(80),
  "related_entity_id" UUID,
  "action_url" VARCHAR(500),
  "item_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_recipient_id_fkey"
    FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notifications_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "lost_found_items"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "notifications_recipient_id_read_created_at_idx" ON "notifications"("recipient_id", "read", "created_at");
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");
