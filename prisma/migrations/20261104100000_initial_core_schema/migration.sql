-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('MEMBER', 'CLUB_ADMIN');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'LEFT');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "target_entity" VARCHAR(80) NOT NULL,
    "target_entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "logo_url" VARCHAR(2048),
    "created_by_id" UUID NOT NULL,
    "status" "ClubStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "student_registration_id" VARCHAR(80) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_target_entity_target_entity_id_created_at_idx" ON "audit_logs"("target_entity", "target_entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "clubs_status_created_at_idx" ON "clubs"("status", "created_at");

-- CreateIndex
CREATE INDEX "clubs_category_status_idx" ON "clubs"("category", "status");

-- CreateIndex
CREATE INDEX "club_memberships_club_id_status_idx" ON "club_memberships"("club_id", "status");

-- CreateIndex
CREATE INDEX "club_memberships_user_id_status_idx" ON "club_memberships"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "club_memberships_user_id_club_id_key" ON "club_memberships"("user_id", "club_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_student_registration_id_key" ON "users"("student_registration_id");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row-level security is defense in depth. The application must set these
-- transaction-local values after authenticating a request:
--   SELECT set_config('app.user_id', '<user uuid>', true);
--   SELECT set_config('app.role', 'STUDENT|SUPER_ADMIN', true);
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "clubs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clubs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "club_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "club_memberships" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;

CREATE POLICY "users_select_self_or_admin" ON "users"
  FOR SELECT USING (
    "id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );
CREATE POLICY "users_admin_write" ON "users"
  FOR ALL USING (current_setting('app.role', true) = 'SUPER_ADMIN')
  WITH CHECK (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY "clubs_select_public_or_related" ON "clubs"
  FOR SELECT USING (
    "status" = 'ACTIVE'
    OR "created_by_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );
CREATE POLICY "clubs_create_as_actor" ON "clubs"
  FOR INSERT WITH CHECK (
    "created_by_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );
CREATE POLICY "clubs_admin_write" ON "clubs"
  FOR UPDATE USING (
    "created_by_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  ) WITH CHECK (
    "created_by_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );

CREATE POLICY "memberships_select_self_or_admin" ON "club_memberships"
  FOR SELECT USING (
    "user_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
    OR EXISTS (
      SELECT 1
      FROM "clubs"
      WHERE "clubs"."id" = "club_memberships"."club_id"
        AND "clubs"."created_by_id"::text = current_setting('app.user_id', true)
    )
  );
CREATE POLICY "memberships_create_self_or_admin" ON "club_memberships"
  FOR INSERT WITH CHECK (
    "user_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );
CREATE POLICY "memberships_update_self_or_admin" ON "club_memberships"
  FOR UPDATE USING (
    "user_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
    OR EXISTS (
      SELECT 1
      FROM "clubs"
      WHERE "clubs"."id" = "club_memberships"."club_id"
        AND "clubs"."created_by_id"::text = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "audit_insert_as_actor" ON "audit_logs"
  FOR INSERT WITH CHECK (
    "actor_id"::text = current_setting('app.user_id', true)
    OR current_setting('app.role', true) = 'SUPER_ADMIN'
  );
CREATE POLICY "audit_select_admin" ON "audit_logs"
  FOR SELECT USING (current_setting('app.role', true) = 'SUPER_ADMIN');
