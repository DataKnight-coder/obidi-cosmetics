export type OrderItemRecord = {
  variantId: string;
  quantity: number;
};

export type ReservationRecord = {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  expiresAt: string;
  releasedAt: string | null;
  consumedAt: string | null;
};

export type ValidatedReservation = ReservationRecord;

export type ReservationValidationCode =
  | "MISSING_RESERVATION"
  | "EXPIRED_RESERVATION"
  | "RELEASED_RESERVATION"
  | "CONSUMED_RESERVATION"
  | "QUANTITY_MISMATCH"
  | "UNEXPECTED_RESERVATION"
  | "DUPLICATE_VARIANT"
  | "ORDER_NOT_PAYABLE";

export type ReservationValidationResult =
  | { ok: true; reservations: ValidatedReservation[] }
  | { ok: false; code: ReservationValidationCode; message: string };

const PAYABLE_ORDER_STATUSES = new Set(["PENDING", "PAYMENT_PENDING"]);

export function validatePaymentReservations(input: {
  orderId: string;
  orderStatus: string;
  orderItems: OrderItemRecord[];
  reservations: ReservationRecord[];
  now: Date;
}): ReservationValidationResult {
  if (!PAYABLE_ORDER_STATUSES.has(input.orderStatus)) {
    return { ok: false, code: "ORDER_NOT_PAYABLE", message: "Order is not payable" };
  }

  const itemsByVariant = new Map<string, OrderItemRecord>();
  for (const item of input.orderItems) {
    if (itemsByVariant.has(item.variantId)) {
      return { ok: false, code: "DUPLICATE_VARIANT", message: "Order contains duplicate variants" };
    }
    itemsByVariant.set(item.variantId, item);
  }

  const reservationsByVariant = new Map<string, ReservationRecord>();
  for (const reservation of input.reservations) {
    if (reservation.orderId !== input.orderId || !itemsByVariant.has(reservation.variantId)) {
      return { ok: false, code: "UNEXPECTED_RESERVATION", message: "Unexpected reservation" };
    }
    if (reservationsByVariant.has(reservation.variantId)) {
      return { ok: false, code: "UNEXPECTED_RESERVATION", message: "Duplicate reservation" };
    }
    reservationsByVariant.set(reservation.variantId, reservation);
  }

  const validated: ValidatedReservation[] = [];
  for (const item of input.orderItems) {
    const reservation = reservationsByVariant.get(item.variantId);
    if (!reservation) {
      return { ok: false, code: "MISSING_RESERVATION", message: "Reservation is missing" };
    }
    if (reservation.releasedAt !== null) {
      return { ok: false, code: "RELEASED_RESERVATION", message: "Reservation was released" };
    }
    if (reservation.consumedAt !== null) {
      return { ok: false, code: "CONSUMED_RESERVATION", message: "Reservation was consumed" };
    }
    if (reservation.quantity !== item.quantity) {
      return { ok: false, code: "QUANTITY_MISMATCH", message: "Reservation quantity differs" };
    }
    if (new Date(reservation.expiresAt).getTime() <= input.now.getTime()) {
      return { ok: false, code: "EXPIRED_RESERVATION", message: "Reservation expired" };
    }
    validated.push(reservation);
  }

  return { ok: true, reservations: validated };
}
