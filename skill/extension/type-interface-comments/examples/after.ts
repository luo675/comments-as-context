/**
 * Represents a paginated API response wrapper.
 * Used by all list-type endpoints in the public API.
 *
 * @template T - The item type returned in the data array
 */
interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];

  /** Total number of items across all pages (not just this page) */
  total: number;

  /** Current page number, 1-indexed */
  page: number;

  /** Number of items per page. Defaults to 20, max 100. */
  pageSize: number;

  /**
   * Cursor for the next page, if available.
   * null means this is the last page.
   */
  nextCursor: string | null;
}

/**
 * Represents the state of an order in the fulfillment workflow.
 *
 * Transitions:
 *   pending → confirmed → processing → shipped → delivered
 *   pending → cancelled          (customer-initiated)
 *   confirmed → cancelled        (admin-initiated, before processing starts)
 *
 * Rules:
 *   - Once shipped, an order cannot transition to any other status.
 *   - Cancellation after confirmed requires a refund.
 */
type OrderStatus =
  | 'pending'    // Order placed, awaiting payment confirmation
  | 'confirmed'  // Payment confirmed, preparing for fulfillment
  | 'processing' // Items being picked and packed
  | 'shipped'    // Handed to carrier, tracking available
  | 'delivered'  // Confirmed delivered by carrier
  | 'cancelled'; // Order cancelled before shipping

/**
 * Standard error response body for all API endpoints.
 * Use `code` for programmatic handling, `message` for UI display.
 */
interface ApiError {
  /** Machine-readable error code (e.g., "INSUFFICIENT_STOCK") */
  code: string;
  /** Human-readable error description, safe to display to users */
  message: string;
  /** Additional context (e.g., field-level validation errors) */
  details?: Record<string, unknown>;
}

/**
 * Discriminated union for operation results.
 * Eliminates try/catch in favor of type-safe error handling.
 *
 * @template T - The success value type
 */
type Result<T> =
  | { ok: true; data: T }      // Operation completed successfully
  | { ok: false; error: ApiError }; // Operation failed with a structured error

/**
 * Input payload for the create order endpoint.
 * All fields are required unless marked optional.
 */
interface CreateOrderInput {
  /** Line items to order. Must contain at least one item. */
  items: { sku: string; quantity: number }[];

  /** Destination for physical delivery */
  shippingAddress: {
    street: string;
    city: string;
    /** ISO 3166-1 alpha-2 country code */
    country: string;
    postalCode: string;
  };

  /** Stripe PaymentMethod ID from the frontend */
  paymentMethodId: string;

  /** Optional promotional coupon code */
  couponCode?: string;
}
