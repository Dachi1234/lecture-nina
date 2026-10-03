-- Learning model v2: Course → Unit → LessonPlan, groups, live-linked lessons,
-- per-lesson progress. The first content set moves to the read-only legacy library.

-- 1. New enums and tables ---------------------------------------------------

CREATE TYPE "PlanSection" AS ENUM ('WARMUP', 'CLASS', 'HOMEWORK', 'REVIEW');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "titleKa" TEXT NOT NULL,
    "titleEs" TEXT,
    "summaryKa" TEXT,
    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "unitId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleKa" TEXT NOT NULL,
    "titleEs" TEXT,
    "goalsKa" TEXT[],
    "teacherNotes" TEXT,
    "estMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "section" "PlanSection" NOT NULL DEFAULT 'CLASS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "noteKa" TEXT,
    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT,
    "noteKa" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMember" (
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("groupId","studentId")
);

CREATE TABLE "LessonItem" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "planItemId" TEXT,
    "materialId" TEXT,
    "section" "PlanSection" NOT NULL DEFAULT 'CLASS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "noteKa" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "held" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LessonItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonProgress" (
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "openedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastStep" INTEGER,
    "bestScore" DOUBLE PRECISION,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("studentId","lessonId","materialId")
);

CREATE TABLE "PersonalWord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "es" TEXT NOT NULL,
    "ka" TEXT NOT NULL,
    "en" TEXT,
    "noteKa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalWord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegacyMaterial" (
    "id" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "status" "MaterialStatus" NOT NULL,
    "tags" TEXT[],
    "estMinutes" INTEGER,
    "unitLabel" TEXT,
    "topicLabel" TEXT,
    "topicOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "migratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LegacyMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegacyMaterialAsset" (
    "legacyMaterialId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LegacyMaterialAsset_pkey" PRIMARY KEY ("legacyMaterialId","assetId","role")
);

CREATE TABLE "LegacyWord" (
    "id" TEXT NOT NULL,
    "es" TEXT NOT NULL,
    "ka" TEXT NOT NULL,
    "en" TEXT,
    "pronunciation" TEXT,
    "category" TEXT,
    "topicLabel" TEXT,
    "topicOrder" INTEGER,
    CONSTRAINT "LegacyWord_pkey" PRIMARY KEY ("id")
);

-- 2. Move the first content set into the legacy library ----------------------

INSERT INTO "LegacyMaterial" ("id", "type", "title", "subtitle", "description", "content", "status", "tags", "estMinutes", "unitLabel", "topicLabel", "topicOrder", "createdAt")
SELECT
    m."id", m."type", m."title", m."subtitle", m."description",
    COALESCE(m."draft", m."content"), m."status", m."tags", m."estMinutes",
    (SELECT b."titleKa" FROM "MaterialTopic" mt JOIN "Topic" t ON t."id" = mt."topicId" JOIN "Block" b ON b."id" = t."blockId"
       WHERE mt."materialId" = m."id" ORDER BY t."number" LIMIT 1),
    (SELECT string_agg(t."titleKa", ' · ' ORDER BY t."number") FROM "MaterialTopic" mt JOIN "Topic" t ON t."id" = mt."topicId"
       WHERE mt."materialId" = m."id"),
    (SELECT min(t."number") FROM "MaterialTopic" mt JOIN "Topic" t ON t."id" = mt."topicId" WHERE mt."materialId" = m."id"),
    m."createdAt"
FROM "Material" m
WHERE m."personalForId" IS NULL;

INSERT INTO "LegacyMaterialAsset" ("legacyMaterialId", "assetId", "role", "order")
SELECT ma."materialId", ma."assetId", ma."role", ma."order"
FROM "MaterialAsset" ma
JOIN "LegacyMaterial" lm ON lm."id" = ma."materialId";

INSERT INTO "LegacyWord" ("id", "es", "ka", "en", "pronunciation", "category", "topicLabel", "topicOrder")
SELECT v."id", v."es", v."ka", v."en", v."pronunciation", v."category", t."titleKa", t."number"
FROM "VocabularyEntry" v
LEFT JOIN "Topic" t ON t."id" = v."topicId"
WHERE v."personalForId" IS NULL;

INSERT INTO "PersonalWord" ("id", "studentId", "es", "ka", "en", "noteKa")
SELECT v."id", v."personalForId", v."es", v."ka", v."en", v."personalLabel"
FROM "VocabularyEntry" v
WHERE v."personalForId" IS NOT NULL;

-- 3. Course skeleton: blocks become units, topics become draft lesson plans ---

INSERT INTO "Unit" ("id", "courseId", "order", "titleKa", "titleEs")
SELECT b."id", b."courseId", b."order", b."titleKa", b."titleEs" FROM "Block" b;

INSERT INTO "LessonPlan" ("id", "unitId", "order", "titleKa", "titleEs", "goalsKa", "updatedAt")
SELECT t."id", t."blockId", t."number", t."titleKa", t."titleEs", ARRAY[]::TEXT[], CURRENT_TIMESTAMP FROM "Topic" t;

