-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- AddColumn
ALTER TABLE "AdminUser" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE';

-- Existing accounts were administrators before roles existed.
UPDATE "AdminUser" SET "role" = 'ADMIN';
