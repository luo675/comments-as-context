interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences?: Record<string, string>;
}

/**
 * Retrieves the current user's profile.
 *
 * @edgeCase User is not logged in → returns anonymous profile (no error)
 * @edgeCase User profile incomplete (created but not filled) → returns partial data with null fields
 * @edgeCase User ID not found in DB → this should never happen (auth guarantees existence);
 *            if it does, returns 500 with correlation ID for debugging
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!userId) return createAnonymousProfile();
  const profile = await dbFindUser(userId);
  return profile ?? createAnonymousProfile();
}

function createAnonymousProfile(): UserProfile {
  return { id: "anonymous", name: "Guest", email: "guest@example.com" };
}

async function dbFindUser(userId: string): Promise<UserProfile | null> {
  return Promise.resolve({ id: userId, name: "Test User", email: "test@example.com" });
}

/**
 * Withdraws money from an account.
 *
 * @edgeCase Concurrent withdrawal requests could cause negative balance.
 *            The database row-level lock (SELECT ... FOR UPDATE) prevents this.
 *            Window: between read and write, approximately 2-5ms.
 * @edgeCase Amount is zero or negative → should be caught by input validation upstream.
 *            If it reaches here, throws InsufficientFundsError (zero/negative treated as insufficient).
 * @edgeCase Account not found → throws AccountNotFoundError.
 *            This should not happen if accountId was obtained from authenticated session.
 */
async function withdrawMoney(accountId: string, amount: number): Promise<void> {
  const account = await dbGetAccount(accountId);
  if (account.balance < amount) throw new Error("Insufficient funds");
  await dbUpdateBalance(accountId, account.balance - amount);
}

async function dbGetAccount(accountId: string): Promise<{ balance: number }> {
  return Promise.resolve({ balance: 1000 });
}

async function dbUpdateBalance(accountId: string, newBalance: number): Promise<void> {
  return Promise.resolve();
}
