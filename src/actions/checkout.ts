"use server";

import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack/initialize";
import {
  checkoutInputSchema,
  type CheckoutInput,
} from "@/lib/validation/checkout";
import crypto from "crypto";

export type { CheckoutInput } from "@/lib/validation/checkout";

export async function processCheckout(data: CheckoutInput) {
  try {
    const validationResult = checkoutInputSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, error: "Invalid checkout details." };
    }

    const checkout = validationResult.data;

    // 1. Fetch current prices to ensure they haven't been tampered with
    const variantIds = checkout.items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    if (variants.length !== variantIds.length) {
      return { success: false, error: "One or more products were not found" };
    }

    let totalKobo = 0;
    const orderItemsData = [];

    // 2. Validate stock and calculate total
    for (const item of checkout.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) continue;

      if (variant.stockQuantity - variant.reservedQuantity < item.quantity) {
        return { success: false, error: `Insufficient stock for ${variant.name}` };
      }

      const price = Number(variant.discountPriceKobo || variant.priceKobo);
      totalKobo += price * item.quantity;

      orderItemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        priceKobo: price, // lock in the price at checkout
      });
    }

    const shippingAddress = `${checkout.address}, ${checkout.city}, ${checkout.state}`;
    const customerName = `${checkout.firstName} ${checkout.lastName}`;
    const expectedAmountKobo = totalKobo;

    // 3. Reserve Inventory and Create Order/Payment atomically
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 mins
    const paymentRef = crypto.randomBytes(16).toString("hex");

    const transactionOps: any[] = [];

    // Queue inventory reservations updates
    for (const item of checkout.items) {
      transactionOps.push(
        prisma.$executeRaw`UPDATE ProductVariant SET reservedQuantity = reservedQuantity + ${item.quantity} WHERE id = ${item.variantId}`
      );
    }

    // Queue order, items, reservations, and payment creation
    transactionOps.push(
      prisma.order.create({
        data: {
          customerName,
          customerEmail: checkout.email,
          customerPhone: checkout.phone,
          shippingAddress,
          totalKobo,
          gaClientId: checkout.gaClientId,
          analyticsConsent: checkout.analyticsConsent,
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
          reservations: {
            create: checkout.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              expiresAt,
            })),
          },
          payments: {
            create: {
              reference: paymentRef,
              expectedAmountKobo,
              currency: "NGN",
              provider: "PAYSTACK",
              status: "PENDING",
            },
          },
        },
        include: {
          payments: true,
        },
      })
    );

    const txResult = await prisma.$transaction(transactionOps);
    const order = txResult[txResult.length - 1];
    const payment = order.payments[0];

    // 4. Initialize Paystack Transaction
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
       console.warn("APP_URL not set. Falling back to localhost.");
    }

    const paystackRes = await initializeTransaction({
      email: checkout.email,
      amount: expectedAmountKobo.toString(),
      currency: "NGN",
      reference: payment.reference,
      callback_url: `${appUrl || "http://localhost:3000"}/checkout/callback`,
      metadata: JSON.stringify({
        orderId: order.id,
        paymentId: payment.id,
      }),
    });

    if (!paystackRes.status || !paystackRes.data) {
      return { success: false, error: "Failed to initialize payment gateway." };
    }

    // 5. Update Payment with Paystack URL
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        accessCode: paystackRes.data.access_code,
        authorizationUrl: paystackRes.data.authorization_url,
      },
    });

    return { success: true, url: paystackRes.data.authorization_url };
  } catch (error: any) {
    console.error("Checkout Error:", error.message);
    if (error.message.includes("PAYSTACK_SECRET_KEY")) {
       return { success: false, error: "Paystack is not configured." };
    }
    return { success: false, error: "An error occurred during checkout." };
  }
}
