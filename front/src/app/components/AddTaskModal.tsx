import { useState, useEffect, useRef } from "react";
import { X, Check, Calendar as CalendarIcon, Plus } from "lucide-react";
import { taskStore } from "../store";

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

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface AddTaskModalProps {
  onClose: () => void;
}

export function AddTaskModal({ onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState(TASK_COLORS[4].value);
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowCustomDatePicker(false);
      }
    };
    if (showCustomDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomDatePicker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await taskStore.addTask({
      title: title.trim(),
      description: description.trim(),
      date: parseDateString(date),
      priority,
      status: "pending",
      color,
    });

    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleQuickDateSelect = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDate(formatDateForInput(d));
    setShowCustomDatePicker(false);
  };

  const getDateLabel = (dateString: string): string => {
    const d = parseDateString(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === tomorrow.toDateString()) return "Завтра";
    return d.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#141414] border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            Добавить задачу
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте детали..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Дата</label>
            <div className="flex gap-2 flex-wrap">
                <button
                type="button"
                onClick={() => handleQuickDateSelect(0)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  date === formatDateForInput(new Date())
                    ? "bg-blue-900/20 border-blue-700 text-blue-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => handleQuickDateSelect(1)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  (() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return date === formatDateForInput(tomorrow);
                  })()
                    ? "bg-blue-900/20 border-blue-700 text-blue-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Завтра
              </button>
              <button
                type="button"
                onClick={() => handleQuickDateSelect(7)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  (() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    return date === formatDateForInput(nextWeek);
                  })()
                    ? "bg-blue-900/20 border-blue-700 text-blue-400"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                Через неделю
              </button>

              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                  className="px-3 py-1.5 rounded-lg border bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700 text-sm transition-colors flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Дата
                </button>
                {showCustomDatePicker && (
                  <input
                    type="date"
                    defaultValue={date}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDate(e.target.value);
                      }
                    }}
                    className="absolute top-full mt-2 z-10 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-100"
                  />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">Выбрана: {getDateLabel(date)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Приоритет</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    priority === p
                      ? p === "high" ? "bg-red-900/20 border-red-700 text-red-400" : p === "medium" ? "bg-yellow-900/20 border-yellow-700 text-yellow-400" : "bg-blue-900/20 border-blue-700 text-blue-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  {p === "low" ? "Низкий" : p === "medium" ? "Средний" : "Высокий"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Цвет</label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map((tc) => (
                <button
                  key={tc.value}
                  type="button"
                  onClick={() => setColor(tc.value)}
                  className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{ backgroundColor: tc.value, borderColor: color === tc.value ? tc.value : "transparent" }}
                >
                  {color === tc.value && <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium">
              Добавить задачу
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}