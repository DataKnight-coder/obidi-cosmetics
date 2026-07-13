const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
      callback(filepath);
    }
  }
}

walk(path.join(__dirname, '../src'), (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // We have to be careful with property names.
  // We're replacing known property accesses.
  content = content.replace(/\.totalAmount/g, '.totalKobo');
  content = content.replace(/totalAmount:/g, 'totalKobo:');
  content = content.replace(/\bprice:/g, 'priceKobo:');
  content = content.replace(/\.price\b/g, '.priceKobo');
  content = content.replace(/\bdiscountPrice:/g, 'discountPriceKobo:');
  content = content.replace(/\.discountPrice\b/g, '.discountPriceKobo');
  content = content.replace(/\bpriceKoboKobo\b/g, 'priceKobo'); // Just in case
  content = content.replace(/\bdiscountPriceKoboKobo\b/g, 'discountPriceKobo');
  content = content.replace(/\btotalKoboKobo\b/g, 'totalKobo');

  // Also fix Prisma StringFilter "mode" errors which aren't supported in D1 (mode: "insensitive")
  content = content.replace(/,\s*mode:\s*["']insensitive["']/g, '');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
