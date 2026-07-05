export interface User {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private readonly accessTokenKey = "devflow_access_token";
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    window.addEventListener("auth:unauthorized", () => {
      this.clearSession();
      this.notify();
    });
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  async initialize(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        const { authApi } = await import("./api/auth");
        const user = await authApi.me(token);
        this.currentUser = user;
      } catch {
        this.clearSession();
      }
    }
    this.notify();
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { authApi } = await import("./api/auth");
      const response = await authApi.login({ email, password });
      this.setSession(response.accessToken, response.user);
      this.notify();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { success: false, error: message };
    }
  }

  async signup(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!name.trim()) return { success: false, error: "Name is required" };
    if (!email.trim() || !email.includes("@")) return { success: false, error: "Valid email is required" };
    if (password.length < 8) return { success: false, error: "Password must be at least 8 characters" };
    if (password !== confirmPassword) return { success: false, error: "Passwords do not match" };

    try {
      const { authApi } = await import("./api/auth");
      const response = await authApi.signup({ name, email, password });
      this.setSession(response.accessToken, response.user);
      this.notify();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      return { success: false, error: message };
    }
  }

  async logout(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        const { authApi } = await import("./api/auth");
        await authApi.logout(token);
      } catch (error) {
        console.warn("Logout API call failed, clearing session anyway", error);
      }
    }
    this.clearSession();
    this.notify();
  }

  private setSession(accessToken: string, user: User) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    this.currentUser = user;
  }

  private clearSession() {
    localStorage.removeItem(this.accessTokenKey);
    this.currentUser = null;
  }
}

export const authService = new AuthService();