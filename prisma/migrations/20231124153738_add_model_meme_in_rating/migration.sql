-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('ETERNAL', 'WEEKLY');

-- CreateTable
CREATE TABLE "MemeInRating" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "type" "RatingType" NOT NULL,
    "memeId" INTEGER NOT NULL,

    CONSTRAINT "MemeInRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemeInRating" ADD CONSTRAINT "MemeInRating_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "Meme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
