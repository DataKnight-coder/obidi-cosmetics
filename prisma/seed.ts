import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSQLite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing products
  await prisma.product.deleteMany({})
  await prisma.adminUser.deleteMany({})

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
      }
    });
    console.log(`Created Super Admin with email: ${adminEmail}`);
  } else {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping Admin Seeding.");
  }

  const products = [
    {
      name: "Lagos Sun Serum",
      slug: "lagos-sun-serum",
      description: "A hydration powerhouse. We formulated it with niacinamide and hyaluronic acid to lock in moisture and deliver a ridiculous glow. Perfect for all skin types, this lightweight serum absorbs quickly without leaving a greasy residue.",
      shortDescription: "Instant hydration and ridiculous glow. Gbam.",
      category: { connectOrCreate: { where: { name: "Skincare" }, create: { name: "Skincare", slug: "skincare" } } },
      priceKobo: 2500000,
      stockQuantity: 100,
      sku: "SKU-LSS-01",
      featuredImage: "/assets/fragrance.png",
      productImages: {
        create: [
          { url: "/assets/fragrance.png", objectKey: "seed/fragrance.png", isPrimary: true, sortOrder: 0 },
          { url: "/assets/skincare.png", objectKey: "seed/skincare.png", isPrimary: false, sortOrder: 1 }
        ]
      },
      status: "ACTIVE",
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      ingredients: "Water, Niacinamide, Hyaluronic Acid, Glycerin, Phenoxyethanol",
      usageInfo: "Apply 2-3 drops to clean, damp skin. Gently press into face and neck until fully absorbed.",
      seoTitle: "Lagos Sun Serum - Hydrating Niacinamide Serum",
      seoDescription: "Get that ridiculous glow with our Lagos Sun Serum. Formulated with niacinamide and hyaluronic acid."
    },
    {
      name: "Wahala Matte Lip",
      slug: "wahala-matte-lip",
      description: "Bold pigment. No wahala, e no dey transfer. This long-lasting liquid lipstick provides full coverage with a comfortable matte finish that lasts up to 12 hours.",
      shortDescription: "Bold pigment. No wahala, e no dey transfer.",
      category: { connectOrCreate: { where: { name: "Makeup" }, create: { name: "Makeup", slug: "makeup" } } },
      priceKobo: 1500000,
      stockQuantity: 150,
      sku: "SKU-WML-02",
      featuredImage: "/assets/makeup.png",
      productImages: {
        create: [
          { url: "/assets/makeup.png", objectKey: "seed/makeup.png", isPrimary: true, sortOrder: 0 }
        ]
      },
      status: "ACTIVE",
      isFeatured: false,
      isBestseller: true,
      isNewArrival: true,
      ingredients: "Isododecane, Dimethicone, Trimethylsiloxysilicate, Silica, Iron Oxides",
      usageInfo: "Apply directly to bare lips. Let dry for 60 seconds. Do not press lips together while drying.",
      seoTitle: "Wahala Matte Lip - Transfer-proof Liquid Lipstick",
      seoDescription: "Bold pigment that doesn't transfer. Get the ultimate matte finish with Wahala Matte Lip."
    },
    {
      name: "Soft Life Butter",
      slug: "soft-life-butter",
      description: "Melt-in-your-skin nourishment. Correct luxury. Formulated with shea butter and jojoba oil, this rich body cream provides intense hydration for dry skin, leaving it soft, supple, and glowing.",
      shortDescription: "Melt-in-your-skin nourishment. Correct luxury.",
      category: { connectOrCreate: { where: { name: "Body Care" }, create: { name: "Body Care", slug: "body-care" } } },
      priceKobo: 3200000,
      stockQuantity: 75,
      sku: "SKU-SLB-03",
      featuredImage: "/assets/skincare.png",
      productImages: {
        create: [
          { url: "/assets/skincare.png", objectKey: "seed/skincare2.png", isPrimary: true, sortOrder: 0 },
          { url: "/assets/haircare.png", objectKey: "seed/haircare.png", isPrimary: false, sortOrder: 1 }
        ]
      },
      status: "ACTIVE",
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      ingredients: "Shea Butter, Cocoa Butter, Jojoba Oil, Sweet Almond Oil, Vitamin E",
      usageInfo: "Massage generously into skin after showering to lock in moisture. Pay special attention to dry areas like elbows and knees.",
      seoTitle: "Soft Life Butter - Luxury Body Cream",
      seoDescription: "Melt-in-your-skin nourishment with shea butter and jojoba oil. Treat your skin to the soft life."
    },
    {
      name: "The Ultimate Glow Palette",
      slug: "ultimate-glow-palette",
      description: "Omo, this palette literally changed my routine. The pigment is insane. Na this one. Features 12 highly pigmented shades ranging from soft neutrals to bold shimmers, perfect for any skin tone.",
      shortDescription: "12 highly pigmented shades for the ultimate glow.",
      category: { connectOrCreate: { where: { name: "Makeup" }, create: { name: "Makeup", slug: "makeup" } } },
      priceKobo: 4500000,
      discountPriceKobo: 4000000,
      stockQuantity: 50,
      sku: "SKU-UGP-04",
      featuredImage: "/assets/haircare.png",
      productImages: {
        create: [
          { url: "/assets/haircare.png", objectKey: "seed/haircare2.png", isPrimary: true, sortOrder: 0 },
          { url: "/assets/makeup.png", objectKey: "seed/makeup2.png", isPrimary: false, sortOrder: 1 }
        ]
      },
      status: "ACTIVE",
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      ingredients: "Mica, Talc, Magnesium Stearate, Dimethicone, Titanium Dioxide",
      usageInfo: "Apply matte shades with a fluffy brush for blending. Apply shimmer shades with your finger or a dense brush for maximum payoff.",
      seoTitle: "The Ultimate Glow Palette - Eyeshadow Palette",
      seoDescription: "12 highly pigmented shades ranging from soft neutrals to bold shimmers. Perfect for any skin tone."
    }
  ]

  console.log(`Start seeding...`)
  for (const p of products) {
    const { priceKobo, stockQuantity, sku, discountPriceKobo, ...productData } = p;
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: [
            {
              name: "Default",
              sku: sku,
              priceKobo: priceKobo,
              discountPriceKobo: discountPriceKobo,
              stockQuantity: stockQuantity,
            }
          ]
        }
      },
    })
    console.log(`Created product with id: ${product.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
