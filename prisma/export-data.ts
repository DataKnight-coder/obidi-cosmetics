import { PrismaClient } from "../src/generated/prisma";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function exportData() {
  console.log("Exporting SQLite data...");
  const data = {
    products: await prisma.product.findMany({ include: { variants: true, productImages: true } }),
    adminUsers: await prisma.adminUser.findMany(),
    orders: await prisma.order.findMany({ include: { items: true, payments: true } }),
  };

  const backupPath = path.join(__dirname, "sqlite_backup.json");
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`Data exported to ${backupPath}`);
}

exportData()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
