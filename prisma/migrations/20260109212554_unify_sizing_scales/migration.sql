/*
  Warnings:

  - Changed the type of `selectedSize` on the `cart_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fitCategory` on the `cart_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `selectedSize` on the `order_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fitCategory` on the `order_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "selectedSize",
ADD COLUMN     "selectedSize" TEXT NOT NULL,
DROP COLUMN "fitCategory",
ADD COLUMN     "fitCategory" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fit_category" ADD COLUMN     "isStandard" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "selectedSize",
ADD COLUMN     "selectedSize" TEXT NOT NULL,
DROP COLUMN "fitCategory",
ADD COLUMN     "fitCategory" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "fit_size" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fitCategoryId" TEXT NOT NULL,
    "standardMapping" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fit_size_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fit_size_fitCategoryId_idx" ON "fit_size"("fitCategoryId");

-- AddForeignKey
ALTER TABLE "fit_size" ADD CONSTRAINT "fit_size_fitCategoryId_fkey" FOREIGN KEY ("fitCategoryId") REFERENCES "fit_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
