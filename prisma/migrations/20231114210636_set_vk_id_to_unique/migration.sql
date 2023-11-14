/*
  Warnings:

  - A unique constraint covering the columns `[vkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_vkId_key" ON "User"("vkId");
