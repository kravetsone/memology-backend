/*
  Warnings:

  - The primary key for the `MemeInRating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MemeInRating` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MemeInRating" DROP CONSTRAINT "MemeInRating_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MemeInRating_pkey" PRIMARY KEY ("index", "type");
