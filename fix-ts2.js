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

    content = content.replace(/product\.variants\[0\]\.price\)\.toLocaleString\(\)/g, "Number(product.variants[0].price).toLocaleString()");
    content = content.replace(/product\.variants\[0\]\.discountPrice\)\?\.toLocaleString\(\)/g, "Number(product.variants[0].discountPrice).toLocaleString()");

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log("Fixed", filePath);
    }
  }
});
