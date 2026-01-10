/*
  Warnings:

  - You are about to drop the column `discountEndsAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `product_price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "discountEndsAt",
DROP COLUMN "discountPrice",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "product_price" DROP COLUMN "discountPrice";
