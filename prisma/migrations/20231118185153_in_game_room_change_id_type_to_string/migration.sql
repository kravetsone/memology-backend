/*
  Warnings:

  - The primary key for the `GameRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_GameRoomUsers" DROP CONSTRAINT "_GameRoomUsers_A_fkey";

-- AlterTable
ALTER TABLE "GameRoom" DROP CONSTRAINT "GameRoom_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_GameRoomUsers" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_GameRoomUsers" ADD CONSTRAINT "_GameRoomUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
