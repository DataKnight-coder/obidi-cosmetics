const fs = require("fs");
const path = require("path");

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, "src"), function(filePath) {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    let content = fs.readFileSync(filePath, "utf8");
    let original = content;

    // Fix category -> category.name
    content = content.replace(/\{product\.category\}/g, "{product.category?.name || 'Category'}");
    // Fix price formatting (Decimal -> Number)
    content = content.replace(/variants\[0\]\.price\.toLocaleString/g, "variants[0].price).toLocaleString");
    content = content.replace(/variants\[0\]\.price\}/g, "Number(product.variants[0].price)}");
    content = content.replace(/variants\[0\]\.discountPrice\./g, "variants[0].discountPrice)?.");
    
    // Quick regex to wrap prices in Number()
    content = content.replace(/\{product\.variants\[0\]\.price\}/g, "{Number(product.variants[0].price)}");
    content = content.replace(/product\.variants\[0\]\.price(?!\))/g, "Number(product.variants[0].price)");
    content = content.replace(/product\.variants\[0\]\.discountPrice(?!\))/g, "Number(product.variants[0].discountPrice)");

    // Fix TS errors in admin-products for categoryId
    if (filePath.includes("admin-products.ts")) {
      content = content.replace(/category: data\.categoryId/g, "categoryId: data.categoryId");
    }
    
    // Fix checkout arithmetic error
    if (filePath.includes("checkout.ts")) {
       content = content.replace(/variant\.discountPrice \|\| variant\.price/g, "Number(variant.discountPrice || variant.price)");
       content = content.replace(/const itemPrice = variant\.discountPrice \|\| variant\.price;/g, "const itemPrice = Number(variant.discountPrice || variant.price);");
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log("Updated", filePath);
    }
  }
});
