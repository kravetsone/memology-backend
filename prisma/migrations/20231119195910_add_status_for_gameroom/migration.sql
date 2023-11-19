-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('CREATED', 'STARTED', 'FINISHED');

-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'STARTED',
ALTER COLUMN "data" SET DEFAULT '{}';
