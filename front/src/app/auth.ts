export interface User {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private readonly accessTokenKey = "devflow_access_token";
  private readonly mockSessionKey = "devflow_mock_user";
  private readonly mockUsersKey = "devflow_mock_users";
  private readonly mockPasswordPrefix = "devflow_mock_pwd_";
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

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
        this.clearApiSession();
        this.currentUser = this.getMockSessionUser();
      }
    } else {
      this.currentUser = this.getMockSessionUser();
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
    } catch {
      const result = this.loginMock(email, password);
      if (result.success) {
        this.notify();
      }
      return result;
    }
  }

  private loginMock(email: string, password: string): { success: boolean; error?: string } {
    const storedUsers = this.getMockUsers();
    const user = storedUsers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        success: false,
        error: "No account found with this email",
      };
    }
    const storedPassword = localStorage.getItem(this.getMockPasswordKey(user.email));
    if (storedPassword !== password) {
      return { success: false, error: "Incorrect password" };
    }

    this.setMockSession(user);
    return { success: true };
  }

  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!name.trim()) {
      return { success: false, error: "Name is required" };
    }
    if (!email.trim() || !email.includes("@")) {
      return { success: false, error: "Valid email is required" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    try {
      const { authApi } = await import("./api/auth");
      const response = await authApi.signup({ name, email, password });
      this.setSession(response.accessToken, response.user);
      this.notify();
      return { success: true };
    } catch {
      const result = this.signupMock(name, email, password);
      if (result.success) {
        this.notify();
      }
      return result;
    }
  }

  private signupMock(name: string, email: string, password: string): { success: boolean; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getMockUsers();
    if (users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "An account with this email already exists" };
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
    };
    users.push(user);
    localStorage.setItem(this.mockUsersKey, JSON.stringify(users));
    localStorage.setItem(this.getMockPasswordKey(normalizedEmail), password);
    this.setMockSession(user);
    return { success: true };
  }

  async logout() {
    const token = this.getAccessToken();
    if (token) {
      try {
        const { authApi } = await import("./api/auth");
        await authApi.logout(token);
      } catch {
        // Ignore network errors for logout and clear local session anyway.
      }
    }
    this.clearSession();
    this.notify();
  }

  private setSession(accessToken: string, user: User) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.removeItem(this.mockSessionKey);
    this.currentUser = user;
  }

  private setMockSession(user: User) {
    this.clearApiSession();
    localStorage.setItem(this.mockSessionKey, JSON.stringify(user));
    this.currentUser = user;
  }

  private clearSession() {
    this.clearApiSession();
    localStorage.removeItem(this.mockSessionKey);
    this.currentUser = null;
  }

  private clearApiSession() {
    localStorage.removeItem(this.accessTokenKey);
  }

  private getMockSessionUser(): User | null {
    const raw = localStorage.getItem(this.mockSessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private getMockUsers(): User[] {
    const raw = localStorage.getItem(this.mockUsersKey);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw) as User[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private getMockPasswordKey(email: string): string {
    return `${this.mockPasswordPrefix}${email.toLowerCase()}`;
  }
}

export const authService = new AuthService();
