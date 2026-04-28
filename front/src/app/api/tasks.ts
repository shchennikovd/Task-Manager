import { request } from "./client";
import type { TaskDto } from "./types";

export interface CreateTaskRequest {
  title: string;
  description: string;
  date: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "expired";
  color?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  date?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "completed" | "expired";
  color?: string;
}

export const tasksApi = {
  list(token: string) {
    return request<TaskDto[]>("/tasks", {
      method: "GET",
      token,
    });
  },

  create(payload: CreateTaskRequest, token: string) {
    return request<TaskDto>("/tasks", {
      method: "POST",
      body: payload,
      token,
    });
  },

  update(id: string, payload: UpdateTaskRequest, token: string) {
    return request<TaskDto>(`/tasks/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    });
  },

  delete(id: string, token: string) {
    return request<void>(`/tasks/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
