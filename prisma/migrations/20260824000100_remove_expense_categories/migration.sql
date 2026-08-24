-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT IF EXISTS "Expense_categoryId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Expense_categoryId_idx";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "categoryId";

-- DropTable
DROP TABLE IF EXISTS "ExpenseCategory";
