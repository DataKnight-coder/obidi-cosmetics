import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import bcrypt from "bcryptjs";

const adminEmail = process.env.STAGING_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.STAGING_ADMIN_PASSWORD;

if (process.env.BOOTSTRAP_TARGET !== "staging") {
  throw new Error("BOOTSTRAP_TARGET must be exactly 'staging'.");
}

if (!adminEmail || !adminEmail.includes("@")) {
  throw new Error("STAGING_ADMIN_EMAIL must be a valid email address.");
}

if (!adminPassword || adminPassword.length < 16) {
  throw new Error("STAGING_ADMIN_PASSWORD must contain at least 16 characters.");
}

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const now = new Date().toISOString();
const passwordHash = await bcrypt.hash(adminPassword, 12);
const adminId = `stg_admin_${randomUUID()}`;
const auditId = `stg_audit_${randomUUID()}`;
const sqlPath = ".staging-bootstrap.sql";

const categories = [
  {
    id: "stg_cat_skincare",
    name: "Skincare",
    slug: "skincare",
    description: "Staging skincare products for checkout testing.",
  },
  {
    id: "stg_cat_makeup",
    name: "Makeup",
    slug: "makeup",
    description: "Staging makeup products for checkout testing.",
  },
  {
    id: "stg_cat_fragrance",
    name: "Fragrance",
    slug: "fragrance",
    description: "Staging fragrance products for checkout testing.",
  },
];

const products = [
  {
    id: "stg_product_lagos_sun_serum",
    variantId: "stg_variant_lagos_sun_serum",
    name: "Lagos Sun Serum — Staging",
    slug: "staging-lagos-sun-serum",
    description: "A staging-only hydration serum used to verify catalog, cart, inventory and checkout flows.",
    shortDescription: "Staging hydration serum for end-to-end testing.",
    categorySlug: "skincare",
    featuredImage: "/assets/skincare.png",
    sku: "STG-LSS-001",
    priceKobo: 2500000,
  },
  {
    id: "stg_product_wahala_matte_lip",
    variantId: "stg_variant_wahala_matte_lip",
    name: "Wahala Matte Lip — Staging",
    slug: "staging-wahala-matte-lip",
    description: "A staging-only matte lip product used to verify search, cart and checkout behavior.",
    shortDescription: "Staging matte lip for end-to-end testing.",
    categorySlug: "makeup",
    featuredImage: "/assets/makeup.png",
    sku: "STG-WML-001",
    priceKobo: 1500000,
  },
  {
    id: "stg_product_soft_life_scent",
    variantId: "stg_variant_soft_life_scent",
    name: "Soft Life Scent — Staging",
    slug: "staging-soft-life-scent",
    description: "A staging-only fragrance used to verify product discovery and payment flows.",
    shortDescription: "Staging fragrance for end-to-end testing.",
    categorySlug: "fragrance",
    featuredImage: "/assets/fragrance.png",
    sku: "STG-SLS-001",
    priceKobo: 3200000,
  },
];

const statements = ["BEGIN TRANSACTION;"];

statements.push(`
  INSERT INTO "AdminUser" (
    "id", "name", "email", "passwordHash", "role", "isActive",
    "sessionVersion", "createdAt", "updatedAt"
  )
  VALUES (
    ${sqlString(adminId)}, 'Staging Super Admin', ${sqlString(adminEmail)},
    ${sqlString(passwordHash)}, 'SUPER_ADMIN', 1, 1, ${sqlString(now)}, ${sqlString(now)}
  )
  ON CONFLICT("email") DO UPDATE SET
    "name" = excluded."name",
    "passwordHash" = excluded."passwordHash",
    "role" = 'SUPER_ADMIN',
    "isActive" = 1,
    "sessionVersion" = "AdminUser"."sessionVersion" + 1,
    "updatedAt" = excluded."updatedAt";
`);

statements.push(`
  INSERT INTO "AdminAuditLog" ("id", "adminId", "action", "details", "createdAt")
  SELECT
    ${sqlString(auditId)}, "id", 'STAGING_BOOTSTRAP',
    '{"source":"GITHUB_ACTIONS","target":"staging"}', ${sqlString(now)}
  FROM "AdminUser"
  WHERE "email" = ${sqlString(adminEmail)};
`);

