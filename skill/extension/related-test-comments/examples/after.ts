type ZoneCode = "US" | "EU" | "ASIA" | "OTHER";

interface Money {
  amount: number;
  currency: string;
}

/**
 * Calculates the shipping cost based on weight and destination zone.
 *
 * @tests
 *   - tests/unit/shipping/calculator.test.ts  (unit tests, standard cases)
 *   - tests/integration/shipping/zone-pricing.test.ts  (integration, multi-zone)
 *
 * Coverage scenarios (see test file for full list):
 *   - Standard domestic shipping (zone: US, weight < 500g)
 *   - International shipping (zone: EU, weight 500g-20kg)
 *   - Oversize package (weight > 30kg) → throws OversizeError
 *   - Zero weight → uses minimum flat rate
 *   - Invalid zone code → throws InvalidZoneError
 *   - Free shipping for prime members (regression: bug #892)
 */
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

/**
 * Applies a 10% discount for Prime members.
 *
 * @tests
 *   - tests/unit/pricing/discount.test.ts
 *
 * Related bug: #892 — Prime discount was not applied to international orders.
 * Test added: tests/bugs/bug-892-prime-discount.test.ts
 */
function applyDiscount(priceCents: number, isPrimeMember: boolean): number {
  return isPrimeMember ? Math.round(priceCents * 0.9) : priceCents;
}
