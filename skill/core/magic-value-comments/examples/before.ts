const SESSION_TTL_MS = 1_800_000;
const REFRESH_THRESHOLD_MS = 300_000;
const RATE_LIMIT_PER_MINUTE = 100;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const SESSION_COOKIE_MAX_AGE = 1800;
const BCRYPT_SALT_ROUNDS = 12;
const USE_NEW_CHECKOUT = process.env.FEATURE_CHECKOUT_V2 === "true";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
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
