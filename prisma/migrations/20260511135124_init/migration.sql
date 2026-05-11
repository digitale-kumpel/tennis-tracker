-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SINGLES', 'DOUBLES', 'TEAM');

-- CreateEnum
CREATE TYPE "Surface" AS ENUM ('CLAY', 'HARD', 'INDOOR', 'GRASS');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('TRAINER', 'TEAM', 'FREE', 'MATCH_PRACTICE');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('MORNING', 'EVENING', 'ANY');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('LK', 'FITNESS', 'TOURNAMENT', 'WEIGHT', 'OTHER');

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "club" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "dtbId" TEXT,
    "dgrNumber" TEXT,
    "currentLk" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LkEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lk" DOUBLE PRECISION NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "LkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT,
    "type" "MatchType" NOT NULL,
    "result" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "surface" "Surface" NOT NULL,
    "tournamentName" TEXT,
    "partner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TrainingType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "focus" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "timeOfDay" "TimeOfDay" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "routineId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "targetArea" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "reps" TEXT,
    "instructions" TEXT NOT NULL,
    "referenceUrls" TEXT[],

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineLog" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "routineId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "targetDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyLog" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutineLog_date_routineId_key" ON "RoutineLog"("date", "routineId");

-- CreateIndex
CREATE UNIQUE INDEX "BodyLog_date_key" ON "BodyLog"("date");

-- AddForeignKey
ALTER TABLE "LkEntry" ADD CONSTRAINT "LkEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
