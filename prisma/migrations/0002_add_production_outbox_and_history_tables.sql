-- CreateTable EmailEvent
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "queuedAt" DATETIME,
    "processingAt" DATETIME,
    "nextAttemptAt" DATETIME,
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateUniqueIndex EmailEvent
CREATE UNIQUE INDEX "EmailEvent_orderId_eventName_key" ON "EmailEvent" ("orderId", "eventName");
CREATE INDEX "EmailEvent_status_nextAttemptAt_idx" ON "EmailEvent" ("status", "nextAttemptAt");

-- CreateTable OrderStatusHistory
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceReference" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateUniqueIndex OrderStatusHistory
CREATE UNIQUE INDEX "OrderStatusHistory_orderId_status_sourceReference_key" ON "OrderStatusHistory" ("orderId", "status", "sourceReference");
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory" ("orderId", "createdAt");

-- Rebuild AnalyticsEvent without losing existing rows. The original table has
-- payload/attempts/lastError/sentAt timestamps; new lifecycle columns receive
-- explicit defaults. The TEMP guard aborts the migration on a count mismatch.
CREATE TABLE "AnalyticsEvent_copy_count" AS
SELECT COUNT(*) AS "sourceCount" FROM "AnalyticsEvent";

CREATE TABLE "AnalyticsEvent_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "payloadJson" TEXT NOT NULL,
    "queuedAt" DATETIME,
    "processingAt" DATETIME,
    "nextAttemptAt" DATETIME,
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "AnalyticsEvent_new" (
  "id", "orderId", "eventName", "status", "attempts", "maxAttempts",
  "payloadJson", "queuedAt", "processingAt", "nextAttemptAt",
  "providerMessageId", "lastError", "sentAt", "createdAt", "updatedAt"
)
SELECT
  "id", "orderId", "eventName", "status", "attempts", 5,
  "payload", NULL, NULL, NULL,
  NULL, "lastError", "sentAt", "createdAt", "updatedAt"
FROM "AnalyticsEvent";

CREATE TRIGGER "abort_analytics_copy_mismatch"
BEFORE DELETE ON "AnalyticsEvent_copy_count"
WHEN OLD."sourceCount" != (SELECT COUNT(*) FROM "AnalyticsEvent_new")
BEGIN
  SELECT RAISE(ABORT, 'ANALYTICS_EVENT_COPY_COUNT_MISMATCH');
END;

DELETE FROM "AnalyticsEvent_copy_count";
DROP TRIGGER "abort_analytics_copy_mismatch";
DROP TABLE "AnalyticsEvent_copy_count";
DROP TABLE "AnalyticsEvent";
ALTER TABLE "AnalyticsEvent_new" RENAME TO "AnalyticsEvent";

CREATE UNIQUE INDEX "AnalyticsEvent_orderId_eventName_key" ON "AnalyticsEvent" ("orderId", "eventName");
CREATE INDEX "AnalyticsEvent_status_nextAttemptAt_idx" ON "AnalyticsEvent" ("status", "nextAttemptAt");
