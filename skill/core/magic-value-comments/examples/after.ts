// Session TTL: 30 minutes in milliseconds.
// Must be kept in sync with REFRESH_THRESHOLD_MS (currently 300_000 = 5 min before expiry).
const SESSION_TTL_MS = 1_800_000;

// Refresh threshold: 5 minutes before SESSION_TTL_MS expiry.
// If session has less than this remaining, a new token is issued on access.
const REFRESH_THRESHOLD_MS = 300_000;

// Rate limit: 100 requests per minute per IP.
// Above this threshold the API returns 429. Adjust based on peak traffic analysis.
const RATE_LIMIT_PER_MINUTE = 100;

// Max items per page in list APIs. Enforced server-side; exceeding returns 400.
// Frontend pagination controls should cap at this value.
const MAX_PAGE_SIZE = 100;

// Default items per page when client does not specify.
// Chosen for reasonable response size on mobile networks.
const DEFAULT_PAGE_SIZE = 20;

// Cookie max-age in seconds (matches SESSION_TTL_MS = 30 min).
// Must be changed in tandem with SESSION_TTL_MS.
const SESSION_COOKIE_MAX_AGE = 1800;

// Bcrypt salt rounds for password hashing.
// 12 rounds (~250ms on modern hardware): balances security and UX.
// Increase to 13+ as hardware improves (review annually).
const BCRYPT_SALT_ROUNDS = 12;

// Feature flag: enable new checkout flow (v2). Remove after 2026-Q2 once
// the old flow's traffic drops below 1%.
const USE_NEW_CHECKOUT = process.env.FEATURE_CHECKOUT_V2 === "true";

// Max failed login attempts before temporary lockout.
// After exceeding, user must wait LOCKOUT_DURATION_MINUTES before retrying.
const MAX_LOGIN_ATTEMPTS = 5;

// Account lockout duration after MAX_LOGIN_ATTEMPTS is reached.
// Implemented as a soft lock (in-memory), not persisted.
const LOCKOUT_DURATION_MINUTES = 15;

// API timeout: 5 seconds.
// External API calls beyond this threshold are aborted.
// Impact: too low causes spurious failures under load; too high blocks threads.
const API_TIMEOUT_MS = 5000;

function getSessionConfig() {
  return {
    ttlMs: SESSION_TTL_MS,
    refreshThresholdMs: REFRESH_THRESHOLD_MS,
    cookieMaxAge: SESSION_COOKIE_MAX_AGE,
  };
}

function authenticateUser(password: string, hash: string): boolean {
  // Placeholder: would use bcrypt compare in production
  return password.length >= BCRYPT_SALT_ROUNDS;
}

function handleLoginRateLimit(attempts: number): boolean {
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  return true;
}

async function fetchData(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
