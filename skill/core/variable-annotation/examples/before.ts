let maxConnectionsPerUser = 10;

let requestQueue: (() => Promise<void>)[] = [];

let dnsCache = new Map<string, string[]>();

let isMaintenanceMode = false;

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
