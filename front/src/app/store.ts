import { Task, ChatMessage } from "./types";
import { authService } from "./auth";
import { tasksApi } from "./api/tasks";
import type { TaskDto } from "./api/types";

class TaskStore {
  private tasks: Task[] = [];
  private listeners: Set<() => void> = new Set();
  private isLoaded = false;

  constructor() {
    if (authService.isAuthenticated()) {
      void this.refreshTasks();
    }
    authService.subscribe(() => {
      if (!authService.isAuthenticated()) {
        this.tasks = [];
        this.isLoaded = false;
        this.notify();
        return;
      }
      void this.refreshTasks();
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

  getTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  async addTask(task: Omit<Task, "id">): Promise<Task | null> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const created = await tasksApi.create(this.toCreatePayload(task), token);
      const normalized = this.fromDto(created);
      this.tasks.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      console.error("Failed to create task", error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const updated = await tasksApi.update(id, this.toUpdatePayload(updates), token);
      const normalized = this.fromDto(updated);
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        this.tasks[index] = normalized;
      } else {
        this.tasks.push(normalized);
      }
      this.notify();
      return true;
    } catch (error) {
      console.error("Failed to update task", error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      await tasksApi.delete(id, token);
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.notify();
      return true;
    } catch (error) {
      console.error("Failed to delete task", error);
      throw error;
    }
  }

  async toggleTaskStatus(id: string): Promise<boolean> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;

    return this.updateTask(id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  }

  async refreshTasks(): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) {
      this.tasks = [];
      this.isLoaded = true;
      this.notify();
      return;
    }

    try {
      const data = await tasksApi.list(token);
      this.tasks = data.map((task) => this.fromDto(task));
      this.isLoaded = true;
    } catch (error) {
      console.error("Failed to load tasks", error);
      this.tasks = [];
      this.isLoaded = true;
    }
    this.notify();
  }
  
  private fromDto(task: TaskDto): Task {
    return {
      ...task,
      date: this.parseDate(task.date),
      status: task.status ? (task.status.toLowerCase() as Task["status"]) : undefined!,
      priority: task.priority ? (task.priority.toLowerCase() as Task["priority"]) : undefined!,
    };
  }

  private toCreatePayload(task: Omit<Task, "id">) {
    return {
      title: task.title,
      description: task.description,
      date: this.formatDate(task.date),
      priority: task.priority?.toUpperCase(),
      status: task.status?.toUpperCase(),
      color: task.color,
    };
  }

  private toUpdatePayload(task: Partial<Task>) {
    const payload: Record<string, any> = {};
    
    if (task.title !== undefined) payload.title = task.title;
    if (task.description !== undefined) payload.description = task.description;
    if (task.date !== undefined) payload.date = this.formatDate(task.date);
    if (task.priority !== undefined) payload.priority = task.priority.toUpperCase();
    if (task.status !== undefined) payload.status = task.status.toUpperCase();
    if (task.color !== undefined) payload.color = task.color;
    
    return payload;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }
}

class ChatStore {
  private messages: ChatMessage[] = [];
  private listeners: Set<() => void> = new Set();

  private STORAGE_KEY = "chat_messages";

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages));
  }

  private loadFromStorage() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;

    try {
      this.messages = JSON.parse(raw).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    } catch {
      this.messages = [];
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  addMessage(message: Omit<ChatMessage, "id" | "timestamp">): void {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    this.messages.push(newMessage);

    this.saveToStorage();
    this.notify();
  }

  clearMessages(): void {
    this.messages = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.notify();
  }
}

export const taskStore = new TaskStore();
export const chatStore = new ChatStore();