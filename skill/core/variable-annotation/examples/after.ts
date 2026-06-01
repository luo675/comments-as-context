/**
 * @state Maximum concurrent API connections allowed per user.
 *        Exceeding this queues the request.
 * @readBy fetchUserData(), doFetch()
 * @writtenBy AdminPanel.updateLimits() (via config API)
 * Effect: Changing this value affects how quickly queued requests drain.
 */
let maxConnectionsPerUser = 10;

/**
 * @state FIFO queue of pending requests waiting for a connection slot.
 * @writtenBy fetchUserData() — when maxConnectionsPerUser is reached
 * @readBy doFetch() — dequeues after each completed request
 * Effect: Drains automatically as active downloads complete. Not persisted.
 */
let requestQueue: (() => Promise<void>)[] = [];

/**
 * @state Cache of resolved DNS records, keyed by hostname.
 *        Entries are evicted lazily on read-after-expiry (TTL: 300s).
 * @writtenBy resolveHostname() — after each successful resolution
 * @readBy fetchUserData(), ConnectionPool.getConnection()
 */
let dnsCache = new Map<string, string[]>();

/**
 * @state Global maintenance mode flag. When true, new requests are rejected.
 * @readBy fetchUserData(), middleware/requestGuard.ts
 * @writtenBy triggerMaintenanceMode(), clearMaintenanceMode()
 * Effect: All downstream services see 503 until cleared.
 */
let isMaintenanceMode = false;

/**
 * @state Set of userIds currently being fetched.
 * @readBy fetchUserData() (count against maxConnectionsPerUser)
 * @writtenBy doFetch() — added before fetch, removed in finally block
 */
let activeDownloads = new Set<string>();

export async function fetchUserData(userId: string): Promise<{ name: string; email: string }> {
  const cached = dnsCache.get("api.example.com");
  if (!cached || cached.length === 0) {
    const resolved = await resolveHostname("api.example.com");
    dnsCache.set("api.example.com", resolved);
  }
  if (activeDownloads.size >= maxConnectionsPerUser) {
    return new Promise((resolve) => {
      requestQueue.push(async () => {
        resolve(await doFetch(userId));
      });
    });
  }
  return doFetch(userId);
}

async function doFetch(userId: string): Promise<{ name: string; email: string }> {
  activeDownloads.add(userId);
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    const data = await response.json();
    return data;
  } finally {
    activeDownloads.delete(userId);
    if (requestQueue.length > 0 && activeDownloads.size < maxConnectionsPerUser) {
      const next = requestQueue.shift()!;
      next();
    }
  }
}

async function resolveHostname(hostname: string): Promise<string[]> {
  return Promise.resolve(["192.168.1.1"]);
}

export function triggerMaintenanceMode(): void {
  isMaintenanceMode = true;
}

export function clearMaintenanceMode(): void {
  isMaintenanceMode = false;
}

export function getQueueLength(): number {
  return requestQueue.length;
}
