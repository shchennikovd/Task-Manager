import { useState, useEffect } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { Filter, X } from "lucide-react";
import { TaskColorFilter } from "./TaskColorFilter";

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
        <p className="text-gray-300 mt-1">Все завершенные задачи</p>
      </div>

      {/* Color filter */}
      <TaskColorFilter selectedColor={selectedColor} onChange={setSelectedColor} />

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
              <p className="text-gray-300 text-sm">Всего выполнено</p>
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
