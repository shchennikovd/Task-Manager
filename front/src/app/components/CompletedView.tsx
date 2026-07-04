import { useState, useEffect } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { Filter, X } from "lucide-react";

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

export function CompletedView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  const completedTasks = tasks
    .filter((task) => {
      const isCompleted = task.status === "completed";
      const colorMatches = !selectedColor || task.color === selectedColor;
      return isCompleted && colorMatches;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">Выполнено</h2>
        <p className="text-gray-400 mt-1">Все завершенные задачи</p>
      </div>

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

      {completedTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>
            {selectedColor
              ? "Нет выполненных задач с этим цветом"
              : "Пока нет выполненных задач"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showDate />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-[#141414] border border-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Всего выполнено</p>
              <p className="text-3xl font-semibold text-green-400 mt-2">
                {completedTasks.length}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
