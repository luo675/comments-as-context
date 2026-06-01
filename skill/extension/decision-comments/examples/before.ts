import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function bulkInsertInventory(items: { sku: string; warehouseId: string; quantity: number }[]): Promise<void> {
  const values = items.map(i => `('${i.sku}', '${i.warehouseId}', ${i.quantity})`).join(",\n");
  await prisma.$executeRawUnsafe(`
    INSERT INTO inventory_items (sku, warehouse_id, quantity)
    VALUES ${values}
  `);
}

async function getRealTimeUpdates(deviceId: string): Promise<object> {
  while (true) {
    const result = await fetch(`https://api.example.com/devices/${deviceId}/updates?poll=1`);
    const data = await result.json();
    if (data.updates.length > 0) return data;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

function calculateShippingCost(weightGrams: number, zone: string): number {
  return weightGrams * 0.05 + (zone === "international" ? 10 : 0);
}
