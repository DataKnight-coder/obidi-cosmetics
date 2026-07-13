export function formatNairaFromKobo(amountKobo: number | bigint): string {
  const amount = Number(amountKobo) / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
