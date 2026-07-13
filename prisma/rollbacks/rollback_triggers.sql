-- Emergency Rollback Script
-- Run this if the inventory triggers cause unexpected production issues.
-- Note: Do NOT place this file inside the `prisma/migrations` folder, otherwise Wrangler will automatically apply it.
-- 
-- To apply manually via wrangler:
-- npx wrangler d1 execute obidi-cosmetics --file prisma/rollbacks/rollback_triggers.sql --remote

DROP TRIGGER IF EXISTS prevent_negative_variant_stock;
DROP TRIGGER IF EXISTS prevent_oversell_reservation;
