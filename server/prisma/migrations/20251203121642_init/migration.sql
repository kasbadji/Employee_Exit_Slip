-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Manager', 'Employee');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role"[] DEFAULT ARRAY['Employee']::"Role"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
