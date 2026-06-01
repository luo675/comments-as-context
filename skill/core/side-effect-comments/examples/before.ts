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

async function confirmOrder(orderId: string, items: { sku: string; qty: number }[]): Promise<void> {
  orderStatuses.set(orderId, "confirmed");
  for (const item of items) {
    const current = productInventory.get(item.sku) ?? 0;
    productInventory.set(item.sku, current - item.qty);
  }
  await emailService.sendConfirmation(orderId);
  await eventBus.publish({ type: "OrderConfirmed", orderId });
}

async function cancelOrder(orderId: string): Promise<void> {
  orderStatuses.set(orderId, "cancelled");
  await eventBus.publish({ type: "OrderCancelled", orderId });
}

async function applyTheme(theme: "light" | "dark"): Promise<void> {
  localStorage.setItem("theme", theme);
  document.documentElement.dataset.theme = theme;
}

async function purgeUserData(userId: string): Promise<void> {
  await fetch(`/api/users/${userId}`, { method: "DELETE" });
  await fetch(`/api/audit/purge?userId=${userId}`, { method: "POST" });
}
