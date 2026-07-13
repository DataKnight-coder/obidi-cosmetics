const fs = require("fs");
const path = require("path");

// Fix shop/page.tsx
const shopPage = path.join(__dirname, "src/app/shop/page.tsx");
let content = fs.readFileSync(shopPage, "utf8");
content = content.replace("await getProducts({ include: { variants: true } })", "await getProducts()");
fs.writeFileSync(shopPage, content, "utf8");

// Fix admin/products/page.tsx
const adminProductsPage = path.join(__dirname, "src/app/admin/products/page.tsx");
content = fs.readFileSync(adminProductsPage, "utf8");
content = content.replace(/product\.isAvailable \? 'bg-primary\/20 text-primary' : 'bg-white\/10 text-on-surface-variant'/g, "product.status === 'ACTIVE' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-on-surface-variant'");
content = content.replace(/product\.isAvailable \? 'Available' : 'Hidden'/g, "product.status === 'ACTIVE' ? 'Available' : 'Hidden'");
content = content.replace(/product\.category/g, "product.categoryId");
fs.writeFileSync(adminProductsPage, content, "utf8");

// Fix admin/products/new/page.tsx
const adminProductsNewPage = path.join(__dirname, "src/app/admin/products/new/page.tsx");
content = fs.readFileSync(adminProductsNewPage, "utf8");
content = content.replace(/category: formData\.get\("category"\) as string,/g, "categoryId: formData.get(\"category\") as string,\n      shortDescription: formData.get(\"description\") as string,");
fs.writeFileSync(adminProductsNewPage, content, "utf8");

// Fix lib/prisma.ts
const prismaTs = path.join(__dirname, "src/lib/prisma.ts");
content = fs.readFileSync(prismaTs, "utf8");
content = content.replace("const adapter = new PrismaPg(pool);", "const adapter = new PrismaPg(pool) as any;");
fs.writeFileSync(prismaTs, content, "utf8");

// Fix data/orders.ts
const ordersTs = path.join(__dirname, "src/data/orders.ts");
content = fs.readFileSync(ordersTs, "utf8");
content = content.replace("items: {", "items: {\n            create:");
fs.writeFileSync(ordersTs, content, "utf8");

// Fix search/page.tsx ProductCard import
const searchPage = path.join(__dirname, "src/app/search/page.tsx");
content = fs.readFileSync(searchPage, "utf8");
content = content.replace("@/components/products/ProductCard", "@/components/shop/ProductCard");
fs.writeFileSync(searchPage, content, "utf8");
