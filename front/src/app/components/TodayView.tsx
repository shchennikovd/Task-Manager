import { useState, useEffect } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { Filter, X, Plus, Check } from "lucide-react";

const TASK_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

export function TodayView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskColor, setNewTaskColor] = useState<string>(TASK_COLORS[4].value);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  const today = new Date();
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    const dateMatches =
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear();
    
    const colorMatches = !selectedColor || task.color === selectedColor;
    
    return dateMatches && colorMatches;
  });

  const pendingTasks = todayTasks.filter((task) => task.status === "pending");
  const completedTasks = todayTasks.filter((task) => task.status === "completed");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;

    await taskStore.addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      date: new Date(),
      priority: newTaskPriority,
      status: "pending",
      color: newTaskColor,
    });

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskColor(TASK_COLORS[4].value);
    setShowAddForm(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">Сегодня</h2>
        <p className="text-gray-400 mt-1">
          {today.toLocaleDateString("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Add Task */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-6 p-4 bg-[#141414] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300"
        >
          <Plus className="w-5 h-5" />
          <span>Быстро добавить задачу на сегодня</span>
        </button>
      ) : (
        <form onSubmit={handleAddTask} className="mb-6 bg-[#141414] border border-gray-800 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700"
                autoFocus
                required
              />
            </div>
            
            <div>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={2}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Priority:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("low")}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "low"
                      ? "bg-blue-900/20 border-blue-700 text-blue-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("medium")}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "medium"
                      ? "bg-yellow-900/20 border-yellow-700 text-yellow-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("high")}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "high"
                      ? "bg-red-900/20 border-red-700 text-red-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Color:</span>
              <div className="flex gap-2">
                {TASK_COLORS.map((taskColor) => (
                  <button
                    key={taskColor.value}
                    type="button"
                    onClick={() => setNewTaskColor(taskColor.value)}
                    className="relative w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: taskColor.value,
                      borderColor: newTaskColor === taskColor.value ? taskColor.value : "transparent",
                    }}
                    title={taskColor.name}
                  >
                    {newTaskColor === taskColor.value && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
              >
                Добавить задачу
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskPriority("medium");
                  setNewTaskColor(TASK_COLORS[4].value);
                }}
                className="px-4 py-2 bg-[#0f0f0f] border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Color filter */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Фильтр по цвету:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedColor(null)}
            className={`px-3 py-1.5 rounded-lg border transition-colors text-sm ${
              selectedColor === null
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-[#141414] border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            Все
          </button>
          {TASK_COLORS.map((taskColor) => (
            <button
              key={taskColor.value}
              onClick={() => setSelectedColor(taskColor.value)}
              className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: taskColor.value,
                borderColor:
                  selectedColor === taskColor.value ? taskColor.value : "transparent",
                opacity: selectedColor === taskColor.value ? 1 : 0.6,
              }}
              title={taskColor.name}
            >
              {selectedColor === taskColor.value && (
                <X className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {todayTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{selectedColor ? "Нет задач с этим цветом на сегодня" : "Нет задач на сегодня"}</p>
        </div>
      ) : (
        <>
          {/* Вертикальный список всех задач на сегодня */}
          <div className="space-y-3">
            {todayTasks
              .sort((a, b) => {
                // Сначала pending, потом completed
                if (a.status === "pending" && b.status === "completed") return -1;
                if (a.status === "completed" && b.status === "pending") return 1;
                return 0;
              })
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </>
      )}

      {/* Progress summary */}
      <div className="mt-8 p-4 bg-[#141414] border border-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Прогресс</p>
            <p className="text-2xl font-semibold text-gray-100 mt-1">
              {completedTasks.length}/{todayTasks.length}
            </p>
          </div>
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#1f1f1f"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${
                  todayTasks.length > 0
                    ? (completedTasks.length / todayTasks.length) * 352
                    : 0
                } 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-100">
                {todayTasks.length > 0
                  ? Math.round((completedTasks.length / todayTasks.length) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}