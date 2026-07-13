const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('prisma/dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

const exportData = {};

for (const table of tables) {
  const tableName = table.name;
  const records = db.prepare(`SELECT * FROM "${tableName}"`).all();
  exportData[tableName] = records;
  console.log(`Exported ${records.length} records from ${tableName}`);
}

fs.writeFileSync('backups/pre-d1-migration/export.json', JSON.stringify(exportData, null, 2));
console.log('Export complete: backups/pre-d1-migration/export.json');
