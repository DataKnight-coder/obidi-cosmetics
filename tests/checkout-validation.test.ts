import { describe, expect, test } from "vitest";
import { checkoutInputSchema } from "@/lib/validation/checkout";

const validCheckout = {
  firstName: "Ada",
  lastName: "Okafor",
  email: "ada@example.com",
  phone: "+2348012345678",
  address: "12 Example Street",
  city: "Lagos",
  state: "Lagos",
  gaClientId: "123.456",
  analyticsConsent: true,
  items: [{ variantId: "variant-1", quantity: 1 }],
};

describe("checkout input validation", () => {
  test("accepts valid checkout details", () => {
    expect(checkoutInputSchema.safeParse(validCheckout).success).toBe(true);
  });

  test.each([0, -1, 1.5, 100])("rejects unsafe quantity %s", (quantity) => {
    const result = checkoutInputSchema.safeParse({
      ...validCheckout,
      items: [{ variantId: "variant-1", quantity }],
    });

    expect(result.success).toBe(false);
  });

  test("rejects duplicate variant lines", () => {
    const result = checkoutInputSchema.safeParse({
      ...validCheckout,
      items: [
        { variantId: "variant-1", quantity: 1 },
        { variantId: "variant-1", quantity: 2 },
      ],
    });

    expect(result.success).toBe(false);
  });

  test("rejects invalid customer details", () => {
    const result = checkoutInputSchema.safeParse({
      ...validCheckout,
      email: "not-an-email",
      address: "",
    });

    expect(result.success).toBe(false);
  });
});