INSERT INTO "Enrollment" ("id", "studentId", "courseId")
SELECT 'enr_' || s."id", s."id", s."courseId" FROM "StudentProfile" s WHERE s."courseId" IS NOT NULL;

-- 4. Clear old delivery data and empty the new library -----------------------

DELETE FROM "Assignment";
DELETE FROM "MaterialProgress";
DELETE FROM "ExerciseAttempt";
DELETE FROM "LessonTopic";
DELETE FROM "Lesson";
DELETE FROM "MaterialTopic";
DELETE FROM "MaterialRevision";
DELETE FROM "MaterialAsset";
DELETE FROM "Material";

-- 5. Drop the old structure --------------------------------------------------

ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_lessonId_fkey";
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_materialId_fkey";
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_studentId_fkey";
ALTER TABLE "Block" DROP CONSTRAINT "Block_courseId_fkey";
ALTER TABLE "LessonTopic" DROP CONSTRAINT "LessonTopic_lessonId_fkey";
ALTER TABLE "LessonTopic" DROP CONSTRAINT "LessonTopic_topicId_fkey";
ALTER TABLE "Material" DROP CONSTRAINT "Material_personalForId_fkey";
ALTER TABLE "MaterialProgress" DROP CONSTRAINT "MaterialProgress_materialId_fkey";
ALTER TABLE "MaterialProgress" DROP CONSTRAINT "MaterialProgress_studentId_fkey";
ALTER TABLE "MaterialTopic" DROP CONSTRAINT "MaterialTopic_materialId_fkey";
ALTER TABLE "MaterialTopic" DROP CONSTRAINT "MaterialTopic_topicId_fkey";
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_courseId_fkey";
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_blockId_fkey";
ALTER TABLE "VocabularyEntry" DROP CONSTRAINT "VocabularyEntry_personalForId_fkey";
ALTER TABLE "VocabularyEntry" DROP CONSTRAINT "VocabularyEntry_topicId_fkey";

DROP INDEX "Lesson_studentId_number_key";

ALTER TABLE "Course" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "descriptionKa" TEXT,
ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Course" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "ExerciseAttempt" ADD COLUMN "lessonId" TEXT;

ALTER TABLE "Lesson" DROP COLUMN "noteFromNina",
DROP COLUMN "number",
DROP COLUMN "readyForStudent",
DROP COLUMN "statusOverride",
ADD COLUMN "durationMin" INTEGER,
ADD COLUMN "groupId" TEXT,
ADD COLUMN "heldAt" TIMESTAMP(3),
ADD COLUMN "homeworkDueAt" TIMESTAMP(3),
ADD COLUMN "noteKa" TEXT,
ADD COLUMN "planId" TEXT,
ADD COLUMN "privateNote" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

ALTER TABLE "Material" DROP COLUMN "personalForId",
ADD COLUMN "legacySourceId" TEXT,
ADD COLUMN "level" TEXT;

ALTER TABLE "StudentProfile" DROP COLUMN "courseId",
DROP COLUMN "nextLessonAt";

DROP TABLE "Assignment";
DROP TABLE "Block";
DROP TABLE "LessonTemplate";
DROP TABLE "LessonTopic";
DROP TABLE "MaterialProgress";
DROP TABLE "MaterialTopic";
DROP TABLE "Topic";
DROP TABLE "VocabularyEntry";

DROP TYPE "AssignmentKind";
DROP TYPE "LessonStatusOverride";

-- 6. Indexes and foreign keys ------------------------------------------------

CREATE INDEX "Unit_courseId_order_idx" ON "Unit"("courseId", "order");
CREATE INDEX "LessonPlan_unitId_order_idx" ON "LessonPlan"("unitId", "order");
CREATE UNIQUE INDEX "PlanItem_planId_materialId_key" ON "PlanItem"("planId", "materialId");
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");
CREATE UNIQUE INDEX "LessonItem_lessonId_planItemId_key" ON "LessonItem"("lessonId", "planItemId");
CREATE UNIQUE INDEX "LessonItem_lessonId_materialId_key" ON "LessonItem"("lessonId", "materialId");
CREATE INDEX "LessonProgress_studentId_materialId_idx" ON "LessonProgress"("studentId", "materialId");
CREATE INDEX "Lesson_studentId_date_idx" ON "Lesson"("studentId", "date");
CREATE INDEX "Lesson_groupId_date_idx" ON "Lesson"("groupId", "date");

ALTER TABLE "Unit" ADD CONSTRAINT "Unit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LessonPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LessonPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonItem" ADD CONSTRAINT "LessonItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonItem" ADD CONSTRAINT "LessonItem_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "PlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonItem" ADD CONSTRAINT "LessonItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalWord" ADD CONSTRAINT "PersonalWord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegacyMaterialAsset" ADD CONSTRAINT "LegacyMaterialAsset_legacyMaterialId_fkey" FOREIGN KEY ("legacyMaterialId") REFERENCES "LegacyMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegacyMaterialAsset" ADD CONSTRAINT "LegacyMaterialAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
