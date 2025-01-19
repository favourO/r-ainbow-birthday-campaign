/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `DiscountCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_userId_key" ON "DiscountCode"("userId");