for (const category of categories) {
  statements.push(`
    INSERT INTO "Category" (
      "id", "name", "slug", "description", "createdAt", "updatedAt"
    )
    VALUES (
      ${sqlString(category.id)}, ${sqlString(category.name)}, ${sqlString(category.slug)},
      ${sqlString(category.description)}, ${sqlString(now)}, ${sqlString(now)}
    )
    ON CONFLICT("slug") DO UPDATE SET
      "name" = excluded."name",
      "description" = excluded."description",
      "updatedAt" = excluded."updatedAt";
  `);
}

for (const product of products) {
  statements.push(`
    INSERT INTO "Product" (
      "id", "name", "slug", "description", "shortDescription", "categoryId",
      "featuredImage", "status", "brand", "isFeatured", "isBestseller",
      "isNewArrival", "createdAt", "updatedAt"
    )
    VALUES (
      ${sqlString(product.id)}, ${sqlString(product.name)}, ${sqlString(product.slug)},
      ${sqlString(product.description)}, ${sqlString(product.shortDescription)},
      (SELECT "id" FROM "Category" WHERE "slug" = ${sqlString(product.categorySlug)}),
      ${sqlString(product.featuredImage)}, 'ACTIVE', 'OBIDI STAGING', 1, 0, 1,
      ${sqlString(now)}, ${sqlString(now)}
    )
    ON CONFLICT("slug") DO UPDATE SET
      "name" = excluded."name",
      "description" = excluded."description",
      "shortDescription" = excluded."shortDescription",
      "categoryId" = excluded."categoryId",
      "featuredImage" = excluded."featuredImage",
      "status" = 'ACTIVE',
      "brand" = excluded."brand",
      "isFeatured" = 1,
      "isNewArrival" = 1,
      "updatedAt" = excluded."updatedAt";
  `);

  statements.push(`
    INSERT INTO "ProductVariant" (
      "id", "productId", "name", "sku", "priceKobo", "stockQuantity",
      "reservedQuantity", "createdAt", "updatedAt"
    )
    VALUES (
      ${sqlString(product.variantId)},
      (SELECT "id" FROM "Product" WHERE "slug" = ${sqlString(product.slug)}),
      'Default', ${sqlString(product.sku)}, ${product.priceKobo}, 25, 0,
      ${sqlString(now)}, ${sqlString(now)}
    )
    ON CONFLICT("sku") DO UPDATE SET
      "productId" = excluded."productId",
      "priceKobo" = excluded."priceKobo",
      "stockQuantity" = MAX(25, "ProductVariant"."reservedQuantity"),
      "updatedAt" = excluded."updatedAt";
  `);
}

statements.push("COMMIT;");

try {
  await writeFile(sqlPath, statements.join("\n"), { encoding: "utf8", mode: 0o600 });

  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "DB", "--remote", "--env", "staging", `--file=${sqlPath}`],
    { stdio: "inherit" },
  );

  execFileSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--remote",
      "--env",
      "staging",
      "--command",
      `SELECT
        (SELECT COUNT(*) FROM "AdminUser" WHERE "email" = ${sqlString(adminEmail)} AND "role" = 'SUPER_ADMIN' AND "isActive" = 1) AS "verifiedAdmins",
        (SELECT COUNT(*) FROM "Category" WHERE "id" LIKE 'stg_cat_%') AS "stagingCategories",
        (SELECT COUNT(*) FROM "Product" WHERE "slug" LIKE 'staging-%' AND "status" = 'ACTIVE') AS "stagingProducts",
        (SELECT COUNT(*) FROM "ProductVariant" WHERE "sku" LIKE 'STG-%' AND "stockQuantity" > 0) AS "stockedVariants";`,
    ],
    { stdio: "inherit" },
  );

  console.log("Staging bootstrap completed. Credentials were not printed.");
} finally {
  await unlink(sqlPath).catch(() => {});
}
