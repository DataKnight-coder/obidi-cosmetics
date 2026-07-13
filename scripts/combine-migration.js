const fs = require('fs');
const initial = fs.readFileSync('prisma/initial.sql', 'utf16le');
const triggers = `
CREATE TRIGGER prevent_negative_variant_stock
BEFORE UPDATE OF stockQuantity ON ProductVariant
FOR EACH ROW
WHEN NEW.stockQuantity < 0
BEGIN
  SELECT RAISE(ABORT, 'INSUFFICIENT_STOCK');
END;

CREATE TRIGGER prevent_oversell_reservation
BEFORE UPDATE OF reservedQuantity ON ProductVariant
FOR EACH ROW
WHEN (NEW.stockQuantity - NEW.reservedQuantity) < 0
BEGIN
  SELECT RAISE(ABORT, 'INSUFFICIENT_STOCK_FOR_RESERVATION');
END;
`;
fs.writeFileSync('prisma/migrations/0001_add_inventory_reservations_and_stock_trigger.sql', initial + triggers, 'utf8');
