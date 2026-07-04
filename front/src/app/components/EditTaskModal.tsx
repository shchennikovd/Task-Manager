import { useState } from "react";
import { Task } from "../types";
import { X, Check, Calendar as CalendarIcon } from "lucide-react";
import { taskStore } from "../store";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

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

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  const [color, setColor] = useState(task.color);
  const [date, setDate] = useState(
    new Date(task.date).toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    await taskStore.updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      color,
      date: new Date(date),
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#141414] border-gray-800 p-0 overflow-hidden max-w-2xl [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Редактировать задачу
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название задачи
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи..."
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дата
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:border-gray-700"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Приоритет
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  priority === "low"
                    ? "bg-blue-900/20 border-blue-700 text-blue-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Низкий
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  priority === "medium"
                    ? "bg-yellow-900/20 border-yellow-700 text-yellow-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Средний
              </button>
              <button
                type="button"
                onClick={() => setPriority("high")}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  priority === "high"
                    ? "bg-red-900/20 border-red-700 text-red-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Высокий
              </button>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цвет
            </label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map((taskColor) => (
                <button
                  key={taskColor.value}
                  type="button"
                  onClick={() => setColor(taskColor.value)}
                  className="relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: taskColor.value,
                    borderColor: color === taskColor.value ? taskColor.value : "transparent",
                  }}
                  title={taskColor.name}
                >
                  {color === taskColor.value && (
                    <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
            >
              Сохранить изменения
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[#0f0f0f] border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}