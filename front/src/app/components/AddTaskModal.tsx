import { useState, useEffect, useRef } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { taskStore } from "../store";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { TaskColorPicker } from "./TaskColorPicker";
import { TASK_COLORS } from "../../constants/colors";
import { format, parse, addDays, isToday, isTomorrow } from "date-fns";

interface AddTaskModalProps {
  onClose: () => void;
}

export function AddTaskModal({ onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState(TASK_COLORS[4].value);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
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
      date: parse(date, "yyyy-MM-dd", new Date()),
      priority,
      status: "pending",
      color,
    });

    onClose();
  };

  const handleQuickDateSelect = (days: number) => {
    const d = addDays(new Date(), days);
    setDate(format(d, "yyyy-MM-dd"));
    setShowCustomDatePicker(false);
  };

  const getDateLabel = (dateString: string): string => {
    const d = parse(dateString, "yyyy-MM-dd", new Date());
    if (isToday(d)) return "Сегодня";
    if (isTomorrow(d)) return "Завтра";
    if (format(d, "yyyy-MM-dd") === format(addDays(new Date(), 7), "yyyy-MM-dd")) return "Через неделю";
    
    return d.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#141414] border-gray-800 p-0 overflow-hidden max-w-2xl [&>button]:hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            Добавить задачу
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Название
            </label>
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте детали..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Дата
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickDateSelect(0)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  date === format(new Date(), "yyyy-MM-dd")
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
                  date === format(addDays(new Date(), 1), "yyyy-MM-dd")
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
                  date === format(addDays(new Date(), 7), "yyyy-MM-dd")
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
                    value={date}
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
            <p className="text-xs text-gray-500">
              Выбрана: {getDateLabel(date)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Приоритет
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    priority === p
                      ? p === "high"
                        ? "bg-red-900/20 border-red-700 text-red-400"
                        : p === "medium"
                        ? "bg-yellow-900/20 border-yellow-700 text-yellow-400"
                        : "bg-blue-900/20 border-blue-700 text-blue-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  {p === "low"
                    ? "Низкий"
                    : p === "medium"
                    ? "Средний"
                    : "Высокий"}
                </button>
              ))}
            </div>
          </div>

          <TaskColorPicker color={color} onChange={setColor} />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
            >
              Добавить задачу
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}