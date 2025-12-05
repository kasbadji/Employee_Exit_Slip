-- CreateEnum
CREATE TYPE "ExitStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ExitRequest" (
    "id_request" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ExitStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ExitRequest_pkey" PRIMARY KEY ("id_request")
);

-- AddForeignKey
ALTER TABLE "ExitRequest" ADD CONSTRAINT "ExitRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
