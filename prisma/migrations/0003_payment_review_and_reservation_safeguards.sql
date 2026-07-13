CREATE TABLE "PaymentReviewTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "safeFailureCode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PaymentReviewTask_paymentId_key" ON "PaymentReviewTask"("paymentId");
CREATE INDEX "PaymentReviewTask_status_createdAt_idx" ON "PaymentReviewTask"("status", "createdAt");

CREATE TRIGGER prevent_negative_reserved_quantity
BEFORE UPDATE OF reservedQuantity ON ProductVariant
FOR EACH ROW
WHEN NEW.reservedQuantity < 0
BEGIN
  SELECT RAISE(ABORT, 'NEGATIVE_RESERVED_QUANTITY');
END;

CREATE TRIGGER prevent_ineligible_reservation_release
BEFORE UPDATE OF releasedAt ON InventoryReservation
FOR EACH ROW
WHEN NEW.releasedAt IS NOT NULL AND (
  OLD.releasedAt IS NOT NULL OR
  OLD.consumedAt IS NOT NULL OR
  (SELECT status FROM "Order" WHERE id = OLD.orderId) NOT IN ('PENDING', 'ABANDONED') OR
  EXISTS (SELECT 1 FROM Payment WHERE orderId = OLD.orderId AND status = 'SUCCESS')
)
BEGIN
  SELECT RAISE(ABORT, 'INELIGIBLE_RESERVATION_RELEASE');
END;

CREATE TRIGGER prevent_ineligible_reservation_consumption
BEFORE UPDATE OF consumedAt ON InventoryReservation
FOR EACH ROW
WHEN NEW.consumedAt IS NOT NULL AND (
  OLD.consumedAt IS NOT NULL OR OLD.releasedAt IS NOT NULL OR julianday(OLD.expiresAt) <= julianday('now')
)
BEGIN
  SELECT RAISE(ABORT, 'INELIGIBLE_RESERVATION_CONSUMPTION');
END;
