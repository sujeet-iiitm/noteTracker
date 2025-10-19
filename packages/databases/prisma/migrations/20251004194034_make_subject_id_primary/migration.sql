-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
