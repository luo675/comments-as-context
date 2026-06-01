interface EmailService {
  sendConfirmation(orderId: string): Promise<void>;
}

interface EventBus {
  publish(event: object): Promise<void>;
}

const emailService: EmailService = { sendConfirmation: async (id) => {} };
const eventBus: EventBus = { publish: async (e) => { console.log("Published", e); } };

let orderStatuses = new Map<string, string>();
let productInventory = new Map<string, number>();

/**
 * Confirms an order: updates status, deducts inventory, notifies customer.
 *
 * @sideEffects
 *   - MODIFIES orderStatuses map — sets status to "confirmed"
 *   - MODIFIES productInventory map — deducts quantities for each item
 *   - SENDS email via EmailService (external SMTP)
 *   - PUBLISHES OrderConfirmedEvent to message bus
 */
async function confirmOrder(orderId: string, items: { sku: string; qty: number }[]): Promise<void> {
  // Database write: update order status
  orderStatuses.set(orderId, "confirmed");
  // Inventory deduction: subtract ordered quantities
  for (const item of items) {
    const current = productInventory.get(item.sku) ?? 0;
    productInventory.set(item.sku, current - item.qty);
  }
  // External call: send confirmation email (fire-and-forget)
  await emailService.sendConfirmation(orderId);
  // Event publish: notify downstream services
  await eventBus.publish({ type: "OrderConfirmed", orderId });
}

/**
 * Cancels an order and notifies downstream services.
 *
 * @sideEffects
 *   - MODIFIES orderStatuses map — sets status to "cancelled"
 *   - PUBLISHES OrderCancelledEvent to message bus
 */
async function cancelOrder(orderId: string): Promise<void> {
  orderStatuses.set(orderId, "cancelled");
  await eventBus.publish({ type: "OrderCancelled", orderId });
}

/**
 * Applies theme and persists preference to localStorage.
 *
 * @sideEffects
 *   - WRITES to localStorage ("theme" key)
 *   - MODIFIES document.documentElement dataset (DOM)
 */
async function applyTheme(theme: "light" | "dark"): Promise<void> {
  // Persist preference
  localStorage.setItem("theme", theme);
  // DOM mutation: toggle data attribute on root element
  document.documentElement.dataset.theme = theme;
}

/**
 * Permanently deletes a user and purges associated audit data.
 *
 * @sideEffects
 *   - IRREVERSIBLE: DELETES user record from production database
 *   - IRREVERSIBLE: PURGES audit trail for the user
 *
 * Prerequisites:
 *   - 30-day grace period must have elapsed
 *   - User must have been soft-deleted first
 */
async function purgeUserData(userId: string): Promise<void> {
  // IRREVERSIBLE: Delete user — no soft-delete recovery
  await fetch(`/api/users/${userId}`, { method: "DELETE" });
  // IRREVERSIBLE: Purge audit trail — cannot be reconstructed
  await fetch(`/api/audit/purge?userId=${userId}`, { method: "POST" });
}
