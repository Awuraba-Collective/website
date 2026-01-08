/*
  Warnings:

  - You are about to drop the column `fitCategory` on the `product` table. All the data in the column will be lost.
  - Changed the type of `fitCategory` on the `cart_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fitCategory` on the `order_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FitCategoryType" AS ENUM ('STANDARD', 'LOOSE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "fitCategory",
ADD COLUMN     "fitCategory" "FitCategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "fitCategory",
ADD COLUMN     "fitCategory" "FitCategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "fitCategory",
ADD COLUMN     "costPrice" DECIMAL(10,2),
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "fitCategoryId" TEXT,
ADD COLUMN     "newDropExpiresAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "FitCategory";

-- CreateTable
CREATE TABLE "fit_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fit_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "body_measurement" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "bust" TEXT,
    "waist" TEXT,
    "hips" TEXT,
    "thigh" TEXT,
    "back" TEXT,
    "underBust" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "body_measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "length_standard" (
    "id" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "petite" TEXT,
    "regular" TEXT,
    "tall" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "length_standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loose_fit_map" (
    "id" TEXT NOT NULL,
    "looseSize" TEXT NOT NULL,
    "fitsStandard" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "loose_fit_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RelatedProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelatedProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "fit_category_name_key" ON "fit_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fit_category_slug_key" ON "fit_category"("slug");

-- CreateIndex
CREATE INDEX "_RelatedProducts_B_index" ON "_RelatedProducts"("B");

-- CreateIndex
CREATE INDEX "product_fitCategoryId_idx" ON "product"("fitCategoryId");

-- CreateIndex
CREATE INDEX "product_discountId_idx" ON "product"("discountId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_fitCategoryId_fkey" FOREIGN KEY ("fitCategoryId") REFERENCES "fit_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedProducts" ADD CONSTRAINT "_RelatedProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedProducts" ADD CONSTRAINT "_RelatedProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
