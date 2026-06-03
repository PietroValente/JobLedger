-- Drop FK from Application to Company(name)
ALTER TABLE "Application" DROP CONSTRAINT "Application_companyName_fkey";
DROP INDEX "Application_companyName_idx";
ALTER TABLE "Application" DROP COLUMN "companyName";

-- Drop old Company PK on name
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey";

-- Add UUID id column to Company
ALTER TABLE "Company" ADD COLUMN "id" TEXT NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Company" ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");
ALTER TABLE "Company" ALTER COLUMN "id" DROP DEFAULT;

-- Add companyId to Application and restore FK
ALTER TABLE "Application" ADD COLUMN "companyId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Application" ALTER COLUMN "companyId" DROP DEFAULT;
ALTER TABLE "Application" ADD CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");
