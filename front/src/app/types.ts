export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "expired";
  color?: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}