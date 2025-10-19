-- Drop foreign key constraint first
ALTER TABLE "Note" DROP CONSTRAINT "Note_subjectId_fkey";

-- Drop the unique index
DROP INDEX "Subject_id_key";

-- Add primary key
ALTER TABLE "Subject" ADD PRIMARY KEY ("id");

-- Recreate foreign key constraint
ALTER TABLE "Note"
ADD CONSTRAINT "Note_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE;
