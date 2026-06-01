import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DECISION: Use raw SQL instead of ORM for this bulk insert.
//   WHY: TypeORM's save() generates N+1 queries for 10k+ rows.
//        Raw SQL INSERT with multiple VALUES is ~40x faster in benchmarks.
//   CONTEXT: PG 16, Node 22, tested with 50k rows (2026-03).
//   TRADE-OFF: Loses ORM-level type validation. Validate via Zod upstream.
async function bulkInsertInventory(items: { sku: string; warehouseId: string; quantity: number }[]): Promise<void> {
  const values = items.map(i => `('${i.sku}', '${i.warehouseId}', ${i.quantity})`).join(",\n");
  await prisma.$executeRawUnsafe(`
    INSERT INTO inventory_items (sku, warehouse_id, quantity)
    VALUES ${values}
  `);
}

// DECISION: Use polling instead of WebSocket for real-time updates.
//   WHY: Our deployment environment (AWS Lambda) doesn't support
//        persistent connections. WebSocket would require API Gateway
//        which adds ~$30/month per environment.
//   CONTEXT: Serverless architecture on Lambda + API Gateway (2026-01).
//   CONSIDERED: SSE (sse-channel) — rejected because client requires
//               bidirectional communication for acknowledgment.
//   TRADE-OFF: 2-second polling latency; acceptable for device status
//              which rarely changes more than once per minute.
async function getRealTimeUpdates(deviceId: string): Promise<object> {
  while (true) {
    const result = await fetch(`https://api.example.com/devices/${deviceId}/updates?poll=1`);
    const data = await result.json();
    if (data.updates.length > 0) return data;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// DECISION: Flat rate per gram + international surcharge.
//   WHY: Simpler than zone-based tiers. Our data shows 95% of shipments
//        are within 3 zones, so tier complexity adds no pricing accuracy.
//   CONTEXT: Initial pricing model launched 2025-06. Revisit if we expand
//            to more than 10 shipping zones.
function calculateShippingCost(weightGrams: number, zone: string): number {
  return weightGrams * 0.05 + (zone === "international" ? 10 : 0);
}
