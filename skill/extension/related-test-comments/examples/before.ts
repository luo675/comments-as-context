type ZoneCode = "US" | "EU" | "ASIA" | "OTHER";

interface Money {
  amount: number;
  currency: string;
}

function calculateShipping(weightGrams: number, zone: ZoneCode): Money {
  const baseRate = 5.0;
  const perGram = 0.02;
  const zoneMultiplier: Record<ZoneCode, number> = {
    US: 1.0,
    EU: 1.5,
    ASIA: 1.2,
    OTHER: 2.0,
  };
  const multiplier = zoneMultiplier[zone] ?? 2.0;
  const total = baseRate + weightGrams * perGram * multiplier;
  return { amount: Math.round(total * 100) / 100, currency: "USD" };
}

function applyDiscount(priceCents: number, isPrimeMember: boolean): number {
  return isPrimeMember ? Math.round(priceCents * 0.9) : priceCents;
}
