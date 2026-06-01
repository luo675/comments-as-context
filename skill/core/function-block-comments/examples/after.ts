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

/**
 * Processes a customer order through the full fulfillment pipeline:
 * validation → inventory check → pricing → stock deduction → shipping → notification.
 *
 * @param items - Line items in the shopping cart (must be non-empty)
 * @param customerId - Unique identifier for the purchasing customer
 * @param discountInfo - Applicable discounts (member tier, coupon, seasonal)
 * @returns Order confirmation with ID, final total, and estimated delivery date
 * @throws {ValidationError} if items array is empty or any item has invalid quantity
 * @throws {InsufficientStockError} if any item exceeds available inventory
 */
async function processOrder(
  items: OrderItem[],
  customerId: string,
  discountInfo: DiscountInfo
): Promise<{ orderId: string; totalCents: number; estimatedDelivery: Date }> {
  // ── Validation ──────────────────────────────────────────
  if (!items.length) throw new Error("Order must contain at least one item");
  for (const item of items) {
    if (item.quantity <= 0) throw new Error(`Invalid quantity for ${item.sku}`);
    const stock = await checkStock(item.sku);
    if (stock < item.quantity) throw new Error(`Insufficient stock for ${item.sku}`);
  }

  // ── Pricing: apply discounts in order ──────────────────
  // Membership discount first (largest scope), then coupon, then seasonal
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

  // ── Inventory: deduct stock for each item ──────────────
  const inventoryDeductions = items.map(item => deductStock(item.sku, item.quantity));
  await Promise.all(inventoryDeductions);

  // ── Shipping: create logistics order ───────────────────
  const shippingOrder = await createShippingOrder(customerId, items);
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  // ── Notification: inform customer of order confirmation ─
  await notifyCustomer(customerId, { orderId: shippingOrder.id, totalCents, estimatedDelivery });

  return { orderId: shippingOrder.id, totalCents, estimatedDelivery };
}

/**
 * Checks available stock for a given SKU.
 * @param sku - Product identifier
 * @returns Current available quantity
 */
async function checkStock(sku: string): Promise<number> {
  return Promise.resolve(100);
}

/**
 * Deducts the specified quantity from inventory.
 * @param sku - Product identifier
 * @param quantity - Number of units to deduct
 */
async function deductStock(sku: string, quantity: number): Promise<void> {
  return Promise.resolve();
}

/**
 * Creates a shipping order in the logistics system.
 * @param customerId - Customer placing the order
 * @param items - Items to be shipped
 * @returns The created shipping order with system-generated ID
 */
async function createShippingOrder(customerId: string, items: OrderItem[]): Promise<{ id: string }> {
  return Promise.resolve({ id: "ord_001" });
}

/**
 * Sends order confirmation notification to the customer.
 * @param customerId - Target customer
 * @param details - Order details to include in the notification
 */
async function notifyCustomer(customerId: string, details: object): Promise<void> {
  return Promise.resolve();
}
