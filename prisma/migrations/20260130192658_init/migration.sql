-- CreateTable
CREATE TABLE "SentDeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
