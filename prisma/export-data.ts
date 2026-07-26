import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

const adapter = new PrismaBetterSQLite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

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
