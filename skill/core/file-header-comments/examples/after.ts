/**
 * @file Manages user authentication flow — login, logout, token refresh.
 *       Acts as the single entry point for all auth-related operations.
 *
 * @related
 *   - services/api-client.ts        // HTTP layer for auth endpoints
 *   - stores/auth-store.ts          // Reactive auth state management
 *   - components/LoginForm.tsx      // UI that calls the login method
 *   - middleware/auth-guard.ts      // Route guard that reads session
 *
 * @updated 2026-06-01
 */

export class AuthService {
  private tokenStore = new Map<string, { token: string; expiresAt: number }>();

  async login(email: string, password: string): Promise<string> {
    const user = await this.verifyCredentials(email, password);
    const token = this.generateToken(user.id);
    this.tokenStore.set(user.id, { token, expiresAt: Date.now() + 3600000 });
    return token;
  }

  async refresh(token: string): Promise<string> {
    const payload = this.decodeToken(token);
    const stored = this.tokenStore.get(payload.sub);
    if (!stored || stored.token !== token) throw new Error("Invalid token");
    const newToken = this.generateToken(payload.sub);
    this.tokenStore.set(payload.sub, { token: newToken, expiresAt: Date.now() + 3600000 });
    return newToken;
  }

  async logout(userId: string): Promise<void> {
    this.tokenStore.delete(userId);
  }

  private verifyCredentials(email: string, password: string): Promise<{ id: string }> {
    if (email === "admin@example.com" && password === "secret") {
      return Promise.resolve({ id: "usr_001" });
    }
    return Promise.reject(new Error("Invalid credentials"));
  }

  private generateToken(sub: string): string {
    return Buffer.from(JSON.stringify({ sub, iat: Date.now() })).toString("base64");
  }

  private decodeToken(token: string): { sub: string } {
    return JSON.parse(Buffer.from(token, "base64").toString());
  }
}
