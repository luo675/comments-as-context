interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  nextCursor: string | null;
}

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

interface CreateOrderInput {
  items: { sku: string; quantity: number }[];
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethodId: string;
  couponCode?: string;
}
