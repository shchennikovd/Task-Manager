// src/app/components/TodayView.tsx
import { useState, useEffect, useRef } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { Plus, Calendar } from "lucide-react";
import { TaskColorFilter } from "./TaskColorFilter";
import { TaskColorPicker } from "./TaskColorPicker";
import { TASK_COLORS } from "../../constants/colors";

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

export function TodayView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskColor, setNewTaskColor] = useState<string>(TASK_COLORS[4].value);
  const [newTaskDate, setNewTaskDate] = useState<string>(formatDateForInput(new Date()));
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowCustomDatePicker(false);
      }
    };

    if (showCustomDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomDatePicker]);

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

  const completedTasks = todayTasks.filter((task) => task.status === "completed");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;

    const taskDate = parseDateString(newTaskDate);

    await taskStore.addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      date: taskDate,
      priority: newTaskPriority,
      status: "pending",
      color: newTaskColor,
    });

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskColor(TASK_COLORS[4].value);
    setNewTaskDate(formatDateForInput(new Date()));
    setShowCustomDatePicker(false);
    setShowAddForm(false);
  };

  const getDateLabel = (dateString: string): string => {
    const date = parseDateString(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    const nextWeekStr = nextWeek.toDateString();

    if (dateStr === todayStr) return "Сегодня";
    if (dateStr === tomorrowStr) return "Завтра";
    if (dateStr === nextWeekStr) return "Через неделю";
    return date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
  };

  const handleQuickDateSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setNewTaskDate(formatDateForInput(date));
    setShowCustomDatePicker(false);
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

      {/* Add Task */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-6 p-4 bg-[#141414] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить задачу на сегодня</span>
        </button>
      ) : (
        <form onSubmit={handleAddTask} className="mb-6 bg-[#141414] border border-gray-800 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Название</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Что нужно сделать?"
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700"
                autoFocus
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Описание</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Добавьте детали..."
                rows={2}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700 resize-none"
              />
            </div>

            {/* Date selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Дата</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect(0)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    newTaskDate === formatDateForInput(new Date())
                      ? "bg-blue-900/20 border-blue-700 text-blue-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Сегодня
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect(1)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    (() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return newTaskDate === formatDateForInput(tomorrow);
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
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    (() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      return newTaskDate === formatDateForInput(nextWeek);
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
                    className="px-4 py-2 rounded-lg border bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700 text-sm transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Выбор даты
                  </button>
                  {showCustomDatePicker && (
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => {
                        setNewTaskDate(e.target.value);
                      }}
                      className="absolute top-full mt-2 z-10 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-100"
                      autoFocus
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">Выбрана: {getDateLabel(newTaskDate)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Приоритет</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("low")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "low"
                      ? "bg-blue-900/20 border-blue-700 text-blue-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Низкий
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("medium")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "medium"
                      ? "bg-yellow-900/20 border-yellow-700 text-yellow-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Средний
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority("high")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    newTaskPriority === "high"
                      ? "bg-red-900/20 border-red-700 text-red-400"
                      : "bg-[#0f0f0f] border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  Высокий
                </button>
              </div>
            </div>

            {/* Выбор цвета переведен на переиспользуемый компонент */}
            <TaskColorPicker color={newTaskColor} onChange={setNewTaskColor} />

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
                  setNewTaskDate(formatDateForInput(new Date()));
                  setShowCustomDatePicker(false);
                }}
                className="px-4 py-2 bg-[#0f0f0f] border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Использование переиспользуемого фильтра цветов */}
      <TaskColorFilter selectedColor={selectedColor} onChange={setSelectedColor} />

      {todayTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{selectedColor ? "Нет задач с этим цветом на сегодня" : "Нет задач на сегодня"}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {todayTasks
              .sort((a, b) => {
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