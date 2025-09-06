export const usd = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2, // always show cents
    maximumFractionDigits: 2, // keep 2 decimals, no rounding to integer
  }).format(Number(n || 0));
