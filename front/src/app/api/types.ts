export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "expired";
  color?: string;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}
