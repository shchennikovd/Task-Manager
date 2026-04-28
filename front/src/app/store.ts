import { Task, ChatMessage } from "./types";
import { authService } from "./auth";
import { tasksApi } from "./api/tasks";
import type { TaskDto } from "./api/types";

class TaskStore {
  private readonly mockTasksPrefix = "devflow_mock_tasks_";
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
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
      };
      this.tasks.push(newTask);
      this.persistMockTasks();
      this.notify();
      return newTask;
    }

    try {
      const created = await tasksApi.create(this.toCreatePayload(task), token);
      const normalized = this.fromDto(created);
      this.tasks.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      console.error("Failed to create task, falling back to local mode", error);
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
      };
      this.tasks.push(newTask);
      this.persistMockTasks();
      this.notify();
      return newTask;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    const token = authService.getAccessToken();
    if (!token) {
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index === -1) return false;
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.persistMockTasks();
      this.notify();
      return true;
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
      console.error("Failed to update task, falling back to local mode", error);
      const index = this.tasks.findIndex((task) => task.id === id);
      if (index === -1) return false;
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.persistMockTasks();
      this.notify();
      return true;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    const token = authService.getAccessToken();
    if (!token) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.persistMockTasks();
      this.notify();
      return true;
    }

    try {
      await tasksApi.delete(id, token);
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.notify();
      return true;
    } catch (error) {
      console.error("Failed to delete task, falling back to local mode", error);
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.persistMockTasks();
      this.notify();
      return true;
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
      this.tasks = this.getMockTasks();
      this.notify();
      return;
    }

    try {
      const data = await tasksApi.list(token);
      this.tasks = data.map((task) => this.fromDto(task));
      this.isLoaded = true;
    } catch (error) {
      console.error("Failed to load tasks, using local mode", error);
      this.tasks = this.getMockTasks();
      this.isLoaded = true;
    }
    this.notify();
  }

  private fromDto(task: TaskDto): Task {
    return {
      ...task,
      date: new Date(task.date),
    };
  }

  private toCreatePayload(task: Omit<Task, "id">) {
    return {
      title: task.title,
      description: task.description,
      date: task.date.toISOString(),
      priority: task.priority,
      status: task.status,
      color: task.color,
    };
  }

  private toUpdatePayload(task: Partial<Task>) {
    return {
      title: task.title,
      description: task.description,
      date: task.date ? task.date.toISOString() : undefined,
      priority: task.priority,
      status: task.status,
      color: task.color,
    };
  }

  private getMockTasks(): Task[] {
    const user = authService.getCurrentUser();
    if (!user) return [];
    const raw = localStorage.getItem(`${this.mockTasksPrefix}${user.id}`);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Array<Omit<Task, "date"> & { date: string }>;
      return parsed.map((task) => ({
        ...task,
        date: new Date(task.date),
      }));
    } catch {
      return [];
    }
  }

  private persistMockTasks() {
    const user = authService.getCurrentUser();
    if (!user) return;
    const data = this.tasks.map((task) => ({
      ...task,
      date: task.date.toISOString(),
    }));
    localStorage.setItem(`${this.mockTasksPrefix}${user.id}`, JSON.stringify(data));
  }
}

class ChatStore {
  private messages: ChatMessage[] = [];
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
    this.notify();
  }

  clearMessages(): void {
    this.messages = [];
    this.notify();
  }
}

export const taskStore = new TaskStore();
export const chatStore = new ChatStore();