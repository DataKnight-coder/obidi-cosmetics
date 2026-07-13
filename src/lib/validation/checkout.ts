import { z } from "zod";

const checkoutItemSchema = z.object({
  variantId: z.string().trim().min(1).max(191),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutInputSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email().trim().max(254),
    phone: z.string().trim().min(7).max(32),
    address: z.string().trim().min(5).max(500),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    gaClientId: z.string().trim().max(100).nullable().optional(),
    analyticsConsent: z.boolean(),
    items: z.array(checkoutItemSchema).min(1).max(50),
  })
  .superRefine(({ items }, context) => {
    const variantIds = new Set<string>();

    for (const [index, item] of items.entries()) {
      if (variantIds.has(item.variantId)) {
        context.addIssue({
          code: "custom",
          message: "Each product variant may appear only once",
          path: ["items", index, "variantId"],
        });
      }
      variantIds.add(item.variantId);
    }
  });

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
