-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('HISTORY');

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameRoomUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRoom_ownerId_key" ON "GameRoom"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "_GameRoomUsers_AB_unique" ON "_GameRoomUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_GameRoomUsers_B_index" ON "_GameRoomUsers"("B");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameRoomUsers" ADD CONSTRAINT "_GameRoomUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameRoomUsers" ADD CONSTRAINT "_GameRoomUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
