import { describe, expect, test } from "vitest";
import { validatePaymentReservations, type ReservationRecord } from "@/lib/payments/reservation-validation";

const future = new Date(Date.now() + 60_000).toISOString();
const baseReservation: ReservationRecord = {
  id: "reservation-1",
  orderId: "order-1",
  variantId: "variant-1",
  quantity: 2,
  expiresAt: future,
  releasedAt: null,
  consumedAt: null,
};

function validate(reservations: ReservationRecord[]) {
  return validatePaymentReservations({
    orderId: "order-1",
    orderStatus: "PENDING",
    orderItems: [{ variantId: "variant-1", quantity: 2 }],
    reservations,
    now: new Date(),
  });
}

describe("payment reservation invariants", () => {
  test("accepts one matching active reservation per order item", () => {
    expect(validate([baseReservation]).ok).toBe(true);
  });

  test.each([
    ["MISSING_RESERVATION", []],
    ["QUANTITY_MISMATCH", [{ ...baseReservation, quantity: 1 }]],
    ["EXPIRED_RESERVATION", [{ ...baseReservation, expiresAt: new Date(0).toISOString() }]],
    ["RELEASED_RESERVATION", [{ ...baseReservation, releasedAt: new Date().toISOString() }]],
    ["CONSUMED_RESERVATION", [{ ...baseReservation, consumedAt: new Date().toISOString() }]],
  ])("returns %s", (code, reservations) => {
    const result = validate(reservations as ReservationRecord[]);
    expect(result).toMatchObject({ ok: false, code });
  });

  test("rejects an unexpected extra reservation", () => {
    const result = validate([
      baseReservation,
      { ...baseReservation, id: "reservation-2", variantId: "variant-2" },
    ]);
    expect(result).toMatchObject({ ok: false, code: "UNEXPECTED_RESERVATION" });
  });

  test("rejects duplicate order-item variants", () => {
    const result = validatePaymentReservations({
      orderId: "order-1",
      orderStatus: "PENDING",
      orderItems: [
        { variantId: "variant-1", quantity: 1 },
        { variantId: "variant-1", quantity: 1 },
      ],
      reservations: [baseReservation],
      now: new Date(),
    });
    expect(result).toMatchObject({ ok: false, code: "DUPLICATE_VARIANT" });
  });
});
