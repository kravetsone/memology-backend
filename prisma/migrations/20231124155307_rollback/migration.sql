/*
  Warnings:

  - The primary key for the `MemeInRating` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MemeInRating" DROP CONSTRAINT "MemeInRating_pkey",
ADD CONSTRAINT "MemeInRating_pkey" PRIMARY KEY ("index", "type");
