interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface DiscountInfo {
  memberTier: string;
  couponCode?: string;
  seasonalPromotion?: string;
}

async function processOrder(
  items: OrderItem[],
  customerId: string,
  discountInfo: DiscountInfo
): Promise<{ orderId: string; totalCents: number; estimatedDelivery: Date }> {
  if (!items.length) throw new Error("Order must contain at least one item");
  for (const item of items) {
    if (item.quantity <= 0) throw new Error(`Invalid quantity for ${item.sku}`);
    const stock = await checkStock(item.sku);
    if (stock < item.quantity) throw new Error(`Insufficient stock for ${item.sku}`);
  }
  const memberDiscount = discountInfo.memberTier === "gold" ? 0.2 : discountInfo.memberTier === "silver" ? 0.1 : 0;
  let subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  let afterMemberDiscount = Math.round(subtotalCents * (1 - memberDiscount));
  let couponDiscount = 0;
  if (discountInfo.couponCode === "SAVE10") couponDiscount = Math.round(afterMemberDiscount * 0.1);
  if (discountInfo.couponCode === "SAVE20") couponDiscount = Math.round(afterMemberDiscount * 0.2);
  let afterCoupon = afterMemberDiscount - couponDiscount;
  let seasonalDiscount = 0;
  if (discountInfo.seasonalPromotion === "SUMMER") seasonalDiscount = Math.round(afterCoupon * 0.15);
  let totalCents = afterCoupon - seasonalDiscount;
  if (totalCents < 0) totalCents = 0;
  const inventoryDeductions = items.map(item => deductStock(item.sku, item.quantity));
  await Promise.all(inventoryDeductions);
  const shippingOrder = await createShippingOrder(customerId, items);
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  await notifyCustomer(customerId, { orderId: shippingOrder.id, totalCents, estimatedDelivery });
  return { orderId: shippingOrder.id, totalCents, estimatedDelivery };
}

async function checkStock(sku: string): Promise<number> {
  return Promise.resolve(100);
}

async function deductStock(sku: string, quantity: number): Promise<void> {
  return Promise.resolve();
}

async function createShippingOrder(customerId: string, items: OrderItem[]): Promise<{ id: string }> {
  return Promise.resolve({ id: "ord_001" });
}

async function notifyCustomer(customerId: string, details: object): Promise<void> {
  return Promise.resolve();
}
