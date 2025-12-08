-- CreateTable
CREATE TABLE "StatusHistory" (
    "id_history" SERIAL NOT NULL,
    "exitRequestId" INTEGER NOT NULL,
    "status" "ExitStatus" NOT NULL,
    "comment" TEXT,
    "changedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id_history")
);

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_exitRequestId_fkey" FOREIGN KEY ("exitRequestId") REFERENCES "ExitRequest"("id_request") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
