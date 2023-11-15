-- AlterTable
ALTER TABLE "Meme" ADD COLUMN     "ownerId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Meme" ADD CONSTRAINT "Meme_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;