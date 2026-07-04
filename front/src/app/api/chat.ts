import { request } from "./client";

export interface ChatRequest {
  description: string;
}

export interface ChatResponse {
  suggestions: string[];
}

export const chatApi = {
  sendMessage(payload: ChatRequest, token?: string) {
    console.log("CHAT TOKEN:", token);
    return request<ChatResponse>("/ai/suggest", {
      method: "POST",
      body: payload,
      token,
    });
  },
};