import { request } from "./client";
import type { AuthResponseDto, UserDto } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login(payload: LoginRequest) {
    return request<AuthResponseDto>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  signup(payload: SignupRequest) {
    return request<AuthResponseDto>("/auth/signup", {
      method: "POST",
      body: payload,
    });
  },

  me(token: string) {
    return request<UserDto>("/auth/me", {
      method: "GET",
      token,
    });
  },

  logout(token: string | null) {
    return request<void>("/auth/logout", {
      method: "POST",
      token,
    });
  },
};
