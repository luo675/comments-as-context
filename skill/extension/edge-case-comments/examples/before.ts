interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences?: Record<string, string>;
}

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
