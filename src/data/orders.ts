"use server";

import { prisma } from "@/lib/prisma";

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: {
    variantId: string;
    quantity: number;
    priceKobo: number;
  }[];
  totalKobo: number;
};

export async function createOrder(data: OrderInput) {
  try {
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        totalKobo: data.totalKobo,
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            priceKobo: item.priceKobo,
          })),
        },
      },
    });
    
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order." };
  }
}
