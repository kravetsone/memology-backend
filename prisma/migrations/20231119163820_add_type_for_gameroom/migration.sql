/*
  Warnings:

  - Added the required column `type` to the `GameRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "type" "GameType" NOT NULL;
